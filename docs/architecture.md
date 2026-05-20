# Arquitectura técnica

## Diagrama de capas

```
┌─────────────────────────────────────────────────────────────────────┐
│                       UI Layer (React)                              │
│      Pages → Layouts → Components (game | ui | shared)              │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ hooks
┌────────────────────────────────▼────────────────────────────────────┐
│                    State Layer (Zustand)                             │
│      gameStore | userStore | uiStore | networkStore                │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ actions → services
┌────────────────────────────────▼────────────────────────────────────┐
│                   Service Layer (TypeScript)                         │
│  gameEngine | matchService | authService | aiService | supabase...  │
└────────────┬──────────────────────────────────────────────────┬─────┘
             │ tauri.service.ts                   supabase.service.ts │
┌────────────▼──────────────────────┐  ┌──────────────────────────────▼───┐
│     IPC Layer (Tauri v2)          │  │   Supabase Cloud                 │
│  Commands | Events | Plugins      │  │   Auth | PostgreSQL | Realtime   │
└────────────┬──────────────────────┘  └────────────────────────────┬─────┘
             │                                        ↑ (service_role key)
┌────────────▼──────────────────────┐                │
│     Rust Core (src-tauri)         │  ┌─────────────┘
│ game/ | db/ | ai/ | supabase/    │  │
│ commands/ | events/               │  │
└───────────────────────────────────┴──┘
```

## Estructura de carpetas completa

```
tricki-avanzado/
├── src/                          # Frontend React + TypeScript
│   ├── components/
│   │   ├── game/                 # Componentes del tablero y juego
│   │   │   ├── GameBoard/        # Macroboard container
│   │   │   ├── SubBoard/         # Subtablero 3×3
│   │   │   ├── Cell/             # Celda individual
│   │   │   ├── MoveIndicator/    # Indicador de subtablero activo
│   │   │   ├── PlayerCard/       # Info del jugador (nombre, timer)
│   │   │   └── GameScoreboard/   # Marcador y estado de la partida
│   │   ├── ui/                   # Design system components
│   │   │   ├── Button/
│   │   │   ├── Modal/
│   │   │   ├── Toast/
│   │   │   ├── Badge/
│   │   │   ├── Avatar/
│   │   │   ├── Input/
│   │   │   ├── Select/
│   │   │   └── Tooltip/
│   │   ├── layout/
│   │   │   ├── AppShell/         # Wrapper principal con sidebar
│   │   │   ├── PageContainer/    # Container de página con max-width
│   │   │   └── SplitLayout/     # Layout de partida (board + panel)
│   │   └── shared/
│   │       ├── PageTransition/   # Animaciones entre rutas
│   │       ├── LoadingScreen/    # Pantalla de carga inicial
│   │       └── ErrorBoundary/
│   ├── pages/
│   │   ├── Home/
│   │   ├── Login/
│   │   ├── Register/
│   │   ├── Lobby/
│   │   ├── CreateMatch/
│   │   ├── JoinMatch/
│   │   ├── Match/               # Vista principal de partida
│   │   ├── GameResult/          # Victoria / Derrota / Empate
│   │   ├── Reconnecting/
│   │   ├── Disconnected/
│   │   ├── Settings/
│   │   ├── Profile/
│   │   ├── History/
│   │   └── Replay/
│   ├── hooks/
│   │   ├── game/
│   │   │   ├── useGameStore.ts
│   │   │   ├── useMatchTimer.ts
│   │   │   ├── useGameControls.ts
│   │   │   └── useReplay.ts
│   │   ├── ui/
│   │   │   ├── useModal.ts
│   │   │   ├── useToast.ts
│   │   │   └── useTheme.ts
│   │   └── network/
│   │       └── useConnectionStatus.ts
│   ├── stores/
│   │   ├── game.store.ts
│   │   ├── match.store.ts
│   │   ├── user.store.ts
│   │   ├── ui.store.ts
│   │   └── network.store.ts
│   ├── services/
│   │   ├── gameEngine.service.ts  # Lógica de juego pura
│   │   ├── match.service.ts       # Ciclo de vida de partida
│   │   ├── ai.service.ts          # Interfaz con motor IA
│   │   ├── auth.service.ts        # Autenticación (fase futura)
│   │   ├── supabase.service.ts    # Cliente Supabase encapsulado
│   │   ├── history.service.ts     # Historial de partidas
│   │   └── tauri.service.ts       # Wrapper para invoke() de Tauri
│   ├── types/
│   │   ├── game.types.ts
│   │   ├── match.types.ts
│   │   ├── user.types.ts
│   │   ├── network.types.ts
│   │   ├── ipc.types.ts
│   │   ├── api.types.ts
│   │   └── ui.types.ts
│   ├── utils/
│   │   ├── boardUtils.ts
│   │   ├── timeUtils.ts
│   │   ├── validationUtils.ts
│   │   └── formatUtils.ts
│   ├── config/
│   │   ├── features.ts            # Feature flags
│   │   ├── routes.ts              # Constantes de rutas
│   │   └── constants.ts           # Constantes globales del juego
│   ├── styles/
│   │   ├── globals.css
│   │   ├── theme-dark.css
│   │   └── theme-light.css
│   └── assets/
│       ├── fonts/
│       ├── images/
│       ├── sounds/
│       └── icons/
├── src-tauri/                    # Backend Rust
│   └── src/
│       ├── main.rs
│       ├── lib.rs
│       ├── error.rs              # AppError enum centralizado
│       ├── commands/             # Comandos expuestos al frontend
│       │   ├── game.rs
│       │   ├── history.rs
│       │   ├── user.rs
│       │   └── ai.rs
│       ├── db/                   # SQLite con SQLx o rusqlite
│       │   ├── mod.rs
│       │   ├── schema.rs
│       │   ├── migrations/
│       │   └── repositories/
│       ├── game/                 # Motor de juego en Rust (performance)
│       │   ├── mod.rs
│       │   ├── engine.rs
│       │   └── ai/
│       │       ├── mod.rs
│       │       ├── minimax.rs
│       │       └── mcts.rs
│       ├── supabase/             # Proxy HTTP para operaciones admin
│       │   └── mod.rs
│       └── events/               # Tauri events emitidos desde Rust
│           └── mod.rs
├── supabase/                     # Backend cloud (migraciones, functions)
│   ├── migrations/               # Archivos .sql versionados
│   ├── functions/                # Edge Functions (TypeScript)
│   ├── seed.sql                  # Datos iniciales
│   └── README.md
├── docs/                         # Documentación del proyecto
├── .claude/                      # Contexto para Claude Code
├── CLAUDE.md
└── README.md
```

## Flujo de datos — Movimiento del jugador

```
1. Usuario clickea celda
   ↓
2. Cell component → onSelect(position)
   ↓
3. useGameControls hook → validateAndApplyMove(position)
   ↓
4. gameEngineService.validateMove(state, position) → ValidationResult
   ↓ (si válido)
5. gameStore.makeMove(position) → aplica movimiento
   ↓
6. Si hay persistencia: tauriService.invoke('save_move', move)
   ↓
7. React re-render con nuevo estado → UI actualizada
```

## Decisiones de arquitectura

Ver `.claude/architecture-rules.md` para el detalle de cada ADR.
