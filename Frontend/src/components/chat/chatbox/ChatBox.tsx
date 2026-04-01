import { useState, useEffect, useRef } from 'react';
import ChatSendBox from '../ChatSendBox';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import { LRUCache } from 'lru-cache';
import { fetchRecentMessages } from '../../../services/recentMessages';
import { useWebSocket } from '../../../services/useWebSocket';
import { fetchMessageReadEntries } from '../../../services/getMessageReadByUsers';

import type { Message } from '../../../types/message';
import type { MessageReadResponse } from '../../../types/message-read';
import type { ConversationResponse } from '../../../types/conversation';

interface ChatBoxProps {
  currentConversation: ConversationResponse | null;
  receiverId: string | null;
  setRecentMessageSent: React.Dispatch<React.SetStateAction<Message | null>>;
}

const cachedMessages = new LRUCache<string, Message[]>({
  max: 5,
  ttl: 1000 * 60 * 10,
});

export default function ChatBox({
  currentConversation,
  receiverId,
  setRecentMessageSent,
}: ChatBoxProps) {
  const myUserId = localStorage.getItem('user_id') ?? '';
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const chatMessagesRef = useRef<Message[]>([]);
  const currentConversationRef = useRef(currentConversation);
  const [messageRead, setMessageRead] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    currentConversationRef.current = currentConversation;
  }, [currentConversation]);
  useEffect(() => {
    chatMessagesRef.current = chatMessages;
  }, [chatMessages]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [chatMessages]);

  const { sendMessage } = useWebSocket(myUserId, (msg) => {
    switch (msg.type) {
      case 'new_message': {
        const message = msg.payload;
        if (!currentConversationRef.current) return;
        if (
          message.conversation_id !==
          currentConversationRef.current.conversation_id
        )
          return;
        if (message.sender_id !== myUserId) {
          sendMessage({
            type: 'notify_read',
            payload: { message_id: message.message_id },
          });
        }
        cachedMessages.delete(currentConversationRef.current.conversation_id);
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
          first.sender_id === myUserId
        ) {
          setMessageRead(true);
        }
        break;
      }
    }
  });

  const handleSend = (content: string) => {
    if (!currentConversation) return;
    console.log(receiverId);
    if (currentConversation.is_group) {
      sendMessage({
        type: 'send_group_message',
        payload: {
          content,
          conversation_id: currentConversation.conversation_id,
        },
      });
    } else {
      if (!receiverId) return;
      console.log(receiverId);
      sendMessage({
        type: 'send_direct_message',
        payload: {
          content,
          conversation_id: currentConversation.conversation_id,
          receiver_id: receiverId,
        },
      });
    }
  };

  useEffect(() => {
    if (!currentConversation || chatMessages.length === 0) return;
    const fetchReads = async () => {
      const msg = chatMessages[0];
      if (msg.sender_id !== myUserId) return;
      try {
        const data = await fetchMessageReadEntries(msg.message_id);
        const read = data.read_by.some(
          (r: MessageReadResponse) => r.reader_id !== myUserId
        );
        setMessageRead(read);
      } catch (err) {
        console.log(err);
      }
    };
    fetchReads();
  }, [chatMessages, currentConversation]);

  useEffect(() => {
    if (!currentConversation) return;
    const load = async () => {
      try {
        if (cachedMessages.has(currentConversation.conversation_id)) {
          setChatMessages(
            cachedMessages.get(currentConversation.conversation_id)!
          );
          return;
        }
        const data = await fetchRecentMessages(
          currentConversation.conversation_id
        );
        cachedMessages.set(currentConversation.conversation_id, data);
        setChatMessages(data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [currentConversation]);

  return (
    <div
      className="flex-1 flex flex-col min-w-0 bg-[#25272b]"
      style={{
        backgroundImage:
          'url(https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <ChatHeader
        chatterName={currentConversation?.name ?? 'Select a chat'}
        userStatus={null}
      />
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-none">
        {!currentConversation ? (
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
            otherName={currentConversation.name ?? 'Direct Message'}
          />
        )}
        {chatMessages.length > 0 &&
          chatMessages[0].sender_id === myUserId &&
          messageRead && (
            <span className="text-xs text-[#80848e] self-end pr-2">Seen</span>
          )}
        <div ref={bottomRef} />
      </div>
      {currentConversation && <ChatSendBox onSend={handleSend} />}
    </div>
  );
}
