import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LLMProvider, LLMConfig, LLMResponse, ModelInfo } from '../interfaces/llm-provider.interface';

@Injectable()
export class AnthropicProvider implements LLMProvider {
  name = 'Anthropic';
  private apiKey: string;
  private apiUrl = 'https://api.anthropic.com/v1';
  private logger = new Logger(AnthropicProvider.name);

  private models: ModelInfo[] = [
    {
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
      contextLength: 200000,
      pricing: { input: 0.015, output: 0.075 },
      capabilities: ['chat', 'vision', 'code', 'analysis'],
      recommended: true,
    },
    {
      id: 'claude-3-sonnet-20240229',
      name: 'Claude 3 Sonnet',
      contextLength: 200000,
      pricing: { input: 0.003, output: 0.015 },
      capabilities: ['chat', 'vision', 'code'],
      recommended: true,
    },
    {
      id: 'claude-3-haiku-20240307',
      name: 'Claude 3 Haiku',
      contextLength: 200000,
      pricing: { input: 0.00025, output: 0.00125 },
      capabilities: ['chat', 'code'],
    },
    {
      id: 'claude-2.1',
      name: 'Claude 2.1',
      contextLength: 200000,
      pricing: { input: 0.008, output: 0.024 },
      capabilities: ['chat', 'code'],
    },
    {
      id: 'claude-instant-1.2',
      name: 'Claude Instant',
      contextLength: 100000,
      pricing: { input: 0.00163, output: 0.00551 },
      capabilities: ['chat', 'code'],
    },
  ];

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
  }

  async callAPI(prompt: string, model: string, config?: LLMConfig): Promise<LLMResponse> {
    try {
      const messages = [];
      
      if (config?.systemPrompt) {
        messages.push({ role: 'assistant', content: `Understood. ${config.systemPrompt}` });
      }
      
      messages.push({ role: 'user', content: prompt });

      const requestBody = {
        model,
        messages,
        max_tokens: config?.maxTokens ?? 2048,
        temperature: config?.temperature ?? 0.7,
        top_p: config?.topP ?? 1,
        top_k: config?.topK,
        stop_sequences: config?.stopSequences,
        system: config?.systemPrompt,
      };

      const response = await this.httpService.post(
        `${this.apiUrl}/messages`,
        requestBody,
        {
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
        },
      ).toPromise();

      const { data } = response;
      const content = data.content[0].text;
      
      const usage = {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      };
      
      const cost = this.estimateCost(usage.totalTokens, model);

      return {
        content,
        model: data.model,
        provider: 'anthropic',
        usage,
        cost,
        finishReason: data.stop_reason,
        metadata: {
          id: data.id,
          type: data.type,
          role: data.role,
        },
        raw: data,
      };
    } catch (error) {
      this.logger.error('Anthropic API call failed:', error.response?.data || error.message);
      throw error;
    }
  }

  validateConfig(config: LLMConfig): boolean {
    if (config.temperature && (config.temperature < 0 || config.temperature > 1)) {
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
    return modelInfo?.contextLength || 100000;
  }
}
