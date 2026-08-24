## Context

See `proposal.md` for motivation. The application currently contains a mix of Spanish and English, primarily Spanish in the UI and documentation. We are transitioning entirely to English.

## Goals / Non-Goals

**Goals:**
- Translate all `.tsx`, `.ts`, `.rs`, and `.md` files to English.
- Ensure all variable names, store names, and file names reflect English terminology if they currently use Spanish (e.g., `tricki` -> `tictactoe` or `board`).

**Non-Goals:**
- Implementing an `i18n` library (e.g., `react-i18next`). Strings will be hardcoded in English.
- Changing any underlying business logic or application architecture.

## Decisions

### 1. Translation Strategy (No i18n)
We will directly replace strings in the source code instead of extracting them to JSON files.
- **Rationale:** The user explicitly requested \"solo manejo en ingles\" (only English handling) unless `i18n` is implemented later. Direct replacement is faster and keeps the codebase simple for now.

### 2. Terminology Mapping
- \"Tricki\" -> \"Tic Tac Toe\" (or \"Ultimate Tic Tac Toe\")
- \"Tablero\" -> \"Board\"
- \"Subtablero\" -> \"SubBoard\"
- \"Casilla\" -> \"Cell\"
- \"Turno\" -> \"Turn\"
- \"Jugador\" -> \"Player\"
- **Rationale:** Ensures consistent naming across the codebase.

## Risks / Trade-offs

- **Risk:** Breaking changes in Rust/Supabase IPC if JSON keys are translated without matching the backend.
  - **Mitigation:** Ensure that types and backend DTOs are translated simultaneously, or keep network payloads as they are if they are already in English. (Most likely the IPC contracts need to be carefully verified after renaming).
