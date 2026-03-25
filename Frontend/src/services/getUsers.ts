import { API_URL } from '../config';
import type { UserProfile } from '../types/user';

export const fetchAllUsers = async (): Promise<UserProfile[]> => {
  const res = await fetch(`${API_URL}/users`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
};
