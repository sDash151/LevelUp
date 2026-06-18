import { api } from '@/shared/utils/api-client';

export const loginUser = (data) => api.post('/auth/login', data).then((r) => r.data);
export const signupUser = (data) => api.post('/auth/signup', data).then((r) => r.data);
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email }).then((r) => r.data);
export const refreshToken = () => api.post('/auth/refresh').then((r) => r.data);
export const getMe = () => api.get('/auth/me').then((r) => r.data);
export const logoutUser = () => api.post('/auth/logout').then((r) => r.data);
