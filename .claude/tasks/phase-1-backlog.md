# Backlog de tareas — Fase 1: Base del proyecto

Estado: `[ ]` pendiente | `[~]` en progreso | `[x]` completado

---

## Sprint 1 — Scaffolding y configuración

- [ ] Inicializar proyecto con `create-tauri-app` (React + TypeScript + Vite)
- [ ] Configurar TailwindCSS con el sistema de tokens de `ui-guidelines.md`
- [ ] Configurar alias `@/` en `vite.config.ts` y `tsconfig.json`
- [ ] Configurar ESLint + Prettier con las reglas de `coding-rules.md`
- [ ] Configurar React Router con la estructura de rutas base
- [ ] Instalar y configurar Zustand con devtools
- [ ] Crear estructura de carpetas completa según `project-context.md`
- [ ] Configurar fuentes (Syne, DM Sans, JetBrains Mono) via Google Fonts o local
- [ ] Crear CSS variables base (tokens de color, tipografía, espaciado)
- [ ] Configurar Vitest para testing

## Sprint 2 — Design System base

- [ ] Crear componente `Button` (variantes: primary, secondary, ghost, danger)
- [ ] Crear componente `Modal` con focus trap y backdrop blur
- [ ] Crear componente `Toast` / sistema de notificaciones
- [ ] Crear componente `Badge` / `Chip`
- [ ] Crear componente `Avatar` con fallback
- [ ] Crear `AppShell` layout con sidebar colapsable
- [ ] Crear `PageTransition` wrapper para animaciones entre rutas

## Sprint 3 — Lógica de juego core

- [ ] Definir todos los tipos en `src/types/game.types.ts`
- [ ] Implementar `gameEngine.service.ts`:
  - [ ] `initGame()`
  - [ ] `applyMove()`
  - [ ] `validateMove()`
  - [ ] `detectSubBoardVictory()`
  - [ ] `detectGameVictory()`
  - [ ] `determineActiveSubBoard()`
  - [ ] `getPlayableCells()`
- [ ] Tests unitarios para `gameEngine.service.ts` (cobertura ≥ 95%)
- [ ] Implementar `game.store.ts` con todas las acciones

## Sprint 4 — Tablero visual

- [ ] Componente `GameBoard` (macroboard container)
- [ ] Componente `SubBoard` con estados: active, inactive, won-x, won-o, draw
- [ ] Componente `Cell` con estados visuales completos
- [ ] Animación de victoria en subtablero
- [ ] Indicador visual de subtablero activo
- [ ] Highlighting de celda en hover (solo celdas jugables)
- [ ] Responsive del tablero en los 5 breakpoints definidos

## Sprint 5 — Vistas base

- [ ] Vista `Home` (Inicio)
- [ ] Vista `LocalMatch` (Partida local)
- [ ] Vista `GameResult` (Victoria / Derrota / Empate)
- [ ] Vista `Settings` (Configuración)

---

## Fase 2 — Backlog futuro

Ver `docs/roadmap.md` para las fases de IA, multiplayer y sistema de cuentas.
