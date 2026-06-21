/**
 * Finance Controller — Thin request handlers for all finance endpoints.
 */
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { success, created } from '../../shared/utils/response.js';
import { financeService } from './finance.service.js';

// ══════════════════════════════════════════════
// TAB DATA
// ══════════════════════════════════════════════

export const getOverview = asyncHandler(async (req, res) => {
  const data = await financeService.getOverview(req.user.id);
  success(res, data);
});

export const getSpendData = asyncHandler(async (req, res) => {
  const data = await financeService.getSpendData(req.user.id);
  success(res, data);
});

export const getBuildData = asyncHandler(async (req, res) => {
  const data = await financeService.getBuildData(req.user.id);
  success(res, data);
});

export const getProtectData = asyncHandler(async (req, res) => {
  const data = await financeService.getProtectData(req.user.id);
  success(res, data);
});

export const getIntelligenceData = asyncHandler(async (req, res) => {
  const data = await financeService.getIntelligenceData(req.user.id);
  success(res, data);
});

// ══════════════════════════════════════════════
// TRANSACTIONS
// ══════════════════════════════════════════════

export const getTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, ...filters } = req.query;
  const data = await financeService.getTransactions(req.user.id, filters, parseInt(page), parseInt(limit));
  success(res, data);
});

export const createTransaction = asyncHandler(async (req, res) => {
  const txn = await financeService.createTransaction(req.user.id, req.body);
  created(res, txn);
});

export const updateTransaction = asyncHandler(async (req, res) => {
  const txn = await financeService.updateTransaction(req.user.id, req.params.id, req.body);
  success(res, txn);
});

export const deleteTransaction = asyncHandler(async (req, res) => {
  await financeService.deleteTransaction(req.user.id, req.params.id);
  success(res, null, 'Transaction deleted');
});

export const aiLogTransaction = asyncHandler(async (req, res) => {
  const parsed = await financeService.aiLogTransaction(req.user.id, req.body.text);
  success(res, parsed);
});

// ══════════════════════════════════════════════
// ACCOUNTS
// ══════════════════════════════════════════════

export const getAccounts = asyncHandler(async (req, res) => {
  const data = await financeService.getAccounts(req.user.id);
  success(res, data);
});

export const createAccount = asyncHandler(async (req, res) => {
  const account = await financeService.createAccount(req.user.id, req.body);
  created(res, account);
});

export const updateAccount = asyncHandler(async (req, res) => {
  const account = await financeService.updateAccount(req.user.id, req.params.id, req.body);
  success(res, account);
});

// ══════════════════════════════════════════════
// BUDGETS
// ══════════════════════════════════════════════

export const getBudgets = asyncHandler(async (req, res) => {
  const data = await financeService.getBudgets(req.user.id, req.query.month);
  success(res, data);
});

export const createBudget = asyncHandler(async (req, res) => {
  const budget = await financeService.createBudget(req.user.id, req.body);
  created(res, budget);
});

export const updateBudget = asyncHandler(async (req, res) => {
  const budget = await financeService.updateBudget(req.user.id, req.params.id, req.body);
  success(res, budget);
});

// ══════════════════════════════════════════════
// GOALS
// ══════════════════════════════════════════════

export const getGoals = asyncHandler(async (req, res) => {
  const data = await financeService.getGoals(req.user.id);
  success(res, data);
});

export const createGoal = asyncHandler(async (req, res) => {
  const goal = await financeService.createGoal(req.user.id, req.body);
  created(res, goal);
});

export const updateGoal = asyncHandler(async (req, res) => {
  const goal = await financeService.updateGoal(req.user.id, req.params.id, req.body);
  success(res, goal);
});

export const contributeToGoal = asyncHandler(async (req, res) => {
  const goal = await financeService.contributeToGoal(req.user.id, req.params.id, req.body.amount);
  success(res, goal);
});

// ══════════════════════════════════════════════
// SUBSCRIPTIONS
// ══════════════════════════════════════════════

export const getSubscriptions = asyncHandler(async (req, res) => {
  const data = await financeService.getSubscriptions(req.user.id);
  success(res, data);
});

export const createSubscription = asyncHandler(async (req, res) => {
  const sub = await financeService.createSubscription(req.user.id, req.body);
  created(res, sub);
});

export const deleteSubscription = asyncHandler(async (req, res) => {
  await financeService.deleteSubscription(req.user.id, req.params.id);
  success(res, null, 'Subscription deleted');
});

// ══════════════════════════════════════════════
// DEBTS
// ══════════════════════════════════════════════

export const getDebts = asyncHandler(async (req, res) => {
  const data = await financeService.getDebts(req.user.id);
  success(res, data);
});

export const createDebt = asyncHandler(async (req, res) => {
  const debt = await financeService.createDebt(req.user.id, req.body);
  created(res, debt);
});

export const updateDebt = asyncHandler(async (req, res) => {
  const debt = await financeService.updateDebt(req.user.id, req.params.id, req.body);
  success(res, debt);
});

// ══════════════════════════════════════════════
// BILLS
// ══════════════════════════════════════════════

export const getBills = asyncHandler(async (req, res) => {
  const data = await financeService.getBills(req.user.id);
  success(res, data);
});

export const createBill = asyncHandler(async (req, res) => {
  const bill = await financeService.createBill(req.user.id, req.body);
  created(res, bill);
});

export const payBill = asyncHandler(async (req, res) => {
  const bill = await financeService.payBill(req.user.id, req.params.id);
  success(res, bill);
});

// ══════════════════════════════════════════════
// INSURANCE
// ══════════════════════════════════════════════

export const getInsurance = asyncHandler(async (req, res) => {
  const data = await financeService.getInsurance(req.user.id);
  success(res, data);
});

export const createInsurance = asyncHandler(async (req, res) => {
  const ins = await financeService.createInsurance(req.user.id, req.body);
  created(res, ins);
});

// ══════════════════════════════════════════════
// STREAKS
// ══════════════════════════════════════════════

export const getStreaks = asyncHandler(async (req, res) => {
  const data = await financeService.getStreaks(req.user.id);
  success(res, data);
});

// ══════════════════════════════════════════════
// CATEGORIES
// ══════════════════════════════════════════════

export const getCategories = asyncHandler(async (req, res) => {
  const data = await financeService.getCategories(req.user.id);
  success(res, data);
});

export const createCategory = asyncHandler(async (req, res) => {
  const cat = await financeService.createCategory(req.user.id, req.body);
  created(res, cat);
});

// ══════════════════════════════════════════════
// REFLECTIONS
// ══════════════════════════════════════════════

export const createReflection = asyncHandler(async (req, res) => {
  const reflection = await financeService.createReflection(req.user.id, req.body);
  created(res, reflection);
});

// ══════════════════════════════════════════════
// AI INTELLIGENCE
// ══════════════════════════════════════════════

export const getCFOInsight = asyncHandler(async (req, res) => {
  const data = await financeService.generateCFOInsight(req.user.id);
  success(res, data);
});

export const getSpendPersonality = asyncHandler(async (req, res) => {
  const data = await financeService.getSpendPersonality(req.user.id);
  success(res, data);
});

export const getLeakAnalysis = asyncHandler(async (req, res) => {
  const data = await financeService.getLeakAnalysis(req.user.id);
  success(res, data);
});

export const getSavingsOpportunities = asyncHandler(async (req, res) => {
  const data = await financeService.getSavingsOpportunities(req.user.id);
  success(res, data);
});

export const getWeeklyChallenges = asyncHandler(async (req, res) => {
  const data = await financeService.getWeeklyChallenges(req.user.id);
  success(res, data);
});

export const getWealthPlan = asyncHandler(async (req, res) => {
  const data = await financeService.getWealthPlan(req.user.id);
  success(res, data);
});

export const getRiskAlerts = asyncHandler(async (req, res) => {
  const data = await financeService.getRiskAlerts(req.user.id);
  success(res, data);
});
