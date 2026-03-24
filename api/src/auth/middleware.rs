use axum::Extension;
use axum::extract::Request;
use axum::{http::StatusCode, middleware::Next, response::Response};

use crate::auth::jwt::verify_token;
use crate::auth::types::CurrentUser;

pub async fn auth_middleware(
    Extension(jwt_secret): Extension<String>,
    mut req: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let token = req
        .headers()
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let claims = verify_token(&jwt_secret, token)?;

    let user = CurrentUser {
        user_id: claims.sub,
        role: claims.role,
    };

    req.extensions_mut().insert(user);

    Ok(next.run(req).await)
}
