use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

use crate::{
    application::Application,
    dtos::friendship::{FriendshipResponse, RespondToFriendRequest, SendFriendRequest},
    mappers::friendship::to_friendship_response,
    models::friendship::{Friendship, FriendshipStatus},
};

use crate::auth::types::CurrentUser;
use axum::Extension;
use serde_json::{Value, json};
use uuid::Uuid;

pub async fn send_friend_request(
    State(application): State<Application>,
    Extension(current_user): Extension<CurrentUser>,
) -> Result<Json<Value>, StatusCode> {
    let db_query = r"#
        INSERT into friendships
        VALUE ()
    #";
    todo!()
}

pub async fn decline_friend_request(
    State(application): State<Application>,
    Extension(current_user): Extension<CurrentUser>,
) -> Result<Json<Value>, StatusCode> {
    todo!()
}

pub async fn delete_friend(
    State(application): State<Application>,
    Extension(current_user): Extension<CurrentUser>,
) -> Result<Json<Value>, StatusCode> {
    todo!()
}

pub async fn get_friends(
    State(application): State<Application>,
    Extension(current_user): Extension<CurrentUser>,
) -> Result<Json<Value>, StatusCode> {
    let db_query = r"#

    #";
    todo!()
}

pub async fn accept_friend_request(
    State(application): State<Application>,
    Extension(current_user): Extension<CurrentUser>,
) -> Result<Json<Value>, StatusCode> {
    todo!()
}
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
