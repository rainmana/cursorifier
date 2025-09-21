import { LLMProvider, LLMProviderConfig, LLMMessage, LLMResponse } from '../types/llm-provider.js';
/**
 * Base class for LLM providers
 * Provides common functionality and error handling
 */
export declare abstract class BaseLLMProvider implements LLMProvider {
    abstract readonly name: string;
    abstract readonly displayName: string;
    abstract readonly requiresApiKey: boolean;
    abstract readonly defaultModel: string;
    /**
     * Generate a response using the LLM
     */
    abstract generateResponse(messages: LLMMessage[], config: LLMProviderConfig): Promise<LLMResponse>;
    /**
     * Validate the provider configuration
     */
    validateConfig(config: LLMProviderConfig): void;
    /**
     * Get available models for this provider
     */
    abstract getAvailableModels(): string[];
    /**
     * Handle API errors with proper formatting
     */
    protected handleApiError(error: unknown, context: string): never;
    /**
     * Format messages for the provider
     */
    protected formatMessages(messages: LLMMessage[]): LLMMessage[];
    /**
     * Extract content from provider-specific response format
     */
    protected extractContent(_response: unknown): string;
    /**
     * Extract usage information from provider-specific response format
     */
    protected extractUsage(_response: unknown): LLMResponse['usage'];
}
