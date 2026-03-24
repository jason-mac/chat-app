use serde::{Deserialize, Serialize};

#[derive(Clone, Debug)]
pub struct CurrentUser {
    pub user_id: String,
    pub role: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: i64,
    pub role: String,
}
