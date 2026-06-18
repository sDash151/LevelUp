import { api } from '@/shared/utils/api-client';

export const getInsights = () => api.get('/insights').then((r) => r.data);
