import type { Persona, SeasonConfig, SimulationResult } from './types';

export function simulateSeason(persona: Persona, config: SeasonConfig): SimulationResult[] {
  const history: SimulationResult[] = [];
  let totalXp = 0;

  for (let day = 0; day < config.totalDays; day++) {
    // 1. Check if the player has even joined yet
    if (day < persona.startDay) {
      history.push({ day, tier: 0, totalXp: 0 });
      continue;
    }

    // 2. Determine if they play today (Stochastic modeling)
    const playProbability = persona.sessionsPerWeek / 7;
    const isPlayingToday = Math.random() < playProbability;

    if (isPlayingToday) {
      // Time-based XP
      totalXp += persona.minutesPerSession * config.xpPerMinute;
      // Daily Reward
      totalXp += config.dailyQuestXp;

      // 3. Weekly Challenges (The Catch-up Logic)
      const currentWeek = Math.floor(day / 7);
      
      if (config.isWeeklyStackable) {
        // PM Logic: If you join late, you can do all 'unlocked' weeks.
        // We simulate this by checking if it's a play day and rewarding 
        // a portion of the available backlog.
        const weeksAvailable = currentWeek + 1;
        // Simple simulation: you clear 1 week's worth of challenges 
        // per play session until you are caught up.
        const weeksCleared = Math.min(weeksAvailable, 1); 
        totalXp += weeksCleared * (config.weeklyChallengeXp / (persona.sessionsPerWeek || 1));
      } else {
        // If not stackable, you only get the current week's XP
        if (day % 7 === 0) { // Only on the "reset" day
          totalXp += config.weeklyChallengeXp;
        }
      }
    }

    const currentTier = Math.min(config.totalTiers, Math.floor(totalXp / config.xpPerTier));
    
    history.push({
      day,
      tier: currentTier,
      totalXp
    });
  }

  return history;
}