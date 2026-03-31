interface PasswordBoxProps {
  password: string;
  setPassword: (value: string) => void;
}
export function PasswordBox({ password, setPassword }: PasswordBoxProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] text-[#555] uppercase tracking-widest">
        password
      </label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="px-3 py-2.5 bg-[#0a0a0a] border border-[#222] text-white text-sm font-mono outline-none"
        placeholder="••••••••"
      />
    </div>
  );
}
