# Prompt-Driven Development (PDD) System Handbook

This handbook provides the core operational instructions for AI Coding Assistants working on the **QualityManager** repository. When initializing any AI agentic session, instruct the model to read this file first.

---

## 1. Core Directives

Any code written by the AI assistant must comply with the following four golden rules:

1. **Zero Comments Policy:** Do not write single-line (`//`) or multi-line (`/* */`) comments in the code. Let the code be clean, expressive, and self-documenting. (Preserve existing third-party copyright headers if present).
2. **Absolute Path Prohibition:** Absolutely NO hardcoded absolute paths (e.g. `C:\Users\...` or `C:/Users/...`) are allowed in source files, scripts, or Docker compose configs. All imports and paths must be relative (e.g., `../components/Sidebar`, `./nginx.conf`).
3. **Verify via Automated Specs:** After implementing or modifying any component, the AI must locate the spec tests inside `src/__tests__/`, run the Vitest test runner using `npm test`, and confirm 100% success of the test suite before submitting a response.
4. **Defensive API Checks:** Always verify that arrays are handled defensively by inserting `Array.isArray()` checks before looping or mapping backend service JSON payloads.

---

## 2. PDD Task Execution Workflow

When assigning a feature task to the AI agent:

### Phase 1: Context Hydration (Supplying References)
Direct the AI to load the two companion reference files:
* 🗄 **Database Reference:** Read [db_schema.md](file:///c:/Users/Pranav/Documents/Code/git/QualityManager/.ai-context/db_schema.md) to inspect SQL Server keys and database structures.
* 📐 **Stack Guidelines:** Read [ui_and_services_standards.md](file:///c:/Users/Pranav/Documents/Code/git/QualityManager/.ai-context/ui_and_services_standards.md) to verify React 19 standards and custom Sequelize `TableMapper` constraints.

### Phase 2: Design Verification
Have the AI outline the proposed implementation steps in an implementation plan *first*, listing:
* Target files to modify
* New routes to map
* Mock boundaries to add in specs

### Phase 3: Pristine Coding & Execution
The AI writes the code, removes any intermediate comments, cleans up unused imports, runs the Vitest command runner, and verifies correct compilation.
