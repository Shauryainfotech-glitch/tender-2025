import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { v4 as uuidv4 } from 'uuid';
import { DocumentProcessingJob, ProcessingStatus, ProcessingType } from './entities/document-processing-job.entity';
import { ProcessingTemplate } from './entities/processing-template.entity';
import { KnowledgeBase, KnowledgeType } from './entities/knowledge-base.entity';
import { ProcessingResult } from './entities/processing-result.entity';
import { CreateProcessingJobDto } from './dto/create-processing-job.dto';
import { CreateKnowledgeBaseDto } from './dto/create-knowledge-base.dto';
import { CreateProcessingTemplateDto } from './dto/create-processing-template.dto';
import { FilesService } from '../files/files.service';
import { LLMProviderFactory } from './llm-provider.factory';
import { LLMProviderType, LLMConfig } from './interfaces/llm-provider.interface';

@Injectable()
export class LLMProcessingService {
  private readonly logger = new Logger(LLMProcessingService.name);

  constructor(
    @InjectRepository(DocumentProcessingJob)
    private readonly jobRepository: Repository<DocumentProcessingJob>,
    @InjectRepository(ProcessingTemplate)
    private readonly templateRepository: Repository<ProcessingTemplate>,
    @InjectRepository(KnowledgeBase)
    private readonly knowledgeBaseRepository: Repository<KnowledgeBase>,
    @InjectRepository(ProcessingResult)
    private readonly resultRepository: Repository<ProcessingResult>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly filesService: FilesService,
    private readonly providerFactory: LLMProviderFactory,
    @InjectQueue('document-processing') private processingQueue: Queue,
  ) {}

  // Create processing job
  async createProcessingJob(dto: CreateProcessingJobDto, userId: number): Promise<DocumentProcessingJob> {
    const jobId = `JOB-${uuidv4()}`;

    // Validate template if provided
    let template: ProcessingTemplate;
    if (dto.templateId) {
      template = await this.templateRepository.findOne({
        where: { id: dto.templateId, isActive: true },
      });
      if (!template) {
        throw new NotFoundException('Processing template not found');
      }
    }

    // Create job
    const job = this.jobRepository.create({
      ...dto,
      jobId,
      userId,
      status: ProcessingStatus.PENDING,
      priority: dto.priority || 1,
    });

    const savedJob = await this.jobRepository.save(job);

    // Add to processing queue
    await this.processingQueue.add('process-document', {
      jobId: savedJob.id,
    }, {
      priority: savedJob.priority,
      delay: dto.scheduledAt ? new Date(dto.scheduledAt).getTime() - Date.now() : 0,
      attempts: savedJob.maxRetries,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });

    return savedJob;
  }

  // Process document with LLM
  async processDocument(jobId: number): Promise<void> {
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
      relations: ['template'],
    });

    if (!job) {
      throw new NotFoundException('Processing job not found');
    }

    try {
      // Update job status
      job.status = ProcessingStatus.PROCESSING;
      job.startedAt = new Date();
      await this.jobRepository.save(job);

      // Fetch document content
      const documentContent = await this.fetchDocumentContent(job.documentUrl);

      // Get relevant knowledge bases
      const knowledgeBases = await this.getRelevantKnowledge(job);

      // Build prompt
      const prompt = await this.buildPrompt(job, documentContent, knowledgeBases);

      // Call LLM
      const llmResponse = await this.callLLM(job, prompt);

      // Process and validate response
      const processedResult = await this.processLLMResponse(job, llmResponse);

      // Save result
      const result = await this.saveProcessingResult(job, processedResult);

      // Update job status
      job.status = ProcessingStatus.COMPLETED;
      job.completedAt = new Date();
      job.processingTime = job.completedAt.getTime() - job.startedAt.getTime();
      job.resultId = result.id;
      await this.jobRepository.save(job);

      // Call webhook if provided
      if (job.callbackUrl) {
        await this.callWebhook(job.callbackUrl, { jobId: job.jobId, status: 'completed', result });
      }

    } catch (error) {
      this.logger.error(`Processing job ${jobId} failed:`, error);
      
      job.status = ProcessingStatus.FAILED;
      job.errorMessage = error.message;
      job.errorDetails = error;
      job.retryCount++;

      if (job.retryCount < job.maxRetries) {
        job.status = ProcessingStatus.RETRYING;
      }

      await this.jobRepository.save(job);
      
      throw error;
    }
  }

  // Create knowledge base entry
  async createKnowledgeBase(dto: CreateKnowledgeBaseDto, userId: number): Promise<KnowledgeBase> {
    const kb = this.knowledgeBaseRepository.create({
      ...dto,
      createdBy: userId,
      usageCount: 0,
      confidenceScore: dto.confidenceScore || 1.0,
    });

    // Generate embeddings if content is provided
    if (kb.content) {
      kb.embeddingVector = await this.generateEmbeddings(kb.content);
      kb.embeddingModel = 'text-embedding-ada-002';
    }

    return await this.knowledgeBaseRepository.save(kb);
  }

  // Search knowledge base
  async searchKnowledgeBase(query: string, filters?: any): Promise<KnowledgeBase[]> {
    const queryBuilder = this.knowledgeBaseRepository.createQueryBuilder('kb');

    if (filters?.type) {
      queryBuilder.andWhere('kb.type = :type', { type: filters.type });
    }

    if (filters?.organizationId) {
      queryBuilder.andWhere('(kb.organizationId = :orgId OR kb.isPublic = true)', {
        orgId: filters.organizationId,
      });
    }

    if (query) {
      // Simple text search - in production, use full-text search or vector similarity
      queryBuilder.andWhere(
        '(kb.title ILIKE :query OR kb.content ILIKE :query OR kb.keywords::text ILIKE :query)',
        { query: `%${query}%` },
      );
    }

    queryBuilder.andWhere('kb.isActive = true');
    queryBuilder.orderBy('kb.priority', 'DESC');
    queryBuilder.addOrderBy('kb.confidenceScore', 'DESC');

    return await queryBuilder.getMany();
  }

  // Private helper methods
  private async fetchDocumentContent(documentUrl: string): Promise<string> {
    // Implement document fetching logic
    // This could involve downloading the file, extracting text, OCR, etc.
    return 'Document content placeholder';
  }

  private async getRelevantKnowledge(job: DocumentProcessingJob): Promise<KnowledgeBase[]> {
    const knowledgeIds = job.knowledgeBaseIds || [];
    if (job.knowledgeBaseId) {
      knowledgeIds.push(job.knowledgeBaseId);
    }

    if (knowledgeIds.length === 0 && job.template?.requiredKnowledgeTypes) {
      // Fetch knowledge by type
      return await this.knowledgeBaseRepository.find({
        where: {
          type: In(job.template.requiredKnowledgeTypes as KnowledgeType[]),
          isActive: true,
        },
        order: {
          priority: 'DESC',
        },
      });
    }

    return await this.knowledgeBaseRepository.find({
      where: {
        id: In(knowledgeIds),
        isActive: true,
      },
    });
  }

  private async buildPrompt(
    job: DocumentProcessingJob,
    documentContent: string,
    knowledgeBases: KnowledgeBase[],
  ): Promise<string> {
    let prompt = '';

    // Use template prompt if available
    if (job.template?.prompt) {
      const { system, user, examples } = job.template.prompt;
      
      if (system) {
        prompt += `System: ${system}\n\n`;
      }

      // Add knowledge base context
      if (knowledgeBases.length > 0) {
        prompt += 'Context Knowledge:\n';
        knowledgeBases.forEach(kb => {
          prompt += `- ${kb.title}: ${kb.content.substring(0, 500)}...\n`;
        });
        prompt += '\n';
      }

      // Add examples if provided
      if (examples && examples.length > 0) {
        prompt += 'Examples:\n';
        examples.forEach(ex => {
          prompt += `Input: ${ex.input}\nOutput: ${ex.output}\n\n`;
        });
      }

      // Add user prompt with document
      if (user) {
        prompt += `${user}\n\nDocument Content:\n${documentContent}`;
      }
    } else if (job.customInstructions) {
      // Use custom instructions
      prompt = job.customInstructions.replace('{{document}}', documentContent);
    } else {
      // Default prompt based on job type
      prompt = this.getDefaultPrompt(job.type, documentContent);
    }

    return prompt;
  }

  private getDefaultPrompt(type: ProcessingType, documentContent: string): string {
    const prompts = {
      [ProcessingType.TENDER_EXTRACTION]: `Extract key information from the following tender document:\n\n${documentContent}`,
      [ProcessingType.BID_ANALYSIS]: `Analyze the following bid document and provide insights:\n\n${documentContent}`,
      [ProcessingType.COMPLIANCE_CHECK]: `Check the following document for compliance issues:\n\n${documentContent}`,
      [ProcessingType.DOCUMENT_SUMMARY]: `Provide a comprehensive summary of the following document:\n\n${documentContent}`,
      [ProcessingType.DATA_EXTRACTION]: `Extract structured data from the following document:\n\n${documentContent}`,
      [ProcessingType.CLASSIFICATION]: `Classify the following document:\n\n${documentContent}`,
      [ProcessingType.TRANSLATION]: `Translate the following document:\n\n${documentContent}`,
      [ProcessingType.COMPARISON]: `Compare and analyze the following documents:\n\n${documentContent}`,
      [ProcessingType.VALIDATION]: `Validate the information in the following document:\n\n${documentContent}`,
      [ProcessingType.CUSTOM]: documentContent,
    };

    return prompts[type] || documentContent;
  }

  private async callLLM(job: DocumentProcessingJob, prompt: string): Promise<any> {
    const model = job.llmModel || job.template?.defaultModel || 'gpt-4';
    const providerName = job.llmProvider || job.template?.defaultProvider || 'openai';

    // Map provider name to enum
    const providerType = this.getProviderType(providerName);
    
    // Get recommended provider if not specified
    const finalProvider = providerType || this.providerFactory.getRecommendedProviderForTask(
      job.type,
      {
        contextLength: prompt.length,
        budget: 'medium',
      }
    );

    try {
      const provider = this.providerFactory.getProvider(finalProvider);
      const config: LLMConfig = {
        ...job.template?.modelConfig,
        systemPrompt: job.template?.prompt?.system,
        responseFormat: job.config?.outputFormat === 'json' ? 'json' : 'text',
      };

      const response = await provider.callAPI(prompt, model, config);
      
      // Update job with actual provider and token usage
      job.llmProvider = response.provider;
      job.llmModel = response.model;
      job.promptTokens = response.usage.promptTokens;
      job.completionTokens = response.usage.completionTokens;
      job.totalTokens = response.usage.totalTokens;
      job.actualCost = response.cost || 0;
      job.llmResponse = response.raw;
      
      await this.jobRepository.save(job);
      
      return response;
    } catch (error) {
      this.logger.error(`LLM API call failed for provider ${finalProvider}:`, error);
      
      // Try fallback provider if main provider fails
      if (finalProvider !== LLMProviderType.OPENAI) {
        this.logger.warn(`Falling back to OpenAI from ${finalProvider}`);
        const fallbackProvider = this.providerFactory.getProvider(LLMProviderType.OPENAI);
        const response = await fallbackProvider.callAPI(prompt, 'gpt-3.5-turbo', job.template?.modelConfig);
        return response;
      }
      
      throw new BadRequestException(`Failed to process document: ${error.message}`);
    }
  }

  private getProviderType(providerName: string): LLMProviderType | null {
    const mapping: Record<string, LLMProviderType> = {
      'openai': LLMProviderType.OPENAI,
      'anthropic': LLMProviderType.ANTHROPIC,
      'google': LLMProviderType.GOOGLE,
      'gemini': LLMProviderType.GOOGLE,
      'perplexity': LLMProviderType.PERPLEXITY,
      'deepseek': LLMProviderType.DEEPSEEK,
      'cohere': LLMProviderType.COHERE,
    };
    
    return mapping[providerName.toLowerCase()] || null;
  }

  private async processLLMResponse(job: DocumentProcessingJob, llmResponse: any): Promise<any> {
    // Extract the actual response content
    let content = llmResponse.choices?.[0]?.message?.content || llmResponse;

    // Apply post-processing rules if template exists
    if (job.template?.postprocessingRules) {
      for (const rule of job.template.postprocessingRules) {
        content = await this.applyPostProcessingRule(content, rule);
      }
    }

    // Parse JSON if expected
    if (job.config?.outputFormat === 'json') {
      try {
        return JSON.parse(content);
      } catch (error) {
        this.logger.warn('Failed to parse LLM response as JSON:', error);
        return { raw: content };
      }
    }

    return content;
  }

  private async applyPostProcessingRule(content: any, rule: any): Promise<any> {
    // Implement post-processing logic
    return content;
  }

  private async saveProcessingResult(
    job: DocumentProcessingJob,
    processedResult: any,
  ): Promise<ProcessingResult> {
    const result = this.resultRepository.create({
      jobId: job.id,
      job,
      content: processedResult,
      extractedData: job.config?.outputFormat === 'json' ? processedResult : null,
      summary: typeof processedResult === 'string' ? processedResult.substring(0, 500) : null,
      confidence: 0.95, // Calculate based on response
      validationStatus: 'valid',
    });

    return await this.resultRepository.save(result);
  }

  private async generateEmbeddings(text: string): Promise<number[]> {
    try {
      const provider = this.providerFactory.getProvider(LLMProviderType.OPENAI);
      const response = await provider.generateEmbeddings(text);
      return response.embeddings[0];
    } catch (error) {
      this.logger.error('Failed to generate embeddings:', error);
      return [];
    }
  }

  private async callWebhook(url: string, data: any): Promise<void> {
    try {
      await this.httpService.post(url, data).toPromise();
    } catch (error) {
      this.logger.error('Webhook call failed:', error);
    }
  }
}
