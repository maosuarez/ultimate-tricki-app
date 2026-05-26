// replayStore.ts — state for the replay viewer. Completely independent of gameStore.

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { GameState, MoveHistory } from '@/types/game';
import type { RemoteMatch } from '@/types/match.types';
import { reconstructBoardState } from '@/utils/boardUtils';

interface ReplayState {
  matchId: string | null;
  matchMeta: RemoteMatch | null;
  moves: MoveHistory[];
  currentMoveIndex: number; // -1 = empty board, 0..moves.length-1 = move applied
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  currentBoardState: GameState | null;
  playbackSpeed: number; // ms per move during auto-play
}

interface ReplayActions {
  loadReplay(matchId: string, matchMeta: RemoteMatch, moves: MoveHistory[]): void;
  goToMove(index: number): void;
  goToNext(): void;
  goToPrevious(): void;
  goToStart(): void;
  goToEnd(): void;
  play(): void;
  pause(): void;
  setPlaybackSpeed(ms: number): void;
  setLoading(loading: boolean): void;
  setError(error: string | null): void;
  reset(): void;
}

type ReplayStore = ReplayState & ReplayActions;

const INITIAL_STATE: ReplayState = {
  matchId: null,
  matchMeta: null,
  moves: [],
  currentMoveIndex: -1,
  isPlaying: false,
  isLoading: false,
  error: null,
  currentBoardState: null,
  playbackSpeed: 800,
};

export const useReplayStore = create<ReplayStore>()(
  devtools(
    (set, get) => ({
      ...INITIAL_STATE,

      loadReplay: (matchId, matchMeta, moves) => {
        set({
          matchId,
          matchMeta,
          moves,
          currentMoveIndex: -1,
          isPlaying: false,
          isLoading: false,
          error: null,
          currentBoardState: reconstructBoardState(moves, -1),
        });
      },

      goToMove: (index) => {
        const { moves } = get();
        const clamped = Math.max(-1, Math.min(index, moves.length - 1));
        set({
          currentMoveIndex: clamped,
          isPlaying: false,
          currentBoardState: reconstructBoardState(moves, clamped),
        });
      },

      goToNext: () => {
        const { moves, currentMoveIndex } = get();
        if (currentMoveIndex >= moves.length - 1) return;
        const next = currentMoveIndex + 1;
        set({
          currentMoveIndex: next,
          currentBoardState: reconstructBoardState(moves, next),
        });
      },

      goToPrevious: () => {
        const { moves, currentMoveIndex } = get();
        if (currentMoveIndex <= -1) return;
        const prev = currentMoveIndex - 1;
        set({
          currentMoveIndex: prev,
          currentBoardState: reconstructBoardState(moves, prev),
        });
      },

      goToStart: () => {
        const { moves } = get();
        set({
          currentMoveIndex: -1,
          isPlaying: false,
          currentBoardState: reconstructBoardState(moves, -1),
        });
      },

      goToEnd: () => {
        const { moves } = get();
        const last = moves.length - 1;
        set({
          currentMoveIndex: last,
          isPlaying: false,
          currentBoardState: reconstructBoardState(moves, last),
        });
      },

      play: () => set({ isPlaying: true }),

      pause: () => set({ isPlaying: false }),

      setPlaybackSpeed: (ms) => set({ playbackSpeed: ms }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error, isLoading: false }),

      reset: () => set({ ...INITIAL_STATE }),
    }),
    { name: 'ReplayStore' }
  )
);
