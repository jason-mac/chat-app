import { API_URL } from '../config';

//.route("/messages/{id}/read", get(get_message_read))
//.route("/messages/{id}/read", post(mark_message_read));

export const markMessageRead = async (message_id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/messages/${message_id}/read`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!res.ok) throw new Error('Failed to mark message as read');
};
