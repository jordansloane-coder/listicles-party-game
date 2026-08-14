'use client';

import HourglassTimer from './HourglassTimer';

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
  const urgent = running && remaining <= 10;

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-3 px-6 bg-gradient-to-b from-hot to-hot-deep text-white overflow-y-auto"
      style={{
        paddingTop: 'max(1.25rem, env(safe-area-inset-top) + 0.5rem)',
        paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom) + 0.5rem)',
      }}
    >
      <button
        onClick={onExit}
        aria-label="Exit big screen mode"
        className="fixed top-3 right-3 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl shrink-0 z-10"
      >
        ✕
      </button>

      {/* Every font size below scales off whichever of viewport width/height is
          more constrained (via min(vw,vh)), since a wide-but-short landscape
          phone screen needs much smaller text than its width alone implies. */}
      <div className="w-full max-w-2xl rounded-[2rem] bg-white text-foreground shadow-2xl flex flex-col items-center gap-1.5 animate-pop-in shrink-0 p-[min(6vw,4vh)]">
        <p className="font-bold uppercase tracking-wide opacity-40 text-[clamp(0.75rem,min(3vw,2.2vh),1.1rem)]">
          The category is
        </p>
        <h1 className="text-center font-extrabold leading-tight text-[clamp(1.25rem,min(5.5vw,5.5vh),3rem)]">
          {category}
        </h1>
      </div>

      <div className="rounded-full bg-white/15 font-extrabold shrink-0 px-[min(5vw,3vh)] py-[min(2vw,1.4vh)] text-[clamp(1rem,min(4vw,3.4vh),1.75rem)]">
        ✨ Bonus letter: {bonusLetter}
      </div>

      {everStarted ? (
        <div className="w-full max-w-xl shrink-0">
          <div
            className={`text-center font-extrabold tabular-nums leading-none text-[clamp(2.25rem,min(15vw,11vh),5.5rem)] ${urgent ? 'animate-shake' : ''}`}
          >
            {remaining}
          </div>
          <HourglassTimer
            remaining={remaining}
            seconds={seconds}
            glassColor="white"
            className="mt-1 mx-auto"
            style={{ width: 'min(16vw, 11vh)', height: 'min(26vw, 17.6vh)' }}
          />
          <div className="mt-3 flex gap-2 justify-center">
            <button
              onClick={running ? onPause : onResume}
              className="rounded-full bg-white text-hot font-extrabold px-5 py-2 text-base shadow-lg active:scale-95 transition-transform"
            >
              {running ? '⏸ Pause' : '▶ Resume'}
            </button>
            <button
              onClick={onReset}
              className="rounded-full bg-white/20 font-extrabold px-5 py-2 text-base active:scale-95 transition-transform"
            >
              ↺ Reset
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onStart}
          className="rounded-full bg-white text-hot font-extrabold shadow-lg active:scale-95 transition-transform shrink-0 px-[min(8vw,5vh)] py-[min(4vw,2.5vh)] text-[clamp(1rem,min(5vw,3.5vh),1.5rem)]"
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
