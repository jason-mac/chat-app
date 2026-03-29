use uuid::Uuid;

use crate::dtos::message_read::MessageReadResponse;
use crate::dtos::message_read::MessageReadResponses;
use crate::models::message_read::MessageRead;

pub fn to_message_read_response(message_read: MessageRead) -> MessageReadResponse {
    MessageReadResponse {
        message_id: (message_read.user_id),
        reader_id: (message_read.user_id),
        read_at: (message_read.read_at),
    }
}

pub fn to_message_read_responses(
    message_id: Uuid,
    message_reads: Vec<MessageRead>,
) -> MessageReadResponses {
    MessageReadResponses {
        message_id,
        read_by: message_reads
            .into_iter()
            .map(to_message_read_response)
            .collect::<Vec<MessageReadResponse>>(),
    }
}
