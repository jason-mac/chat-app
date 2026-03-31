import { API_URL } from '../config';
import type { Message } from '../types/message';
import type { UserProfile } from '../types/user';
import type { ChatItem } from '../types/chatItem';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const fetchRecentChatItems = async (): Promise<ChatItem[]> => {
  const myId = localStorage.getItem('user_id');
  if (!myId) throw new Error('Cannot find user_id');

  const res = await fetch(`${API_URL}/messages`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch messages');

  const data = (await res.json()) as Message[];
  data.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const uniqueIds: string[] = [];
  const seen = new Set<string>();

  for (const msg of data) {
    if (uniqueIds.length === 10) break;
    const id: string =
      msg.message_to === myId ? msg.message_from : msg.message_to;
    if (id !== myId && !seen.has(id)) {
      seen.add(id);
      uniqueIds.push(id);
    }
  }

  const results = await Promise.allSettled(
    uniqueIds.map(async (id) => {
      const message = data.find(
        (m) => m.message_from === id || m.message_to === id
      )!;
      const userResult = await fetch(`${API_URL}/users/${id}/profile`, {
        headers: getAuthHeaders(),
      });
      if (!userResult.ok) throw new Error(`Failed to fetch profile for ${id}`);
      const userProfile = (await userResult.json()) as UserProfile;
      return { userProfile, message } as ChatItem;
    })
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<ChatItem> => r.status === 'fulfilled'
    )
    .map((r) => r.value);
};
