use uuid::Uuid;

use crate::dtos::friendship::FriendshipResponse;
use crate::models::friendship::{Friendship, FriendshipStatus};

pub fn to_friendship_response(friendship: Friendship) -> FriendshipResponse {
    FriendshipResponse {
        receiver_id: friendship.receiver_id,
        requester_id: friendship.requester_id,
        created_at: friendship.created_at,
        status: friendship.status,
    }
}
