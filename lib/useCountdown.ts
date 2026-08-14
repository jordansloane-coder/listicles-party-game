'use client';

import { useEffect, useRef, useState } from 'react';

// A single shared countdown so multiple views (compact bar, big-screen card)
// can render the same remaining time without racing separate intervals.
export function useCountdown(seconds: number, active: boolean, onExpire: () => void): number {
  const [remaining, setRemaining] = useState(seconds);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!active) {
      setRemaining(seconds);
      expiredRef.current = false;
      return;
    }
    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      const left = Math.max(0, seconds - Math.floor((Date.now() - startedAt) / 1000));
      setRemaining(left);
      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        window.clearInterval(interval);
        onExpireRef.current();
      }
    }, 250);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, seconds]);

  return remaining;
}
