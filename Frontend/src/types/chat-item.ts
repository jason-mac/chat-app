import type { UserProfile } from './user.ts';
import type { Message } from './message.ts';
export interface ChatItem {
  userProfile: UserProfile;
  message: Message | null;
}
