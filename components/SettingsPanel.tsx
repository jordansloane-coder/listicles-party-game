'use client';

import type { Settings } from '@/lib/settings';

interface Props {
  settings: Settings;
  onChange: (settings: Settings) => void;
  onClose: () => void;
  onOpenRules: () => void;
  onOpenHistory: () => void;
  onOpenPrint: () => void;
}

function NumberField({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="font-semibold">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          onChange(Number.isFinite(n) && n >= min ? n : min);
        }}
        className="w-20 rounded-xl bg-background px-3 py-2 text-lg font-bold text-right shadow-inner outline-none ring-2 ring-transparent focus:ring-electric"
      />
    </label>
  );
}

export default function SettingsPanel({ settings, onChange, onClose, onOpenRules, onOpenHistory, onOpenPrint }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="animate-pop-in w-full max-w-sm rounded-3xl bg-card shadow-lg p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Settings</h2>
          <button onClick={onClose} aria-label="Close settings" className="w-9 h-9 rounded-full bg-hot/10 text-hot font-bold">
            ×
          </button>
        </div>

        <NumberField
          label="Items per round"
          value={settings.itemsPerRound}
          min={1}
          onChange={(n) => onChange({ ...settings, itemsPerRound: n })}
        />
        <NumberField
          label="Rounds per game (target)"
          value={settings.roundsPerGame}
          min={1}
          onChange={(n) => onChange({ ...settings, roundsPerGame: n })}
        />
        <NumberField
          label="Timer length (seconds)"
          value={settings.roundSeconds}
          min={10}
          onChange={(n) => onChange({ ...settings, roundSeconds: n })}
        />

        <label className="flex items-center justify-between gap-3">
          <span className="font-semibold">Skip digital list entry by default</span>
          <input
            type="checkbox"
            checked={settings.manualScoringDefault}
            onChange={(e) => onChange({ ...settings, manualScoringDefault: e.target.checked })}
            className="w-6 h-6 accent-hot"
          />
        </label>

        <p className="text-xs opacity-50 -mt-2">
          Changes apply starting next round — anything in progress keeps going as-is. &quot;Rounds per game&quot; is just a
          target label, never a hard stop.
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={onOpenRules}
            className="w-full rounded-2xl bg-electric text-white font-bold py-3 shadow active:scale-95 transition-transform"
          >
            📖 See Rules
          </button>
          <button
            onClick={onOpenHistory}
            className="w-full rounded-2xl bg-card border-2 border-black/10 font-bold py-3 active:scale-95 transition-transform"
          >
            📜 Game History
          </button>
          <button
            onClick={onOpenPrint}
            className="w-full rounded-2xl bg-card border-2 border-black/10 font-bold py-3 active:scale-95 transition-transform"
          >
            🖨️ Printable Scorecards
          </button>
        </div>
      </div>
    </div>
  );
}
