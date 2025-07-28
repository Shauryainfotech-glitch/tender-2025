export interface LLMProvider {
  getType(): LLMProviderType;
  getName(): string;
  getDescription(): string;
  isAvailable(): boolean;
  getSupportedModels(): LLMModel[];
  testConnection(): Promise<boolean>;
  callAPI(prompt: string, model: string, config?: LLMConfig): Promise<LLMResponse>;
  generateEmbeddings(text: string | string[], model?: string): Promise<EmbeddingResponse>;
  estimateTokens(text: string): number;
  getDefaultConfig(): Partial<LLMConfig>;
  validateConfig(config: LLMConfig): string[];
  supportsStreaming(): boolean;
  supportsVision(): boolean;
  supportsFunctionCalling(): boolean;
  getPostProcessingRules(): any[];
}

export interface LLMConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  systemPrompt?: string;
  responseFormat?: 'text' | 'json' | 'markdown';
  stream?: boolean;
  seed?: number;
  logitBias?: Record<string, number>;
  tools?: any[];
  toolChoice?: string;
  functions?: any[];
  functionCall?: any;
}

export interface LLMResponse {
  content: string;
  model: string;
  provider: string;
  usage: TokenUsage;
  cost?: number;
  finishReason?: string;
  metadata?: Record<string, any>;
  raw?: any;
  processingTime?: number;
  functionCall?: any;
}

export interface LLMModel {
  id: string;
  name: string;
  contextWindow: number;
  maxOutput: number;
  costPer1kInput: number;
  costPer1kOutput: number;
  capabilities: string[];
  deprecated?: boolean;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface EmbeddingResponse {
  embeddings: number[][];
  model: string;
  usage: TokenUsage;
  cost?: number;
}

export enum LLMProviderType {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  PERPLEXITY = 'perplexity',
  DEEPSEEK = 'deepseek',
  COHERE = 'cohere',
  GROK = 'grok',
}
