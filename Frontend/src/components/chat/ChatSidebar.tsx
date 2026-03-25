import { useEffect, useState } from 'react';
import { fetchRecentChatItems } from '../../services/recentChatItems.ts';
import { fetchAllUsers } from '../../services/getUsers.ts';
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
  message: string;
  setCurrentUserProfile: React.Dispatch<
    React.SetStateAction<UserProfile | null>
  >;
}

const ChatItemJSX = ({
  userProfile,
  message,
  setCurrentUserProfile,
}: ChatItemJSXProps) => {
  const changeProfile = () => {
    setCurrentUserProfile(userProfile);
  };

  return (
    <div
      onClick={changeProfile}
      className="px-4 py-3 hover:bg-[#111] cursor-pointer border-b border-[#1a1a1a]"
    >
      <p className="text-sm text-white">{userProfile.username}</p>
      <p className="text-xs text-[#555] mt-0.5">{message}</p>
    </div>
  );
};

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
  const [displayData, setDisplayData] = useState<ChatItem[]>(recentMessages);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchAllUsers();
      setUsers(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setRecentMessages(await fetchRecentChatItems());
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!recentMessageSent) return;
    const otherId: string =
      myId === recentMessageSent.message_to
        ? recentMessageSent.message_from
        : recentMessageSent.message_to;
    let index = 0;
    while (index < recentMessages.length) {
      if (otherId === recentMessages[index].userProfile.user_id) break;
      index++;
    }
    // handle this case later, need new design if (index >= recentMessages.length) {}

    const newChatItem: ChatItem = {
      ...recentMessages[index],
      message: recentMessageSent.content,
    };
    let newRecentMessages = recentMessages.filter((_, i) => i !== index);
    newRecentMessages = [newChatItem, ...newRecentMessages];
    setRecentMessages(newRecentMessages);
  }, [recentMessageSent]);

  useEffect(() => {
    if (query === '') {
      if (sideBarMode === 'conversation') {
        setDisplayData(recentMessages);
      } else {
        setDisplayData(
          users.map((user) => ({ userProfile: user, message: '' }) as ChatItem)
        );
      }
      return;
    }
    const data =
      sideBarMode === 'conversation'
        ? recentMessages
        : users.map((user) => ({ userProfile: user, message: '' }) as ChatItem);

    const regexMatch = (chatItem: ChatItem): boolean => {
      return chatItem.userProfile.username
        .toLowerCase()
        .includes(query.toLowerCase());
    };
    setDisplayData(data.filter(regexMatch));
  }, [sideBarMode, query, recentMessages, users]);

  return (
    <aside className="w-64 border-r border-[#222] flex flex-col">
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
    <div className="px-4 py-3 border-b border-[#222]">
      <div className="flex items-center gap-2 bg-[#111] border border-[#333] px-3 py-1.5">
        <svg
          className="w-3.5 h-3.5 text-[#555]"
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
          className="bg-transparent text-white text-sm outline-none w-full placeholder-[#555] font-mono"
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
  const onClick = () => {
    if (sideBarMode === 'user') {
      setSideBarMode('conversation');
    } else {
      setSideBarMode('user');
    }
  };
  return (
    <div className="p-4 border-b border-[#222] flex items-center justify-between">
      <p className="text-xs text-[#555] uppercase tracking-widest">
        {sideBarMode}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={onClick}
          className="text-[#555] hover:text-white cursor-pointer"
        >
          {sideBarMode === 'conversation' && <PersonIcon />}
          {sideBarMode === 'user' && <MessageIcon />}
        </button>
        <button
          onClick={() => fetchRecentChatItems().then(setRecentMessages)}
          className="text-[#555] hover:text-white text-lg cursor-pointer"
        >
          ↻
        </button>
      </div>
    </div>
  );
};

const PersonIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
    />
  </svg>
);

const MessageIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
    />
  </svg>
);
