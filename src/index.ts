import process from 'node:process';
import { Command } from 'commander';
import pc from 'picocolors';
import { rulesGenerate } from './rulesGenerate.js';
import { LLMProviderRegistry } from './providers/provider-registry.js';

export const run = async (): Promise<void> => {
  try {
    const program = new Command();
    const registry = new LLMProviderRegistry();
    
    program
      .description('Cursorifier - Transform GitHub repositories into cursor rules instructions')
      .argument('[repo-path]', 'Path to the repository', '.')
      .allowExcessArguments(true)
      .option('--provider <provider>', 'LLM provider to use (anthropic, openai, local)', 'anthropic')
      .option('--model <model>', 'Specific model to use (overrides provider default)')
      .option('--api-key <key>', 'API key for the provider (or set environment variable)')
      .option('--base-url <url>', 'Base URL for the API (useful for local providers)')
      .option('--max-tokens <tokens>', 'Maximum tokens for response (default: 8000)', '8000')
      .option('--temperature <temp>', 'Temperature for generation (0-2, default: 0.7)', '0.7')
      .option('--description <text>', 'Description of what should be rulefied')
      .option('--rule-type <type>', 'Type of rule to generate (auto, manual, agent, always)')
      .option('--output-format <format>', 'Output format for rules (cursor, cline)', 'cursor')
      .option('--chunk-size <size>', 'Chunk size for the repository to be processed in one go (default: 100000)', '100000')
      .option('--repomix-file <path>', 'Path to existing repomix output file (skips repomix execution)')
      .option('--list-providers', 'List available providers and their models')
      .allowUnknownOption(true);

    program.parse(process.argv);

    const options = program.opts();
    const args = program.args;

    // Handle list providers option
    if (options.listProviders) {
      console.log(pc.bold('\n📋 Available LLM Providers:\n'));
      const providers = registry.getProviderInfo();
      
      providers.forEach(provider => {
        console.log(pc.cyan(`${provider.displayName} (${provider.name}):`));
        console.log(`  Default Model: ${pc.green(provider.defaultModel)}`);
        console.log(`  Requires API Key: ${provider.requiresApiKey ? pc.red('Yes') : pc.green('No')}`);
        console.log(`  Available Models: ${provider.availableModels.slice(0, 5).join(', ')}${provider.availableModels.length > 5 ? '...' : ''}`);
        console.log('');
      });
      
      console.log(pc.yellow('Environment Variables:'));
      console.log('  ANTHROPIC_API_KEY - For Anthropic Claude');
      console.log('  OPENAI_API_KEY - For OpenAI');
      console.log('  LOCAL_API_KEY - For local providers (optional)');
      console.log('');
      return;
    }

    // Find the repository path (first argument that doesn't start with --)
    const repoPathIndex = args.findIndex(arg => !arg.startsWith('--'));
    let repoPath = repoPathIndex >= 0 ? args[repoPathIndex] : '.';
    
    // If using repomix file, use a default repo path since we won't run repomix
    if (options.repomixFile) {
      repoPath = '.';
    }
    
    if (options.repomixFile) {
      console.log(pc.bold(`\n🧩 Cursorifier - Generating cursor rules using repomix file: ${options.repomixFile}\n`));
    } else {
      console.log(pc.bold(`\n🧩 Cursorifier - Generating cursor rules for ${repoPath}\n`));
    }
    
    // Display provider information
    try {
      const provider = registry.getProvider(options.provider);
      console.log(pc.cyan(`Using provider: ${provider.displayName}`));
      console.log(pc.cyan(`Model: ${options.model || provider.defaultModel}`));
      if (options.baseUrl) {
        console.log(pc.cyan(`Base URL: ${options.baseUrl}`));
      }
      console.log('');
    } catch (error) {
      console.error(pc.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
    
    if (options.description) {
      console.log(pc.cyan(`Rulefying with description: "${options.description}"\n`));
    }
    
    // Create a dictionary for additional options
    const additionalOptions: Record<string, string> = {};
    
    // Known options already handled by Commander
    const knownOptions = ['provider', 'model', 'api-key', 'base-url', 'max-tokens', 'temperature', 'description', 'rule-type', 'output-format', 'chunk-size', 'repomix-file', 'list-providers'];
    const knownOptionFlags = knownOptions.map(opt => `--${opt}`);
    
    // Parse additional options from args array
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      // Skip the repository path
      if (i === repoPathIndex) continue;
      
      // Check if it's an option (starts with --)
      if (arg.startsWith('--') && !knownOptionFlags.includes(arg)) {
        const optionName = arg.slice(2); // Remove '--'
        
        // Check if next argument exists and doesn't start with -- and isn't the repo path
        if (i + 1 < args.length && !args[i + 1].startsWith('--') && i + 1 !== repoPathIndex) {
          additionalOptions[optionName] = args[i + 1];
          i++; // Skip the next argument since we've used it as a value
        } else {
          // Option without value (boolean flag)
          additionalOptions[optionName] = 'true';
        }
      }
    }
    
    await rulesGenerate(repoPath, {
      description: options.description,
      ruleType: options.ruleType,
      outputFormat: options.outputFormat,
      provider: options.provider,
      model: options.model,
      apiKey: options.apiKey,
      baseURL: options.baseUrl,
      maxTokens: parseInt(options.maxTokens),
      temperature: parseFloat(options.temperature),
      chunkSize: parseInt(options.chunkSize),
      repomixFile: options.repomixFile,
      additionalOptions
    });

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Unknown error occurred');
    }
    process.exit(1);
  }
};