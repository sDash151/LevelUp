import { api } from '@/shared/utils/api-client';

export const getTransactions = (params) => api.get('/finance', { params }).then((r) => r.data);
export const createTransaction = (data) => api.post('/finance', data).then((r) => r.data);
export const updateTransaction = (id, data) => api.put(`/finance/${id}`, data).then((r) => r.data);
export const deleteTransaction = (id) => api.delete(`/finance/${id}`).then((r) => r.data);
export const getFinanceSummary = () => api.get('/finance/summary').then((r) => r.data);
