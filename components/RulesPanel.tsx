'use client';

interface Props {
  onClose: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="font-extrabold text-lg text-hot">{title}</h3>
      <div className="text-sm leading-relaxed opacity-80 flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

export default function RulesPanel({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 py-6">
      <div className="animate-pop-in w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl bg-card shadow-lg p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between sticky top-0 bg-card">
          <h2 className="text-xl font-extrabold">How to Play</h2>
          <button onClick={onClose} aria-label="Close rules" className="w-9 h-9 rounded-full bg-hot/10 text-hot font-bold">
            ×
          </button>
        </div>

        <Section title="1. Add players">
          <p>Add everyone playing (1 or more). You can remove or add people any time from the Start screen.</p>
        </Section>

        <Section title="2. Start a round">
          <p>Each round shows a random category and a random bonus letter. Don&apos;t like the category or letter? Reroll either one independently — passing the category leaves the letter alone, and vice versa. &quot;◀ Previous&quot; steps back through categories you&apos;ve passed on. Tap &quot;Start Timer&quot; whenever everyone&apos;s ready — nothing starts automatically.</p>
        </Section>

        <Section title="3. Write your answers">
          <p>On paper (or in the app, your choice), everyone writes as many answers as the round calls for — items per round is adjustable in Settings, 7 by default. Answers that start with the bonus letter are worth extra.</p>
        </Section>

        <Section title="4. Score the round">
          <p><strong>By hand (default):</strong> once time's up, enter each player's total for the round on the Scorecard screen — you tally uniques/duplicates yourselves from your paper lists.</p>
          <p><strong>Digitally:</strong> uncheck &quot;Skip typing the list&quot; before starting the timer, and each player types their list into the phone afterward. The app scores it automatically: an answer only you wrote is worth 1 point (2 if it starts with the bonus letter); an answer two or more players wrote the same way is worth 0.</p>
        </Section>

        <Section title="5. Bonus die (optional)">
          <p>After scoring, you can roll a die with six faces — Trashy, WTF, Ew, Hot, Basic, OMG — and decide together whose answer best fits. That player gets +3 bonus points. Skip it any time, before or after rolling — it&apos;s just a house-rule bonus, never required.</p>
        </Section>

        <Section title="6. Keep going, or call it">
          <p>&quot;Rounds per game&quot; in Settings is just a label (&quot;Round 2 of 3&quot;) — never a hard stop. Play as many rounds as you want, then tap &quot;🏆 Show Me The Winner&quot; whenever you're actually done to rank everyone 1st to last. That result auto-saves to History. From there, play another game with the same players (scores reset) or start over with new players.</p>
        </Section>

        <Section title="Big Screen Mode">
          <p>Tap &quot;🖥️ Big Screen Mode&quot; (or just rotate your phone to landscape) to show the category, bonus letter, and a big countdown full-screen — set the phone down where everyone can see it.</p>
        </Section>

        <Section title="Settings & History">
          <p>Adjust items per round, rounds-per-game label, timer length, and whether digital entry is skipped by default — changes apply starting next round. History keeps a running log of every finished game.</p>
        </Section>
      </div>
    </div>
  );
}
