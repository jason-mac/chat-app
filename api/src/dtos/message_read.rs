use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Deserialize)]
pub struct NotifyRead {
    pub message_id: Uuid,
}

#[derive(Serialize)]
pub struct MessageReadResponse {
    pub message_id: Uuid,
    pub reader_id: Uuid,
    pub read_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct MessageReadResponses {
    pub message_id: Uuid,
    pub read_by: Vec<MessageReadResponse>,
}
