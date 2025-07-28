import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LLMProvider, LLMConfig, LLMResponse, ModelInfo } from '../interfaces/llm-provider.interface';

@Injectable()
export class GeminiProvider implements LLMProvider {
  name = 'Google Gemini';
  private apiKey: string;
  private apiUrl = 'https://generativelanguage.googleapis.com/v1';
  private logger = new Logger(GeminiProvider.name);

  private models: ModelInfo[] = [
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      contextLength: 1048576, // 1M tokens
      pricing: { input: 0.00125, output: 0.005 },
      capabilities: ['chat', 'vision', 'code', 'function-calling'],
      recommended: true,
    },
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      contextLength: 1048576,
      pricing: { input: 0.00025, output: 0.001 },
      capabilities: ['chat', 'vision', 'code'],
      recommended: true,
    },
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      contextLength: 32768,
      pricing: { input: 0.0005, output: 0.0015 },
      capabilities: ['chat', 'code'],
    },
    {
      id: 'gemini-pro-vision',
      name: 'Gemini Pro Vision',
      contextLength: 16384,
      pricing: { input: 0.0025, output: 0.0025 },
      capabilities: ['vision', 'chat'],
    },
  ];

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('GOOGLE_AI_API_KEY');
  }

  async callAPI(prompt: string, model: string, config?: LLMConfig): Promise<LLMResponse> {
    try {
      const contents = [];
      
      if (config?.systemPrompt) {
        contents.push({
          role: 'model',
          parts: [{ text: `System: ${config.systemPrompt}` }],
        });
      }
      
      contents.push({
        role: 'user',
        parts: [{ text: prompt }],
      });

      const requestBody = {
        contents,
        generationConfig: {
          temperature: config?.temperature ?? 0.7,
          topK: config?.topK ?? 40,
          topP: config?.topP ?? 0.95,
          maxOutputTokens: config?.maxTokens ?? 2048,
          stopSequences: config?.stopSequences,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
        ],
      };

      const response = await this.httpService.post(
        `${this.apiUrl}/models/${model}:generateContent?key=${this.apiKey}`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ).toPromise();

      const { data } = response;
      const candidate = data.candidates[0];
      const content = candidate.content.parts[0].text;
      
      // Gemini doesn't provide token counts in the same way, so we estimate
      const estimatedTokens = Math.ceil(content.length / 4);
      const promptTokens = Math.ceil(prompt.length / 4);
      const completionTokens = estimatedTokens;
      const totalTokens = promptTokens + completionTokens;
      
      const cost = this.estimateCost(totalTokens, model);

      return {
        content,
        model,
        provider: 'google',
        usage: {
          promptTokens,
          completionTokens,
          totalTokens,
        },
        cost,
        finishReason: candidate.finishReason,
        metadata: {
          safetyRatings: candidate.safetyRatings,
          citationMetadata: candidate.citationMetadata,
        },
        raw: data,
      };
    } catch (error) {
      this.logger.error('Gemini API call failed:', error.response?.data || error.message);
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
    if (config.topK && (config.topK < 1 || config.topK > 100)) {
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
    return modelInfo?.contextLength || 32768;
  }
}
