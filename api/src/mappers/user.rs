use crate::dtos::user::UserResponse;
use crate::models::user::User;

pub fn to_user_response(user: User) -> UserResponse {
    UserResponse {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
    }
}
