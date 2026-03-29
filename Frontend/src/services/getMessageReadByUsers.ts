import { API_URL } from '../config';
import type { MessageReadsResponse } from '../types/messageRead';

export const fetchMessageReadEntries = async (
  message_id: string
): Promise<MessageReadsResponse> => {
  const res = await fetch(`${API_URL}/messages/${message_id}/read`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch message read data');
  return res.json();
};
