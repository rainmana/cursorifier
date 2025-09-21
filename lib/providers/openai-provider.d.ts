import { BaseLLMProvider } from './base-provider.js';
import { LLMProviderConfig, LLMMessage, LLMResponse } from '../types/llm-provider.js';
/**
 * OpenAI provider implementation
 */
export declare class OpenAIProvider extends BaseLLMProvider {
    readonly name = "openai";
    readonly displayName = "OpenAI";
    readonly requiresApiKey = true;
    readonly defaultModel = "gpt-4o";
    private client;
    constructor();
    /**
     * Initialize the OpenAI client
     */
    private initializeClient;
    /**
     * Generate a response using OpenAI
     */
    generateResponse(messages: LLMMessage[], config: LLMProviderConfig): Promise<LLMResponse>;
    /**
     * Get available OpenAI models
     */
    getAvailableModels(): string[];
    /**
     * Extract content from OpenAI response
     */
    protected extractContent(response: any): string;
    /**
     * Extract usage information from OpenAI response
     */
    protected extractUsage(response: any): LLMResponse['usage'];
}
