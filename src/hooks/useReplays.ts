// useReplays.ts — Fetches match history for the current authenticated user.

import { useEffect, useCallback, useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { supabaseService } from '@/services/supabase.service';
import type { RemoteMatch } from '@/types/match.types';

interface UseReplaysResult {
  replays: RemoteMatch[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useReplays(): UseReplaysResult {
  const session = useUserStore((s) => s.session);
  const [replays, setReplays] = useState<RemoteMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [tick, setTick]       = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!session?.userId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    supabaseService.matches.getUserMatches(session.userId, { limit: 50 }).then((data) => {
      if (!cancelled) {
        setReplays(data);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.userId, tick]);

  return { replays, loading, error, refresh };
}
