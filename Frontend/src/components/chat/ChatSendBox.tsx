import { useState } from 'react';

interface ChatSendBoxProps {
  onSend: (content: string) => void;
}

export default function ChatSendBox({ onSend }: ChatSendBoxProps) {
  const defaultPlaceHolder = 'type message here...';
  const [message, setMessage] = useState<string>('');
  const [placeHolder, setPlaceHolder] = useState(defaultPlaceHolder);
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
        onChange={(e) => {
          if (placeHolder !== defaultPlaceHolder) {
            setPlaceHolder(defaultPlaceHolder);
          }
          setMessage(e.target.value);
        }}
        className="flex-1 rounded-2xl bg-[#111] border border-[#222] text-white text-sm px-3 py-2 outline-none font-mono"
        placeholder={placeHolder}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleEnter();
        }}
      />
      <button
        onClick={() => {
          if (message === '') {
            setPlaceHolder('cannot send empty message try again');
            return;
          }
          onSend(message);
          setMessage('');
        }}
        className="px-4 py-2 cursor-pointer rounded-2xl bg-white text-black text-sm"
      >
        send
      </button>
    </div>
  );
}
