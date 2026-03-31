import { useState } from 'react';

interface ChatSendBoxProps {
  onSend: (content: string) => void;
}

export default function ChatSendBox({ onSend }: ChatSendBoxProps) {
  const [message, setMessage] = useState<string>('');

  const handleEnter = () => {
    if (message !== '') {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <div className="px-4 py-3 flex gap-2 bg-[#313338]">
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 rounded-md bg-[#383a40] border-none text-[#dbdee1] text-sm px-3 py-2 outline-none font-mono placeholder-[#80848e]"
        placeholder="type a message..."
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleEnter();
        }}
      />
      <button
        onClick={handleEnter}
        className="px-4 py-2 cursor-pointer rounded-md bg-[#5865f2] hover:bg-[#4752c4] text-white text-sm transition-colors"
      >
        send
      </button>
    </div>
  );
}
