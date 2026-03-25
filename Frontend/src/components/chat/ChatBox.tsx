import { useState, useEffect, useRef } from 'react';
import ChatSendBox from './ChatSendBox';
import type { UserProfile } from '../../types/user';
import type { Message } from '../../types/message';
import { fetchRecentMessages } from '../../services/recentMessages';
import { useWebSocket } from '../../services/websocket';
interface ChatHeaderProps {
  chatterName: string;
}

interface ChatMessageProps {
  message: string;
}

const ChatHeader = ({ chatterName }: ChatHeaderProps) => {
  return (
    <div className="p-4 border-b border-[#222]">
      <p className="text-sm text-white">{chatterName}</p>
    </div>
  );
};

const ChatMessageSender = ({ message }: ChatMessageProps) => {
  return (
    <div className="self-end bg-white text-black text-sm px-3 py-2 max-w-[70%] break-words">
      {message}
    </div>
  );
};

const ChatMessageReceiver = ({ message }: ChatMessageProps) => {
  return (
    <div className="self-start bg-[#111] text-white text-sm px-3 py-2 max-w-[70%] break-words border border-[#222]">
      {message}
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
      <ChatMessageReceiver key={msg.message_id} message={msg.content} />
    ) : (
      <ChatMessageSender key={msg.message_id} message={msg.content} />
    );
  };
  return <>{[...messages].reverse().map((msg) => messageBox(msg))}</>;
};

interface ChatBoxProps {
  currentUserProfile: UserProfile | null;
  setRecentMessageSent: React.Dispatch<React.SetStateAction<Message | null>>;
}

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
    setRecentMessageSent(parsed);
    setChatMessages((prev) => {
      return [parsed, ...prev];
    });
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
        const data = await fetchRecentMessages(currentUserProfile.user_id);
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
