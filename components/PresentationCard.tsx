'use client';

interface Props {
  category: string;
  bonusLetter: string;
  timerStarted: boolean;
  remaining: number;
  seconds: number;
  onStartTimer: () => void;
  onExit: () => void;
  onSkip: () => void;
}

export default function PresentationCard({
  category,
  bonusLetter,
  timerStarted,
  remaining,
  seconds,
  onStartTimer,
  onExit,
  onSkip,
}: Props) {
  const pct = (remaining / seconds) * 100;
  const barColor = pct > 50 ? 'bg-mint' : pct > 20 ? 'bg-sun' : 'bg-white';
  const urgent = timerStarted && remaining <= 10;

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 px-6 py-8 bg-gradient-to-br from-hot to-electric text-white overflow-y-auto">
      <button
        onClick={onExit}
        aria-label="Exit big screen mode"
        className="absolute top-5 right-5 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl"
      >
        ✕
      </button>

      <div className="w-full max-w-2xl rounded-[2.5rem] bg-white text-foreground shadow-2xl p-8 sm:p-10 flex flex-col items-center gap-3 animate-pop-in">
        <p className="text-base sm:text-lg font-bold uppercase tracking-wide opacity-40">The category is</p>
        <h1 className="text-center font-extrabold leading-tight text-[clamp(1.75rem,6vw,4rem)]">{category}</h1>
      </div>

      <div className="rounded-full bg-white/15 px-6 sm:px-8 py-3 sm:py-4 font-extrabold text-[clamp(1.25rem,4.5vw,2.25rem)]">
        ✨ Bonus letter: {bonusLetter}
      </div>

      {timerStarted ? (
        <div className="w-full max-w-xl">
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
        </div>
      ) : (
        <button
          onClick={onStartTimer}
          className="rounded-full bg-white text-hot font-extrabold px-8 sm:px-10 py-5 sm:py-6 text-xl sm:text-2xl shadow-lg active:scale-95 transition-transform"
        >
          ▶️ Start Timer
        </button>
      )}

      <button onClick={onSkip} className="text-sm underline opacity-70">
        Everyone&apos;s done — collect answers →
      </button>
    </div>
  );
}
