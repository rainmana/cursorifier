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
  outputDir: string = '.',
  description?: string,
  ruleType?: string
): Promise<string> {
  // If this is a test run with dummy API key, just return a mock response
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey === 'dummy-key') {
    console.log('Using mock response for testing');
    return generateMockResponse(repoContent);
  }
  
  return await generateWithClaude(repoContent, guidelines, outputDir, description, ruleType);
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

async function generateWithClaude(repoContent: string, guidelines: string, outputDir: string = '.', description?: string, ruleType?: string): Promise<string> {
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
    
    const systemPrompt = 'You are an expert AI system designed to analyze code repositories and generate Cursor AI rules. Your task is to create a .cursorrules file based on the provided repository content and guidelines.';
    
    let userPrompt;
    
    if (isFirstChunk) {
      // For the first chunk, start creating the rules
      userPrompt = `I need your help to create a Cursor rule (.cursorrules) file for my project. Please follow this process:

1. First, carefully read and understand this codebase chunk:

<repository_chunk>
${chunk}
</repository_chunk>

2. Now, review these guidelines for creating effective Cursor rules:

<guidelines>
${guidelines}
</guidelines>

${description ? `3. I specifically want to create rules for: "${description}"` : ''}
${ruleType ? `4. The rule type should be: "${ruleType}"` : ''}

${description || ruleType ? '5' : '3'}. Analyze the repository content and structure, considering:
   - Main technologies, frameworks, and languages used
   - Coding patterns, naming conventions, and architectural decisions
   - Overall codebase structure including key directories and file types
   - Project-specific practices and testing guidelines
   - Guidelines and standards documented in comments or markdown files by developers

Present your analysis inside <repository_analysis> tags.

${description || ruleType ? '6' : '4'}. Create a complete .cursorrules file that:
   - Is specific to this repository's structure and technologies
   - Includes best practices and guidelines from code, comments, and documentation
   - Organizes rules to match the codebase structure
   - Is concise and actionable
   - Includes testing best practices and guidelines
   - Uses valid Markdown format${ruleType ? `
   - Follows the rule type: "${ruleType}"` : ''}${description ? `
   - Addresses the specific request: "${description}"` : ''}

Include your final .cursorrules content inside <cursorrules> tags.

Example structure:

<cursorrules>
...markdown content of the .cursorrules file, following the guidelines and analysis...
</cursorrules>`;
    } else {
      // For subsequent chunks, enhance the existing summary
      userPrompt = `I need your help to update a Cursor rule (.cursorrules) file based on a new chunk of my project:

1. Here is the current .cursorrules file content:

<current_rules>
${currentSummary}
</current_rules>

2. Now, carefully review this new repository chunk:

<repository_chunk>
${chunk}
</repository_chunk>

3. Review these guidelines for creating effective Cursor rules:

<guidelines>
${guidelines}
</guidelines>

${description ? `4. Remember, I specifically want to create rules for: "${description}"` : ''}
${ruleType ? `${description ? '5' : '4'}. The rule type should be: "${ruleType}"` : ''}

${description || ruleType ? (description && ruleType ? '6' : '5') : '4'}. Analyze this new chunk for:
   - New technologies, frameworks, or languages not previously covered
   - Additional coding patterns, naming conventions, or architectural decisions
   - Further insights into codebase structure
   - Project-specific practices and testing guidelines
   - Guidelines and standards documented in comments or markdown files by developers

Present your analysis inside <new_insights> tags.

${description || ruleType ? (description && ruleType ? '7' : '6') : '5'}. Update the existing rules by:
   - Preserving all valuable information from existing rules
   - Maintaining the same structure and organization
   - Adding new information only for patterns not already covered
   - Being specific about code structure and patterns
   - Including testing-related insights and best practices
   - Being concise but comprehensive${ruleType ? `
   - Following the rule type: "${ruleType}"` : ''}${description ? `
   - Addressing the specific request: "${description}"` : ''}

Include your final updated .cursorrules content inside <cursorrules> tags.`;
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