use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

use crate::{
    application::Application,
    dtos::message::{MessageQuery, MessageResponse},
    mappers::message::to_message_response,
    models::message::Message,
};
use axum::extract::Query;

use crate::auth::types::CurrentUser;
use axum::Extension;
use serde_json::{Value, json};
use uuid::Uuid;

pub async fn get_messages(
    State(app): State<Application>,
    Extension(current_user): Extension<CurrentUser>,
    Path(conversation_id): Path<Uuid>,
    Query(params): Query<MessageQuery>,
) -> Result<Json<Vec<MessageResponse>>, StatusCode> {
    let db_query = r#"
        SELECT * FROM messages 
        WHERE conversation_id = $1
        ORDER BY created_at ASC
        LIMIT $2 OFFSET $3
    "#;
    let messages = sqlx::query_as::<_, Message>(db_query)
        .bind(conversation_id)
        .bind(params.limit.unwrap_or(50))
        .bind(params.offset.unwrap_or(0))
        .fetch_all(&app.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let response: Vec<MessageResponse> = messages
        .into_iter()
        .map(|m| to_message_response(m))
        .collect();
    Ok(Json(response))
}

pub async fn get_message_by_id(
    State(app): State<Application>,
    Extension(current_user): Extension<CurrentUser>,
    Path(message_id): Path<Uuid>,
) -> Result<Json<MessageResponse>, StatusCode> {
    let db_query = r#"
        SELECT * FROM messages 
        WHERE message_id = $1 
    "#;
    let message = sqlx::query_as::<_, Message>(db_query)
        .bind(message_id)
        .fetch_optional(&app.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    match message {
        Some(m) => Ok(Json(to_message_response(m))),
        None => Err(StatusCode::NOT_FOUND),
    }
}
