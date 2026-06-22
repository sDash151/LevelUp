import { api } from '@/shared/utils/api-client';

export const getHabits = () => api.get('/habits').then((r) => r.data);
export const getHabit = (id) => api.get(`/habits/${id}`).then((r) => r.data);
export const createHabit = (data) => api.post('/habits', data).then((r) => r.data);
export const updateHabit = (id, data) => api.put(`/habits/${id}`, data).then((r) => r.data);
export const deleteHabit = (id) => api.delete(`/habits/${id}`).then((r) => r.data);
export const toggleHabitComplete = (id, date) => api.post(`/habits/${id}/complete`, { date }).then((r) => r.data);
export const getHabitStats = () => api.get('/habits/stats').then((r) => r.data);
export const getHabitRichStats = () => api.get('/habits/rich-stats').then((r) => r.data);
export const getHabitCalendarStats = (year, month, selectedDate) =>
  api.get('/habits/calendar-stats', { params: { year, month, selectedDate } }).then((r) => r.data);
export const getAiInsight = (force = false) => api.get('/habits/ai/insight', { params: force ? { force: true } : {} }).then((r) => r.data);
export const planAIHabits = (goal) => api.post('/habits/ai/planner', { goal }).then((r) => r.data);
export const bulkCreateHabits = (habits) => api.post('/habits/bulk', { habits }).then((r) => r.data);
