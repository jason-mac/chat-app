use crate::dtos::message::MessageResponse;
use crate::models::message::Message;

pub fn to_message_response(message: Message) -> MessageResponse {
    MessageResponse {
        message_id: message.message_id,
        content: message.content,
        message_from: message.message_from,
        message_to: message.message_to,
        created_at: message.created_at,
    }
}
