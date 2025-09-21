# Changelog

All notable changes to this project will be documented in this file.

## [0.1.4] - 2025-01-21

### Added
- 🔌 **Multi-Provider LLM Support**: Added support for Anthropic Claude, OpenAI, and local models (Ollama, LM Studio)
- 🏠 **Local AI Integration**: Use your own models with Ollama or LM Studio
- 📁 **Repomix File Support**: Added `--repomix-file` option to use existing repomix output files
- ⚙️ **Enhanced Configuration**: Added `--model`, `--api-key`, `--base-url`, `--max-tokens`, `--temperature` options
- 🎯 **Better Error Handling**: Improved error messages and validation
- 📋 **Provider Listing**: Added `--list-providers` option to show available providers and models
- 🤖 **Cline Rules Support**: Added `--output-format cline` option to generate `.clinerules` files for Cline AI assistant
- 📝 **Dual Format Support**: Generate both Cursor AI (`.rules.mdc`) and Cline (`.clinerules`) formats

### Changed
- 🏷️ **Project Renamed**: Renamed from `rulefy` to `cursorifier` to avoid conflicts
- 📦 **Binary Renamed**: Command changed from `rulefy` to `cursorifier`
- 🔧 **Enhanced CLI**: More granular control over LLM parameters

### Technical Details
- Added provider interface system for extensible LLM support
- Implemented Anthropic, OpenAI, and Local providers
- Added comprehensive error handling and validation
- Maintained backward compatibility with existing functionality

### Credits
This is a fork of the original [rulefy](https://github.com/niklub/rulefy) project by [niklub](https://github.com/niklub), enhanced with multi-provider LLM support and additional features.