'use client';

import type { BankedGame } from '@/lib/history';

interface Props {
  games: BankedGame[];
  onClear: () => void;
  onClose: () => void;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function HistoryPanel({ games, onClear, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="animate-pop-in w-full max-w-sm max-h-[80vh] overflow-y-auto rounded-3xl bg-card shadow-lg p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Game History</h2>
          <button onClick={onClose} aria-label="Close history" className="w-9 h-9 rounded-full bg-hot/10 text-hot font-bold">
            ×
          </button>
        </div>

        {games.length === 0 && <p className="text-center opacity-50 py-6">No banked games yet — play one to see it here.</p>}

        <div className="flex flex-col gap-3">
          {games.map((game) => (
            <div key={game.id} className="rounded-2xl bg-background shadow-inner p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wide opacity-50">{formatDate(game.playedAt)}</span>
                <span className="text-xs opacity-50">{game.roundsPlayed} rounds</span>
              </div>
              <div className="flex flex-col gap-1">
                {game.results.map((r) => (
                  <div key={r.name} className="flex justify-between font-semibold text-sm">
                    <span>
                      {r.rank === 1 ? '👑' : `${r.rank}.`} {r.name}
                    </span>
                    <span>{r.score}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {games.length > 0 && (
          <button onClick={onClear} className="text-sm opacity-50 underline py-2">
            Clear history
          </button>
        )}
      </div>
    </div>
  );
}
