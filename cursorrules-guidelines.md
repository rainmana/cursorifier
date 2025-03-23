**Guidelines for Creating Content for** .cursorrules

`.cursorrules` files serve as customized instruction sets for Cursor AI, tailoring its code generation behavior to specific project requirements. These files should be placed in the repository root to provide project-wide context and guidelines.

**1\. Use Markdown for Documentation**

* All documentation within .cursorrules files or accompanying READMEs must be written in Markdown to ensure consistency and readability.  
* **Example**: The README.md uses Markdown with sections like \# Awesome CursorRules, \#\# Why .cursorrules?, and \- \[Angular (Novo Elements)\](...) for lists.

**2\. Maintain a Clear Structure**

* Organize content logically with clear sections (e.g., general guidelines, project-specific rules, file structure) to provide context and instructions effectively.  
* **Example**: In rules/android-jetpack-compose-cursorrules-prompt-file/.cursorrules, content is divided into sections like // Project Architecture and Best Practices, // Folder Structure, and // Compose UI Guidelines.

**3\. Categorize Rules by Technology and Purpose**

* Group rules into categories such as frontend frameworks, backend, mobile development, etc., to align with the repository's organization and make them easily discoverable.  
* **Example**: The README.md categorizes rules like \[Angular (Novo Elements)\] under "Frontend Frameworks and Libraries" and \[Python (FastAPI)\] under "Backend and Full-Stack".

**4\. Use Descriptive Naming Conventions**

* Name .cursorrules files and folders using the pattern technology-focus-cursorrules-prompt-file to clearly indicate the technology and purpose.  
* **Example**: rules/angular-novo-elements-cursorrules-prompt-file/.cursorrules specifies Angular with Novo Elements integration.

**5\. Provide Project-Specific Context**

* Include details about the project’s structure, architectural decisions, and commonly used libraries or methods to guide AI behavior.  
* **Example**: In rules/android-jetpack-compose-cursorrules-prompt-file/.cursorrules, the folder structure (app/src/main/java/com/package/...) and best practices (Use Kotlin coroutines and Flow for asynchronous operations) provide specific context.

**6\. Include Comments for Clarity**

* Use comments within .cursorrules files to explain complex rules, provide context, or clarify intent, enhancing AI understanding.  
* **Example**: // Note: This is a recommended project structure, but be flexible and adapt to existing project structures in rules/android-jetpack-compose-cursorrules-prompt-file/.cursorrules.

**7\. Focus on Best Practices and Standards**

* Define coding standards, best practices, and style guidelines specific to the technology or framework to ensure consistent, high-quality output.  
* **Example**: Follow Material Design 3 guidelines and components and Implement dependency injection using Hilt in rules/android-jetpack-compose-cursorrules-prompt-file/.cursorrules.

**8\. Specify File Globs in Accompanying** .mdc **Files**

* Use .mdc files alongside .cursorrules to apply rules to specific file patterns with globs, ensuring targeted application of guidelines.  
* **Example**: In android-jetpack-compose---ui-guidelines.mdc, globs: app/src/main/java/com/package/presentation/\*\*/\*.kt targets presentation-layer Kotlin files.

**9\. Define Flexible yet Consistent Structures**

* Suggest recommended structures (e.g., folder layouts) but allow flexibility to adapt to existing project organizations, maintaining consistency where possible.  
* **Example**: // Note: This is a reference structure. Adapt to the project's existing organization followed by a detailed projectStructure in rules/android-jetpack-compose-cursorrules-prompt-file/.cursorrules.

**10\. Incorporate Clean Code Principles**

* Embed principles like DRY, KISS, YAGNI, and the Boy-Scout Rule to guide AI toward maintainable, efficient code.  
* **Example**: In rules/angular-novo-elements-cursorrules-prompt-file/.cursorrules, \# Clean Code section includes Don't Repeat Yourself (DRY) and Keep It Simple Stupid (KISS).

**11\. Use Constants or Lists for Guidelines**

* Present rules as constants or bulleted lists for clarity and to make them easily digestible by both humans and AI.  
* **Example**: const androidJetpackComposeBestPractices \= \[...\] in rules/android-jetpack-compose-cursorrules-prompt-file/.cursorrules lists best practices like Use Compose navigation for screen management.

**12\. Address Multiple Aspects of Development**

* Cover various development facets (e.g., architecture, UI, testing, performance) to provide comprehensive guidance.  
* **Example**: rules/android-jetpack-compose-cursorrules-prompt-file/.cursorrules includes // Testing Guidelines (Write unit tests for ViewModels and UseCases) and // Performance Guidelines (Minimize recomposition using proper keys).

**13\. Include Technology-Specific Rules**

* Tailor rules to the specific technology stack, mentioning libraries, frameworks, or tools relevant to the project.  
* **Example**: I'm integrating novo elements which is the novo-elements module and links to documentation in rules/angular-novo-elements-cursorrules-prompt-file/.cursorrules.

**14\. Avoid General Coding Practices Alone**

* Focus on repo-specific rules rather than generic coding advice, ensuring relevance to the project’s unique needs.  
* **Example**: Instead of generic advice, rules/angular-novo-elements-cursorrules-prompt-file/.cursorrules specifies I'm using angular with standalone components and I don’t have a module file.

**15\. Maintain Alphabetical Order in Listings**

* When listing rules or categories (e.g., in READMEs), maintain alphabetical order for ease of navigation.  
* **Example**: In README.md, rules under "Frontend Frameworks and Libraries" are listed alphabetically from \[Angular (Novo Elements)\] to \[Vue 3 (Composition API)\].

**16\. Use Clear and Concise Language**

* Write rules in straightforward, concise language to ensure clarity for both AI interpretation and human review.  
* **Example**: Use proper lazy loading with LazyColumn and LazyRow in rules/android-jetpack-compose-cursorrules-prompt-file/android-jetpack-compose---performance-guidelines.mdc.

**17\. Include Practical Use Cases**

* Provide examples or scenarios where rules apply to help AI apply them effectively in real-world contexts.  
* **Example**: Use proper theming with MaterialTheme and Implement proper animation patterns in rules/android-jetpack-compose-cursorrules-prompt-file/android-jetpack-compose---ui-guidelines.mdc imply practical UI implementation.

**18\. Support Cross-Referencing if Applicable**

* If a rule fits multiple categories, place it in the most relevant one and cross-reference it elsewhere if necessary.  
* **Example**: While not explicitly shown, the guideline in .cursorrules suggests this for rules spanning categories like \[TypeScript (Next.js)\] under both "Frontend" and "Language-Specific".

**19\. Handle Specific File Types or Patterns**

* Include rules for specific file types or coding patterns unique to the project to guide AI in specialized tasks.  
* **Example**: rules/angular-novo-elements-cursorrules-prompt-file/angular-standalone-component-rules.mdc specifies globs: \*\*/\*.ts with This project uses Angular with standalone components.

**20\. Regularly Update and Review Content**

* Ensure rules remain current with project evolution, updating them as technologies or requirements change.  
* **Example**: Implied in .cursorrules with Regularly review and update categorization as the repository grows, applicable to individual .cursorrules files.