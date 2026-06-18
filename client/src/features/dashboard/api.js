import { api } from '@/shared/utils/api-client';

export const getDashboardSummary = () =>
  api.get('/dashboard/summary').then((r) => r.data).catch(() => ({
    data: {
      todayProgress: 65, weeklyProgress: 72, monthlyProgress: 58,
      currentStreak: 12, bestStreak: 30,
      habitsCompleted: 5, habitsTotal: 8, goalsInProgress: 4,
      recentActivities: [],
    },
  }));
