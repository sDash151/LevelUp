import { api } from '@/shared/utils/api-client';

export const getWorkouts = (params) => api.get('/fitness/workouts', { params }).then((r) => r.data);
export const createWorkout = (data) => api.post('/fitness/workouts', data).then((r) => r.data);
export const updateWorkout = (id, data) => api.put(`/fitness/workouts/${id}`, data).then((r) => r.data);
export const deleteWorkout = (id) => api.delete(`/fitness/workouts/${id}`).then((r) => r.data);
export const getFitnessStats = () => api.get('/fitness/workouts/stats').then((r) => r.data);
export const logDailyFitness = (data) => api.post('/fitness/log', data).then((r) => r.data);
export const getFitnessHistory = (days = 30) => api.get('/fitness/log/history', { params: { days } }).then((r) => r.data);
