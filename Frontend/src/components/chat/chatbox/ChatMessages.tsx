import ChatMessage from './ChatMessage';
import type { Message } from '../../../types/message';

interface ChatMessagesProps {
  myId: string;
  messages: Message[];
  myName: string;
  otherName: string;
}

export default function ChatMessages({
  myId,
  messages,
  myName,
  otherName,
}: ChatMessagesProps) {
  return (
    <>
      {[...messages].reverse().map((msg) => (
        <ChatMessage
          key={msg.message_id}
          message={msg.content}
          created_at={msg.created_at}
          name={msg.sender_id === myId ? myName : otherName}
          isSender={msg.sender_id === myId}
        />
      ))}
    </>
  );
}
