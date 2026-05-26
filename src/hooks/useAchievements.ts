// useAchievements.ts — Fetches achievements for the current authenticated user.

import { useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useAchievementStore } from '@/stores/achievement.store';
import type { AchievementWithStatus } from '@/types/achievement.types';

interface UseAchievementsResult {
  achievements: AchievementWithStatus[];
  unlocked: number;
  total: number;
  progress: number;
  loading: boolean;
  error: string | null;
}

export function useAchievements(): UseAchievementsResult {
  const session = useUserStore((s) => s.session);
  const { achievements, loading, error, fetchAchievements } = useAchievementStore();

  useEffect(() => {
    if (session?.userId) {
      void fetchAchievements(session.userId);
    }
  // fetchAchievements is stable (Zustand action reference)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.userId]);

  const unlocked = achievements.filter((a) => a.unlocked).length;
  const total = achievements.length;
  const progress = total > 0 ? Math.round((unlocked / total) * 100) : 0;

  return { achievements, unlocked, total, progress, loading, error };
}
