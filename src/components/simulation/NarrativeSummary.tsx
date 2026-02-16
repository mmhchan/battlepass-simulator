import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useSimulation } from '@/hooks/useSimulation';
import { useSeasonStore, useUIStore } from '@/store/useSeasonStore';

interface PaceMilestone {
  id: string;
  name: string;
  color: string;
  day25: number | null;
  day50: number | null;
  day75: number | null;
}

interface PaceShift {
  id: string;
  name: string;
  color: string;
  firstHalfRate: number;  // tiers per week in first half
  secondHalfRate: number; // tiers per week in second half
  slowdown: number;       // percentage slower (positive = slowing down)
  completed: boolean;     // whether persona hit the tier cap
}

interface MissTolerance {
  id: string;
  name: string;
  color: string;
  tiersLost: number;       // tiers lost from missing one week mid-season
  costToRecover: number;   // dollar cost to buy back those tiers
  stillCompletes: boolean; // would they still finish after missing a week?
  surplusTiers: number;    // tiers of headroom beyond the goal (uncapped)
}

export const NarrativeSummary = () => {
  const results = useSimulation();
  const { config } = useSeasonStore();
  const setHoveredPersonaId = useUIStore((s) => s.setHoveredPersonaId);
  const [expanded, setExpanded] = useState(false);

  const summary = useMemo(() => {
    if (results.length === 0) return null;

    const finalTiers = results.map(r => {
      const lastDay = r.data[r.data.length - 1];
      return lastDay?.tier || 0;
    });

    const completions = finalTiers.map(t => Math.min(100, Math.floor((t / config.totalTiers) * 100)));
    const completedCount = completions.filter(c => c >= 100).length;
    const avgCompletion = Math.round(completions.reduce((a, b) => a + b, 0) / completions.length);

    const tiersShort = finalTiers.map(t => Math.max(0, config.totalTiers - t));
    const avgCost = (tiersShort.reduce((a, b) => a + b, 0) / tiersShort.length) * config.costPerTier;

    const completionPhrase = completedCount === results.length
      ? 'All personas complete the pass'
      : completedCount === 0
        ? 'No persona completes the pass'
        : `${completedCount} of ${results.length} personas complete`;

    const pressurePhrase = avgCost < 10
      ? 'low pressure'
      : avgCost < 50
        ? 'moderate pressure'
        : 'high pressure';

    // --- Pace milestones ---
    const paceMilestones: PaceMilestone[] = results.map(r => {
      const t25 = config.totalTiers * 0.25;
      const t50 = config.totalTiers * 0.50;
      const t75 = config.totalTiers * 0.75;

      const findDay = (threshold: number) => {
        const idx = r.data.findIndex(d => d.tier >= threshold);
        return idx >= 0 ? idx + 1 : null;
      };

      return {
        id: r.persona.id,
        name: r.persona.name,
        color: r.persona.color,
        day25: findDay(t25),
        day50: findDay(t50),
        day75: findDay(t75),
      };
    });

    // --- Pace shift: compare first-half vs second-half tier gain rate ---
    // Only measures up to the point a persona hits the tier cap to avoid
    // false "slowdown" when a persona has simply completed the pass.
    const paceShifts: PaceShift[] = results.map(r => {
      const data = r.data;
      const startIdx = r.persona.startDay;

      // Find the last day progression actually occurs (before hitting cap)
      let effectiveEnd = data.length - 1;
      const finalTier = data[effectiveEnd]?.tier || 0;
      if (finalTier >= config.totalTiers) {
        const capIdx = data.findIndex(d => d.tier >= config.totalTiers);
        if (capIdx >= 0) effectiveEnd = capIdx;
      }

      const activeDays = effectiveEnd - startIdx;
      if (activeDays <= 0) {
        return { id: r.persona.id, name: r.persona.name, color: r.persona.color, firstHalfRate: 0, secondHalfRate: 0, slowdown: 0, completed: finalTier >= config.totalTiers };
      }

      const midpoint = startIdx + Math.floor(activeDays / 2);

      const firstHalfTiers = (data[midpoint]?.tier || 0) - (data[startIdx]?.tier || 0);
      const secondHalfTiers = (data[effectiveEnd]?.tier || 0) - (data[midpoint]?.tier || 0);

      const firstHalfWeeks = (midpoint - startIdx) / 7;
      const secondHalfWeeks = (effectiveEnd - midpoint) / 7;

      const firstHalfRate = firstHalfWeeks > 0 ? firstHalfTiers / firstHalfWeeks : 0;
      const secondHalfRate = secondHalfWeeks > 0 ? secondHalfTiers / secondHalfWeeks : 0;

      const slowdown = firstHalfRate > 0
        ? Math.round(((firstHalfRate - secondHalfRate) / firstHalfRate) * 100)
        : 0;

      return { id: r.persona.id, name: r.persona.name, color: r.persona.color, firstHalfRate, secondHalfRate, slowdown, completed: finalTier >= config.totalTiers };
    });

    // --- Miss tolerance: how many tiers does missing one week mid-season cost? ---
    // Samples a week before the persona hits the tier cap so that completed
    // personas still show a meaningful "what if you missed a week" value.
    const missTolerances: MissTolerance[] = results.map(r => {
      const data = r.data;
      const activeStart = r.persona.startDay;

      // Find where progression is still happening (before cap)
      let sampleEnd = data.length - 1;
      const finalTier = data[sampleEnd]?.tier || 0;
      if (finalTier >= config.totalTiers) {
        const capIdx = data.findIndex(d => d.tier >= config.totalTiers);
        if (capIdx >= 0) sampleEnd = capIdx;
      }

      // Sample a week from 40% through the active (uncapped) progression
      const activeDays = sampleEnd - activeStart;
      const midPoint = activeStart + Math.floor(Math.max(activeDays, 7) * 0.4);
      const weekEnd = Math.min(midPoint + 7, data.length - 1);

      const tiersInWeek = (data[weekEnd]?.tier || 0) - (data[midPoint]?.tier || 0);
      const tiersLost = Math.round(tiersInWeek * 10) / 10;

      // Calculate uncapped surplus: how many tiers of headroom beyond the goal
      const finalXp = data[data.length - 1]?.totalXp || 0;
      const uncappedTiers = Math.floor(finalXp / config.xpPerTier);
      const surplusTiers = Math.max(0, uncappedTiers - config.totalTiers);
      const stillCompletes = surplusTiers >= tiersLost;

      return {
        id: r.persona.id,
        name: r.persona.name,
        color: r.persona.color,
        tiersLost,
        costToRecover: stillCompletes ? 0 : tiersLost * config.costPerTier,
        stillCompletes,
        surplusTiers,
      };
    });

    return { completionPhrase, avgCompletion, avgCost, pressurePhrase, paceMilestones, paceShifts, missTolerances };
  }, [results, config]);

  if (!summary) return null;

  return (
    <div className="mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 bg-sage-50 border border-sage-200 rounded-lg text-left hover:bg-sage-100 transition-colors group"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm text-sage-600 leading-relaxed">
            <span className="font-semibold text-sage-900">{summary.completionPhrase}</span>
            {' '}&mdash; avg completion{' '}
            <span className="font-mono text-sage-600">{summary.avgCompletion}%</span>
            {' '}&mdash;{' '}
            <span className="font-mono text-sage-600">${summary.avgCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            {' '}avg spend to finish
            {summary.avgCost > 0 && (
              <span className="text-sage-400"> ({summary.pressurePhrase})</span>
            )}
          </p>
          <ChevronDown
            size={16}
            className={`text-sage-400 group-hover:text-sage-600 transition-transform flex-shrink-0 ml-3 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {expanded && (
        <div className="mt-2 px-4 py-4 bg-white border border-sage-200 rounded-lg space-y-5">

          {/* Pace Milestones */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-sage-400 mb-2">Pace Milestones</h4>
            <div className="space-y-1.5">
              {summary.paceMilestones.map(p => (
                <div key={p.id} className="flex items-center gap-2 text-sm" onMouseEnter={() => setHoveredPersonaId(p.id)} onMouseLeave={() => setHoveredPersonaId(null)}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-sage-700 font-medium min-w-[100px]">{p.name}</span>
                  <span className="text-sage-500">
                    reaches 50% by{' '}
                    <span className="font-mono text-sage-700">
                      {p.day50 ? `Day ${p.day50}` : 'never'}
                    </span>
                    {p.day75 && (
                      <>, 75% by <span className="font-mono text-sage-700">Day {p.day75}</span></>
                    )}
                    {!p.day25 && (
                      <span className="text-rose-400"> — doesn't reach 25%</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-sage-400 mt-2 leading-relaxed">
              {(() => {
                const sorted = summary.paceMilestones.filter(p => p.day50).sort((a, b) => a.day50! - b.day50!);
                if (sorted.length < 2) return null;
                const fastest = sorted[0];
                const slowest = sorted[sorted.length - 1];
                const gap = slowest.day50! - fastest.day50!;
                if (gap === 0) return 'All personas reach the midpoint at roughly the same time.';
                return `${fastest.name} hits the midpoint ${gap} days before ${slowest.name} — a ${gap > 20 ? 'wide' : 'moderate'} spread across player types.`;
              })()}
            </p>
          </div>

          {/* Pace Shift */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-sage-400 mb-1">Pace Shift</h4>
            <p className="text-xs text-sage-400 mb-2">How tier earn rate changes between the first and second half of the season.</p>
            <div className="space-y-1.5">
              {summary.paceShifts.map(p => (
                <div key={p.id} className="flex items-center gap-2 text-sm" onMouseEnter={() => setHoveredPersonaId(p.id)} onMouseLeave={() => setHoveredPersonaId(null)}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-sage-700 font-medium min-w-[100px]">{p.name}</span>
                  {p.completed && p.firstHalfRate === 0 && p.secondHalfRate === 0 ? (
                    <span className="text-emerald-500 font-medium">Completed immediately</span>
                  ) : (
                    <span className="text-sage-500">
                      <span className="font-mono text-sage-700">{p.firstHalfRate.toFixed(1)}</span>
                      {' '}&rarr;{' '}
                      <span className="font-mono text-sage-700">{p.secondHalfRate.toFixed(1)}</span>
                      {' '}tiers/week
                      {p.completed ? (
                        <span className="text-emerald-500 ml-1">(completed)</span>
                      ) : p.slowdown > 5 ? (
                        <span className={`font-mono ml-1 ${p.slowdown > 25 ? 'text-rose-500' : 'text-amber-600'}`}>
                          ({p.slowdown}% slower)
                        </span>
                      ) : p.slowdown < -5 ? (
                        <span className="font-mono text-emerald-500 ml-1">
                          ({Math.abs(p.slowdown)}% faster)
                        </span>
                      ) : (
                        <span className="text-sage-400 ml-1">(steady)</span>
                      )}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-sage-400 mt-2 leading-relaxed">
              {(() => {
                const uncapped = summary.paceShifts.filter(p => !p.completed);
                if (uncapped.length === 0) return 'All personas complete the pass — pace shift is not applicable.';
                const significantSlowdowns = uncapped.filter(p => p.slowdown > 25);
                if (significantSlowdowns.length > 0) {
                  const names = significantSlowdowns.map(p => p.name).join(', ');
                  return `${names} ${significantSlowdowns.length === 1 ? 'earns' : 'earn'} tiers significantly faster in the first half. Late joiners would experience a slower grind than day-one players did.`;
                }
                const anySlowdown = uncapped.some(p => p.slowdown > 5);
                if (anySlowdown) {
                  return 'The second half is noticeably slower than the first as one-time XP sources are consumed.';
                }
                return 'Tier earn rate is consistent from start to finish across non-completing personas.';
              })()}
            </p>
          </div>

          {/* Miss Tolerance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-sage-400 mb-1">Miss Tolerance</h4>
            <p className="text-xs text-sage-400 mb-2">Impact of missing one full week of play mid-season.</p>
            <div className="space-y-1.5">
              {summary.missTolerances.map(m => (
                <div key={m.id} className="flex items-center gap-2 text-sm" onMouseEnter={() => setHoveredPersonaId(m.id)} onMouseLeave={() => setHoveredPersonaId(null)}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                  <span className="text-sage-700 font-medium min-w-[100px]">{m.name}</span>
                  <span className="text-sage-500">
                    loses{' '}
                    <span className={`font-mono ${m.tiersLost > 8 ? 'text-rose-500' : m.tiersLost > 4 ? 'text-amber-600' : 'text-sage-700'}`}>
                      {m.tiersLost} tiers
                    </span>
                    {m.stillCompletes ? (
                      <span className="text-emerald-500 ml-1">— still completes</span>
                    ) : m.costToRecover > 0 ? (
                      <span className="text-sage-500 ml-1">
                        — <span className="font-mono text-sage-600">${m.costToRecover.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> to buy back
                      </span>
                    ) : null}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-sage-400 mt-2 leading-relaxed">
              {(() => {
                const recoverable = summary.missTolerances.filter(m => m.stillCompletes).length;
                const total = summary.missTolerances.length;
                if (recoverable === total) return 'All personas can absorb a missed week and still complete the pass.';
                if (recoverable === 0) return 'No persona can afford to miss a week and still complete — the economy has no margin for breaks.';
                return `${recoverable} of ${total} personas can miss a week and still finish. The rest would need to purchase tiers to recover.`;
              })()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
