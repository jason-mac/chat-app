import { useState, useEffect, useRef } from 'react';
import ChatSendBox from './ChatSendBox';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import { LRUCache } from 'lru-cache';
import { fetchRecentMessages } from '../../../services/recentMessages';
import { useWebSocket } from '../../../services/useWebSocket';
import { fetchUserStatus } from '../../../services/getUserStatus';
import { fetchMessageReadEntries } from '../../../services/getMessageReadByUsers';

import type { UserOnline, UserProfile } from '../../../types/user';
import type { Message } from '../../../types/message';
import type { MessageReadResponse } from '../../../types/message-read';

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
  const [userStatus, setUserStatus] = useState<UserOnline | null>(null);
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
        const message = msg.payload;
        if (!currentUserProfileRef.current) return;
        const isConversation =
          message.conversation_id === currentUserProfileRef.current.user_id;
        if (!isConversation) return;
        if (message.sender_id !== myUserId) {
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
          first.sender_id === myUserId
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
      type: 'send_direct_message',
      payload: { content, receiver_id: currentUserProfile.user_id },
    });
  };

  useEffect(() => {
    if (!currentUserProfile || chatMessages.length === 0) return;
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
          chatMessages[0].sender_id === myUserId &&
          messageRead && (
            <span className="text-xs text-[#80848e] self-end pr-2">Seen</span>
          )}
        <div ref={bottomRef} />
      </div>
      {currentUserProfile && <ChatSendBox onSend={handleSend} />}
    </div>
  );
}
