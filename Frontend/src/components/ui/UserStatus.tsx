const size = 12;
const center = size / 2;

export const OnlineIndicator = () => (
  <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    <circle cx={center} cy={center} r={center} fill="#22c55e" />
  </svg>
);

export const OfflineIndicator = () => (
  <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    <circle
      cx={center}
      cy={center}
      r={center * 0.75}
      fill="none"
      stroke="#22c55e"
      strokeWidth="1.5"
    />
  </svg>
);
