export interface Persona {
    id: string;
    name: string;
    color: string;
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
    milestoneXp: number; // Total one-time XP from seasonal/milestone quests
    challengeClearMins: number; // Minutes of play needed to clear one week of challenges
    costPerTier: number; // Dollar cost to purchase one tier
}

export interface SimulationResult {
    day: number;
    tier: number;
    totalXp: number;
}

export interface SimulationSnapshot {
    version: number;
    config: SeasonConfig;
    personas: Omit<Persona, 'id'>[];
}