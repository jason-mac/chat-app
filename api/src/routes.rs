use crate::Application;
use crate::auth::middleware::auth_middleware;
use crate::handlers::auth::{login, register};
use crate::handlers::me::{delete_me, get_me, update_me};
use crate::handlers::message::{get_conversation, get_message_by_id, get_messages};
use crate::handlers::user::{
    delete_user, get_user_by_id, get_user_profile, get_users, update_user,
};
use crate::handlers::ws::ws_handler;
use axum::middleware;
use axum::routing::{Router, delete, get, patch, post};

use axum::Json;
use axum::{http::StatusCode, response::IntoResponse};
use serde_json::json;

pub fn create_router() -> Router<Application> {
    let user_routes: Router<Application> = Router::new()
        .route("/users", get(get_users))
        .route("/users/{id}", get(get_user_by_id))
        .route("/users/{id}", delete(delete_user))
        .route("/users/{id}", patch(update_user));

    let message_routes: Router<Application> = Router::new()
        .route("/messages", get(get_messages))
        .route("/messages/{id}", get(get_message_by_id))
        .route("/messages/conversation/{id}", get(get_conversation));

    let web_socket_routes: Router<Application> = Router::new().route("/ws/{id}", get(ws_handler));

    let me_routes: Router<Application> = Router::new()
        .route("/me", get(get_me))
        .route("/me", patch(update_me))
        .route("/me", delete(delete_me));

    let auth_routes: Router<Application> = Router::new()
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
