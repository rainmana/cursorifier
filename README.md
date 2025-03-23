# Rulefy

[![npm version](https://img.shields.io/npm/v/rulefy.svg)](https://www.npmjs.com/package/rulefy)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/rulefy.svg)](https://nodejs.org/)

Rulefy is a Node.js tool that transforms GitHub repositories into [Cursor](https://cursor.sh/) rules instructions in a markdown file. It leverages [repomix](https://github.com/yamadashy/repomix) for repository-to-text conversion and integrates with cursor rules guidelines to guide LLM generation.

## Features

- 🚀 Analyze GitHub repositories or local codebases
- 🧩 Convert codebase structure to LLM-friendly format
- 🤖 Generate tailored Cursor rules using Claude AI
- 📝 Create customized .rules.mdc files for Cursor editor
- 🔧 Easily configurable through CLI options

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

# Using GitHub shorthand
rulefy fastapi/fastapi

# Using local repository path
rulefy ./my-local-project
```

This will:
1. Fetch the repository content using repomix
2. Read the cursor rules guidelines
3. Generate cursor rules using Claude Sonnet 3.5
4. Save the output to a `<repo-name>.rules.mdc` file

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
3. **LLM Generation**: Passes the repository content and guidelines to Claude Sonnet 3.5
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

## License

MIT