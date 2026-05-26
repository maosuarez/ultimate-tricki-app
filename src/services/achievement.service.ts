// achievement.service.ts — Event-driven achievement evaluation and persistence.
// All Supabase access delegates to supabaseService.achievements.

import type { AchievementEvent, AchievementWithStatus, UserAchievement } from '@/types/achievement.types';
import type { UserStats } from '@/types/user.types';
import { supabaseService } from '@/services/supabase.service';

// ─── Minimal typed event bus ──────────────────────────────────────────────────

type Listener = (event: AchievementEvent) => void;
const listeners: Listener[] = [];

export const achievementEventBus = {
  emit(event: AchievementEvent): void {
    listeners.forEach((l) => l(event));
  },
  subscribe(listener: Listener): () => void {
    listeners.push(listener);
    return () => {
      const i = listeners.indexOf(listener);
      if (i > -1) listeners.splice(i, 1);
    };
  },
};

// ─── Condition evaluators ─────────────────────────────────────────────────────

type Condition = (stats: UserStats, payload: Record<string, unknown>) => boolean;

const CONDITIONS: Record<string, Condition> = {
  first_blood:  (s) => s.wins >= 1,
  on_fire:      (s) => s.winStreak >= 5,
  undefeated:   (s) => s.winStreak >= 10,
  centurion:    (s) => s.totalMatches >= 100,
  grandmaster:  (_, p) => typeof p.rating === 'number' && p.rating >= 2000,
};

// ─── Service ─────────────────────────────────────────────────────────────────

export const achievementService = {
  async getAll(userId: string): Promise<AchievementWithStatus[]> {
    return supabaseService.achievements.getAll(userId);
  },

  async getUserUnlocked(userId: string): Promise<UserAchievement[]> {
    return supabaseService.achievements.getUserUnlocked(userId);
  },

  async unlock(userId: string, achievementId: string): Promise<void> {
    return supabaseService.achievements.unlock(userId, achievementId);
  },

  /**
   * Evaluates an event against stat-based conditions and unlocks any triggered
   * achievements that the user doesn't already have. Returns newly unlocked IDs.
   */
  async processEvent(event: AchievementEvent, userStats: UserStats): Promise<string[]> {
    const alreadyUnlocked = await supabaseService.achievements.getUserUnlocked(event.userId);
    const alreadySet = new Set(alreadyUnlocked.map((ua) => ua.achievementId));

    const newlyUnlocked: string[] = [];

    for (const [achievementId, check] of Object.entries(CONDITIONS)) {
      if (alreadySet.has(achievementId)) continue;
      if (check(userStats, event.payload)) {
        try {
          await supabaseService.achievements.unlock(event.userId, achievementId);
          newlyUnlocked.push(achievementId);
        } catch {
          // Silently ignore duplicate-key or constraint errors
        }
      }
    }

    return newlyUnlocked;
  },
};
