import { BaseLLMProvider } from './base-provider.js';
import { LLMProviderConfig, LLMMessage, LLMResponse } from '../types/llm-provider.js';
/**
 * Anthropic Claude provider implementation
 */
export declare class AnthropicProvider extends BaseLLMProvider {
    readonly name = "anthropic";
    readonly displayName = "Anthropic Claude";
    readonly requiresApiKey = true;
    readonly defaultModel = "claude-3-5-sonnet-20241022";
    private client;
    constructor();
    /**
     * Initialize the Anthropic client
     */
    private initializeClient;
    /**
     * Generate a response using Anthropic Claude
     */
    generateResponse(messages: LLMMessage[], config: LLMProviderConfig): Promise<LLMResponse>;
    /**
     * Get available Anthropic models
     */
    getAvailableModels(): string[];
    /**
     * Extract content from Anthropic response
     */
    protected extractContent(response: unknown): string;
    /**
     * Extract usage information from Anthropic response
     */
    protected extractUsage(response: unknown): LLMResponse['usage'];
}
