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
 * Local OpenAI-compatible provider implementation
 * Supports Ollama, LM Studio, and other OpenAI-compatible local APIs
 */
export class LocalProvider extends BaseLLMProvider {
  readonly name = 'local';
  readonly displayName = 'Local (OpenAI-compatible)';
  readonly requiresApiKey = false;
  readonly defaultModel = 'llama3.1';

  /**
   * Generate a response using a local OpenAI-compatible API
   */
  async generateResponse(
    messages: LLMMessage[],
    config: LLMProviderConfig
  ): Promise<LLMResponse> {
    try {
      this.validateConfig(config);
      
      const baseURL = config.baseURL || 'http://localhost:11434/v1'; // Default Ollama URL
      
      // Convert messages to OpenAI format
      const openaiMessages = this.formatMessages(messages).map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content
      }));

      const response = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
        },
        body: JSON.stringify({
          model: config.model,
          messages: openaiMessages,
          max_tokens: config.maxTokens || 8000,
          temperature: config.temperature || 0.7,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const content = this.extractContent(data);
      const usage = this.extractUsage(data);

      return {
        content,
        usage,
        model: config.model,
        provider: this.name
      };
    } catch (error) {
      this.handleApiError(error, 'Local API error');
    }
  }

  /**
   * Get available local models
   * Note: This is a static list as we can't query the local API without knowing the endpoint
   */
  getAvailableModels(): string[] {
    return [
      'llama3.1',
      'llama3.1:8b',
      'llama3.1:70b',
      'llama3.2',
      'llama3.2:3b',
      'llama3.2:1b',
      'codellama',
      'codellama:7b',
      'codellama:13b',
      'codellama:34b',
      'mistral',
      'mistral:7b',
      'mixtral',
      'mixtral:8x7b',
      'phi3',
      'phi3:mini',
      'gemma',
      'gemma:2b',
      'gemma:7b',
      'qwen',
      'qwen2',
      'qwen2.5',
      'deepseek-coder',
      'starcoder2',
      'wizardcoder',
      'magicoder'
    ];
  }

  /**
   * Extract content from OpenAI-compatible response
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
   * Extract usage information from OpenAI-compatible response
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

  /**
   * Validate local provider configuration
   */
  validateConfig(config: LLMProviderConfig): void {
    super.validateConfig(config);
    
    if (config.baseURL && !this.isValidUrl(config.baseURL)) {
      throw new Error('baseURL must be a valid URL');
    }
  }

  /**
   * Check if a string is a valid URL
   */
  private isValidUrl(urlString: string): boolean {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  }
}
