import ChatSidebar from '../components/chat/ChatSidebar';
import ChatBox from '../components/chat/ChatBox';
import { useState } from 'react';
import type { Message } from '../types/message';

function Chat() {
  const [currentUserProfile, setCurrentUserProfile] = useState<Message | null>(
    null
  );
  const [recentMessageSent, setRecentMessageSent] = useState<Message | null>(
    null
  );
  return (
    <div className="h-screen overflow-hidden flex bg-[#0a0a0a] font-mono text-white">
      <ChatSidebar
        currentUserProfile={currentUserProfile}
        setCurrentUserProfile={setCurrentUserProfile}
        recentMessageSent={recentMessageSent}
      />
      <ChatBox
        currentUserProfile={currentUserProfile}
        setRecentMessageSent={setRecentMessageSent}
      />
    </div>
  );
}

export default Chat;
