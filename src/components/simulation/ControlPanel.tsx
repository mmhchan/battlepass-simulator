import { useSeasonStore } from '@/store/useSeasonStore';
import { Card } from '@/components/ui/Card';
import { Slider } from '@/components/ui/Slider';

export const ControlPanel = () => {
  const { config, updateConfig } = useSeasonStore();

  return (
    <Card 
      title="Season Blueprint" 
      subtitle="Adjust the levers to see how they impact player retention."
    >
      <div className="space-y-2">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Core Economy</h4>
        <Slider 
          label="Days in Season" 
          value={config.totalDays} 
          min={14} max={120} 
          onChange={(v) => updateConfig({ totalDays: v })} 
          suffix=" Days"
        />
        <Slider 
          label="XP Per Tier" 
          value={config.xpPerTier} 
          min={10000} max={200000} step={1000}
          onChange={(v) => updateConfig({ xpPerTier: v })} 
        />

        <div className="my-8 border-t border-slate-700/50" />

        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Engagement Levers</h4>
        <Slider 
          label="Weekly Challenge XP" 
          value={config.weeklyChallengeXp} 
          min={50000} max={500000} step={5000}
          onChange={(v) => updateConfig({ weeklyChallengeXp: v })} 
        />

        {/* This toggle represents the core catch-up mechanic for late-joiners */}
        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700 mt-6">
          <div className="pr-4">
            <p className="text-sm font-semibold text-slate-200">Stackable Challenges</p>
            <p className="text-xs text-slate-500 mt-1">
              Late joiners can earn all previous weeks' XP.
            </p>
          </div>
          <button 
            onClick={() => updateConfig({ isWeeklyStackable: !config.isWeeklyStackable })}
            className={`w-12 h-6 rounded-full transition-colors relative ${config.isWeeklyStackable ? 'bg-indigo-600' : 'bg-slate-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.isWeeklyStackable ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>
    </Card>
  );
};