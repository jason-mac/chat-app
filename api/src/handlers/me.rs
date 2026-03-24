use crate::application::Application;
use crate::auth::types::CurrentUser;
use axum::{Extension, Json, extract::State};
use serde_json::{Value, json};

pub async fn get_me(Extension(user): Extension<CurrentUser>) -> Json<Value> {
    Json(json!({
        "user_id": user.user_id,
        "role": user.role
    }))
}

pub async fn update_me(State(_app): State<Application>) -> Json<Option<()>> {
    Json(None)
}

pub async fn delete_me(State(_app): State<Application>) -> Json<Option<()>> {
    Json(None)
}
