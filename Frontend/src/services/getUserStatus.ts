import { API_URL } from '../config';
import type { UserStatus } from '../types/user';

export const fetchUserStatus = async (id: string): Promise<UserStatus> => {
  const res = await fetch(`${API_URL}/users/${id}/online`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
};
