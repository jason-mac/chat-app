import { API_URL } from '../config';
import type { Message } from '../types/message';

export const fetchRecentMessages = async (conversationId: string) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No auth token found');

  let res: Response;
  try {
    res = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error(`Network error — could not reach ${API_URL}`);
  }

  if (res.status === 401)
    throw new Error('Unauthorized — token may be expired or invalid');
  if (res.status === 403)
    throw new Error('Forbidden — you do not have access to these messages');
  if (res.status === 404)
    throw new Error(`No messages found for conversation ${conversationId}`);
  if (!res.ok)
    throw new Error(`Unexpected error: ${res.status} ${res.statusText}`);

  let data: Message[];
  try {
    data = (await res.json()) as Message[];
  } catch {
    throw new Error('Failed to parse server response as JSON');
  }

  return data.toSorted(
    (b, a) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
};
