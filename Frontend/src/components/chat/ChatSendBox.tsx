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
    <div className="p-4 border-t border-[#222] flex gap-2">
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 bg-[#111] border border-[#222] text-white text-sm px-3 py-2 outline-none font-mono"
        placeholder="type message here..."
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleEnter();
        }}
      />
      <button
        onClick={() => {
          onSend(message);
          setMessage('');
        }}
        className="px-4 py-2 bg-white text-black text-sm"
      >
        send
      </button>
    </div>
  );
}
