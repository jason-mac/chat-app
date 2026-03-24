use serde::{Deserialize, Serialize};
use uuid::Uuid;

use chrono::{DateTime, Utc};
use sqlx::FromRow;

#[derive(Deserialize)]
pub struct CreateUser {
    pub username: String,
    pub email: String,
    pub password: String,
}

#[derive(Deserialize)]
pub struct UpdateUser {
    pub username: Option<String>,
    pub email: Option<String>,
}

#[derive(Serialize)]
pub struct UserResponse {
    pub user_id: Uuid,
    pub username: String,
    pub email: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct UserProfile {
    pub user_id: Uuid,
    pub username: String,
}
