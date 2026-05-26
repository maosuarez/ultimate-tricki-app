# Backlog de tareas — Fase 1: Mejoras críticas

**Estado:** Fase 1 completada al 100%. No hay tareas pendientes.

---

## Sprints completados

| Sprint | Descripción | Estado |
|--------|-------------|--------|
| Sprint 0 | `matchStore.ts` creado como prerequisito | ✅ |
| Sprint 1 | Historial conectado a Supabase real (eliminados mocks) | ✅ |
| Sprint 2 | Decisión arquitectónica: Historial y Replays coexisten | ✅ |
| Sprint 3 | Replay scrubber funcional (`replayStore`, `reconstructBoardState`) | ✅ |
| Sprint 4 | Perfiles de usuario y solicitudes de amistad (Supabase + UI) | ✅ |
| Sprint 5 | UX de lobby mejorada (layout, botón abandonar, código copiable) | ✅ |
| Sprint 6 | Guard: una partida activa a la vez (`ActiveMatchBlockedModal`) | ✅ |
| Sprint 7 | Partidas contra Flattie guardadas en historial (`useSaveCompletedMatch`) | ✅ |
| Sprint 8 | Sistema de agentes Python (`src-tauri/src/agents/`, `DeveloperAgentsPage`) | ✅ |

---

## Pendiente de Sprint 8

El botón "Jugar" en `DeveloperAgentsPage` está deshabilitado intencionalmente.
Conectar la sesión de agente Python al flujo de `gameStore` es el próximo paso si se quiere
habilitar partidas completas contra agentes custom.
