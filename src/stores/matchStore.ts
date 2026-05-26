import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { MatchMode, MatchResult } from '@/types/match.types';

/**
 * Match metadata and lifecycle store.
 *
 * Responsibilities:
 * - Track active match (if any)
 * - Manage match creation/joining/ending
 * - Enforce single active match constraint
 * - Clean up on match end or abandonment
 *
 * Separation of concerns:
 * - `gameStore` handles board state, moves, timers
 * - `matchStore` handles match metadata, lifecycle, room state
 * - `networkStore` handles WebSocket connection for multiplayer
 */

export interface MatchMetadata {
  id: string;
  mode: MatchMode;
  playerXId: string | null;
  playerXName: string;
  playerOId: string | null;
  playerOName: string;
  timeControl: string; // 'blitz', 'rapid', 'casual', etc.
  startedAt: number; // timestamp ms
  endedAt: number | null;
  result: MatchResult | null;
}

interface MatchStore {
  // State
  activeMatch: MatchMetadata | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  createMatch: (metadata: Omit<MatchMetadata, 'id' | 'startedAt' | 'endedAt' | 'result'>) => void;
  setActiveMatch: (metadata: MatchMetadata | null) => void;
  endMatch: (result: MatchResult) => void;
  abandonMatch: () => void;
  leaveLobby: () => void;
  cleanup: () => void;
  setError: (error: string | null) => void;
}

export const useMatchStore = create<MatchStore>()(
  devtools(
    (set) => ({
      // Initial state
      activeMatch: null,
      isLoading: false,
      error: null,

      // Create a new match (local, AI, or online)
      createMatch: (metadata) => {
        set({
          activeMatch: {
            ...metadata,
            id: crypto.randomUUID(),
            startedAt: Date.now(),
            endedAt: null,
            result: null,
          },
          error: null,
        });
      },

      // Explicitly set active match (e.g., when joining existing room)
      setActiveMatch: (metadata) => {
        set({ activeMatch: metadata, error: null });
      },

      // End match with result (victory, defeat, draw).
      // Clears activeMatch so a new match can be created immediately.
      endMatch: (_result) => {
        set({ activeMatch: null, error: null });
      },

      // Abandon match mid-game (disconnection, user choice)
      abandonMatch: () => {
        set((state) => ({
          activeMatch: state.activeMatch
            ? { ...state.activeMatch, endedAt: Date.now(), result: 'abandoned' }
            : null,
        }));
      },

      // Leave lobby without starting game
      leaveLobby: () => {
        set({ activeMatch: null, error: null });
      },

      // Full cleanup (match ended, data persisted)
      cleanup: () => {
        set({ activeMatch: null, error: null, isLoading: false });
      },

      // Error state
      setError: (error) => {
        set({ error });
      },
    }),
    { name: 'MatchStore' }
  )
);
