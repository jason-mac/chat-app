import { useEffect, useState, useMemo } from 'react';
import { PersonIcon } from '../../ui/Icons.tsx';
import { HeaderBox } from './HeaderBox.tsx';
import { SearchBox } from './SearchBox.tsx';
import { ChatItemJSX } from './ChatItemJSX.tsx';
import { fetchRecentChatItems } from '../../../services/recentChatItems.ts';
import { fetchAllUsers } from '../../../services/getUsers.ts';
import { Avatar } from '../../ui/Avatar.tsx';
import type { UserProfile } from '../../../types/user.ts';
import type { Message } from '../../../types/message.ts';
import type { ChatItem } from '../../../types/chat-item.ts';

interface ChatSidebarProps {
  currentUserProfile: UserProfile | null;
  setCurrentUserProfile: React.Dispatch<
    React.SetStateAction<UserProfile | null>
  >;
  recentMessageSent: Message | null;
}

type SideBarMode = 'conversation' | 'user';

export default function ChatSidebar({
  currentUserProfile,
  setCurrentUserProfile,
  recentMessageSent,
}: ChatSidebarProps) {
  const myId = localStorage.getItem('user_id');
  const [recentMessages, setRecentMessages] = useState<ChatItem[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [query, setQuery] = useState<string>('');
  const [sideBarMode, setSideBarMode] = useState<SideBarMode>('conversation');

  const displayData = useMemo(() => {
    const data =
      sideBarMode === 'conversation'
        ? recentMessages
        : users.map(
            (user) => ({ userProfile: user, message: null }) as ChatItem
          );
    if (query === '') return data;
    return data.filter((chatItem) =>
      chatItem.userProfile.username.toLowerCase().includes(query.toLowerCase())
    );
  }, [sideBarMode, query, recentMessages, users]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchAllUsers();
      setUsers(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchRecentChatItems();
      setRecentMessages(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!recentMessageSent || !myId) return;
    const conversationId = recentMessageSent.conversation_id;
    let index = 0;
    while (index < recentMessages.length) {
      if (conversationId === recentMessages[index].message?.conversation_id)
        break;
      index++;
    }
    if (index >= recentMessages.length) return;
    const newChatItem: ChatItem = {
      ...recentMessages[index],
      message: recentMessageSent,
    };
    let newRecentMessages = recentMessages.filter((_, i) => i !== index);
    newRecentMessages = [newChatItem, ...newRecentMessages];
    setRecentMessages(newRecentMessages);
  }, [recentMessageSent]);

  return (
    <aside className="w-64 border-r border-[#1e1f22] flex flex-col bg-[#1e1f22]">
      <HeaderBox
        sideBarMode={sideBarMode}
        setSideBarMode={setSideBarMode}
        setRecentMessages={setRecentMessages}
      />
      <SearchBox setQuery={setQuery} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {displayData.map((item) => (
          <ChatItemJSX
            key={item.userProfile.user_id}
            userProfile={item.userProfile}
            message={item.message}
            setCurrentUserProfile={setCurrentUserProfile}
            isActive={currentUserProfile?.user_id === item.userProfile.user_id}
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
