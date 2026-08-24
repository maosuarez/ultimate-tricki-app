## Why

The project is currently configured exclusively as a desktop application. To foster community growth, external contributions, and wider accessibility, we need to transition the repository to an open-source standard and enable web deployment. This will allow players to access the game without installing it and invite developers to collaborate seamlessly.

## What Changes

- Add open-source community standards: `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, and a clear `LICENSE`.
- Setup GitHub issue and Pull Request templates to standardize community contributions.
- **BREAKING**: Introduce environment-based adapters for Tauri IPC so the frontend can function independently in a standard web browser, falling back to browser-native storage and web APIs when Tauri is not available.
- Configure build scripts to output a web-only artifact alongside the desktop binary.

## Capabilities

### New Capabilities
- `web-distribution`: Graceful degradation of native features (Tauri IPC, SQLite) to browser-native alternatives (LocalStorage, WebSockets, REST) when running in a pure web environment.
- `project-governance`: Establishing open-source contribution guidelines, security policies, and community standards.

### Modified Capabilities
- `architecture`: Modify the service tier to introduce an abstraction layer (adapters) for Tauri commands, allowing the UI and stores to operate agnostically of the runtime environment (Desktop vs Web).

## Impact

- **Code:** Changes in `src/services/` to abstract `window.__TAURI__` usage behind environment checks.
- **Project Structure:** Addition of `.github/` folder with templates, and community health files at the root.
- **Build/CI:** Modified `package.json` and CI workflows to support both native (`tauri build`) and web (`vite build`) targets.
