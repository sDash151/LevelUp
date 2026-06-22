import { api } from '@/shared/utils/api-client';

export const getFullAnalytics = () => api.get('/analytics/full').then(res => res.data.data);
export const getDetailedROIReport = () => api.get('/analytics/roi-report').then(res => res.data.data);
