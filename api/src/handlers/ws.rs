use crate::application::Application;
use crate::auth::jwt::verify_token;
use crate::dtos::message::CreateMessage;
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
            let body: CreateMessage = serde_json::from_str(&text).unwrap();
            let db_query = r#"
                INSERT INTO messages (content, message_from, message_to)
                VALUES ($1, $2, $3)
            "#;

            sqlx::query(db_query)
                .bind(&body.content)
                .bind(user_id)
                .bind(body.message_to)
                .execute(&app.db)
                .await
                .unwrap();

            let users = app.connected_users.lock().await;
            if let Some(recipient_tx) = users.get(&body.message_to) {
                let _ = recipient_tx.send(Message::Text(text.clone()));
            }
        }
    }

    app.connected_users.lock().await.remove(&user_id);
}
