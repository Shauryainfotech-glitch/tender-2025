import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LLMProvider, LLMConfig, LLMResponse, ModelInfo } from '../interfaces/llm-provider.interface';

@Injectable()
export class PerplexityProvider implements LLMProvider {
  name = 'Perplexity';
  private apiKey: string;
  private apiUrl = 'https://api.perplexity.ai';
  private logger = new Logger(PerplexityProvider.name);

  private models: ModelInfo[] = [
    {
      id: 'pplx-7b-online',
      name: 'Perplexity 7B Online',
      contextLength: 4096,
      pricing: { input: 0.0002, output: 0.0002 },
      capabilities: ['chat', 'search', 'real-time'],
      recommended: true,
    },
    {
      id: 'pplx-70b-online',
      name: 'Perplexity 70B Online',
      contextLength: 4096,
      pricing: { input: 0.001, output: 0.001 },
      capabilities: ['chat', 'search', 'real-time', 'analysis'],
      recommended: true,
    },
    {
      id: 'pplx-7b-chat',
      name: 'Perplexity 7B Chat',
      contextLength: 8192,
      pricing: { input: 0.0002, output: 0.0002 },
      capabilities: ['chat'],
    },
    {
      id: 'pplx-70b-chat',
      name: 'Perplexity 70B Chat',
      contextLength: 4096,
      pricing: { input: 0.001, output: 0.001 },
      capabilities: ['chat', 'analysis'],
    },
    {
      id: 'mistral-7b-instruct',
      name: 'Mistral 7B Instruct',
      contextLength: 4096,
      pricing: { input: 0.0002, output: 0.0002 },
      capabilities: ['chat', 'code'],
    },
    {
      id: 'mixtral-8x7b-instruct',
      name: 'Mixtral 8x7B Instruct',
      contextLength: 4096,
      pricing: { input: 0.0006, output: 0.0006 },
      capabilities: ['chat', 'code', 'analysis'],
    },
  ];

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('PERPLEXITY_API_KEY');
  }

  async callAPI(prompt: string, model: string, config?: LLMConfig): Promise<LLMResponse> {
    try {
      const messages = [];
      
      if (config?.systemPrompt) {
        messages.push({ role: 'system', content: config.systemPrompt });
      }
      
      messages.push({ role: 'user', content: prompt });

      const requestBody = {
        model,
        messages,
        temperature: config?.temperature ?? 0.7,
        top_p: config?.topP ?? 0.9,
        max_tokens: config?.maxTokens ?? 2048,
        stream: config?.stream ?? false,
        return_citations: true, // Perplexity specific
        return_images: false,
        return_related_questions: true,
      };

      const response = await this.httpService.post(
        `${this.apiUrl}/chat/completions`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      ).toPromise();

      const { data } = response;
      const content = data.choices[0].message.content;
      
      // Perplexity provides usage info
      const usage = data.usage || {
        prompt_tokens: Math.ceil(prompt.length / 4),
        completion_tokens: Math.ceil(content.length / 4),
        total_tokens: Math.ceil((prompt.length + content.length) / 4),
      };
      
      const cost = this.estimateCost(usage.total_tokens, model);

      return {
        content,
        model,
        provider: 'perplexity',
        usage: {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
        },
        cost,
        finishReason: data.choices[0].finish_reason,
        metadata: {
          citations: data.citations,
          relatedQuestions: data.related_questions,
          id: data.id,
        },
        raw: data,
      };
    } catch (error) {
      this.logger.error('Perplexity API call failed:', error.response?.data || error.message);
      throw error;
    }
  }

  validateConfig(config: LLMConfig): boolean {
    if (config.temperature && (config.temperature < 0 || config.temperature > 2)) {
      return false;
    }
    if (config.topP && (config.topP < 0 || config.topP > 1)) {
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
