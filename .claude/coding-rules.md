# Coding Rules

Estándares de código del proyecto. Aplicables a todo el equipo y a Claude Code.

---

## TypeScript

### Reglas de tipos

```typescript
// ✅ Correcto
type GameResult = 'x_wins' | 'o_wins' | 'draw' | 'in_progress';

interface CellProps {
  position: BoardPosition;
  value: CellValue;
  isPlayable: boolean;
  onSelect: (position: BoardPosition) => void;
}

// ❌ Prohibido
const handleClick = (data: any) => { ... }
type Result = object;
```

- **Prohibido `any`.** Usar `unknown` con narrowing o tipos específicos.
- **Prohibido type assertions (`as`) sin comentario explicativo.**
- **Enums numéricos prohibidos.** Usar string literal unions o `const` objects.
- **Todos los arrays con tipo explícito.** No `[]`, sino `Move[]`.
- Preferir `type` sobre `interface` para tipos de datos puros. `interface` para contratos de objeto con extensión esperada.

### Organización de tipos

```
src/types/
├── game.types.ts       # BoardState, Move, GameResult, Player, SubBoard
├── match.types.ts      # MatchConfig, MatchStatus, MatchMetadata
├── user.types.ts       # UserProfile, UserStats, Preferences
├── network.types.ts    # RoomState, PeerInfo, NetworkEvent
├── ipc.types.ts        # Tipos de retorno de comandos Tauri
├── api.types.ts        # DTOs para comunicación con backend futuro
└── ui.types.ts         # Theme, NotificationPayload, ModalConfig
```

---

## React

### Estructura de componente

```typescript
// src/components/game/GameBoard/index.tsx

import { type FC } from 'react';
import type { GameBoardProps } from './GameBoard.types';
import { SubBoard } from '@/components/game/SubBoard';
import { useGameStore } from '@/stores/game.store';

export const GameBoard: FC<GameBoardProps> = ({ onMoveSelect }) => {
  // 1. Hooks al tope (siempre)
  const { boardState, activeSubBoard } = useGameStore();

  // 2. Handlers claramente nombrados
  const handleCellSelect = (position: BoardPosition) => {
    onMoveSelect(position);
  };

  // 3. Early returns para estados de carga/error
  if (!boardState) return <GameBoardSkeleton />;

  // 4. JSX limpio, sin lógica compleja inline
  return (
    <div className="game-board" role="grid" aria-label="Tablero de juego">
      {boardState.subBoards.map((subBoard, index) => (
        <SubBoard
          key={index}
          data={subBoard}
          isActive={activeSubBoard === index}
          onCellSelect={handleCellSelect}
        />
      ))}
    </div>
  );
};
```

Reglas:
- Componentes siempre con `FC<Props>` tipado explícito.
- Props en archivo separado `ComponentName.types.ts` si tienen más de 3 propiedades.
- No `default export` para componentes (usar named exports).
- Un componente por archivo. Sin excepciones.
- Máximo 150 líneas por componente. Si supera, dividir.

### Custom Hooks

```typescript
// src/hooks/game/useGameTimer.ts
export function useGameTimer(durationSeconds: number) {
  // Lógica encapsulada
  return { timeRemaining, isRunning, start, stop, reset };
}
```

- Siempre retornan un objeto con propiedades nombradas (no arrays, excepto para casos estilo `useState`).
- El nombre describe **qué hace**, no de dónde viene. `useMatchTimer`, no `useGameStore`.
- Los hooks que acceden a stores se nombran con el store: `useGameStore`, `useUserStore`.

### Importaciones

Orden estricto (enforced por ESLint):
1. React y librerías externas
2. Tipos (`import type`)
3. Stores
4. Servicios
5. Componentes (absolutos con `@/`)
6. Hooks
7. Utils
8. Assets

```typescript
// Alias configurado en vite.config.ts y tsconfig.json
import { GameBoard } from '@/components/game/GameBoard';
import { useGameStore } from '@/stores/game.store';

// Nunca rutas relativas fuera del mismo módulo
// ❌ import { X } from '../../../components/game/GameBoard'
// ✅ import { X } from '@/components/game/GameBoard'
```

---

## Zustand Stores

```typescript
// src/stores/game.store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { GameState, Move } from '@/types/game.types';

interface GameStore {
  // Estado — siempre al tope
  boardState: GameState | null;
  currentPlayer: Player;
  activeSubBoard: number | null;
  moveHistory: Move[];

  // Acciones — claramente separadas del estado
  initGame: (config: MatchConfig) => void;
  makeMove: (move: Move) => void;
  undoLastMove: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      boardState: null,
      currentPlayer: 'x',
      activeSubBoard: null,
      moveHistory: [],

      initGame: (config) => set({ ... }),
      makeMove: (move) => {
        const currentState = get().boardState;
        // Validación en servicio, nunca en el store
        const newState = gameEngineService.applyMove(currentState, move);
        set({ boardState: newState, moveHistory: [...get().moveHistory, move] });
      },
    }),
    { name: 'GameStore' }
  )
);
```

Reglas:
- Las acciones del store NO contienen lógica de negocio compleja — delegan a servicios.
- El estado del store es siempre **serializable** (no funciones, no instancias de clase).
- `devtools` middleware en todos los stores durante desarrollo.
- `persist` middleware solo donde sea explícitamente necesario.

---

## Servicios

```typescript
// src/services/gameEngine.service.ts

// Servicios como módulos de funciones puras, no clases
export function applyMove(state: GameState, move: Move): GameState { ... }
export function validateMove(state: GameState, move: Move): ValidationResult { ... }
export function detectVictory(state: GameState): VictoryResult | null { ... }
export function getPlayableSubBoards(state: GameState): number[] { ... }
```

- Servicios como **módulos de funciones** (no clases, salvo casos justificados como WebSocket manager).
- Funciones puras donde sea posible — mismo input, mismo output.
- Side effects explícitos y aislados.
- Cada servicio tiene su archivo de tipos si los necesita.

---

## Rust (src-tauri/src/)

```rust
// src-tauri/src/commands/game.rs

#[tauri::command]
pub async fn save_match(
    app: AppHandle,
    match_data: MatchRecord,
) -> Result<SavedMatch, AppError> {
    let db = app.state::<DbConnection>();
    db.insert_match(match_data).await.map_err(AppError::from)
}
```

- Todos los comandos Tauri retornan `Result<T, AppError>`.
- `AppError` es un enum centralizado en `src-tauri/src/error.rs`.
- Nunca `unwrap()` o `expect()` en código de producción.
- Operaciones de IO siempre `async`.
- Módulos organizados por dominio: `commands/`, `db/`, `game/`, `auth/`.

---

## Testing

### Cobertura mínima por capa

| Capa | Tipo de test | Cobertura mínima |
|------|-------------|-----------------|
| Lógica de juego (services) | Unit | 95% |
| Stores Zustand | Unit | 80% |
| Componentes críticos | Integration | 70% |
| Flujos completos | E2E | Happy path + 2 edge cases |
| Comandos Rust | Unit (Rust) | 90% |

### Convenciones de test

```typescript
// GameBoard.test.tsx
describe('GameBoard', () => {
  describe('cuando el subtablero activo cambia', () => {
    it('debe resaltar visualmente el subtablero correcto', () => { ... });
    it('debe deshabilitar la interacción en subtableros inactivos', () => { ... });
  });
});
```

- `describe` en español, `it` en español con "debe".
- Factories para datos de test en `src/__tests__/factories/`.
- No snapshots de componentes completos (se desactualizan).
- Tests de comportamiento, no de implementación.

---

## Git

### Branch naming
```
feat/game-board-highlighting
fix/active-subboard-detection
refactor/game-engine-validation
test/game-engine-coverage
docs/architecture-decisions
```

### Commits (Conventional Commits)
```
feat(game): add subboard highlighting on move
fix(ui): correct timer display on match end
refactor(store): extract move validation to service
test(engine): add coverage for draw detection
```

### Reglas
- Un commit por cambio lógico.
- Nunca commits con "WIP" o "fix" sin descripción.
- PR obligatorio para cambios en `stores/`, `services/`, `types/`.
