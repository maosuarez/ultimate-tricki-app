// useRanking.ts — Fetches the global ranking and the current user's own entry.

import { useEffect, useCallback, useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { supabaseService } from '@/services/supabase.service';
import type { RankingEntry } from '@/types/api.types';

interface UseRankingResult {
  entries: RankingEntry[];
  myEntry: RankingEntry | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useRanking(): UseRankingResult {
  const session = useUserStore((s) => s.session);
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [tick, setTick]       = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    supabaseService.stats.getGlobalRanking(50).then((data) => {
      if (!cancelled) {
        setEntries(data);
        setLoading(false);
      }
    }).catch((err: unknown) => {
      if (!cancelled) {
        const msg = err !== null && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : String(err);
        setError(msg);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  // tick triggers manual refresh
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  // Derive the current user's entry from the already-loaded ranking list
  const myEntry: RankingEntry | null = session?.userId
    ? (entries.find((e) => e.profile.id === session.userId) ?? null)
    : null;

  return { entries, myEntry, loading, error, refresh };
}
