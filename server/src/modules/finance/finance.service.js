/**
 * Finance Service — Core business logic for the Finance module.
 * Orchestrates repository, scoring, XP, AI, and Life ROI.
 */
import { financeRepository } from './finance.repository.js';
import { financeScoring } from './finance.scoring.js';
import { financeXP } from './finance.xp.js';
import { financeAI } from './finance.ai.js';
import { lifeROIService } from './lifeRoi.service.js';

class FinanceService {

  // ══════════════════════════════════════════════
  // OVERVIEW TAB
  // ══════════════════════════════════════════════

  async getOverview(userId) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const threeMonthsAgo = new Date(now); threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    await financeRepository.ensureDefaultCategories(userId);

    const [
      currentAgg, prevAgg, netWorthData, accounts,
      budgetSpending, streaks, obligations,
      threeMonthTxns, monthTxns, goals,
      subscriptions, debts, bills, insurance,
      weeklyAgg, reflection,
    ] = await Promise.all([
      financeRepository.getMonthlyAggregates(userId, monthStart, monthEnd),
      financeRepository.getMonthlyAggregates(userId, prevMonthStart, prevMonthEnd),
      financeRepository.getNetWorth(userId),
      financeRepository.getAccounts(userId),
      financeRepository.getBudgetSpending(userId, this._currentMonth()),
      financeRepository.getStreaks(userId),
      financeRepository.getMonthlyObligations(userId),
      financeRepository.getTransactionsByDateRange(userId, threeMonthsAgo, now),
      financeRepository.getTransactionsByDateRange(userId, monthStart, monthEnd),
      financeRepository.getGoals(userId),
      financeRepository.getActiveSubscriptions(userId),
      financeRepository.getDebts(userId),
      financeRepository.getUpcomingBills(userId, 5),
      financeRepository.getInsurance(userId),
      financeRepository.getWeeklyAggregates(userId, monthStart, monthEnd),
      financeRepository.getReflectionByMonth(userId, this._currentMonth()),
    ]);

    const monthlyIncome = currentAgg.income;
    const monthlyExpenses = currentAgg.expense;
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const prevSavings = prevAgg.income - prevAgg.expense;
    const avgMonthlyExpenses = threeMonthTxns.length > 0
      ? threeMonthTxns.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + parseFloat(t.amount), 0) / 3
      : monthlyExpenses;

    const totalDebt = debts.reduce((s, d) => s + parseFloat(d.totalAmount) - parseFloat(d.paidAmount), 0);
    const subscriptionLoad = await financeRepository.getMonthlySubscriptionLoad(userId);

    // Emergency fund from goals
    const emergencyGoal = goals.find(g => g.goalType === 'EMERGENCY');
    const emergencyFund = emergencyGoal ? parseFloat(emergencyGoal.currentAmount) : 0;
    const emergencyTarget = emergencyGoal ? parseFloat(emergencyGoal.targetAmount) : avgMonthlyExpenses * 6;

    // Cash balance
    const cashAccounts = accounts.filter(a => ['cash', 'savings'].includes(a.type));
    const cashBalance = cashAccounts.reduce((s, a) => s + parseFloat(a.balance), 0);

    // Budget adherence
    const budgetAdherence = budgetSpending.length > 0
      ? (budgetSpending.filter(b => b.riskPercent <= 100).length / budgetSpending.length) * 100
      : 100;

    // Scoring
    const freedomScore = financeScoring.calculateFreedomScore({
      monthlyIncome, monthlyExpenses, totalDebt, emergencyFund, avgMonthlyExpenses, budgetAdherence,
    });
    const cashReserve = financeScoring.calculateCashReserve(cashBalance, avgMonthlyExpenses);
    const savingsVelocity = financeScoring.calculateSavingsVelocity(monthlySavings, prevSavings);
    const burnRate = financeScoring.calculateBurnRate(monthlyExpenses);
    const upgradeScore = financeScoring.calculateUpgradeScore(monthTxns.filter(t => t.type === 'EXPENSE'));

    // Wealth allocation from accounts
    const wealthAllocation = this._buildWealthAllocation(accounts, totalDebt);

    // Category breakdown for cash flow
    const categoryBreakdown = await financeRepository.getCategoryBreakdown(userId, monthStart, monthEnd);

    // Expense leak detection
    const leakCategories = ['Food & Dining', 'Entertainment', 'Shopping'];
    const rawLeaks = categoryBreakdown
      .filter(c => leakCategories.some(l => c.category?.includes(l)))
      .map(c => {
        const catName = c.category;
        const totalSpent = parseFloat(c._sum.amount);
        const budget = budgetSpending.find(b => b.category?.name === catName);
        
        const leakAmount = budget ? Math.max(0, totalSpent - budget.monthlyLimit) : totalSpent;

        return { category: catName, amount: leakAmount };
      })
      .filter(l => l.amount > 0);

    const totalLeakAmount = rawLeaks.reduce((s, l) => s + l.amount, 0);

    const leaks = rawLeaks.map(l => ({
      category: l.category,
      amount: Math.round(l.amount * 100) / 100,
      percentage: totalLeakAmount > 0 ? Math.round((l.amount / totalLeakAmount) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);

    // AI insight (cached 24h)
    let aiInsight = null;
    const cachedInsight = await financeRepository.getLatestInsight(userId, 'cfo');
    if (cachedInsight && this._isWithin24Hours(cachedInsight.createdAt)) {
      aiInsight = cachedInsight.content;
    }

    // Life ROI
    let lifeROI = null;
    try { lifeROI = await lifeROIService.getLifeROI(userId); } catch { /* degrade gracefully */ }

    return {
      kpis: {
        netWorth: { current: netWorthData.netWorth, change: Math.round((netWorthData.netWorth - (netWorthData.netWorth - monthlySavings + prevSavings)) * 10) / 10 },
        cashReserve,
        savingsVelocity: { current: monthlySavings, velocity: savingsVelocity.velocity, trend: savingsVelocity.trend },
        burnRate: { daily: burnRate, monthly: monthlyExpenses, change: monthlyExpenses > 0 && prevAgg.expense > 0 ? Math.round(((monthlyExpenses - prevAgg.expense) / prevAgg.expense) * 1000) / 10 : 0 },
        freedomScore,
      },
      wealthAllocation,
      accounts,
      cashFlow: {
        income: monthlyIncome,
        expenses: monthlyExpenses,
        savings: monthlySavings,
        weeklyBreakdown: weeklyAgg,
      },
      expenseLeaks: leaks,
      budgetHealth: budgetSpending,
      upcomingObligations: obligations.obligations.slice(0, 5),
      totalMonthlyObligations: obligations.totalMonthly,
      emergencyFund: {
        current: emergencyFund,
        target: Math.round(emergencyTarget * 100) / 100,
        progress: emergencyTarget > 0 ? Math.round((emergencyFund / emergencyTarget) * 100) : 0,
        monthsCovered: avgMonthlyExpenses > 0 ? Math.round((emergencyFund / avgMonthlyExpenses) * 10) / 10 : 0,
      },
      streaks: this._formatStreaks(streaks),
      aiInsight,
      upgradeScore,
      lifeROI,
      monthlyReflection: reflection,
    };
  }

  // ══════════════════════════════════════════════
  // SPEND TAB
  // ══════════════════════════════════════════════

  async getSpendData(userId) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [currentAgg, prevAgg, categoryBreakdown, moodBreakdown, budgetSpending, streaks, dailySpending, txnCount, prevTxnCount] = await Promise.all([
      financeRepository.getMonthlyAggregates(userId, monthStart, monthEnd),
      financeRepository.getMonthlyAggregates(userId, prevMonthStart, prevMonthEnd),
      financeRepository.getCategoryBreakdown(userId, monthStart, monthEnd),
      financeRepository.getMoodBreakdown(userId, monthStart, monthEnd),
      financeRepository.getBudgetSpending(userId, this._currentMonth()),
      financeRepository.getStreaks(userId),
      financeRepository.getDailySpending(userId, monthStart, monthEnd),
      financeRepository.getTransactionCount(userId, monthStart, monthEnd),
      financeRepository.getTransactionCount(userId, prevMonthStart, prevMonthEnd),
    ]);

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const monthlyIncome = currentAgg.income;
    const monthlyExpenses = currentAgg.expense;
    const netCashFlow = monthlyIncome - monthlyExpenses;
    const avgDailySpend = dayOfMonth > 0 ? Math.round((monthlyExpenses / dayOfMonth) * 100) / 100 : 0;

    // Budget health
    const totalBudgets = budgetSpending.length;
    const budgetsOver = budgetSpending.filter(b => b.riskPercent > 100).length;
    const budgetHealth = totalBudgets > 0 ? Math.round(((totalBudgets - budgetsOver) / totalBudgets) * 100) : 100;

    // Mood tracking
    const totalMoodTxns = moodBreakdown.reduce((s, m) => s + m._count, 0);
    const moodData = moodBreakdown.map(m => ({
      mood: m.mood,
      count: m._count,
      amount: Math.round(parseFloat(m._sum.amount) * 100) / 100,
      percentage: totalMoodTxns > 0 ? Math.round((m._count / totalMoodTxns) * 100) : 0,
    }));

    // Spending breakdown
    const totalSpent = categoryBreakdown.reduce((s, c) => s + parseFloat(c._sum.amount), 0);
    const spendingBreakdown = categoryBreakdown.map(c => ({
      category: c.category,
      amount: Math.round(parseFloat(c._sum.amount) * 100) / 100,
      percentage: totalSpent > 0 ? Math.round((parseFloat(c._sum.amount) / totalSpent) * 1000) / 10 : 0,
      count: c._count,
    }));

    return {
      kpis: {
        totalSpend: { current: monthlyExpenses, change: prevAgg.expense > 0 ? Math.round(((monthlyExpenses - prevAgg.expense) / prevAgg.expense) * 1000) / 10 : 0 },
        totalIncome: { current: monthlyIncome, change: prevAgg.income > 0 ? Math.round(((monthlyIncome - prevAgg.income) / prevAgg.income) * 1000) / 10 : 0 },
        netCashFlow: { current: netCashFlow, change: prevAgg.income - prevAgg.expense !== 0 ? Math.round(((netCashFlow - (prevAgg.income - prevAgg.expense)) / Math.abs(prevAgg.income - prevAgg.expense || 1)) * 1000) / 10 : 0 },
        avgDailySpend: { current: avgDailySpend },
        budgetHealth: { score: budgetHealth, label: budgetHealth >= 80 ? 'Good' : budgetHealth >= 50 ? 'Needs attention' : 'At risk' },
        budgetsOverLimit: { count: budgetsOver },
        transactionCount: { current: txnCount, change: txnCount - prevTxnCount },
      },
      budgetEngine: budgetSpending,
      spendingBreakdown,
      topCategories: spendingBreakdown.slice(0, 5),
      moodTracking: moodData,
      spendingTrend: dailySpending,
      streaks: this._formatStreaks(streaks),
    };
  }
  async getMoodAnalytics(userId) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1); // Last 2 months
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const data = await financeRepository.getDetailedMoodAnalytics(userId, monthStart, monthEnd);
    
    // Process Categories
    const categoryMoods = {};
    for (const item of data.byCategory) {
      if (!categoryMoods[item.mood]) categoryMoods[item.mood] = [];
      categoryMoods[item.mood].push({
        name: item.category,
        amount: parseFloat(item._sum.amount),
        count: item._count
      });
    }

    // Process Merchants
    const merchantMoods = {};
    for (const item of data.byMerchant) {
      if (!merchantMoods[item.mood]) merchantMoods[item.mood] = [];
      merchantMoods[item.mood].push({
        name: item.merchant,
        amount: parseFloat(item._sum.amount),
        count: item._count
      });
    }

    // Sort and limit
    const result = {};
    for (const mood of ['HAPPY', 'NEUTRAL', 'REGRET']) {
      result[mood] = {
        categories: (categoryMoods[mood] || []).sort((a, b) => b.amount - a.amount).slice(0, 5),
        merchants: (merchantMoods[mood] || []).sort((a, b) => b.amount - a.amount).slice(0, 5)
      };
    }

    return result;
  }

  // ══════════════════════════════════════════════
  // BUILD TAB
  // ══════════════════════════════════════════════

  async getBuildData(userId) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const sixMonthsAgo = new Date(now); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [goals, accounts, currentAgg, prevAgg, streaks, monthTxns, sixMonthTxns, categories] = await Promise.all([
      financeRepository.getGoals(userId),
      financeRepository.getAccounts(userId),
      financeRepository.getMonthlyAggregates(userId, monthStart, monthEnd),
      financeRepository.getMonthlyAggregates(userId, prevMonthStart, prevMonthEnd),
      financeRepository.getStreaks(userId),
      financeRepository.getTransactionsByDateRange(userId, monthStart, monthEnd),
      financeRepository.getTransactionsByDateRange(userId, sixMonthsAgo, now),
      financeRepository.getCategoryBreakdown(userId, monthStart, monthEnd, 'EXPENSE'),
    ]);

    const monthlyIncome = currentAgg.income;
    const monthlyExpenses = currentAgg.expense;
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? Math.round((monthlySavings / monthlyIncome) * 100) : 0;

    // KPIs
    const totalAssets = accounts.filter(a => a.type !== 'debt').reduce((s, a) => s + parseFloat(a.balance), 0);
    const investmentValue = accounts.filter(a => a.type === 'investment').reduce((s, a) => s + parseFloat(a.balance), 0);
    const opportunityGoal = goals.find(g => g.goalType === 'OPPORTUNITY');
    const opportunityFund = opportunityGoal ? parseFloat(opportunityGoal.currentAmount) : 0;

    // Wealth score (simplified: ratio of assets to goals)
    const totalGoalTarget = goals.reduce((s, g) => s + parseFloat(g.targetAmount), 0);
    const totalGoalCurrent = goals.reduce((s, g) => s + parseFloat(g.currentAmount), 0);
    const wealthScore = totalGoalTarget > 0 ? Math.min(Math.round((totalGoalCurrent / totalGoalTarget) * 100), 100) : 0;

    // Savings trend (monthly)
    const savingsTrend = this._buildMonthlyTrend(sixMonthTxns);

    // Goal progress overview
    const goalStats = {
      onTrack: goals.filter(g => !g.isCompleted && this._isGoalOnTrack(g)).length,
      behind: goals.filter(g => !g.isCompleted && !this._isGoalOnTrack(g) && g.deadline).length,
      atRisk: goals.filter(g => !g.isCompleted && g.deadline && new Date(g.deadline) < new Date()).length,
      completed: goals.filter(g => g.isCompleted).length,
      totalProgress: totalGoalTarget > 0 ? Math.round((totalGoalCurrent / totalGoalTarget) * 100) : 0,
    };

    // Skill investment tracker (from self-improvement categories)
    const upgradeScore = financeScoring.calculateUpgradeScore(monthTxns.filter(t => t.type === 'EXPENSE'));

    // Wealth buckets
    const totalAllocated = accounts.reduce((s, a) => s + Math.abs(parseFloat(a.balance)), 0);
    const wealthBuckets = this._buildWealthBuckets(accounts, categories, totalAllocated);

    // Contribution calendar (daily savings)
    const dailyContributions = this._buildContributionCalendar(sixMonthTxns);

    return {
      kpis: {
        totalAssets: { current: Math.round(totalAssets * 100) / 100, change: Math.round(((totalAssets - (totalAssets - monthlySavings)) / Math.max(totalAssets - monthlySavings, 1)) * 1000) / 10 },
        savingsRate: { current: savingsRate, change: prevAgg.income > 0 ? savingsRate - Math.round(((prevAgg.income - prevAgg.expense) / prevAgg.income) * 100) : 0 },
        investmentValue: { current: Math.round(investmentValue * 100) / 100, change: Math.round((savingsRate * 0.28) * 10) / 10 },
        opportunityFund: { current: Math.round(opportunityFund * 100) / 100, change: opportunityFund > 0 ? Math.round((savingsRate * 0.15) * 10) / 10 : 0 },
        wealthScore: { score: wealthScore, label: wealthScore >= 80 ? 'Excellent' : wealthScore >= 60 ? 'Good' : wealthScore >= 40 ? 'Growing' : 'Getting Started' },
      },
      goals,
      goalStats,
      savingsStreak: this._formatStreaks(streaks).find(s => s.type === 'savings') || { type: 'savings', current: 0, best: 0 },
      contributionCalendar: dailyContributions,
      savingsTrend,
      opportunityFund: {
        current: Math.round(opportunityFund * 100) / 100,
        goal: opportunityGoal,
      },
      skillInvestments: upgradeScore,
      wealthBuckets,
      streaks: this._formatStreaks(streaks),
    };
  }

  // ══════════════════════════════════════════════
  // PROTECT TAB
  // ══════════════════════════════════════════════

  async getProtectData(userId) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const threeMonthsAgo = new Date(now); threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const [bills, subscriptions, debts, insurance, obligations, currentAgg, streaks, goals, threeMonthTxns, billStats] = await Promise.all([
      financeRepository.getBills(userId),
      financeRepository.getSubscriptions(userId),
      financeRepository.getDebts(userId),
      financeRepository.getInsurance(userId),
      financeRepository.getMonthlyObligations(userId),
      financeRepository.getMonthlyAggregates(userId, monthStart, monthEnd),
      financeRepository.getStreaks(userId),
      financeRepository.getGoals(userId),
      financeRepository.getTransactionsByDateRange(userId, threeMonthsAgo, now),
      financeRepository.getBillsPaidCount(userId, monthStart, monthEnd),
    ]);

    const monthlyIncome = currentAgg.income;
    const monthlyExpenses = currentAgg.expense;
    const avgMonthlyExpenses = threeMonthTxns.length > 0
      ? threeMonthTxns.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + parseFloat(t.amount), 0) / 3
      : monthlyExpenses;

    const totalDebt = debts.filter(d => d.status === 'ACTIVE').reduce((s, d) => s + parseFloat(d.totalAmount) - parseFloat(d.paidAmount), 0);
    const subscriptionLoad = await financeRepository.getMonthlySubscriptionLoad(userId);
    const activeInsuranceCount = insurance.filter(i => i.status === 'ACTIVE').length;

    const emergencyGoal = goals.find(g => g.goalType === 'EMERGENCY');
    const emergencyFund = emergencyGoal ? parseFloat(emergencyGoal.currentAmount) : 0;
    const emergencyTarget = emergencyGoal ? parseFloat(emergencyGoal.targetAmount) : avgMonthlyExpenses * 6;

    const protectionScore = financeScoring.calculateProtectionScore({
      emergencyFund, avgMonthlyExpenses, totalDebt, monthlyIncome,
      activeInsuranceCount, idealInsuranceCount: 4,
      subscriptionLoad, billsPaidOnTime: billStats.paid, totalBills: billStats.total,
    });

    // Debt overview
    const debtBreakdown = debts.filter(d => d.status === 'ACTIVE').map(d => ({
      ...d, remaining: parseFloat(d.totalAmount) - parseFloat(d.paidAmount),
      progress: parseFloat(d.totalAmount) > 0 ? Math.round((parseFloat(d.paidAmount) / parseFloat(d.totalAmount)) * 100) : 0,
    }));

    // Unused subscription detection
    const unusedSubs = subscriptions.filter(s => s.status === 'ACTIVE' && s.isDetected);

    return {
      kpis: {
        protectionScore,
        emergencyFund: { current: emergencyFund, months: avgMonthlyExpenses > 0 ? Math.round((emergencyFund / avgMonthlyExpenses) * 10) / 10 : 0 },
        totalMonthlyObligations: { current: obligations.totalMonthly, percentOfIncome: monthlyIncome > 0 ? Math.round((obligations.totalMonthly / monthlyIncome) * 100) : 0 },
        activeSubscriptions: { count: subscriptions.filter(s => s.status === 'ACTIVE').length, load: subscriptionLoad },
        totalDebt: { current: Math.round(totalDebt * 100) / 100 },
        riskStatus: { label: protectionScore.score >= 70 ? 'Low Risk' : protectionScore.score >= 40 ? 'Moderate' : 'High Risk' },
      },
      bills: bills.filter(b => b.status !== 'PAID').slice(0, 10),
      subscriptions,
      unusedSubscriptions: unusedSubs,
      emergencyFundPlanner: {
        current: emergencyFund,
        target: Math.round(emergencyTarget * 100) / 100,
        progress: emergencyTarget > 0 ? Math.round((emergencyFund / emergencyTarget) * 100) : 0,
        monthsCovered: avgMonthlyExpenses > 0 ? Math.round((emergencyFund / avgMonthlyExpenses) * 10) / 10 : 0,
        monthlyTarget: Math.round(avgMonthlyExpenses * 100) / 100,
      },
      debtOverview: {
        totalDebt: Math.round(totalDebt * 100) / 100,
        debts: debtBreakdown,
        totalMonthlyEmi: debts.filter(d => d.status === 'ACTIVE').reduce((s, d) => s + parseFloat(d.monthlyEmi), 0),
      },
      insurance,
      protectionOverview: {
        billsPaidOnTime: billStats.total > 0 ? Math.round((billStats.paid / billStats.total) * 100) : 100,
        subscriptionLoadMonthly: subscriptionLoad,
        debtToIncomeRatio: monthlyIncome > 0 ? Math.round((totalDebt / (monthlyIncome * 12)) * 100) : 0,
        emergencyReadiness: emergencyTarget > 0 ? Math.round((emergencyFund / emergencyTarget) * 100) : 0,
        insuranceCoverage: `${activeInsuranceCount} / 4`,
        overallProtection: protectionScore.score,
      },
    };
  }

  // ══════════════════════════════════════════════
  // INTELLIGENCE TAB
  // ══════════════════════════════════════════════

  async getIntelligenceData(userId) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const threeMonthsAgo = new Date(now); threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const [currentAgg, prevAgg, monthTxns, goals, subscriptions, debts, streaks, challenges, reflection, threeMonthTxns] = await Promise.all([
      financeRepository.getMonthlyAggregates(userId, monthStart, monthEnd),
      financeRepository.getMonthlyAggregates(userId, new Date(now.getFullYear(), now.getMonth() - 1, 1), new Date(now.getFullYear(), now.getMonth(), 0)),
      financeRepository.getTransactionsByDateRange(userId, monthStart, monthEnd),
      financeRepository.getGoals(userId),
      financeRepository.getActiveSubscriptions(userId),
      financeRepository.getDebts(userId),
      financeRepository.getStreaks(userId),
      financeRepository.getActiveChallenges(userId),
      financeRepository.getReflectionByMonth(userId, this._currentMonth()),
      financeRepository.getTransactionsByDateRange(userId, threeMonthsAgo, now),
    ]);

    const monthlyIncome = currentAgg.income;
    const monthlyExpenses = currentAgg.expense;
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const prevSavings = prevAgg.income - prevAgg.expense;
    const avgMonthlyExpenses = threeMonthTxns.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + parseFloat(t.amount), 0) / 3;
    const totalDebt = debts.reduce((s, d) => s + parseFloat(d.totalAmount) - parseFloat(d.paidAmount), 0);
    const subscriptionLoad = subscriptions.reduce((s, sub) => s + parseFloat(sub.amount), 0);
    const emergencyGoal = goals.find(g => g.goalType === 'EMERGENCY');
    const emergencyFund = emergencyGoal ? parseFloat(emergencyGoal.currentAmount) : 0;

    const budgetSpending = await financeRepository.getBudgetSpending(userId, this._currentMonth());
    const budgetAdherence = budgetSpending.length > 0 ? (budgetSpending.filter(b => b.riskPercent <= 100).length / budgetSpending.length) * 100 : 100;

    const freedomScore = financeScoring.calculateFreedomScore({
      monthlyIncome, monthlyExpenses, totalDebt, emergencyFund, avgMonthlyExpenses, budgetAdherence,
    });

    // Spending review categories
    const expenseTxns = monthTxns.filter(t => t.type === 'EXPENSE');
    const totalSpent = expenseTxns.reduce((s, t) => s + parseFloat(t.amount), 0);
    const needsCategories = ['Bills & Utilities', 'Groceries', 'Transport', 'Health & Fitness', 'Rent', 'Insurance'];
    const savingsCategories = ['Investments', 'Savings'];
    const needs = expenseTxns.filter(t => needsCategories.includes(t.category)).reduce((s, t) => s + parseFloat(t.amount), 0);
    const savingsInvest = expenseTxns.filter(t => savingsCategories.includes(t.category)).reduce((s, t) => s + parseFloat(t.amount), 0);
    const wants = totalSpent - needs - savingsInvest;
    const waste = expenseTxns.filter(t => t.necessityLevel === 'WASTEFUL').reduce((s, t) => s + parseFloat(t.amount), 0);

    // Wealth growth potential (12 months projection)
    const wealthGrowthPotential = Math.round(monthlySavings * 12);

    // Life ROI
    let lifeROI = null;
    try { lifeROI = await lifeROIService.getLifeROI(userId); } catch { /* degrade */ }

    return {
      kpis: {
        financialHealthScore: freedomScore,
        monthlyOptimisation: { current: Math.max(0, Math.round(monthlySavings * 100) / 100), change: prevSavings > 0 ? Math.round(((monthlySavings - prevSavings) / prevSavings) * 1000) / 10 : 0 },
        wealthGrowthPotential: { amount: wealthGrowthPotential, period: '12 months' },
        moneyDiscipline: { label: budgetAdherence >= 80 ? 'Great' : budgetAdherence >= 50 ? 'Good' : 'Needs Work' },
        aiConfidence: { score: monthTxns.length >= 10 ? 92 : monthTxns.length >= 5 ? 75 : 50 },
      },
      spendingReview: {
        total: Math.round(totalSpent * 100) / 100,
        needs: { amount: Math.round(needs * 100) / 100, percentage: totalSpent > 0 ? Math.round((needs / totalSpent) * 1000) / 10 : 0 },
        wants: { amount: Math.round(wants * 100) / 100, percentage: totalSpent > 0 ? Math.round((wants / totalSpent) * 1000) / 10 : 0 },
        savingsInvest: { amount: Math.round(savingsInvest * 100) / 100, percentage: totalSpent > 0 ? Math.round((savingsInvest / totalSpent) * 1000) / 10 : 0 },
        waste: { amount: Math.round(waste * 100) / 100, percentage: totalSpent > 0 ? Math.round((waste / totalSpent) * 1000) / 10 : 0 },
      },
      challenges: challenges.slice(0, 3),
      streaks: this._formatStreaks(streaks),
      upgradeScore: financeScoring.calculateUpgradeScore(expenseTxns),
      monthlyReflection: reflection,
      lifeROI,
    };
  }

  // ══════════════════════════════════════════════
  // AI-POWERED ENDPOINTS
  // ══════════════════════════════════════════════

  async aiLogTransaction(userId, text) {
    const parsed = await financeAI.parseTransaction(text);
    if (!parsed) return null;
    return { ...parsed, _preview: true };
  }

  async generateCFOInsight(userId) {
    // Check 24h cache first
    const cached = await financeRepository.getLatestInsight(userId, 'cfo');
    if (cached && this._isWithin24Hours(cached.createdAt)) return cached.content;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [currentAgg, goals, subscriptions, debts, streaks, categoryBreakdown] = await Promise.all([
      financeRepository.getMonthlyAggregates(userId, monthStart, monthEnd),
      financeRepository.getGoals(userId),
      financeRepository.getActiveSubscriptions(userId),
      financeRepository.getDebts(userId),
      financeRepository.getStreaks(userId),
      financeRepository.getCategoryBreakdown(userId, monthStart, monthEnd),
    ]);

    const emergencyGoal = goals.find(g => g.goalType === 'EMERGENCY');
    const subscriptionLoad = await financeRepository.getMonthlySubscriptionLoad(userId);
    const totalDebt = debts.reduce((s, d) => s + parseFloat(d.totalAmount) - parseFloat(d.paidAmount), 0);
    const monthlySavings = currentAgg.income - currentAgg.expense;
    const savingsRate = currentAgg.income > 0 ? Math.round((monthlySavings / currentAgg.income) * 100) : 0;

    const budgetSpending = await financeRepository.getBudgetSpending(userId, this._currentMonth());
    const budgetAdherence = budgetSpending.length > 0 ? (budgetSpending.filter(b => b.riskPercent <= 100).length / budgetSpending.length) * 100 : 100;
    const freedomScore = financeScoring.calculateFreedomScore({
      monthlyIncome: currentAgg.income, monthlyExpenses: currentAgg.expense, totalDebt,
      emergencyFund: emergencyGoal ? parseFloat(emergencyGoal.currentAmount) : 0,
      avgMonthlyExpenses: currentAgg.expense, budgetAdherence,
    });

    const result = await financeAI.generateCFOInsight({
      monthlyIncome: currentAgg.income, monthlyExpenses: currentAgg.expense,
      monthlySavings, savingsRate,
      topCategories: categoryBreakdown.slice(0, 5).map(c => ({ name: c.category, amount: parseFloat(c._sum.amount) })),
      totalDebt, emergencyFund: emergencyGoal ? parseFloat(emergencyGoal.currentAmount) : 0,
      subscriptionCount: subscriptions.length, subscriptionLoad,
      freedomScore: freedomScore.score, goalCount: goals.length,
      streaks: streaks.map(s => ({ type: s.streakType, current: s.currentStreak })),
    });

    if (result) {
      await financeRepository.createInsight(userId, { type: 'cfo', content: result, priority: 'high' });
    }
    return result;
  }

  async getSpendPersonality(userId) {
    const cached = await financeRepository.getLatestInsight(userId, 'personality');
    if (cached && this._isWithin24Hours(cached.createdAt)) return cached.content;

    const now = new Date();
    const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const txns = await financeRepository.getTransactionsByDateRange(userId, thirtyDaysAgo, now);
    const result = await financeAI.analyzeSpendPersonality(txns);
    if (result) {
      await financeRepository.createInsight(userId, { type: 'personality', content: result, priority: 'medium' });
    }
    return result;
  }

  async getLeakAnalysis(userId) {
    const cached = await financeRepository.getLatestInsight(userId, 'leak');
    if (cached && this._isWithin24Hours(cached.createdAt)) return cached.content;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const txns = await financeRepository.getTransactionsByDateRange(userId, monthStart, now);
    const result = await financeAI.detectLeaks(txns);
    if (result) {
      await financeRepository.createInsight(userId, { type: 'leak', content: result, priority: 'high' });
    }
    return result;
  }

  async getSavingsOpportunities(userId) {
    const cached = await financeRepository.getLatestInsight(userId, 'savings');
    if (cached && this._isWithin24Hours(cached.createdAt)) return cached.content;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [currentAgg, categoryBreakdown, subscriptions, debts] = await Promise.all([
      financeRepository.getMonthlyAggregates(userId, monthStart, now),
      financeRepository.getCategoryBreakdown(userId, monthStart, now),
      financeRepository.getActiveSubscriptions(userId),
      financeRepository.getDebts(userId),
    ]);

    const subscriptionLoad = await financeRepository.getMonthlySubscriptionLoad(userId);
    const cats = Object.fromEntries(categoryBreakdown.map(c => [c.category, parseFloat(c._sum.amount)]));

    const result = await financeAI.findSavingsOpportunities({
      monthlyIncome: currentAgg.income, monthlyExpenses: currentAgg.expense,
      topCategories: categoryBreakdown.slice(0, 5).map(c => ({ name: c.category, amount: parseFloat(c._sum.amount) })),
      subscriptionCount: subscriptions.length, subscriptionLoad,
      foodSpending: cats['Food & Dining'] || 0, shoppingSpending: cats['Shopping'] || 0,
      emiPayments: debts.reduce((s, d) => s + parseFloat(d.monthlyEmi), 0),
    });

    if (result) {
      await financeRepository.createInsight(userId, { type: 'savings', content: result, priority: 'high' });
    }
    return result;
  }

  async getWeeklyChallenges(userId) {
    const now = new Date();
    const weekStart = this._getWeekStart(now);
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6);

    let challenges = await financeRepository.getChallengesByWeek(userId, weekStart);
    if (challenges.length > 0) return challenges;

    // Generate new challenges for this week
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [currentAgg, categoryBreakdown] = await Promise.all([
      financeRepository.getMonthlyAggregates(userId, monthStart, now),
      financeRepository.getCategoryBreakdown(userId, monthStart, now),
    ]);

    const dayOfMonth = now.getDate();
    const avgDailySpend = dayOfMonth > 0 ? currentAgg.expense / dayOfMonth : 0;
    const topCategory = categoryBreakdown[0]?.category || 'Food & Dining';
    const savingsRate = currentAgg.income > 0 ? Math.round(((currentAgg.income - currentAgg.expense) / currentAgg.income) * 100) : 0;

    const aiChallenges = await financeAI.generateWeeklyChallenges({
      avgDailySpend: Math.round(avgDailySpend * 100) / 100,
      topCategory, savingsRate,
      weakness: topCategory,
    });

    if (aiChallenges?.challenges) {
      for (const c of aiChallenges.challenges) {
        await financeRepository.createChallenge(userId, {
          title: c.title, description: c.description,
          xpReward: c.xpReward || 50, target: c.target || 1,
          weekStart, weekEnd,
        });
      }
      challenges = await financeRepository.getChallengesByWeek(userId, weekStart);
    }
    return challenges;
  }

  async getWealthPlan(userId) {
    const cached = await financeRepository.getLatestInsight(userId, 'wealth_plan');
    if (cached && this._isWithin24Hours(cached.createdAt)) return cached.content;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [currentAgg, goals, subscriptions, debts] = await Promise.all([
      financeRepository.getMonthlyAggregates(userId, monthStart, now),
      financeRepository.getGoals(userId),
      financeRepository.getActiveSubscriptions(userId),
      financeRepository.getDebts(userId),
    ]);

    const emergencyGoal = goals.find(g => g.goalType === 'EMERGENCY');
    const subscriptionLoad = await financeRepository.getMonthlySubscriptionLoad(userId);
    const totalDebt = debts.reduce((s, d) => s + parseFloat(d.totalAmount) - parseFloat(d.paidAmount), 0);
    const budgetSpending = await financeRepository.getBudgetSpending(userId, this._currentMonth());
    const budgetAdherence = budgetSpending.length > 0 ? (budgetSpending.filter(b => b.riskPercent <= 100).length / budgetSpending.length) * 100 : 100;

    const freedomScore = financeScoring.calculateFreedomScore({
      monthlyIncome: currentAgg.income, monthlyExpenses: currentAgg.expense,
      totalDebt, emergencyFund: emergencyGoal ? parseFloat(emergencyGoal.currentAmount) : 0,
      avgMonthlyExpenses: currentAgg.expense, budgetAdherence,
    });

    const result = await financeAI.generateWealthPlan({
      monthlyIncome: currentAgg.income, monthlyExpenses: currentAgg.expense,
      monthlySavings: currentAgg.income - currentAgg.expense,
      emergencyFund: emergencyGoal ? parseFloat(emergencyGoal.currentAmount) : 0,
      totalDebt, subscriptionCount: subscriptions.length, subscriptionLoad,
      goals: goals.slice(0, 5).map(g => ({ title: g.title, target: parseFloat(g.targetAmount), current: parseFloat(g.currentAmount) })),
      freedomScore: freedomScore.score,
    });

    if (result) {
      await financeRepository.createInsight(userId, { type: 'wealth_plan', content: result, priority: 'high' });
    }
    return result;
  }

  async getRiskAlerts(userId) {
    const cached = await financeRepository.getLatestInsight(userId, 'risk');
    if (cached && this._isWithin24Hours(cached.createdAt)) return cached.content;

    const protectData = await this.getProtectData(userId);
    const result = await financeAI.generateRiskAlerts({
      emergencyFund: protectData.emergencyFundPlanner.current,
      emergencyMonths: protectData.emergencyFundPlanner.monthsCovered,
      totalDebt: protectData.debtOverview.totalDebt,
      monthlyIncome: protectData.kpis.totalMonthlyObligations.current / (protectData.kpis.totalMonthlyObligations.percentOfIncome / 100 || 1),
      dtiRatio: protectData.protectionOverview.debtToIncomeRatio,
      insuranceCount: protectData.insurance.filter(i => i.status === 'ACTIVE').length,
      subscriptionLoad: protectData.kpis.activeSubscriptions.load,
      overdueCount: protectData.bills.filter(b => b.status === 'OVERDUE').length,
    });

    if (result) {
      await financeRepository.createInsight(userId, { type: 'risk', content: result, priority: 'high' });
    }
    return result;
  }

  // ══════════════════════════════════════════════
  // CRUD OPERATIONS
  // ══════════════════════════════════════════════

  async createTransaction(userId, data) {
    const txn = await financeRepository.createTransaction(userId, data);
    await financeXP.awardTransactionXp(userId);
    await financeRepository.incrementStreak(userId, 'logging');
    // Check subscription candidacy
    if (data.merchant) this._checkSubscriptionCandidate(userId, data.merchant, parseFloat(data.amount)).catch(() => {});
    return txn;
  }

  async updateTransaction(userId, id, data) {
    const txn = await financeRepository.getTransactionById(id);
    if (!txn || txn.userId !== userId) throw new Error('Transaction not found');
    return financeRepository.updateTransaction(id, data);
  }

  async deleteTransaction(userId, id) {
    const txn = await financeRepository.getTransactionById(id);
    if (!txn || txn.userId !== userId) throw new Error('Transaction not found');
    return financeRepository.deleteTransaction(id);
  }

  async getTransactions(userId, filters, page, limit) {
    return financeRepository.getTransactions(userId, filters, page, limit);
  }

  async getAccounts(userId) { return financeRepository.getAccounts(userId); }
  async createAccount(userId, data) { return financeRepository.createAccount(userId, data); }
  async updateAccount(userId, id, data) { return financeRepository.updateAccount(id, data); }

  async getBudgets(userId, month) { return financeRepository.getBudgetSpending(userId, month || this._currentMonth()); }
  async createBudget(userId, data) { return financeRepository.createBudget(userId, data); }
  async updateBudget(userId, id, data) { return financeRepository.updateBudget(id, data); }
  async deleteBudget(userId, id) { return financeRepository.deleteBudget(id); }

  async getGoals(userId) { return financeRepository.getGoals(userId); }
  async createGoal(userId, data) {
    if (data.deadline) data.deadline = new Date(data.deadline);
    return financeRepository.createGoal(userId, data);
  }
  async updateGoal(userId, id, data) {
    if (data.deadline) data.deadline = new Date(data.deadline);
    return financeRepository.updateGoal(id, data);
  }
  async deleteGoal(userId, id) { return financeRepository.deleteGoal(id); }
  async contributeToGoal(userId, id, amount) {
    const goal = await financeRepository.contributeToGoal(id, amount);
    if (goal) {
      await financeXP.awardSavingsXp(userId);
      await financeRepository.incrementStreak(userId, 'savings');
      if (goal.isCompleted) await financeXP.awardGoalXp(userId);
    }
    return goal;
  }

  async getSubscriptions(userId) { return financeRepository.getSubscriptions(userId); }
  async createSubscription(userId, data) {
    if (data.nextRenewal) data.nextRenewal = new Date(data.nextRenewal);
    return financeRepository.createSubscription(userId, data);
  }
  async deleteSubscription(userId, id) { return financeRepository.deleteSubscription(id); }

  async getDebts(userId) { return financeRepository.getDebts(userId); }
  async createDebt(userId, data) { return financeRepository.createDebt(userId, data); }
  async updateDebt(userId, id, data) { return financeRepository.updateDebt(id, data); }

  async getBills(userId) { return financeRepository.getBills(userId); }
  async createBill(userId, data) { return financeRepository.createBill(userId, data); }
  async payBill(userId, id) { return financeRepository.payBill(id); }

  async getInsurance(userId) { return financeRepository.getInsurance(userId); }
  async createInsurance(userId, data) { return financeRepository.createInsurance(userId, data); }

  async getStreaks(userId) { return this._formatStreaks(await financeRepository.getStreaks(userId)); }

  async createReflection(userId, data) {
    const result = await financeRepository.upsertReflection(userId, data);
    await financeXP.awardReflectionXp(userId);
    return result;
  }

  async getCategories(userId) {
    await financeRepository.ensureDefaultCategories(userId);
    return financeRepository.getCategories(userId);
  }
  async createCategory(userId, data) { return financeRepository.createCategory(userId, data); }

  // ══════════════════════════════════════════════
  // SUBSCRIPTION DETECTION
  // ══════════════════════════════════════════════

  async _checkSubscriptionCandidate(userId, merchant, amount) {
    const candidates = await financeRepository.findSubscriptionCandidates(userId);
    const match = candidates.find(c => c.merchant === merchant && parseFloat(c.amount) === amount);
    if (match && match._count >= 2) {
      const existing = await financeRepository.db.subscription.findFirst({
        where: { userId, merchant, amount },
      });
      if (!existing) {
        await financeRepository.createSubscription(userId, {
          merchant, amount, cycle: 'MONTHLY', isDetected: true,
          category: 'Subscription', status: 'ACTIVE',
        });
      }
    }
  }

  // ══════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════

  _currentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  _isWithin24Hours(date) {
    return (Date.now() - new Date(date).getTime()) < 24 * 60 * 60 * 1000;
  }

  _getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    d.setHours(0, 0, 0, 0);
    return d;
  }

  _formatStreaks(streaks) {
    const types = ['no_spend', 'savings', 'budget', 'logging'];
    const map = {};
    for (const s of streaks) map[s.streakType] = s;
    return types.map(type => ({
      type,
      current: map[type]?.currentStreak || 0,
      best: map[type]?.bestStreak || 0,
      lastUpdated: map[type]?.lastUpdated || null,
    }));
  }

  _buildWealthAllocation(accounts, totalDebt) {
    const groups = { cash: 0, savings: 0, investment: 0, debt: 0 };
    for (const a of accounts) {
      const bal = Math.abs(parseFloat(a.balance));
      if (groups[a.type] !== undefined) groups[a.type] += bal;
    }
    groups.debt += totalDebt;
    const total = Object.values(groups).reduce((s, v) => s + v, 0);
    return Object.entries(groups).map(([type, amount]) => ({
      type, amount: Math.round(amount * 100) / 100,
      percentage: total > 0 ? Math.round((amount / total) * 1000) / 10 : 0,
    }));
  }

  _buildWealthBuckets(accounts, categories, total) {
    const buckets = { Needs: 0, Savings: 0, Investments: 0, Learning: 0, Fun: 0 };
    for (const c of categories) {
      const amt = parseFloat(c._sum.amount);
      const cat = c.category;
      if (['Bills & Utilities', 'Groceries', 'Transport', 'Rent', 'Insurance'].includes(cat)) buckets.Needs += amt;
      else if (['Investments'].includes(cat)) buckets.Investments += amt;
      else if (['Learning', 'Education', 'Books', 'Courses'].includes(cat)) buckets.Learning += amt;
      else if (['Entertainment', 'Travel', 'Personal Care', 'Gifts'].includes(cat)) buckets.Fun += amt;
    }
    const savingsAccounts = accounts.filter(a => a.type === 'savings');
    buckets.Savings = savingsAccounts.reduce((s, a) => s + parseFloat(a.balance), 0);

    const investmentAccounts = accounts.filter(a => a.type === 'investment');
    buckets.Investments += investmentAccounts.reduce((s, a) => s + parseFloat(a.balance), 0);

    const bucketTotal = Object.values(buckets).reduce((s, v) => s + v, 0);
    return Object.entries(buckets).map(([name, amount]) => ({
      name, amount: Math.round(amount * 100) / 100,
      percentage: bucketTotal > 0 ? Math.round((amount / bucketTotal) * 1000) / 10 : 0,
    }));
  }

  _buildMonthlyTrend(transactions) {
    const months = {};
    for (const t of transactions) {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!months[key]) months[key] = { month: key, income: 0, expenses: 0, savings: 0 };
      const amt = parseFloat(t.amount);
      if (t.type === 'INCOME') months[key].income += amt;
      else months[key].expenses += amt;
    }
    return Object.values(months).map(m => ({
      ...m,
      savings: Math.round((m.income - m.expenses) * 100) / 100,
      income: Math.round(m.income * 100) / 100,
      expenses: Math.round(m.expenses * 100) / 100,
      savingsRate: m.income > 0 ? Math.round(((m.income - m.expenses) / m.income) * 100) : 0,
    })).sort((a, b) => a.month.localeCompare(b.month));
  }

  _buildContributionCalendar(transactions) {
    const days = {};
    for (const t of transactions) {
      if (t.type === 'TRANSFER' && (t.category === 'Savings & Investments' || t.category === 'Investment' || t.category === 'Savings' || t.category === 'Goal Contribution')) {
        const key = new Date(t.date).toISOString().split('T')[0];
        if (!days[key]) days[key] = { amount: 0, details: [] };
        days[key].amount += parseFloat(t.amount);
        days[key].details.push(t.merchant || 'Savings');
      }
    }
    return Object.entries(days).map(([date, data]) => ({
      date, 
      amount: Math.round(data.amount * 100) / 100,
      label: Array.from(new Set(data.details)).join(' & '),
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  _isGoalOnTrack(goal) {
    if (!goal.deadline) return true;
    const now = new Date();
    const created = new Date(goal.createdAt);
    const deadline = new Date(goal.deadline);
    const totalDays = (deadline - created) / (1000 * 60 * 60 * 24);
    const elapsedDays = (now - created) / (1000 * 60 * 60 * 24);
    const expectedProgress = totalDays > 0 ? (elapsedDays / totalDays) * 100 : 100;
    const actualProgress = parseFloat(goal.targetAmount) > 0 ? (parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100 : 0;
    return actualProgress >= expectedProgress * 0.8;
  }

  async aiChat(userId, message) {
    const [overview, spend, goals] = await Promise.all([
      this.getOverview(userId),
      this.getSpendData(userId),
      financeRepository.getGoals(userId)
    ]);
    
    // simplify context to avoid massive token payload
    const miniContext = {
      income: overview.cashFlow?.income || 0,
      expenses: overview.cashFlow?.expenses || 0,
      savings: overview.cashFlow?.savings || 0,
      netWorth: overview.kpis?.netWorth?.current || 0,
      freedomScore: overview.kpis?.freedomScore || 0,
      budgetHealth: spend.kpis?.budgetHealth?.score || 0,
      spendingBreakdown: spend.spendingBreakdown || [],
      goals: goals?.map(g => ({ title: g.title, target: g.targetAmount, current: g.currentAmount })) || [],
    };
    const response = await financeAI.chat(miniContext, message);
    return { response };
  }
}

export const financeService = new FinanceService();
