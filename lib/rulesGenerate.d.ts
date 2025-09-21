interface RulesGenerateOptions {
    description?: string;
    ruleType?: string;
    outputFormat?: string;
    provider?: string;
    model?: string;
    apiKey?: string;
    baseURL?: string;
    maxTokens?: number;
    temperature?: number;
    chunkSize?: number;
    chunkDelay?: number;
    repomixFile?: string;
    additionalOptions?: Record<string, string>;
}
export declare function rulesGenerate(repoPath: string, options: RulesGenerateOptions): Promise<void>;
export {};
