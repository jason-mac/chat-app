use crate::application::Application;
use crate::{
    dtos::user::{CreateUser, UpdateUser, UserResponse},
    mappers::user::to_user_response,
    models::user::User,
};

use axum::{
    Json, Router,
    extract::{Path, State},
    routing::{delete, get, patch, post},
};

use serde_json::{Value, json};
use sqlx::PgPool;

use crate::auth::types::CurrentUser;
use axum::Extension;

pub async fn get_users(
    State(application): State<Application>,
    Extension(current_user): Extension<CurrentUser>,
) -> Json<Value> {
    if current_user.role != "admin" {
        return Json(json!({"error": "unauthorized"}));
    }

    let users = sqlx::query_as::<_, User>("SELECT * FROM users")
        .fetch_all(&application.db)
        .await
        .unwrap();
    let response: Vec<UserResponse> = users.into_iter().map(|u| to_user_response(u)).collect();
    Json(json!(response))
}

pub async fn get_user_by_id(
    State(application): State<Application>,
    Path(user_id): Path<i32>,
) -> Json<Value> {
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE user_id = $1")
        .bind(user_id)
        .fetch_optional(&application.db)
        .await
        .unwrap();

    match user {
        Some(u) => Json(json!(to_user_response(u))),
        None => Json(json!({ "error": "user not found" })),
    }
}

pub async fn update_user(
    State(application): State<Application>,
    Path(user_id): Path<i32>,
    Json(body): Json<UpdateUser>,
) -> Json<Value> {
    let user: User = sqlx::query_as::<_, User>(
        "UPDATE users SET username = COALESCE($1, username), email = COALESCE($2, email) WHERE user_id = $3 RETURNING *"
    )
    .bind(body.username)
    .bind(body.email)
    .bind(user_id)
    .fetch_one(&application.db)
    .await
    .unwrap();

    let response: UserResponse = to_user_response(user);

    Json(json!(response))
}

pub async fn delete_user(
    State(application): State<Application>,
    Path(user_id): Path<i32>,
) -> Json<Value> {
    sqlx::query("DELETE FROM users WHERE user_id = $1")
        .bind(user_id)
        .execute(&application.db)
        .await
        .unwrap();

    Json(json!({ "message": "user deleted" }))
}
