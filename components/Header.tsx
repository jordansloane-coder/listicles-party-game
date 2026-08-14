'use client';

import DarkModeToggle from './DarkModeToggle';

interface Props {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onReset?: () => void;
}

export default function Header({ soundEnabled, onToggleSound, onOpenSettings, onOpenHistory, onReset }: Props) {
  return (
    <header
      className="flex items-center justify-between gap-2 px-4 pb-3 max-w-3xl mx-auto w-full"
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
    >
      <span className="font-extrabold text-lg text-hot shrink-0">Listicles</span>
      <div className="flex items-center gap-2">
        {onReset && (
          <button
            onClick={onReset}
            aria-label="Start over"
            className="w-11 h-11 flex items-center justify-center rounded-full bg-hot text-white shadow text-xl shrink-0"
          >
            ↺
          </button>
        )}
        <button
          onClick={onOpenHistory}
          aria-label="Game history"
          className="w-11 h-11 flex items-center justify-center rounded-full bg-card shadow text-xl shrink-0"
        >
          📜
        </button>
        <button
          onClick={onOpenSettings}
          aria-label="Settings"
          className="w-11 h-11 flex items-center justify-center rounded-full bg-card shadow text-xl shrink-0"
        >
          ⚙️
        </button>
        <button
          onClick={onToggleSound}
          aria-label="Toggle sound effects"
          className="w-11 h-11 flex items-center justify-center rounded-full bg-card shadow text-xl shrink-0"
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
        <DarkModeToggle />
      </div>
    </header>
  );
}
