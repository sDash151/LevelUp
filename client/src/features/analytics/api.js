import { api } from '@/shared/utils/api-client';

export const getAnalyticsOverview = () => api.get('/analytics/overview').then((r) => r.data);
export const getHabitTrends = (days = 30) => api.get('/analytics/habit-trends', { params: { days } }).then((r) => r.data);
export const getWeeklyActivity = () => api.get('/analytics/weekly-activity').then((r) => r.data);
