// usePublicProfile.ts — Loads a user profile and their stats by userId.
// Used when viewing another player's public profile page.

import { useState, useEffect, useCallback } from 'react';
import { supabaseService } from '@/services/supabase.service';
import { useFriendsStore } from '@/stores/friends.store';
import { useUserStore } from '@/stores/userStore';
import type { UserProfile, UserStats } from '@/types/user.types';

interface UsePublicProfileResult {
  profile: UserProfile | null;
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
  isSelf: boolean;
  sendFriendRequest: () => Promise<void>;
  requestSent: boolean;
  requestLoading: boolean;
  requestError: string | null;
}

export function usePublicProfile(userId: string): UsePublicProfileResult {
  const session = useUserStore((s) => s.session);
  const { sendRequestById } = useFriendsStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [requestSent, setRequestSent] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const isSelf = session?.userId === userId;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load(): Promise<void> {
      try {
        const [fetchedProfile, fetchedStats] = await Promise.all([
          supabaseService.profile.getProfile(userId),
          supabaseService.stats.getUserStats(userId),
        ]);
        if (cancelled) return;
        setProfile(fetchedProfile);
        setStats(fetchedStats);
      } catch (err) {
        if (cancelled) return;
        const msg =
          err !== null && typeof err === 'object' && 'message' in err
            ? (err as { message: string }).message
            : String(err);
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [userId]);

  const sendFriendRequest = useCallback(async (): Promise<void> => {
    if (!session?.userId || isSelf || requestSent) return;
    setRequestLoading(true);
    setRequestError(null);
    try {
      await sendRequestById(session.userId, userId);
      setRequestSent(true);
    } catch (err) {
      const msg =
        err !== null && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : String(err);
      setRequestError(msg);
    } finally {
      setRequestLoading(false);
    }
  }, [session?.userId, userId, isSelf, requestSent, sendRequestById]);

  return {
    profile,
    stats,
    loading,
    error,
    isSelf,
    sendFriendRequest,
    requestSent,
    requestLoading,
    requestError,
  };
}
