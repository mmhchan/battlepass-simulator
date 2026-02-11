import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, ReferenceLine 
} from 'recharts';
import { useSimulation } from '@/hooks/useSimulation';
import { useSeasonStore } from '@/store/useSeasonStore';

export const ProgressionChart = () => {
  const results = useSimulation();
  const { config } = useSeasonStore();

  // We need to format the data so Recharts can read it.
  // It wants an array of objects like: { day: 0, "Average Joe": 1, "Late Joiner": 0 }
  const chartData = Array.from({ length: config.totalDays }).map((_, dayIndex) => {
    const dataPoint: any = { day: dayIndex + 1 };
    results.forEach((r) => {
      dataPoint[r.persona.name] = r.data[dayIndex]?.tier || 0;
    });
    return dataPoint;
  });

  const colors = ['#818cf8', '#fbbf24', '#34d399', '#f87171'];

  return (
    <div className="h-[500px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="day" 
            stroke="#64748b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            label={{ value: 'Days in Season', position: 'insideBottom', offset: -5, fill: '#64748b' }}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            domain={[0, config.totalTiers]}
            label={{ value: 'Tiers', angle: -90, position: 'insideLeft', fill: '#64748b' }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend />
          
          {/* Completion Line: This is the goal! */}
          <ReferenceLine y={config.totalTiers} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Goal', fill: '#ef4444', fontSize: 10 }} />

          {results.map((r, i) => (
            <Line
              key={r.persona.id}
              type="monotone"
              dataKey={r.persona.name}
              stroke={colors[i % colors.length]}
              strokeWidth={3}
              dot={false}
              animationDuration={300}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};