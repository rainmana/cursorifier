import process from 'node:process';
import { Command } from 'commander';
import pc from 'picocolors';
import { rulesGenerate } from './rulesGenerate.js';

export const run = async () => {
  try {
    const program = new Command();
    
    program
      .description('Rulefy - Transform GitHub repositories into cursor rules instructions')
      .argument('<repo-path>', 'GitHub repository URL, owner/repo shorthand, or local repository path')
      .option('--provider <provider>', 'LLM provider to use', 'claude-sonnet-3.5-latest')
      .option('-o, --output <file>', 'Output file name (defaults to <repo-name>.rules.mdc)')
      .option('--guidelines <file>', 'Path to cursor rules guidelines file', './cursorrules-guidelines.md')
      .option('--include <patterns>', 'Include patterns for files (glob pattern, e.g., "**/*.py")')
      .action(async (repoPath: string, options) => {
        console.log(pc.bold(`\n🧩 Rulefy - Generating cursor rules for ${repoPath}\n`));
        
        await rulesGenerate(repoPath, {
          provider: options.provider,
          outputFile: options.output,
          guidelinesPath: options.guidelines,
          includePatterns: options.include
        });
      });

    await program.parseAsync(process.argv);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Unknown error occurred');
    }
    process.exit(1);
  }
};