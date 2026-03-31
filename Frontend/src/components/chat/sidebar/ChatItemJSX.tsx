import type { Message } from '../../../types/message';
import type { UserProfile } from '../../../types/user';
import { Avatar } from '../../ui/Avatar';

interface ChatItemJSXProps {
  userProfile: UserProfile;
  message: Message | null;
  setCurrentUserProfile: React.Dispatch<
    React.SetStateAction<UserProfile | null>
  >;
  isActive: boolean;
}

export function ChatItemJSX({
  userProfile,
  message,
  setCurrentUserProfile,
  isActive,
}: ChatItemJSXProps) {
  return (
    <div
      onClick={() => setCurrentUserProfile(userProfile)}
      className={`px-4 flex justify-between items-center py-3 cursor-pointer transition-colors ${
        isActive ? 'bg-[#2e3035] hover:bg-[#33363b]' : 'hover:bg-[#2e3035]'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={userProfile.username} />
        <div className="min-w-0">
          <p className="text-sm text-[#dbdee1] font-medium">
            {userProfile.username}
          </p>
          <p className="text-xs text-[#80848e] mt-0.5 truncate w-32">
            {message?.content ?? ''}
          </p>
        </div>
      </div>
    </div>
  );
}
