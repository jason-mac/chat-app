use chrono::{DateTime, Utc};
use sqlx::FromRow;
use uuid::Uuid;

use serde::{Deserialize, Serialize};

#[derive(Debug, FromRow)]
pub struct Conversation {
    pub conversation_id: Uuid,
    pub name: Option<String>,
    pub is_group: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, FromRow)]
pub struct ConversationMember {
    pub conversation_id: Uuid,
    pub user_id: Uuid,
    pub joined_at: DateTime<Utc>,
}
