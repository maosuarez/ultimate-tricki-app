## Context

The application is heavily coupled to Tauri v2 for local persistence (SQLite) and window management. To transition to open source and enable a pure web deployment, we need an abstraction layer that isolates the frontend from Tauri's native APIs. See `proposal.md` for the motivation and `specs/web-distribution/spec.md` for requirements.

## Goals / Non-Goals

**Goals:**
- Implement standard Open Source community files (`CONTRIBUTING.md`, `SECURITY.md`, `LICENSE`, etc.).
- Introduce an abstraction adapter for Tauri IPC so the React frontend can compile and run as a standalone web app.
- Provide fallback mechanisms for local persistence (e.g. LocalStorage instead of SQLite) in the web environment.

**Non-Goals:**
- Fully implementing a cloud backend replacement for every native feature (focusing only on graceful degradation for web playability).
- Moving away from Tauri entirely (it remains the primary distribution method).

## Decisions

### 1. Environment Detection and Abstraction Layer
Instead of calling `invoke` directly from `@tauri-apps/api/core` inside services, we will create an `ILocalTransport` interface in `src/services/transport/`.
- **Rationale:** Services currently depend heavily on IPC. An interface allows dependency injection based on environment.
- **Implementation:** 
  - `TauriTransport` implements `ILocalTransport` using native IPC.
  - `WebTransport` implements `ILocalTransport` using `localStorage` and Supabase fallbacks.
  - A factory `getLocalTransport()` will check for `window.__TAURI__` at runtime to return the appropriate implementation.

### 2. Vite Configuration for Dual Targets
Vite is currently configured to build for Tauri. We will add configuration (or scripts in `package.json`) to easily generate a web-only build.
- **Rationale:** We need a way to verify the web build without compiling Rust code.
- **Implementation:** Add a `build:web` script in `package.json` that sets an environment variable (e.g., `VITE_TARGET=web`), allowing conditional logic during build if needed.

### 3. Open Source Governance Files
Standard files will be added to the root directory and `.github/`.
- **Rationale:** Necessary for community trust and contribution standardisation.
- **Implementation:** 
  - Root: `LICENSE` (MIT or similar, user will decide during apply), `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`.
  - `.github/ISSUE_TEMPLATE/`: `bug_report.md`, `feature_request.md`.
  - `.github/pull_request_template.md`.

## Risks / Trade-offs

- **Risk:** Code duplication between `TauriTransport` and `WebTransport`.
  - **Mitigation:** Keep the transport layer as thin as possible, putting all core business logic in pure Typescript services before reaching the transport boundary.
- **Risk:** `localStorage` has size limits compared to SQLite, which might be an issue for saving many large replays.
  - **Mitigation:** Fallback to Supabase for saving complex user data if logged in, limiting `localStorage` to guest usage and preferences.
