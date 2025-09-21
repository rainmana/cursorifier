import pc from 'picocolors';
import { LLMProvider, LLMProviderConfig, LLMMessage, LLMResponse } from '../types/llm-provider.js';

/**
 * Base class for LLM providers
 * Provides common functionality and error handling
 */
export abstract class BaseLLMProvider implements LLMProvider {
  abstract readonly name: string;
  abstract readonly displayName: string;
  abstract readonly requiresApiKey: boolean;
  abstract readonly defaultModel: string;

  /**
   * Generate a response using the LLM
   */
  abstract generateResponse(
    messages: LLMMessage[],
    config: LLMProviderConfig
  ): Promise<LLMResponse>;

  /**
   * Validate the provider configuration
   */
  validateConfig(config: LLMProviderConfig): void {
    if (this.requiresApiKey && !config.apiKey) {
      throw new Error(`${this.displayName} requires an API key. Please set the appropriate environment variable.`);
    }

    if (!config.model) {
      throw new Error('Model is required for LLM generation');
    }

    if (config.maxTokens && config.maxTokens <= 0) {
      throw new Error('maxTokens must be a positive number');
    }

    if (config.temperature && (config.temperature < 0 || config.temperature > 2)) {
      throw new Error('temperature must be between 0 and 2');
    }
  }

  /**
   * Get available models for this provider
   */
  abstract getAvailableModels(): string[];

  /**
   * Handle API errors with proper formatting
   */
  protected handleApiError(error: unknown, context: string): never {
    if (error instanceof Error) {
      // Check for common API error patterns
      if (error.message.includes('API key')) {
        throw new Error(pc.red(`Authentication failed: ${error.message}`));
      }
      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        throw new Error(pc.yellow(`Rate limit exceeded: ${error.message}`));
      }
      if (error.message.includes('timeout')) {
        throw new Error(pc.yellow(`Request timeout: ${error.message}`));
      }
      if (error.message.includes('network') || error.message.includes('connection')) {
        throw new Error(pc.red(`Network error: ${error.message}`));
      }
      
      throw new Error(pc.red(`${context}: ${error.message}`));
    }
    
    throw new Error(pc.red(`${context}: Unknown error occurred`));
  }

  /**
   * Format messages for the provider
   */
  protected formatMessages(messages: LLMMessage[]): LLMMessage[] {
    return messages.map(msg => ({
      ...msg,
      content: msg.content.trim()
    }));
  }

  /**
   * Extract content from provider-specific response format
   */
  protected extractContent(response: any): string {
    // This should be overridden by each provider
    return response.content || response.text || '';
  }

  /**
   * Extract usage information from provider-specific response format
   */
  protected extractUsage(response: any): LLMResponse['usage'] {
    // This should be overridden by each provider
    return undefined;
  }
}
