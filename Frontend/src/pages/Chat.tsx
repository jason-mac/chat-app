import ChatSidebar from '../components/chat/sidebar/ChatSidebar';
import ChatBox from '../components/chat/ChatBox';
import type { UserProfile } from '../types/user';
import { useState } from 'react';
import type { Message } from '../types/message';

function Chat() {
  const [currentUserProfile, setCurrentUserProfile] =
    useState<UserProfile | null>(null);
  const [recentMessageSent, setRecentMessageSent] = useState<Message | null>(
    null
  );

  return (
    <div className="h-screen overflow-hidden flex bg-[#313338] font-mono text-[#dbdee1]">
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
