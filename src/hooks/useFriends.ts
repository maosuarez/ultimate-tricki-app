// useFriends.ts — Loads friend list, pending requests, and suggestions for the
// current authenticated user.

import { useEffect, useCallback } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useFriendsStore } from '@/stores/friends.store';
import type { FriendEntry, FriendRequest } from '@/types/friends.types';
import type { UserProfile } from '@/types/user.types';

interface UseFriendsResult {
  friends: FriendEntry[];
  requests: FriendRequest[];
  suggested: UserProfile[];
  onlineCount: number;
  awayCount: number;
  offlineCount: number;
  loading: boolean;
  error: string | null;
  sendRequest: (username: string) => Promise<void>;
  acceptRequest: (friendshipId: string) => Promise<void>;
  rejectRequest: (friendshipId: string) => Promise<void>;
}

export function useFriends(): UseFriendsResult {
  const session = useUserStore((s) => s.session);
  const {
    friends,
    requests,
    suggested,
    loading,
    error,
    fetchFriends,
    fetchRequests,
    fetchSuggested,
    sendRequest: storeSendRequest,
    acceptRequest: storeAcceptRequest,
    rejectRequest: storeRejectRequest,
  } = useFriendsStore();

  useEffect(() => {
    if (session?.userId) {
      void fetchFriends(session.userId);
      void fetchRequests(session.userId);
      void fetchSuggested(session.userId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.userId]);

  const sendRequest = useCallback(
    async (username: string): Promise<void> => {
      if (!session?.userId) return;
      await storeSendRequest(session.userId, username);
    },
    [session?.userId, storeSendRequest]
  );

  const acceptRequest = useCallback(
    async (friendshipId: string): Promise<void> => {
      if (!session?.userId) return;
      await storeAcceptRequest(friendshipId, session.userId);
    },
    [session?.userId, storeAcceptRequest]
  );

  const rejectRequest = useCallback(
    async (friendshipId: string): Promise<void> => {
      if (!session?.userId) return;
      await storeRejectRequest(friendshipId, session.userId);
    },
    [session?.userId, storeRejectRequest]
  );

  const onlineCount  = friends.filter((f) => f.onlineStatus === 'online').length;
  const awayCount    = friends.filter((f) => f.onlineStatus === 'away').length;
  const offlineCount = friends.filter((f) => f.onlineStatus === 'offline').length;

  return {
    friends,
    requests,
    suggested,
    onlineCount,
    awayCount,
    offlineCount,
    loading,
    error,
    sendRequest,
    acceptRequest,
    rejectRequest,
  };
}
