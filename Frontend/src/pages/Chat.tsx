function Chat() {
  return (
    <div className="min-h-screen flex bg-[#0a0a0a] font-mono text-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-[#222] flex flex-col">
        <div className="p-4 border-b border-[#222]">
          <p className="text-xs text-[#555] uppercase tracking-widest">
            conversations
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {['alice', 'bob', 'charlie'].map((user) => (
            <div
              key={user}
              className="px-4 py-3 hover:bg-[#111] cursor-pointer border-b border-[#1a1a1a]"
            >
              <p className="text-sm text-white">{user}</p>
              <p className="text-xs text-[#555] mt-0.5">hey whats up</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-[#222]">
          <p className="text-sm text-white">alice</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          <div className="self-end bg-white text-black text-sm px-3 py-2 max-w-xs">
            hey!
          </div>
          <div className="self-start bg-[#111] text-white text-sm px-3 py-2 max-w-xs border border-[#222]">
            hey whats up
          </div>
        </div>
        <div className="p-4 border-t border-[#222] flex gap-2">
          <input
            className="flex-1 bg-[#111] border border-[#222] text-white text-sm px-3 py-2 outline-none font-mono"
            placeholder="type a message..."
          />
          <button className="px-4 py-2 bg-white text-black text-sm">
            send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
