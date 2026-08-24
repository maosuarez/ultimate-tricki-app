# Contributing to Ultimate Tic Tac Toe

Thank you for your interest in contributing to **Ultimate Tic Tac Toe**! We welcome contributions from developers of all skill levels.

To maintain code quality, architectural consistency, and predictable evolution, please read and follow these guidelines.

---

## 1. Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any unacceptable behavior according to the procedures described in [SECURITY.md](SECURITY.md) or directly to the project maintainers.

---

## 2. Core Architectural Invariants

Before writing code, please review [AGENTS.md](AGENTS.md) and the formal specifications in `openspec/specs/`. Key principles include:

1. **Package Manager:** Exclusively use **`pnpm`**. `npm` and `yarn` are strictly forbidden.
2. **OpenSpec as Single Source of Truth (SSOT):** All architectural decisions, rules, and specifications reside in `openspec/`. Changes to system behavior must follow the OpenSpec workflow.
3. **Strict Unidirectional Data Flow:**
   $$\text{UI Component} \longrightarrow \text{Custom Hook} \longrightarrow \text{Zustand Store} \longrightarrow \text{Service Layer} \longrightarrow \text{Environment Abstraction (IPC / Web)} \longrightarrow \text{Native / Browser / Cloud}$$
4. **Pure Services & Domain Isolation:** Game rendering components (`src/components/game/`) are purely presentational. Move validation, game engine calculations, and network adapters live in `src/utils/`, `src/services/`, and `src-tauri/src/game/`.
5. **Strict TypeScript:** No `any` type annotations. Use narrowing, generics, and discriminated unions (`unknown` when dynamic).
6. **Error Handling:** Use `Result<T, AppError>` in Rust and typed errors across IPC and service boundaries.

---

## 3. OpenSpec Workflow

All feature additions, breaking changes, or refactoring must be managed through **OpenSpec**:

1. **Propose a change:**
   ```bash
   openspec new change "<change-name>"
   # or in AI agent chat:
   # /opsx-propose <description>
   ```
2. **Implement tasks:**
   - Follow the tasks defined in `openspec/changes/<change-name>/tasks.md`.
   - Update task status as items are completed.
3. **Sync and Archive:**
   - Synchronize delta specs with main specs upon completion.
   - Archive the change once merged.

---

## 4. Development Setup

### Prerequisites
- **Node.js**: >= 20.x
- **pnpm**: >= 9.x (`npm install -g pnpm` or via `corepack enable`)
- **Rust**: Latest stable (`rustup update stable`)
- **System Dependencies** (for Tauri v2): See [Tauri Prerequisites Guide](https://v2.tauri.app/start/prerequisites/).

### Initial Setup
```bash
# 1. Clone the repository
git clone https://github.com/your-username/ultimate-tricki-app.git
cd ultimate-tricki-app

# 2. Install frontend dependencies
pnpm install

# 3. Copy environment configuration
cp .env.example .env
```

### Running Locally

- **Web Browser Mode (Fast UI development):**
  ```bash
  pnpm dev
  ```
  Open `http://localhost:1420` in your browser.

- **Desktop Mode (Tauri Native + Rust backend):**
  ```bash
  pnpm tauri dev
  ```

---

## 5. Verification Checklist

Before submitting a Pull Request, ensure that:

- [ ] TypeScript compiles cleanly: `pnpm tsc --noEmit`
- [ ] Web build succeeds: `pnpm run build:web`
- [ ] Rust code compiles without warnings: `cd src-tauri && cargo check`
- [ ] Code adheres to unidirectional flow and pure services rules.
- [ ] All OpenSpec delta specifications and tasks are complete and verified.

---

## 6. Pull Request Process

1. Create a feature branch from `main` (`git checkout -b feat/your-feature-name` or `fix/issue-description`).
2. Keep commits atomic and clearly descriptive (following Conventional Commits).
3. Push to your fork and submit a Pull Request targeting `main`.
4. Complete the Pull Request template checklist.
