import { LLMProvider, ProviderType, ProviderRegistry } from '../types/llm-provider.js';
/**
 * Registry for managing LLM providers
 */
export declare class LLMProviderRegistry implements ProviderRegistry {
    private providers;
    constructor();
    /**
     * Register a new provider
     */
    register(provider: LLMProvider): void;
    /**
     * Get a provider by type
     */
    getProvider(type: ProviderType): LLMProvider;
    /**
     * Get a provider by name
     */
    getProviderByName(name: string): LLMProvider | undefined;
    /**
     * List all registered providers
     */
    listProviders(): LLMProvider[];
    /**
     * List provider names
     */
    listProviderNames(): string[];
    /**
     * Get provider information for display
     */
    getProviderInfo(): Array<{
        name: string;
        displayName: string;
        requiresApiKey: boolean;
        defaultModel: string;
        availableModels: string[];
    }>;
    /**
     * Register default providers
     */
    private registerDefaultProviders;
    /**
     * Validate provider configuration
     */
    validateProviderConfig(providerType: ProviderType, config: any): void;
    /**
     * Get environment variable name for API key based on provider
     */
    getApiKeyEnvVar(providerType: ProviderType): string;
    /**
     * Get default configuration for a provider
     */
    getDefaultConfig(providerType: ProviderType): any;
}
