use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Deserialize)]
pub struct CreateGroupMessage {
    pub content: String,
    pub conversation_id: Uuid,
}

#[derive(Deserialize)]
pub struct CreateDirectMessage {
    pub content: String,
    pub conversation_id: Option<Uuid>,
    pub receiver_id: Uuid,
}

#[derive(Serialize)]
pub struct MessageResponse {
    pub message_id: Uuid,
    pub conversation_id: Uuid,
    pub content: String,
    pub sender_id: Uuid,
    pub created_at: DateTime<Utc>,
}

#[derive(Deserialize)]
pub struct MessageQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}
