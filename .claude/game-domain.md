# Game Domain — Ultimate Tic Tac Toe

Fuente de verdad sobre las reglas del juego y el modelo de dominio. Leer completo antes de tocar cualquier lógica de juego.

---

## Reglas del juego

### Estructura del tablero

- **Tablero principal (macroboard):** Grid 3×3 de 9 subtableros.
- **Subtablero (microboard):** Grid 3×3 individual. Total: 81 celdas.
- **Índices:** Las posiciones se identifican como `(macro_row, macro_col, micro_row, micro_col)` donde cada valor es `0`, `1` o `2`.

```
Macroboard (posiciones de subtableros):
┌──────┬──────┬──────┐
│ [0,0]│ [0,1]│ [0,2]│
├──────┼──────┼──────┤
│ [1,0]│ [1,1]│ [1,2]│
├──────┼──────┼──────┤
│ [2,0]│ [2,1]│ [2,2]│
└──────┴──────┴──────┘
```

### Flujo de turno

1. El primer movimiento puede hacerse en **cualquier celda de cualquier subtablero**.
2. Cada movimiento enviará al oponente a un subtablero específico:
   - Si el jugador juega en la celda `(micro_row, micro_col)` dentro de un subtablero, el oponente **debe jugar en el subtablero `[micro_row, micro_col]`** del macroboard.
3. **Excepción:** Si el subtablero destino ya está ganado o en empate (completo), el oponente puede jugar en **cualquier subtablero no completado**.

### Victoria en subtablero

Un jugador gana un subtablero cuando completa una línea de 3 (horizontal, vertical, diagonal) con sus marcas.

Las 8 líneas de victoria posibles por subtablero:
```
Horizontales: (0,0)(0,1)(0,2) | (1,0)(1,1)(1,2) | (2,0)(2,1)(2,2)
Verticales:   (0,0)(1,0)(2,0) | (0,1)(1,1)(2,1) | (0,2)(1,2)(2,2)
Diagonales:   (0,0)(1,1)(2,2) | (0,2)(1,1)(2,0)
```

Una vez ganado, el subtablero se **bloquea** (ningún jugador puede jugar en él) y cuenta como una posición del macroboard.

**Empate en subtablero:** Si todas las celdas están llenas sin ganador, el subtablero queda en empate (bloqueado, sin valor para nadie).

### Victoria en el juego

- Un jugador gana la partida al completar una línea de 3 subtableros ganados en el macroboard (mismas 8 combinaciones).
- **Empate global:** Si no hay ganador y todos los subtableros están bloqueados, la partida termina en empate.

---

## Modelo de datos del dominio

```typescript
// Tipos fundamentales

type Player = 'x' | 'o';
type CellValue = Player | null;
type SubBoardStatus = 'x_wins' | 'o_wins' | 'draw' | 'in_progress';
type GameStatus = 'x_wins' | 'o_wins' | 'draw' | 'in_progress' | 'not_started';

interface BoardPosition {
  macroRow: 0 | 1 | 2;
  macroCol: 0 | 1 | 2;
  microRow: 0 | 1 | 2;
  microCol: 0 | 1 | 2;
}

interface SubBoard {
  cells: [[CellValue, CellValue, CellValue],
           [CellValue, CellValue, CellValue],
           [CellValue, CellValue, CellValue]];
  status: SubBoardStatus;
  winner: Player | null;
}

interface MacroBoard {
  subBoards: [[SubBoard, SubBoard, SubBoard],
              [SubBoard, SubBoard, SubBoard],
              [SubBoard, SubBoard, SubBoard]];
  status: GameStatus;
  winner: Player | null;
}

interface Move {
  player: Player;
  position: BoardPosition;
  timestamp: number;
  moveNumber: number;
}

interface GameState {
  board: MacroBoard;
  currentPlayer: Player;
  activeSubBoard: { row: 0|1|2; col: 0|1|2 } | null; // null = libre elección
  moveHistory: Move[];
  status: GameStatus;
  startedAt: number;
  endedAt: number | null;
}
```

---

## Invariantes del juego (NUNCA violar)

1. **Turno alternado:** X siempre mueve primero. Los turnos alternan perfectamente sin excepción.
2. **Celda ocupada:** No se puede jugar en una celda que ya tiene valor.
3. **Subtablero bloqueado:** No se puede jugar en un subtablero con status distinto de `in_progress`.
4. **Subtablero forzado:** Si `activeSubBoard !== null`, el movimiento DEBE ser en ese subtablero.
5. **Movimiento final:** Una vez `gameStatus !== 'in_progress'`, no se aceptan más movimientos.
6. **Secuencia de historial:** `moveHistory[i].moveNumber === i + 1` siempre.

---

## Algoritmo de determinación del subtablero activo

```
función determinarSubtableroActivo(move: Move, board: MacroBoard):
  subRow = move.position.microRow
  subCol = move.position.microCol
  targetSubBoard = board.subBoards[subRow][subCol]
  
  si targetSubBoard.status === 'in_progress':
    return { row: subRow, col: subCol }
  sino:
    return null  // jugador elige libremente
```

---

## Modos de juego

### Local 1v1
- Dos jugadores en el mismo dispositivo.
- Sin tiempo por defecto (configurable).
- Historial guardado localmente.

### vs IA
- El jugador elige color (X u O).
- Niveles de dificultad: `easy` | `medium` | `hard` | `expert`.
- La IA computa en thread Rust separado.
- El nivel `expert` usa MCTS (Monte Carlo Tree Search).

### Online (fase futura)
- Room-based matchmaking.
- Timer obligatorio (configurable: 10s | 30s | 60s | 3min por movimiento).
- Reconexión dentro de 60 segundos.
- Si el timer expira, el jugador pierde el turno (movimiento aleatorio válido asignado) o pierde la partida (configurable por sala).

---

## Terminología canónica del proyecto

Usar siempre estos términos. No inventar sinónimos.

| Término | Descripción |
|---------|-------------|
| `macroboard` | El tablero principal 3×3 |
| `subboard` | Un subtablero individual 3×3 |
| `cell` | Una celda individual dentro de un subboard |
| `move` | Un movimiento completo (jugador + posición) |
| `active subboard` | El subboard donde el siguiente jugador DEBE jugar |
| `free choice` | Cuando `activeSubBoard === null` |
| `player X` | Jugador con marcas X, siempre mueve primero |
| `player O` | Jugador con marcas O, mueve segundo |
| `locked subboard` | Subboard ganado o en empate, no jugable |
| `game status` | Estado global: `not_started` | `in_progress` | terminado |

---

## Replay y análisis

El sistema de replay reconstruye el estado del juego reproduciendo `moveHistory` desde el inicio.

```
estadoInicial → aplicarMovimiento(move[0]) → estado[1]
             → aplicarMovimiento(move[1]) → estado[2]
             → ...
             → aplicarMovimiento(move[n]) → estadoFinal
```

La función `applyMove` debe ser **determinista y pura**: mismo input → mismo output. Esto garantiza que el replay siempre sea idéntico a la partida original.
