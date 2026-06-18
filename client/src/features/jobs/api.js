import { api } from '@/shared/utils/api-client';

export const getJobs = (params) => api.get('/jobs', { params }).then((r) => r.data);
export const getJob = (id) => api.get(`/jobs/${id}`).then((r) => r.data);
export const createJob = (data) => api.post('/jobs', data).then((r) => r.data);
export const updateJob = (id, data) => api.put(`/jobs/${id}`, data).then((r) => r.data);
export const deleteJob = (id) => api.delete(`/jobs/${id}`).then((r) => r.data);
export const getJobStats = () => api.get('/jobs/stats').then((r) => r.data);
export const generateAIPrep = (id) => api.post(`/jobs/${id}/ai-prep`).then((r) => r.data);
export const startPreparation = (id) => api.post(`/jobs/${id}/start-prep`).then((r) => r.data);
