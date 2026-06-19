import { api } from '@/shared/utils/api-client';

// ── Dashboard ──
export const getDsaDashboard = () => api.get('/dsa').then((r) => r.data);

// ── Paths ──
export const getDsaPaths = () => api.get('/dsa/paths').then((r) => r.data);
export const getDsaPathDetail = (slug) => api.get(`/dsa/paths/${slug}`).then((r) => r.data);
export const getDsaPathProblems = (slug, params) => api.get(`/dsa/paths/${slug}/problems`, { params }).then((r) => r.data);

// ── Problems ──
export const getDsaProblem = (id) => api.get(`/dsa/problems/${id}`).then((r) => r.data);
export const solveDsaProblem = (id, data = {}) => api.patch(`/dsa/problems/${id}/solve`, data).then((r) => r.data);
export const updateDsaStatus = (id, data) => api.patch(`/dsa/problems/${id}/status`, data).then((r) => r.data);
export const updateDsaNotes = (id, data) => api.patch(`/dsa/problems/${id}/notes`, data).then((r) => r.data);
export const reviseDsaProblem = (id, data) => api.post(`/dsa/problems/${id}/revise`, data).then((r) => r.data);

// ── Engines ──
export const getDsaRevision = () => api.get('/dsa/revision').then((r) => r.data);
export const getDsaWeakness = () => api.get('/dsa/weakness').then((r) => r.data);
export const getDsaRecommendations = () => api.get('/dsa/recommendations').then((r) => r.data);
export const getDsaCompanyMode = () => api.get('/dsa/company-mode').then((r) => r.data);
export const getDsaPatterns = () => api.get('/dsa/patterns').then((r) => r.data);
export const getDsaHeatmap = () => api.get('/dsa/heatmap').then((r) => r.data);

// ── Search & Active Path ──
export const searchDsaProblems = (query) => api.get('/dsa/search', { params: { q: query } }).then((r) => r.data);
export const setActiveDsaPath = (pathSlug) => api.patch('/dsa/active-path', { pathSlug }).then((r) => r.data);
export const getDsaQuickResume = () => api.get('/dsa/quick-resume').then((r) => r.data);
