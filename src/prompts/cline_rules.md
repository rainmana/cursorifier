# Cline Rules Format and Best Practices

## File Format Structure

Cline rules use Markdown files with a `.clinerules` extension (single file) or organized in a `.clinerules/` directory with multiple files. The format focuses on project guidelines, standards, and patterns rather than AI behavior instructions.

## Single File Format (.clinerules)

Create a single `.clinerules` file in your project root:

```
your-project/
├── .clinerules          # Single rules file
├── src/
└── ...
```

## Folder Format (.clinerules/)

For complex projects, use a folder structure with organized files:

```
your-project/
├── .clinerules/              # Folder containing active rules
│   ├── 01-coding.md          # Core coding standards
│   ├── 02-documentation.md   # Documentation requirements
│   ├── 03-testing.md         # Testing standards
│   └── 04-architecture.md    # Architecture guidelines
├── src/
└── ...
```

## Rule Content Structure

### 1. Project Guidelines
Focus on project-specific standards and conventions:

```markdown
# Project Guidelines

## Documentation Requirements
- Update relevant documentation in /docs when modifying features
- Keep README.md in sync with new capabilities
- Maintain changelog entries in CHANGELOG.md

## Architecture Decision Records
Create ADRs in /docs/adr for:
- Major dependency changes
- Architectural pattern changes
- New integration patterns
- Database schema changes
Follow template in /docs/adr/template.md
```

### 2. Code Style & Patterns
Define coding standards and patterns:

```markdown
## Code Style & Patterns

- Generate API clients using OpenAPI Generator
- Use TypeScript axios template
- Place generated code in /src/generated
- Prefer composition over inheritance
- Use repository pattern for data access
- Follow error handling pattern in /src/utils/errors.ts
```

### 3. Testing Standards
Establish testing requirements:

```markdown
## Testing Standards

- Unit tests required for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Use Jest for unit tests, Playwright for E2E
- Maintain 80%+ code coverage
```

## Key Benefits

1. **Version Controlled**: The `.clinerules` file becomes part of your project's source code
2. **Team Consistency**: Ensures consistent behavior across all team members
3. **Project-Specific**: Rules and standards tailored to each project's needs
4. **Institutional Knowledge**: Maintains project standards and practices in code

## Best Practices for Writing Cline Rules

### Content Guidelines
- **Be Clear and Concise**: Use simple language and avoid ambiguity
- **Focus on Desired Outcomes**: Describe the results you want, not the specific steps
- **Project-Specific**: Tailor rules to your specific tech stack and patterns
- **Actionable**: Provide clear, actionable guidelines

### Organization Tips
- **Use descriptive filenames** that clearly indicate the rule's purpose
- **Group related rules** in the same file
- **Use numeric prefixes** (01-, 02-, etc.) for logical ordering
- **Keep individual files focused** on specific concerns

### Example Rule Categories

#### 01-coding.md
```markdown
# Coding Standards

## Language-Specific Rules
- Use TypeScript strict mode
- Prefer const over let, avoid var
- Use meaningful variable names
- Follow ESLint configuration

## Code Organization
- One component per file
- Use barrel exports (index.ts)
- Group related functions together
- Keep functions under 50 lines
```

#### 02-documentation.md
```markdown
# Documentation Requirements

## Code Documentation
- JSDoc comments for all public functions
- README updates for new features
- API documentation in OpenAPI format
- Architecture diagrams in /docs/diagrams

## Commit Messages
- Use conventional commits format
- Include issue numbers when applicable
- Keep subject line under 50 characters
```

#### 03-testing.md
```markdown
# Testing Standards

## Test Structure
- Arrange-Act-Assert pattern
- Descriptive test names
- One assertion per test
- Mock external dependencies

## Coverage Requirements
- Unit tests for business logic
- Integration tests for APIs
- E2E tests for user flows
- Minimum 80% code coverage
```

## File Management

### Using a Rules Bank
For projects with multiple contexts or teams:

```
your-project/
├── .clinerules/              # Active rules - automatically applied
│   ├── 01-coding.md
│   └── client-a.md
│
├── clinerules-bank/          # Repository of available but inactive rules
│   ├── clients/              # Client-specific rule sets
│   │   ├── client-a.md
│   │   └── client-b.md
│   ├── frameworks/           # Framework-specific rules
│   │   ├── react.md
│   │   └── vue.md
│   └── project-types/        # Project type standards
│       ├── api-service.md
│       └── frontend-app.md
└── ...
```

### Switching Contexts
```bash
# Switch to Client B project
rm .clinerules/client-a.md
cp clinerules-bank/clients/client-b.md .clinerules/

# Frontend React project
cp clinerules-bank/frameworks/react.md .clinerules/
```

## Implementation Tips

- **Test and Iterate**: Experiment to find what works best for your workflow
- **Team Collaboration**: Share rules with team members for consistency
- **Regular Updates**: Keep rules current with project evolution
- **Context Switching**: Use the folder system for different project contexts
- **Git Integration**: Track rules in version control for team consistency

By following these formats and best practices, you can create effective Cline rules that enhance your development workflow while maintaining project standards and team consistency 🚀
