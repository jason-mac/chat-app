interface AvatarProps {
  name: string;
  color?: string;
}

export const Avatar = ({ name, color = '#5865f2' }: AvatarProps) => (
  <div
    style={{ backgroundColor: color }}
    className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] text-white shrink-0 font-semibold leading-none"
  >
    {name[0].toUpperCase()}
  </div>
);
