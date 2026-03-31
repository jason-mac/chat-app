import { API_URL } from '../config';
import type { LoginRequest } from '../types/login';
import type { LoginResponse } from '../types/login';
import type { RegisterRequest } from '../types/register';

export const loginFetch = async (
  body: LoginRequest
): Promise<LoginResponse> => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error('Invalid email or password');

  return res.json();
};

export const registerFetch = async (body: RegisterRequest): Promise<void> => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Registration Unsuccessful');
};
