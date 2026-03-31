use chrono::{DateTime, Utc};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, FromRow)]
pub struct Message {
    pub message_id: Uuid,
    pub conversation_id: Uuid,
    pub sender_id: Uuid,
    pub content: String,
    pub created_at: DateTime<Utc>,
}
