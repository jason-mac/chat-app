use axum::extract::ws::Message;
use sqlx::PgPool;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{Mutex, mpsc};
use uuid::Uuid;

#[derive(Clone)]
pub struct Application {
    pub db: PgPool,
    pub jwt_secret: String,
    pub connected_users: Arc<Mutex<HashMap<Uuid, mpsc::UnboundedSender<Message>>>>,
}
