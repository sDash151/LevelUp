import { api } from '@/shared/utils/api-client';

export const getDsaProblems = (params) => api.get('/dsa', { params }).then((r) => r.data);
export const getDsaProblem = (id) => api.get(`/dsa/${id}`).then((r) => r.data);
export const createDsaProblem = (data) => api.post('/dsa', data).then((r) => r.data);
export const updateDsaProblem = (id, data) => api.put(`/dsa/${id}`, data).then((r) => r.data);
export const deleteDsaProblem = (id) => api.delete(`/dsa/${id}`).then((r) => r.data);
export const getDsaStats = () => api.get('/dsa/stats').then((r) => r.data);
