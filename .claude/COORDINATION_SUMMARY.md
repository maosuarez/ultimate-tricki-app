# Meta-Coordinator Execution Summary
**Date:** 2026-05-26  
**Status:** Backlog validation complete, Phase 0 ready

---

## 1. DECISIONES ARQUITECTÓNICAS TOMADAS

### Decisión 1: Historial vs Replays (Sprint 2 — RESUELTO)

**Resolución:** Ambos conceptos son válidos y COEXISTEN.

| Concepto | Scope | Eliminable | Automático | Propósito |
|----------|-------|-----------|-----------|-----------|
| **Historial** | Todas las partidas | ❌ No | ✅ Sí | Estadísticas, análisis, record |
| **Replays guardados** | Subconjunto curado | ✅ Sí | ❌ No | Revisión personal, enseñanza |

**Flujo esperado:**
1. Usuario termina partida → se guarda en `matches` (Historial)
2. Desde HistoryPage, hace clic en "Ver replay" → carga ReplayPage
3. En ReplayPage, botón "Guardar este replay" → inserta en `saved_replays` (FK a `matches.id`)

**Tablas Supabase/SQLite:**
- `matches` — registro completo (PK: id, fields: mode, playerXId, playerOId, result, startedAt, endedAt, totalMoves, durationSeconds)
- `match_moves` — movimientos de cada match (FK: matchId)
- `saved_replays` — índice de replays guardados (FK: matchId, owner_id)

---

### Decisión 2: Crear matchStore.ts AHORA

**Razón:** Es prerequisito para Sprints 1, 6, 7.

**Responsabilidades:**
- Track active match metadata (id, mode, playerNames, timeControl)
- Enforce "one active match at a time" constraint
- Lifecycle actions: createMatch, joinMatch, endMatch, abandonMatch, leaveLobby

**Separación de responsabilidades:**
- `gameStore` → estado del tablero, movimientos, timers
- `matchStore` → metadatos, flujo de partida, transiciones
- `networkStore` → conexión WebSocket, room state multiplayer

**Archivo creado:** `src/stores/matchStore.ts` ✅

---

## 2. ORDEN DE EJECUCIÓN VALIDADO

### Fase 0 (Prerequisito) — COMPLETADO
- [x] Crear `matchStore.ts`

### Fase 1 (Paralelo — después de Fase 0)

**Grupo A: 3 sprints independientes**
- **Sprint 5**: Mejorar UX de Lobby (LobbyPage)
  - Delegado a: `ui-ux-designer`
  - Tareas: botón "Abandonar sala", reorganizar layout, código copiable
  
- **Sprint 6**: Guard de una partida activa
  - Delegado a: `senior-implementer`
  - Tareas: React Router guard, ActiveMatchBlockedModal, matchStore.cleanup
  
- **Sprint 7**: Guardar partidas IA en historial
  - Delegado a: `senior-implementer`
  - Tareas: auditar aiService.ts, agregar save_match() al terminar

### Fase 2 (Secuencial)

**Grupo B: Sprint 1 → Sprint 3 (1 bloqueador de 3)**
- **Sprint 1**: Conectar historial a DB
  - Delegado a: `senior-implementer`
  - Tareas: servicios de historia, cargar datos reales en HistoryPage, eliminar mocks
  - **Bloqueador para:** Sprint 3
  
- **Sprint 3**: Implementar replay scrubber (timeline)
  - Delegado a: `ui-ux-designer` (UI) + `senior-implementer` (replayStore + lógica)
  - Tareas: replayStore.ts, componentes de timeline, reconstrucción de estado

### Fase 3 (Alto esfuerzo)

**Grupo C: Sprint 4, 8**
- **Sprint 4**: Perfiles + Friendships
  - Delegado a: `senior-implementer`
  - Tareas: Supabase schema, servicios, ProfilePage.tsx, userStore updates
  
- **Sprint 8**: Python custom agents (en 3 fases)
  - Delegado a: `senior-implementer`
  - Fases: A) loader, B) subprocess executor, C) UI

---

## 3. VALIDACIÓN DE COHERENCIA

✅ **Todos los sprints alineados con arquitectura (CLAUDE.md + architecture-rules.md)**

| Sprint | Risk | Architecture Impact | Approved |
|--------|------|-------------------|----------|
| 1 | Medium | Adds historyService, modifies gameStore | ✅ |
| 2 | Low | Decision only, no code | ✅ |
| 3 | Medium-High | New replayStore, UI, timeline logic | ✅ |
| 4 | Medium | New friendshipService, Supabase schema | ✅ |
| 5 | Low | UI only, matchStore usage | ✅ |
| 6 | Low-Medium | Guard + modal, matchStore enforcement | ✅ |
| 7 | Low | Service audit + fix | ✅ |
| 8 | High | New Rust modules, subprocess handling | ✅ |

---

## 4. BLOQUEADORES Y PREREQUISITOS

```
Fase 0 (Prerequisito)
    ↓
┌───────────────────┬─────────────────┬──────────────────┐
│   Sprint 5 (UX)   │ Sprint 6 (Guard) │ Sprint 7 (AI)    │
│   (independiente) │ (independiente)  │ (independiente)  │
└───────────────────┴─────────────────┴──────────────────┘
    ↓ (after all complete)
Sprint 1 (Historial DB)
    ↓ (bloquea)
Sprint 3 (Replay Scrubber)
    ↓ (after 1, 3, 5, 6, 7 complete)
┌─────────────────────┬─────────────────────────────────┐
│ Sprint 4 (Profiles) │ Sprint 8 (Python Agents, phase) │
└─────────────────────┴─────────────────────────────────┘
```

---

## 5. ARCHIVOS CREADOS/MODIFICADOS

### Creados en Fase 0:
- ✅ `src/stores/matchStore.ts` (nueva)

### Próximos en Fase 1:
- `src/pages/LobbyPage.tsx` (modificado)
- `src/stores/gameStore.ts` (pequeño cambio: limpiar activeMatch)
- `src/components/ui/ActiveMatchBlockedModal.tsx` (nueva)
- `src/services/aiService.ts` (auditoría + fix)

### Próximos en Fase 2:
- `src/services/historyService.ts` (nueva)
- `src/stores/replayStore.ts` (nueva)
- `src/pages/HistoryPage.tsx` (refactor)

---

## 6. COMUNICACIÓN A AGENTES

Cuando se lance cada agente, proporcionar:

1. **Working directory:** `C:\Users\maosu\Programas\tauri-tricki-app`
2. **MCP usage:** Usar `code-review-graph` primero (semantic_search_nodes, query_graph)
3. **Rules to read:**
   - `.claude/coding-rules.md`
   - `.claude/architecture-rules.md`
   - (más específicos según sprint)
4. **Package manager:** pnpm exclusively
5. **No TypeScript `any`:** Use `unknown` + narrowing
6. **Test before marking done:** TypeScript compile clean

---

## Next Steps (Para el coordinador)

- [ ] Verificar compilación con matchStore.ts creado
- [ ] Lanzar Fase 1 (Sprints 5, 6, 7) en paralelo
- [ ] Monitorear completación de Fase 1
- [ ] Lanzar Fase 2 (Sprint 1 → Sprint 3)
- [ ] Lanzar Fase 3 (Sprints 4, 8)

**Backlog Status:** Ready for Phase 1 execution ✅
