import type { SeasonConfig, Persona } from '@/engine/types';

export const MAX_PERSONAS = 4;

export const COLOR_PALETTE = ['#818cf8', '#fbbf24', '#34d399', '#f472b6', '#22d3ee'];

export const DEFAULT_CONFIG: SeasonConfig = {
    totalDays: 85,
    totalTiers: 100,
    xpPerTier: 80000,
    xpPerMinute: 300,
    dailyQuestXp: 25000,
    weeklyChallengeXp: 120000,
    isWeeklyStackable: true,
    milestoneXp: 2_400_000,
    challengeClearMins: 180,
    costPerTier: 1.50,
};

export const PERSONA_TEMPLATES: Omit<Persona, 'id'>[] = [
    {
        name: 'The Weekend Warrior',
        color: '#818cf8',
        sessionsPerWeek: 2,
        minutesPerSession: 180,
        startDay: 0,
    },
    {
        name: 'The Daily Grinder',
        color: '#fbbf24',
        sessionsPerWeek: 7,
        minutesPerSession: 45,
        startDay: 0,
    },
    {
        name: 'The Casual Pro',
        color: '#34d399',
        sessionsPerWeek: 5,
        minutesPerSession: 120,
        startDay: 0,
    },
    {
        name: 'The Completionist',
        color: '#f472b6',
        sessionsPerWeek: 7,
        minutesPerSession: 240,
        startDay: 0,
    },
    {
        name: 'The Late Starter',
        color: '#22d3ee',
        sessionsPerWeek: 6,
        minutesPerSession: 90,
        startDay: 20, // Starts 20 days into the season
    }
];

export const DEFAULT_PERSONAS: Persona[] = [
    { id: 'initial-player', ...PERSONA_TEMPLATES[0] }
];

export const SEASON_PRESETS: Record<string, { label: string; description: string; config: SeasonConfig }> = {
    balanced: {
        label: 'Balanced Standard',
        description: 'A fair season where dedicated players complete without spending.',
        config: {
            totalDays: 85,
            totalTiers: 100,
            xpPerTier: 80000,
            xpPerMinute: 300,
            dailyQuestXp: 25000,
            weeklyChallengeXp: 120000,
            isWeeklyStackable: true,
            milestoneXp: 2_400_000,
            challengeClearMins: 180,
            costPerTier: 1.50,
        },
    },
    generousGrind: {
        label: 'Generous Grind',
        description: 'High XP rates reward playtime; most players finish early.',
        config: {
            totalDays: 90,
            totalTiers: 100,
            xpPerTier: 60000,
            xpPerMinute: 500,
            dailyQuestXp: 35000,
            weeklyChallengeXp: 200000,
            isWeeklyStackable: true,
            milestoneXp: 3_000_000,
            challengeClearMins: 120,
            costPerTier: 1.00,
        },
    },
    timeGated: {
        label: 'Time-Gated',
        description: 'Daily login matters more than session length. Consistency wins.',
        config: {
            totalDays: 70,
            totalTiers: 100,
            xpPerTier: 90000,
            xpPerMinute: 150,
            dailyQuestXp: 40000,
            weeklyChallengeXp: 80000,
            isWeeklyStackable: false,
            milestoneXp: 1_500_000,
            challengeClearMins: 60,
            costPerTier: 2.00,
        },
    },
    whaleBait: {
        label: 'Whale Bait',
        description: 'Aggressive monetization — most players fall short without spending.',
        config: {
            totalDays: 60,
            totalTiers: 100,
            xpPerTier: 120000,
            xpPerMinute: 200,
            dailyQuestXp: 15000,
            weeklyChallengeXp: 80000,
            isWeeklyStackable: false,
            milestoneXp: 1_000_000,
            challengeClearMins: 240,
            costPerTier: 3.50,
        },
    },
};

export const SLIDER_TOOLTIPS: Record<string, string> = {
    totalDays: 'How long the season runs. Shorter seasons create urgency.',
    totalTiers: 'Number of tiers in the pass. More tiers means more content but slower per-tier progress.',
    xpPerTier: 'XP needed to advance one tier. Higher values slow progression.',
    costPerTier: 'Real-money cost to buy one tier. Drives conversion pressure.',
    xpPerMinute: 'Passive XP earned per minute of playtime from match rewards.',
    dailyQuestXp: 'XP earned from daily quests each play session.',
    weeklyChallengeXp: 'Bonus XP from completing weekly challenges.',
    milestoneXp: 'Total one-time XP from seasonal milestone quests, spread across play days.',
    challengeClearMins: 'Minutes of playtime needed to complete one week of challenges.',
    isWeeklyStackable: 'When enabled, missed weekly challenges accumulate and can be cleared later.',
};