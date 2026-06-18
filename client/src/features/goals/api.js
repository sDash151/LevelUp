import { api } from '@/shared/utils/api-client';

export const getGoals = (type) => api.get('/goals', { params: type ? { type } : {} }).then((r) => r.data);
export const getGoal = (id) => api.get(`/goals/${id}`).then((r) => r.data);
export const createGoal = (data) => api.post('/goals', data).then((r) => r.data);
export const updateGoal = (id, data) => api.put(`/goals/${id}`, data).then((r) => r.data);
export const deleteGoal = (id) => api.delete(`/goals/${id}`).then((r) => r.data);
export const toggleMilestone = (goalId, milestoneId) => api.put(`/goals/${goalId}/milestones/${milestoneId}`).then((r) => r.data);
export const getGoalStats = (type) => api.get('/goals/stats', { params: type ? { type } : {} }).then((r) => r.data);
