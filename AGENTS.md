# AGENTS.md — Tricki Avanzado (Ultimate Tic Tac Toe)

> **Single Source of Truth (SSOT):** All system specifications, architecture, domain rules, and planned changes reside in `openspec/`. Always consult `openspec/specs/` before implementing any feature.

---

## 1. Role and Core Principles

You are part of the engineering team for **Tricki Avanzado**, a high-performance cross-platform Ultimate Tic Tac Toe application built with **Tauri v2 + React 19 + TypeScript + Zustand + Rust + Supabase**.

### Core Principles
1. **OpenSpec as SSOT:** Design decisions, contracts, and specifications live in `openspec/`. Anything not in `openspec/specs/` must be proposed via the OpenSpec workflow (`/opsx-propose`).
2. **Strict Unidirectional Data Flow:**
   $$\text{Component} \longrightarrow \text{Hook} \longrightarrow \text{Store (Zustand)} \longrightarrow \text{Service (TS)} \longrightarrow \text{IPC / Cloud} \longrightarrow \text{Rust / Supabase}$$
3. **Purity in Services:** Services are pure function modules or typed transport/IPC wrappers. They do not manipulate stores directly or render UI.
4. **Visual Domain / Game Logic Separation:** Board components (`src/components/game/`) are purely presentational and react to props and callbacks. Win validation, turns, and game algorithms live in `src/utils/boardUtils.ts`, `src/services/`, and `src-tauri/src/game/`.
5. **No Any in TypeScript:** Strict type safety, narrowing, and discriminated unions (`unknown` instead of `any`).
6. **Package Manager:** Exclusively use **`pnpm`**. `npm` or `yarn` are strictly forbidden.

---

## 2. Specialized Agent Delegation

Before addressing any task, identify its domain and follow the corresponding guidelines:

| Agent | Scope / Responsibility | Primary Paths | Specific Rules |
|---|---|---|---|
| `game-agent` | Game logic, rules, macroboard/subboard state, validations, win algorithms, and active sub-board determination | `src/utils/boardUtils.ts`, `src-tauri/src/game/`, `src/types/game.ts` | Deterministic pure functions. Unit coverage $\ge 95\%$. Flat array indexing (0–8). |
| `ui-agent` | Visual components, layout, design tokens, accessibility, and animations | `src/components/`, `src/pages/`, `src/styles/` | Named exports, `React.FC<Props>`, max 150 lines/file, $\ge 1280\times 720$ support, Tailwind CSS. |
| `state-agent` | Zustand stores, actions, selectors, and state synchronization | `src/stores/` | One store per domain, serializable state, `devtools` enabled, delegation of logic to services. |
| `rust-agent` | Native Tauri v2 backend, IPC commands, local SQLite, Rust AI engine, Python agent runner | `src-tauri/` | `Result<T, AppError>` in commands, no `unwrap()`, async IO/AI tasks (`tokio`). |
| `service-agent` | API integrations, Supabase client, WebSockets (Azure WebPubSub), Web Audio API, Python agent bridge | `src/services/` | `supabase.service.ts` as single importer of `@supabase/supabase-js`, functional modules. |
| `types-agent` | TypeScript contracts, DTOs, domain interfaces, and network/IPC types | `src/types/` | Types first before implementation. No type assertions (`as`) without explicit justification. |
| `test-agent` | Unit, integration, and E2E testing | `src/**/__tests__/`, `src-tauri/tests/` | Clear describe/it blocks, avoiding fragile full-UI snapshots. |

---

## 3. Canonical Project Structure

```
ultimate-tricki-app/
├── openspec/                     # 🌟 SINGLE SOURCE OF TRUTH (SDD & Specs)
│   ├── config.yaml               # Global context and OpenSpec rules
│   └── specs/                    # Formal specifications by capability
│       ├── architecture/         # Layering, data flows, and boundaries
│       ├── game-engine/          # Rules, math, and board state
│       ├── desktop-native/       # Tauri v2 IPC, SQLite, and runtime
│       ├── cloud-backend/        # Supabase (Auth, DB, Realtime, Social)
│       ├── ai-engine/            # Minimax, MCTS, and Python sandbox
│       ├── multiplayer/          # WebSocket transport and synchronization
│       └── ui-design-system/     # Design tokens, components, and UX
├── src/                          # Frontend React 19 + TypeScript
│   ├── components/               # game/ (board), ui/ (design system), layout/
│   ├── pages/                    # Main views (Home, Game, Match, Lobby, Profile, Replays...)
│   ├── hooks/                    # Custom hooks by domain
│   ├── stores/                   # Modular Zustand stores
│   ├── services/                 # Pure TypeScript services and transport wrappers
│   │   └── transport/            # IGameTransport, LocalTransport, WebSocketTransport, localTransport
│   ├── types/                    # Global TypeScript definitions
│   ├── utils/                    # Pure utility functions (boardUtils.ts)
│   └── styles/                   # globals.css and themes
├── src-tauri/                    # Native Rust Backend (Tauri v2)
│   ├── src/
│   │   ├── agents/               # Registry, executor, and python commands
│   │   ├── game/                 # Rules, engine, and types in Rust
│   │   ├── lib.rs & main.rs
│   └── Cargo.toml
├── supabase/                     # SQL migrations and database schemas
│   └── migrations/
├── AGENTS.md                     # Master engineering and agent guidelines
├── CLAUDE.md                     # Entry point for Claude Code
└── README.md
```

---

## 4. Code Conventions and Quality Standards

### TypeScript & React
- **Imports:** Strict order: (1) External packages, (2) Types (`import type`), (3) Stores, (4) Services, (5) Components (`@/...`), (6) Hooks, (7) Utils, (8) Styles/Assets.
- **Components:** Maximum 150 lines. If a component exceeds this, decompose it into subcomponents or extract logic into custom hooks.
- **Performance:** Avoid full board re-renders; use `React.memo` for `Cell` and `SubBoard`.

### Rust (src-tauri)
- Centralize errors in a serializable `AppError` type to cross the IPC boundary safely.
- Computationally intensive tasks (AI MCTS / Minimax) must run in dedicated blocking threads via `tokio::task::spawn_blocking`.
- Python agent processes are managed with strict timeouts (5s per move).

### Supabase & Cloud
- `supabase.service.ts` is the single point of contact with Supabase on the frontend. No component or hook imports `@supabase/supabase-js` directly.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in the client. Administrative operations are isolated in Rust or Edge Functions.

---

## 5. OpenSpec Workflow Protocol

1. **Before starting any feature or refactoring:**
   - Review existing specifications in `openspec/specs/`.
   - If introducing behavioral changes or new capabilities, execute:
     ```bash
     openspec new change "<change-name>"
     ```
2. **During implementation:**
   - Adhere strictly to the contracts and rules described in `openspec/specs/`.
3. **Upon finishing a change:**
   - Synchronize delta specs with main specs (`openspec-sync-specs` or `/opsx-sync`).
   - Archive the change once validated (`openspec-archive-change` or `/opsx-archive`).

---

## 6. Pre-Completion Checklist

- [ ] Does the code compile cleanly (`pnpm tsc --noEmit` and `cargo check`)?
- [ ] Does it respect unidirectional flow and architectural layering?
- [ ] Were relevant unit/integration tests updated or created?
- [ ] Was OpenSpec documentation maintained and kept up to date?
- [ ] Is there no dead code or unnecessary dependencies introduced?
