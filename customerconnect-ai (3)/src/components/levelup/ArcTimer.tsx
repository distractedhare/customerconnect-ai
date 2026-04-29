interface ArcTimerProps {
  timeLeft: number;
  totalTime: number;
  size?: number;
}

export default function ArcTimer({ timeLeft, totalTime, size = 56 }: ArcTimerProps) {
  const r = 22;
  const circumference = 2 * Math.PI * r;
  const progress = totalTime > 0 ? timeLeft / totalTime : 0;
  const offset = circumference * (1 - progress);
  const stroke =
    timeLeft > totalTime * 0.4
      ? '#E20074'
      : timeLeft > totalTime * 0.15
      ? 'var(--sem-warning-accent)'
      : 'var(--sem-error-accent)';
  const textColor =
    timeLeft > totalTime * 0.4
      ? 'text-foreground'
      : timeLeft > totalTime * 0.15
      ? 'text-warning-foreground'
      : 'text-error-foreground';

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 52 52" className="-rotate-90" aria-hidden="true">
        <circle cx="26" cy="26" r={r} fill="none" stroke="currentColor" strokeWidth="3.5" className="text-t-light-gray/40" />
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.4s ease' }}
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center text-sm font-black tabular-nums ${textColor}`}
        aria-label={`${timeLeft} seconds remaining`}
      >
        {timeLeft}
      </span>
    </div>
  );
}
