import { useState, useEffect, useRef } from 'react';
import { Avatar } from '../ui/Avatar';
import { motion } from 'framer-motion';
import { OnlineIndicator, OfflineIndicator } from '../ui/UserStatus';
import ChatSendBox from './ChatSendBox';
import { LRUCache } from 'lru-cache';
import { fetchRecentMessages } from '../../services/recentMessages';
import { useWebSocket } from '../../services/useWebSocket';
import { fetchUserStatus } from '../../services/getUserStatus';
import { fetchMessageReadEntries } from '../../services/getMessageReadByUsers';

import type { UserStatus } from '../../types/user';
import type { UserProfile } from '../../types/user';
import type { Message, MessageResponse } from '../../types/message';
import type { MessageReadResponse } from '../../types/messageRead';

interface ChatHeaderProps {
  chatterName: string;
  userStatus: UserStatus | null;
}

interface ChatMessageProps {
  message: string;
  created_at: string;
  name: string;
}

const ChatHeader = ({ chatterName, userStatus }: ChatHeaderProps) => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };
  return (
    <div className="px-4 py-3 flex justify-between items-center border-b border-[#1e1f22] bg-[#313338]">
      <div className="flex items-center gap-2">
        {userStatus &&
          (userStatus.status ? <OnlineIndicator /> : <OfflineIndicator />)}
        <p className="text-sm font-semibold text-[#dbdee1]">{chatterName}</p>
      </div>
      <button
        onClick={handleLogout}
        className="text-xs flex items-center gap-1 text-[#80848e] hover:text-[#dbdee1] cursor-pointer transition-colors"
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

const ChatMessageSender = ({ message, created_at, name }: ChatMessageProps) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      className="flex items-center justify-end gap-1"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', duration: 0.35 }}
    >
      <span
        className={`text-xs text-[#80848e] ${hovered ? 'visible' : 'invisible'}`}
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
      <Avatar
        name={name}
        color="

      #c0392b"
      />
    </motion.div>
  );
};

const messageReceiverCSS =
  'relative self-start bg-[#3f4147] text-[#dbdee1] text-sm rounded-2xl rounded-bl-none px-3 py-2 max-w-[50%] break-words ' +
  'after:content-[""] after:absolute after:bottom-0 after:left-[-8px] ' +
  'after:border-8 after:border-transparent after:border-b-[#3f4147] after:border-r-[#3f4147] ';

const ChatMessageReceiver = ({
  message,
  created_at,
  name,
}: ChatMessageProps) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', duration: 0.35 }}
      className="flex items-center justify-start gap-1"
    >
      <Avatar name={name} />
      <div
        className={messageReceiverCSS}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {message}
      </div>
      <span
        className={`text-xs text-[#80848e] ${hovered ? 'visible' : 'invisible'}`}
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
  myName: string;
  otherName: string;
}

const ChatMessages = ({
  myId,
  messages,
  myName,
  otherName,
}: ChatMessagesProps) => {
  const messageBox = (msg: Message) => {
    return myId === msg.message_to ? (
      <ChatMessageReceiver
        key={msg.message_id}
        message={msg.content}
        created_at={msg.created_at}
        name={otherName}
      />
    ) : (
      <ChatMessageSender
        key={msg.message_id}
        message={msg.content}
        created_at={msg.created_at}
        name={myName}
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
  const chatMessagesRef = useRef<Message[]>([]);
  const currentUserProfileRef = useRef(currentUserProfile);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [messageRead, setMessageRead] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    currentUserProfileRef.current = currentUserProfile;
  }, [currentUserProfile]);
  useEffect(() => {
    chatMessagesRef.current = chatMessages;
  }, [chatMessages]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [chatMessages]);

  const { sendMessage } = useWebSocket(myUserId, (msg) => {
    switch (msg.type) {
      case 'new_message': {
        const message: MessageResponse = msg.payload;
        if (!currentUserProfileRef.current) return;
        const isConversation =
          (message.message_from === currentUserProfileRef.current.user_id &&
            message.message_to === myUserId) ||
          (message.message_from === myUserId &&
            message.message_to === currentUserProfileRef.current.user_id);
        if (!isConversation) return;
        if (message.message_to === myUserId) {
          sendMessage({
            type: 'notify_read',
            payload: { message_id: message.message_id },
          });
        }
        cachedMessages.delete(currentUserProfileRef.current.user_id);
        setRecentMessageSent(message);
        setChatMessages((prev) => [message, ...prev]);
        break;
      }
      case 'message_read': {
        const read = msg.payload;
        const first = chatMessagesRef.current[0];
        if (
          first &&
          first.message_id === read.message_id &&
          first.message_to === read.reader_id
        ) {
          setMessageRead(true);
        }
        break;
      }
    }
  });

  const handleSend = (content: string) => {
    if (!currentUserProfile) return;
    sendMessage({
      type: 'send_message',
      payload: { content, message_to: currentUserProfile.user_id },
    });
  };

  useEffect(() => {
    if (!currentUserProfile || chatMessages.length === 0) return;
    const fetchReads = async () => {
      const msg = chatMessages[0];
      if (msg.message_from !== myUserId) return;
      try {
        const data = await fetchMessageReadEntries(msg.message_id);
        const read = data.read_by.some(
          (r: MessageReadResponse) => r.reader_id === msg.message_to
        );
        setMessageRead(read);
      } catch (err) {
        console.log(err);
      }
    };
    fetchReads();
  }, [chatMessages, currentUserProfile]);

  useEffect(() => {
    if (!currentUserProfile) return;
    fetchUserStatus(currentUserProfile.user_id)
      .then(setUserStatus)
      .catch(console.error);
  }, [currentUserProfile]);

  useEffect(() => {
    if (!currentUserProfile) return;
    const load = async () => {
      try {
        if (cachedMessages.has(currentUserProfile.user_id)) {
          setChatMessages(cachedMessages.get(currentUserProfile.user_id)!);
          return;
        }
        const data = await fetchRecentMessages(currentUserProfile.user_id);
        cachedMessages.set(currentUserProfile.user_id, data);
        setChatMessages(data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [currentUserProfile]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#25272b]">
      <ChatHeader
        chatterName={currentUserProfile?.username ?? 'Select a chat'}
        userStatus={userStatus}
      />
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-none">
        {!currentUserProfile ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs text-[#80848e] uppercase tracking-widest">
              select a conversation
            </p>
          </div>
        ) : (
          <ChatMessages
            myId={myUserId}
            messages={chatMessages}
            myName={localStorage.getItem('username') ?? ''}
            otherName={currentUserProfile.username}
          />
        )}
        {chatMessages.length > 0 &&
          chatMessages[0].message_from === myUserId &&
          messageRead && (
            <span className="text-xs text-[#80848e] self-end pr-2">Seen</span>
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
