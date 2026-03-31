use chrono::{DateTime, Utc};
use sqlx::FromRow;
use uuid::Uuid;

use serde::{Deserialize, Serialize};

#[derive(Debug, sqlx::Type, Deserialize, Serialize)]
#[sqlx(type_name = "text", rename_all = "lowercase")]
#[serde(rename_all = "lowercase")]
pub enum FriendshipStatus {
    Pending,
    Accepted,
    Blocked,
    Declined,
}

#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct Friendship {
    pub receiver_id: Uuid,
    pub requester_id: Uuid,
    pub created_at: DateTime<Utc>,
    pub status: FriendshipStatus,
}
