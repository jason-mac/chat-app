use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Deserialize)]
pub struct CreateMessage {
    pub content: String,
    pub conversation_id: Uuid,
}

#[derive(Serialize)]
pub struct MessageResponse {
    pub message_id: Uuid,
    pub conversation_id: Uuid,
    pub content: String,
    pub sender_id: Uuid,
    pub created_at: DateTime<Utc>,
}
