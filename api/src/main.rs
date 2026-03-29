#![allow(unused)]
// TODO: REMOVE
mod application;
mod auth;
mod db;
mod dtos;
mod handlers;
mod mappers;
mod models;
mod routes;
use axum::Extension;

use application::Application;
use axum::http::Method;
use axum::middleware;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use tower_http::cors::{Any, CorsLayer};

async fn log_request(
    req: axum::extract::Request,
    next: axum::middleware::Next,
) -> axum::response::Response {
    println!("REQUEST: {} {}", req.method(), req.uri());
    next.run(req).await
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let pool = db::create_pool().await;

    let application = Application {
        db: pool,
        connected_users: Arc::new(Mutex::new(HashMap::new())),
        jwt_secret: std::env::var("JWT_SECRET").unwrap_or("dev-secret".to_string()),
    };

    let routes = routes::create_router()
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods([Method::GET, Method::POST, Method::PATCH, Method::DELETE])
                .allow_headers(Any),
        )
        .layer(Extension(application.jwt_secret.clone()))
        .layer(middleware::from_fn(log_request))
        .with_state(application);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .expect("failed to bind tcp listener");
    println!("Server running on http://localhost:3000");

    axum::serve(listener, routes)
        .await
        .expect("failed to start server");
}
