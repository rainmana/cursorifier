import { BaseLLMProvider } from './base-provider.js';
import type { LLMMessage, LLMResponse, LLMProviderConfig } from '../types/llm-provider.js';
export declare class BedrockProvider extends BaseLLMProvider {
    name: string;
    displayName: string;
    requiresApiKey: boolean;
    defaultModel: string;
    private bedrockRuntimeClient?;
    private bedrockClient?;
    constructor();
    private initializeClient;
    private initializeBedrockClient;
    generateResponse(messages: LLMMessage[], config: LLMProviderConfig): Promise<LLMResponse>;
    private formatMessagesForModel;
    private formatForClaude;
    private formatForTitan;
    private formatForLlama;
    private formatForMistral;
    private formatForCohere;
    extractContent(response: unknown): string;
    extractUsage(response: unknown): {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    } | undefined;
    listAvailableModels(region?: string): Promise<string[]>;
    getDefaultConfig(): Partial<LLMProviderConfig>;
    getAvailableModels(): string[];
    getApiKeyEnvVar(): string;
}
