# Architecture Rules

Reglas de arquitectura de Tricki Avanzado. Estas decisiones están tomadas. No se cuestionan por defecto.

---

## Regla 1 — Flujo unidireccional estricto

```
Component → Hook → Store → Service → IPC Command → Rust
```

- Los componentes NUNCA llaman servicios directamente.
- Los servicios NUNCA modifican stores directamente (retornan datos, el hook o la acción del store los consume).
- Rust NUNCA inicia comunicación hacia el frontend (solo responde comandos o emite eventos registrados).

---

## Regla 2 — Separación de dominio visual / lógica de juego

Los componentes en `components/game/` son **visuales únicamente**:
- Reciben props del tipo `GameBoardProps`, `SubBoardProps`, `CellProps`
- Emiten eventos (`onCellClick`, `onBoardHighlight`)
- No conocen el estado global, no importan stores

Toda la lógica del juego (validación de movimientos, detección de victoria, cálculo del subtablero activo) vive en:
- `services/gameEngine.service.ts`
- `stores/game.store.ts`
- `src-tauri/src/game/` (si requiere performance Rust)

---

## Regla 3 — Un store, una responsabilidad

| Store | Responsabilidad única |
|-------|----------------------|
| `game.store.ts` | Estado del tablero activo, turno, historial de movimientos |
| `user.store.ts` | Perfil del jugador, preferencias, stats locales |
| `ui.store.ts` | Modales activos, tema, sidebar, notificaciones |
| `network.store.ts` | Estado de conexión, room, peers (fase multiplayer) |
| `match.store.ts` | Metadatos de la partida actual (modo, tiempo, jugadores) |

Los stores NO se comunican entre sí directamente. Si necesitan coordinarse, lo hacen a través de un servicio.

---

## Regla 4 — Persistencia por capas

| Dato | Mecanismo | Dónde |
|------|-----------|-------|
| Configuración de usuario | Tauri Store plugin | `user-prefs.json` via Rust |
| Historial de partidas | SQLite via Rust | `game-history.db` |
| Estado de partida activa | Zustand + `persist` middleware | LocalStorage (temporal) |
| Autenticación de usuarios | Supabase Auth | Supabase cloud |
| Datos online (ranking, partidas remotas) | Supabase PostgreSQL | Supabase cloud |
| Operaciones admin (service_role) | Rust HTTP client | src-tauri/src/supabase/ |
| Assets del juego | Bundled en la app | `src/assets/` |
| Caché de avatares | Tauri filesystem API | `app_data_dir/cache/` |

---

## Regla 5 — Feature flags para fases futuras

Las features de multiplayer y sistema de cuentas se activan via feature flags. Nunca código muerto en producción.

```typescript
// src/config/features.ts
export const FEATURES = {
  MULTIPLAYER: import.meta.env.VITE_FEATURE_MULTIPLAYER === 'true',
  ONLINE_RANKING: import.meta.env.VITE_FEATURE_RANKING === 'true',
  AI_ADVANCED: import.meta.env.VITE_FEATURE_AI_ADVANCED === 'true',
} as const;
```

---

## Regla 6 — Tipos primero, implementación después

Para cualquier feature nueva:
1. Definir los tipos en `src/types/`
2. Definir los contratos de store (acciones + estado)
3. Definir la interfaz del servicio
4. Implementar

No se escribe implementación sin tipos definidos primero.

---

## Regla 7 — Comandos Tauri = contratos

Cada comando Rust expuesto a frontend tiene:
- Definición en `src-tauri/src/commands/`
- Tipo de retorno tipado en `src/types/ipc.types.ts`
- Wrapper en `src/services/tauri.service.ts`

Ningún componente o store usa `invoke()` directamente.

---

## Riesgos técnicos identificados

### Alto impacto

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|-----------|
| Desincronización de estado en replay | Alta | Store inmutable de historial de movimientos con snapshots |
| Latencia percibida en movimientos IA | Media | Computación IA en thread Rust separado con `tokio` |
| Desincronización multiplayer | Alta | Vector clocks o CRDT para resolución de conflictos |

### Medio impacto

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|-----------|
| Bundle size elevado | Media | Code splitting por ruta, lazy loading de páginas |
| Memoria acumulada en historial largo | Baja | Límite de 1000 movimientos en memoria, resto a SQLite |
| Diferencias de rendering entre OS | Media | Tests e2e en Windows + Linux + macOS en CI |

---

## Decisiones de arquitectura documentadas

**ADR-001:** Zustand sobre Redux/Jotai — menor boilerplate, mejor DX para estado de juego reactivo.

**ADR-002:** SQLite via Rust sobre IndexedDB — control total del schema, mejor rendimiento para queries de historial, portabilidad entre reinstalaciones.

**ADR-003:** WebSocket sobre WebRTC para multiplayer — menor complejidad de implementación inicial, servidor de relay propio, posibilidad de migrar a P2P después.

**ADR-004:** TailwindCSS sin CSS Modules — consistencia visual total via design tokens, eliminación de clase naming overhead.

**ADR-005:** React Router sobre TanStack Router — madurez, ecosistema, menor curva de aprendizaje para el equipo.

**ADR-006:** Supabase sobre backend propio — elimina la necesidad de servidor dedicado para auth, base de datos cloud y realtime. El SDK JS/TS cubre el 95% de los casos desde la service layer. Rust actúa como proxy solo para operaciones con service_role key.

**ADR-007:** pnpm sobre npm/yarn — workspaces más eficientes, strict mode por defecto, lockfile más confiable.
