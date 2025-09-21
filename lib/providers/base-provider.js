import pc from 'picocolors';
/**
 * Base class for LLM providers
 * Provides common functionality and error handling
 */
export class BaseLLMProvider {
    /**
     * Validate the provider configuration
     */
    validateConfig(config) {
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
     * Handle API errors with proper formatting
     */
    handleApiError(error, context) {
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
    formatMessages(messages) {
        return messages.map(msg => ({
            ...msg,
            content: msg.content.trim()
        }));
    }
    /**
     * Extract content from provider-specific response format
     */
    extractContent(_response) {
        // This should be overridden by each provider
        return '';
    }
    /**
     * Extract usage information from provider-specific response format
     */
    extractUsage(_response) {
        // This should be overridden by each provider
        return undefined;
    }
}
//# sourceMappingURL=base-provider.js.map