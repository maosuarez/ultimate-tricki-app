// friends.store.ts — Zustand store for the social/friends system.
// Delegates all Supabase access to supabaseService.friends.

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { FriendEntry, FriendRequest } from '@/types/friends.types';
import type { UserProfile } from '@/types/user.types';
import { supabaseService } from '@/services/supabase.service';

interface FriendsStore {
  friends: FriendEntry[];
  requests: FriendRequest[];
  suggested: UserProfile[];
  loading: boolean;
  error: string | null;

  fetchFriends: (userId: string) => Promise<void>;
  fetchRequests: (userId: string) => Promise<void>;
  fetchSuggested: (userId: string) => Promise<void>;
  sendRequest: (requesterId: string, username: string) => Promise<void>;
  acceptRequest: (friendshipId: string, userId: string) => Promise<void>;
  rejectRequest: (friendshipId: string, userId: string) => Promise<void>;
}

function extractMessage(err: unknown): string {
  if (err !== null && typeof err === 'object' && 'message' in err) {
    return (err as { message: string }).message;
  }
  return String(err);
}

export const useFriendsStore = create<FriendsStore>()(
  devtools(
    (set, get) => ({
      friends: [],
      requests: [],
      suggested: [],
      loading: false,
      error: null,

      fetchFriends: async (userId) => {
        set({ loading: true, error: null });
        try {
          const friends = await supabaseService.friends.getFriends(userId);
          set({ friends, loading: false });
        } catch (err) {
          set({ loading: false, error: extractMessage(err) });
        }
      },

      fetchRequests: async (userId) => {
        try {
          const requests = await supabaseService.friends.getRequests(userId);
          set({ requests });
        } catch (err) {
          set({ error: extractMessage(err) });
        }
      },

      fetchSuggested: async (userId) => {
        try {
          const suggested = await supabaseService.friends.getSuggested(userId);
          set({ suggested });
        } catch {
          // Suggested is non-critical — silently fail
        }
      },

      sendRequest: async (requesterId, username) => {
        set({ error: null });
        try {
          await supabaseService.friends.sendRequest(requesterId, username);
          // Re-fetch to keep state consistent
          await get().fetchFriends(requesterId);
        } catch (err) {
          set({ error: extractMessage(err) });
          throw err;
        }
      },

      acceptRequest: async (friendshipId, userId) => {
        try {
          await supabaseService.friends.acceptRequest(friendshipId);
          // Refresh both lists
          await Promise.all([
            get().fetchFriends(userId),
            get().fetchRequests(userId),
          ]);
        } catch (err) {
          set({ error: extractMessage(err) });
        }
      },

      rejectRequest: async (friendshipId, userId) => {
        try {
          await supabaseService.friends.rejectRequest(friendshipId);
          await get().fetchRequests(userId);
        } catch (err) {
          set({ error: extractMessage(err) });
        }
      },
    }),
    { name: 'FriendsStore' }
  )
);
