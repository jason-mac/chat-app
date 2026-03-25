use crate::application::Application;
use crate::{
    dtos::user::{CreateUser, UpdateUser, UserProfile, UserResponse},
    mappers::user::to_user_response,
    models::user::User,
};

use uuid::Uuid;

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
    println!("current_user: {}", current_user.user_id);
    let users = sqlx::query_as::<_, User>("SELECT * FROM users WHERE user_id != $1")
        .bind(Uuid::parse_str(&current_user.user_id).unwrap())
        .fetch_all(&application.db)
        .await
        .unwrap();
    println!("users returned: {:?}", users);
    let response: Vec<UserResponse> = users.into_iter().map(|u| to_user_response(u)).collect();
    Json(json!(response))
}

pub async fn get_user_profile(
    State(app): State<Application>,
    Path(user_id): Path<Uuid>,
) -> Json<Value> {
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE user_id = $1")
        .bind(user_id)
        .fetch_optional(&app.db)
        .await
        .unwrap();

    match user {
        Some(u) => Json(json!(UserProfile {
            user_id: u.user_id,
            username: u.username,
        })),
        None => Json(json!({"error": "user not found"})),
    }
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
