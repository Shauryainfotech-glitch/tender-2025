import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { LLMProvider, LLMProviderType, ModelInfo } from './interfaces/llm-provider.interface';
import { OpenAIProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { PerplexityProvider } from './providers/perplexity.provider';
import { DeepSeekProvider } from './providers/deepseek.provider';
import { CohereProvider } from './providers/cohere.provider';
import { GrokProvider } from './providers/grok.provider';

export interface ProviderInfo {
  name: string;
  type: LLMProviderType;
  models: ModelInfo[];
  capabilities: string[];
  pros: string[];
  cons: string[];
  bestFor: string[];
}

@Injectable()
export class LLMProviderFactory {
  private providers: Map<LLMProviderType, LLMProvider> = new Map();
  private logger = new Logger(LLMProviderFactory.name);

  constructor(private moduleRef: ModuleRef) {
    this.initializeProviders();
  }

  private async initializeProviders() {
    try {
      // Initialize all providers
      const providerClasses = [
        { type: LLMProviderType.OPENAI, class: OpenAIProvider },
        { type: LLMProviderType.ANTHROPIC, class: AnthropicProvider },
        { type: LLMProviderType.GOOGLE, class: GeminiProvider },
        { type: LLMProviderType.PERPLEXITY, class: PerplexityProvider },
        { type: LLMProviderType.DEEPSEEK, class: DeepSeekProvider },
        { type: LLMProviderType.COHERE, class: CohereProvider },
        { type: LLMProviderType.GROK, class: GrokProvider },
      ];

      for (const { type, class: ProviderClass } of providerClasses) {
        try {
          const provider = await this.moduleRef.create(ProviderClass);
          this.providers.set(type, provider);
          this.logger.log(`Initialized ${type} provider`);
        } catch (error) {
          this.logger.warn(`Failed to initialize ${type} provider: ${error.message}`);
        }
      }
    } catch (error) {
      this.logger.error('Failed to initialize providers:', error);
    }
  }

  getProvider(type: LLMProviderType): LLMProvider {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`Provider ${type} not found or not initialized`);
    }
    return provider;
  }

  getAllProviders(): ProviderInfo[] {
    return [
      {
        name: 'OpenAI',
        type: LLMProviderType.OPENAI,
        models: this.getModelsForProvider(LLMProviderType.OPENAI),
        capabilities: ['chat', 'function-calling', 'vision', 'embeddings'],
        pros: [
          'Industry-leading performance',
          'Excellent function calling',
          'Strong coding abilities',
          'Wide ecosystem support',
        ],
        cons: [
          'Higher cost',
          'Rate limits',
          'Data privacy concerns for some use cases',
        ],
        bestFor: [
          'Complex reasoning tasks',
          'Code generation',
          'Creative writing',
          'General-purpose AI',
        ],
      },
      {
        name: 'Anthropic Claude',
        type: LLMProviderType.ANTHROPIC,
        models: this.getModelsForProvider(LLMProviderType.ANTHROPIC),
        capabilities: ['chat', 'vision', 'code', 'analysis'],
        pros: [
          'Excellent safety and ethics',
          'Strong analytical capabilities',
          'Large context window (200K)',
          'Good at following instructions',
        ],
        cons: [
          'Limited function calling',
          'Fewer integrations',
          'Higher latency',
        ],
        bestFor: [
          'Document analysis',
          'Research tasks',
          'Content moderation',
          'Ethical AI applications',
        ],
      },
      {
        name: 'Google Gemini',
        type: LLMProviderType.GOOGLE,
        models: this.getModelsForProvider(LLMProviderType.GOOGLE),
        capabilities: ['chat', 'vision', 'code', 'multimodal'],
        pros: [
          'Massive context window (1M tokens)',
          'Strong multimodal capabilities',
          'Competitive pricing',
          'Good multilingual support',
        ],
        cons: [
          'Newer to market',
          'Less ecosystem support',
          'Variable performance',
        ],
        bestFor: [
          'Long document processing',
          'Multimodal tasks',
          'Multilingual applications',
          'Large-scale analysis',
        ],
      },
      {
        name: 'Perplexity',
        type: LLMProviderType.PERPLEXITY,
        models: this.getModelsForProvider(LLMProviderType.PERPLEXITY),
        capabilities: ['chat', 'search', 'real-time', 'citations'],
        pros: [
          'Real-time web search',
          'Built-in citations',
          'Up-to-date information',
          'Good for research',
        ],
        cons: [
          'Limited context window',
          'Less suitable for creative tasks',
          'Focused on factual responses',
        ],
        bestFor: [
          'Research and fact-checking',
          'Current events analysis',
          'Question answering with sources',
          'Academic research',
        ],
      },
      {
        name: 'DeepSeek',
        type: LLMProviderType.DEEPSEEK,
        models: this.getModelsForProvider(LLMProviderType.DEEPSEEK),
        capabilities: ['chat', 'code', 'analysis', 'math'],
        pros: [
          'Very competitive pricing',
          'Strong coding abilities',
          'Good mathematical reasoning',
          'Efficient performance',
        ],
        cons: [
          'Limited ecosystem',
          'Less documentation',
          'Newer provider',
        ],
        bestFor: [
          'Code generation',
          'Technical documentation',
          'Mathematical problems',
          'Cost-sensitive applications',
        ],
      },
      {
        name: 'Cohere',
        type: LLMProviderType.COHERE,
        models: this.getModelsForProvider(LLMProviderType.COHERE),
        capabilities: ['chat', 'rag', 'tools', 'search', 'embeddings'],
        pros: [
          'Excellent RAG capabilities',
          'Built-in semantic search',
          'Good for enterprise',
          'Strong multilingual support',
        ],
        cons: [
          'Less general-purpose',
          'Smaller model selection',
          'Learning curve for RAG',
        ],
        bestFor: [
          'Enterprise search',
          'RAG applications',
          'Document retrieval',
          'Multilingual chat',
        ],
      },
    ];
  }

  getModelsForProvider(type: LLMProviderType): ModelInfo[] {
    try {
      const provider = this.providers.get(type);
      if (!provider) return [];
      
      // This would ideally be a method on the provider
      // For now, we'll return empty array
      return [];
    } catch (error) {
      return [];
    }
  }

  async testProvider(type: LLMProviderType): Promise<boolean> {
    try {
      const provider = this.getProvider(type);
      const models = provider.getAvailableModels();
      if (models.length === 0) return false;

      // Try a simple test prompt
      const response = await provider.callAPI(
        'Hello, please respond with "OK" if you are working.',
        models[0],
        { maxTokens: 10 }
      );

      return response.content.toLowerCase().includes('ok');
    } catch (error) {
      this.logger.error(`Provider ${type} test failed:`, error);
      return false;
    }
  }

  getRecommendedProviderForTask(
    taskType: string,
    requirements: {
      contextLength?: number;
      needsCitations?: boolean;
      needsRealTime?: boolean;
      needsVision?: boolean;
      budget?: 'low' | 'medium' | 'high';
      speed?: 'fast' | 'normal' | 'slow';
    }
  ): LLMProviderType {
    // Logic to recommend the best provider based on task requirements
    if (requirements.needsCitations || requirements.needsRealTime) {
      return LLMProviderType.PERPLEXITY;
    }

    if (requirements.contextLength && requirements.contextLength > 200000) {
      return LLMProviderType.GOOGLE; // Gemini has 1M context
    }

    if (requirements.budget === 'low') {
      return LLMProviderType.DEEPSEEK;
    }

    if (taskType === 'code' && requirements.budget !== 'high') {
      return LLMProviderType.DEEPSEEK;
    }

    if (taskType === 'analysis' || taskType === 'research') {
      return LLMProviderType.ANTHROPIC;
    }

    if (taskType === 'rag' || taskType === 'search') {
      return LLMProviderType.COHERE;
    }

    // Default to OpenAI for general tasks
    return LLMProviderType.OPENAI;
  }

  async compareProviders(
    prompt: string,
    providers: LLMProviderType[],
    model?: string
  ): Promise<Array<{
    provider: LLMProviderType;
    response: string;
    time: number;
    tokens: number;
    cost: number;
    error?: string;
  }>> {
    const results = [];

    for (const providerType of providers) {
      const startTime = Date.now();
      try {
        const provider = this.getProvider(providerType);
        const models = provider.getAvailableModels();
        const selectedModel = model || models[0];

        const response = await provider.callAPI(prompt, selectedModel);
        
        results.push({
          provider: providerType,
          response: response.content,
          time: Date.now() - startTime,
          tokens: response.usage.totalTokens,
          cost: response.cost || 0,
        });
      } catch (error) {
        results.push({
          provider: providerType,
          response: '',
          time: Date.now() - startTime,
          tokens: 0,
          cost: 0,
          error: error.message,
        });
      }
    }

    return results;
  }
}
