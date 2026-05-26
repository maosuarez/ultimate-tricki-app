// achievement.store.ts — Zustand store for achievements.
// Delegates all Supabase access to achievementService.

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AchievementWithStatus, AchievementEvent } from '@/types/achievement.types';
import type { UserStats } from '@/types/user.types';
import { achievementService } from '@/services/achievement.service';

interface AchievementStore {
  achievements: AchievementWithStatus[];
  loading: boolean;
  error: string | null;
  /** Achievement ID of the most recently unlocked achievement — used for toast notifications. */
  lastUnlocked: string | null;

  fetchAchievements: (userId: string) => Promise<void>;
  processGameEvent: (event: AchievementEvent, stats: UserStats) => Promise<void>;
  clearLastUnlocked: () => void;
}

function extractMessage(err: unknown): string {
  if (err !== null && typeof err === 'object' && 'message' in err) {
    return (err as { message: string }).message;
  }
  return String(err);
}

export const useAchievementStore = create<AchievementStore>()(
  devtools(
    (set) => ({
      achievements: [],
      loading: false,
      error: null,
      lastUnlocked: null,

      fetchAchievements: async (userId) => {
        set({ loading: true, error: null });
        try {
          const achievements = await achievementService.getAll(userId);
          set({ achievements, loading: false });
        } catch (err) {
          set({ loading: false, error: extractMessage(err) });
        }
      },

      processGameEvent: async (event, stats) => {
        try {
          const newIds = await achievementService.processEvent(event, stats);
          if (newIds.length > 0) {
            // Re-fetch achievements to get updated statuses
            const achievements = await achievementService.getAll(event.userId);
            // Report only the last newly unlocked one for the toast
            set({ achievements, lastUnlocked: newIds[newIds.length - 1] ?? null });
          }
        } catch {
          // processGameEvent failures are non-fatal — achievements may retry next session
        }
      },

      clearLastUnlocked: () => set({ lastUnlocked: null }),
    }),
    { name: 'AchievementStore' }
  )
);
