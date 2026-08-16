'use client';

import { useEffect, useState } from 'react';

const COLORS = ['#e0201b', '#ffc72c', '#4f5dff', '#2be0a6', '#ff8a3d'];
const PARTICLE_COUNT = 28;
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const DISPLAY_MS = 4000;
const FADE_MS = 300;

function Fireworks8Bit() {
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.3;
    const distance = 25 + Math.random() * 35;
    return {
      fx: Math.cos(angle) * distance,
      fy: Math.sin(angle) * distance,
      color: COLORS[i % COLORS.length],
      delay: Math.random() * 0.4,
      size: 10 + Math.random() * 16,
    };
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <span
          key={i}
          className="firework-particle-8bit"
          style={
            {
              '--fx': `${p.fx}vw`,
              '--fy': `${p.fy}vh`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              animationDelay: `${p.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

interface Props {
  count: number;
  onTap: () => void;
}

type OverlayPhase = 'hidden' | 'shown' | 'leaving';

// Novelty tap counter — purely for fun, no effect on scoring. Tapping cuts to
// a full-screen takeover with the mascot flailing and an 8-bit fireworks
// burst for a few seconds, then fades back to whatever screen was showing.
export default function JustinPissedButton({ count, onTap }: Props) {
  const [phase, setPhase] = useState<OverlayPhase>('hidden');

  useEffect(() => {
    if (phase !== 'shown') return;
    const t = window.setTimeout(() => setPhase('leaving'), DISPLAY_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'leaving') return;
    const t = window.setTimeout(() => setPhase('hidden'), FADE_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  function handleClick() {
    onTap();
    setPhase('shown');
  }

  return (
    <>
      <div className="flex flex-col items-center gap-1.5 py-2">
        <button
          onClick={handleClick}
          className="rounded-full bg-gradient-to-r from-sun to-hot text-white font-extrabold px-5 py-3 shadow-lg active:scale-95 transition-transform"
        >
          🎉 Justin got pissed! 🎉
        </button>
        {count > 0 && (
          <span className="text-xs opacity-50 font-bold">
            {count} time{count === 1 ? '' : 's'} so far this game
          </span>
        )}
      </div>

      {phase !== 'hidden' && (
        <div
          onClick={() => setPhase('leaving')}
          className={`fixed inset-0 z-[200] flex flex-col items-center justify-center gap-5 bg-black/90 overflow-hidden transition-opacity duration-300 ${
            phase === 'leaving' ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <Fireworks8Bit />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${BASE_PATH}/justin-mascot.png`}
            alt=""
            className="relative max-h-[48vh] max-w-[85vw] w-auto h-auto object-contain animate-flail-big"
          />
          <p
            className="relative text-4xl sm:text-5xl font-extrabold text-white uppercase tracking-wide text-center px-4"
            style={{ textShadow: '3px 3px 0 #e0201b, -2px -2px 0 #000' }}
          >
            Justin is pissed!
          </p>
        </div>
      )}
    </>
  );
}
