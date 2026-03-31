interface EmailBoxProps {
  email: string;
  setEmail: (value: string) => void;
}

export function EmailBox({ email, setEmail }: EmailBoxProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] text-[#555] uppercase tracking-widest">
        email
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="px-3 py-2.5 bg-[#0a0a0a] border border-[#222] text-white text-sm font-mono outline-none"
        placeholder="you@example.com"
      />
    </div>
  );
}
