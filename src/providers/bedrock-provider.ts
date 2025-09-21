import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { BedrockClient, ListFoundationModelsCommand } from '@aws-sdk/client-bedrock';
import { BaseLLMProvider } from './base-provider.js';
import type { LLMMessage, LLMResponse, LLMProviderConfig } from '../types/llm-provider.js';

export class BedrockProvider extends BaseLLMProvider {
  name = 'bedrock';
  displayName = 'AWS Bedrock';
  requiresApiKey = false; // AWS uses credential chain instead of API key
  defaultModel = 'anthropic.claude-3-7-sonnet-20250219-v1:0'; // Latest, most intelligent, cost-effective
  
  private bedrockRuntimeClient?: BedrockRuntimeClient;
  private bedrockClient?: BedrockClient;

  constructor() {
    super();
  }

  private initializeClient(config: LLMProviderConfig): BedrockRuntimeClient {
    if (!this.bedrockRuntimeClient) {
      const region = config.region || 'us-east-1';
      
      this.bedrockRuntimeClient = new BedrockRuntimeClient({
        region,
        // AWS credentials will be automatically picked up from:
        // 1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
        // 2. AWS credentials file (~/.aws/credentials)
        // 3. IAM roles (if running on EC2)
        // 4. AWS SSO
        // 5. AWS profile (if specified via AWS_PROFILE env var)
      });
    }
    return this.bedrockRuntimeClient;
  }

  private initializeBedrockClient(config: LLMProviderConfig): BedrockClient {
    if (!this.bedrockClient) {
      const region = config.region || 'us-east-1';
      
      this.bedrockClient = new BedrockClient({
        region,
        // Same credential chain as above
      });
    }
    return this.bedrockClient;
  }

  async generateResponse(
    messages: LLMMessage[],
    config: LLMProviderConfig
  ): Promise<LLMResponse> {
    this.validateConfig(config);
    
    const client = this.initializeClient(config);
    const modelId = config.model!;
    
    // Convert messages to the appropriate format based on model
    const { payload, contentType } = this.formatMessagesForModel(messages, modelId, config);
    
    try {
      const command = new InvokeModelCommand({
        modelId,
        body: JSON.stringify(payload),
        contentType: contentType || 'application/json',
      });

      const response = await client.send(command);
      
      const content = this.extractContent(response);
      const usage = this.extractUsage(response);

      return {
        content,
        usage,
        model: modelId,
        provider: this.name
      };
    } catch (error) {
      this.handleApiError(error, 'AWS Bedrock API error');
    }
  }

  private formatMessagesForModel(
    messages: LLMMessage[], 
    modelId: string, 
    config: LLMProviderConfig
  ): { payload: unknown; contentType?: string } {
    // Determine model family and format accordingly
    if (modelId.startsWith('anthropic.claude')) {
      return this.formatForClaude(messages, config);
    } else if (modelId.startsWith('amazon.titan')) {
      return this.formatForTitan(messages, config);
    } else if (modelId.startsWith('meta.llama')) {
      return this.formatForLlama(messages, config);
    } else if (modelId.startsWith('mistral.mistral')) {
      return this.formatForMistral(messages, config);
    } else if (modelId.startsWith('cohere.command')) {
      return this.formatForCohere(messages, config);
    } else {
      // Default to Claude format for unknown models
      return this.formatForClaude(messages, config);
    }
  }

  private formatForClaude(messages: LLMMessage[], config: LLMProviderConfig): { payload: unknown; contentType?: string } {
    const systemMessage = messages.find(msg => msg.role === 'system');
    const conversationMessages = messages.filter(msg => msg.role === 'user' || msg.role === 'assistant');
    
    return {
      payload: {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: config.maxTokens || 8000,
        temperature: config.temperature || 0.7,
        system: systemMessage?.content,
        messages: conversationMessages.map(msg => ({
          role: msg.role,
          content: [{ type: 'text', text: msg.content }]
        }))
      },
      contentType: 'application/json'
    };
  }

  private formatForTitan(messages: LLMMessage[], config: LLMProviderConfig): { payload: unknown; contentType?: string } {
    // Convert messages to a single prompt for Titan
    let prompt = '';
    for (const msg of messages) {
      if (msg.role === 'system') {
        prompt += `System: ${msg.content}\n\n`;
      } else if (msg.role === 'user') {
        prompt += `Human: ${msg.content}\n\n`;
      } else if (msg.role === 'assistant') {
        prompt += `Assistant: ${msg.content}\n\n`;
      }
    }
    prompt += 'Assistant:';
    
    return {
      payload: {
        inputText: prompt,
        textGenerationConfig: {
          maxTokenCount: config.maxTokens || 8000,
          temperature: config.temperature || 0.7,
          topP: 0.9,
          stopSequences: []
        }
      },
      contentType: 'application/json'
    };
  }

  private formatForLlama(messages: LLMMessage[], config: LLMProviderConfig): { payload: unknown; contentType?: string } {
    // Convert messages to a single prompt for Llama
    let prompt = '';
    for (const msg of messages) {
      if (msg.role === 'system') {
        prompt += `<s>[INST] <<SYS>>\n${msg.content}\n<</SYS>>\n\n`;
      } else if (msg.role === 'user') {
        prompt += `${msg.content} [/INST]`;
      } else if (msg.role === 'assistant') {
        prompt += ` ${msg.content} </s><s>[INST]`;
      }
    }
    
    return {
      payload: {
        prompt,
        max_gen_len: config.maxTokens || 8000,
        temperature: config.temperature || 0.7,
        top_p: 0.9
      },
      contentType: 'application/json'
    };
  }

  private formatForMistral(messages: LLMMessage[], config: LLMProviderConfig): { payload: unknown; contentType?: string } {
    const systemMessage = messages.find(msg => msg.role === 'system');
    const conversationMessages = messages.filter(msg => msg.role === 'user' || msg.role === 'assistant');
    
    return {
      payload: {
        prompt: systemMessage ? `<s>[INST] ${systemMessage.content} [/INST]` : '',
        max_tokens: config.maxTokens || 8000,
        temperature: config.temperature || 0.7,
        top_p: 0.9,
        messages: conversationMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      },
      contentType: 'application/json'
    };
  }

  private formatForCohere(messages: LLMMessage[], config: LLMProviderConfig): { payload: unknown; contentType?: string } {
    // Convert messages to a single prompt for Cohere
    let prompt = '';
    for (const msg of messages) {
      if (msg.role === 'system') {
        prompt += `System: ${msg.content}\n\n`;
      } else if (msg.role === 'user') {
        prompt += `Human: ${msg.content}\n\n`;
      } else if (msg.role === 'assistant') {
        prompt += `Assistant: ${msg.content}\n\n`;
      }
    }
    
    return {
      payload: {
        prompt,
        max_tokens: config.maxTokens || 8000,
        temperature: config.temperature || 0.7,
        p: 0.9,
        stop_sequences: []
      },
      contentType: 'application/json'
    };
  }

  extractContent(response: unknown): string {
    const bedrockResponse = response as BedrockResponse;
    
    if (bedrockResponse.body) {
      const responseBody = JSON.parse(new TextDecoder().decode(bedrockResponse.body));
      
      // Handle different response formats based on model
      if (responseBody.content && Array.isArray(responseBody.content)) {
        // Claude format
        return responseBody.content[0]?.text || '';
      } else if (responseBody.results && Array.isArray(responseBody.results)) {
        // Titan format
        return responseBody.results[0]?.outputText || '';
      } else if (responseBody.generation) {
        // Llama format
        return responseBody.generation || '';
      } else if (responseBody.generations && Array.isArray(responseBody.generations)) {
        // Mistral/Cohere format
        return responseBody.generations[0]?.text || '';
      } else if (responseBody.text) {
        // Generic text format
        return responseBody.text || '';
      }
    }
    
    throw new Error('Unable to extract content from Bedrock response');
  }

  extractUsage(response: unknown): { promptTokens: number; completionTokens: number; totalTokens: number } | undefined {
    const bedrockResponse = response as BedrockResponse;
    
    if (bedrockResponse.body) {
      const responseBody = JSON.parse(new TextDecoder().decode(bedrockResponse.body));
      
      // Handle different usage formats
      if (responseBody.usage) {
        const inputTokens = responseBody.usage.input_tokens || 0;
        const outputTokens = responseBody.usage.output_tokens || 0;
        return {
          promptTokens: inputTokens,
          completionTokens: outputTokens,
          totalTokens: inputTokens + outputTokens
        };
      } else if (responseBody.inputTokenCount !== undefined && responseBody.outputTokenCount !== undefined) {
        const inputTokens = responseBody.inputTokenCount;
        const outputTokens = responseBody.outputTokenCount;
        return {
          promptTokens: inputTokens,
          completionTokens: outputTokens,
          totalTokens: inputTokens + outputTokens
        };
      }
    }
    
    return undefined;
  }

  async listAvailableModels(region?: string): Promise<string[]> {
    const client = this.initializeBedrockClient({ 
      model: 'dummy', // Required by interface but not used for listing
      region: region || 'us-east-1' 
    });
    
    try {
      const command = new ListFoundationModelsCommand({});
      const response = await client.send(command);
      
      return response.modelSummaries
        ?.filter(model => model.modelLifecycle?.status === 'ACTIVE')
        ?.map(model => model.modelId || '')
        ?.filter(Boolean) || [];
    } catch (error) {
      console.warn('Failed to list Bedrock models:', error);
      return [];
    }
  }

  getDefaultConfig(): Partial<LLMProviderConfig> {
    return {
      model: 'anthropic.claude-3-haiku-20240307-v1:0',
      region: 'us-east-1',
      maxTokens: 8000,
      temperature: 0.7
    };
  }

  getAvailableModels(): string[] {
    // Return latest Bedrock models
    return [
      // Latest Claude models on Bedrock
      'anthropic.claude-3-7-sonnet-20250219-v1:0',  // Latest, most intelligent
      'anthropic.claude-3-5-sonnet-20241022-v1:0',  // Cost-effective, fast
      'anthropic.claude-3-5-haiku-20241022-v1:0',   // Fastest, most cost-effective
      'anthropic.claude-sonnet-4-20250514-v1:0',    // Claude 4 Sonnet
      'anthropic.claude-opus-4-20250514-v1:0',      // Claude 4 Opus (most powerful)
      'anthropic.claude-3-haiku-20240307-v1:0',     // Legacy Haiku
      'anthropic.claude-3-sonnet-20240229-v1:0',    // Legacy Sonnet
      'anthropic.claude-3-opus-20240229-v1:0',      // Legacy Opus
      // Amazon Titan models
      'amazon.titan-text-express-v1',
      'amazon.titan-text-lite-v1',
      // Meta Llama models
      'meta.llama-2-13b-chat-v1',
      'meta.llama-2-70b-chat-v1',
      'meta.llama-3-8b-instruct-v1:0',
      'meta.llama-3-70b-instruct-v1:0',
      // Mistral models
      'mistral.mistral-7b-instruct-v0:2',
      'mistral.mixtral-8x7b-instruct-v0:1',
      // Cohere models
      'cohere.command-text-v14',
      'cohere.command-light-text-v14'
    ];
  }

  getApiKeyEnvVar(): string {
    // AWS doesn't use a single API key, but uses the AWS credential chain
    return 'AWS_PROFILE'; // This is the most common way to specify credentials
  }
}

interface BedrockResponse {
  body?: Uint8Array;
  contentType?: string;
}
