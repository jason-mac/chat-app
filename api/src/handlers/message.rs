use axum::{
    Json,
    extract::{Path, State},
};

use crate::{
    application::Application,
    dtos::message::{CreateMessage, MessageResponse},
    mappers::message::to_message_response,
    models::message::Message,
};

use crate::auth::types::CurrentUser;
use axum::Extension;
use serde_json::{Value, json};
use uuid::Uuid;

pub async fn get_messages(
    State(app): State<Application>,
    Extension(current_user): Extension<CurrentUser>,
) -> Json<Value> {
    let db_query = r#"
    SELECT * FROM messages 
    WHERE message_to = $1 OR message_from = $1
    "#;

    let messages: Vec<Message> = sqlx::query_as::<_, Message>(db_query)
        .bind(Uuid::parse_str(&current_user.user_id).unwrap())
        .fetch_all(&app.db)
        .await
        .unwrap();

    let response: Vec<MessageResponse> = messages
        .into_iter()
        .map(|m| to_message_response(m))
        .collect();
    Json(json!(response))
}

pub async fn get_message_by_id(
    State(app): State<Application>,
    Extension(current_user): Extension<CurrentUser>,
    Path(message_id): Path<i32>,
) -> Json<Value> {
    let db_query = r#"
    SELECT * FROM messages 
    WHERE message_id = $1 
    AND (message_to = $2 OR message_from = $2)
    "#;

    let message = sqlx::query_as::<_, Message>(db_query)
        .bind(message_id)
        .bind(Uuid::parse_str(&current_user.user_id).unwrap())
        .fetch_optional(&app.db)
        .await
        .unwrap();

    match message {
        Some(m) => Json(json!(to_message_response(m))),
        None => Json(json!({"error": "message not found"})),
    }
}

pub async fn get_conversation(
    State(app): State<Application>,
    Extension(current_user): Extension<CurrentUser>,
    Path(other_user_id): Path<Uuid>,
) -> Json<Value> {
    let db_query = r#"
    SELECT * FROM messages 
    WHERE (message_to = $1 AND message_from = $2)
    OR (message_to = $2 AND message_from = $1)
    ORDER BY created_at ASC
    "#;

    let messages: Vec<Message> = sqlx::query_as::<_, Message>(db_query)
        .bind(Uuid::parse_str(&current_user.user_id).unwrap())
        .bind(other_user_id)
        .fetch_all(&app.db)
        .await
        .unwrap();

    let response: Vec<MessageResponse> = messages
        .into_iter()
        .map(|m| to_message_response(m))
        .collect();
    Json(json!(response))
}

pub async fn create_message(
    State(app): State<Application>,
    Json(body): Json<CreateMessage>,
) -> Json<Value> {
    let db_query = r#"
    INSERT INTO messages (content, message_from, message_to)
    VALUES ($1, $2, $3) 
    RETURNING *
    "#;

    let message = sqlx::query_as::<_, Message>(db_query)
        .bind(body.content)
        .bind(body.message_to)
        .fetch_one(&app.db)
        .await
        .unwrap();

    let response: MessageResponse = to_message_response(message);
    Json(json!(response))
}
