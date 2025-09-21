import OpenAI from 'openai';
import { BaseLLMProvider } from './base-provider.js';
/**
 * OpenAI provider implementation
 */
export class OpenAIProvider extends BaseLLMProvider {
    name = 'openai';
    displayName = 'OpenAI';
    requiresApiKey = true;
    defaultModel = 'gpt-4o';
    client = null;
    constructor() {
        super();
    }
    /**
     * Initialize the OpenAI client
     */
    initializeClient(apiKey, baseURL) {
        if (!this.client) {
            this.client = new OpenAI({
                apiKey,
                baseURL,
                timeout: 60000 // 60 seconds timeout
            });
        }
        return this.client;
    }
    /**
     * Generate a response using OpenAI
     */
    async generateResponse(messages, config) {
        try {
            this.validateConfig(config);
            const client = this.initializeClient(config.apiKey, config.baseURL);
            // Convert messages to OpenAI format
            const openaiMessages = this.formatMessages(messages).map(msg => ({
                role: msg.role,
                content: msg.content
            }));
            const response = await client.chat.completions.create({
                model: config.model,
                messages: openaiMessages,
                max_tokens: config.maxTokens || 8000,
                temperature: config.temperature || 0.7
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
            this.handleApiError(error, 'OpenAI API error');
        }
    }
    /**
     * Get available OpenAI models
     */
    getAvailableModels() {
        return [
            'gpt-4o', // Latest, most capable, cost-effective
            'gpt-4.1-mini', // Fast, efficient, cost-effective
            'gpt-4.1', // Advanced reasoning, higher cost
            'gpt-4o-mini', // Legacy mini model
            'gpt-4-turbo', // Legacy turbo model
            'gpt-4', // Legacy GPT-4
            'gpt-3.5-turbo', // Legacy 3.5 turbo
            'gpt-3.5-turbo-16k' // Legacy 3.5 turbo with extended context
        ];
    }
    /**
     * Extract content from OpenAI response
     */
    extractContent(response) {
        if (response && typeof response === 'object' && 'choices' in response) {
            const choices = response.choices;
            if (Array.isArray(choices) && choices.length > 0) {
                return choices[0].message?.content || '';
            }
        }
        return '';
    }
    /**
     * Extract usage information from OpenAI response
     */
    extractUsage(response) {
        if (response && typeof response === 'object' && 'usage' in response) {
            const usage = response.usage;
            if (usage) {
                return {
                    promptTokens: usage.prompt_tokens || 0,
                    completionTokens: usage.completion_tokens || 0,
                    totalTokens: usage.total_tokens || 0
                };
            }
        }
        return undefined;
    }
}
//# sourceMappingURL=openai-provider.js.map