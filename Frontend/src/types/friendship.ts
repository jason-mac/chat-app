export type FriendshipStatus = 'pending' | 'accepted' | 'blocked' | 'declined';

export interface FriendshipResponse {
  receiver_id: string;
  requester_id: string;
  created_at: string;
  status: FriendshipStatus;
}

export interface SendFriendRequest {
  receiver_id: string;
}

export interface RespondToFriendRequest {
  requester_id: string;
}
