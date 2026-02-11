export interface Persona {
  id: string;
  name: string;
  sessionsPerWeek: number;
  minutesPerSession: number;
  startDay: number; // 0 for Day 1, 30 for a Late Joiner
}

export interface SeasonConfig {
  totalDays: number;
  totalTiers: number;
  xpPerTier: number;
  xpPerMinute: number;
  dailyQuestXp: number;
  weeklyChallengeXp: number;
  isWeeklyStackable: boolean; // The "Catch-up" lever
}

export interface SimulationResult {
  day: number;
  tier: number;
  totalXp: number;
}