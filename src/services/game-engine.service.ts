// src/services/game-engine.service.ts
// Pure game engine logic for Ultimate Tic Tac Toe.
// Deterministic state transitions, validation, and evaluation.

import type { GameState, Player } from '@/types/game';
import { checkMetaWin, checkWin, initGame, reconstructBoardState } from '@/utils/boardUtils';

export interface MoveApplicationResult {
  nextState: GameState;
  gameWinner: Player | 'draw' | null;
  isValid: boolean;
}

export const gameEngineService = {
  initGame,
  checkWin,
  checkMetaWin,
  reconstructBoardState,

  /**
   * Validates whether a move at (sb, cell) is legal under the current game state.
   */
  validateMove(game: GameState, sb: number, cell: number, gameWinner: Player | 'draw' | null): boolean {
    if (gameWinner !== null) return false;
    if (sb < 0 || sb > 8 || cell < 0 || cell > 8) return false;
    if (game.sb[sb].winner !== null) return false;
    if (game.sb[sb].cells[cell] !== null) return false;
    if (game.activeSb !== null && game.activeSb !== sb) return false;
    return true;
  },

  /**
   * Applies a move deterministically, returning the new game state and winner status.
   * Does not mutate the original state.
   */
  applyMove(game: GameState, sb: number, cell: number): MoveApplicationResult {
    if (!this.validateMove(game, sb, cell, null)) {
      return { nextState: game, gameWinner: null, isValid: false };
    }

    const next: GameState = JSON.parse(JSON.stringify(game)) as GameState;

    // Apply the move to the targeted cell
    next.sb[sb].cells[cell] = next.turn;

    // Check sub-board win
    const subResult = checkWin(next.sb[sb].cells);
    if (subResult.winner) {
      next.sb[sb].winner = subResult.winner;
      next.sb[sb].winLine = subResult.line;
    }

    // Check global (meta) win
    const metaResult = checkMetaWin(next.sb.map((s) => s.winner));
    let gameWinner: Player | 'draw' | null = null;
    if (metaResult.winner === 'X' || metaResult.winner === 'O') {
      gameWinner = metaResult.winner;
    } else if (metaResult.winner === 'draw') {
      gameWinner = 'draw';
    }

    // Determine next active sub-board (free choice if target sub-board is decided)
    const targetSb = next.sb[cell];
    next.activeSb = targetSb.winner ? null : cell;

    // Record move in history
    const lastMoveNum = next.history[next.history.length - 1]?.n ?? 0;
    next.history = [
      ...next.history,
      {
        n: lastMoveNum + 1,
        by: game.turn,
        sb,
        cell,
      },
    ];

    next.lastMove = { sb, cell };

    // Alternate turn
    next.turn = next.turn === 'X' ? 'O' : 'X';

    return { nextState: next, gameWinner, isValid: true };
  },

  /**
   * Returns all currently legal moves for the active state.
   */
  getLegalMoves(game: GameState): Array<{ sb: number; cell: number }> {
    const moves: Array<{ sb: number; cell: number }> = [];
    const targetSubBoards = game.activeSb !== null && game.sb[game.activeSb].winner === null
      ? [game.activeSb]
      : [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((i) => game.sb[i].winner === null);

    for (const sb of targetSubBoards) {
      for (let cell = 0; cell < 9; cell++) {
        if (game.sb[sb].cells[cell] === null) {
          moves.push({ sb, cell });
        }
      }
    }
    return moves;
  },
};
