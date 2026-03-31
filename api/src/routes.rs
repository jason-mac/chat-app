use crate::Application;
use crate::auth::middleware::auth_middleware;
use crate::handlers::auth::{login, register};
use crate::handlers::me::{delete_me, get_me, update_me};
use crate::handlers::message::{get_conversation, get_message_by_id, get_messages};
use crate::handlers::message_read::{get_message_read, get_message_reads};
use crate::handlers::user::{
    delete_user, get_user_by_id, get_user_online, get_user_profile, get_users, update_user,
};

use crate::handlers::friendship::{
    accept_friend_request, decline_friend_request, delete_friend, get_friends,
    get_pending_friend_requests_incoming, get_pending_friend_requests_outgoing,
    send_friend_request,
};
use crate::handlers::ws::ws_handler;
use axum::middleware;
use axum::routing::{Router, delete, get, patch, post};

use axum::Json;
use axum::{http::StatusCode, response::IntoResponse};
use serde_json::json;

pub fn create_router() -> Router<Application> {
    let user_routes = Router::new()
        .route("/users", get(get_users))
        .route("/users/{user_id}/online", get(get_user_online))
        .route("/users/{user_id}", get(get_user_by_id))
        .route("/users/{user_id}", delete(delete_user))
        .route("/users/{user_id}", patch(update_user));

    let friendship_routes = Router::new()
        .route("/friend-requests", post(send_friend_request))
        .route(
            "/friend-requests/{request_id}/decline",
            patch(decline_friend_request),
        )
        .route(
            "/friend-requests/incoming",
            get(get_pending_friend_requests_incoming),
        )
        .route(
            "/friend-requests/outgoing",
            get(get_pending_friend_requests_outgoing),
        )
        .route(
            "/friend-requests/{request_id}/accept",
            patch(accept_friend_request),
        )
        .route("/friends", get(get_friends))
        .route("/friends/{friend_id}", delete(delete_friend));

    let message_routes = Router::new()
        .route("/messages", get(get_messages))
        .route("/messages/{message_id}", get(get_message_by_id))
        .route("/messages/conversation/{user_id}", get(get_conversation))
        .route("/messages/{message_id}/read", get(get_message_reads))
        .route(
            "/messages/{message_id}/read/{user_id}",
            get(get_message_read),
        );

    let web_socket_routes = Router::new().route("/ws/{id}", get(ws_handler));

    let me_routes = Router::new()
        .route("/me", get(get_me))
        .route("/me", patch(update_me))
        .route("/me", delete(delete_me));

    let auth_routes = Router::new()
        .route("/auth/login", post(login))
        .route("/auth/register", post(register));

    Router::new()
        .nest(
            "/api",
            Router::new()
                .merge(auth_routes)
                .route("/users/{id}/profile", get(get_user_profile))
                .merge(
                    Router::new()
                        .merge(user_routes)
                        .merge(message_routes)
                        .merge(me_routes)
                        .merge(friendship_routes)
                        .route_layer(middleware::from_fn(auth_middleware)),
                ),
        )
        .merge(web_socket_routes)
        .fallback(not_found)
}

async fn not_found() -> impl IntoResponse {
    (
        StatusCode::NOT_FOUND,
        Json(json!({ "error": "Route not found" })),
    )
}
