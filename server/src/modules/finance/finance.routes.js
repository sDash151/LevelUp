/**
 * Finance Routes — All endpoints for the Finance module.
 * All routes are authenticated via the parent router.
 */
import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import * as controller from './finance.controller.js';
import {
  createTransactionSchema, updateTransactionSchema, getTransactionsSchema,
  aiLogTransactionSchema, deleteTransactionSchema,
  createAccountSchema, updateAccountSchema,
  createBudgetSchema, updateBudgetSchema,
  createGoalSchema, updateGoalSchema, contributeGoalSchema,
  createSubscriptionSchema,
  createDebtSchema, updateDebtSchema,
  createBillSchema, payBillSchema,
  createInsuranceSchema,
  createReflectionSchema,
  createCategorySchema,
  idParamSchema, monthQuerySchema,
} from './finance.validation.js';

const router = Router();

// ═══ Tab Data ═══
router.get('/overview', controller.getOverview);
router.get('/spend', controller.getSpendData);
router.get('/build', controller.getBuildData);
router.get('/protect', controller.getProtectData);
router.get('/intelligence', controller.getIntelligenceData);

// ═══ Transactions ═══
router.get('/transactions', validate(getTransactionsSchema), controller.getTransactions);
router.post('/transactions', validate(createTransactionSchema), controller.createTransaction);
router.put('/transactions/:id', validate(updateTransactionSchema), controller.updateTransaction);
router.delete('/transactions/:id', validate(deleteTransactionSchema), controller.deleteTransaction);
router.post('/transactions/ai-log', validate(aiLogTransactionSchema), controller.aiLogTransaction);

// ═══ Accounts ═══
router.get('/accounts', controller.getAccounts);
router.post('/accounts', validate(createAccountSchema), controller.createAccount);
router.put('/accounts/:id', validate(updateAccountSchema), controller.updateAccount);

// ═══ Budgets ═══
router.get('/budgets', validate(monthQuerySchema), controller.getBudgets);
router.post('/budgets', validate(createBudgetSchema), controller.createBudget);
router.put('/budgets/:id', validate(updateBudgetSchema), controller.updateBudget);

// ═══ Goals ═══
router.get('/goals', controller.getGoals);
router.post('/goals', validate(createGoalSchema), controller.createGoal);
router.put('/goals/:id', validate(updateGoalSchema), controller.updateGoal);
router.post('/goals/:id/contribute', validate(contributeGoalSchema), controller.contributeToGoal);

// ═══ Subscriptions ═══
router.get('/subscriptions', controller.getSubscriptions);
router.post('/subscriptions', validate(createSubscriptionSchema), controller.createSubscription);
router.delete('/subscriptions/:id', validate(idParamSchema), controller.deleteSubscription);

// ═══ Debts ═══
router.get('/debts', controller.getDebts);
router.post('/debts', validate(createDebtSchema), controller.createDebt);
router.put('/debts/:id', validate(updateDebtSchema), controller.updateDebt);

// ═══ Bills ═══
router.get('/bills', controller.getBills);
router.post('/bills', validate(createBillSchema), controller.createBill);
router.put('/bills/:id/pay', validate(payBillSchema), controller.payBill);

// ═══ Insurance ═══
router.get('/insurance', controller.getInsurance);
router.post('/insurance', validate(createInsuranceSchema), controller.createInsurance);

// ═══ Streaks ═══
router.get('/streaks', controller.getStreaks);

// ═══ Categories ═══
router.get('/categories', controller.getCategories);
router.post('/categories', validate(createCategorySchema), controller.createCategory);

// ═══ Reflections ═══
router.post('/reflection', validate(createReflectionSchema), controller.createReflection);

// ═══ AI Intelligence ═══
router.get('/ai/cfo-insight', controller.getCFOInsight);
router.get('/ai/spend-personality', controller.getSpendPersonality);
router.get('/ai/leak-analysis', controller.getLeakAnalysis);
router.get('/ai/savings-opportunities', controller.getSavingsOpportunities);
router.get('/ai/weekly-challenges', controller.getWeeklyChallenges);
router.get('/ai/wealth-plan', controller.getWealthPlan);
router.get('/ai/risk-alerts', controller.getRiskAlerts);

export default router;
