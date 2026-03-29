use crate::dtos::message::{CreateMessage, MessageResponse};
use crate::dtos::message_read::{MessageReadResponse, MessageReadResponses, NotifyRead};
use serde::Deserialize;
use serde::Serialize;

#[derive(Deserialize)]
#[serde(tag = "type", content = "payload")]
pub enum WsRequest {
    #[serde(rename = "send_message")]
    SendMessage(CreateMessage),

    #[serde(rename = "notify_read")]
    NotifyRead(NotifyRead),

    #[serde(rename = "ping")]
    Ping,
}

#[derive(Serialize)]
#[serde(tag = "type", content = "payload")]
pub enum WsResponse {
    #[serde(rename = "message_read")]
    MessageRead(MessageReadResponse),

    #[serde(rename = "new_message")]
    NewMessage(MessageResponse),
}
