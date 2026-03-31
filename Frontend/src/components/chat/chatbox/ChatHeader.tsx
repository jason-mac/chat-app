import { OnlineIndicator, OfflineIndicator } from '../../ui/UserStatus';
import type { UserOnline } from '../../../types/user';
import { LogoutIcon } from '../../ui/Icons';

interface ChatHeaderProps {
  chatterName: string;
  userStatus: UserOnline | null;
}

const handleLogout = () => {
  localStorage.clear();
  window.location.href = '/';
};

export default function ChatHeader({
  chatterName,
  userStatus,
}: ChatHeaderProps) {
  return (
    <div className="px-4 py-3 flex justify-between items-center border-b border-[#1e1f22] bg-[#313338]">
      <div className="flex items-center gap-2">
        {userStatus &&
          (userStatus.status ? <OnlineIndicator /> : <OfflineIndicator />)}
        <p className="text-sm font-semibold text-[#dbdee1]">{chatterName}</p>
      </div>
      <button
        onClick={handleLogout}
        className="text-xs flex items-center gap-1 text-[#80848e] hover:text-[#dbdee1] cursor-pointer transition-colors"
      >
        logout
        <LogoutIcon />
      </button>
    </div>
  );
}
