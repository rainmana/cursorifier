import OpenAI from 'openai';
import { BaseLLMProvider } from './base-provider.js';
import { LLMProviderConfig, LLMMessage, LLMResponse } from '../types/llm-provider.js';

interface OpenAILikeResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

/**
 * OpenAI provider implementation
 */
export class OpenAIProvider extends BaseLLMProvider {
  readonly name = 'openai';
  readonly displayName = 'OpenAI';
  readonly requiresApiKey = true;
  readonly defaultModel = 'gpt-4o';

  private client: OpenAI | null = null;

  constructor() {
    super();
  }

  /**
   * Initialize the OpenAI client
   */
  private initializeClient(apiKey: string, baseURL?: string): OpenAI {
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
  async generateResponse(
    messages: LLMMessage[],
    config: LLMProviderConfig
  ): Promise<LLMResponse> {
    try {
      this.validateConfig(config);
      
      const client = this.initializeClient(config.apiKey!, config.baseURL);
      
      // Convert messages to OpenAI format
      const openaiMessages = this.formatMessages(messages).map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
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
    } catch (error) {
      this.handleApiError(error, 'OpenAI API error');
    }
  }

  /**
   * Get available OpenAI models
   */
  getAvailableModels(): string[] {
    return [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k'
    ];
  }

  /**
   * Extract content from OpenAI response
   */
  protected extractContent(response: unknown): string {
    if (response && typeof response === 'object' && 'choices' in response) {
      const choices = (response as OpenAILikeResponse).choices;
      if (Array.isArray(choices) && choices.length > 0) {
        return choices[0].message?.content || '';
      }
    }
    return '';
  }

  /**
   * Extract usage information from OpenAI response
   */
  protected extractUsage(response: unknown): LLMResponse['usage'] {
    if (response && typeof response === 'object' && 'usage' in response) {
      const usage = (response as OpenAILikeResponse).usage;
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
