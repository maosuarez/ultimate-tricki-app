// user.types.ts — types for auth, profiles, stats, and local preferences

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  countryCode: string | null;
  bio: string | null;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  userId: string;
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  winStreak: number;
  bestWinStreak: number;
  totalMoves: number;
  averageMoveTimeMs: number;
  lastMatchAt: string | null;
  updatedAt: string;
}

// Stored locally via tauri-plugin-store, never sent to Supabase
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  animationsEnabled: boolean;
  language: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp in seconds
}
