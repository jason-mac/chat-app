import { useEffect, useState, useMemo } from 'react';
import { PersonIcon } from '../../ui/Icons.tsx';
import { HeaderBox } from './HeaderBox.tsx';
import { SearchBox } from './SearchBox.tsx';
import { ChatItemJSX } from './ChatItemJSX.tsx';
import { fetchRecentChatItems } from '../../../services/recentChatItems.ts';
import { Avatar } from '../../ui/Avatar.tsx';
import type { Message } from '../../../types/message.ts';
import type { ChatItem } from '../../../types/chat-item.ts';
import type { ConversationResponse } from '../../../types/conversation.ts';

interface ChatSidebarProps {
  currentConversation: ConversationResponse | null;
  setCurrentConversation: React.Dispatch<
    React.SetStateAction<ConversationResponse | null>
  >;
  setReceiverId: React.Dispatch<React.SetStateAction<string | null>>;
  recentMessageSent: Message | null;
}

type SideBarMode = 'conversation' | 'user';

export default function ChatSidebar({
  currentConversation,
  setCurrentConversation,
  setReceiverId,
  recentMessageSent,
}: ChatSidebarProps) {
  const [recentChats, setRecentChats] = useState<ChatItem[]>([]);
  const [query, setQuery] = useState<string>('');
  const [sideBarMode, setSideBarMode] = useState<SideBarMode>('conversation');

  const displayData = useMemo(() => {
    if (query === '') return recentChats;
    return recentChats.filter((chatItem) =>
      (chatItem.conversation.name ?? 'Direct Message')
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [sideBarMode, query, recentChats]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchRecentChatItems();
      setRecentChats(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!recentMessageSent) return;
    const conversationId = recentMessageSent.conversation_id;
    let index = 0;
    while (index < recentChats.length) {
      if (conversationId === recentChats[index].conversation.conversation_id)
        break;
      index++;
    }
    if (index >= recentChats.length) return;
    const newChatItem: ChatItem = {
      ...recentChats[index],
      message: recentMessageSent,
    };
    let newRecentChats = recentChats.filter((_, i) => i !== index);
    newRecentChats = [newChatItem, ...newRecentChats];
    setRecentChats(newRecentChats);
  }, [recentMessageSent]);

  return (
    <aside className="w-64 border-r border-[#1e1f22] flex flex-col bg-[#1e1f22]">
      <HeaderBox
        sideBarMode={sideBarMode}
        setSideBarMode={setSideBarMode}
        setRecentChats={setRecentChats}
      />
      <SearchBox setQuery={setQuery} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {displayData.map((item) => (
          <ChatItemJSX
            key={item.conversation.conversation_id}
            conversation={item.conversation}
            message={item.message}
            setCurrentConversation={setCurrentConversation}
            setReceiverId={setReceiverId}
            isActive={
              currentConversation?.conversation_id ===
              item.conversation.conversation_id
            }
          />
        ))}
      </div>
      <div className="mt-auto flex justify-between items-center bg-[#2b2d31] px-4 py-3.5">
        <div className="flex gap-3">
          <Avatar name={`${localStorage.getItem('username')}`} />
          {`${localStorage.getItem('username')}`}
        </div>
        <button className="relative group p-2 rounded hover:bg-[#232428] transition">
          <PersonIcon />
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition text-xs bg-black text-white px-2 py-1 rounded whitespace-nowrap">
            Add friend
          </span>
        </button>
      </div>
    </aside>
  );
}
