import { api } from '@/shared/utils/api-client';

// ═══ Tab Data ═══
export const getOverview = () => api.get('/finance/overview').then(r => r.data);
export const getSpendData = () => api.get('/finance/spend').then(r => r.data);
export const getMoodAnalytics = () => api.get('/finance/mood-analytics').then(r => r.data);
export const getBuildData = () => api.get('/finance/build').then(r => r.data);
export const getProtectData = () => api.get('/finance/protect').then(r => r.data);
export const getIntelligenceData = () => api.get('/finance/intelligence').then(r => r.data);

// ═══ Transactions ═══
export const getTransactions = (params) => api.get('/finance/transactions', { params }).then(r => r.data);
export const createTransaction = (data) => api.post('/finance/transactions', data).then(r => r.data);
export const updateTransaction = (id, data) => api.put(`/finance/transactions/${id}`, data).then(r => r.data);
export const deleteTransaction = (id) => api.delete(`/finance/transactions/${id}`).then(r => r.data);
export const aiLogTransaction = (text) => api.post('/finance/transactions/ai-log', { text }).then(r => r.data);

// ═══ Accounts ═══
export const getAccounts = () => api.get('/finance/accounts').then(r => r.data);
export const createAccount = (data) => api.post('/finance/accounts', data).then(r => r.data);
export const updateAccount = (id, data) => api.put(`/finance/accounts/${id}`, data).then(r => r.data);

// ═══ Budgets ═══
export const getBudgets = (month) => api.get('/finance/budgets', { params: { month } }).then(r => r.data);
export const createBudget = (data) => api.post('/finance/budgets', data).then(r => r.data);
export const updateBudget = (id, data) => api.put(`/finance/budgets/${id}`, data).then(r => r.data);
export const deleteBudget = (id) => api.delete(`/finance/budgets/${id}`).then(r => r.data);

// ═══ Goals ═══
export const getGoals = () => api.get('/finance/goals').then(r => r.data);
export const createGoal = (data) => api.post('/finance/goals', data).then(r => r.data);
export const updateGoal = (id, data) => api.put(`/finance/goals/${id}`, data).then(r => r.data);
export const contributeToGoal = (id, amount) => api.post(`/finance/goals/${id}/contribute`, { amount }).then(r => r.data);

// ═══ Subscriptions ═══
export const getSubscriptions = () => api.get('/finance/subscriptions').then(r => r.data);
export const createSubscription = (data) => api.post('/finance/subscriptions', data).then(r => r.data);
export const deleteSubscription = (id) => api.delete(`/finance/subscriptions/${id}`).then(r => r.data);

// ═══ Debts ═══
export const getDebts = () => api.get('/finance/debts').then(r => r.data);
export const createDebt = (data) => api.post('/finance/debts', data).then(r => r.data);
export const updateDebt = (id, data) => api.put(`/finance/debts/${id}`, data).then(r => r.data);

// ═══ Bills ═══
export const getBills = () => api.get('/finance/bills').then(r => r.data);
export const createBill = (data) => api.post('/finance/bills', data).then(r => r.data);
export const payBill = (id) => api.put(`/finance/bills/${id}/pay`).then(r => r.data);

// ═══ Insurance ═══
export const getInsurance = () => api.get('/finance/insurance').then(r => r.data);
export const createInsurance = (data) => api.post('/finance/insurance', data).then(r => r.data);

// ═══ Streaks ═══
export const getStreaks = () => api.get('/finance/streaks').then(r => r.data);

// ═══ Categories ═══
export const getCategories = () => api.get('/finance/categories').then(r => r.data);
export const createCategory = (data) => api.post('/finance/categories', data).then(r => r.data);

// ═══ Reflections ═══
export const createReflection = (data) => api.post('/finance/reflection', data).then(r => r.data);

// ═══ AI Intelligence ═══
export const getCFOInsight = () => api.get('/finance/ai/cfo-insight').then(r => r.data);
export const getSpendPersonality = () => api.get('/finance/ai/spend-personality').then(r => r.data);
export const getLeakAnalysis = () => api.get('/finance/ai/leak-analysis').then(r => r.data);
export const getSavingsOpportunities = () => api.get('/finance/ai/savings-opportunities').then(r => r.data);
export const getWeeklyChallenges = () => api.get('/finance/ai/weekly-challenges').then(r => r.data);
export const getWealthPlan = () => api.get('/finance/ai/wealth-plan').then(r => r.data);
export const getRiskAlerts = () => api.get('/finance/ai/risk-alerts').then(r => r.data);
