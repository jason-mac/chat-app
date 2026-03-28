import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { UserStatus } from '../../types/user';
import { OnlineIndicator, OfflineIndicator } from '../ui/UserStatus';
import ChatSendBox from './ChatSendBox';
import { LRUCache } from 'lru-cache';
import type { UserProfile } from '../../types/user';
import type { Message } from '../../types/message';
import { fetchRecentMessages } from '../../services/recentMessages';
import { useWebSocket } from '../../services/websocket';
import { fetchUserStatus } from '../../services/getUserStatus';

interface ChatHeaderProps {
  chatterName: string;
  userStatus: UserStatus | null;
}

interface ChatMessageProps {
  message: string;
  created_at: string;
}

const ChatHeader = ({ chatterName, userStatus }: ChatHeaderProps) => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };
  return (
    <div className="p-4 flex justify-between border-b border-[#222]">
      <div className="flex items-center">
        {userStatus &&
          (userStatus.status ? <OnlineIndicator /> : <OfflineIndicator />)}
        <p className="text-sm text-white ml-3">{chatterName}</p>
      </div>
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

const messageSenderCSS =
  'relative self-end bg-[#007AFF] text-white text-sm rounded-2xl rounded-br-none px-3 py-2 max-w-[50%] break-words ' +
  'after:content-[""] after:absolute after:bottom-0 after:right-[-8px] ' +
  'after:border-8 after:border-transparent after:border-b-[#007AFF] after:border-l-[#007AFF] ';

const ChatMessageSender = ({ message, created_at }: ChatMessageProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="flex items-end justify-end gap-1"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', duration: 0.35 }}
    >
      <span
        className={`text-xs text-gray-400 ${hovered ? 'visible' : 'invisible'}`}
      >
        {new Date(created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
      <div
        className={messageSenderCSS}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {message}
      </div>
    </motion.div>
  );
};

const messageReceiverCSS =
  'relative self-start bg-[#E9E9EB] text-black text-sm rounded-2xl rounded-bl-none px-3 py-2 max-w-[50%] break-words ' +
  'after:content-[""] after:absolute after:bottom-0 after:left-[-8px] ' +
  'after:border-8 after:border-transparent after:border-b-[#E9E9EB] after:border-r-[#E9E9EB] ';

const ChatMessageReceiver = ({ message, created_at }: ChatMessageProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', duration: 0.35 }}
      className="flex items-end justify-start gap-1"
    >
      <div
        className={messageReceiverCSS}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {message}
      </div>
      <span
        className={`text-xs text-gray-400 ${hovered ? 'visible' : 'invisible'}`}
      >
        {new Date(created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
    </motion.div>
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
  ttl: 1000 * 60 * 10,
});

export default function ChatBox({
  currentUserProfile,
  setRecentMessageSent,
}: ChatBoxProps) {
  const myUserId = localStorage.getItem('user_id') ?? '';
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);

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
    const message = {
      content,
      message_to: currentUserProfile.user_id,
      created_at: new Date().toISOString(),
    } as Message;
    sendMessage(JSON.stringify(message));
    setChatMessages((prev) => [message, ...prev]);
  };

  useEffect(() => {
    if (!currentUserProfile) return;
    const fetchData = async () => {
      try {
        const data = await fetchUserStatus(currentUserProfile.user_id);
        setUserStatus(data);
      } catch (err) {
        console.log('Failed to fetch user status:', err);
      }
    };
    fetchData();
  }, [currentUserProfile]);

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
        setChatMessages(data);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };
    fetchData();
  }, [currentUserProfile]);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <ChatHeader
        chatterName={
          currentUserProfile ? currentUserProfile.username : 'Select a chat'
        }
        userStatus={userStatus}
      />
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 w-full scrollbar-none">
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
