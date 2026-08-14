'use client';

import HourglassTimer from './HourglassTimer';

interface Props {
  remaining: number;
  seconds: number;
}

export default function Timer({ remaining, seconds }: Props) {
  const urgent = remaining <= 10;

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <div className={`text-center text-6xl font-extrabold tabular-nums ${urgent ? 'text-hot animate-shake' : ''}`}>
        {remaining}
      </div>
      <HourglassTimer remaining={remaining} seconds={seconds} glassColor="var(--foreground)" className="w-20 h-32" />
    </div>
  );
}
