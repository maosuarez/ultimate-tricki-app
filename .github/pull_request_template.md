## Summary of Changes

A concise description of the changes proposed in this Pull Request.

- Related Issue: Fixes #
- OpenSpec Change (if applicable): `openspec/changes/<change-name>`

---

## Type of Change

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update / OpenSpec specification
- [ ] 🎨 UI/UX styling or design system enhancement
- [ ] ⚡ Performance optimization
- [ ] 🔧 Refactoring or tooling update

---

## Architectural & Quality Checklist (from AGENTS.md)

- [ ] **OpenSpec Alignment:** All changes adhere to formal specifications in `openspec/specs/` or a documented OpenSpec proposal.
- [ ] **Unidirectional Flow:** Strict compliance with:
  $\text{Component} \rightarrow \text{Hook} \rightarrow \text{Store} \rightarrow \text{Service} \rightarrow \text{IPC / Web / Cloud}$.
- [ ] **Pure Services:** Business logic resides in pure TypeScript utilities/services or Rust; components remain presentational.
- [ ] **Package Manager:** Developed and tested exclusively with **`pnpm`**.
- [ ] **Type Safety:** No `any` types used. Strict TypeScript type checking passes (`pnpm tsc --noEmit`).
- [ ] **Web & Desktop Compatibility:** Works in desktop (Tauri) and degrades gracefully in web browser mode.
- [ ] **Build Validation:**
  - [ ] `pnpm tsc --noEmit` passes without errors.
  - [ ] `pnpm run build:web` succeeds.
  - [ ] `cargo check` (in `src-tauri/`) passes if Rust code was modified.
- [ ] **Tests:** Unit tests added/updated where applicable.
