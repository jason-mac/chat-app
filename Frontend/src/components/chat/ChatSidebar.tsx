import { useEffect, useState } from 'react';
import { fetchRecentChatItems } from '../../services/recentChatItems.ts';
import type { ChatItem } from '../../types/chatItem.ts';

const ChatItemJSX = ({ user, message }: ChatItem) => (
  <div className="px-4 py-3 hover:bg-[#111] cursor-pointer border-b border-[#1a1a1a]">
    <p className="text-sm text-white">{user}</p>
    <p className="text-xs text-[#555] mt-0.5">{message}</p>
  </div>
);

export default function ChatSidebar() {
  const [recentMessages, setRecentMessages] = useState<ChatItem[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchRecentChatItems();
      setRecentMessages(data);
    };

    fetchData();
  }, []);

  return (
    <aside className="w-64 border-r border-[#222] flex flex-col">
      <div className="p-4 border-b border-[#222] flex items-center justify-between">
        <p className="text-xs text-[#555] uppercase tracking-widest">
          conversations
        </p>
        <button
          onClick={() => fetchRecentChatItems().then(setRecentMessages)}
          className="text-[#555] hover:text-white text-lg cursor-pointer"
        >
          ↻
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {recentMessages.map((item) => (
          <ChatItemJSX key={item.user_id} {...item} />
        ))}
      </div>
    </aside>
  );
}
