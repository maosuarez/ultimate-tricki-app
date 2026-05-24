// useCurrentUser.ts — On mount, resolves the active Supabase session and loads
// the matching profile + stats into the userStore. Also kicks off the global ranking fetch.
// Subscribes to onAuthStateChange to react to external login/logout events.

import { useEffect } from 'react';
import { supabaseService } from '@/services/supabase.service';
import { useUserStore } from '@/stores/userStore';
import type { UserProfile, UserStats, AuthSession } from '@/types/user.types';
import type { RankingEntry } from '@/types/api.types';
import type { RemoteMatch } from '@/types/match.types';

interface CurrentUserResult {
  profile: UserProfile | null;
  stats: UserStats | null;
  globalRanking: RankingEntry[];
  recentMatches: RemoteMatch[];
  session: AuthSession | null;
  authChecked: boolean;
  isGuest: boolean;
  guestName: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useCurrentUser(): CurrentUserResult {
  const {
    profile,
    stats,
    globalRanking,
    recentMatches,
    session,
    authChecked,
    isGuest,
    guestName,
    isLoading,
    error,
    setSession,
    setAuthChecked,
    fetchProfile,
    fetchGlobalRanking,
    fetchRecentMatches,
  } = useUserStore();

  useEffect(() => {
    let cancelled = false;

    async function init(): Promise<void> {
      const noRemember = localStorage.getItem('tricki_no_remember');
      if (noRemember === '1') {
        localStorage.removeItem('tricki_no_remember');
        try { await supabaseService.auth.signOut(); } catch { /* ignore */ }
        if (!cancelled) setAuthChecked(true);
        return;
      }

      try {
        const activeSession = await supabaseService.auth.getCurrentSession();
        if (cancelled) return;
        if (activeSession) {
          setSession(activeSession);
          void fetchProfile(activeSession.userId);
          void fetchRecentMatches(activeSession.userId);
        }
        setAuthChecked(true);
        void fetchGlobalRanking();
      } catch {
        // Session fetch failures are non-fatal — user stays unauthenticated.
        if (!cancelled) setAuthChecked(true);
      }
    }

    void init();

    const unsubscribe = supabaseService.auth.onAuthStateChange((changedSession) => {
      if (cancelled) return;
      setSession(changedSession);
      if (changedSession) {
        void fetchProfile(changedSession.userId);
        void fetchRecentMatches(changedSession.userId);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { profile, stats, globalRanking, recentMatches, session, authChecked, isGuest, guestName, isLoading, error };
}
