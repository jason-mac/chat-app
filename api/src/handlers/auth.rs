use axum::{Json, extract::State, http::StatusCode};
use uuid::Uuid;

use crate::Application;
use crate::auth::jwt::create_token;
use crate::auth::password::{hash_password, verify_password};
use crate::dtos::login::{LoginRequest, LoginResponse};
use crate::dtos::register::RegisterRequest;
use crate::models::user::User;

pub async fn register(
    State(app): State<Application>,
    Json(body): Json<RegisterRequest>,
) -> Result<StatusCode, StatusCode> {
    let password_hash = hash_password(&body.password);

    let db_query = r#"
        INSERT INTO users (user_id, username, email, password_hash, role)
        VALUES ($1, $2, $3, $4, 'user')
    "#;

    sqlx::query(db_query)
        .bind(Uuid::new_v4())
        .bind(&body.username)
        .bind(&body.email)
        .bind(password_hash)
        .execute(&app.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::CREATED)
}

pub async fn login(
    State(app): State<Application>,
    Json(body): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, StatusCode> {
    let user: User = sqlx::query_as("SELECT * FROM users WHERE email = $1")
        .bind(&body.email)
        .fetch_one(&app.db)
        .await
        .map_err(|_| StatusCode::UNAUTHORIZED)?;

    if !verify_password(&body.password, &user.password_hash) {
        return Err(StatusCode::UNAUTHORIZED);
    }

    let token = create_token(&app.jwt_secret, &user.user_id.to_string(), &user.role, 24)?;

    Ok(Json(LoginResponse {
        token,
        expires_in: 86400,
    }))
}
