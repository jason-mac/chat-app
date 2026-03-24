export default interface LoginResponse {
  token: string;
  expires_in: number;
  user_id: string;
  username: string;
}
