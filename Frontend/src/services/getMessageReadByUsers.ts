import { API_URL } from '../config';
import type { MessageReadEntries } from '../types/messageRead';

//.route("/messages/{id}/read", get(get_message_read))
//.route("/messages/{id}/read", post(mark_message_read));

export const fetchMessageReadEntries = async (
  message_id: string
): Promise<MessageReadEntries> => {
  const res = await fetch(`${API_URL}/messages/${message_id}/read`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch message read data');
  return res.json();
};
