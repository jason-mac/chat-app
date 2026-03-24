export default function ChatBox() {
  return (
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
        <button className="px-4 py-2 bg-white text-black text-sm">send</button>
      </div>
    </div>
  );
}
