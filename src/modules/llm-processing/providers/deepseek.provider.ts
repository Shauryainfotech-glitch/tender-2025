import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LLMProvider, LLMConfig, LLMResponse, ModelInfo } from '../interfaces/llm-provider.interface';

@Injectable()
export class DeepSeekProvider implements LLMProvider {
  name = 'DeepSeek';
  private apiKey: string;
  private apiUrl = 'https://api.deepseek.com/v1';
  private logger = new Logger(DeepSeekProvider.name);

  private models: ModelInfo[] = [
    {
      id: 'deepseek-chat',
      name: 'DeepSeek Chat',
      contextLength: 32768,
      pricing: { input: 0.00014, output: 0.00028 },
      capabilities: ['chat', 'code', 'analysis'],
      recommended: true,
    },
    {
      id: 'deepseek-coder',
      name: 'DeepSeek Coder',
      contextLength: 16384,
      pricing: { input: 0.00014, output: 0.00028 },
      capabilities: ['code', 'chat'],
      recommended: true,
    },
    {
      id: 'deepseek-67b-chat',
      name: 'DeepSeek 67B Chat',
      contextLength: 4096,
      pricing: { input: 0.001, output: 0.002 },
      capabilities: ['chat', 'code', 'analysis', 'math'],
    },
    {
      id: 'deepseek-33b-coder',
      name: 'DeepSeek 33B Coder',
      contextLength: 16384,
      pricing: { input: 0.0008, output: 0.0016 },
      capabilities: ['code', 'chat'],
    },
  ];

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
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
        max_tokens: config?.maxTokens ?? 2048,
        top_p: config?.topP ?? 0.95,
        frequency_penalty: config?.frequencyPenalty ?? 0,
        presence_penalty: config?.presencePenalty ?? 0,
        stop: config?.stopSequences,
        stream: config?.stream ?? false,
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
      const usage = data.usage;
      
      const cost = this.estimateCost(usage.total_tokens, model);

      return {
        content,
        model: data.model,
        provider: 'deepseek',
        usage: {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
        },
        cost,
        finishReason: data.choices[0].finish_reason,
        metadata: {
          id: data.id,
          created: data.created,
        },
        raw: data,
      };
    } catch (error) {
      this.logger.error('DeepSeek API call failed:', error.response?.data || error.message);
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
    if (config.frequencyPenalty && (config.frequencyPenalty < -2 || config.frequencyPenalty > 2)) {
      return false;
    }
    if (config.presencePenalty && (config.presencePenalty < -2 || config.presencePenalty > 2)) {
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
