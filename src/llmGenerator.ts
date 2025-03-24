import Anthropic from '@anthropic-ai/sdk';
import { getEncoding } from 'js-tiktoken';
import fs from 'node:fs/promises';
import path from 'node:path';
import pc from 'picocolors';

// Environment variables for chunk configuration, with defaults
const CHUNK_SIZE = Number(process.env.CHUNK_SIZE || '100000');
const CHUNK_OVERLAP = Number(process.env.CHUNK_OVERLAP || '50000');

export async function generateWithLLM(
  repoContent: string,
  guidelines: string,
  outputDir: string = '.'
): Promise<string> {
  // If this is a test run with dummy API key, just return a mock response
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey === 'dummy-key') {
    console.log('Using mock response for testing');
    return generateMockResponse(repoContent);
  }
  
  return await generateWithClaude(repoContent, guidelines, outputDir);
}

/**
 * Creates a visual progress bar
 */
function progressBar(current: number, total: number, length = 30): string {
  const percentage = current / total;
  const filledLength = Math.round(length * percentage);
  const emptyLength = length - filledLength;
  
  const filled = '█'.repeat(filledLength);
  const empty = '░'.repeat(emptyLength);
  const percentageText = Math.round(percentage * 100).toString().padStart(3);
  
  return `${filled}${empty} ${percentageText}%`;
}

function formatTokenCount(count: number): string {
  const formatted = count.toLocaleString();
  if (count < 50000) return pc.green(formatted);
  if (count < 100000) return pc.yellow(formatted);
  return pc.red(formatted);
}

function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  console.log(pc.cyan('\n┌─────────────────────────────────────────┐'));
  console.log(pc.cyan('│           CONTENT CHUNKING               │'));
  console.log(pc.cyan('└─────────────────────────────────────────┘\n'));
  
  // Get tokenizer for the model
  const encoding = getEncoding('cl100k_base');
  
  const tokens = encoding.encode(text);
  const totalTokens = tokens.length;
  const chunks: string[] = [];
  
  console.log(`● Document size: ${formatTokenCount(totalTokens)} tokens`);
  console.log(`● Chunk size: ${formatTokenCount(chunkSize)} tokens`);
  console.log(`● Chunk overlap: ${formatTokenCount(overlap)} tokens\n`);
  
  console.log(pc.cyan('Chunking document...'));
  
  let i = 0;
  while (i < tokens.length) {
    // Get the current chunk of tokens
    const chunkTokens = tokens.slice(i, Math.min(i + chunkSize, tokens.length));
    const chunk = encoding.decode(chunkTokens);
    chunks.push(chunk);
    
    // Show chunking progress
    const progress = Math.min(i + chunkSize, tokens.length) / tokens.length;
    process.stdout.write(`\r${pc.cyan('Progress:')} ${progressBar(progress, 1)}`);
    
    // Move forward, accounting for overlap
    i += chunkSize - overlap;
    if (i >= tokens.length) break;
    
    // Ensure we don't go backward if overlap is too large
    i = Math.max(i, 0);
  }
  
  process.stdout.write('\n\n');
  console.log(pc.green(`✓ Chunking complete! Created ${chunks.length} chunks\n`));
  
  return chunks;
}

async function generateWithClaude(repoContent: string, guidelines: string, outputDir: string = '.'): Promise<string> {
  // Check for API key in environment
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set. Please set it to use Claude.');
  }
  
  const client = new Anthropic({
    apiKey,
  });
  
  // Create chunks of the repository content
  const chunks = chunkText(repoContent, CHUNK_SIZE, CHUNK_OVERLAP);
  
  // Display token counts for each chunk in a table format
  console.log(pc.cyan('\n┌─────────────────────────────────────────┐'));
  console.log(pc.cyan('│          CHUNK INFORMATION              │'));
  console.log(pc.cyan('└─────────────────────────────────────────┘\n'));
  
  // Fixed table width columns
  const chunkColWidth = 10;      // Width of "Chunk" column
  const tokenColWidth = 16;      // Width of "Token Count" column
  const sizeColWidth = 29;      // Width of "Size" column
  
  // Create consistent table borders and headers
  console.log(pc.cyan(`┌${'─'.repeat(chunkColWidth)}┬${'─'.repeat(tokenColWidth)}┬${'─'.repeat(sizeColWidth)}┐`));
  console.log(pc.cyan(`│ ${'Chunk'.padEnd(chunkColWidth-2)} │ ${'Token Count'.padEnd(tokenColWidth-2)} │ ${'Size'.padEnd(sizeColWidth-2)} │`));
  console.log(pc.cyan(`├${'─'.repeat(chunkColWidth)}┼${'─'.repeat(tokenColWidth)}┼${'─'.repeat(sizeColWidth)}┤`));
  
  const encoding = getEncoding('cl100k_base');
  chunks.forEach((chunk, index) => {
    const tokenCount = encoding.encode(chunk).length;
    const percentage = (tokenCount / CHUNK_SIZE * 100).toFixed(1);
    
    // Create a fixed-width progress bar with proper padding
    const barWidth = 15;
    const filledLength = Math.round(barWidth * (tokenCount / CHUNK_SIZE));
    const filled = '█'.repeat(Math.min(filledLength, barWidth));
    const empty = '░'.repeat(Math.max(0, barWidth - filledLength));
    const bar = filled + empty;
    
    // Format the percentage with consistent spacing
    const percentText = `${percentage}%`;
    
    // Ensure consistent column widths matching header widths
    const chunkCol = String(index+1).padEnd(chunkColWidth-2);
    const tokenCol = formatTokenCount(tokenCount).padEnd(tokenColWidth-2);
    const sizeCol = `${bar} ${percentText}`.padEnd(sizeColWidth-2);
    
    console.log(pc.cyan(`│ ${chunkCol} │ ${tokenCol} │ ${sizeCol} │`));
  });
  
  console.log(pc.cyan(`└${'─'.repeat(chunkColWidth)}┴${'─'.repeat(tokenColWidth)}┴${'─'.repeat(sizeColWidth)}┘\n`));
  
  let currentSummary = ''; // This will store our progressively built summary
  
  // Helper function to extract content between <cursorrules> tags
  function extractCursorrules(text: string): string {
    const regex = /<cursorrules>([\s\S]*?)<\/cursorrules>/;
    const match = text.match(regex);
    if (!match) {
      throw new Error('Response does not contain <cursorrules> tags. Make sure the model includes the required tags in its response.');
    }
    return match[1].trim();
  }
  
  // Process each chunk progressively
  console.log(pc.cyan('\n┌─────────────────────────────────────────┐'));
  console.log(pc.cyan('│          PROCESSING CHUNKS              │'));
  console.log(pc.cyan('└─────────────────────────────────────────┘\n'));
  
  for (let i = 0; i < chunks.length; i++) {
    const chunkDisplay = `[${i+1}/${chunks.length}]`;
    console.log(`${pc.yellow('⟳')} Processing chunk ${pc.yellow(chunkDisplay)} ${progressBar(i+1, chunks.length)}`);
    
    const chunk = chunks[i];
    const isFirstChunk = i === 0;
    
    const systemPrompt = `You are an expert AI system designed to analyze code repositories and generate Cursor AI rules. Your task is to create a .cursorrules file based on the provided repository content and guidelines.`;
    
    let userPrompt;
    
    if (isFirstChunk) {
      // For the first chunk, start creating the rules
      userPrompt = `I want you to create a .cursorrules file for a repository. I'll provide the content in chunks.

First, carefully review the following repository chunk:

<repository_chunk>
${chunk}
</repository_chunk>

Now, consider these guidelines for creating .cursorrules files:

<guidelines>
${guidelines}
</guidelines>

Before generating the rules, analyze the repository content and structure. In your analysis, consider the following:

1. List the main technologies, frameworks, and languages used in the repository.
2. Write down specific coding patterns, naming conventions, or architectural decisions observed.
3. Outline the overall structure of the codebase, including key directories and file types.
4. Note any unique or project-specific practices that should be reflected in the rules.

Present your analysis inside <repository_analysis> tags. This analysis will inform the rules you generate.

After completing your analysis, generate the initial Cursor AI rules for this repository. Follow these important instructions:

1. Make rules specific to this repository's structure, technologies, and patterns.
2. Use \`@file\` syntax to cite specific files (e.g., \`@src/components/Button.tsx\`) when providing examples or referring to patterns.
3. Include both generic best practices relevant to the repository AND specific guidelines directly inferred from the analyzed code.
4. Organize the rules to reflect the actual structure and organization of the codebase.
5. Be concise and straight to the point, avoiding unnecessary explanations.
6. Ensure the output is in valid Markdown format, ready to be used as a .cursorrules file.

Include your final .cursorrules content inside <cursorrules> tags.

Example structure (replace with actual content):

<cursorrules>
# General Rules

- Rule 1
- Rule 2

# Frontend Rules

## Components
- Component rule 1
- Component rule 2

## Styling
- Styling rule 1
- Styling rule 2

# Backend Rules

## API
- API rule 1
- API rule 2

## Database
- Database rule 1
- Database rule 2
</cursorrules>

Now, proceed with your analysis and generation of the .cursorrules file.`;
    } else {
      // For subsequent chunks, enhance the existing summary
      userPrompt = `I want you to update the existing .cursorrules file based on the next repository chunk. I'll provide the current rules and the new content chunk.

Here is the current .cursorrules file content:

<current_rules>
${currentSummary}
</current_rules>

Now, carefully review the following new repository chunk:

<repository_chunk>
${chunk}
</repository_chunk>

And here are the guidelines for creating .cursorrules files:

<guidelines>
${guidelines}
</guidelines>

Before updating the rules, analyze this new repository chunk. In your analysis, consider the following:

1. Are there any new technologies, frameworks, or languages revealed in this chunk that weren't covered before?
2. Do you see any additional coding patterns, naming conventions, or architectural decisions not previously observed?
3. Does this chunk provide more insight into the overall structure of the codebase?
4. Are there any unique or project-specific practices in this chunk that should be reflected in the rules?

Present your analysis inside <new_insights> tags. If this chunk doesn't reveal any new insights, indicate that.

After completing your analysis, update the existing Cursor AI rules based on your findings. Follow these important instructions:

1. DO NOT lose or overwrite any information from the existing rules. The existing rules contain valuable insights that must be preserved.
2. Maintain the same structure, formatting, and organization as the current rules.
3. Add new information ONLY if this chunk reveals patterns or guidelines not already covered.
4. Use \`@file\` syntax to cite specific files (e.g., \`@src/components/Button.tsx\`) when providing examples or referring to new patterns.
5. Be specific about code structure, including new classes, objects, and patterns identified in this chunk.
6. If the new chunk doesn't provide any new insights, return the existing rules unchanged.

Use previously generated .cursorrules content as a starting point and example of the output format. Include your final .cursorrules content inside <cursorrules> tags.`;
    }

    process.stdout.write(`${pc.blue('🔄')} Sending to Claude... `);
    
    try {
      const startTime = Date.now();
      const response = await client.messages.create({
        model: 'claude-3-7-sonnet-latest',
        max_tokens: 8000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });
      const endTime = Date.now();
      const processingTime = ((endTime - startTime) / 1000).toFixed(2);
      
      process.stdout.write(pc.green('✓\n'));
      
      // Update the current summary (store full content during processing)
      currentSummary = response.content[0].text;
      
      // Save intermediate output to file in the specified directory
      const intermediateFileName = path.join(outputDir, `cursorrules_chunk_${i+1}_of_${chunks.length}.md`);
      await fs.writeFile(intermediateFileName, currentSummary);
      console.log(`${pc.green('✓')} Saved intermediate output to ${pc.blue(intermediateFileName)} ${pc.gray(`(${processingTime}s)`)}\n`);
    } catch (error) {
      process.stdout.write(pc.red('✗\n'));
      if (error instanceof Error) {
        throw new Error(`${pc.red('Error generating with Claude on chunk')} ${i+1}: ${error.message}`);
      }
      throw new Error(`${pc.red('Unknown error occurred while generating with Claude on chunk')} ${i+1}`);
    }
  }
  
  console.log(pc.green('\n┌─────────────────────────────────────────┐'));
  console.log(pc.green('│          PROCESSING COMPLETE            │'));
  console.log(pc.green('└─────────────────────────────────────────┘\n'));
  
  // Only extract the cursorrules content at the very end
  return extractCursorrules(currentSummary);
}

function generateMockResponse(repoContent: string): string {
  // Extract some information from the repo content for the mock response
  const repoLines = repoContent.split('\n');
  const repoName = repoLines.find(line => line.includes('# Project:'))?.replace('# Project:', '').trim() || 'Repository';
  
  return `# .cursorrules for ${repoName}

## Project Overview

This project appears to be a TypeScript/Node.js application that processes GitHub repositories.

## Coding Standards

- Follow TypeScript best practices with strict typing
- Use async/await for asynchronous operations
- Prefer functional programming patterns where appropriate
- Use descriptive variable and function names

## File Structure Guidelines

- Place core logic in the \`src/\` directory
- Organize code by feature or functionality
- Keep related functionality together
- Use index.ts files for clean exports

## Style Conventions

- Use camelCase for variables and functions
- Use PascalCase for classes and interfaces
- Use 2-space indentation
- End files with a newline

## Testing Standards

- Write unit tests for all functionality
- Use descriptive test names
- Follow AAA (Arrange-Act-Assert) pattern
- Mock external dependencies

## Error Handling

- Use try/catch blocks for error handling
- Provide descriptive error messages
- Handle edge cases appropriately
- Log errors with appropriate severity levels

## Comments and Documentation

- Document public APIs
- Add comments for complex logic
- Use JSDoc for function documentation
- Keep comments up-to-date with code changes

## Performance Considerations

- Optimize for speed and efficiency
- Use appropriate data structures
- Minimize unnecessary computations
- Consider memory usage for large operations

## Security Best Practices

- Validate all inputs
- Avoid hardcoded credentials
- Use proper error handling
- Follow secure coding practices`;
}