# Cursorifier

<div align="center">

[![npm version](https://img.shields.io/npm/v/cursorifier.svg?style=for-the-badge)](https://www.npmjs.com/package/cursorifier)
[![npm downloads](https://img.shields.io/npm/dm/cursorifier.svg?style=for-the-badge)](https://www.npmjs.com/package/cursorifier)
[![GitHub stars](https://img.shields.io/github/stars/rainmana/cursorifier.svg?style=for-the-badge&label=Stars)](https://github.com/rainmana/cursorifier)
[![GitHub forks](https://img.shields.io/github/forks/rainmana/cursorifier.svg?style=for-the-badge&label=Forks)](https://github.com/rainmana/cursorifier)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/cursorifier.svg?style=for-the-badge)](https://nodejs.org/)

[![GitHub stars over time](https://starchart.cc/rainmana/cursorifier.svg)](https://starchart.cc/rainmana/cursorifier)

</div>

**Supercharge your Cursor AI with codebase-specific intelligence.** Cursorifier transforms your GitHub repositories into custom rules that teach Cursor AI how your project works, resulting in more accurate code suggestions, better refactoring, and contextually aware assistance. Now supports multiple LLM providers including Anthropic Claude, OpenAI, and local models like Ollama.

## Why Cursorifier?

- ✅ **Instant Expertise**: Your AI assistant immediately understands your project conventions and architecture
- ✅ **Better Suggestions**: Get code completions that match your project's style and patterns
- ✅ **Fewer Hallucinations**: Rules constrain the AI to work within your codebase's patterns and dependencies
- ✅ **Zero Learning Curve**: One command to analyze your repo and generate optimized rules


## Features

- 🚀 Analyze GitHub repositories or local codebases with a single command
- 🧩 Intelligently extract project structure, conventions, and patterns
- 📚 Handles large codebases that exceed the token limit for LLMs
- 🤖 Generate tailored rules for both **Cursor AI** and **Cline** using multiple LLM providers
- 🔌 **Multi-Provider Support**: Anthropic Claude, OpenAI, Ollama, LM Studio, and more
- 🏠 **Local AI Support**: Use your own models with Ollama or LM Studio
- 📝 Create production-ready `.rules.mdc` files for Cursor AI
- 📋 Create `.clinerules` files for Cline AI assistant
- 🔧 Customize analysis with flexible configuration options

## 🚀 Installation

### Quick Install (Recommended)

```bash
# Install globally from npm
npm install -g cursorifier

# Or use with npx (no installation required)
npx cursorifier
```

### Alternative Installation Methods

```bash
# Install from GitHub (latest development version)
npm install -g https://github.com/rainmana/cursorifier.git

# Or clone and install locally
git clone https://github.com/rainmana/cursorifier.git
cd cursorifier
npm install
npm link
```

### Verify Installation

```bash
cursorifier --version
cursorifier --list-providers
```

📦 **Available on [npmjs.com](https://www.npmjs.com/package/cursorifier)**

## 🎬 Quick Demo

```bash
# Generate rules for any GitHub repository
cursorifier https://github.com/facebook/react

# Use with local models (Ollama)
cursorifier . --provider local --base-url http://localhost:11434 --model llama2

# Use existing repomix output
cursorifier --repomix-file ./my-repo-analysis.xml
```

## 🎯 Output Formats

Cursorifier supports two AI assistant formats:

### **Cursor AI Rules** (Default)
```bash
# Generate Cursor AI rules
cursorifier https://github.com/facebook/react
# Output: react-output/react.rules.mdc
```

**Features:**
- `.rules.mdc` file format with FrontMatter
- AI behavior instructions and patterns
- Glob patterns for file targeting
- Always/Manual/Auto rule types

### **Cline Rules**
```bash
# Generate Cline rules
cursorifier https://github.com/facebook/react --output-format cline
# Output: react-output/.clinerules
```

**Features:**
- `.clinerules` file format
- Project guidelines and coding standards
- Team consistency and best practices
- Focus on development workflow

### **Roo Custom Modes**
```bash
# Generate Roo Custom Modes
cursorifier https://github.com/facebook/react --output-format roo
# Output: react-output/.roomodes
```

**Features:**
- `.roomodes` YAML configuration file
- Specialized AI personas for different tasks
- Tool access permissions and file restrictions
- Custom behavioral instructions
- Mode-specific expertise and capabilities

## 🛡️ Reliability Features

### **Automatic Rate Limit Handling**
- **Smart Retries**: Automatically retries on rate limits with exponential backoff (2s, 4s, 8s)
- **Configurable Delays**: Control chunk processing speed with `--chunk-delay`
- **Progress Tracking**: Clear feedback on retry attempts and delays

### **Robust Text Processing**
- **Token Sanitization**: Automatically removes problematic tokens like `<|endoftext|>`
- **Large Repository Support**: Handles repositories with millions of tokens
- **Chunk Processing**: Breaks large repositories into manageable chunks

### **Environment Variable Support**
- **Seamless Integration**: Automatically picks up API keys from environment variables
- **Multiple Providers**: Supports `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `LOCAL_API_KEY`
- **Fallback Logic**: CLI options override environment variables when provided

## ✨ What Makes Cursorifier Special?

<table>
<tr>
<td width="50%">

### 🧠 **Intelligent Analysis**
- Analyzes your entire codebase structure
- Identifies patterns, conventions, and architecture
- Understands your project's unique characteristics

</td>
<td width="50%">

### 🚀 **Multi-Provider Support**
- **Anthropic Claude** - Most intelligent analysis
- **OpenAI GPT** - Fast and reliable
- **Local Models** - Privacy-focused with Ollama/LM Studio

</td>
</tr>
<tr>
<td width="50%">

### 📊 **Smart Chunking**
- Handles repositories of any size
- Intelligent content segmentation
- Optimized for LLM token limits

</td>
<td width="50%">

### 🎯 **Multi-Format Support**
- **Cursor AI Rules** - `.rules.mdc` files for Cursor
- **Cline Rules** - `.clinerules` files for Cline
- **Roo Custom Modes** - `.roomodes` YAML for Roo

</td>
</tr>
</table>

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
cursorifier <repo-path>
```

Examples:

```bash
# Inside a repository (uses Anthropic Claude by default)
cursorifier

# Using OpenAI
cursorifier --provider openai --model gpt-4o

# Using local Ollama model
cursorifier --provider local --model llama3.1 --base-url http://localhost:11434/v1

# Using local LM Studio
cursorifier --provider local --model llama3.1 --base-url http://localhost:1234/v1

# Using local repository path
cursorifier ./my-local-project/subdir

# Using GitHub URL
cursorifier --remote https://github.com/fastapi/fastapi

# Cursorifier with specific description as an option
cursorifier --description "guidelines for extending the component using the base interface"

# Specify Cursor AI rule type
cursorifier --rule-type "agent" --description "coding standards for React components"

# Generate Cline rules (for Cline AI assistant)
cursorifier --output-format cline

# Generate Cline rules with specific description
cursorifier --output-format cline --description "React project guidelines and coding standards"

# Generate Cline rules using local model
cursorifier --output-format cline --provider local --model llama3.1 --base-url http://localhost:11434/v1

# Generate Roo Custom Modes
cursorifier --output-format roo

# Generate Roo Custom Modes with specific description
cursorifier --output-format roo --description "TypeScript development with AI integration"

# Generate Roo Custom Modes using OpenAI
cursorifier --output-format roo --provider openai --model gpt-4o

# Generate using AWS Bedrock
cursorifier --provider bedrock --model anthropic.claude-3-sonnet-20240229-v1:0

# Generate using AWS Bedrock with specific profile and region
cursorifier --provider bedrock --aws-profile myprofile --aws-region us-west-2

# List available providers and models
cursorifier --list-providers

# Use existing repomix output file
cursorifier --repomix-file ./my-repo-output.txt

# Use repomix file with specific provider
cursorifier --repomix-file ./output.txt --provider openai --model gpt-4o

# Handle rate limiting with custom delays
cursorifier . --chunk-delay 10000  # 10 second delays between chunks

# Process large repository with smaller chunks and longer delays
cursorifier . --chunk-size 50000 --chunk-delay 8000
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
  --output-format <format> Output format for rules (cursor, cline, roo) (default: cursor)
  --chunk-size <size>      Chunk size for processing (default: 100000)
  --chunk-delay <ms>       Delay between chunks in milliseconds to avoid rate limits (default: 5000)
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

### AWS Bedrock
- **Models**: Claude 3 (Haiku, Sonnet, Opus), Titan, Llama 2, Mistral, Cohere
- **API Key**: AWS credentials (via profile, environment, or IAM role)
- **Best for**: Enterprise AWS environments, cost-effective access to multiple model providers

## 📊 Provider Comparison

| Feature | Anthropic Claude | OpenAI | Local Models | AWS Bedrock |
|---------|------------------|--------|--------------|-------------|
| **Quality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Speed** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Cost** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Privacy** | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Offline** | ❌ | ❌ | ✅ | ❌ |
| **Custom Models** | ❌ | ❌ | ✅ | ❌ |
| **Enterprise** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🎯 Use Cases

<div align="center">

| **Use Case** | **Recommended Provider** | **Why** |
|--------------|-------------------------|---------|
| 🏢 **Enterprise Projects** | AWS Bedrock | Enterprise-grade security and compliance |
| 🧠 **Complex Analysis** | Anthropic Claude | Best code understanding and analysis |
| 🚀 **Rapid Prototyping** | OpenAI | Fast and cost-effective |
| 🔒 **Sensitive Codebases** | Local Models | Complete privacy and control |
| 🎓 **Learning Projects** | Local Models | Free and educational |
| ☁️ **AWS Environments** | AWS Bedrock | Native AWS integration and billing |

</div>

### Setting up AWS Bedrock

#### Prerequisites
1. **AWS Account**: You need an active AWS account
2. **Bedrock Access**: Request access to Bedrock foundation models in your AWS console
3. **AWS Credentials**: Configure your AWS credentials

#### AWS Credentials Setup
```bash
# Option 1: AWS CLI configuration
aws configure

# Option 2: Environment variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1

# Option 3: AWS Profile
export AWS_PROFILE=your_profile_name
```

#### Usage Examples
```bash
# Use default AWS credentials and region
cursorifier . --provider bedrock

# Specify AWS profile and region
cursorifier . --provider bedrock --aws-profile myprofile --aws-region us-west-2

# Use specific Bedrock model
cursorifier . --provider bedrock --model anthropic.claude-3-sonnet-20240229-v1:0
```

### Setting up Local Models

#### Ollama
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama3.1

# Run cursorifier with Ollama
cursorifier --provider local --model llama3.1
```

#### LM Studio
1. Download and install [LM Studio](https://lmstudio.ai/)
2. Load a model in LM Studio
3. Start the local server
4. Run cursorifier with the LM Studio URL:
```bash
cursorifier --provider local --model llama3.1 --base-url http://localhost:1234/v1
```

## Using Existing Repomix Files

If you already have a repomix output file, you can use it directly without running repomix again:

```bash
# Use existing repomix file
cursorifier --repomix-file ./my-repo-output.txt

# Use with specific provider and model
cursorifier --repomix-file ./output.txt --provider local --model llama3.1

# Use with custom description
cursorifier --repomix-file ./output.txt --description "React component guidelines"
```

This is useful when:
- You want to reuse previously generated repomix output
- You have a custom repomix configuration
- You want to process the same repository with different LLM providers
- You want to avoid running repomix multiple times

`cursorifier` supports [all options supported by `repomix`](https://github.com/yamadashy/repomix/tree/main?tab=readme-ov-file#-usage). For example, select specific files:

```bash
cursorifier --include "src/**/*.ts" --compress
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

If you encounter rate limits or high costs, try to minimize the context length using the following ways:

- Use `--chunk-size` to process smaller chunks (e.g., `--chunk-size 50000`)
- Use `--chunk-delay` to add delays between chunks (e.g., `--chunk-delay 10000`)
- Cursorifier automatically retries on rate limits with exponential backoff
- Use `--repomix-file` to reuse existing repository analysis
- Use `repomix --include` to include only the files you need with globs
- Use `repomix --exclude` to exclude the files you don't need with globs
- Control the size of the chunk being processed by one go by using the `--chunk-size` option. (default is `--chunk-size 100000`)


## Fork Information

**Cursorifier** is a fork of the original [rulefy](https://github.com/niklub/rulefy) project by [niklub](https://github.com/niklub), enhanced with additional features:

### New Features Added
- 🔌 **Multi-Provider LLM Support**: Anthropic Claude, OpenAI, and local models (Ollama, LM Studio)
- 🏠 **Local AI Integration**: Use your own models with Ollama or LM Studio
- 📁 **Repomix File Support**: Use existing repomix output files
- ⚙️ **Enhanced Configuration**: More granular control over LLM parameters
- 🎯 **Better Error Handling**: Improved error messages and validation

### Original Project Credits
This project is based on the excellent work of [niklub](https://github.com/niklub) and their original [rulefy](https://github.com/niklub/rulefy) project. We're grateful for their foundational work that made this enhanced version possible.

## 🤝 Contributing

We love contributions! Here's how you can help:

- 🐛 **Report bugs** - Found an issue? Open a [GitHub Issue](https://github.com/rainmana/cursorifier/issues)
- 💡 **Suggest features** - Have an idea? We'd love to hear it!
- 🔧 **Submit PRs** - Fix bugs or add features
- 📖 **Improve docs** - Help others learn how to use Cursorifier

### Development Setup

```bash
git clone https://github.com/rainmana/cursorifier.git
cd cursorifier
npm install
npm run build
npm link
```

## 📈 Stats & Analytics

<div align="center">

[![GitHub commit activity](https://img.shields.io/github/commit-activity/m/rainmana/cursorifier?style=for-the-badge)](https://github.com/rainmana/cursorifier)
[![GitHub last commit](https://img.shields.io/github/last-commit/rainmana/cursorifier?style=for-the-badge)](https://github.com/rainmana/cursorifier)
[![GitHub issues](https://img.shields.io/github/issues/rainmana/cursorifier?style=for-the-badge)](https://github.com/rainmana/cursorifier/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/rainmana/cursorifier?style=for-the-badge)](https://github.com/rainmana/cursorifier/pulls)

</div>

## 🏆 Acknowledgements

This project is inspired by and builds upon the work of:

- [rulefy](https://github.com/niklub/rulefy) - Original project by niklub (forked and enhanced)
- [repomix](https://github.com/yamadashy/repomix) - A tool for converting repositories into textual representations
- [awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules) - A curated list of cursor rules for different projects and languages
- [cursor-custom-agents-rules-generator](https://github.com/bmadcode/cursor-custom-agents-rules-generator) - best practices for Cursor custom agents and rules generator

We're grateful to these projects for their contributions to the developer tooling ecosystem.

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

[![GitHub stars](https://img.shields.io/github/stars/rainmana/cursorifier?style=social)](https://github.com/rainmana/cursorifier)

Made with ❤️ by [rainmana](https://github.com/rainmana)

</div>

