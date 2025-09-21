import Anthropic from '@anthropic-ai/sdk';
import { BaseLLMProvider } from './base-provider.js';
/**
 * Anthropic Claude provider implementation
 */
export class AnthropicProvider extends BaseLLMProvider {
    name = 'anthropic';
    displayName = 'Anthropic Claude';
    requiresApiKey = true;
    defaultModel = 'claude-3-5-sonnet-20241022';
    client = null;
    constructor() {
        super();
    }
    /**
     * Initialize the Anthropic client
     */
    initializeClient(apiKey) {
        if (!this.client) {
            this.client = new Anthropic({ apiKey });
        }
        return this.client;
    }
    /**
     * Generate a response using Anthropic Claude
     */
    async generateResponse(messages, config) {
        try {
            this.validateConfig(config);
            const client = this.initializeClient(config.apiKey);
            // Convert messages to Anthropic format
            const systemMessage = messages.find(msg => msg.role === 'system');
            const userMessages = messages.filter(msg => msg.role === 'user' || msg.role === 'assistant');
            // Anthropic expects the last message to be from user
            const lastMessage = userMessages[userMessages.length - 1];
            const conversationMessages = userMessages.slice(0, -1).map(msg => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content
            }));
            const response = await client.messages.create({
                model: config.model,
                max_tokens: config.maxTokens || 8000,
                system: systemMessage?.content,
                messages: [
                    ...conversationMessages,
                    {
                        role: 'user',
                        content: lastMessage.content
                    }
                ]
            });
            const content = this.extractContent(response);
            const usage = this.extractUsage(response);
            return {
                content,
                usage,
                model: config.model,
                provider: this.name
            };
        }
        catch (error) {
            this.handleApiError(error, 'Anthropic API error');
        }
    }
    /**
     * Get available Anthropic models
     */
    getAvailableModels() {
        return [
            'claude-3-5-sonnet-20241022',
            'claude-3-5-haiku-20241022',
            'claude-3-opus-20240229',
            'claude-3-sonnet-20240229',
            'claude-3-haiku-20240307'
        ];
    }
    /**
     * Extract content from Anthropic response
     */
    extractContent(response) {
        if (response.content && Array.isArray(response.content) && response.content.length > 0) {
            return response.content[0].text || '';
        }
        return '';
    }
    /**
     * Extract usage information from Anthropic response
     */
    extractUsage(response) {
        if (response.usage) {
            return {
                promptTokens: response.usage.input_tokens || 0,
                completionTokens: response.usage.output_tokens || 0,
                totalTokens: response.usage.input_tokens + response.usage.output_tokens || 0
            };
        }
        return undefined;
    }
}
//# sourceMappingURL=anthropic-provider.js.map