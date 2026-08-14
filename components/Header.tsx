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
    <header className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto w-full">
      <span className="font-extrabold text-lg text-hot">Listicles</span>
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenHistory}
          aria-label="Game history"
          className="w-11 h-11 flex items-center justify-center rounded-full bg-card shadow text-xl"
        >
          📜
        </button>
        <button
          onClick={onOpenSettings}
          aria-label="Settings"
          className="w-11 h-11 flex items-center justify-center rounded-full bg-card shadow text-xl"
        >
          ⚙️
        </button>
        <button
          onClick={onToggleSound}
          aria-label="Toggle sound effects"
          className="w-11 h-11 flex items-center justify-center rounded-full bg-card shadow text-xl"
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
        <DarkModeToggle />
        {onReset && (
          <button
            onClick={onReset}
            aria-label="Reset game"
            className="w-11 h-11 flex items-center justify-center rounded-full bg-card shadow text-xl"
          >
            ↺
          </button>
        )}
      </div>
    </header>
  );
}
