# Cursor AI Rules Format (.mdc) and Best Practices

## File Format Structure

Cursor rules use Markdown files with a .mdc extension and must follow a specific structure:

1. FrontMatter Section (YAML format at the top of the file)


  ```mdc
  ---
  description: Comprehensive description that provides full context and clearly indicates when this rule should be applied. Include key scenarios, impacted areas, and why following this rule is important. While being thorough, remain focused and relevant. The description should be detailed enough that the agent can confidently determine whether to apply the rule in any given situation.
  globs: Glob pattern for the files that should be checked and applied by the rule. For example: `src/**/*.{js,ts,jsx,tsx}` OR blank (if the rule should be applied to all files)
  alwaysApply: `true` (if always applied) or `false` (if the rule should be applied only when certain conditions are met, like file patterns or manually selected)
  ---
  ```

2. Rule Body Section (Markdown format):

  ```mdc
  # Rule Title

  ## Critical Rules

  - Concise, bulleted list of actionable rules the agent MUST follow

  3. Examples Section (demonstrating valid and invalid usages)

  ```mdc
  ## Examples

  <example>
  {valid rule application}
  </example>

  <example type="invalid">
  {invalid rule application}
  </example>
  ```

3. Example Format:

  ```mdc
  <example>
  ```

4. File and Path References in Rules

Optionally, you can reference files and folders using the mdc: hyperlink format. This creates clickable links that help the AI access file content and understand context by referencing existing code.

**Syntax:** `[link text](mdc:path/to/file.ext)`
**Example:** 
  ```mdc
  [factories.py](mdc:server/users/tests/factories.py)
  ```

## Example of The Complete Rule File

  ```mdc
  ---
  description: "This rule should be applied when extending or testing the user authentication module. It ensures consistent implementation of security practices and proper test coverage."
  globs: "src/auth/**/*.{js,ts,jsx,tsx}"
  alwaysApply: false
  ---

  # User Authentication Module Extension Rules

  ## Critical Rules

  - All authentication functions MUST validate input parameters before processing
  - Password handling MUST use the established hashing utilities in `src/auth/utils/hash.js`
  - JWT token generation MUST use the approved signing methods with proper expiration
  - All new authentication endpoints MUST implement rate limiting
  - Test coverage MUST include happy path, error cases, and security edge cases
  - Mock external dependencies when testing to ensure unit test isolation

  ## Examples

  <example>
  // VALID: Proper password handling with input validation
  function resetPassword(userId, newPassword) {
    // Validate inputs
    if (!userId || !newPassword) {
      throw new Error('Missing required parameters');
    }
    
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    // Use established hashing utility
    const hashedPassword = hashUtils.hashPassword(newPassword);
    
    // Update in database
    return userRepository.updatePassword(userId, hashedPassword);
  }

  // Test with proper mocking and edge cases
  describe('resetPassword', () => {
    beforeEach(() => {
      jest.spyOn(hashUtils, 'hashPassword').mockReturnValue('hashed_password');
      jest.spyOn(userRepository, 'updatePassword').mockResolvedValue(true);
    });
    
    it('should hash password and update repository', async () => {
      await resetPassword('user123', 'newSecurePass');
      expect(hashUtils.hashPassword).toHaveBeenCalledWith('newSecurePass');
      expect(userRepository.updatePassword).toHaveBeenCalledWith('user123', 'hashed_password');
    });
    
    it('should throw error for invalid inputs', async () => {
      await expect(resetPassword(null, 'password')).rejects.toThrow('Missing required parameters');
      await expect(resetPassword('user123', 'short')).rejects.toThrow('Password must be at least 8 characters');
    });
  });
  </example>

  <example type="invalid">
  // INVALID: Direct password handling without validation
  function changeUserPassword(user, pass) {
    // Directly storing password without validation or proper hashing
    const hashedPw = md5(pass); // Using weak hashing algorithm
    
    db.query(`UPDATE users SET password = '${hashedPw}' WHERE id = ${user}`);
    return true;
  }

  // Test missing edge cases and using real database
  test('password change works', () => {
    // No input validation testing
    // Using actual database instead of mocks
    expect(changeUserPassword(5, 'newpass')).toBe(true);
  });
  </example>


  Files to use:

  - [README.md](mdc:README.md) to understand the general project structure
  - [auth_contribution_guide.md](mdc:auth/docs/auth_contribution_guide.md) to understand the auth module structure and contribution guidelines
  - [auth-unit-test.js](mdc:templates/tests/auth-unit-test-base.js) to understand the unit test structure
  - [auth-e2e-test.js](mdc:templates/tests/auth-e2e-test-base.js) to understand the e2e test structure
  ```

## Rule Types
There are four primary rule types, each with specific configuration:

### Agent Selected Rules
- Comprehensive description field explaining when to apply
- Blank globs field
- alwaysApply: false
- For targeted use cases where the AI decides when to apply

### Always Rules
- Blank description field
- Blank globs field
- alwaysApply: true
- Applied to every chat and cmd/ctrl-k context

### Auto Rules
- Blank description field
- Critical glob pattern defining which files it applies to
- alwaysApply: false
- Automatically applied to matching files

### Manual Rules
- Blank description and globs fields
- alwaysApply: false
- Must be explicitly referenced with @ symbol to apply


## Best Practices

### Rule Content
- Focus on actionable, clear directives without unnecessary explanation
- Keep rules concise (25 lines ideal, 50 lines maximum)
- Include both valid and invalid examples for better AI understanding
- Use emojis and Mermaid diagrams when helpful for AI comprehension

### FrontMatter Configuration
- For Agent rules: Include comprehensive description about when to apply
- For Auto rules: Use proper glob patterns (no quotes, no curly braces)
- Always include all three fields even if some are blank

### Examples Section
- Always include at least one valid and one invalid example
- Indent content within XML Example section with 2 spaces
- If a mistake was made previously, use it in the example

### Rule Management
- Let AI handle rule creation and updates
- Prune rules that become redundant
- Consolidate small rules on the same concept
- Remove unnecessary rules as models improve or codebase grows


By following these formats and best practices, you can create effective rules that enhance the AI's capabilities while maintaining a clean and organized rule structure in your projects 🚀