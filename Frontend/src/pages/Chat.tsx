import ChatSidebar from '../components/chat/sidebar/ChatSidebar';
import ChatBox from '../components/chat/chatbox/ChatBox';
import type { ConversationResponse } from '../types/conversation';
import { useState } from 'react';
import type { Message } from '../types/message';

function Chat() {
  const [currentConversation, setCurrentConversation] =
    useState<ConversationResponse | null>(null);
  const [receiverId, setReceiverId] = useState<string | null>(null);
  const [recentMessageSent, setRecentMessageSent] = useState<Message | null>(
    null
  );

  return (
    <div className="h-screen overflow-hidden flex bg-[#313338] font-mono text-[#dbdee1]">
      <ChatSidebar
        currentConversation={currentConversation}
        setCurrentConversation={setCurrentConversation}
        setReceiverId={setReceiverId}
        recentMessageSent={recentMessageSent}
      />
      <ChatBox
        currentConversation={currentConversation}
        receiverId={receiverId}
        setRecentMessageSent={setRecentMessageSent}
      />
    </div>
  );
}

export default Chat;
