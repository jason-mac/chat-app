use chrono::{DateTime, Utc};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, FromRow)]
pub struct Message {
    pub message_id: Uuid,
    pub content: String,
    pub message_from: Uuid,
    pub message_to: Uuid,
    pub created_at: DateTime<Utc>,
}
