import process from 'node:process';
import { Command } from 'commander';
import pc from 'picocolors';
import { rulesGenerate } from './rulesGenerate.js';

export const run = async (): Promise<void> => {
  try {
    const program = new Command();
    
    program
      .description('Rulefy - Transform GitHub repositories into cursor rules instructions')
      .argument('[repo-path]', 'GitHub repository URL, owner/repo shorthand, or local repository path', '.')
      .option('--include <patterns>', 'Include patterns for files (glob pattern, e.g., "**/*.py")')
      .action(async (repoPath: string, options) => {
        console.log(pc.bold(`\n🧩 Rulefy - Generating cursor rules for ${repoPath}\n`));
        
        await rulesGenerate(repoPath, {
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