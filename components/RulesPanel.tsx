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
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 py-6"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close rules"
        className="fixed top-5 right-5 z-[60] w-10 h-10 rounded-full bg-white text-hot font-bold shadow-lg flex items-center justify-center text-xl"
      >
        ×
      </button>

      <div
        className="animate-pop-in w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl bg-card shadow-lg p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pr-12">
          <h2 className="text-xl font-extrabold">BuzzFeed Listicles</h2>
          <p className="text-xs opacity-60 mt-1">Complete Rules</p>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm font-semibold bg-background rounded-xl p-3">
            <span className="opacity-50">Players</span>
            <span>2–8 (reference only)</span>
            <span className="opacity-50">Ages</span>
            <span>14+ (reference only)</span>
            <span className="opacity-50">Game length</span>
            <span>4 rounds</span>
            <span className="opacity-50">Items per round</span>
            <span>7</span>
            <span className="opacity-50">Round timer</span>
            <span>90 seconds</span>
          </div>
          <p className="text-xs opacity-50 mt-2">
            Game length, items per round, and round timer are this app&apos;s defaults — all adjustable in Settings.
            Players range and age rating are just reference info, not app settings.
          </p>
        </div>

        <Section title="Setup">
          <p>Give every player an answer pad and pencil. A complete game consists of 4 rounds.</p>
        </Section>

        <Section title="1. Draw a Category Card">
          <p>Draw one Category Card. Read the category aloud and leave it visible so everyone can see it.</p>
        </Section>

        <Section title="2. Draw a Bonus Letter Card">
          <p>Draw one Bonus Letter Card and reveal it to everyone. Answers beginning with this letter can earn extra points during the round.</p>
        </Section>

        <Section title="3. Start the Timer">
          <p>Start the 90-second timer. Everyone plays simultaneously, writing down answers that fit the category.</p>
          <p><strong>Important:</strong> you may write no more than 7 answers. If you finish before time&apos;s up, go back and change or replace answers until it expires. When the timer runs out, stop writing immediately.</p>
        </Section>

        <Section title="The Goal">
          <p>The trick isn&apos;t simply coming up with correct answers — you want answers that other players don&apos;t think of. If another player writes the same answer as you, it&apos;s eliminated from scoring. Unusual but legitimate answers are valuable.</p>
        </Section>

        <Section title="Comparing Answers">
          <p>After time expires, players take turns reading their answers aloud and comparing lists.</p>
          <p><strong>Matching answers:</strong> if two or more players wrote the same answer, that answer scores 0 points for everyone who wrote it.</p>
          <p><strong>Challenging an answer:</strong> if someone believes an answer doesn&apos;t legitimately fit the category, the group decides whether it counts — majority rules. Rejected answers score 0.</p>
        </Section>

        <Section title="Scoring">
          <table className="w-full text-sm mt-1">
            <tbody>
              <tr className="border-b border-black/10">
                <td className="py-1.5 pr-2">Unique answer beginning with the Bonus Letter</td>
                <td className="py-1.5 text-right font-bold whitespace-nowrap">3 points</td>
              </tr>
              <tr className="border-b border-black/10">
                <td className="py-1.5 pr-2">Unique answer beginning with any other letter</td>
                <td className="py-1.5 text-right font-bold whitespace-nowrap">1 point</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-2">Answer matching another player&apos;s answer</td>
                <td className="py-1.5 text-right font-bold whitespace-nowrap">0 points</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-3 rounded-xl bg-background p-3">
            <p className="font-bold mb-1">Example</p>
            <p>Category: &quot;Things You Find at a Wedding&quot; · Bonus Letter: S</p>
            <ul className="list-disc pl-5 mt-1">
              <li>Suit — nobody else wrote it → 3 points</li>
              <li>Cake — nobody else wrote it → 1 point</li>
              <li>Flowers — another player also wrote it → 0 points</li>
            </ul>
            <p className="mt-1 font-bold">Total: 4 points</p>
          </div>
        </Section>

        <Section title="The BuzzFeed Die">
          <p>After everyone&apos;s regular answers are scored, roll the BuzzFeed Die. It contains subjective modifiers: Hot, Basic, WTF, Ew, OMG, Trashy. Whatever&apos;s rolled becomes the bonus challenge for that round.</p>
          <p><strong>Choosing an answer:</strong> each player picks one of their own scoring answers from that round that they think best fits the modifier — an answer eliminated for matching someone else&apos;s can&apos;t be nominated. Everyone reveals their pick.</p>
          <p><strong>Choosing the winner:</strong> the group decides (voting if necessary) whose nominated answer best fits. That player gets +3 bonus points. A genuine tie means both tied players get the +3.</p>
        </Section>

        <Section title="End of the Round">
          <p>Record everyone&apos;s score, discard the Category and Bonus Letter cards, and begin a new round. The BuzzFeed Die bonus happens every round.</p>
        </Section>

        <Section title="End of the Game">
          <p>Play 4 rounds total, then add up each player&apos;s scores across all four. Highest total score wins!</p>
        </Section>

        <Section title="Quick Round Summary">
          <ol className="list-decimal pl-5 flex flex-col gap-1">
            <li>Draw a Category Card.</li>
            <li>Draw a Bonus Letter Card.</li>
            <li>Start the 90-second timer.</li>
            <li>Everyone writes up to 7 answers.</li>
            <li>Compare answers.</li>
            <li>Cross out answers that match another player&apos;s.</li>
            <li>Resolve questionable answers by majority vote.</li>
            <li>Score unique answers (3 / 1 / 0 as above).</li>
            <li>Roll the BuzzFeed Die.</li>
            <li>Each player nominates a scoring answer that fits the modifier.</li>
            <li>Choose/vote for the best one.</li>
            <li>Winner gets +3 points.</li>
            <li>Record scores and start the next round.</li>
          </ol>
          <p className="mt-1">After 4 rounds, the player with the most points wins.</p>
        </Section>

        <p className="text-xs opacity-40 -mt-1">
          This app plays close to these rules, with one bit of built-in flexibility: rounds, items per round, and
          timer length are all adjustable in Settings and never a hard stop.
        </p>
      </div>
    </div>
  );
}
