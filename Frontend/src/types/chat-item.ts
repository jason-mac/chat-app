import type { ConversationResponse } from './conversation';
import type { Message } from './message';

export interface ChatItem {
  conversation: ConversationResponse;
  message: Message | null;
}
