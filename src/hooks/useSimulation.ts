import { useMemo } from 'react';
import { useSeasonStore } from '@/store/useSeasonStore';
import { simulateSeason, getXpBreakdown } from '@/engine/calculator';

export const useSimulation = () => {
    const { config, personas } = useSeasonStore();

    const results = useMemo(() => {
        return personas.map(persona => {
            const simulationData = simulateSeason(persona, config);

            return {
                persona,
                data: simulationData.map((dayData) => ({
                    day: dayData.day,
                    tier: dayData.tier,
                    totalXp: dayData.totalXp
                })),
                xpBreakdown: getXpBreakdown(persona, config),
            };
        });
    }, [config, personas]);

    return results;
};