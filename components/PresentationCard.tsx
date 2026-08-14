'use client';

interface Props {
  category: string;
  bonusLetter: string;
  everStarted: boolean;
  running: boolean;
  remaining: number;
  seconds: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onExit: () => void;
  onSkip: () => void;
}

export default function PresentationCard({
  category,
  bonusLetter,
  everStarted,
  running,
  remaining,
  seconds,
  onStart,
  onPause,
  onResume,
  onReset,
  onExit,
  onSkip,
}: Props) {
  const pct = (remaining / seconds) * 100;
  const barColor = pct > 50 ? 'bg-mint' : pct > 20 ? 'bg-sun' : 'bg-white';
  const urgent = running && remaining <= 10;

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-start gap-5 px-6 pb-8 bg-gradient-to-b from-hot to-hot-deep text-white overflow-y-auto"
      style={{ paddingTop: 'max(4.5rem, env(safe-area-inset-top) + 3.5rem)' }}
    >
      <button
        onClick={onExit}
        aria-label="Exit big screen mode"
        className="absolute top-5 right-5 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl shrink-0"
      >
        ✕
      </button>

      <div className="w-full max-w-2xl rounded-[2.5rem] bg-white text-foreground shadow-2xl p-8 sm:p-10 flex flex-col items-center gap-3 animate-pop-in shrink-0">
        <p className="text-base sm:text-lg font-bold uppercase tracking-wide opacity-40">The category is</p>
        <h1 className="text-center font-extrabold leading-tight text-[clamp(1.75rem,6vw,4rem)]">{category}</h1>
      </div>

      <div className="rounded-full bg-white/15 px-6 sm:px-8 py-3 sm:py-4 font-extrabold text-[clamp(1.25rem,4.5vw,2.25rem)] shrink-0">
        ✨ Bonus letter: {bonusLetter}
      </div>

      {everStarted ? (
        <div className="w-full max-w-xl shrink-0">
          <div
            className={`text-center font-extrabold tabular-nums text-[clamp(3.5rem,18vw,8rem)] ${urgent ? 'animate-shake' : ''}`}
          >
            {remaining}
          </div>
          <div className="mt-4 h-5 sm:h-6 w-full rounded-full bg-black/20 overflow-hidden">
            <div
              className={`h-full ${barColor} transition-[width] duration-200 ease-linear rounded-full`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-5 flex gap-3 justify-center">
            <button
              onClick={running ? onPause : onResume}
              className="rounded-full bg-white text-hot font-extrabold px-6 py-3 text-lg shadow-lg active:scale-95 transition-transform"
            >
              {running ? '⏸ Pause' : '▶ Resume'}
            </button>
            <button
              onClick={onReset}
              className="rounded-full bg-white/20 font-extrabold px-6 py-3 text-lg active:scale-95 transition-transform"
            >
              ↺ Reset
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onStart}
          className="rounded-full bg-white text-hot font-extrabold px-8 sm:px-10 py-5 sm:py-6 text-xl sm:text-2xl shadow-lg active:scale-95 transition-transform shrink-0"
        >
          ▶️ Start Timer
        </button>
      )}

      <button onClick={onSkip} className="text-sm underline opacity-70 shrink-0">
        Everyone&apos;s done — collect answers →
      </button>
    </div>
  );
}
