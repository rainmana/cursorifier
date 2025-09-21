import { BaseLLMProvider } from './base-provider.js';
import { LLMProviderConfig, LLMMessage, LLMResponse } from '../types/llm-provider.js';
/**
 * Local OpenAI-compatible provider implementation
 * Supports Ollama, LM Studio, and other OpenAI-compatible local APIs
 */
export declare class LocalProvider extends BaseLLMProvider {
    readonly name = "local";
    readonly displayName = "Local (OpenAI-compatible)";
    readonly requiresApiKey = false;
    readonly defaultModel = "llama3.1";
    /**
     * Generate a response using a local OpenAI-compatible API
     */
    generateResponse(messages: LLMMessage[], config: LLMProviderConfig): Promise<LLMResponse>;
    /**
     * Get available local models
     * Note: This is a static list as we can't query the local API without knowing the endpoint
     */
    getAvailableModels(): string[];
    /**
     * Extract content from OpenAI-compatible response
     */
    protected extractContent(response: unknown): string;
    /**
     * Extract usage information from OpenAI-compatible response
     */
    protected extractUsage(response: unknown): LLMResponse['usage'];
    /**
     * Validate local provider configuration
     */
    validateConfig(config: LLMProviderConfig): void;
    /**
     * Check if a string is a valid URL
     */
    private isValidUrl;
}
