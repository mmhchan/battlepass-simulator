import type { Persona, SeasonConfig, SimulationResult, XpBreakdown } from './types';

export function simulateSeason(persona: Persona, config: SeasonConfig): SimulationResult[] {
  const history: SimulationResult[] = [];
  let totalXp = 0;

  // Pre-calculate total play days for milestone XP distribution
  const activeDays = config.totalDays - persona.startDay;
  const activeWeeks = Math.ceil(activeDays / 7);
  const totalPlayDays = Math.min(activeDays, activeWeeks * persona.sessionsPerWeek);
  const milestoneXpPerPlayDay = totalPlayDays > 0 ? config.milestoneXp / totalPlayDays : 0;

  // Track weekly challenge completion
  let weeklyChallengesCleared = 0;
  let challengePlayMins = 0; // Accumulated play minutes toward clearing challenges

  for (let day = 0; day < config.totalDays; day++) {
    if (day < persona.startDay) {
      history.push({ day, tier: 0, totalXp: 0 });
      continue;
    }

    const dayInWeek = day % 7;
    const isPlayingToday = dayInWeek < persona.sessionsPerWeek;

    if (isPlayingToday) {
      totalXp += persona.minutesPerSession * config.xpPerMinute;
      totalXp += config.dailyQuestXp;
      totalXp += milestoneXpPerPlayDay;

      const currentWeek = Math.floor(day / 7);
      const weeksAvailable = currentWeek + 1;

      if (config.isWeeklyStackable) {
        // Stackable: play time determines how quickly backlog is cleared
        challengePlayMins += persona.minutesPerSession;
        const clearable = Math.floor(challengePlayMins / config.challengeClearMins);
        if (clearable > 0) {
          const toClear = Math.min(clearable, weeksAvailable - weeklyChallengesCleared);
          if (toClear > 0) {
            totalXp += config.weeklyChallengeXp * toClear;
            weeklyChallengesCleared += toClear;
            challengePlayMins -= toClear * config.challengeClearMins;
          }
        }
      } else if (dayInWeek === 0 && weeksAvailable > weeklyChallengesCleared) {
        // Non-stackable: one set of challenges per week, use it or lose it
        totalXp += config.weeklyChallengeXp;
        weeklyChallengesCleared = weeksAvailable;
      }
    }

    const currentTier = Math.min(config.totalTiers, Math.floor(totalXp / config.xpPerTier));
    history.push({ day, tier: currentTier, totalXp });
  }

  return history;
}

export function getXpBreakdown(persona: Persona, config: SeasonConfig): XpBreakdown {
  const activeDays = config.totalDays - persona.startDay;
  const activeWeeks = Math.ceil(activeDays / 7);
  const totalPlayDays = Math.min(activeDays, activeWeeks * persona.sessionsPerWeek);
  const milestoneXpPerPlayDay = totalPlayDays > 0 ? config.milestoneXp / totalPlayDays : 0;

  let passive = 0;
  let dailyQuests = 0;
  let weeklyChallenges = 0;
  let milestones = 0;
  let weeklyChallengesCleared = 0;
  let challengePlayMins = 0;

  for (let day = 0; day < config.totalDays; day++) {
    if (day < persona.startDay) continue;

    const dayInWeek = day % 7;
    const isPlayingToday = dayInWeek < persona.sessionsPerWeek;

    if (isPlayingToday) {
      passive += persona.minutesPerSession * config.xpPerMinute;
      dailyQuests += config.dailyQuestXp;
      milestones += milestoneXpPerPlayDay;

      const currentWeek = Math.floor(day / 7);
      const weeksAvailable = currentWeek + 1;

      if (config.isWeeklyStackable) {
        challengePlayMins += persona.minutesPerSession;
        const clearable = Math.floor(challengePlayMins / config.challengeClearMins);
        if (clearable > 0) {
          const toClear = Math.min(clearable, weeksAvailable - weeklyChallengesCleared);
          if (toClear > 0) {
            weeklyChallenges += config.weeklyChallengeXp * toClear;
            weeklyChallengesCleared += toClear;
            challengePlayMins -= toClear * config.challengeClearMins;
          }
        }
      } else if (dayInWeek === 0 && weeksAvailable > weeklyChallengesCleared) {
        weeklyChallenges += config.weeklyChallengeXp;
        weeklyChallengesCleared = weeksAvailable;
      }
    }
  }

  return {
    passive,
    dailyQuests,
    weeklyChallenges,
    milestones,
    total: passive + dailyQuests + weeklyChallenges + milestones,
  };
}