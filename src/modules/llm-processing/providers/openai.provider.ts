import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LLMProvider, LLMConfig, LLMResponse, ModelInfo } from '../interfaces/llm-provider.interface';

@Injectable()
export class OpenAIProvider implements LLMProvider {
  name = 'OpenAI';
  private apiKey: string;
  private apiUrl = 'https://api.openai.com/v1';
  private logger = new Logger(OpenAIProvider.name);

  private models: ModelInfo[] = [
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      contextLength: 128000,
      pricing: { input: 0.01, output: 0.03 },
      capabilities: ['chat', 'function-calling', 'vision'],
      recommended: true,
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      contextLength: 8192,
      pricing: { input: 0.03, output: 0.06 },
      capabilities: ['chat', 'function-calling'],
    },
    {
      id: 'gpt-4-32k',
      name: 'GPT-4 32K',
      contextLength: 32768,
      pricing: { input: 0.06, output: 0.12 },
      capabilities: ['chat', 'function-calling'],
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      contextLength: 16385,
      pricing: { input: 0.0005, output: 0.0015 },
      capabilities: ['chat', 'function-calling'],
      recommended: true,
    },
    {
      id: 'gpt-3.5-turbo-16k',
      name: 'GPT-3.5 Turbo 16K',
      contextLength: 16385,
      pricing: { input: 0.003, output: 0.004 },
      capabilities: ['chat', 'function-calling'],
    },
  ];

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY');
  }

  async callAPI(prompt: string, model: string, config?: LLMConfig): Promise<LLMResponse> {
    try {
      const messages = [];
      
      if (config?.systemPrompt) {
        messages.push({ role: 'system', content: config.systemPrompt });
      }
      
      messages.push({ role: 'user', content: prompt });

      const requestBody: any = {
        model,
        messages,
        temperature: config?.temperature ?? 0.7,
        max_tokens: config?.maxTokens ?? 2000,
        top_p: config?.topP ?? 1,
        frequency_penalty: config?.frequencyPenalty ?? 0,
        presence_penalty: config?.presencePenalty ?? 0,
        stop: config?.stopSequences,
        seed: config?.seed,
        logit_bias: config?.logitBias,
        tools: config?.tools,
        tool_choice: config?.toolChoice,
      };

      if (config?.responseFormat === 'json') {
        requestBody.response_format = { type: 'json_object' };
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

      const { data } = response;
      const usage = data.usage;
      const content = data.choices[0].message.content;
      
      const cost = this.estimateCost(usage.total_tokens, model);

      return {
        content,
        model: data.model,
        provider: 'openai',
        usage: {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
        },
        cost,
        finishReason: data.choices[0].finish_reason,
        metadata: {
          systemFingerprint: data.system_fingerprint,
        },
        raw: data,
      };
    } catch (error) {
      this.logger.error('OpenAI API call failed:', error.response?.data || error.message);
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
