'use client';

import { Fragment, useState } from 'react';

interface Props {
  defaultItems: number;
  onClose: () => void;
}

function ScoreCard({ rows }: { rows: number }) {
  return (
    <div className="rounded-xl overflow-hidden border-2 border-black/10 flex flex-col bg-white text-black break-inside-avoid">
      <div className="bg-hot text-white px-3 py-2.5 shrink-0 flex items-baseline gap-1.5">
        <span className="font-extrabold text-2xl leading-none tracking-tight">LIST</span>
        <span className="font-semibold text-base leading-none opacity-90">happens</span>
        <span className="text-[9px] font-bold self-start opacity-80">™</span>
      </div>
      <div className="px-3 py-2 border-b border-black/15 font-bold text-xs shrink-0 text-center">
        *BONUS LETTER ________
      </div>
      <div className="flex items-center border-b border-black/15 shrink-0">
        <span className="flex-1" />
        <span className="w-11 shrink-0 border-l-2 border-hot py-1 text-center text-[9px] font-extrabold text-hot">
          POINTS
        </span>
      </div>
      <div className="flex-1 flex flex-col">
        {Array.from({ length: rows }, (_, i) => i + 1).map((n) => (
          <div key={n} className="flex items-stretch border-b border-sky-300/70 flex-1 min-h-0">
            <span className="w-6 shrink-0 flex items-center justify-center font-extrabold text-hot text-sm">
              {n}.
            </span>
            <span className="flex-1 border-l-2 border-hot" />
            <span className="w-11 shrink-0 border-l-2 border-hot" />
          </div>
        ))}
        <div className="flex items-center border-t-2 border-black/20 shrink-0">
          <span className="flex-1 px-2 py-1.5 text-[11px] font-bold opacity-60 text-center">TOTAL POINTS</span>
          <span className="w-11 shrink-0 border-l-2 border-hot py-1.5" />
        </div>
      </div>
    </div>
  );
}

export default function PrintScorecardPanel({ defaultItems, onClose }: Props) {
  const [rows, setRows] = useState(defaultItems);
  const [copies, setCopies] = useState(4);

  return (
    <Fragment>
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 py-6 no-print" onClick={onClose}>
      <button
        onClick={onClose}
        aria-label="Close printable scorecards"
        className="fixed top-5 right-5 z-[60] w-10 h-10 rounded-full bg-white text-hot font-bold shadow-lg flex items-center justify-center text-xl no-print"
      >
        ×
      </button>

      <div
        className="animate-pop-in w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl bg-card shadow-lg p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="no-print flex flex-col gap-5">
          <div className="pr-12">
            <h2 className="text-xl font-extrabold">Printable Scorecards</h2>
            <p className="text-xs opacity-60 mt-1">
              Blank scorecards to hand out and fill in by pen — sized to print landscape on 8.5×11 paper.
            </p>
          </div>

          <label className="flex items-center justify-between gap-3">
            <span className="font-semibold">Answer lines per card</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={rows}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                setRows(Number.isFinite(n) && n >= 1 ? n : 1);
              }}
              className="w-20 rounded-xl bg-background px-3 py-2 text-lg font-bold text-right shadow-inner outline-none"
            />
          </label>

          <label className="flex items-center justify-between gap-3">
            <span className="font-semibold">Copies to print</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={12}
              value={copies}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                setCopies(Number.isFinite(n) && n >= 1 ? Math.min(n, 12) : 1);
              }}
              className="w-20 rounded-xl bg-background px-3 py-2 text-lg font-bold text-right shadow-inner outline-none"
            />
          </label>

          <button
            onClick={() => window.print()}
            className="w-full rounded-2xl bg-hot text-white font-extrabold text-lg py-4 shadow-lg active:scale-95 transition-transform"
          >
            🖨️ Print
          </button>

          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: copies }, (_, i) => i).map((i) => (
              <div key={i} className="h-40 overflow-hidden rounded-xl">
                <ScoreCard rows={rows} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    <div className="printable hidden print:block">
      <div className="print-grid">
        {Array.from({ length: copies }, (_, i) => i).map((i) => (
          <ScoreCard key={i} rows={rows} />
        ))}
      </div>
    </div>
    </Fragment>
  );
}
