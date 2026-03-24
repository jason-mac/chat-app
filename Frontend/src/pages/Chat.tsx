import ChatSidebar from '../components/chat/ChatSidebar';
import ChatBox from '../components/chat/ChatBox';
function Chat() {
  return (
    <div className="min-h-screen flex bg-[#0a0a0a] font-mono text-white">
      {/* Sidebar */}
      <ChatSidebar />
      <ChatBox />
    </div>
  );
}

export default Chat;
