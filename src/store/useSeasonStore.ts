import { create } from 'zustand';
import type { SeasonConfig, Persona } from '@/engine/types';

interface SeasonState {
  config: SeasonConfig;
  personas: Persona[];
  updateConfig: (updates: Partial<SeasonConfig>) => void;
}

export const useSeasonStore = create<SeasonState>((set) => ({
  // Professional defaults based on industry standards
  config: {
    totalDays: 70,
    totalTiers: 100,
    xpPerTier: 80000,
    xpPerMinute: 120,
    dailyQuestXp: 25000,
    weeklyChallengeXp: 120000,
    isWeeklyStackable: true, // Key for Late Joiner Catch-up
  },
  personas: [
    {
      id: '1',
      name: 'The Average Joe',
      sessionsPerWeek: 4,
      minutesPerSession: 60,
      startDay: 0,
    },
    {
      id: '2',
      name: 'The Late Joiner',
      sessionsPerWeek: 7,
      minutesPerSession: 120,
      startDay: 35, // Joins halfway through
    },
  ],
  updateConfig: (updates) =>
    set((state) => ({
      config: { ...state.config, ...updates },
    })),
}));