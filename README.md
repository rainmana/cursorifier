# Rulefy

[![npm version](https://img.shields.io/npm/v/rulefy.svg)](https://www.npmjs.com/package/rulefy)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/rulefy.svg)](https://nodejs.org/)

**Supercharge your Cursor AI with codebase-specific intelligence.** Rulefy transforms your GitHub repositories into custom rules that teach Cursor AI how your project works, resulting in more accurate code suggestions, better refactoring, and contextually aware assistance.

## Why Rulefy?

- ✅ **Instant Expertise**: Your AI assistant immediately understands your project conventions and architecture
- ✅ **Better Suggestions**: Get code completions that match your project's style and patterns
- ✅ **Fewer Hallucinations**: Rules constrain the AI to work within your codebase's patterns and dependencies
- ✅ **Zero Learning Curve**: One command to analyze your repo and generate optimized rules


## Features

- 🚀 Analyze GitHub repositories or local codebases with a single command
- 🧩 Intelligently extract project structure, conventions, and patterns
- 📚 Handles large codebases that exceed the token limit for LLMs
- 🤖 Generate tailored Cursor rules using Claude AI
- 📝 Create production-ready .rules.mdc files for immediate use
- 🔧 Customize analysis with flexible configuration options

## Installation

```bash
# Install globally
npm install -g rulefy

# Or use with npx (no installation required)
npx rulefy
```

## Prerequisites

- Node.js 18 or higher
- ANTHROPIC_API_KEY environment variable set with your Anthropic API key

```bash
export ANTHROPIC_API_KEY='your-anthropic-api-key'
```

## Usage

The basic command structure is:

```bash
rulefy <repo-url-or-path>
```

Examples:

```bash
# Using GitHub URL
rulefy https://github.com/fastapi/fastapi

# Using local repository path
rulefy ./my-local-project
```

This will:
1. Fetch the repository content using repomix
2. Read the cursor rules guidelines
3. Generate cursor rules using Claude Sonnet 3.5
4. Save the output to a `<repo-name>.rules.mdc` file


## Installing Rules in Cursor

After generating your rules file, you'll need to install it in Cursor:

1. Open Cursor editor
2. Go to Settings > AI > Rules
3. Click "Add Rules File" and select your generated `.rules.mdc` file
4. Restart Cursor to apply the new rules

For more detailed instructions, see the [official Cursor documentation](https://docs.cursor.com/context/rules-for-ai).

### Options

```
Options:
  --provider <provider>  LLM provider to use (default: "claude-sonnet-3.5-latest")
  -o, --output <file>    Output file name (defaults to <repo-name>.rules.mdc)
  --guidelines <file>    Path to cursor rules guidelines file (default: "./cursorrules-guidelines.md")
  --include <patterns>   Include patterns for files (glob pattern, e.g., "**/*.py")
  -h, --help             display help for command
```

## How It Works

1. **Repository Conversion**: Uses repomix to convert GitHub repositories into a textual representation
2. **Guidelines Integration**: Reads cursor rules guidelines from the specified file
3. **LLM Generation**: Passes the repository content and guidelines to LLM with progressive summarization
4. **Output**: Saves the generated cursor rules to a markdown file

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


## Acknowledgements

This project is inspired by and builds upon the work of:

- [repomix](https://github.com/yamadashy/repomix) - A tool for converting repositories into textual representations
- [awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules) - A curated list of cursor rules for different projects and languages

We're grateful to these projects for their contributions to the developer tooling ecosystem.

