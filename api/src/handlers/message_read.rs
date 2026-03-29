use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

use crate::{
    application::Application,
    dtos::message_read::{MessageReadResponse, MessageReadResponses},
    mappers::message_read::{to_message_read_response, to_message_read_responses},
    models::message_read::MessageRead,
};

use crate::auth::types::CurrentUser;
use axum::Extension;
use serde_json::{Value, json};
use uuid::Uuid;

pub async fn get_message_read(
    State(application): State<Application>,
    Extension(current_user): Extension<CurrentUser>,
    Path((message_id, user_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<Value>, StatusCode> {
    let db_query = r#"
        SELECT user_id, message_id, read_at
        FROM message_reads
        WHERE user_id = $1 AND message_id = $2
    "#;

    let message_read = sqlx::query_as::<_, MessageRead>(db_query)
        .bind(user_id)
        .bind(message_id)
        .fetch_optional(&application.db)
        .await
        .unwrap();

    match message_read {
        Some(m) => Ok(Json(json!(to_message_read_response(m)))),
        None => Err(StatusCode::NOT_FOUND),
    }
}

pub async fn get_message_reads(
    State(application): State<Application>,
    Extension(_current_user): Extension<CurrentUser>,
    Path(message_id): Path<Uuid>,
) -> Result<Json<Value>, StatusCode> {
    let db_query = r#"
        SELECT user_id, message_id, read_at
        FROM message_reads
        WHERE message_id = $1
    "#;

    let message_reads = sqlx::query_as::<_, MessageRead>(db_query)
        .bind(message_id)
        .fetch_all(&application.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(json!(to_message_read_responses(
        message_id,
        message_reads
    ))))
}
