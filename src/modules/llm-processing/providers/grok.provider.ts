import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { 
  LLMProvider, 
  LLMProviderType, 
  LLMConfig, 
  LLMResponse,
  LLMModel,
  EmbeddingResponse,
  TokenUsage 
} from '../interfaces/llm-provider.interface';

@Injectable()
export class GrokProvider implements LLMProvider {
  private readonly logger = new Logger(GrokProvider.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.x.ai/v1';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('GROK_API_KEY');
  }

  getType(): LLMProviderType {
    return LLMProviderType.GROK;
  }

  getName(): string {
    return 'Grok';
  }

  getDescription(): string {
    return 'xAI Grok - Advanced AI with real-time knowledge and reasoning';
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  getSupportedModels(): LLMModel[] {
    return [
      {
        id: 'grok-2',
        name: 'Grok 2',
        contextWindow: 131072,
        maxOutput: 8192,
        costPer1kInput: 0.002,
        costPer1kOutput: 0.01,
        capabilities: ['chat', 'code', 'reasoning', 'math', 'realtime'],
      },
      {
        id: 'grok-2-mini',
        name: 'Grok 2 Mini',
        contextWindow: 131072,
        maxOutput: 8192,
        costPer1kInput: 0.001,
        costPer1kOutput: 0.002,
        capabilities: ['chat', 'code', 'reasoning'],
      },
      {
        id: 'grok-vision-beta',
        name: 'Grok Vision Beta',
        contextWindow: 8192,
        maxOutput: 4096,
        costPer1kInput: 0.003,
        costPer1kOutput: 0.015,
        capabilities: ['chat', 'vision', 'image-analysis'],
      },
    ];
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.httpService.get(
        `${this.apiUrl}/models`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        },
      ).toPromise();

      return response.status === 200;
    } catch (error) {
      this.logger.error('Grok connection test failed:', error);
      return false;
    }
  }

  async callAPI(prompt: string, model: string, config?: LLMConfig): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      const messages = [
        ...(config?.systemPrompt ? [{ role: 'system', content: config.systemPrompt }] : []),
        { role: 'user', content: prompt },
      ];

      const requestBody: any = {
        model: model || 'grok-2',
        messages,
        temperature: config?.temperature ?? 0.7,
        max_tokens: config?.maxTokens ?? 2048,
        top_p: config?.topP ?? 1,
        frequency_penalty: config?.frequencyPenalty ?? 0,
        presence_penalty: config?.presencePenalty ?? 0,
        stream: false,
      };

      // Add response format if specified
      if (config?.responseFormat) {
        if (config.responseFormat === 'json') {
          requestBody.response_format = { type: 'json_object' };
        }
      }

      // Add stop sequences if provided
      if (config?.stopSequences) {
        requestBody.stop = config.stopSequences;
      }

      // Add function calling if provided
      if (config?.functions) {
        requestBody.functions = config.functions;
        if (config.functionCall) {
          requestBody.function_call = config.functionCall;
        }
      }

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

      const data = response.data;
      const choice = data.choices[0];
      const usage: TokenUsage = {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      };

      // Calculate cost
      const modelInfo = this.getSupportedModels().find(m => m.id === model);
      const cost = modelInfo ? this.calculateCost(usage, modelInfo) : 0;

      return {
        content: choice.message.content,
        raw: data,
        usage,
        cost,
        provider: this.getName(),
        model: data.model,
        processingTime: Date.now() - startTime,
        functionCall: choice.message.function_call,
      };
    } catch (error) {
      this.logger.error('Grok API call failed:', error);
      throw new Error(`Grok API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async generateEmbeddings(text: string | string[], model?: string): Promise<EmbeddingResponse> {
    // Grok doesn't currently support embeddings, use a fallback or throw error
    throw new Error('Grok does not currently support embedding generation');
  }

  estimateTokens(text: string): number {
    // Rough estimation: ~1 token per 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  private calculateCost(usage: TokenUsage, model: LLMModel): number {
    const inputCost = (usage.promptTokens / 1000) * model.costPer1kInput;
    const outputCost = (usage.completionTokens / 1000) * model.costPer1kOutput;
    return inputCost + outputCost;
  }

  getDefaultConfig(): Partial<LLMConfig> {
    return {
      temperature: 0.7,
      maxTokens: 2048,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
    };
  }

  validateConfig(config: LLMConfig): string[] {
    const errors: string[] = [];

    if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2)) {
      errors.push('Temperature must be between 0 and 2');
    }

    if (config.maxTokens !== undefined && (config.maxTokens < 1 || config.maxTokens > 8192)) {
      errors.push('Max tokens must be between 1 and 8192');
    }

    if (config.topP !== undefined && (config.topP < 0 || config.topP > 1)) {
      errors.push('Top P must be between 0 and 1');
    }

    if (config.frequencyPenalty !== undefined && (config.frequencyPenalty < -2 || config.frequencyPenalty > 2)) {
      errors.push('Frequency penalty must be between -2 and 2');
    }

    if (config.presencePenalty !== undefined && (config.presencePenalty < -2 || config.presencePenalty > 2)) {
      errors.push('Presence penalty must be between -2 and 2');
    }

    return errors;
  }

  supportsStreaming(): boolean {
    return true;
  }

  supportsVision(): boolean {
    return true; // Grok Vision Beta supports image analysis
  }

  supportsFunctionCalling(): boolean {
    return true;
  }

  getPostProcessingRules(): any[] {
    return [
      {
        name: 'clean_response',
        description: 'Clean and format Grok responses',
        apply: (response: string) => {
          // Remove any potential artifacts or formatting issues
          return response.trim();
        },
      },
    ];
  }
}
