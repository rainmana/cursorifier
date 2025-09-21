# Cursorify

[![npm version](https://img.shields.io/npm/v/cursorify.svg)](https://www.npmjs.com/package/cursorify)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/cursorify.svg)](https://nodejs.org/)

**Supercharge your Cursor AI with codebase-specific intelligence.** Cursorify transforms your GitHub repositories into custom rules that teach Cursor AI how your project works, resulting in more accurate code suggestions, better refactoring, and contextually aware assistance. Now supports multiple LLM providers including Anthropic Claude, OpenAI, and local models like Ollama.

## Why Cursorify?

- ✅ **Instant Expertise**: Your AI assistant immediately understands your project conventions and architecture
- ✅ **Better Suggestions**: Get code completions that match your project's style and patterns
- ✅ **Fewer Hallucinations**: Rules constrain the AI to work within your codebase's patterns and dependencies
- ✅ **Zero Learning Curve**: One command to analyze your repo and generate optimized rules


## Features

- 🚀 Analyze GitHub repositories or local codebases with a single command
- 🧩 Intelligently extract project structure, conventions, and patterns
- 📚 Handles large codebases that exceed the token limit for LLMs
- 🤖 Generate tailored Cursor rules using multiple LLM providers
- 🔌 **Multi-Provider Support**: Anthropic Claude, OpenAI, Ollama, LM Studio, and more
- 🏠 **Local AI Support**: Use your own models with Ollama or LM Studio
- 📝 Create production-ready .rules.mdc files for immediate use
- 🔧 Customize analysis with flexible configuration options

## Installation

```bash
# Install globally
npm install -g cursorify

# Or use with npx (no installation required)
npx cursorify
```

## Prerequisites

- Node.js 18 or higher
- API key for your chosen provider (see Provider Setup below)

### Provider Setup

#### Anthropic Claude (Default)
```bash
export ANTHROPIC_API_KEY='your-anthropic-api-key'
```

#### OpenAI
```bash
export OPENAI_API_KEY='your-openai-api-key'
```

#### Local Models (Ollama, LM Studio, etc.)
No API key required! Just make sure your local service is running.

## Usage

The basic command structure is:

```bash
cursorify <repo-path>
```

Examples:

```bash
# Inside a repository (uses Anthropic Claude by default)
cursorify

# Using OpenAI
cursorify --provider openai --model gpt-4o

# Using local Ollama model
cursorify --provider local --model llama3.1 --base-url http://localhost:11434/v1

# Using local LM Studio
cursorify --provider local --model llama3.1 --base-url http://localhost:1234/v1

# Using local repository path
cursorify ./my-local-project/subdir

# Using GitHub URL
cursorify --remote https://github.com/fastapi/fastapi

# Cursorify with specific description as an option
cursorify --description "guidelines for extending the component using the base interface"

# Specify Cursor AI rule type
cursorify --rule-type "agent" --description "coding standards for React components"

# List available providers and models
cursorify --list-providers

# Use existing repomix output file
cursorify --repomix-file ./my-repo-output.txt

# Use repomix file with specific provider
cursorify --repomix-file ./output.txt --provider openai --model gpt-4o
```

This will:
1. Fetch the repository content
2. Based on the content, generate rules for Cursor AI
3. Save the output to a `<repo-name>.rules.mdc` file

### Options

```
Options:
  --provider <provider>    LLM provider to use (anthropic, openai, local) (default: anthropic)
  --model <model>          Specific model to use (overrides provider default)
  --api-key <key>          API key for the provider (or set environment variable)
  --base-url <url>         Base URL for the API (useful for local providers)
  --max-tokens <tokens>    Maximum tokens for response (default: 8000)
  --temperature <temp>     Temperature for generation (0-2, default: 0.7)
  --description <text>     Description of what should be rulefied
  --rule-type <type>       Type of rule to generate (auto, manual, agent, always)
  --chunk-size <size>      Chunk size for processing (default: 100000)
  --repomix-file <path>    Path to existing repomix output file (skips repomix execution)
  --list-providers         List available providers and their models
  -h, --help               display help for command
```

## Supported Providers

### Anthropic Claude (Default)
- **Models**: claude-3-5-sonnet, claude-3-5-haiku, claude-3-opus, claude-3-sonnet, claude-3-haiku
- **API Key**: `ANTHROPIC_API_KEY`
- **Best for**: High-quality code analysis and rule generation

### OpenAI
- **Models**: gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-4, gpt-3.5-turbo
- **API Key**: `OPENAI_API_KEY`
- **Best for**: Fast processing and cost-effective analysis

### Local Models (Ollama, LM Studio, etc.)
- **Models**: llama3.1, codellama, mistral, mixtral, phi3, gemma, qwen, and more
- **API Key**: Optional (`LOCAL_API_KEY`)
- **Best for**: Privacy, offline usage, and custom models

### Setting up Local Models

#### Ollama
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama3.1

# Run cursorify with Ollama
cursorify --provider local --model llama3.1
```

#### LM Studio
1. Download and install [LM Studio](https://lmstudio.ai/)
2. Load a model in LM Studio
3. Start the local server
4. Run cursorify with the LM Studio URL:
```bash
cursorify --provider local --model llama3.1 --base-url http://localhost:1234/v1
```

## Using Existing Repomix Files

If you already have a repomix output file, you can use it directly without running repomix again:

```bash
# Use existing repomix file
cursorify --repomix-file ./my-repo-output.txt

# Use with specific provider and model
cursorify --repomix-file ./output.txt --provider local --model llama3.1

# Use with custom description
cursorify --repomix-file ./output.txt --description "React component guidelines"
```

This is useful when:
- You want to reuse previously generated repomix output
- You have a custom repomix configuration
- You want to process the same repository with different LLM providers
- You want to avoid running repomix multiple times

`cursorify` supports [all options supported by `repomix`](https://github.com/yamadashy/repomix/tree/main?tab=readme-ov-file#-usage). For example, select specific files:

```bash
cursorify --include "src/**/*.ts" --compress
```

## Installing Rules in Cursor

After generating your rules file, you'll need to install it in Cursor:

1. Open Cursor editor
2. Go to Settings > AI > Rules
3. Click "Add Rules File" and select your generated `<filename>.rules.mdc` file
4. Restart Cursor to apply the new rules

For more detailed instructions, see the [official Cursor documentation](https://docs.cursor.com/context/rules-for-ai).

## Example Output

The generated `.rules.mdc` file will contain structured guidelines for Cursor AI when working with your codebase:

```markdown
# .cursorrules for my-project

## Project Overview
This project is a TypeScript application that...

## Coding Standards
- Follow TypeScript best practices with strict typing
- Use async/await for asynchronous operations
...

## File Structure Guidelines
- Place core logic in the `src/` directory
...
```

## Best Practices

### Minimize context length, cost and rate limits

If you encounter rate limits or ihigh costs, try to minimize the context length using the following ways:

- Use `rulefy --compress` to compress the context length
- Use `rulefy --include` to include only the files you need with globs
- Use `rulefy --exclude` to exclude the files you don't need with globs
- Control the size of the chunk being processed by one go by using the `--chunk-size` option. (default is `--chunk-size 100000`)


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


## Acknowledgements

This project is inspired by and builds upon the work of:

- [repomix](https://github.com/yamadashy/repomix) - A tool for converting repositories into textual representations
- [awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules) - A curated list of cursor rules for different projects and languages
- [cursor-custom-agents-rules-generator](https://github.com/bmadcode/cursor-custom-agents-rules-generator) - best practices for Cursor custom agents and rules generator

We're grateful to these projects for their contributions to the developer tooling ecosystem.

