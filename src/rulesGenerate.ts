import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import pc from 'picocolors';
import { generateWithLLM } from './llm-generator-v2.js';

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
  region?: string;
  chunkSize?: number;
  chunkDelay?: number;
  repomixFile?: string;
  additionalOptions?: Record<string, string>;
}

export async function rulesGenerate(
  repoPath: string,
  options: RulesGenerateOptions
): Promise<void> {
  try {
    // 1. Extract repo name from URL or path
    const repoName = extractRepoName(repoPath);
    
    // 2. Set output directory based on repo name
    const outputDir = `${repoName}-output`;
    const outputFormat = options.outputFormat || 'cursor';
    
    // Determine output file based on format
    let outputFile: string;
    if (outputFormat === 'cline') {
      outputFile = path.join(outputDir, '.clinerules');
    } else if (outputFormat === 'roo') {
      outputFile = path.join(outputDir, '.roomodes');
    } else {
      outputFile = path.join(outputDir, `${repoName}.rules.mdc`);
    }
    
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    
    // 3. Get repository content
    let repoText: string;
    
    if (options.repomixFile) {
      // Use provided repomix file
      console.log(pc.cyan(`1. Using provided repomix file: ${options.repomixFile}`));
      try {
        repoText = await readRepomixFile(options.repomixFile);
        console.log(pc.green('✓ Successfully read repomix file'));
      } catch (error) {
        throw new Error(`Failed to read repomix file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      // Run repomix to get repo representation
      console.log(pc.cyan('1. Converting repository to text using repomix...'));
      try {
        repoText = await runRepomix(repoPath, outputDir, options.additionalOptions);
      } catch (error) {
        console.log(pc.yellow(`Warning: Could not get actual repo content. Error: ${error}. Using mock content for testing.`));
        repoText = generateMockRepoContent(repoName);
      }
    }
    
    console.log(pc.cyan(`2. Reading ${outputFormat} rules guidelines...`));
    // 4. Read guidelines file based on output format
    let guidelinesText: string;
    let guidelinesFile: string;
    if (outputFormat === 'cline') {
      guidelinesFile = 'cline_rules.md';
    } else if (outputFormat === 'roo') {
      guidelinesFile = 'roo_modes.md';
    } else {
      guidelinesFile = 'cursor_mdc.md';
    }
    
    try {
      // Try with a local path first (more reliable)
      const localPath = path.join(process.cwd(), 'src', 'prompts', guidelinesFile);
      guidelinesText = await readGuidelines(localPath);
      console.log(pc.green('✓ Successfully read guidelines from local path'));
    } catch (_error) {
      // If not found locally, try with module path
      try {
        console.debug(`Error: ${_error}. Trying to read guidelines from module path...`);
        const modulePath = new URL(import.meta.url).pathname;
        const moduleDir = path.dirname(modulePath);
        const moduleDirPath = path.resolve(moduleDir, `../src/prompts/${guidelinesFile}`);
        
        guidelinesText = await fs.readFile(moduleDirPath, 'utf-8');
        console.log(pc.green('✓ Successfully read guidelines from module path'));
      } catch (innerError) {
        console.log(pc.yellow('Warning: Could not read guidelines. Error: ' + innerError + '. Using built-in guidelines.'));
        guidelinesText = generateMockGuidelines();
      }
    }
    
    const generatingText = outputFormat === 'cline' ? 'cline rules' : 
      outputFormat === 'roo' ? 'roo modes' : 
        'cursor rules';
    console.log(pc.cyan(`3. Generating ${generatingText}...`));
    // 5. Generate rules using LLM
    const generatedRules = await generateWithLLM(
      repoText, 
      guidelinesText, 
      outputDir, 
      options.description,
      options.ruleType,
      options.outputFormat,
      {
        provider: options.provider || 'anthropic',
        model: options.model,
        apiKey: options.apiKey,
        baseURL: options.baseURL,
        maxTokens: options.maxTokens,
        temperature: options.temperature,
        region: options.region,
        chunkSize: options.chunkSize,
        chunkDelay: options.chunkDelay
      }
    );
    
    console.log(pc.cyan(`4. Writing rules to ${outputFile}...`));
    // 6. Write output to file
    await fs.writeFile(outputFile, generatedRules);
    
    const formatDisplayName = outputFormat === 'cline' ? 'cline rules' : 
      outputFormat === 'roo' ? 'roo modes' : 
        'cursor rules';
    console.log(pc.green(`\n✅ Successfully generated ${formatDisplayName} for ${repoName}!`));
    console.log(`Output saved to: ${pc.bold(outputFile)}`);
    console.log(`All generated files are in: ${pc.bold(outputDir)}`);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate rules: ${error.message}`);
    }
    throw new Error('Failed to generate rules: Unknown error');
  }
}

function extractRepoName(repoPath: string): string {
  // Handle current directory case
  if (repoPath === '.') {
    return path.basename(process.cwd());
  }
  
  // For local paths, use the directory name
  try {
    // Sync version to avoid Promise handling in this synchronous function
    if (fsSync.statSync(repoPath).isDirectory()) {
      return path.basename(repoPath);
    }
  } catch (_e) {
    // Path doesn't exist or can't be accessed, check if it's a remote repo
    console.log(pc.yellow(`Warning: Could not find a local repo by path: ${repoPath}. Error: ${_e}`));
  }
  
  // Handle format like 'owner/repo'
  if (/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/.test(repoPath)) {
    return repoPath.split('/')[1];
  }
  
  // Handle GitHub URLs (only http or https)
  const githubUrlMatch = repoPath.match(/^https?:\/\/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)/);
  if (githubUrlMatch) {
    return githubUrlMatch[2];
  }
  
  // If no match, use a sanitized version of the path as fallback
  return repoPath.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/^-+|-+$/g, '');
}

async function runRepomix(repoPath: string, outputDir: string, additionalOptions?: Record<string, string>): Promise<string> {
  try {
    
    // Build repomix command based on whether it's a remote or local repository
    let command = `npx repomix ${repoPath}`;
    
    // Add any additional options to the command
    if (additionalOptions) {
      for (const [key, value] of Object.entries(additionalOptions)) {
        if (value === 'true') {
          command += ` --${key}`;
        } else {
          command += ` --${key} "${value}"`;
        }
      }
    }
    
    // Add output file to command (single file, not folder)
    const outputFilePath = path.join(outputDir, 'repomix-output.txt');
    command += ` -o "${outputFilePath}"`;
    
    // Display the command being executed
    console.log(pc.cyan(`Executing: ${command}`));
    
    // Run repomix command
    execSync(command, { 
      encoding: 'utf-8',
      stdio: 'inherit' // Show all output directly in the console
    });
    
    // Read the content of the generated file
    console.log(pc.green(`Reading repomix output from: ${outputFilePath}`));
    
    const content = await fs.readFile(outputFilePath, 'utf-8');
    return content;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error running repomix: ${error.message}`);
    }
    throw new Error('Unknown error occurred while running repomix');
  }
}

async function readRepomixFile(filePath: string): Promise<string> {
  try {
    // Resolve the file path (handle both absolute and relative paths)
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
    
    // Check if file exists
    await fs.access(absolutePath);
    
    // Read the file
    const content = await fs.readFile(absolutePath, 'utf-8');
    
    // Basic validation - check if it looks like a repomix file
    if (content.length === 0) {
      throw new Error('Repomix file is empty');
    }
    
    // Check for common repomix patterns
    const hasRepomixPatterns = content.includes('# Project:') || 
                              content.includes('## Directory Structure') ||
                              content.includes('## Key Files') ||
                              content.includes('## Technologies Used');
    
    if (!hasRepomixPatterns) {
      console.log(pc.yellow('Warning: File may not be a valid repomix output. Proceeding anyway...'));
    }
    
    return content;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        throw new Error(`Repomix file not found: ${filePath}`);
      }
      throw new Error(`Failed to read repomix file: ${error.message}`);
    }
    throw new Error(`Unknown error reading repomix file: ${filePath}`);
  }
}

async function readGuidelines(guidelinesPath: string): Promise<string> {
  try {
    const absolutePath = path.resolve(process.cwd(), guidelinesPath);
    return await fs.readFile(absolutePath, 'utf-8');
  } catch (_error) {
    throw new Error(`Failed to read guidelines file at ${guidelinesPath}. Error: ${_error}. Make sure the file exists.`);
  }
}

function generateMockRepoContent(repoName: string): string {
  return `# Project: ${repoName}

## Directory Structure
- src/
  - index.ts
  - core/
    - processor.ts
    - utils.ts
  - lib/
    - api.ts
    - helpers.ts
- tests/
  - core.test.ts
  - api.test.ts
- package.json
- tsconfig.json
- README.md

## Key Files
### src/index.ts
This is the main entry point of the application.

### src/core/processor.ts
Contains the core processing logic.

### src/lib/api.ts
Contains API integration code.

## Technologies Used
- TypeScript
- Node.js
- Jest for testing
`;
}

function generateMockGuidelines(): string {
  return `**Guidelines for Creating Content for** .cursorrules

.cursorrules files serve as customized instruction sets for Cursor AI, tailoring its code generation behavior to specific project requirements. These files should be placed in the repository root to provide project-wide context and guidelines.

**1. Use Markdown for Documentation**
* All documentation within .cursorrules files or accompanying READMEs must be written in Markdown to ensure consistency and readability.

**2. Maintain a Clear Structure**
* Organize content logically with clear sections (e.g., general guidelines, project-specific rules, file structure) to provide context and instructions effectively.

**3. Focus on Best Practices and Standards**
* Define coding standards, best practices, and style guidelines specific to the technology or framework to ensure consistent, high-quality output.

**4. Include Project-Specific Context**
* Include details about the project's structure, architectural decisions, and commonly used libraries or methods to guide AI behavior.
`;
}