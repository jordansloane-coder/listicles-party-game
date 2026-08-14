'use client';

import Timer from './Timer';

interface Props {
  category: string;
  bonusLetter: string;
  roundNumber: number;
  onExpire: () => void;
  onSkip: () => void;
}

const ROUND_SECONDS = 90;

export default function WritingScreen({ category, bonusLetter, roundNumber, onExpire, onSkip }: Props) {
  return (
    <div className="flex-1 flex flex-col items-center px-5 py-8 gap-8 max-w-md mx-auto w-full">
      <p className="text-sm font-bold uppercase tracking-wide opacity-50">Round {roundNumber}</p>

      <div className="text-center animate-pop-in">
        <p className="text-sm font-semibold uppercase tracking-wide text-electric mb-2">
          Everyone grab paper &amp; pen — write 7 answers for:
        </p>
        <h2 className="text-3xl font-extrabold leading-tight">{category}</h2>
        <div className="mt-4 inline-block rounded-full bg-sun/20 px-4 py-2 font-bold text-lg">
          ✨ Bonus letter: {bonusLetter}
        </div>
        <p className="mt-1 text-sm opacity-60">Answers starting with {bonusLetter} score double!</p>
      </div>

      <Timer seconds={ROUND_SECONDS} onExpire={onExpire} />

      <button
        onClick={onSkip}
        className="mt-auto w-full rounded-2xl bg-electric text-white font-extrabold text-xl py-5 shadow-lg active:scale-95 transition-transform"
      >
        Everyone&apos;s done — collect answers →
      </button>
    </div>
  );
}
