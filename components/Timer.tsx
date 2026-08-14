'use client';

interface Props {
  remaining: number;
  seconds: number;
}

export default function Timer({ remaining, seconds }: Props) {
  const pct = (remaining / seconds) * 100;
  const color = pct > 50 ? 'bg-mint' : pct > 20 ? 'bg-sun' : 'bg-hot';
  const urgent = remaining <= 10;

  return (
    <div className="w-full">
      <div className={`text-center text-6xl font-extrabold tabular-nums ${urgent ? 'text-hot animate-shake' : ''}`}>
        {remaining}
      </div>
      <div className="mt-3 h-4 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
        <div
          className={`h-full ${color} transition-[width] duration-200 ease-linear rounded-full`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
