## Why

To prepare the project for a global open-source community, the entire application, including source code, documentation, and user interface, must be in English. This removes language barriers for international contributors and players.

## What Changes

- Translate all documentation files (`AGENTS.md`, `README.md`, specs, etc.) from Spanish to English.
- Translate all UI text in React components and pages to English.
- Translate all variables, function names, comments, and commit messages to English.
- No `i18n` library will be introduced at this stage; all hardcoded text will simply be replaced with English equivalents.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- None

*(Note: This is a pure translation/refactoring change. `skip_specs: true` has been set in `.openspec.yaml` as there are no spec-level behavioral changes to the system logic, only language changes).*

## Impact

- **Code:** Every file in the repository containing Spanish text, variables, or comments will be modified.
- **Documentation:** `AGENTS.md`, specs, and root documents will be rewritten in English.
- **UI:** All user-facing text will be updated.
