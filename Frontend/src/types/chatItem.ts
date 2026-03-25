import type { UserProfile } from './user.ts';
export interface ChatItem {
  userProfile: UserProfile;
  message: string;
}
