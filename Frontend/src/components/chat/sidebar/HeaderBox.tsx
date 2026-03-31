import { MessageIcon, PersonIcon } from '../../ui/Icons';
import { fetchRecentChatItems } from '../../../services/recentChatItems';
import type { ChatItem } from '../../../types/chatItem';

type SideBarMode = 'conversation' | 'user';

export function HeaderBox({
  setRecentMessages,
  sideBarMode,
  setSideBarMode,
}: {
  setRecentMessages: React.Dispatch<React.SetStateAction<ChatItem[]>>;
  sideBarMode: SideBarMode;
  setSideBarMode: React.Dispatch<React.SetStateAction<SideBarMode>>;
}) {
  const isUser = sideBarMode === 'user';
  return (
    <div className="px-4 py-3 border-b border-[#111214] flex items-center justify-between">
      <p className="text-xs text-[#80848e] uppercase tracking-widest font-semibold">
        {sideBarMode}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSideBarMode(isUser ? 'conversation' : 'user')}
          className="text-[#80848e] hover:text-[#dbdee1] cursor-pointer transition-colors"
        >
          {isUser ? <MessageIcon /> : <PersonIcon />}
        </button>
        <button
          onClick={() => fetchRecentChatItems().then(setRecentMessages)}
          className="text-[#80848e] hover:text-[#dbdee1] text-lg cursor-pointer transition-colors"
        >
          ↻
        </button>
      </div>
    </div>
  );
}
