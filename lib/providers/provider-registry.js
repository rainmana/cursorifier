import pc from 'picocolors';
import { AnthropicProvider } from './anthropic-provider.js';
import { OpenAIProvider } from './openai-provider.js';
import { LocalProvider } from './local-provider.js';
import { BedrockProvider } from './bedrock-provider.js';
/**
 * Registry for managing LLM providers
 */
export class LLMProviderRegistry {
    providers = new Map();
    constructor() {
        this.registerDefaultProviders();
    }
    /**
     * Register a new provider
     */
    register(provider) {
        this.providers.set(provider.name, provider);
    }
    /**
     * Get a provider by type
     */
    getProvider(type) {
        const provider = this.providers.get(type);
        if (!provider) {
            throw new Error(pc.red(`Provider '${type}' not found. Available providers: ${this.listProviderNames().join(', ')}`));
        }
        return provider;
    }
    /**
     * Get a provider by name
     */
    getProviderByName(name) {
        return this.providers.get(name);
    }
    /**
     * List all registered providers
     */
    listProviders() {
        return Array.from(this.providers.values());
    }
    /**
     * List provider names
     */
    listProviderNames() {
        return Array.from(this.providers.keys());
    }
    /**
     * Get provider information for display
     */
    getProviderInfo() {
        return this.listProviders().map(provider => ({
            name: provider.name,
            displayName: provider.displayName,
            requiresApiKey: provider.requiresApiKey,
            defaultModel: provider.defaultModel,
            availableModels: provider.getAvailableModels()
        }));
    }
    /**
     * Register default providers
     */
    registerDefaultProviders() {
        this.register(new AnthropicProvider());
        this.register(new OpenAIProvider());
        this.register(new LocalProvider());
        this.register(new BedrockProvider());
    }
    /**
     * Validate provider configuration
     */
    validateProviderConfig(providerType, config) {
        const provider = this.getProvider(providerType);
        provider.validateConfig(config);
    }
    /**
     * Get environment variable name for API key based on provider
     */
    getApiKeyEnvVar(providerType) {
        switch (providerType) {
            case 'anthropic':
                return 'ANTHROPIC_API_KEY';
            case 'openai':
                return 'OPENAI_API_KEY';
            case 'local':
                return 'LOCAL_API_KEY'; // Optional for local providers
            default:
                throw new Error(`Unknown provider type: ${providerType}`);
        }
    }
    /**
     * Get default configuration for a provider
     */
    getDefaultConfig(providerType) {
        const provider = this.getProvider(providerType);
        const apiKeyEnvVar = this.getApiKeyEnvVar(providerType);
        return {
            model: provider.defaultModel,
            apiKey: process.env[apiKeyEnvVar],
            maxTokens: 8000,
            temperature: 0.7,
            ...(providerType === 'local' && { baseURL: 'http://localhost:11434/v1' })
        };
    }
}
//# sourceMappingURL=provider-registry.js.map