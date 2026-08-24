## 1. Project Governance Files

- [x] 1.1 Create `CONTRIBUTING.md` at the project root enforcing the OpenSpec workflow and `pnpm` usage. Verify it renders correctly in markdown.
- [x] 1.2 Create `SECURITY.md` at the project root defining vulnerability disclosure policies. Verify the file exists.
- [x] 1.3 Create `CODE_OF_CONDUCT.md` based on standard open source templates. Verify the file exists.
- [x] 1.4 Create `LICENSE` file. Verify the file exists and is populated with the chosen open source license.

## 2. GitHub Templates

- [x] 2.1 Create `.github/ISSUE_TEMPLATE/bug_report.md` with sections for reproduction steps and environment. Verify the file structure.
- [x] 2.2 Create `.github/ISSUE_TEMPLATE/feature_request.md` with sections for problem description and proposed solution. Verify the file structure.
- [x] 2.3 Create `.github/pull_request_template.md` with a checklist aligned with `AGENTS.md`. Verify the file structure.

## 3. Environment Abstraction Layer

- [x] 3.1 Define `ILocalTransport` interface in `src/services/transport/localTransport.ts`. Verify type compilation.
- [x] 3.2 Implement `TauriTransport` class that wraps `@tauri-apps/api/core` commands. Verify type compilation.
- [x] 3.3 Implement `WebTransport` class with fallbacks (LocalStorage, Supabase) for non-Tauri environments. Verify type compilation.
- [x] 3.4 Create a factory function `getLocalTransport()` that returns the correct implementation based on `window.__TAURI__`. Verify unit tests for the factory.

## 4. Service Refactoring

- [x] 4.1 Update services to use `getLocalTransport()` instead of direct `@tauri-apps/api/core` imports. Verify `pnpm tsc --noEmit` passes.
- [x] 4.2 Verify frontend boots in browser mode without errors by running `pnpm dev` and opening it outside the Tauri wrapper.

## 5. Web Build Configuration

- [x] 5.1 Add a `build:web` script to `package.json` utilizing `vite build` configured for web. Verify running `pnpm run build:web` successfully generates a `dist` folder.
