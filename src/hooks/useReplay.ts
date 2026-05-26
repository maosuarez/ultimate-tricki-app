// useReplay.ts — loads replay data from Supabase and drives auto-play.

import { useEffect, useRef } from 'react';
import { useReplayStore } from '@/stores/replayStore';
import { supabaseService } from '@/services/supabase.service';
import type { RemoteMatch } from '@/types/match.types';
import type { MoveHistory } from '@/types/game';

/**
 * Converts a RemoteMatchMove (macroRow/macroCol, microRow/microCol)
 * to the MoveHistory format used by the local game engine (sb, cell).
 *
 * sb   = macroRow * 3 + macroCol   (which of the 9 sub-boards)
 * cell = microRow * 3 + microCol   (which cell inside that sub-board)
 */
function remoteMovesToHistory(
  remoteMoves: Awaited<ReturnType<typeof supabaseService.matches.getMatchMoves>>
): MoveHistory[] {
  return remoteMoves.map((m, idx) => ({
    n: idx + 1,
    by: m.player === 'x' ? ('X' as const) : ('O' as const),
    sb: m.macroRow * 3 + m.macroCol,
    cell: m.microRow * 3 + m.microCol,
  }));
}

interface UseReplayResult {
  matchId: string | null;
  matchMeta: RemoteMatch | null;
  moves: MoveHistory[];
  currentMoveIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  currentBoardState: ReturnType<typeof useReplayStore.getState>['currentBoardState'];
  playbackSpeed: number;
  goToMove: (index: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  goToStart: () => void;
  goToEnd: () => void;
  play: () => void;
  pause: () => void;
  setPlaybackSpeed: (ms: number) => void;
}

export function useReplay(matchId: string | null, matchMeta: RemoteMatch | null): UseReplayResult {
  const store = useReplayStore();
  const {
    loadReplay,
    goToNext,
    pause,
    setLoading,
    setError,
    reset,
    isPlaying,
    playbackSpeed,
  } = store;

  // Load replay data whenever matchId changes
  useEffect(() => {
    if (!matchId || !matchMeta) {
      reset();
      return;
    }

    let cancelled = false;
    setLoading(true);

    supabaseService.matches.getMatchMoves(matchId)
      .then((remoteMoves) => {
        if (cancelled) return;
        const history = remoteMovesToHistory(remoteMoves);
        loadReplay(matchId, matchMeta, history);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg =
          err !== null && typeof err === 'object' && 'message' in err
            ? (err as { message: string }).message
            : String(err);
        setError(msg);
      });

    return () => { cancelled = true; };
  // matchId and matchMeta.id are the stable identifiers — exhaustive-deps would
  // cause re-fetches on every render since matchMeta is a new object each time.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  // Auto-play: advance one move every `playbackSpeed` ms while isPlaying is true
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      const { currentMoveIndex: idx, moves: mvs, isPlaying: playing } = useReplayStore.getState();
      if (!playing) return;
      if (idx >= mvs.length - 1) {
        // Reached the end — stop playing
        pause();
        return;
      }
      goToNext();
    }, playbackSpeed);

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, playbackSpeed, goToNext, pause]);

  return {
    matchId:          store.matchId,
    matchMeta:        store.matchMeta,
    moves:            store.moves,
    currentMoveIndex: store.currentMoveIndex,
    isPlaying:        store.isPlaying,
    isLoading:        store.isLoading,
    error:            store.error,
    currentBoardState: store.currentBoardState,
    playbackSpeed:    store.playbackSpeed,
    goToMove:         store.goToMove,
    goToNext:         store.goToNext,
    goToPrevious:     store.goToPrevious,
    goToStart:        store.goToStart,
    goToEnd:          store.goToEnd,
    play:             store.play,
    pause:            store.pause,
    setPlaybackSpeed: store.setPlaybackSpeed,
  };
}
