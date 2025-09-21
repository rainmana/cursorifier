export interface LLMGeneratorOptions {
    provider: string;
    model?: string;
    apiKey?: string;
    baseURL?: string;
    maxTokens?: number;
    temperature?: number;
    chunkSize?: number;
}
export declare function generateWithLLM(repoContent: string, guidelines: string, outputDir?: string, description?: string, ruleType?: string, outputFormat?: string, options?: LLMGeneratorOptions): Promise<string>;
