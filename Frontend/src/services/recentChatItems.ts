import { API_URL } from '../config';
import type { Message } from '../types/message';
import type { UserProfile } from '../types/user';
import type { ChatItem } from '../types/chatItem';

export const fetchRecentChatItems = async () => {
  const res = await fetch(`${API_URL}/messages`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch messages');

  let data = (await res.json()) as Message[];
  data = data.toSorted(
    (b, a) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const recentChatItems: ChatItem[] = [];

  const seen = new Set<string>();

  let count = 0;
  const myId = localStorage.getItem('user_id');

  for (const message of data) {
    if (count === 10) break;

    const id =
      myId === message.message_to ? message.message_from : message.message_to;

    if (seen.has(id) || id === myId) {
      continue;
    } else {
      seen.add(id);
    }

    const userResult = await fetch(`${API_URL}/users/${id}/profile`);
    const userProfile = (await userResult.json()) as UserProfile;
    recentChatItems.push({
      userProfile: userProfile,
      message: message.content,
    });
    count++;
  }

  return recentChatItems;
};
