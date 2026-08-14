'use client';

import { useEffect, useRef, useState } from 'react';

export interface Countdown {
  remaining: number;
  running: boolean;
  everStarted: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

// A single shared countdown (with pause/resume/reset) so multiple views
// (compact bar, big-screen card) can render the same remaining time without
// racing separate intervals. Uses a wall-clock deadline recomputed on each
// resume so pausing never introduces drift.
export function useCountdown(seconds: number, onExpire: () => void): Countdown {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const [everStarted, setEverStarted] = useState(false);
  const expiredRef = useRef(false);
  const remainingRef = useRef(seconds);
  remainingRef.current = remaining;
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!running) return;
    const deadline = Date.now() + remainingRef.current * 1000;
    const interval = window.setInterval(() => {
      const left = Math.max(0, (deadline - Date.now()) / 1000);
      setRemaining(left);
      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        setRunning(false);
        window.clearInterval(interval);
        onExpireRef.current();
      }
    }, 200);
    return () => window.clearInterval(interval);
  }, [running]);

  return {
    remaining: Math.max(0, Math.ceil(remaining)),
    running,
    everStarted,
    start: () => {
      expiredRef.current = false;
      setRemaining(seconds);
      setEverStarted(true);
      setRunning(true);
    },
    pause: () => setRunning(false),
    resume: () => {
      if (remainingRef.current > 0) setRunning(true);
    },
    reset: () => {
      expiredRef.current = false;
      setRunning(false);
      setRemaining(seconds);
      setEverStarted(false);
    },
  };
}
