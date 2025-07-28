import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LLMProvider, LLMConfig, LLMResponse, ModelInfo } from '../interfaces/llm-provider.interface';

@Injectable()
export class CohereProvider implements LLMProvider {
  name = 'Cohere';
  private apiKey: string;
  private apiUrl = 'https://api.cohere.ai/v1';
  private logger = new Logger(CohereProvider.name);

  private models: ModelInfo[] = [
    {
      id: 'command-r-plus',
      name: 'Command R+',
      contextLength: 128000,
      pricing: { input: 0.003, output: 0.015 },
      capabilities: ['chat', 'rag', 'tools', 'search'],
      recommended: true,
    },
    {
      id: 'command-r',
      name: 'Command R',
      contextLength: 128000,
      pricing: { input: 0.0005, output: 0.0015 },
      capabilities: ['chat', 'rag', 'tools'],
      recommended: true,
    },
    {
      id: 'command',
      name: 'Command',
      contextLength: 4096,
      pricing: { input: 0.0015, output: 0.002 },
      capabilities: ['chat', 'summarization'],
    },
    {
      id: 'command-light',
      name: 'Command Light',
      contextLength: 4096,
      pricing: { input: 0.00015, output: 0.0006 },
      capabilities: ['chat'],
    },
  ];

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('COHERE_API_KEY');
  }

  async callAPI(prompt: string, model: string, config?: LLMConfig): Promise<LLMResponse> {
    try {
      const requestBody = {
        message: prompt,
        model,
        temperature: config?.temperature ?? 0.7,
        max_tokens: config?.maxTokens ?? 2048,
        p: config?.topP ?? 0.75,
        k: config?.topK ?? 0,
        stop_sequences: config?.stopSequences,
        preamble: config?.systemPrompt,
        chat_history: [],
        connectors: [], // For RAG capabilities
        search_queries_only: false,
      };

      const response = await this.httpService.post(
        `${this.apiUrl}/chat`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        },
      ).toPromise();

      const { data } = response;
      const content = data.text;
      
      // Cohere provides token counts
      const meta = data.meta || {};
      const usage = {
        promptTokens: meta.billed_units?.input_tokens || Math.ceil(prompt.length / 4),
        completionTokens: meta.billed_units?.output_tokens || Math.ceil(content.length / 4),
        totalTokens: 0,
      };
      usage.totalTokens = usage.promptTokens + usage.completionTokens;
      
      const cost = this.estimateCost(usage.totalTokens, model);

      return {
        content,
        model,
        provider: 'cohere',
        usage,
        cost,
        finishReason: data.finish_reason || 'stop',
        metadata: {
          generationId: data.generation_id,
          citations: data.citations,
          documents: data.documents,
          searchQueries: data.search_queries,
          searchResults: data.search_results,
        },
        raw: data,
      };
    } catch (error) {
      this.logger.error('Cohere API call failed:', error.response?.data || error.message);
      throw error;
    }
  }

  validateConfig(config: LLMConfig): boolean {
    if (config.temperature && (config.temperature < 0 || config.temperature > 5)) {
      return false;
    }
    if (config.topP && (config.topP < 0 || config.topP > 1)) {
      return false;
    }
    if (config.topK && (config.topK < 0 || config.topK > 500)) {
      return false;
    }
    return true;
  }

  getAvailableModels(): string[] {
    return this.models.map(m => m.id);
  }

  estimateCost(tokens: number, model: string): number {
    const modelInfo = this.models.find(m => m.id === model);
    if (!modelInfo) return 0;
    
    // Rough estimate: 60% input, 40% output
    const inputTokens = tokens * 0.6;
    const outputTokens = tokens * 0.4;
    
    return (inputTokens * modelInfo.pricing.input / 1000) + 
           (outputTokens * modelInfo.pricing.output / 1000);
  }

  getMaxTokens(model: string): number {
    const modelInfo = this.models.find(m => m.id === model);
    return modelInfo?.contextLength || 4096;
  }
}
