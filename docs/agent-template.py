"""
Plantilla de agente para Tricki Avanzado — Ultimate Tic Tac Toe
Documentación completa: docs/agent-interface.md

Guarda este archivo en ~/.tricki/agents/ y aparecerá en la vista de desarrollador.

PROTOCOLO
---------
Rust envía por stdin (una línea JSON por turno):
  {
    "board":            list[list[int]],      # board[sb][cell] = 1(X) | -1(O) | 0
    "active_subboard":  [int, int] | None,    # subtablero obligatorio, o None = libre
    "player":           1 | -1,              # 1 = juegas como X, -1 = juegas como O
    "valid_moves":      list[[int, int]]      # movimientos legales en coords globales
  }

El agente responde por stdout (una línea JSON):
  {"move": [row, col]}   # debe ser un valor de valid_moves

Timeout: 5 segundos por movimiento.
"""


# ─── Utilidades de coordenadas ────────────────────────────────────────────────

def global_to_local(row: int, col: int) -> tuple[int, int]:
    """Convierte coordenadas globales (0-8, 0-8) a (sb_index, cell_index)."""
    sb   = (row // 3) * 3 + (col // 3)
    cell = (row %  3) * 3 + (col %  3)
    return sb, cell


def to_matrix(board: list) -> list[list[int]]:
    """
    Convierte board[sb][cell] a una matriz 9×9 indexada por [row][col].
    Útil si prefieres trabajar con coordenadas fila/columna directas.
    """
    matrix = [[0] * 9 for _ in range(9)]
    for sb in range(9):
        sb_row, sb_col = sb // 3, sb % 3
        for cell in range(9):
            cell_row, cell_col = cell // 3, cell % 3
            matrix[sb_row * 3 + cell_row][sb_col * 3 + cell_col] = board[sb][cell]
    return matrix


def get_cell(board: list, row: int, col: int) -> int:
    """Lee el valor de una celda por coordenada global."""
    sb, cell = global_to_local(row, col)
    return board[sb][cell]


# ─── Agente ───────────────────────────────────────────────────────────────────

class Agent:
    """
    Implementa tu lógica aquí.

    mount()  → llamado una vez al inicio. Inicializa estado persistente.
    act()    → llamado en cada turno. Retorna (row, col) de valid_moves.
    """

    def mount(self) -> None:
        """
        Inicialización. Rust llama a mount() una sola vez y reutiliza este
        objeto durante toda la partida, así que puedes guardar estado aquí.
        """
        # Ejemplo: inicializar historial de movimientos
        self.move_history: list[tuple[int, int]] = []
        self.my_side: int | None = None  # se detecta en el primer act()

    def act(self, game_state: dict) -> tuple[int, int]:
        """
        Decide el siguiente movimiento.

        Args:
            game_state: diccionario con board, active_subboard, player, valid_moves

        Returns:
            (row, col) — debe ser un elemento de valid_moves
        """
        board          = game_state['board']           # list[list[int]]
        active_sb      = game_state['active_subboard'] # [row, col] | None
        player         = game_state['player']          # 1 = X, -1 = O
        valid_moves    = game_state['valid_moves']     # list[[row, col]]

        # Detectar de qué lado juega este agente
        if self.my_side is None:
            self.my_side = player

        # ── Escribe tu lógica aquí ─────────────────────────────────────────
        #
        # Ejemplos de acceso al tablero:
        #   matrix = to_matrix(board)          # matriz 9×9 estándar
        #   value  = get_cell(board, row, col) # celda por coord global
        #   value  = board[sb][cell]           # celda por (sb, cell) directo
        #
        # active_sb indica en qué subtablero jugar (None = libre):
        #   if active_sb is not None:
        #       sb_row, sb_col = active_sb
        #
        # Siempre retorna un movimiento de valid_moves:
        #   return tuple(valid_moves[0])       # primer movimiento válido

        move = self._choose(board, active_sb, player, valid_moves)
        self.move_history.append(move)
        return move

    def _choose(
        self,
        board: list,
        active_sb: list | None,
        player: int,
        valid_moves: list,
    ) -> tuple[int, int]:
        """
        Estrategia por defecto: primer movimiento válido.
        Reemplaza este método con tu lógica real.
        """
        return tuple(valid_moves[0])
