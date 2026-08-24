## 1. Documentation Translation

- [x] 1.1 Translate `README.md` to English. Verify it reads correctly and links are intact.
- [x] 1.2 Translate `AGENTS.md` and `CLAUDE.md` to English. Verify all rules and guidelines still make sense.
- [x] 1.3 Translate all specs inside `openspec/specs/` to English. Verify with `openspec validate` to ensure YAML frontmatter is not broken.

## 2. Frontend Source Translation

- [x] 2.1 Search and replace Spanish UI strings in `src/pages/` (Home, Game, Match, Lobby, Profile, Replays). Verify by running `pnpm dev` and checking pages.
- [x] 2.2 Search and replace Spanish UI strings in `src/components/` (game, ui, layout). Verify component tests still pass.
- [x] 2.3 Rename variables, functions, and files in `src/` from Spanish to English (e.g. Tablero -> Board, Casilla -> Cell). Verify `pnpm tsc --noEmit` passes.

## 3. Backend Source Translation

- [x] 3.1 Search and replace Spanish comments, variable names, and error messages in `src-tauri/src/`. Verify `cargo check` passes.
- [x] 3.2 Ensure IPC payload structures match frontend changes (e.g. if struct fields were renamed). Verify `cargo test` passes.

## 4. Verification

- [x] 4.1 Run the full test suite (`pnpm test` and `cargo test`). Verify 100% of tests pass after renaming and translating strings.
- [x] 4.2 Start the desktop application and click through the main flow to ensure no Spanish text remains. Verify visually.
