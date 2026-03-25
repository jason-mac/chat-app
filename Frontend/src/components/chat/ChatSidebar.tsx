import { useEffect, useState } from 'react';
import { fetchRecentChatItems } from '../../services/recentChatItems.ts';
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

export default function ChatSidebar({
  currentUserProfile,
  setCurrentUserProfile,
  recentMessageSent,
}: ChatSidebarProps) {
  const myId = localStorage.getItem('user_id');
  const [recentMessages, setRecentMessages] = useState<ChatItem[]>([]);
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [query, setQuery] = useState<string>('');

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
      setMessages(recentMessages);
    }
    const regexMatch = (chatItem: ChatItem): boolean => {
      return chatItem.userProfile.username
        .toLowerCase()
        .includes(query.toLowerCase());
    };

    const newMessages: ChatItem[] = recentMessages.filter(regexMatch);
    setMessages(newMessages);
  }, [recentMessages, query]);

  return (
    <aside className="w-64 border-r border-[#222] flex flex-col">
      <HeaderBox setRecentMessages={setRecentMessages} />
      <SearchBox setQuery={setQuery} />

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {messages.map((item) => (
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
}: {
  setRecentMessages: React.Dispatch<React.SetStateAction<ChatItem[]>>;
}) => {
  return (
    <div className="p-4 border-b border border-[#222] flex items-center justify-between">
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
  );
};
