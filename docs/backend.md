# Backend (Rust / Tauri)

## Comandos Tauri expuestos al frontend

Todos los comandos viven en `src-tauri/src/commands/`. El frontend los accede **únicamente** a través de `src/services/tauri.service.ts`.

### Comandos del juego

```rust
// commands/game.rs
save_match(match_data: MatchRecord) -> Result<SavedMatch, AppError>
get_match(match_id: String) -> Result<MatchRecord, AppError>
delete_match(match_id: String) -> Result<(), AppError>
```

### Comandos de historial

```rust
// commands/history.rs
get_match_history(filters: HistoryFilters) -> Result<Vec<MatchSummary>, AppError>
get_match_moves(match_id: String) -> Result<Vec<Move>, AppError>
get_user_stats() -> Result<UserStats, AppError>
```

### Comandos de usuario

```rust
// commands/user.rs
get_preferences() -> Result<UserPreferences, AppError>
save_preferences(prefs: UserPreferences) -> Result<(), AppError>
get_profile() -> Result<UserProfile, AppError>
```

### Comandos de IA

```rust
// commands/ai.rs
// Llama al motor de IA en un thread separado para no bloquear UI
compute_ai_move(state: GameStateDTO, difficulty: AiDifficulty) -> Result<Move, AppError>
```

## Persistencia

### Base de datos (SQLite)

Schema principal:

```sql
-- Partidas
CREATE TABLE matches (
  id TEXT PRIMARY KEY,
  mode TEXT NOT NULL, -- 'local' | 'ai' | 'online'
  player_x_name TEXT NOT NULL,
  player_o_name TEXT NOT NULL,
  result TEXT NOT NULL, -- 'x_wins' | 'o_wins' | 'draw'
  total_moves INTEGER NOT NULL,
  duration_seconds INTEGER NOT NULL,
  started_at INTEGER NOT NULL, -- Unix timestamp
  ended_at INTEGER NOT NULL
);

-- Movimientos
CREATE TABLE moves (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id TEXT NOT NULL REFERENCES matches(id),
  move_number INTEGER NOT NULL,
  player TEXT NOT NULL,
  macro_row INTEGER NOT NULL,
  macro_col INTEGER NOT NULL,
  micro_row INTEGER NOT NULL,
  micro_col INTEGER NOT NULL,
  timestamp_ms INTEGER NOT NULL
);

-- Estadísticas de usuario
CREATE TABLE user_stats (
  id INTEGER PRIMARY KEY,
  total_matches INTEGER DEFAULT 0,
  wins_x INTEGER DEFAULT 0,
  wins_o INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  last_updated INTEGER
);
```

### Preferencias de usuario

Guardadas con el plugin `tauri-plugin-store` en JSON:
```json
{
  "theme": "dark",
  "soundEnabled": true,
  "soundVolume": 0.8,
  "animationsEnabled": true,
  "confirmBeforeMove": false,
  "boardSize": "auto"
}
```

## Manejo de errores

`AppError` es el único tipo de error que cruza la frontera IPC:

```rust
// src-tauri/src/error.rs
#[derive(Debug, thiserror::Error, serde::Serialize)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(String),
    #[error("Match not found: {0}")]
    NotFound(String),
    #[error("Invalid move: {0}")]
    InvalidMove(String),
    #[error("AI computation failed")]
    AiError,
    #[error("IO error: {0}")]
    Io(String),
}
```

## Supabase (Cloud Backend)

### Responsabilidad

Supabase maneja toda la persistencia cloud y servicios que requieren backend remoto:
- **Autenticación:** Gestión de usuarios, sesiones, JWT tokens, recuperación de contraseña
- **Base de datos PostgreSQL:** Datos online como ranking global, historial de partidas multijugador, perfiles públicos
- **Realtime:** Suscripciones para actualizaciones en tiempo real durante partidas multijugador
- **Storage:** Avatares, imágenes de perfil (fase futura)

### Regla TypeScript vs Rust

**TypeScript (service layer):** Acceso directo vía `@supabase/supabase-js` desde `src/services/supabase.service.ts`. Cubre:
- Login / logout
- Lectura de perfil del usuario
- Consultas de ranking
- Historial de partidas online
- Suscripción a eventos realtime

**Rust (solo cuando sea necesario):** HTTP client en `src-tauri/src/supabase/` para operaciones que requieren `service_role` key (nunca exponerla al frontend):
- Crear usuario admin
- Modificar estadísticas (anti-cheat)
- Ejecutar stored procedures
- Limpiar datos expirados

### Configuración del proyecto

Variables de entorno requeridas en `.env.local`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

No incluir `SUPABASE_SERVICE_ROLE_KEY` en el frontend. Solo en Rust si es necesario.

### Estructura del repositorio

La carpeta `supabase/` en la raíz del monorepo contiene:
```
supabase/
├── migrations/          # Archivos .sql de schema (versionados)
├── functions/           # Edge Functions (TypeScript ejecutado en Supabase)
├── seed.sql            # Datos iniciales (usuarios de prueba, constantes)
└── README.md           # Documentación de esquema
```

Las migraciones se aplican automáticamente en CI/CD antes de desplegar la app.

### Servicio TypeScript

`src/services/supabase.service.ts` es el único punto de entrada al cliente de Supabase:

```typescript
// Exporta funciones tipadas que encapsulan operaciones Supabase
export const supabaseService = {
  auth: {
    login: (email: string, password: string) => Promise<User>,
    logout: () => Promise<void>,
    getCurrentUser: () => User | null,
  },
  ranking: {
    getGlobalRanking: () => Promise<RankingEntry[]>,
    getUserStats: (userId: string) => Promise<UserStats>,
  },
  matches: {
    saveRemoteMatch: (matchData: RemoteMatch) => Promise<void>,
    getOnlineMatches: (filters?: Filter) => Promise<OnlineMatch[]>,
  },
};
```

Nunca imports directos de `@supabase/supabase-js` desde otros lugares. Solo desde este servicio.
```
