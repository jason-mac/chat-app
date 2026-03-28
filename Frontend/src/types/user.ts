export interface User {
  user_id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface UserProfile {
  user_id: string;
  username: string;
}

export interface UserStatus {
  user_id: string;
  status: boolean;
}
