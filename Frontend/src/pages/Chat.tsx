import ChatSidebar from '../components/chat/sidebar/ChatSidebar';
import ChatBox from '../components/chat/chatbox/ChatBox';
import FriendSearch from '../components/friend-search/FriendSearch';
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

  const [showSearchUser, setShowSearchUser] = useState<boolean>(false);

  return (
    <div className="h-screen overflow-hidden flex bg-[#313338] font-mono text-[#dbdee1]">
      <ChatSidebar
        currentConversation={currentConversation}
        setCurrentConversation={setCurrentConversation}
        setReceiverId={setReceiverId}
        recentMessageSent={recentMessageSent}
        setShowSearchUser={setShowSearchUser}
      />
      {showSearchUser ? (
        <FriendSearch />
      ) : (
        <ChatBox
          currentConversation={currentConversation}
          receiverId={receiverId}
          setRecentMessageSent={setRecentMessageSent}
        />
      )}
    </div>
  );
}

export default Chat;
