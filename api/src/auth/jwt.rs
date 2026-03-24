use crate::auth::types::Claims;
use axum::http::StatusCode;
use chrono::{Duration, Utc};
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation, decode, encode};

pub fn create_token(
    secret: &str,
    user_id: &str,
    role: &str,
    expiry_hours: i64,
) -> Result<String, StatusCode> {
    let exp = (Utc::now() + Duration::hours(expiry_hours)).timestamp() as i64;

    let claims = Claims {
        sub: user_id.to_string(),
        exp,
        role: role.to_string(),
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

pub fn verify_token(secret: &str, token: &str) -> Result<Claims, StatusCode> {
    decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )
    .map(|data| data.claims)
    .map_err(|_| StatusCode::UNAUTHORIZED)
}
