'use client';

import { useState } from 'react';

const COLORS = ['#e0201b', '#ffc72c', '#4f5dff', '#2be0a6', '#ff8a3d'];
const PARTICLE_COUNT = 16;
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

function Fireworks() {
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.3;
    const distance = 55 + Math.random() * 45;
    return {
      fx: Math.cos(angle) * distance,
      fy: Math.sin(angle) * distance,
      color: COLORS[i % COLORS.length],
      delay: Math.random() * 0.08,
    };
  });

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((p, i) => (
        <span
          key={i}
          className="firework-particle"
          style={
            {
              '--fx': `${p.fx}px`,
              '--fy': `${p.fy}px`,
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

// Novelty tap counter — purely for fun, no effect on scoring. The mascot
// flails and a little fireworks burst fires per tap, tallied and shown
// again on the final screen.
export default function JustinPissedButton({ count, onTap }: Props) {
  const [burstKey, setBurstKey] = useState(0);

  function handleClick() {
    onTap();
    setBurstKey((k) => k + 1);
  }

  return (
    <div className="flex flex-col items-center gap-1.5 py-2">
      <button onClick={handleClick} className="relative flex flex-col items-center gap-2 active:scale-95 transition-transform">
        <div className="rounded-2xl overflow-hidden shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={burstKey}
            src={`${BASE_PATH}/justin-mascot.png`}
            alt=""
            className={`h-28 w-auto block ${burstKey > 0 ? 'animate-flail' : ''}`}
          />
        </div>
        <span className="rounded-full bg-gradient-to-r from-sun to-hot text-white font-extrabold px-5 py-3 shadow-lg text-sm">
          🎉 Justin got pissed! 🎉
        </span>
        {burstKey > 0 && <Fireworks key={burstKey} />}
      </button>
      {count > 0 && (
        <span className="text-xs opacity-50 font-bold">
          {count} time{count === 1 ? '' : 's'} so far this game
        </span>
      )}
    </div>
  );
}
