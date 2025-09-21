/**
 * LLM Provider Types and Interfaces
 * 
 * This module defines the interfaces and types for different LLM providers
 * to ensure consistent API across all supported providers.
 */

export interface LLMProviderConfig {
  apiKey?: string;
  baseURL?: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: string;
}

export interface LLMProvider {
  /**
   * The name of the provider (e.g., 'anthropic', 'openai', 'local')
   */
  readonly name: string;
  
  /**
   * The display name for the provider
   */
  readonly displayName: string;
  
  /**
   * Whether this provider requires an API key
   */
  readonly requiresApiKey: boolean;
  
  /**
   * Default model for this provider
   */
  readonly defaultModel: string;
  
  /**
   * Generate a response using the LLM
   */
  generateResponse(
    messages: LLMMessage[],
    config: LLMProviderConfig
  ): Promise<LLMResponse>;
  
  /**
   * Validate the provider configuration
   */
  validateConfig(config: LLMProviderConfig): void;
  
  /**
   * Get available models for this provider
   */
  getAvailableModels(): string[];
}

export type ProviderType = 'anthropic' | 'openai' | 'local';

export interface ProviderRegistry {
  register(provider: LLMProvider): void;
  getProvider(type: ProviderType): LLMProvider;
  getProviderByName(name: string): LLMProvider | undefined;
  listProviders(): LLMProvider[];
}

export interface ChunkProcessingOptions {
  chunk: string;
  index: number;
  tokenCount: number;
  totalChunks: number;
  currentSummary?: string;
  description?: string;
  ruleType?: string;
  guidelines: string;
}
