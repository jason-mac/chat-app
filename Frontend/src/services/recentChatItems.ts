import { API_URL } from '../config';
import type { ConversationResponse } from '../types/conversation';
import type { ChatItem } from '../types/chat-item';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const fetchRecentChatItems = async (): Promise<ChatItem[]> => {
  const res = await fetch(`${API_URL}/conversations`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch conversations');
  const conversations = (await res.json()) as ConversationResponse[];
  console.log(conversations);
  return conversations.map((conv) => ({
    conversation: conv,
    message: null,
  }));
};
