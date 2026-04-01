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
    Path(receiver_id): Path<Uuid>,
) -> Result<Json<FriendshipResponse>, StatusCode> {
    let db_query = r#"
        INSERT INTO friendships (requester_id, receiver_id, status)
        VALUES ($1, $2, $3)
        RETURNING *
    "#;

    let friendship = sqlx::query_as::<_, Friendship>(&db_query)
        .bind(Uuid::parse_str(&current_user.user_id).unwrap())
        .bind(receiver_id)
        .bind(FriendshipStatus::Pending)
        .fetch_one(&application.db)
        .await
        .map_err(|e| match e {
            sqlx::Error::RowNotFound => StatusCode::NOT_FOUND,
            _ => {
                println!("DB error: {}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            }
        })?;

    Ok(Json(to_friendship_response(friendship)))
}

pub async fn decline_friend_request(
    State(application): State<Application>,
    Extension(current_user): Extension<CurrentUser>,
    Path(request_id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    let db_query = r#"
        UPDATE friendships
        SET status = 'declined'
        WHERE requester_id = $1
        AND receiver_id = $2
        AND status = 'pending'
    "#;

    sqlx::query(&db_query)
        .bind(request_id)
        .bind(Uuid::parse_str(&current_user.user_id).unwrap())
        .execute(&application.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::NO_CONTENT)
}

pub async fn delete_friend(
    State(application): State<Application>,
    Extension(current_user): Extension<CurrentUser>,
    Path(friend_id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    let db_query = r#"
        DELETE FROM friendships
        WHERE ((requester_id = $1 AND receiver_id = $2)
        OR (requester_id = $2 AND receiver_id = $1))
        AND status = 'accepted'
    "#;

    sqlx::query(&db_query)
        .bind(Uuid::parse_str(&current_user.user_id).unwrap())
        .bind(friend_id)
        .execute(&application.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::NO_CONTENT)
}

pub async fn get_friends(
    State(application): State<Application>,
    Extension(current_user): Extension<CurrentUser>,
) -> Result<Json<Vec<FriendshipResponse>>, StatusCode> {
    let db_query = r#"
        SELECT * 
        FROM friendships
        WHERE requester_id = $1 OR receiver_id = $1
        AND status = 'accepted'
    "#;

    let friends = sqlx::query_as::<_, Friendship>(&db_query)
        .bind(Uuid::parse_str(&current_user.user_id).unwrap())
        .fetch_all(&application.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let response: Vec<FriendshipResponse> =
        friends.into_iter().map(to_friendship_response).collect();
    Ok(Json(response))
}

pub async fn get_pending_friend_requests_incoming(
    State(application): State<Application>,
    Extension(current_user): Extension<CurrentUser>,
) -> Result<Json<Vec<FriendshipResponse>>, StatusCode> {
    let db_query = r#"
        SELECT * 
        FROM friendships
        WHERE receiver_id = $1
        AND status = 'pending'
    "#;
    let friends = sqlx::query_as::<_, Friendship>(&db_query)
        .bind(Uuid::parse_str(&current_user.user_id).unwrap())
        .fetch_all(&application.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let response: Vec<FriendshipResponse> =
        friends.into_iter().map(to_friendship_response).collect();
    Ok(Json(response))
}

pub async fn get_pending_friend_requests_outgoing(
    State(application): State<Application>,
    Extension(current_user): Extension<CurrentUser>,
) -> Result<Json<Vec<FriendshipResponse>>, StatusCode> {
    let db_query = r#"
        SELECT * 
        FROM friendships
        WHERE requester_id = $1
        AND status = 'pending'
    "#;
    let friends = sqlx::query_as::<_, Friendship>(&db_query)
        .bind(Uuid::parse_str(&current_user.user_id).unwrap())
        .fetch_all(&application.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let response: Vec<FriendshipResponse> =
        friends.into_iter().map(to_friendship_response).collect();
    Ok(Json(response))
}

pub async fn accept_friend_request(
    State(application): State<Application>,
    Extension(current_user): Extension<CurrentUser>,
    Path(request_id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    let db_query = r#"
        UPDATE friendships
        SET status = 'accepted'
        WHERE requester_id = $1
        AND receiver_id = $2
        AND status = 'pending'
    "#;

    sqlx::query(&db_query)
        .bind(request_id)
        .bind(Uuid::parse_str(&current_user.user_id).unwrap())
        .execute(&application.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::NO_CONTENT)
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
