// useAgentGame.ts
// Drives the Python agent turn: when it is the agent's turn (botSide === game.turn),
// builds a payload from the current board, calls pythonAgentService.makeMove, and
// applies the resulting move to the game store.

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { pythonAgentService } from '../services/pythonAgentService';
import type { PythonGameStatePayload } from '../types/agent.types';
import type { GameState } from '../types/game';

// ─── Board encoding helpers ───────────────────────────────────────────────────

/**
 * Encodes a GameState into the PythonGameStatePayload the Python agent expects.
 *
 * board: 9x9 matrix where board[sb][cell] = 1 (X), -1 (O), 0 (empty).
 * player: 1 for X's turn, -1 for O's turn.
 * activeSubboard: [globalRow, globalCol] derived from activeSb, or null.
 * validMoves: all legal global [row, col] pairs on the full 9x9 board.
 *
 * Global coordinate encoding (matches wrapper script convention):
 *   globalRow = sbRow * 3 + cellRow  (0..8)
 *   globalCol = sbCol * 3 + cellCol  (0..8)
 *   where sbRow = Math.floor(sb / 3), sbCol = sb % 3
 *         cellRow = Math.floor(cell / 3), cellCol = cell % 3
 */
function buildPayload(game: GameState): PythonGameStatePayload {
  const board: number[][] = game.sb.map((sb) =>
    sb.cells.map((c) => (c === 'X' ? 1 : c === 'O' ? -1 : 0)),
  );

  const player = game.turn === 'X' ? (1 as const) : (-1 as const);

  let activeSubboard: [number, number] | null = null;
  if (game.activeSb !== null) {
    const sbRow = Math.floor(game.activeSb / 3);
    const sbCol = game.activeSb % 3;
    activeSubboard = [sbRow, sbCol];
  }

  const validMoves: [number, number][] = [];
  const candidateSbs =
    game.activeSb !== null
      ? [game.activeSb]
      : game.sb.map((_, i) => i).filter((i) => game.sb[i].winner === null);

  for (const sb of candidateSbs) {
    const sbRow = Math.floor(sb / 3);
    const sbCol = sb % 3;
    for (let cell = 0; cell < 9; cell++) {
      if (game.sb[sb].cells[cell] === null) {
        const cellRow = Math.floor(cell / 3);
        const cellCol = cell % 3;
        validMoves.push([sbRow * 3 + cellRow, sbCol * 3 + cellCol]);
      }
    }
  }

  return { board, activeSubboard, player, validMoves };
}

/**
 * Decodes a global [macroRow, macroCol] returned by the Python agent back into
 * the (sb, cell) pair required by gameStore.makeMove.
 *
 * The agent returns a coordinate from the validMoves list it received, so the
 * inverse of the encoding in buildPayload applies:
 *   sb   = Math.floor(macroRow / 3) * 3 + Math.floor(macroCol / 3)
 *   cell = (macroRow % 3) * 3 + (macroCol % 3)
 */
function decodeMove(macroRow: number, macroCol: number): { sb: number; cell: number } {
  const sb = Math.floor(macroRow / 3) * 3 + Math.floor(macroCol / 3);
  const cell = (macroRow % 3) * 3 + (macroCol % 3);
  return { sb, cell };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * When `sessionId` is non-null, watches the game turn and triggers the Python
 * agent when it is the bot's side to play. Applies the returned move to the
 * game store.
 *
 * Pass `sessionId = null` to disable (mode !== 'custom_agent').
 *
 * Returns `isThinking: true` while waiting for the agent response.
 */
export function useAgentGame(sessionId: string | null): { isThinking: boolean } {
  const game = useGameStore((s) => s.game);
  const gameWinner = useGameStore((s) => s.gameWinner);
  const botSide = useGameStore((s) => s.botSide);
  const makeMove = useGameStore((s) => s.makeMove);

  const isRequestingRef = useRef(false);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    if (gameWinner !== null) return;
    if (!botSide) return;
    if (game.turn !== botSide) return;
    if (isRequestingRef.current) return;

    isRequestingRef.current = true;
    setIsThinking(true);

    const payload = buildPayload(game);

    pythonAgentService
      .makeMove(sessionId, payload)
      .then((mv) => {
        const { sb, cell } = decodeMove(mv.macroRow, mv.macroCol);
        makeMove(sb, cell);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[useAgentGame] Agent move failed:', msg);
        // Timeout or bad response — do not apply a move; the player can take
        // over or the UI can surface the error via a future enhancement.
      })
      .finally(() => {
        isRequestingRef.current = false;
        setIsThinking(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.turn, gameWinner, botSide, sessionId]);
  // Intentional: only react to turn changes; all other values are stable at
  // the moment game.turn changes.

  return { isThinking };
}
