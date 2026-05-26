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

El estado del juego usa un **flat array de 9 elementos** para los subtableros (en lugar de matriz 3×3). Esto simplifica la indexación: una celda en el rango 0-8 de un subtablero determina directamente el índice 0-8 del siguiente subtablero forzado.

```typescript
// Tipos fundamentales

type Player = 'X' | 'O';
type CellValue = Player | null;
type SubBoardWinner = Player | 'draw' | null;

interface SubBoardState {
  cells: CellValue[];        // array de 9 elementos (índices 0-8)
  winner: SubBoardWinner;    // 'X' | 'O' | 'draw' | null
  winLine: number[] | null;  // índices de las 3 celdas ganadoras, o null
}

interface MoveHistory {
  n: number;           // número de movimiento (1, 2, 3, ...)
  by: Player;          // quién hizo el movimiento ('X' | 'O')
  sb: number;          // índice del subtablero (0-8)
  cell: number;        // índice de la celda dentro del subtablero (0-8)
}

interface GameState {
  sb: SubBoardState[];           // array de 9 subtableros (índices 0-8)
  turn: Player;                   // jugador actual ('X' | 'O')
  activeSb: number | null;        // índice del subtablero forzado (0-8), null = libre elección
  lastMove: { sb: number; cell: number } | null;
  history: MoveHistory[];
}
```

**Indexación de flat array:**
- Subtableros: índices 0-8 corresponden a la disposición 3×3: `[0,1,2 | 3,4,5 | 6,7,8]`
- Celdas dentro de subtablero: índices 0-8 con el mismo mapeo
- Conversión a coordenadas 2D: `row = index ÷ 3`, `col = index mod 3`

---

## Invariantes del juego (NUNCA violar)

1. **Turno alternado:** X siempre mueve primero. Los turnos alternan perfectamente sin excepción.
2. **Celda ocupada:** No se puede jugar en una celda que ya tiene valor (`cells[index] === null`).
3. **Subtablero bloqueado:** No se puede jugar en un subtablero cuyo `winner !== null`.
4. **Subtablero forzado:** Si `activeSb !== null`, el movimiento DEBE ser en ese subtablero.
5. **Movimiento final:** Una vez `gameWinner !== null` en el store, no se aceptan más movimientos.
6. **Secuencia de historial:** `history[i].n === i + 1` siempre.

---

## Algoritmo de determinación del subtablero activo

La celda donde juega el jugador (índice 0-8) determina directamente el índice del siguiente subtablero forzado, porque ambos usan la misma indexación de flat array.

```
función determinarSubtableroActivo(cellIndex: number, board: GameState):
  // cellIndex es el índice (0-8) de la celda donde se jugó
  targetSb = board.sb[cellIndex]  // accede al subtablero en el mismo índice
  
  si targetSb.winner === null:    // subtablero no está ganado ni empatado
    return cellIndex              // fuerza el siguiente movimiento en ese subtablero
  sino:
    return null                   // subtablero bloqueado, jugador elige libremente
```

**Ejemplo:**
- Jugador X juega en celda `2` del subtablero `0` → el siguiente subtablero forzado es `sb[2]`
- Si `sb[2]` ya está ganado o empatado → `activeSb = null` → O puede jugar en cualquier subtablero no bloqueado

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

| Término | Descripción | Variable en código |
|---------|-------------|-------------------|
| `macroboard` | El tablero principal 3×3 (colección de 9 subtableros) | `GameState.sb[]` (array de 9) |
| `subboard` | Un subtablero individual 3×3 | `SubBoardState`, `sb[0]` a `sb[8]` |
| `cell` | Una celda individual dentro de un subboard | `cells[0]` a `cells[8]` |
| `move` | Un movimiento completo (jugador + posición) | `MoveHistory` |
| `active subboard` | El subboard donde el siguiente jugador DEBE jugar | `activeSb` (índice 0-8 o null) |
| `free choice` | Cuando `activeSb === null` | Permite jugar en cualquier subboard no bloqueado |
| `player X` | Jugador con marcas X, siempre mueve primero | `'X'` |
| `player O` | Jugador con marcas O, mueve segundo | `'O'` |
| `locked subboard` | Subboard ganado o en empate, no jugable | `winner !== null` |
| `game winner` | Ganador de la partida o empate | `gameWinner` en store |

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
