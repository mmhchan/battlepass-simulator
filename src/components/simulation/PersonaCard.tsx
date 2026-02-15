import { useState, useEffect } from 'react';
import { Pencil, Check, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Slider } from '@/components/ui/Slider';
import { useSeasonStore, useUIStore } from '@/store/useSeasonStore';
import type { Persona } from '@/engine/types';

const COLOR_OPTIONS = ['#818cf8', '#fbbf24', '#34d399', '#f472b6', '#22d3ee', '#a855f7'];

interface PersonaCardProps {
    persona: Persona;
    result: { data: { tier: number; totalXp: number }[] };
}

export const PersonaCard = ({ persona, result }: PersonaCardProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [localName, setLocalName] = useState(persona.name);
    const { updatePersona, removePersona, config } = useSeasonStore();
    const setHoveredPersonaId = useUIStore((s) => s.setHoveredPersonaId);

    useEffect(() => {
        setLocalName(persona.name);
    }, [persona.id, persona.name]);

    const finalTier = Math.floor(result.data[result.data.length - 1]?.tier || 0);
    const completionRate = Math.min(100, Math.floor((finalTier / config.totalTiers) * 100));

    const activeDays = config.totalDays - persona.startDay;
    const activeWeeks = Math.ceil(activeDays / 7);
    const totalPlayDays = Math.min(activeDays, activeWeeks * persona.sessionsPerWeek);
    const totalHours = Math.round((totalPlayDays * persona.minutesPerSession) / 60);
    const hoursPerTier = finalTier > 0 ? (totalHours / finalTier).toFixed(1) : '—';
    const tiersShort = Math.max(0, config.totalTiers - finalTier);
    const estCost = tiersShort * config.costPerTier;

    useEffect(() => {
        const handler = setTimeout(() => {
            if (localName !== persona.name) {
                updatePersona(persona.id, { name: localName });
            }
        }, 300);
        return () => clearTimeout(handler);
    }, [localName, persona.id, persona.name, updatePersona]);

    return (
        <>
        <Card
            accentColor={persona.color}
            onMouseEnter={() => setHoveredPersonaId(persona.id)}
            onMouseLeave={() => setHoveredPersonaId(null)}
            title={isEditing ? (
                <input
                    type="text"
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    className="bg-transparent text-lg font-bold text-sage-900 tracking-tight border-b border-sage-300 focus:border-sage-600 outline-none w-full transition-colors"
                />
            ) : persona.name}
            action={
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="p-1.5 rounded-md text-sage-400 hover:text-sage-700 hover:bg-sage-100 transition-colors"
                    >
                        {isEditing ? <Check size={14} /> : <Pencil size={14} />}
                    </button>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="p-1.5 rounded-md text-sage-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            }
        >
            {isEditing ? (
                <div className="space-y-4">
                    <Slider
                        label="Sessions / Week"
                        value={persona.sessionsPerWeek}
                        min={1} max={7}
                        onChange={(v) => updatePersona(persona.id, { sessionsPerWeek: v })}
                    />

                    <Slider
                        label="Mins / Session"
                        value={persona.minutesPerSession}
                        min={15} max={240} step={15}
                        suffix="m"
                        onChange={(v) => updatePersona(persona.id, { minutesPerSession: v })}
                    />

                    <Slider
                        label="Start Day"
                        value={persona.startDay}
                        min={0} max={config.totalDays - 1}
                        onChange={(v) => updatePersona(persona.id, { startDay: v })}
                    />

                    <div className="mt-4 border-t border-sage-200 pt-4">
                        <p className="text-xs text-sage-400 uppercase font-bold mb-3 tracking-widest">
                            Theme Color
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {COLOR_OPTIONS.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => updatePersona(persona.id, { color: c })}
                                    className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                                        persona.color === c ? 'border-sage-900 ring-2 ring-sage-600/30' : 'border-transparent'
                                    }`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            ) : (
                <div className="space-y-4">
                    {/* Compact parameter summary */}
                    <div className="flex items-center gap-2 text-xs text-sage-500 font-mono">
                        <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: persona.color }}
                        />
                        <span>{persona.sessionsPerWeek}d/wk</span>
                        <span className="text-sage-300">&middot;</span>
                        <span>{persona.minutesPerSession}m/session</span>
                        {persona.startDay > 0 && (
                            <>
                                <span className="text-sage-300">&middot;</span>
                                <span>Day {persona.startDay}</span>
                            </>
                        )}
                    </div>

                    {/* 2x2 outcome stats */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-sage-50 px-3 py-2 rounded-lg border border-sage-100">
                            <p className="text-[10px] text-sage-400 uppercase font-bold">Final Tier</p>
                            <p className="text-lg font-bold text-sage-900">{finalTier.toLocaleString()} <span className="text-xs text-sage-400 font-normal">/ {config.totalTiers.toLocaleString()}</span></p>
                        </div>
                        <div className="bg-sage-50 px-3 py-2 rounded-lg border border-sage-100">
                            <p className="text-[10px] text-sage-400 uppercase font-bold">Completion</p>
                            <p className="text-lg font-bold text-sage-900">{completionRate}%</p>
                        </div>
                        <div className="bg-sage-50 px-3 py-2 rounded-lg border border-sage-100">
                            <p className="text-[10px] text-sage-400 uppercase font-bold">Play Time</p>
                            <p className="text-lg font-bold text-sage-900">{totalHours.toLocaleString()}<span className="text-xs text-sage-400 font-normal">h</span></p>
                        </div>
                        <div className="bg-sage-50 px-3 py-2 rounded-lg border border-sage-100">
                            <p className="text-[10px] text-sage-400 uppercase font-bold">Hrs / Tier</p>
                            <p className="text-lg font-bold text-sage-900">{hoursPerTier}</p>
                        </div>
                    </div>

                    {/* Conversion pressure */}
                    <div className={`px-3 py-2.5 rounded-lg border ${
                        completionRate >= 100 ? 'bg-emerald-50 border-emerald-200' :
                        completionRate >= 80 ? 'bg-amber-50 border-amber-200' :
                        'bg-rose-50 border-rose-200'
                    }`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-sage-400 uppercase font-bold mb-0.5">Conversion Pressure</p>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-sm font-bold text-sage-900">
                                        {tiersShort === 0 ? 'Completed' : `${tiersShort.toLocaleString()} tiers short`}
                                    </span>
                                    {tiersShort > 0 && (
                                        <span className="text-sm font-mono text-sage-500">
                                            ~${estCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wide ${
                                completionRate >= 100 ? 'text-emerald-600' :
                                completionRate >= 80 ? 'text-amber-600' :
                                'text-rose-500'
                            }`}>
                                {completionRate >= 100 ? 'None' : completionRate >= 80 ? 'Low' : completionRate >= 50 ? 'Med' : 'High'}
                            </span>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-sage-100 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="h-full transition-all duration-700 ease-out"
                            style={{
                                width: `${completionRate}%`,
                                backgroundColor: persona.color,
                            }}
                        />
                    </div>
                </div>
            )}
        </Card>

        {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                    className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                    onClick={() => setShowDeleteModal(false)}
                />
                <div className="relative bg-white border border-sage-200 rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4">
                    <h3 className="text-lg font-bold text-sage-900 mb-2">Delete Persona?</h3>
                    <p className="text-sm text-sage-500 mb-6">
                        Are you sure you want to remove <span className="text-sage-900 font-semibold">{persona.name}</span>? This cannot be undone.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="flex-1 py-2 text-sm font-semibold text-sage-600 bg-sage-100 hover:bg-sage-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => removePersona(persona.id)}
                            className="flex-1 py-2 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};
