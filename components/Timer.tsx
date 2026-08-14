'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  seconds: number;
  onExpire: () => void;
}

export default function Timer({ seconds, onExpire }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    expiredRef.current = false;
    setRemaining(seconds);
    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      const left = Math.max(0, seconds - Math.floor((Date.now() - startedAt) / 1000));
      setRemaining(left);
      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        window.clearInterval(interval);
        onExpire();
      }
    }, 250);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

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
