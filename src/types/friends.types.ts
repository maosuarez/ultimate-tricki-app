import type { UserProfile } from '@/types/user.types';

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';
export type FriendOnlineStatus = 'online' | 'away' | 'offline';

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FriendEntry {
  friendship: Friendship;
  profile: UserProfile;
  onlineStatus: FriendOnlineStatus;
  statusText: string;
}

export interface FriendRequest {
  friendship: Friendship;
  profile: UserProfile;
  mutualCount: number;
}
