use crate::application::Application;
use crate::auth::types::CurrentUser;
use crate::dtos::conversation::{
    ConversationMembersResponse, ConversationResponse, CreateConversation,
};
use crate::mappers::conversation::{to_conversation_members_response, to_conversation_response};
use crate::models::conversation::{Conversation, ConversationMember};
use axum::Extension;
use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use uuid::Uuid;

pub async fn create_conversation(
    State(application): State<Application>,
    Extension(current_user): Extension<CurrentUser>,
    Json(body): Json<CreateConversation>,
) -> Result<Json<ConversationResponse>, StatusCode> {
    let db_query = r#"
        INSERT INTO conversations (name, is_group)
        VALUES ($1, $2)
        RETURNING *
    "#;
    let conversation = sqlx::query_as::<_, Conversation>(&db_query)
        .bind(body.name)
        .bind(body.is_group)
        .fetch_one(&application.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let conversation_id = conversation.conversation_id;
    let db_query = r#"
        INSERT INTO conversation_members (conversation_id, user_id)
        VALUES ($1, $2)
    "#;
    for member_id in &body.member_ids {
        sqlx::query(&db_query)
            .bind(conversation_id)
            .bind(*member_id)
            .execute(&application.db)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    }
    Ok(Json(to_conversation_response(conversation)))
}

pub async fn get_conversations(
    State(application): State<Application>,
    Extension(current_user): Extension<CurrentUser>,
) -> Result<Json<Vec<ConversationResponse>>, StatusCode> {
    let db_query = r#"
        SELECT c.conversation_id, c.name, c.is_group, c.created_at
        FROM conversations c
        JOIN conversation_members cm ON cm.conversation_id = c.conversation_id
        WHERE cm.user_id = $1
        ORDER BY (
            SELECT MAX(created_at) FROM messages WHERE conversation_id = c.conversation_id
        ) DESC NULLS LAST
    "#;

    let conversations = sqlx::query_as::<_, Conversation>(&db_query)
        .bind(Uuid::parse_str(&current_user.user_id).unwrap())
        .fetch_all(&application.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(
        conversations
            .into_iter()
            .map(|c| to_conversation_response(c))
            .collect(),
    ))
}

pub async fn get_conversation_members(
    State(application): State<Application>,
    Extension(current_user): Extension<CurrentUser>,
    Path(conversation_id): Path<Uuid>,
) -> Result<Json<ConversationMembersResponse>, StatusCode> {
    let db_query = r#"
        SELECT conversation_id, user_id, joined_at
        FROM conversation_members
        WHERE conversation_id = $1
    "#;
    let members = sqlx::query_as::<_, ConversationMember>(&db_query)
        .bind(conversation_id)
        .fetch_all(&application.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(to_conversation_members_response(
        conversation_id,
        members,
    )))
}
