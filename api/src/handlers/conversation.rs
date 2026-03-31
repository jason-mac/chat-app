use crate::application::Application;
use crate::auth::types::CurrentUser;
use crate::dtos::conversation::{ConversationResponse, CreateConversation};
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
