export function SearchBox({
  setQuery,
}: {
  setQuery: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <div className="px-3 py-2 border-b border-[#1e1f22]">
      <div className="flex rounded-lg items-center gap-2 bg-[#111214] px-3 py-1.5">
        <svg
          className="w-3.5 h-3.5 text-[#80848e]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
        <input
          placeholder="search"
          onChange={(e) => setQuery(e.target.value)}
          className="bg-transparent text-[#dbdee1] text-sm outline-none w-full placeholder-[#80848e] font-mono"
        />
      </div>
    </div>
  );
}
