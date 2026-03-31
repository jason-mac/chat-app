use crate::dtos::message::MessageResponse;
use crate::models::message::Message;
use uuid::Uuid;

pub fn to_message_response(message: Message) -> MessageResponse {
    MessageResponse {
        message_id: message.message_id,
        conversation_id: message.conversation_id,
        content: message.content,
        sender_id: message.sender_id,
        created_at: message.created_at,
    }
}
