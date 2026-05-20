# Frontend

## Rutas

```typescript
// src/config/routes.ts
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  LOBBY: '/lobby',
  CREATE_MATCH: '/lobby/create',
  JOIN_MATCH: '/lobby/join/:roomCode',
  MATCH: '/match/:matchId',
  GAME_RESULT: '/match/:matchId/result',
  RECONNECTING: '/reconnecting',
  DISCONNECTED: '/disconnected',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  HISTORY: '/history',
  REPLAY: '/replay/:matchId',
} as const;
```

## Vistas — Responsabilidades y componentes

---

### Home `/`

**Propósito:** Punto de entrada. El jugador decide qué hacer.

**Componentes:**
- `LogoMark` — Logo + nombre del juego
- `MainMenu` — Botones de acción principal
- `RecentMatchCard` — Última partida (si existe en historial)
- `ConnectionStatusBadge` — Online/offline indicator

**Acciones disponibles:**
- Partida local rápida → navega a `/match/local-new`
- Partida contra IA → navega a `CreateMatch` con modo IA
- Jugar online → navega a `/lobby` (requiere login, fase futura)
- Ver historial → `/history`
- Configuración → `/settings`

**Estado requerido:** `userStore.profile` (para saludo), `uiStore.theme`

---

### Login `/login`

**Propósito:** Autenticación para funciones online. Fase futura — vista preparada pero con feature flag.

**Componentes:**
- `AuthCard` — Container del formulario
- `Input` (email, password)
- `Button` (primary: Iniciar sesión, ghost: Continuar sin cuenta)
- `Divider` con texto "o"
- `SocialAuthButton` (Google, fase futura)

**Estado requerido:** Feature flag `FEATURES.MULTIPLAYER`

---

### Register `/register`

**Propósito:** Creación de cuenta. Fase futura.

**Componentes:** Similares a Login + campos adicionales (nombre de usuario).

---

### Lobby `/lobby`

**Propósito:** Hub para partidas online. Ver salas disponibles, crear o unirse.

**Componentes:**
- `RoomList` — Lista de salas públicas con filtros
- `RoomCard` — Preview de sala (jugadores, tiempo, estado)
- `QuickMatchButton` — Matchmaking automático
- `CreateRoomButton` → `/lobby/create`
- `JoinCodeInput` — Unirse con código directo

**Estado requerido:** `networkStore.rooms`, `networkStore.connectionStatus`

---

### CreateMatch `/lobby/create`

**Propósito:** Configurar una nueva partida (local, IA u online).

**Componentes:**
- `GameModeSelector` — Local / IA / Online (tabs)
- `TimerConfig` — Sin límite / 10s / 30s / 60s / 3min por movimiento
- `DifficultySelector` — (visible solo en modo IA)
- `RoomPrivacyToggle` — Pública / Privada (visible en modo Online)
- `MatchPreviewCard` — Resumen de configuración antes de confirmar

**Estado requerido:** `matchStore.pendingConfig`

---

### JoinMatch `/lobby/join/:roomCode`

**Propósito:** Unirse a una sala específica.

**Componentes:**
- `RoomPreviewCard` — Info de la sala (host, configuración)
- `PlayerSlots` — Ver quién está ya en la sala
- `JoinButton`
- `SpectateButton` (fase futura)

---

### Match `/match/:matchId`

**Propósito:** La vista principal. El corazón de la aplicación.

**Layout:** `SplitLayout` — tablero izquierda, panel derecha.

**Componentes — Zona del tablero:**
- `GameBoard` — Macroboard completo
- `ActiveSubBoardIndicator` — Mini-mapa indicando el subtablero activo

**Componentes — Panel lateral:**
- `PlayerCard` (x2 — jugador superior e inferior)
  - Avatar, nombre, color del jugador
  - Timer (si hay límite de tiempo)
  - Indicador de turno activo
- `MoveHistoryList` — Lista de movimientos con notación
- `GameControls`
  - `ResignButton` (rendirse)
  - `DrawOfferButton` (proponer tablas) — Online
  - `PauseButton` — Local

**Estado requerido:** `gameStore` completo, `matchStore.metadata`

**Consideraciones de rendimiento:**
- El tablero NUNCA re-renderiza completamente en cada movimiento.
- Solo la celda modificada, el subtablero afectado y el indicador de turno se actualizan.
- Usar `React.memo` en `Cell` y `SubBoard`.

---

### GameResult `/match/:matchId/result`

**Propósito:** Pantalla de fin de partida. Momento de celebración o análisis.

**Componentes:**
- `ResultHero` — Victoria / Derrota / Empate con animación
- `FinalBoardSnapshot` — Tablero final (solo visual, no interactivo)
- `MatchSummary` — Duración, cantidad de movimientos, último movimiento
- `ActionButtons`
  - Revancha (si es local o si el oponente acepta)
  - Ver replay
  - Volver al inicio

**Estado requerido:** `matchStore.result`, `gameStore.moveHistory`

---

### Reconnecting `/reconnecting`

**Propósito:** Pantalla transitoria durante reconexión a partida online.

**Componentes:**
- `ReconnectingSpinner` con contador regresivo (60s)
- `MatchContextSummary` — A qué partida se está reconectando
- `AbandonMatchButton` — Opción de rendirse si no se puede reconectar

---

### Disconnected `/disconnected`

**Propósito:** El oponente se desconectó. El jugador espera o declara victoria.

**Componentes:**
- `DisconnectNotice` — "Tu oponente se desconectó"
- `WaitingTimer` — Tiempo restante para que el oponente vuelva
- `ClaimVictoryButton` — Declarar victoria por abandono (aparece después de N segundos)

---

### Settings `/settings`

**Propósito:** Configuración de la aplicación.

**Secciones:**
- **Apariencia:** Tema (oscuro/claro/sistema), tamaño de tablero
- **Sonido:** Efectos on/off, volumen
- **Juego:** Animaciones on/off, confirmación antes de mover
- **Cuenta:** (fase futura) Cambiar nombre, avatar, contraseña
- **Acerca de:** Versión de la app, licencias

**Componentes:**
- `SettingsSection` — Container por categoría
- `Toggle`, `Slider`, `Select` del design system

**Estado requerido:** `userStore.preferences`

---

### Profile `/profile`

**Propósito:** Estadísticas y logros del jugador local.

**Componentes:**
- `ProfileHeader` — Avatar, nombre, nivel
- `StatsGrid` — Partidas jugadas, ganadas, perdidas, empates, winrate
- `RecentMatchList` — Últimas 10 partidas con resultado
- `AchievementGrid` (fase futura)

---

### History `/history`

**Propósito:** Historial completo de partidas.

**Componentes:**
- `MatchFilter` — Filtros por modo, resultado, fecha, oponente
- `MatchHistoryTable` — Lista paginada de partidas
- `MatchRow` — Fecha, oponente, resultado, duración, botón de replay

**Estado requerido:** `historyService` via hook

---

### Replay `/replay/:matchId`

**Propósito:** Reproducir una partida movimiento a movimiento.

**Layout:** Igual que `Match` pero en modo read-only.

**Componentes adicionales:**
- `ReplayControls` — Play/Pause, paso anterior, paso siguiente, velocidad
- `MoveHighlighter` — Resalta el movimiento actual en el tablero
- `CurrentMovePanel` — Número de movimiento, jugador, posición

**Estado requerido:** `useReplay(matchId)` hook con estado local de reproducción

---

## Estrategia de lazy loading

Todas las páginas se importan con `React.lazy()`. Solo `Home`, `Match` y `GameResult` se pre-cargan.

```typescript
const Match = lazy(() => import('@/pages/Match'));
const History = lazy(() => import('@/pages/History'));
const Replay = lazy(() => import('@/pages/Replay'));
// etc.
```
