use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize)]
pub struct ConversationResponse {
    pub conversation_id: Uuid,
    pub name: Option<String>,
    pub is_group: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct ConversationMemberInfo {
    pub member_id: Uuid,
    pub joined_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct ConversationMembersResponse {
    pub conversation_id: Uuid,
    pub members: Vec<ConversationMemberInfo>,
}

#[derive(Deserialize)]
pub struct CreateConversation {
    pub name: Option<String>,
    pub is_group: bool,
    pub member_ids: Vec<Uuid>,
}
