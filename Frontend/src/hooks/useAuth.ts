import { useNavigate } from 'react-router-dom';
import { registerFetch, loginFetch } from '../services/auth';
import type RegisterRequest from '../types/registerRequest';
import type LoginRequest from '../types/loginRequest';

export function useAuth() {
  const navigate = useNavigate();

  const login = async (req: LoginRequest) => {
    const data = await loginFetch(req);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user_id', data.user_id);
    localStorage.setItem('username', data.username);
    navigate('/chat');
  };

  const register = async (req: RegisterRequest) => {
    await registerFetch(req);
  };

  return { login, register };
}
