use crate::application::Application;
use crate::auth::jwt::verify_token;
use crate::dtos::message::CreateMessage;
use crate::dtos::message::MessageResponse;
use crate::dtos::message_read::NotifyRead;
use crate::dtos::message_read::{MessageReadResponse, MessageReadResponses};
use crate::dtos::ws::WsRequest;
use crate::dtos::ws::WsResponse;
use crate::mappers::message::to_message_response;
use axum::extract::Query;
use axum::extract::ws::{Message, WebSocket, WebSocketUpgrade};
use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::Response;
use futures_util::sink::SinkExt;
use futures_util::stream::StreamExt;
use std::collections::HashMap;
use tokio::sync::mpsc;
use uuid::Uuid;

pub async fn ws_handler(
    State(app): State<Application>,
    Path(id): Path<Uuid>,
    Query(params): Query<HashMap<String, String>>,
    ws: WebSocketUpgrade,
) -> Result<Response, StatusCode> {
    let token = params.get("token").ok_or(StatusCode::UNAUTHORIZED)?;
    let claims = verify_token(&app.jwt_secret, token).map_err(|_| StatusCode::UNAUTHORIZED)?;

    if claims.sub != id.to_string() {
        return Err(StatusCode::UNAUTHORIZED);
    }

    Ok(ws.on_upgrade(move |socket| handle_socket(socket, id, app)))
}

async fn handle_socket(socket: WebSocket, user_id: Uuid, app: Application) {
    let (mut sender, mut receiver) = socket.split();

    let (user_tx, mut user_rx) = mpsc::unbounded_channel::<Message>();

    app.connected_users.lock().await.insert(user_id, user_tx);

    tokio::spawn(async move {
        while let Some(msg) = user_rx.recv().await {
            let _ = sender.send(msg).await;
        }
    });

    while let Some(Ok(msg)) = receiver.next().await {
        if let Message::Text(ref text) = msg {
            let request: WsRequest = serde_json::from_str(&text).unwrap();
            match request {
                WsRequest::SendMessage(body) => {
                    handle_send_message(&app, user_id, body).await;
                }

                WsRequest::NotifyRead(body) => {
                    handle_notify_read(&app, user_id, body).await;
                }

                WsRequest::Ping => {}
            }
        }
    }
    app.connected_users.lock().await.remove(&user_id);
}

async fn handle_notify_read(app: &Application, user_id: Uuid, body: NotifyRead) {
    sqlx::query!(
        r#"
        INSERT INTO message_reads (message_id, user_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        "#,
        body.message_id,
        user_id
    )
    .execute(&app.db)
    .await
    .unwrap();

    let sender_id = sqlx::query_scalar!(
        r#"
        SELECT message_from
        FROM messages
        WHERE message_id = $1
        "#,
        body.message_id
    )
    .fetch_one(&app.db)
    .await
    .unwrap();

    let response = WsResponse::MessageRead(MessageReadResponse {
        message_id: body.message_id,
        reader_id: user_id,
        read_at: chrono::Utc::now(),
    });

    let text = serde_json::to_string(&response).unwrap();

    let users = app.connected_users.lock().await;

    if let Some(sender_id) = sender_id {
        if let Some(tx) = users.get(&sender_id) {
            let _ = tx.send(Message::Text(text.into()));
        }
    }
}

async fn handle_send_message(app: &Application, user_id: Uuid, body: CreateMessage) {
    let db_query = r#"
        INSERT INTO messages (content, message_from, message_to)
        VALUES ($1, $2, $3)
        RETURNING *
    "#;

    let saved: crate::models::message::Message = sqlx::query_as(db_query)
        .bind(&body.content)
        .bind(user_id)
        .bind(body.message_to)
        .fetch_one(&app.db)
        .await
        .unwrap();

    let response = WsResponse::NewMessage(to_message_response(saved));
    let text = serde_json::to_string(&response).unwrap();

    let users = app.connected_users.lock().await;

    if let Some(recipient_tx) = users.get(&body.message_to) {
        let _ = recipient_tx.send(Message::Text(text.clone().into()));
    }

    if let Some(sender_tx) = users.get(&user_id) {
        let _ = sender_tx.send(Message::Text(text.into()));
    }
}
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
