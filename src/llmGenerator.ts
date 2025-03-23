import Anthropic from '@anthropic-ai/sdk';
import { getEncoding, encodingForModel } from 'js-tiktoken';
import fs from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';

// Environment variables for chunk configuration, with defaults
const CHUNK_SIZE = Number(process.env.CHUNK_SIZE || '100000');
const CHUNK_OVERLAP = Number(process.env.CHUNK_OVERLAP || '50000');

export async function generateWithLLM(
  repoContent: string,
  guidelines: string,
  provider: string,
  outputDir: string = '.'
): Promise<string> {
  // Currently only supporting Claude Sonnet 3.5
  if (provider !== 'claude-sonnet-3.5-latest') {
    throw new Error(`Provider ${provider} is not supported. Currently only claude-sonnet-3.5-latest is supported.`);
  }
  
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

/**
 * Format token count with commas and color based on size
 */
function formatTokenCount(count: number): string {
  const formatted = count.toLocaleString();
  if (count < 50000) return chalk.green(formatted);
  if (count < 100000) return chalk.yellow(formatted);
  return chalk.red(formatted);
}

/**
 * Split text into chunks based on token count
 */
function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  console.log(chalk.cyan.bold('\n┌─────────────────────────────────────────┐'));
  console.log(chalk.cyan.bold('│           CONTENT CHUNKING               │'));
  console.log(chalk.cyan.bold('└─────────────────────────────────────────┘\n'));
  
  // Get tokenizer for the model (cl100k_base is closest to Claude's tokenizer)
  const encoding = getEncoding('cl100k_base');
  
  const tokens = encoding.encode(text);
  const totalTokens = tokens.length;
  const chunks: string[] = [];
  
  console.log(`${chalk.blue('●')} Document size: ${formatTokenCount(totalTokens)} tokens`);
  console.log(`${chalk.blue('●')} Chunk size: ${formatTokenCount(chunkSize)} tokens`);
  console.log(`${chalk.blue('●')} Chunk overlap: ${formatTokenCount(overlap)} tokens\n`);
  
  console.log(chalk.cyan('Chunking document...'));
  
  let i = 0;
  while (i < tokens.length) {
    // Get the current chunk of tokens
    const chunkTokens = tokens.slice(i, Math.min(i + chunkSize, tokens.length));
    const chunk = encoding.decode(chunkTokens);
    chunks.push(chunk);
    
    // Show chunking progress
    const progress = Math.min(i + chunkSize, tokens.length) / tokens.length;
    process.stdout.write(`\r${chalk.cyan('Progress:')} ${progressBar(progress, 1)}`);
    
    // Move forward, accounting for overlap
    i += chunkSize - overlap;
    if (i >= tokens.length) break;
    
    // Ensure we don't go backward if overlap is too large
    i = Math.max(i, 0);
  }
  
  process.stdout.write('\n\n');
  console.log(chalk.green(`✓ Chunking complete! Created ${chunks.length} chunks\n`));
  
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
  console.log(chalk.cyan.bold('┌─────────────────────────────────────────┐'));
  console.log(chalk.cyan.bold('│          CHUNK INFORMATION              │'));
  console.log(chalk.cyan.bold('└─────────────────────────────────────────┘\n'));
  
  // Fixed table width columns
  const chunkColWidth = 10;      // Width of "Chunk" column
  const tokenColWidth = 16;      // Width of "Token Count" column
  const sizeColWidth = 29;      // Width of "Size" column
  
  // Calculate total width for consistent borders
  const totalWidth = chunkColWidth + tokenColWidth + sizeColWidth + 4; // +4 for the vertical bars
  
  // Create consistent table borders and headers
  console.log(chalk.cyan(`┌${'─'.repeat(chunkColWidth)}┬${'─'.repeat(tokenColWidth)}┬${'─'.repeat(sizeColWidth)}┐`));
  console.log(chalk.cyan(`│ ${'Chunk'.padEnd(chunkColWidth-2)} │ ${'Token Count'.padEnd(tokenColWidth-2)} │ ${'Size'.padEnd(sizeColWidth-2)} │`));
  console.log(chalk.cyan(`├${'─'.repeat(chunkColWidth)}┼${'─'.repeat(tokenColWidth)}┼${'─'.repeat(sizeColWidth)}┤`));
  
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
    
    console.log(chalk.cyan(`│ ${chunkCol} │ ${tokenCol} │ ${sizeCol} │`));
  });
  
  console.log(chalk.cyan(`└${'─'.repeat(chunkColWidth)}┴${'─'.repeat(tokenColWidth)}┴${'─'.repeat(sizeColWidth)}┘\n`));
  
  let currentSummary = ''; // This will store our progressively built summary
  
  // Process each chunk progressively
  console.log(chalk.cyan.bold('┌─────────────────────────────────────────┐'));
  console.log(chalk.cyan.bold('│          PROCESSING CHUNKS              │'));
  console.log(chalk.cyan.bold('└─────────────────────────────────────────┘\n'));
  
  for (let i = 0; i < chunks.length; i++) {
    const chunkDisplay = `[${i+1}/${chunks.length}]`;
    console.log(`${chalk.yellow('⟳')} Processing chunk ${chalk.yellow(chunkDisplay)} ${progressBar(i+1, chunks.length)}`);
    
    const chunk = chunks[i];
    const isFirstChunk = i === 0;
    
    const systemPrompt = `You are an expert at analyzing repositories and creating concise, effective Cursor AI rules based on repository contents. 
Your task is to generate a .cursorrules file for the given repository based on the provided guidelines.`;
    
    let userPrompt;
    
    if (isFirstChunk) {
      // For the first chunk, start creating the rules
      userPrompt = `I want you to create a .cursorrules file for a repository. I'll provide the content in chunks.

## First Repository Content Chunk:
${chunk}

## Guidelines for Creating .cursorrules Files:
${guidelines}

Please generate initial cursor rules for this repository, following the guidelines provided.
Focus on creating rules that are specific to this repository's structure, technologies, and patterns.
Make sure the output is in valid Markdown format and ready to be used as a .cursorrules file.
Ensure your response contains ONLY the initial .cursorrules content, with no introductory text, explanations, or markdown formatting tags like \`\`\`markdown at the beginning or end of your response - just the text that can be used directly in a .cursorrules file.`;
    } else {
      // For subsequent chunks, enhance the existing summary
      userPrompt = `Analyze the next repository content chunk and update the existing .cursorrules file.

## Existing Cursor Rules:
${currentSummary}

## Next Repository Content Chunk:
${chunk}

## Guidelines for Creating .cursorrules Files:
${guidelines}

IMPORTANT INSTRUCTIONS:
- Your response should be the complete, updated .cursorrules file.
- Preserve all existing sections and content from the current rules.
- Only add new information if the new chunk reveals patterns or guidelines not already covered.
- If the new chunk doesn't provide any new insights, return the existing rules unchanged.
- Maintain the same structure, formatting, and organization of the existing rules.
- Do not include any explanatory text, meta-commentary, or markdown formatting tags in your response. Avoid phrases like "Here is the updated file:", "Based on the analyzed content...", or any other first-person commentary. Provide only the raw content that would go directly into a .cursorrules file.
`;
    }

    process.stdout.write(`${chalk.blue('🔄')} Sending to Claude... `);
    
    try {
      const startTime = Date.now();
      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 4000,
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
      
      process.stdout.write(chalk.green('✓\n'));
      
      // Extract the response text
      const content = response.content[0].text;
      
      // Update the current summary
      currentSummary = isFirstChunk ? content : content;
      
      // Save intermediate output to file in the specified directory
      const intermediateFileName = path.join(outputDir, `cursorrules_chunk_${i+1}_of_${chunks.length}.md`);
      await fs.writeFile(intermediateFileName, currentSummary);
      console.log(`${chalk.green('✓')} Saved intermediate output to ${chalk.blue(intermediateFileName)} ${chalk.gray(`(${processingTime}s)`)}\n`);
    } catch (error) {
      process.stdout.write(chalk.red('✗\n'));
      if (error instanceof Error) {
        throw new Error(`${chalk.red('Error generating with Claude on chunk')} ${i+1}: ${error.message}`);
      }
      throw new Error(`${chalk.red('Unknown error occurred while generating with Claude on chunk')} ${i+1}`);
    }
  }
  
  console.log(chalk.green.bold('\n┌─────────────────────────────────────────┐'));
  console.log(chalk.green.bold('│          PROCESSING COMPLETE            │'));
  console.log(chalk.green.bold('└─────────────────────────────────────────┘\n'));
  
  return currentSummary;
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