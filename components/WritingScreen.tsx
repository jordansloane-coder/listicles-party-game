'use client';

import { useState } from 'react';
import Timer from './Timer';

interface Props {
  category: string;
  bonusLetter: string;
  roundNumber: number;
  roundsPerGame: number;
  roundSeconds: number;
  itemsPerRound: number;
  manualScoringDefault: boolean;
  onExpire: (mode: 'entry' | 'manualScore') => void;
  onSkip: (mode: 'entry' | 'manualScore') => void;
  onPass: () => void;
}

export default function WritingScreen({
  category,
  bonusLetter,
  roundNumber,
  roundsPerGame,
  roundSeconds,
  itemsPerRound,
  manualScoringDefault,
  onExpire,
  onSkip,
  onPass,
}: Props) {
  const [timerStarted, setTimerStarted] = useState(false);
  const [manualMode, setManualMode] = useState(manualScoringDefault);

  const mode: 'entry' | 'manualScore' = manualMode ? 'manualScore' : 'entry';

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
        {!timerStarted && (
          <button onClick={onPass} className="mt-4 text-sm opacity-50 underline">
            🔀 Get a different one
          </button>
        )}
      </div>

      {timerStarted ? (
        <Timer seconds={roundSeconds} onExpire={() => onExpire(mode)} />
      ) : (
        <p className="text-center opacity-50 text-sm">
          Get everyone ready, then start the clock whenever you are.
        </p>
      )}

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
        {!timerStarted && (
          <button
            onClick={() => setTimerStarted(true)}
            className="w-full rounded-2xl bg-hot text-white font-extrabold text-xl py-5 shadow-lg active:scale-95 transition-transform"
          >
            ▶️ Start Timer
          </button>
        )}
        <button
          onClick={() => onSkip(mode)}
          className={
            timerStarted
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
