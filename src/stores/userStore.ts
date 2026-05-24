// userStore.ts — Zustand store for the authenticated user's profile, stats, and global ranking.
// Follows the same devtools pattern as gameStore.ts.
// All Supabase access goes through supabaseService — never import @supabase/supabase-js here.

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { UserProfile, UserStats, AuthSession } from '@/types/user.types';
import type { RankingEntry, SupabaseError } from '@/types/api.types';
import type { RemoteMatch } from '@/types/match.types';
import { supabaseService } from '@/services/supabase.service';

interface UserStoreState {
  // Auth state
  session: AuthSession | null;
  authChecked: boolean;
  isGuest: boolean;
  guestName: string | null;

  // Profile state
  profile: UserProfile | null;
  stats: UserStats | null;
  globalRanking: RankingEntry[];
  recentMatches: RemoteMatch[];
  isLoading: boolean;
  error: string | null;

  // Auth actions
  setSession: (session: AuthSession | null) => void;
  setAuthChecked: (checked: boolean) => void;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  enterAsGuest: (name: string) => void;

  // Profile actions
  fetchProfile: (userId: string) => Promise<void>;
  fetchGlobalRanking: () => Promise<void>;
  fetchRecentMatches: (userId: string) => Promise<void>;
  clearUser: () => void;
}

function extractErrorMessage(err: unknown): string {
  if (err !== null && typeof err === 'object' && 'message' in err) {
    const e = err as SupabaseError;
    return e.message;
  }
  return String(err);
}

export const useUserStore = create<UserStoreState>()(
  devtools(
    (set, get) => ({
      // Auth state
      session: null,
      authChecked: false,
      isGuest: false,
      guestName: null,

      // Profile state
      profile: null,
      stats: null,
      globalRanking: [],
      recentMatches: [],
      isLoading: false,
      error: null,

      setSession: (session) => set({ session }),

      setAuthChecked: (authChecked) => set({ authChecked }),

      signIn: async (email, password, rememberMe) => {
        set({ isLoading: true, error: null });
        try {
          const session = await supabaseService.auth.signIn(email, password, rememberMe);
          set({ session, isLoading: false });
          await get().fetchProfile(session.userId);
        } catch (err) {
          set({ isLoading: false, error: extractErrorMessage(err) });
          throw err;
        }
      },

      signUp: async (email, password, username) => {
        set({ isLoading: true, error: null });
        try {
          const session = await supabaseService.auth.signUp(email, password, username);
          set({ session, isLoading: false });
          await get().fetchProfile(session.userId);
        } catch (err) {
          set({ isLoading: false, error: extractErrorMessage(err) });
          throw err;
        }
      },

      signOut: async () => {
        try {
          await supabaseService.auth.signOut();
        } catch {
          // Ignore sign-out errors — clear local state regardless
        }
        get().clearUser();
        set({ session: null, isGuest: false, guestName: null });
      },

      enterAsGuest: (name) => {
        set({ isGuest: true, guestName: name, session: null, authChecked: true });
      },

      fetchProfile: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          const [profile, stats] = await Promise.all([
            supabaseService.profile.getProfile(userId),
            supabaseService.stats.getUserStats(userId),
          ]);
          set({ profile, stats, isLoading: false });
        } catch (err) {
          set({ isLoading: false, error: extractErrorMessage(err) });
        }
      },

      fetchGlobalRanking: async () => {
        set({ isLoading: true, error: null });
        try {
          const globalRanking = await supabaseService.stats.getGlobalRanking(10);
          set({ globalRanking, isLoading: false });
        } catch (err) {
          set({ isLoading: false, error: extractErrorMessage(err) });
        }
      },

      fetchRecentMatches: async (userId) => {
        try {
          const recentMatches = await supabaseService.matches.getUserMatches(userId, { limit: 5 });
          set({ recentMatches });
        } catch {
          // silent — recentMatches stays empty on failure
        }
      },

      clearUser: () =>
        set({ profile: null, stats: null, globalRanking: [], recentMatches: [], error: null }),
    }),
    { name: 'UserStore' }
  )
);
