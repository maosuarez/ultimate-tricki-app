// useMatchHistory.ts — Fetches the paginated match history for the current user.

import { useEffect, useCallback, useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { supabaseService } from '@/services/supabase.service';
import type { RemoteMatch, MatchFilter } from '@/types/match.types';

interface UseMatchHistoryResult {
  matches: RemoteMatch[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useMatchHistory(filters?: MatchFilter): UseMatchHistoryResult {
  const session = useUserStore((s) => s.session);
  const [matches, setMatches] = useState<RemoteMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [tick, setTick]       = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!session?.userId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    supabaseService.matches
      .getUserMatches(session.userId, { limit: 100, ...filters })
      .then((data) => {
        if (!cancelled) {
          setMatches(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg =
            err !== null && typeof err === 'object' && 'message' in err
              ? (err as { message: string }).message
              : String(err);
          setError(msg);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  // filters object reference is intentionally excluded — callers must memoize if needed.
  // tick triggers manual refresh.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.userId, tick]);

  return { matches, loading, error, refresh };
}
