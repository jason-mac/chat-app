import { useState } from 'react';
import { Avatar } from '../../ui/Avatar';
import { motion } from 'framer-motion';

interface ChatMessageProps {
  message: string;
  created_at: string;
  name: string;
  isSender: boolean;
}

const senderCSS =
  'relative self-end bg-[#007AFF] text-white text-sm rounded-2xl rounded-br-none px-3 py-2 max-w-[50%] break-words ' +
  'after:content-[""] after:absolute after:bottom-0 after:right-[-8px] ' +
  'after:border-8 after:border-transparent after:border-b-[#007AFF] after:border-l-[#007AFF]';

const receiverCSS =
  'relative self-start bg-[#3f4147] text-[#dbdee1] text-sm rounded-2xl rounded-bl-none px-3 py-2 max-w-[50%] break-words ' +
  'after:content-[""] after:absolute after:bottom-0 after:left-[-8px] ' +
  'after:border-8 after:border-transparent after:border-b-[#3f4147] after:border-r-[#3f4147]';

export default function ChatMessage({
  message,
  created_at,
  name,
  isSender,
}: ChatMessageProps) {
  const [hovered, setHovered] = useState(false);

  const timestamp = (
    <span
      className={`text-xs text-[#80848e] ${hovered ? 'visible' : 'invisible'}`}
    >
      {new Date(created_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}
    </span>
  );

  return (
    <motion.div
      className={`flex items-center ${isSender ? 'justify-end' : 'justify-start'} gap-1`}
      initial={{ opacity: 0, x: isSender ? 100 : -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', duration: 0.35 }}
    >
      {!isSender && <Avatar name={name} />}
      {isSender && timestamp}
      <div
        className={isSender ? senderCSS : receiverCSS}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {message}
      </div>
      {isSender && <Avatar name={name} color="#c0392b" />}
      {!isSender && timestamp}
    </motion.div>
  );
}
