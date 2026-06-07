// useSaveCompletedMatch.ts
// Persists a completed match (AI or local) to Supabase when gameWinner is set.
// Called once from ViewGame's gameWinner effect — does nothing for guests or
// already-persisted matches (guarded by a ref).

import { useEffect, useRef } from 'react';
import type { Player, MoveHistory } from '@/types/game';
import type { MatchResult } from '@/types/match.types';
import { useGameStore } from '@/stores/gameStore';
import { useUserStore } from '@/stores/userStore';
import { useMatchStore } from '@/stores/matchStore';
import { supabaseService } from '@/services/supabase.service';

// Maps the last segment of a builtin agent ID to a readable Spanish label.
// Format: 'builtin.flat_mc.<difficulty>' or any '<scope>.<name>.<difficulty>'
const DIFFICULTY_LABELS: Record<string, string> = {
  easy:   'Fácil',
  medium: 'Medio',
  hard:   'Difícil',
  expert: 'Experto',
};

function agentIdToDisplayName(agentId: string): string {
  const segments = agentId.split('.');
  const difficulty = segments[segments.length - 1] ?? '';
  const label = DIFFICULTY_LABELS[difficulty] ?? difficulty;
  return `Flattie (${label})`;
}

function resolveResult(winner: Player | 'draw'): MatchResult {
  if (winner === 'draw') return 'draw';
  if (winner === 'X') return 'x_wins';
  return 'o_wins';
}

export function useSaveCompletedMatch(gameWinner: Player | 'draw' | null): void {
  const { game, playerX, playerO, aiAgentId, mode, initialTime, timeX, timeO } =
    useGameStore();
  const { session, profile, isGuest } = useUserStore();
  const agentName = useMatchStore((s) => s.agentName);

  // Guards against double-saves on StrictMode double-invocation or modal re-renders.
  const savedRef = useRef(false);

  useEffect(() => {
    // Reset guard when a new game starts (gameWinner goes back to null).
    if (gameWinner === null) {
      savedRef.current = false;
      return;
    }

    // Already saved for this game end.
    if (savedRef.current) return;

    // Guests have no Supabase account — skip silently.
    if (isGuest || !session) return;

    // Only persist AI, local, and custom_agent matches here. Online matches are
    // persisted by the server when the room ends.
    if (mode !== 'ai' && mode !== 'local' && mode !== 'custom_agent') return;

    savedRef.current = true;

    const now = new Date().toISOString();
    // Elapsed seconds per player = initial budget minus remaining time.
    const elapsedX = Math.max(0, initialTime - timeX);
    const elapsedO = Math.max(0, initialTime - timeO);
    const durationSeconds = elapsedX + elapsedO;

    const playerOName =
      mode === 'ai' && aiAgentId
        ? agentIdToDisplayName(aiAgentId)
        : mode === 'custom_agent' && agentName
          ? agentName
          : playerO;

    // custom_agent matches are stored with mode 'ai' so the existing Supabase
    // schema (which only knows 'ai' | 'local' | 'online') continues to work.
    const persistedMode = mode === 'custom_agent' ? 'ai' : mode;

    // Snapshot the move history now — the store may be reset before the async
    // saveMatch promise resolves.
    const historySnapshot: MoveHistory[] = [...game.history];

    const matchData = {
      id:              crypto.randomUUID(),
      mode:            persistedMode,
      playerXId:       profile?.id ?? null,
      playerOId:       mode === 'ai' ? null : null, // local O is never a registered user here
      playerXName:     playerX,
      playerOName,
      result:          resolveResult(gameWinner),
      totalMoves:      game.history.length,
      durationSeconds,
      ratingChangeX:   0,
      ratingChangeO:   0,
      // startedAt is approximated from endedAt minus duration — the store
      // does not track a start timestamp. This is accurate to the second.
      startedAt:       new Date(Date.now() - durationSeconds * 1000).toISOString(),
      endedAt:         now,
      createdAt:       now,
    };

    supabaseService.matches.saveMatch(matchData).then((saved) => {
      // Persist move history so replays work.
      const moveRows = historySnapshot.map((m: MoveHistory, i) => ({
        moveNumber:  i + 1,
        player:      m.by === 'X' ? ('x' as const) : ('o' as const),
        macroRow:    Math.floor(m.sb / 3),
        macroCol:    m.sb % 3,
        microRow:    Math.floor(m.cell / 3),
        microCol:    m.cell % 3,
        timestampMs: Date.now(), // wall-clock approximation; per-move timing not tracked
      }));
      supabaseService.matches.saveMatchMoves(saved.id, moveRows).catch((err: unknown) => {
        console.error('[useSaveCompletedMatch] Failed to persist moves:', err);
      });
    }).catch((err: unknown) => {
      // Non-fatal — the game UX must not be blocked by a persistence failure.
      console.error('[useSaveCompletedMatch] Failed to persist match:', err);
    });
  }, [gameWinner]); // eslint-disable-line react-hooks/exhaustive-deps
  // Intentional: we only want to react to game end, not to individual field changes.
  // All values read inside are stable at the moment gameWinner becomes non-null.
}
