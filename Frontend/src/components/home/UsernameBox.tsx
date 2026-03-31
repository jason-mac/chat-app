interface UsernameBoxProps {
  username: string;
  setUsername: (value: string) => void;
}

export function UsernameBox({ username, setUsername }: UsernameBoxProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] text-[#555] uppercase tracking-widest">
        username
      </label>
      <input
        type="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="px-3 py-2.5 bg-[#0a0a0a] border border-[#222] text-white text-sm font-mono outline-none"
        placeholder="username_example"
      />
    </div>
  );
}
