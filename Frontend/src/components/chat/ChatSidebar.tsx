import { useEffect, useState } from 'react';
import { Avatar } from '../ui/Avatar.tsx';
import { MessageIcon, PersonIcon } from '../ui/Icons.tsx';
import { fetchRecentChatItems } from '../../services/recentChatItems.ts';
import { fetchAllUsers } from '../../services/getUsers.ts';
import { useMemo } from 'react';
import type { UserProfile } from '../../types/user.ts';
import type { Message } from '../../types/message.ts';
import type { ChatItem } from '../../types/chatItem.ts';

interface ChatSidebarProps {
  currentUserProfile: UserProfile | null;
  setCurrentUserProfile: React.Dispatch<
    React.SetStateAction<UserProfile | null>
  >;
  recentMessageSent: Message | null;
}

interface ChatItemJSXProps {
  userProfile: UserProfile;
  message: Message | null;
  setCurrentUserProfile: React.Dispatch<
    React.SetStateAction<UserProfile | null>
  >;
  isActive: boolean;
}

const ChatItemJSX = ({
  userProfile,
  message,
  setCurrentUserProfile,
  isActive,
}: ChatItemJSXProps) => {
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
};

type SideBarMode = 'conversation' | 'user';

const getOtherId = (message: Message, myId: string) =>
  message.message_to === myId ? message.message_from : message.message_to;

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
    if (!recentMessageSent) return;
    const otherId = getOtherId(recentMessageSent, myId!);
    let index = 0;
    while (index < recentMessages.length) {
      if (otherId === recentMessages[index].userProfile.user_id) break;
      index++;
    }
    // handle this case later, need new design if (index >= recentMessages.length) {}
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
    </aside>
  );
}

const SearchBox = ({
  setQuery,
}: {
  setQuery: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <div className="px-3 py-2 border-b border-[#1e1f22]">
      <div className="flex rounded-lg items-center gap-2 bg-[#111214] px-3 py-1.5">
        <svg
          className="w-3.5 h-3.5 text-[#80848e]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
        <input
          placeholder="search"
          onChange={(e) => setQuery(e.target.value)}
          className="bg-transparent text-[#dbdee1] text-sm outline-none w-full placeholder-[#80848e] font-mono"
        />
      </div>
    </div>
  );
};

const HeaderBox = ({
  setRecentMessages,
  sideBarMode,
  setSideBarMode,
}: {
  setRecentMessages: React.Dispatch<React.SetStateAction<ChatItem[]>>;
  sideBarMode: SideBarMode;
  setSideBarMode: React.Dispatch<React.SetStateAction<SideBarMode>>;
}) => {
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
};
