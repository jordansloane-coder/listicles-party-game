'use client';

import { useEffect, useState } from 'react';
import Timer from './Timer';
import PresentationCard from './PresentationCard';
import { useCountdown } from '@/lib/useCountdown';

interface Props {
  category: string;
  bonusLetter: string;
  roundNumber: number;
  roundsPerGame: number;
  roundSeconds: number;
  itemsPerRound: number;
  manualScoringDefault: boolean;
  hasPreviousCategory: boolean;
  onExpire: (mode: 'entry' | 'manualScore') => void;
  onSkip: (mode: 'entry' | 'manualScore') => void;
  onPass: () => void;
  onGoBack: () => void;
  onRerollLetter: () => void;
}

export default function WritingScreen({
  category,
  bonusLetter,
  roundNumber,
  roundsPerGame,
  roundSeconds,
  itemsPerRound,
  manualScoringDefault,
  hasPreviousCategory,
  onExpire,
  onSkip,
  onPass,
  onGoBack,
  onRerollLetter,
}: Props) {
  const [manualMode, setManualMode] = useState(manualScoringDefault);
  const [presentationMode, setPresentationMode] = useState(false);

  const mode: 'entry' | 'manualScore' = manualMode ? 'manualScore' : 'entry';
  const { remaining, running, everStarted, start, pause, resume, reset } = useCountdown(roundSeconds, () =>
    onExpire(mode)
  );

  // Rotate the phone to landscape and the big-screen card appears on its own;
  // rotate back and it goes away. A manual button covers desktop/no-rotation.
  useEffect(() => {
    if (!window.matchMedia) return;
    const mql = window.matchMedia('(orientation: landscape)');
    const sync = () => setPresentationMode(mql.matches);
    sync();
    mql.addEventListener('change', sync);
    return () => mql.removeEventListener('change', sync);
  }, []);

  function enterPresentation() {
    setPresentationMode(true);
    document.documentElement.requestFullscreen?.().catch(() => {});
  }

  function exitPresentation() {
    setPresentationMode(false);
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  }

  if (presentationMode) {
    return (
      <PresentationCard
        category={category}
        bonusLetter={bonusLetter}
        everStarted={everStarted}
        running={running}
        remaining={remaining}
        seconds={roundSeconds}
        onStart={start}
        onPause={pause}
        onResume={resume}
        onReset={reset}
        onExit={exitPresentation}
        onSkip={() => onSkip(mode)}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center px-5 py-8 gap-8 max-w-md mx-auto w-full">
      <p className="text-sm font-bold uppercase tracking-wide opacity-50">
        Round {roundNumber} of {roundsPerGame}
      </p>

      <div className="text-center animate-pop-in">
        <p className="text-sm font-semibold uppercase tracking-wide text-electric mb-2">
          Everyone grab paper &amp; pen — write {itemsPerRound} answers for:
        </p>
        <h2 className="text-3xl font-extrabold leading-tight">{category}</h2>
        <div className="mt-4 inline-block rounded-full bg-sun/20 px-4 py-2 font-bold text-lg">
          ✨ Bonus letter: {bonusLetter}
        </div>
        <p className="mt-1 text-sm opacity-60">Answers starting with {bonusLetter} score double!</p>
        {!everStarted && (
          <div className="mt-4 flex flex-col items-center gap-2 text-sm opacity-50">
            <div className="flex items-center justify-center gap-4">
              {hasPreviousCategory && (
                <button onClick={onGoBack} className="underline">
                  ◀ Previous
                </button>
              )}
              <button onClick={onPass} className="underline">
                🔀 Get a different one
              </button>
            </div>
            <button onClick={onRerollLetter} className="underline">
              🎲 New bonus letter
            </button>
          </div>
        )}
      </div>

      {everStarted ? (
        <div className="w-full flex flex-col gap-3">
          <Timer remaining={remaining} seconds={roundSeconds} />
          <div className="flex gap-3">
            <button
              onClick={running ? pause : resume}
              className="flex-1 rounded-2xl bg-card shadow py-3 font-bold active:scale-95 transition-transform"
            >
              {running ? '⏸ Pause' : '▶ Resume'}
            </button>
            <button
              onClick={reset}
              className="flex-1 rounded-2xl bg-card shadow py-3 font-bold active:scale-95 transition-transform"
            >
              ↺ Reset
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center opacity-50 text-sm">
          Get everyone ready, then start the clock whenever you are.
        </p>
      )}

      <button
        onClick={enterPresentation}
        className="flex items-center gap-2 rounded-full bg-card shadow px-4 py-2 text-sm font-bold"
      >
        🖥️ Big Screen Mode
      </button>

      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          checked={manualMode}
          onChange={(e) => setManualMode(e.target.checked)}
          className="w-5 h-5 accent-hot"
        />
        Skip typing the list — I&apos;ll score by hand
      </label>

      <div className="mt-auto w-full flex flex-col gap-3">
        {!everStarted && (
          <button
            onClick={start}
            className="w-full rounded-2xl bg-hot text-white font-extrabold text-xl py-5 shadow-lg active:scale-95 transition-transform"
          >
            ▶️ Start Timer
          </button>
        )}
        <button
          onClick={() => onSkip(mode)}
          className={
            everStarted
              ? 'w-full rounded-2xl bg-electric text-white font-extrabold text-xl py-5 shadow-lg active:scale-95 transition-transform'
              : 'text-sm opacity-50 underline py-2'
          }
        >
          Everyone&apos;s done — collect answers →
        </button>
      </div>
    </div>
  );
}
