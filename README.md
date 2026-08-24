# Ultimate Tic Tac Toe

> High-performance Ultimate Tic Tac Toe application built with **Tauri v2 + React 19 + TypeScript + Zustand + Rust + Supabase**.

[![Tauri](https://img.shields.io/badge/Tauri-v2-blue)](https://v2.tauri.app)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## What is Ultimate Tic Tac Toe?

A high-performance implementation of **Ultimate Tic Tac Toe** designed for both native desktop and web browsers. It supports local pass-and-play, AI matches (with built-in algorithms and custom Python agents), and real-time multiplayer.

The visual design is dark-first and focused: the board dominates the interface with clean, responsive feedback.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop Native | Tauri v2 (Rust) |
| Frontend UI | React 19 + TypeScript |
| Build & Bundler | Vite 7 |
| State Management | Zustand 5 |
| Styling | Tailwind CSS + CSS Variables |
| Backend & Cloud | Supabase (Auth, PostgreSQL, Realtime) |
| Multiplayer Transport | WebSockets / Azure WebPubSub |
| Package Manager | `pnpm` (Strictly required) |
| Testing | Vitest |

---

## Quick Start

### Prerequisites

- **Node.js**: >= 20.x
- **pnpm**: >= 9.x (`npm install -g pnpm` or `corepack enable`)
- **Rust**: Latest stable (`rustup update stable`)
- **System Dependencies** for Tauri: See [Tauri Prerequisites Guide](https://v2.tauri.app/start/prerequisites/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/ultimate-tricki-app.git
cd ultimate-tricki-app

# 2. Install dependencies
pnpm install

# 3. Web Development Mode (Runs in browser at http://localhost:1420)
pnpm dev

# 4. Desktop Development Mode (Runs with Tauri v2 native core)
pnpm tauri dev

# 5. Build Standalone Web Distribution
pnpm run build:web

# 6. Build Native Desktop App
pnpm tauri build
```

---

## Specification & Single Source of Truth (OpenSpec)

All architecture, game rules, contracts, and system capabilities reside formally in **`openspec/specs/`**:

| Capability | Location | Description |
|---|---|---|
| Architecture | `openspec/specs/architecture/spec.md` | Layering, unidirectional data flow, and persistence |
| Game Engine | `openspec/specs/game-engine/spec.md` | 3×3 sub-board rules, validation, turns, and replays |
| Desktop Native | `openspec/specs/desktop-native/spec.md` | Tauri v2 IPC, SQLite, and Python agent sandbox |
| Cloud Backend | `openspec/specs/cloud-backend/spec.md` | Supabase Auth, PostgreSQL, Achievements, and Social |
| AI Engine | `openspec/specs/ai-engine/spec.md` | Minimax, Alpha-Beta, MCTS, and Python runtime bridge |
| Multiplayer | `openspec/specs/multiplayer/spec.md` | WebSocket transport, room lifecycle, and synchronization |
| UI Design System | `openspec/specs/ui-design-system/spec.md` | Dark-first design tokens, layout, and Web Audio |
| Web Distribution | `openspec/specs/web-distribution/spec.md` | Browser runtime adaptation and graceful native degradation |
| Project Governance | `openspec/specs/project-governance/spec.md` | Contribution workflows, Code of Conduct, and security policies |

### Developer & Agent Guides
- **`CONTRIBUTING.md`**: Contribution workflow, OpenSpec usage, and PR guidelines.
- **`AGENTS.md`**: Master engineering guide, specialized agent roles (`game-agent`, `ui-agent`, etc.), and code conventions.
- **`CLAUDE.md`**: Entry point for Claude Code referencing `@AGENTS.md`.

---

## Supported Platforms

| Platform | Support |
|---|---|
| Windows 10 / 11 | ✅ Native |
| macOS 12+ | ✅ Native |
| Linux (Ubuntu, Fedora, Arch) | ✅ Native |
| Modern Web Browsers (Chrome, Firefox, Safari, Edge) | ✅ Web Mode |

Supported screen resolutions: 1280×720 up to 4K / ultrawide displays.

---

## License

This project is licensed under the [MIT License](LICENSE).
