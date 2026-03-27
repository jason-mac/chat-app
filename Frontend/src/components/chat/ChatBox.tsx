import { useState, useEffect, useRef } from 'react';
import ChatSendBox from './ChatSendBox';
import { LRUCache } from 'lru-cache';
import type { UserProfile } from '../../types/user';
import type { Message } from '../../types/message';
import { fetchRecentMessages } from '../../services/recentMessages';
import { useWebSocket } from '../../services/websocket';
interface ChatHeaderProps {
  chatterName: string;
}

interface ChatMessageProps {
  message: string;
  created_at: string;
}

const ChatHeader = ({ chatterName }: ChatHeaderProps) => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };
  return (
    <div className="p-4 flex justify-between border-b border-[#222]">
      <p className="text-sm text-white">{chatterName}</p>
      <button
        onClick={handleLogout}
        className="text-sm flex items-center gap-1 text-[#555] hover:text-white cursor-pointer"
      >
        logout
        <LogoutIcon />
      </button>
    </div>
  );
};

const ChatMessageSender = ({ message, created_at }: ChatMessageProps) => {
  return (
    <div className="self-end bg-white text-black text-sm px-3 py-2 max-w-[50%] break-all break-words">
      {message}
      <span className="text-xs text-[#999] ml-2 float-right mt-1">
        {new Date(created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
    </div>
  );
};

const ChatMessageReceiver = ({ message, created_at }: ChatMessageProps) => {
  return (
    <div className="self-start bg-[#111] text-white text-sm px-3 py-2 max-w-[70%] break-all border border-[#222]">
      {message}
      <span className="text-xs text-[#555] ml-2 float-right mt-1">
        {new Date(created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
    </div>
  );
};

interface ChatMessagesProps {
  myId: string;
  messages: Message[];
}

const ChatMessages = ({ myId, messages }: ChatMessagesProps) => {
  const messageBox = (msg: Message) => {
    return myId === msg.message_to ? (
      <ChatMessageReceiver
        key={msg.message_id}
        message={msg.content}
        created_at={msg.created_at}
      />
    ) : (
      <ChatMessageSender
        key={msg.message_id}
        message={msg.content}
        created_at={msg.created_at}
      />
    );
  };
  return <>{[...messages].reverse().map((msg) => messageBox(msg))}</>;
};

interface ChatBoxProps {
  currentUserProfile: UserProfile | null;
  setRecentMessageSent: React.Dispatch<React.SetStateAction<Message | null>>;
}

const cachedMessages = new LRUCache<string, Message[]>({
  max: 5,
  ttl: 1000 * 60 * 2,
});

export default function ChatBox({
  currentUserProfile,
  setRecentMessageSent,
}: ChatBoxProps) {
  const myUserId = localStorage.getItem('user_id') ?? '';
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [chatMessages]);

  const { sendMessage } = useWebSocket(myUserId, (msg) => {
    const parsed = JSON.parse(msg) as Message;
    cachedMessages.delete(parsed.message_from);
    setRecentMessageSent(parsed);
    if (parsed.message_from === currentUserProfile?.user_id) {
      setChatMessages((prev) => [parsed, ...prev]);
    }
  });

  const handleSend = (content: string) => {
    if (!currentUserProfile) return;
    sendMessage(
      JSON.stringify({
        content,
        message_to: currentUserProfile.user_id,
      })
    );
  };

  useEffect(() => {
    if (!currentUserProfile) return;
    const fetchData = async () => {
      try {
        if (cachedMessages.has(currentUserProfile.user_id)) {
          console.log('cache hit');
          setChatMessages(cachedMessages.get(currentUserProfile.user_id)!);
          return;
        }
        const data = await fetchRecentMessages(currentUserProfile.user_id);
        console.log('cache miss');
        cachedMessages.set(currentUserProfile.user_id, data);
        cachedMessages.set(currentUserProfile.user_id, data);
        setChatMessages(data);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };
    fetchData();
  }, [currentUserProfile]);

  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader
        chatterName={
          currentUserProfile ? currentUserProfile.username : 'Select a chat'
        }
      />
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {currentUserProfile && (
          <ChatMessages
            myId={localStorage.getItem('user_id')!}
            messages={chatMessages}
          />
        )}
        <div ref={bottomRef} />
      </div>
      {currentUserProfile && <ChatSendBox onSend={handleSend} />}
    </div>
  );
}

const LogoutIcon = () => (
  <svg
    className="w-4 h-4 ml-2"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);
