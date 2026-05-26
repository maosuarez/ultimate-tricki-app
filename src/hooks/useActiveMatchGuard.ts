import { useState } from 'react';
import { useMatchStore } from '@/stores/matchStore';
import type { ScreenName } from '@/types/game';

interface ActiveMatchGuardResult {
  isBlocked: boolean;
  closeBlockedModal: () => void;
}

/**
 * Returns whether navigation to a route requiring no active match is blocked.
 *
 * An "active" match is one where `activeMatch` is set and has no result yet
 * (i.e., the game is still in progress). Matches with a result have ended
 * and should not block new match creation.
 *
 * Usage: call this hook inside a page component that requires no active match
 * (CreatePage, JoinPage). Render `ActiveMatchBlockedModal` when `isBlocked` is true.
 */
export function useActiveMatchGuard(_screen: ScreenName): ActiveMatchGuardResult {
  const activeMatch = useMatchStore((s) => s.activeMatch);
  const [dismissed, setDismissed] = useState(false);

  // A match blocks navigation only when it is in progress (result === null)
  const isActiveInProgress = activeMatch !== null && activeMatch.result === null;
  const isBlocked = isActiveInProgress && !dismissed;

  function closeBlockedModal(): void {
    setDismissed(true);
  }

  return { isBlocked, closeBlockedModal };
}
