# Interfaz de agentes Python — Tricki Avanzado

Referencia completa para escribir agentes Python que jueguen Ultimate Tic Tac Toe dentro de la vista de desarrollador.

---

## Estructura mínima

Todo agente debe ser un archivo `.py` con una clase `Agent` que implemente dos métodos:

```python
class Agent:
    def mount(self) -> None:
        """Llamado una sola vez al inicio de la partida. Úsalo para inicializar estado."""
        pass

    def act(self, game_state: dict) -> tuple[int, int]:
        """
        Recibe el estado actual del tablero y retorna un movimiento.
        El movimiento debe ser una posición válida de la lista `valid_moves`.
        Retorna: (row, col) en coordenadas globales 0–8.
        """
        return tuple(game_state['valid_moves'][0])
```

Guarda el archivo en `~/.tricki/agents/mi_agente.py` y aparecerá en la lista.

---

## Protocolo de comunicación

La comunicación entre Rust y el agente usa **stdin/stdout con JSON**, una línea por turno.

### Rust → agente (stdin)

Rust envía una línea JSON por cada turno:

```json
{
  "board": [[int, ...], ...],
  "active_subboard": [int, int] | null,
  "player": 1 | -1,
  "valid_moves": [[int, int], ...]
}
```

### Agente → Rust (stdout)

El agente debe imprimir una línea JSON con el movimiento elegido:

```json
{"move": [row, col]}
```

- El par `[row, col]` debe ser uno de los valores en `valid_moves`.
- Usar `print(..., flush=True)` para garantizar que Rust reciba la respuesta.
- **Timeout:** 5 segundos por movimiento. Si el agente no responde a tiempo, pierde el turno.

---

## Campo `board`

El tablero es una lista de 9 sublistas, una por subtablero:

```
board[sb_index][cell_index]  →  1 (X) | -1 (O) | 0 (vacío)
```

Los subtableros están en orden fila-mayor:

```
sb 0 | sb 1 | sb 2
sb 3 | sb 4 | sb 5
sb 6 | sb 7 | sb 8
```

Las celdas dentro de cada subtablero también en orden fila-mayor:

```
cell 0 | cell 1 | cell 2
cell 3 | cell 4 | cell 5
cell 6 | cell 7 | cell 8
```

### Convertir coordenadas globales ↔ (sb, cell)

```python
# Global (row, col) → (sb, cell)
def global_to_local(row: int, col: int) -> tuple[int, int]:
    sb   = (row // 3) * 3 + (col // 3)
    cell = (row %  3) * 3 + (col %  3)
    return sb, cell

# (sb, cell) → Global (row, col)
def local_to_global(sb: int, cell: int) -> tuple[int, int]:
    sb_row, sb_col     = sb   // 3, sb   % 3
    cell_row, cell_col = cell // 3, cell % 3
    return sb_row * 3 + cell_row, sb_col * 3 + cell_col

# Leer una celda por coordenada global
def get_cell(board: list, row: int, col: int) -> int:
    sb, cell = global_to_local(row, col)
    return board[sb][cell]
```

---

## Campo `active_subboard`

Indica en qué subtablero debe jugar el agente este turno.

- `[sb_row, sb_col]` — el agente **debe** elegir una celda vacía dentro de ese subtablero.
- `null` — el agente puede jugar en cualquier subtablero disponible.

```python
if game_state['active_subboard'] is None:
    # Libre para jugar en cualquier subtablero
else:
    sb_row, sb_col = game_state['active_subboard']
    # Solo jugar en ese subtablero
```

---

## Campo `player`

Indica de qué lado juega el agente en este turno:

- `1`  → el agente juega como **X**
- `-1` → el agente juega como **O**

---

## Campo `valid_moves`

Lista de todos los movimientos legales en este turno, en coordenadas globales `[row, col]`. El agente **debe** retornar uno de estos valores. Cualquier otro valor causará un error.

```python
valid_moves = game_state['valid_moves']  # [[0, 0], [0, 1], ...]
```

---

## Representar el tablero completo como matriz 9×9

Si prefieres trabajar con una matriz plana en lugar del formato `board[sb][cell]`:

```python
def to_matrix(board: list) -> list[list[int]]:
    """Convierte board[sb][cell] a una matriz 9x9 indexada por [row][col]."""
    matrix = [[0] * 9 for _ in range(9)]
    for sb in range(9):
        sb_row, sb_col = sb // 3, sb % 3
        for cell in range(9):
            cell_row, cell_col = cell // 3, cell % 3
            row = sb_row * 3 + cell_row
            col = sb_col * 3 + cell_col
            matrix[row][col] = board[sb][cell]
    return matrix
```

---

## Restricciones

- Solo librerías estándar de Python. `numpy` está permitido.
- No usar `torch`, `tensorflow`, ni otras librerías pesadas.
- El agente se ejecuta en un subprocess aislado — no tiene acceso a la red ni a archivos del juego.
- El estado entre turnos se mantiene en atributos de la instancia `Agent` (Rust llama a `mount()` una sola vez y reutiliza el proceso durante toda la partida).

---

## Ejemplo completo

```python
import random

class Agent:
    def mount(self):
        self.rng = random.Random(42)

    def act(self, game_state: dict) -> tuple[int, int]:
        moves = game_state['valid_moves']
        chosen = self.rng.choice(moves)
        return tuple(chosen)
```

Ver `docs/agent-template.py` para una plantilla comentada lista para usar.
