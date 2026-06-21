import { api } from '@/shared/utils/api-client';

// ── Profile ──
export const getProfile = () => api.get('/fitness/profile').then(r => r.data);
export const updateProfile = (data) => api.put('/fitness/profile', data).then(r => r.data);

// ── Overview ──
export const getOverview = () => api.get('/fitness/overview').then(r => r.data);
export const getAIOverviewInsight = () => api.get('/fitness/overview/ai-insight').then(r => r.data);

// ── Plan ──
export const getPlan = () => api.get('/fitness/plan').then(r => r.data);
export const getWorkoutMemory = () => api.get('/fitness/plan/memory').then(r => r.data);
export const getTopLiftsProgress = () => api.get('/fitness/plan/top-lifts').then(r => r.data);
export const getPlanInsights = () => api.get('/fitness/plan/insights').then(r => r.data);
export const optimizePlan = () => api.post('/fitness/plan/optimize').then(r => r.data);

// ── Workouts ──
export const getWorkoutStats = () => api.get('/fitness/workouts/stats').then(r => r.data);
export const getWorkoutHistory = (params) => api.get('/fitness/workouts', { params }).then(r => r.data);
export const logWorkout = (data) => api.post('/fitness/workouts', data).then(r => r.data);
export const smartParseWorkout = (text) => api.post('/fitness/workouts/smart-parse', { text }).then(r => r.data);
export const confirmSmartLog = (data) => api.post('/fitness/workouts/smart-confirm', data).then(r => r.data);

// ── Nutrition ──
export const getNutrition = (date) => api.get('/fitness/nutrition', { params: { date } }).then(r => r.data);
export const getAINutritionInsight = (date) => api.get('/fitness/nutrition/ai-insight', { params: { date } }).then(r => r.data);
export const logFood = (data) => api.post('/fitness/nutrition/meals', data).then(r => r.data);
export const deleteMealLog = (id) => api.delete(`/fitness/nutrition/meals/${id}`).then(r => r.data);
export const smartParseFood = (text) => api.post('/fitness/nutrition/meals/smart-parse', { text }).then(r => r.data);
export const logWater = (amount) => api.post('/fitness/nutrition/water', { amount }).then(r => r.data);

// ── Progress ──
export const getProgress = (range) => api.get('/fitness/progress', { params: { range } }).then(r => r.data);
export const logBodyMetric = (data) => api.post('/fitness/progress/metrics', data).then(r => r.data);
export const logMeasurement = (data) => api.post('/fitness/progress/measurements', data).then(r => r.data);
export const uploadPhoto = (data) => api.post('/fitness/progress/photos', data).then(r => r.data);
export const getAIProgressInsight = () => api.get('/fitness/progress/ai-insight').then(r => r.data);

// ── Milestones ──
export const getMilestones = () => api.get('/fitness/milestones').then(r => r.data);
export const createMilestone = (data) => api.post('/fitness/milestones', data).then(r => r.data);
