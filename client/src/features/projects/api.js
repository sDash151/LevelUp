import { api } from '@/shared/utils/api-client';

// ── Projects CRUD ──────────────────────────────────────────────
export const getProjects = (params) => api.get('/projects', { params }).then(r => r.data);
export const getProject = (id) => api.get(`/projects/${id}`).then(r => r.data);
export const createProject = (data) => api.post('/projects', data).then(r => r.data);
export const updateProject = (id, data) => api.patch(`/projects/${id}`, data).then(r => r.data);
export const deleteProject = (id) => api.delete(`/projects/${id}`).then(r => r.data);

// ── Stats & Pipeline ───────────────────────────────────────────
export const getProjectStats = () => api.get('/projects/stats').then(r => r.data);
export const getPipeline = () => api.get('/projects/pipeline').then(r => r.data);
export const movePipelineProject = (data) => api.patch('/projects/pipeline/move', data).then(r => r.data);

// ── Intelligence ───────────────────────────────────────────────
export const getIntelligence = () => api.get('/projects/intelligence').then(r => r.data);

// ── Project Sub-resources ──────────────────────────────────────
export const getProjectMetrics = (id) => api.get(`/projects/${id}/metrics`).then(r => r.data);
export const getProjectLearnings = (id, params) => api.get(`/projects/${id}/learnings`, { params }).then(r => r.data);
export const createProjectLearning = (id, data) => api.post(`/projects/${id}/learnings`, data).then(r => r.data);
export const createProjectTask = (id, data) => api.post(`/projects/${id}/tasks`, data).then(r => r.data);
export const updateProjectTask = (taskId, data) => api.patch(`/projects/tasks/${taskId}`, data).then(r => r.data);

// ── GitHub ─────────────────────────────────────────────────────
export const getGithubLoginUrl = (state) => api.get('/projects/github/login', { params: { state } }).then(r => r.data.data.url);
export const connectGithub = (data) => api.post('/projects/github/connect', data).then(r => r.data);
export const getGithubRepos = () => api.get('/projects/github/repos').then(r => r.data);
export const disconnectGithub = () => api.delete('/projects/github/disconnect').then(r => r.data);

// ── AI ─────────────────────────────────────────────────────────
export const analyzeProject = (data) => api.post('/projects/ai/analyze', data).then(r => r.data);
export const syncJobProjects = (data) => api.post('/projects/job-sync', data).then(r => r.data);
export const extractLearnings = async (data) => {
  const response = await api.post('/projects/learnings/extract', data);
  return response.data;
};

export const askAi = async (data) => {
  const response = await api.post('/projects/ai/chat', data);
  return response.data;
};

export const getBuildSuggestions = (projectId) => api.get(`/projects/${projectId}/intelligence/builder`).then(r => r.data);
