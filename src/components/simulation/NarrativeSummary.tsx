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
}

interface ChallengeDep {
  id: string;
  name: string;
  color: string;
  challengeDayAvgGain: number;
  normalDayAvgGain: number;
  ratio: number; // how many x more XP on challenge days
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
    const paceShifts: PaceShift[] = results.map(r => {
      const data = r.data;
      const startIdx = r.persona.startDay;
      const activeDays = data.length - startIdx;
      const midpoint = startIdx + Math.floor(activeDays / 2);

      const firstHalfTiers = (data[midpoint]?.tier || 0) - (data[startIdx]?.tier || 0);
      const secondHalfTiers = (data[data.length - 1]?.tier || 0) - (data[midpoint]?.tier || 0);

      const firstHalfWeeks = (midpoint - startIdx) / 7;
      const secondHalfWeeks = (data.length - 1 - midpoint) / 7;

      const firstHalfRate = firstHalfWeeks > 0 ? firstHalfTiers / firstHalfWeeks : 0;
      const secondHalfRate = secondHalfWeeks > 0 ? secondHalfTiers / secondHalfWeeks : 0;

      const slowdown = firstHalfRate > 0
        ? Math.round(((firstHalfRate - secondHalfRate) / firstHalfRate) * 100)
        : 0;

      return { id: r.persona.id, name: r.persona.name, color: r.persona.color, firstHalfRate, secondHalfRate, slowdown };
    });

    // --- Challenge dependency: compare XP gains on potential challenge days vs normal play days ---
    const challengeDeps: ChallengeDep[] = results.map(r => {
      const data = r.data;
      const challengeDayGains: number[] = [];
      const normalDayGains: number[] = [];

      for (let i = 1; i < data.length; i++) {
        if (i < r.persona.startDay) continue;
        const gain = data[i].totalXp - data[i - 1].totalXp;
        if (gain === 0) continue;

        const dayInWeek = i % 7;
        const isPlayDay = dayInWeek < r.persona.sessionsPerWeek;
        if (!isPlayDay) continue;

        // Challenge days: first play day of the week for non-stackable,
        // or any day with outsized gains for stackable
        if (dayInWeek === 0) {
          challengeDayGains.push(gain);
        } else {
          normalDayGains.push(gain);
        }
      }

      const challengeAvg = challengeDayGains.length > 0
        ? challengeDayGains.reduce((a, b) => a + b, 0) / challengeDayGains.length
        : 0;
      const normalAvg = normalDayGains.length > 0
        ? normalDayGains.reduce((a, b) => a + b, 0) / normalDayGains.length
        : 0;

      return {
        id: r.persona.id,
        name: r.persona.name,
        color: r.persona.color,
        challengeDayAvgGain: challengeAvg,
        normalDayAvgGain: normalAvg,
        ratio: normalAvg > 0 ? challengeAvg / normalAvg : 0,
      };
    });

    return { completionPhrase, avgCompletion, avgCost, pressurePhrase, paceMilestones, paceShifts, challengeDeps };
  }, [results, config]);

  if (!summary) return null;

  const avgRatio = summary.challengeDeps.length > 0
    ? summary.challengeDeps.reduce((a, b) => a + b.ratio, 0) / summary.challengeDeps.length
    : 0;

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
                if (gap === 0) return 'All personas reach the midpoint at roughly the same time — a well-balanced economy.';
                return `${fastest.name} hits the midpoint ${gap} days before ${slowest.name}.`;
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
                  <span className="text-sage-500">
                    <span className="font-mono text-sage-700">{p.firstHalfRate.toFixed(1)}</span>
                    {' '}&rarr;{' '}
                    <span className="font-mono text-sage-700">{p.secondHalfRate.toFixed(1)}</span>
                    {' '}tiers/week
                    {p.slowdown > 5 ? (
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
                </div>
              ))}
            </div>
            <p className="text-xs text-sage-400 mt-2 leading-relaxed">
              {(() => {
                const significantSlowdowns = summary.paceShifts.filter(p => p.slowdown > 25);
                if (significantSlowdowns.length > 0) {
                  return 'A sharp second-half slowdown signals that early XP sources (challenge backlogs, milestone bursts) are front-loaded. Players who join late or miss early weeks will feel this acutely.';
                }
                const anySlowdown = summary.paceShifts.some(p => p.slowdown > 5);
                if (anySlowdown) {
                  return 'Moderate pace shift — the second half is noticeably slower as early XP bonuses taper off. Consider whether this creates the right urgency or frustration.';
                }
                return 'Progression is evenly paced across the season — players earn tiers at a consistent rate from start to finish.';
              })()}
            </p>
          </div>

          {/* Challenge Dependency */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-sage-400 mb-2">Challenge Dependency</h4>
            <div className="space-y-1.5">
              {summary.challengeDeps.map(c => (
                <div key={c.id} className="flex items-center gap-2 text-sm" onMouseEnter={() => setHoveredPersonaId(c.id)} onMouseLeave={() => setHoveredPersonaId(null)}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-sage-700 font-medium min-w-[100px]">{c.name}</span>
                  <span className="text-sage-500">
                    earns{' '}
                    <span className={`font-mono ${c.ratio > 2 ? 'text-amber-600' : 'text-sage-700'}`}>
                      {c.ratio.toFixed(1)}x
                    </span>
                    {' '}more XP on weekly reset days vs regular play
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-sage-400 mt-2 leading-relaxed">
              {avgRatio > 2.5
                ? 'Challenges are carrying the economy heavily. Missing a week has outsized consequences — players who fall behind may feel the system is punishing.'
                : avgRatio > 1.5
                  ? 'Challenges provide a meaningful boost but passive play still contributes. A balanced economy that rewards both consistency and engagement.'
                  : 'Passive play dominates progression. Challenges feel optional — consider increasing challenge XP if you want to drive engagement loops.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
