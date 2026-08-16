'use client';

import { useEffect, useState } from 'react';

// Unlike the solo game's useCountdown (which owns start/pause/reset locally),
// this just renders whatever deadline/paused-remaining the host has written
// to the room — every device computes its own remaining time from
// Date.now(), so nobody's clock drifts out of sync waiting on network ticks.
export function useSyncedCountdown(
  deadline: number | null,
  pausedRemaining: number | null,
  fallbackSeconds: number
): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!deadline) return;
    const interval = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(interval);
  }, [deadline]);

  if (deadline) return Math.max(0, Math.ceil((deadline - now) / 1000));
  if (pausedRemaining !== null) return Math.ceil(pausedRemaining);
  return fallbackSeconds;
}
