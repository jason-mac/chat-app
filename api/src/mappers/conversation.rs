use uuid::Uuid;

use crate::dtos::conversation::{
    ConversationMemberInfo, ConversationMembersResponse, ConversationResponse,
};
use crate::models::conversation::{Conversation, ConversationMember};

pub fn to_conversation_response(conversation: Conversation) -> ConversationResponse {
    ConversationResponse {
        conversation_id: conversation.conversation_id,
        name: conversation.name,
        is_group: conversation.is_group,
        created_at: conversation.created_at,
    }
}

pub fn to_conversation_members_response(
    conversation_id: Uuid,
    conversation_members: Vec<ConversationMember>,
) -> ConversationMembersResponse {
    ConversationMembersResponse {
        conversation_id,
        members: conversation_members
            .into_iter()
            .map(|m| ConversationMemberInfo {
                member_id: m.user_id,
                joined_at: m.joined_at,
            })
            .collect(),
    }
}
