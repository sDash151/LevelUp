import { useQuery } from '@tanstack/react-query';
import { getAnalyticsOverview, getHabitTrends, getWeeklyActivity } from '../api';

const MOCK_OVERVIEW = {
  habits: { total: 6, completedToday: 4, completedThisWeek: 28 },
  goals: { active: 3, completed: 2 },
  reflections: { thisMonth: 8 },
  dsa: { solved: 42, total: 58 },
  jobs: { active: 3, total: 6 },
  projects: { active: 2 },
  fitness: { workoutsThisWeek: 4, totalMinutesThisMonth: 480 },
  finance: { monthlyIncome: 97000, monthlyExpense: 27499, savings: 69501 },
};

const MOCK_TRENDS = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
  completed: Math.floor(Math.random() * 4) + 2,
  total: 6,
  rate: Math.floor(Math.random() * 40) + 50,
}));

const MOCK_ACTIVITY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => ({
  date: new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0],
  day,
  habits: Math.floor(Math.random() * 4) + 2,
  workoutMins: [0, 45, 0, 55, 30, 0, 40][i],
  dsaProblems: [1, 0, 2, 1, 0, 1, 0][i],
  reflections: [1, 0, 0, 1, 0, 0, 1][i],
}));

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => { const res = await getAnalyticsOverview(); return res.data?.overview ?? MOCK_OVERVIEW; },
    placeholderData: MOCK_OVERVIEW,
  });
}

export function useHabitTrends(days = 30) {
  return useQuery({
    queryKey: ['analytics', 'habit-trends', days],
    queryFn: async () => { const res = await getHabitTrends(days); return res.data?.trends ?? MOCK_TRENDS; },
    placeholderData: MOCK_TRENDS,
  });
}

export function useWeeklyActivity() {
  return useQuery({
    queryKey: ['analytics', 'weekly-activity'],
    queryFn: async () => { const res = await getWeeklyActivity(); return res.data?.activity ?? MOCK_ACTIVITY; },
    placeholderData: MOCK_ACTIVITY,
  });
}
