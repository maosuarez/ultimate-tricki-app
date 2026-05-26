import React from 'react';
import { agentService } from '../services/agentService';
import type { AgentMove } from '../types/agent';
import type { GameState } from '../types/game';

export function useAIAgent(agentId: string | null): {
  requestMove: ((game: GameState, deadlineMs: number) => Promise<AgentMove>) | null;
  isReady: boolean;
} {
  const sessionIdRef = React.useRef<string | null>(null);
  const isRequestingRef = React.useRef(false);
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    if (!agentId) return;

    let sessionId: string | null = null;
    let cancelled = false;

    agentService.startSession(agentId).then((id) => {
      if (cancelled) {
        agentService.stopSession(id);
        return;
      }
      sessionId = id;
      sessionIdRef.current = id;
      setIsReady(true);
    });

    return () => {
      cancelled = true;
      if (sessionId) agentService.stopSession(sessionId);
      sessionIdRef.current = null;
      isRequestingRef.current = false;
      setIsReady(false);
    };
  }, [agentId]);

  const requestMove = React.useMemo(() => {
    if (!isReady) return null;

    return (game: GameState, deadlineMs: number): Promise<AgentMove> => {
      const sessionId = sessionIdRef.current;
      if (!sessionId) return Promise.reject(new Error('No active session'));
      if (isRequestingRef.current) return Promise.reject(new Error('Request already in progress'));

      isRequestingRef.current = true;
      return agentService
        .requestMove(sessionId, game, deadlineMs)
        .finally(() => {
          isRequestingRef.current = false;
        });
    };
  }, [isReady]);

  return { requestMove, isReady };
}
