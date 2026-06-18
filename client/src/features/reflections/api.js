import { api } from '@/shared/utils/api-client';

export const getReflections = (params) => api.get('/reflections', { params }).then((r) => r.data);
export const getReflection = (id) => api.get(`/reflections/${id}`).then((r) => r.data);
export const createReflection = (data) => api.post('/reflections', data).then((r) => r.data);
export const updateReflection = (id, data) => api.put(`/reflections/${id}`, data).then((r) => r.data);
export const deleteReflection = (id) => api.delete(`/reflections/${id}`).then((r) => r.data);
export const getMoodHistory = (days = 30) => api.get('/reflections/mood-history', { params: { days } }).then((r) => r.data);
export const getReflectionStats = () => api.get('/reflections/stats').then((r) => r.data);
