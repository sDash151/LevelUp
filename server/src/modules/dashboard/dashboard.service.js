import { dashboardRepository } from './dashboard.repository.js';

class DashboardService {
  async getSummary(userId) {
    // Fire all queries in parallel for speed
    const [
      today,
      streaks,
      weeklyProgress,
      habitConsistency,
      todayHabits,
      smartSummary,
      goalsProgress,
      upcoming,
      focusStats,
      userXp,
      completionSparkline,
    ] = await Promise.all([
      dashboardRepository.getTodayHabitCompletion(userId),
      dashboardRepository.getBestCurrentStreak(userId),
      dashboardRepository.getWeeklyProgress(userId),
      dashboardRepository.getHabitConsistency(userId),
      dashboardRepository.getTodayHabits(userId),
      dashboardRepository.getSmartSummary(userId),
      dashboardRepository.getGoalsProgress(userId),
      dashboardRepository.getUpcoming(userId),
      dashboardRepository.getFocusStats(userId),
      dashboardRepository.getUserXp(userId),
      dashboardRepository.getCompletionSparkline(userId),
    ]);

    // Format today's habits
    const formattedHabits = todayHabits.map((h) => ({
      id: h.id,
      name: h.name,
      icon: h.icon,
      color: h.color,
      category: h.category,
      completed: h.logs.length > 0,
    }));

    // XP level calculation (1000 XP per level)
    const xpForNextLevel = userXp.level * 1000;
    const xpProgress = Math.min(Math.round((userXp.totalXp / xpForNextLevel) * 100), 100);

    // Format focus time
    const focusHours = Math.floor(focusStats.focusTimeToday / 60);
    const focusMins = focusStats.focusTimeToday % 60;
    const focusTimeFormatted = focusHours > 0 ? `${focusHours}h ${focusMins}m` : `${focusMins}m`;

    return {
      // Stat cards
      todayProgress: today.percentage,
      habitsCompleted: today.completed,
      habitsTotal: today.total,
      currentStreak: streaks.currentStreak,
      bestStreak: streaks.bestStreak,
      focusTimeToday: focusStats.focusTimeToday,
      focusTimeFormatted,
      focusTimeWeekDelta: focusStats.focusTimeWeekDelta,
      focusSparkline: focusStats.focusSparkline,
      completionSparkline,
      totalXp: userXp.totalXp,
      level: userXp.level,
      xpForNextLevel,
      xpProgress,

      // Charts & grids
      weeklyProgress,
      habitConsistency,

      // Lists
      todayHabits: formattedHabits,
      goalsProgress,
      upcoming,

      // Summary
      smartSummary,

      // Legacy fields for backward compat
      weeklyCompletionPct: weeklyProgress.reduce((s, d) => s + d.value, 0) / 7,
      monthlyProgress: today.percentage,
      goalsInProgress: goalsProgress.length,
      recentActivities: [],
    };
  }
}

export const dashboardService = new DashboardService();
