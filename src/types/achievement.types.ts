export type AchievementCategory =
  | 'progression'
  | 'skill'
  | 'streak'
  | 'rating'
  | 'social'
  | 'ai'
  | 'sportsmanship'
  | 'lifestyle'
  | 'general';

export interface Achievement {
  id: string;
  emoji: string;
  name: string;
  description: string;
  category: AchievementCategory;
  isHidden: boolean;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: string;
}

export interface AchievementWithStatus extends Achievement {
  unlocked: boolean;
  unlockedAt: string | null;
}

// Event-driven achievement system
export type AchievementEventType =
  | 'GAME_WON'
  | 'GAME_LOST'
  | 'GAME_PLAYED'
  | 'STREAK_UPDATED'
  | 'RATING_UPDATED'
  | 'AI_BEATEN'
  | 'SUBBOARD_WON_FAST'
  | 'SUBBOARDS_BLOCKED';

export interface AchievementEvent {
  type: AchievementEventType;
  payload: Record<string, unknown>;
  userId: string;
  timestamp: number;
}
