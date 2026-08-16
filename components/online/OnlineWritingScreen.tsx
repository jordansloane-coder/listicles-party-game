'use client';

import { useEffect, useRef, useState } from 'react';
import type { OnlineRoom } from '@/lib/onlineTypes';
import {
  finishWriting,
  justinGotPissed,
  pauseTimer,
  passCategory,
  rerollLetter,
  resetTimer,
  resumeTimer,
  startTimer,
  submitAnswers,
} from '@/lib/onlineRoom';
import { useSyncedCountdown } from '@/lib/useSyncedCountdown';
import HourglassTimer from '../HourglassTimer';
import JustinPissedButton from '../JustinPissedButton';

interface Props {
  room: OnlineRoom;
  playerId: string;
  isHost: boolean;
}

export default function OnlineWritingScreen({ room, playerId, isHost }: Props) {
  const itemCount = room.settings.itemsPerRound;
  const me = room.players[playerId];
  const alreadySubmitted = !!me?.currentAnswers;

  const [items, setItems] = useState<string[]>(() => Array(itemCount).fill(''));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const lastCategory = useRef(room.currentCategory);

  // Reset local draft whenever a new category comes in (new round, or a pass).
  useEffect(() => {
    if (room.currentCategory !== lastCategory.current) {
      lastCategory.current = room.currentCategory;
      setItems(Array(itemCount).fill(''));
    }
  }, [room.currentCategory, itemCount]);

  const remaining = useSyncedCountdown(room.timerDeadline, room.timerRemainingWhenPaused, room.settings.roundSeconds);
  const running = !!room.timerDeadline;
  const timeUp = room.timerEverStarted && remaining <= 0;

  const players = Object.values(room.players);
  const submittedCount = players.filter((p) => !!p.currentAnswers).length;

  function updateItem(i: number, value: string) {
    setItems((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  }

  function handleSubmit() {
    void submitAnswers(room.code, playerId, items);
  }

  return (
    <div className="flex-1 flex flex-col items-center px-5 py-8 gap-6 max-w-md mx-auto w-full">
      <p className="text-sm font-bold uppercase tracking-wide opacity-50">
        Round {room.roundNumber} of {room.settings.roundsPerGame}
        {room.currentCategoryIsRaunchy && (
          <span className="ml-2 normal-case tracking-normal font-extrabold text-hot bg-hot/10 rounded-full px-2 py-0.5 text-xs">
            🌶️ Raunchy
          </span>
        )}
      </p>

      <div className="text-center animate-pop-in">
        <p className="text-sm font-semibold uppercase tracking-wide text-electric mb-2">
          Everyone write {itemCount} answers for:
        </p>
        <h2 className="text-3xl font-extrabold leading-tight">{room.currentCategory}</h2>
        <div className="mt-4 inline-block rounded-full bg-sun/20 px-4 py-2 font-bold text-lg">
          ✨ Bonus letter: {room.currentBonusLetter}
        </div>
        <p className="mt-1 text-sm opacity-60">
          Answers starting with {room.currentBonusLetter} are worth 3 points instead of 1!
        </p>

        {isHost && !room.timerEverStarted && (
          <div className="mt-4 flex flex-col items-center gap-2 text-sm opacity-50">
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => void passCategory(room.code, room)} className="underline">
                🔀 Get a different one
              </button>
            </div>
            <button onClick={() => void rerollLetter(room.code)} className="underline">
              🎲 New bonus letter
            </button>
          </div>
        )}
      </div>

      <div className="w-full flex flex-col gap-3">
        <Timer remaining={remaining} seconds={room.settings.roundSeconds} />
        {isHost && (
          <div className="flex gap-3">
            {!room.timerEverStarted ? (
              <button
                onClick={() => void startTimer(room.code, room.settings.roundSeconds)}
                className="flex-1 rounded-2xl bg-hot text-white font-extrabold py-3 shadow-lg active:scale-95 transition-transform"
              >
                ▶️ Start Timer
              </button>
            ) : (
              <>
                <button
                  onClick={() =>
                    void (running ? pauseTimer(room.code, remaining) : resumeTimer(room.code, remaining))
                  }
                  className="flex-1 rounded-2xl bg-card shadow py-3 font-bold active:scale-95 transition-transform"
                >
                  {running ? '⏸ Pause' : '▶ Resume'}
                </button>
                <button
                  onClick={() => void resetTimer(room.code)}
                  className="flex-1 rounded-2xl bg-card shadow py-3 font-bold active:scale-95 transition-transform"
                >
                  ↺ Reset
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {alreadySubmitted ? (
        <div className="w-full text-center rounded-2xl bg-mint/15 py-6 font-bold">
          ✅ List submitted — waiting on {players.length - submittedCount} more player
          {players.length - submittedCount === 1 ? '' : 's'}…
        </div>
      ) : (
        <div className="w-full flex flex-col gap-2">
          {items.map((value, i) => (
            <label key={i} className="flex items-center gap-3">
              <span className="w-8 text-right text-sm font-bold opacity-40">{i + 1}.</span>
              <input
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                value={value}
                onChange={(e) => updateItem(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return;
                  e.preventDefault();
                  if (i < itemCount - 1) inputRefs.current[i + 1]?.focus();
                  else handleSubmit();
                }}
                placeholder={`Item ${i + 1}`}
                className="flex-1 rounded-xl bg-card px-3 py-3 text-base shadow-inner outline-none ring-2 ring-transparent focus:ring-electric"
              />
            </label>
          ))}
          <button
            onClick={handleSubmit}
            className="mt-2 w-full rounded-2xl bg-hot text-white font-extrabold text-xl py-5 shadow-lg active:scale-95 transition-transform"
          >
            Submit My List
          </button>
        </div>
      )}

      <p className="text-xs opacity-40 text-center">
        {submittedCount}/{players.length} submitted
      </p>

      <JustinPissedButton count={room.justinPissedCount} onTap={() => void justinGotPissed(room.code)} />

      {isHost && (
        <button
          onClick={() => void finishWriting(room.code, room)}
          disabled={!timeUp && submittedCount < players.length}
          className="w-full rounded-2xl bg-electric text-white font-extrabold text-xl py-5 shadow-lg disabled:opacity-40 active:scale-95 transition-transform"
        >
          Score This Round →
        </button>
      )}
    </div>
  );
}

function Timer({ remaining, seconds }: { remaining: number; seconds: number }) {
  const urgent = remaining <= 10;
  return (
    <div className="w-full flex flex-col items-center gap-2">
      <div className={`text-center text-6xl font-extrabold tabular-nums ${urgent ? 'text-hot animate-shake' : ''}`}>
        {remaining}
      </div>
      <HourglassTimer remaining={remaining} seconds={seconds} glassColor="var(--foreground)" className="w-20 h-32" />
    </div>
  );
}
