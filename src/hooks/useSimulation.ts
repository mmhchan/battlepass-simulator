import { useMemo } from 'react';
import { useSeasonStore } from '@/store/useSeasonStore';
import { simulateSeason } from '@/engine/calculator';

export const useSimulation = () => {
  const { config, personas } = useSeasonStore();

  // We use useMemo so we don't lag the UI with heavy math on every click
  const results = useMemo(() => {
    return personas.map(persona => {
      // We run the simulation 10 times and average it for a smoother line
      const iterations = 10;
      const multipleRuns = Array.from({ length: iterations }).map(() => 
        simulateSeason(persona, config)
      );

      // Average the tiers across runs for a "Expected Value" path
      return {
        persona,
        data: multipleRuns[0].map((_, dayIndex) => {
          const avgTier = multipleRuns.reduce((acc, run) => acc + run[dayIndex].tier, 0) / iterations;
          return { day: dayIndex, tier: avgTier };
        })
      };
    });
  }, [config, personas]);

  return results;
};