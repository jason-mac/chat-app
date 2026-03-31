use crate::models::friendship::FriendshipStatus;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize)]
pub struct FriendshipResponse {
    pub receiver_id: Uuid,
    pub requester_id: Uuid,
    pub created_at: DateTime<Utc>,
    pub status: FriendshipStatus,
}

#[derive(Deserialize)]
pub struct SendFriendRequest {
    pub receiver_id: Uuid,
}

#[derive(Deserialize)]
pub struct RespondToFriendRequest {
    pub requester_id: Uuid,
}
