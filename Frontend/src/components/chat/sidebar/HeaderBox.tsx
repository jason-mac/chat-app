import { MessageIcon, PersonIcon } from '../../ui/Icons';
import { fetchRecentChatItems } from '../../../services/recentChatItems';
import type { ChatItem } from '../../../types/chat-item';

type SideBarMode = 'conversations' | 'friends';

export function HeaderBox({
  setRecentChats,
  sideBarMode,
  setSideBarMode,
}: {
  setRecentChats: React.Dispatch<React.SetStateAction<ChatItem[]>>;
  sideBarMode: SideBarMode;
  setSideBarMode: React.Dispatch<React.SetStateAction<SideBarMode>>;
}) {
  const isFriends = sideBarMode === 'friends';

  return (
    <div className="px-4 py-3 border-b border-[#111214] flex items-center justify-between">
      <p className="text-xs text-[#80848e] uppercase tracking-widest font-semibold">
        {sideBarMode}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() =>
            setSideBarMode(isFriends ? 'conversations' : 'friends')
          }
          className="text-[#80848e] hover:text-[#dbdee1] cursor-pointer transition-colors"
        >
          {isFriends ? <MessageIcon /> : <PersonIcon />}
        </button>
        <button
          onClick={() => fetchRecentChatItems().then(setRecentChats)}
          className="text-[#80848e] hover:text-[#dbdee1] text-lg cursor-pointer transition-colors"
        >
          ↻
        </button>
      </div>
    </div>
  );
}
