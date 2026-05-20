// api.types.ts — shared API/response types for Supabase interactions

import type { UserProfile, UserStats } from '@/types/user.types';

export interface RankingEntry {
  profile: UserProfile;
  stats: UserStats;
  rank: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface SupabaseError {
  code: string;
  message: string;
  details: string | null;
  hint: string | null;
}
