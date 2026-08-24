@AGENTS.md

> **Single Source of Truth:** Specifications, architecture rules, domain models, and canonical contracts reside in `openspec/`. Always consult `openspec/specs/` and use `/opsx-*` workflows to propose and synchronize changes.

## Guidelines for Claude Code

Consult `@AGENTS.md` for:
1. **Agent Roles & Delegation:** Specialized subagents (`game-agent`, `ui-agent`, `state-agent`, `rust-agent`, `service-agent`, `types-agent`, `test-agent`).
2. **Architecture & Unidirectional Data Flow:** Strict layering `UI → Hook → Store → Service → IPC/Cloud → Rust/Supabase`.
3. **Standards & Conventions:** Strict TypeScript (no `any`), `pnpm` exclusively, compact components, pure service functions.
4. **Capability Specifications:** Formally available in `openspec/specs/`.

## Pre-Completion Quality Checklist

Before considering a task finished:
1. Does the code compile cleanly without TypeScript errors (`pnpm tsc --noEmit`) and Rust errors (`cargo check`)?
2. Does it respect `openspec/specs/` specifications and architectural layering?
3. Are functions in `src/utils/` and `src/services/` pure?
4. Are existing stores and user flows preserved without regressions?
5. Was `pnpm` used exclusively?
