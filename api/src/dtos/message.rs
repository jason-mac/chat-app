use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Deserialize)]
pub struct CreateMessage {
    pub content: String,
    pub message_to: Uuid,
}

#[derive(Serialize)]
pub struct MessageResponse {
    pub message_id: Uuid,
    pub content: String,
    pub message_from: Uuid,
    pub message_to: Uuid,
    pub created_at: DateTime<Utc>,
}
