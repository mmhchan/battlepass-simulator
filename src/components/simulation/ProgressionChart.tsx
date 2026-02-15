import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { useSimulation } from '@/hooks/useSimulation';
import { useSeasonStore, useUIStore } from '@/store/useSeasonStore';

export const ProgressionChart = () => {
  const results = useSimulation();
  const { config } = useSeasonStore();
  const hoveredPersonaId = useUIStore((s) => s.hoveredPersonaId);

  const chartData = useMemo(() => {
    return Array.from({ length: config.totalDays }).map((_, dayIndex) => {
      const dayNumber = dayIndex + 1;
      const dataPoint: any = { day: dayNumber };

      results.forEach((r) => {
        dataPoint[r.persona.name] = r.data[dayIndex]?.tier || 0;
      });

      return dataPoint;
    });
  }, [results, config.totalDays]);

  const xTicks = useMemo(() => {
    const interval = config.totalDays <= 30 ? 7 : 14;
    const ticks: number[] = [1];
    for (let d = interval; d < config.totalDays; d += interval) {
      ticks.push(d);
    }
    // Drop the last regular tick if it's too close to the final day
    if (ticks.length > 1 && config.totalDays - ticks[ticks.length - 1] < interval * 0.4) {
      ticks.pop();
    }
    ticks.push(config.totalDays);
    return ticks;
  }, [config.totalDays]);

  return (
    <div className="flex-1 min-h-[350px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
          <defs>
            <linearGradient id="goalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#dce3de" vertical={false} />
          <XAxis
            dataKey="day"
            stroke="#8a9a8d"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            ticks={xTicks}
            label={{ value: 'Days in Season', position: 'insideBottom', offset: -20, fill: '#8a9a8d' }}
          />
          <YAxis
            stroke="#8a9a8d"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, config.totalTiers]}
            label={{ value: 'Tiers', angle: -90, position: 'insideLeft', fill: '#8a9a8d' }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const sorted = [...payload].sort((a, b) => Number(b.value) - Number(a.value));
              return (
                <div className="bg-white border border-sage-200 rounded-lg shadow-lg px-3 py-2">
                  <p className="text-xs text-sage-400 mb-1.5">Day {label}</p>
                  {sorted.map((entry) => (
                    <div key={entry.dataKey} className="flex items-center gap-2 py-0.5">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                      <span className="text-[13px] text-sage-900">{entry.name}</span>
                      <span className="text-[13px] font-mono text-sage-500 ml-auto pl-3">Tier {Math.floor(Number(entry.value)).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
          <Legend
            content={() => {
              const setHovered = useUIStore.getState().setHoveredPersonaId;
              return (
              <div className="flex justify-center gap-6 pt-8">
                {results.map((r) => {
                  const isHovered = hoveredPersonaId === r.persona.id;
                  const isDimmed = hoveredPersonaId !== null && !isHovered;
                  return (
                  <div
                    key={r.persona.id}
                    className="flex items-center gap-2 cursor-pointer"
                    onMouseEnter={() => setHovered(r.persona.id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <div className="w-3 h-[3px] rounded-full transition-opacity" style={{ backgroundColor: r.persona.color, opacity: isDimmed ? 0.2 : 1 }} />
                    <span className={`text-sm transition-colors ${isDimmed ? 'text-sage-300' : 'text-sage-500'}`}>{r.persona.name}</span>
                  </div>
                  );
                })}
              </div>
              );
            }}
          />

          <ReferenceLine
            y={config.totalTiers}
            stroke="#10b981"
            strokeDasharray="5 5"
            label={{ value: 'Goal', fill: '#10b981', fontSize: 12, fontWeight: 600, position: 'top' }}
          />

          <ReferenceArea
            y1={config.totalTiers * 0.9}
            y2={config.totalTiers}
            fill="url(#goalGradient)"
            fillOpacity={1}
          />

          {results.map((r) => {
            const isHovered = hoveredPersonaId === r.persona.id;
            const isDimmed = hoveredPersonaId !== null && !isHovered;
            return (
              <Line
                key={r.persona.id}
                type="monotone"
                dataKey={r.persona.name}
                stroke={r.persona.color}
                strokeWidth={isHovered ? 4 : 3}
                strokeOpacity={isDimmed ? 0.15 : 1}
                dot={false}
                activeDot={{
                  r: 6,
                  stroke: '#ffffff',
                  strokeWidth: 2,
                  fill: r.persona.color
                }}
                animationDuration={300}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
