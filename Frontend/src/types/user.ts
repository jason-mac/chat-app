export interface CreateUser {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUser {
  username?: string;
  email?: string;
}

export interface UserResponse {
  user_id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface UserProfile {
  user_id: string;
  username: string;
}

export interface UserOnline {
  user_id: string;
  status: boolean;
}
