import { API_URL } from '../config';
import type { UserOnline } from '../types/user';

export const fetchUserStatus = async (id: string): Promise<UserOnline> => {
  const res = await fetch(`${API_URL}/users/${id}/online`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
};
