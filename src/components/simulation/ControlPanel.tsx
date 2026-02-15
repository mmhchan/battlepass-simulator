import { useState, useRef } from 'react';
import { Info, Download, Upload } from 'lucide-react';
import { useSeasonStore } from '@/store/useSeasonStore';
import { Card } from '@/components/ui/Card';
import { Slider } from '@/components/ui/Slider';
import { Tooltip } from '@/components/ui/Tooltip';
import { SEASON_PRESETS, SLIDER_TOOLTIPS } from '@/config/constants';
import type { SeasonConfig, Persona, SimulationSnapshot } from '@/engine/types';

export const ControlPanel = () => {
    const { config, personas, updateConfig, resetToDefaults, loadPreset, importSnapshot } = useSeasonStore();
    const [showResetModal, setShowResetModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const REQUIRED_CONFIG_KEYS: (keyof SeasonConfig)[] = [
        'totalDays', 'totalTiers', 'xpPerTier', 'xpPerMinute', 'dailyQuestXp',
        'weeklyChallengeXp', 'isWeeklyStackable', 'milestoneXp', 'challengeClearMins', 'costPerTier',
    ];

    const REQUIRED_PERSONA_KEYS: (keyof Omit<Persona, 'id'>)[] = [
        'name', 'color', 'sessionsPerWeek', 'minutesPerSession', 'startDay',
    ];

    const handleExport = () => {
        const snapshot: SimulationSnapshot = {
            version: 1,
            config,
            personas: personas.map(({ id, ...rest }) => rest),
        };
        const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `battlepass-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target?.result as string);

                if (!data.config || typeof data.config !== 'object') {
                    throw new Error('Missing or invalid "config" object.');
                }
                for (const key of REQUIRED_CONFIG_KEYS) {
                    if (!(key in data.config)) {
                        throw new Error(`Config is missing required field "${key}".`);
                    }
                }

                if (!Array.isArray(data.personas) || data.personas.length === 0) {
                    throw new Error('Missing or empty "personas" array.');
                }
                for (const p of data.personas) {
                    for (const key of REQUIRED_PERSONA_KEYS) {
                        if (!(key in p)) {
                            throw new Error(`A persona is missing required field "${key}".`);
                        }
                    }
                }

                importSnapshot(data.config, data.personas);
            } catch (err) {
                alert(`Failed to import snapshot: ${err instanceof Error ? err.message : 'Invalid file.'}`);
            }
        };
        reader.readAsText(file);

        // Reset so the same file can be re-selected
        e.target.value = '';
    };

    return (
        <>
            <Card
                title="Season Blueprint"
                subtitle="Adjust the levers to see how they impact player retention."
            >
                <div className="space-y-2">
                    {/* Preset selector */}
                    <div className="mb-6">
                        <label className="text-xs font-bold uppercase tracking-widest text-sage-400 mb-2 block">
                            Quick Presets
                        </label>
                        <select
                            onChange={(e) => {
                                if (e.target.value) loadPreset(e.target.value);
                                e.target.value = '';
                            }}
                            defaultValue=""
                            className="w-full bg-sage-50 border border-sage-200 text-sage-800 text-sm rounded-lg px-3 py-2 focus:border-sage-600 focus:outline-none cursor-pointer"
                        >
                            <option value="" disabled>Load a preset...</option>
                            {Object.entries(SEASON_PRESETS).map(([key, preset]) => (
                                <option key={key} value={key}>{preset.label} — {preset.description}</option>
                            ))}
                        </select>
                    </div>

                    <div className="border-t border-sage-200 mb-6" />

                    <h4 className="text-xs font-bold uppercase tracking-widest text-sage-400 mb-4">Core Economy</h4>
                    <Slider
                        label="Days in Season"
                        value={config.totalDays}
                        min={14} max={120}
                        onChange={(v) => updateConfig({ totalDays: v })}
                        suffix=" Days"
                        tooltip={SLIDER_TOOLTIPS.totalDays}
                    />
                    <Slider
                        label="Total Tiers"
                        value={config.totalTiers}
                        min={10} max={200} step={10}
                        onChange={(v) => updateConfig({ totalTiers: v })}
                        tooltip={SLIDER_TOOLTIPS.totalTiers}
                    />
                    <Slider
                        label="XP Per Tier"
                        value={config.xpPerTier}
                        min={10000} max={200000} step={1000}
                        onChange={(v) => updateConfig({ xpPerTier: v })}
                        tooltip={SLIDER_TOOLTIPS.xpPerTier}
                    />
                    <Slider
                        label="XP Per Minute"
                        value={config.xpPerMinute}
                        min={50} max={1000} step={50}
                        onChange={(v) => updateConfig({ xpPerMinute: v })}
                        tooltip={SLIDER_TOOLTIPS.xpPerMinute}
                    />
                    <Slider
                        label="Daily Quest XP"
                        value={config.dailyQuestXp}
                        min={5000} max={100000} step={5000}
                        onChange={(v) => updateConfig({ dailyQuestXp: v })}
                        tooltip={SLIDER_TOOLTIPS.dailyQuestXp}
                    />
                    <Slider
                        label="Cost per Tier"
                        value={config.costPerTier}
                        min={0.5} max={5} step={0.25}
                        prefix="$"
                        onChange={(v) => updateConfig({ costPerTier: v })}
                        tooltip={SLIDER_TOOLTIPS.costPerTier}
                    />

                    <div className="my-8 border-t border-sage-200" />

                    <h4 className="text-xs font-bold uppercase tracking-widest text-sage-400 mb-4">Engagement Levers</h4>
                    <Slider
                        label="Weekly Challenge XP"
                        value={config.weeklyChallengeXp}
                        min={50000} max={500000} step={5000}
                        onChange={(v) => updateConfig({ weeklyChallengeXp: v })}
                        tooltip={SLIDER_TOOLTIPS.weeklyChallengeXp}
                    />
                    <Slider
                        label="Milestone Quest XP"
                        value={config.milestoneXp}
                        min={0} max={5000000} step={50000}
                        onChange={(v) => updateConfig({ milestoneXp: v })}
                        tooltip={SLIDER_TOOLTIPS.milestoneXp}
                    />
                    <Slider
                        label="Mins to Clear Challenges"
                        value={config.challengeClearMins}
                        min={30} max={480} step={30}
                        suffix="m"
                        onChange={(v) => updateConfig({ challengeClearMins: v })}
                        tooltip={SLIDER_TOOLTIPS.challengeClearMins}
                    />

                    <div className="flex items-center justify-between p-4 bg-sage-50 rounded-lg border border-sage-200 mt-6">
                        <div className="pr-4">
                            <p className="text-sm font-semibold text-sage-900 inline-flex items-center gap-1">
                                Stackable Challenges
                                <Tooltip content={SLIDER_TOOLTIPS.isWeeklyStackable}>
                                    <Info size={12} className="text-sage-300 hover:text-sage-500 cursor-help transition-colors" />
                                </Tooltip>
                            </p>
                            <p className="text-xs text-sage-400 mt-1">
                                Late joiners can earn all previous weeks' XP.
                            </p>
                        </div>
                        <button
                            onClick={() => updateConfig({ isWeeklyStackable: !config.isWeeklyStackable })}
                            className={`w-12 h-6 rounded-full transition-colors relative ${config.isWeeklyStackable ? 'bg-sage-600' : 'bg-sage-300'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.isWeeklyStackable ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                </div>
                <div className="flex gap-2 mt-8">
                    <button
                        onClick={handleExport}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-sage-500 hover:text-sage-700 border border-sage-200 hover:border-sage-300 rounded-lg transition-all"
                    >
                        <Download size={14} />
                        Save
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-sage-500 hover:text-sage-700 border border-sage-200 hover:border-sage-300 rounded-lg transition-all"
                    >
                        <Upload size={14} />
                        Load
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                    />
                </div>
                <button
                    onClick={() => setShowResetModal(true)}
                    className="w-full mt-2 py-2 text-sm font-bold text-sage-400 hover:text-rose-500 border border-sage-200 hover:border-rose-200 rounded-lg transition-all"
                >
                    Reset to Defaults
                </button>
            </Card>

            {showResetModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={() => setShowResetModal(false)}
                    />
                    <div className="relative bg-white border border-sage-200 rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4">
                        <h3 className="text-lg font-bold text-sage-900 mb-2">Reset Everything?</h3>
                        <p className="text-sm text-sage-500 mb-6">
                            This will delete all custom personas and restore default settings. This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowResetModal(false)}
                                className="flex-1 py-2 text-sm font-semibold text-sage-600 bg-sage-100 hover:bg-sage-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    resetToDefaults();
                                    setShowResetModal(false);
                                }}
                                className="flex-1 py-2 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
