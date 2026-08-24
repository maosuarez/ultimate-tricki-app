# Desktop Native (Tauri v2 & Rust Core) Specification

## Purpose
Defines the native backend layer running under Tauri v2, including IPC command contracts, SQLite local persistence, and the Python developer agent runner.

## Requirements

### Requirement: Tauri IPC Command Architecture
All Rust functions exposed to the web frontend SHALL be declared as Tauri commands returning `Result<T, AppError>`. No command may panic or call `unwrap()` in production.

#### Scenario: Frontend invokes Rust command
- **GIVEN** the frontend calls `invoke('request_move', { sessionId, gameState, deadlineMs })`
- **WHEN** the command executes in Rust
- **THEN** it executes asynchronously on worker threads, enforcing timeouts and returning a typed JSON payload or a serialized `AppError`.

### Requirement: Python Agent Subprocess Execution
The native backend SHALL support discovering, spawning, and managing external Python agent scripts located in `~/.tricki/agents/`.

#### Scenario: Running an AI agent session
- **GIVEN** a valid `.py` agent implementing `Agent.mount()` and `Agent.act(game_state)`
- **WHEN** `start_python_agent_session` is invoked
- **THEN** Rust spawns an isolated Python subprocess communicating over standard I/O (stdin/stdout) with JSON lines.
- **AND** a strict 5-second per-move timeout is enforced before returning a timeout error or forfeit.

### Requirement: Embedded SQLite Storage
Local match records, moves, and offline statistics SHALL be stored in an embedded SQLite database managed by the Rust core.

#### Scenario: Offline game completion
- **GIVEN** a finished local or vs-AI match
- **WHEN** the match concludes
- **THEN** `matches` and `moves` tables in SQLite are populated atomically, ensuring replayability without internet connectivity.
