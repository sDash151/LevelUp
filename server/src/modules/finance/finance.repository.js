import { prisma } from '../../config/database.js';

class FinanceRepository {
  get db() { return prisma; }

  // ══════════════════════════════════════════════
  // TRANSACTIONS
  // ══════════════════════════════════════════════

  async getTransactions(userId, filters = {}, page = 1, limit = 20) {
    const where = { userId };
    if (filters.type) where.type = filters.type;
    if (filters.category) where.category = filters.category;
    if (filters.merchant) where.merchant = { contains: filters.merchant, mode: 'insensitive' };
    if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod;
    if (filters.mood) where.mood = filters.mood;
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = new Date(filters.startDate);
      if (filters.endDate) where.date.lte = new Date(filters.endDate);
    }
    if (filters.search) {
      where.OR = [
        { merchant: { contains: filters.search, mode: 'insensitive' } },
        { category: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { note: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const orderMap = {
      latest: { date: 'desc' },
      oldest: { date: 'asc' },
      highest: { amount: 'desc' },
      lowest: { amount: 'asc' },
    };
    const orderBy = orderMap[filters.sort] || { date: 'desc' };

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where, orderBy, skip: (page - 1) * limit, take: limit,
        include: { account: { select: { name: true, type: true } } },
      }),
      prisma.transaction.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getTransactionById(id) {
    return prisma.transaction.findUnique({ where: { id } });
  }

  async createTransaction(userId, data) {
    return prisma.transaction.create({
      data: { ...data, date: new Date(data.date), userId },
    });
  }

  async updateTransaction(id, data) {
    const processed = { ...data };
    if (data.date) processed.date = new Date(data.date);
    return prisma.transaction.update({ where: { id }, data: processed });
  }

  async deleteTransaction(id) {
    return prisma.transaction.delete({ where: { id } });
  }

  async getTransactionsByDateRange(userId, startDate, endDate, type) {
    const where = { userId, date: { gte: startDate, lte: endDate } };
    if (type) where.type = type;
    return prisma.transaction.findMany({ where, orderBy: { date: 'desc' } });
  }

  async getMonthlyAggregates(userId, startDate, endDate) {
    const [income, expense] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: 'INCOME', date: { gte: startDate, lte: endDate } },
        _sum: { amount: true }, _count: true,
      }),
      prisma.transaction.aggregate({
        where: { userId, type: 'EXPENSE', date: { gte: startDate, lte: endDate } },
        _sum: { amount: true }, _count: true,
      }),
    ]);
    return {
      income: parseFloat(income._sum.amount || 0),
      expense: parseFloat(expense._sum.amount || 0),
      incomeCount: income._count,
      expenseCount: expense._count,
    };
  }

  async getCategoryBreakdown(userId, startDate, endDate, type = 'EXPENSE') {
    return prisma.transaction.groupBy({
      by: ['category'],
      where: { userId, type, date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
    });
  }

  async getMerchantBreakdown(userId, startDate, endDate) {
    return prisma.transaction.groupBy({
      by: ['merchant'],
      where: { userId, type: 'EXPENSE', date: { gte: startDate, lte: endDate }, merchant: { not: null } },
      _sum: { amount: true },
      _count: true,
      orderBy: { _count: { merchant: 'desc' } },
      take: 20,
    });
  }

  async getMoodBreakdown(userId, startDate, endDate) {
    return prisma.transaction.groupBy({
      by: ['mood'],
      where: { userId, type: 'EXPENSE', date: { gte: startDate, lte: endDate }, mood: { not: null } },
      _sum: { amount: true },
      _count: true,
    });
  }

  async getDetailedMoodAnalytics(userId, startDate, endDate) {
    // Group by Mood and Category
    const byCategory = await prisma.transaction.groupBy({
      by: ['mood', 'category'],
      where: { userId, type: 'EXPENSE', date: { gte: startDate, lte: endDate }, mood: { not: null } },
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } }
    });

    // Group by Mood and Merchant
    const byMerchant = await prisma.transaction.groupBy({
      by: ['mood', 'merchant'],
      where: { userId, type: 'EXPENSE', date: { gte: startDate, lte: endDate }, mood: { not: null }, merchant: { not: null } },
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } }
    });

    return { byCategory, byMerchant };
  }

  async getWeeklyAggregates(userId, startDate, endDate) {
    const txns = await prisma.transaction.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'asc' },
    });
    const weeks = {};
    for (const t of txns) {
      const d = new Date(t.date);
      const weekStart = new Date(d);
      const day = weekStart.getDay();
      weekStart.setDate(weekStart.getDate() - (day === 0 ? 6 : day - 1));
      const key = weekStart.toISOString().split('T')[0];
      if (!weeks[key]) weeks[key] = { week: key, income: 0, expenses: 0, savings: 0 };
      const amt = parseFloat(t.amount);
      if (t.type === 'INCOME') weeks[key].income += amt;
      else if (t.type === 'EXPENSE') weeks[key].expenses += amt;
    }
    return Object.values(weeks).map(w => ({
      ...w,
      savings: Math.round((w.income - w.expenses) * 100) / 100,
      income: Math.round(w.income * 100) / 100,
      expenses: Math.round(w.expenses * 100) / 100,
    })).sort((a, b) => a.week.localeCompare(b.week));
  }

  async getDailySpending(userId, startDate, endDate) {
    const txns = await prisma.transaction.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'asc' },
    });
    const days = {};
    for (const t of txns) {
      const key = new Date(t.date).toISOString().split('T')[0];
      if (!days[key]) days[key] = { date: key, income: 0, expenses: 0, savings: 0 };
      const amt = parseFloat(t.amount);
      if (t.type === 'INCOME') days[key].income += amt;
      else days[key].expenses += amt;
    }
    return Object.values(days).map(d => ({
      ...d,
      savings: Math.round((d.income - d.expenses) * 100) / 100,
      income: Math.round(d.income * 100) / 100,
      expenses: Math.round(d.expenses * 100) / 100,
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  async findSubscriptionCandidates(userId) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return prisma.transaction.groupBy({
      by: ['merchant', 'amount'],
      where: {
        userId, type: 'EXPENSE', merchant: { not: null },
        date: { gte: sixMonthsAgo },
      },
      _count: true,
      having: { merchant: { _count: { gte: 2 } } },
      orderBy: { _count: { merchant: 'desc' } },
    });
  }

  async getTransactionCount(userId, startDate, endDate) {
    return prisma.transaction.count({
      where: { userId, date: { gte: startDate, lte: endDate } },
    });
  }

  // ══════════════════════════════════════════════
  // FINANCE ACCOUNTS
  // ══════════════════════════════════════════════

  async getAccounts(userId) {
    return prisma.financeAccount.findMany({
      where: { userId }, orderBy: { createdAt: 'asc' },
    });
  }

  async createAccount(userId, data) {
    return prisma.financeAccount.create({ data: { ...data, userId } });
  }

  async updateAccount(id, data) {
    return prisma.financeAccount.update({ where: { id }, data });
  }

  async deleteAccount(id) {
    return prisma.financeAccount.delete({ where: { id } });
  }

  async getNetWorth(userId) {
    const accounts = await prisma.financeAccount.findMany({
      where: { userId, includeInNetWorth: true },
    });
    let assets = 0, liabilities = 0;
    for (const a of accounts) {
      const bal = parseFloat(a.balance);
      if (a.type === 'debt') liabilities += Math.abs(bal);
      else assets += bal;
    }
    const debts = await prisma.debt.findMany({ where: { userId, status: 'ACTIVE' } });
    for (const d of debts) liabilities += parseFloat(d.totalAmount) - parseFloat(d.paidAmount);
    return { assets: Math.round(assets * 100) / 100, liabilities: Math.round(liabilities * 100) / 100, netWorth: Math.round((assets - liabilities) * 100) / 100 };
  }

  // ══════════════════════════════════════════════
  // FINANCE CATEGORIES
  // ══════════════════════════════════════════════

  async getCategories(userId) {
    return prisma.financeCategory.findMany({
      where: { userId }, orderBy: { name: 'asc' },
      include: { budgets: true },
    });
  }

  async createCategory(userId, data) {
    return prisma.financeCategory.upsert({
      where: { userId_name_type: { userId, name: data.name, type: data.type } },
      create: { ...data, userId },
      update: data,
    });
  }

  async ensureDefaultCategories(userId) {
    const defaults = [
      { name: 'Food & Dining', icon: '🍔', color: '#F59E0B', type: 'expense' },
      { name: 'Shopping', icon: '🛍️', color: '#EC4899', type: 'expense' },
      { name: 'Transport', icon: '🚗', color: '#3B82F6', type: 'expense' },
      { name: 'Health & Fitness', icon: '💪', color: '#10B981', type: 'expense' },
      { name: 'Learning', icon: '📚', color: '#8B5CF6', type: 'expense' },
      { name: 'Entertainment', icon: '🎬', color: '#F97316', type: 'expense' },
      { name: 'Bills & Utilities', icon: '💡', color: '#6366F1', type: 'expense' },
      { name: 'Groceries', icon: '🛒', color: '#14B8A6', type: 'expense' },
      { name: 'Investments', icon: '📈', color: '#22C55E', type: 'expense' },
      { name: 'Salary', icon: '💰', color: '#22C55E', type: 'income' },
      { name: 'Freelance', icon: '💼', color: '#F59E0B', type: 'income' },
      { name: 'Interest', icon: '🏦', color: '#3B82F6', type: 'income' },
    ];
    for (const cat of defaults) {
      await prisma.financeCategory.upsert({
        where: { userId_name_type: { userId, name: cat.name, type: cat.type } },
        create: { ...cat, userId, isSystem: true },
        update: {},
      });
    }
  }

  // ══════════════════════════════════════════════
  // BUDGETS
  // ══════════════════════════════════════════════

  async getBudgets(userId, month) {
    const where = { userId };
    if (month) where.month = month;
    return prisma.budget.findMany({
      where, include: { category: true }, orderBy: { createdAt: 'asc' },
    });
  }

  async createBudget(userId, data) {
    return prisma.budget.upsert({
      where: { userId_categoryId_month: { userId, categoryId: data.categoryId, month: data.month } },
      create: { ...data, userId },
      update: { monthlyLimit: data.monthlyLimit },
    });
  }

  async updateBudget(id, data) {
    return prisma.budget.update({ where: { id }, data });
  }

  async deleteBudget(id) {
    return prisma.budget.delete({ where: { id } });
  }

  async getBudgetSpending(userId, month) {
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const budgets = await prisma.budget.findMany({
      where: { userId, month },
      include: { category: true },
    });

    const spending = await prisma.transaction.groupBy({
      by: ['category'],
      where: { userId, type: 'EXPENSE', date: { gte: startDate, lt: endDate } },
      _sum: { amount: true },
    });

    const spendMap = {};
    for (const s of spending) spendMap[s.category] = parseFloat(s._sum.amount || 0);

    return budgets.map(b => {
      const limit = parseFloat(b.monthlyLimit);
      const spent = spendMap[b.category?.name] || 0;
      return {
        id: b.id,
        category: b.category,
        monthlyLimit: limit,
        spent: Math.round(spent * 100) / 100,
        remaining: Math.round((limit - spent) * 100) / 100,
        riskPercent: limit > 0 ? Math.round((spent / limit) * 100) : 0,
      };
    });
  }

  // ══════════════════════════════════════════════
  // FINANCE GOALS
  // ══════════════════════════════════════════════

  async getGoals(userId) {
    return prisma.financeGoal.findMany({
      where: { userId }, orderBy: [{ isCompleted: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async getGoalById(id) {
    return prisma.financeGoal.findUnique({ where: { id } });
  }

  async createGoal(userId, data) {
    return prisma.financeGoal.create({ data: { ...data, userId } });
  }

  async updateGoal(id, data) {
    return prisma.financeGoal.update({ where: { id }, data });
  }

  async contributeToGoal(id, amount) {
    const goal = await prisma.financeGoal.findUnique({ where: { id } });
    if (!goal) return null;
    const newAmount = parseFloat(goal.currentAmount) + amount;
    const isCompleted = newAmount >= parseFloat(goal.targetAmount);
    
    return prisma.$transaction(async (tx) => {
      const updatedGoal = await tx.financeGoal.update({
        where: { id },
        data: {
          currentAmount: newAmount,
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
      });

      await tx.transaction.create({
        data: {
          userId: goal.userId,
          type: 'TRANSFER',
          amount,
          category: 'Savings & Investments',
          merchant: goal.title,
          description: `Contribution to ${goal.title}`,
          date: new Date(),
        }
      });

      return updatedGoal;
    });
  }

  async deleteGoal(id) {
    return prisma.financeGoal.delete({ where: { id } });
  }

  // ══════════════════════════════════════════════
  // SUBSCRIPTIONS
  // ══════════════════════════════════════════════

  async getSubscriptions(userId) {
    return prisma.subscription.findMany({
      where: { userId }, orderBy: { nextRenewal: 'asc' },
    });
  }

  async getActiveSubscriptions(userId) {
    return prisma.subscription.findMany({
      where: { userId, status: 'ACTIVE' }, orderBy: { nextRenewal: 'asc' },
    });
  }

  async createSubscription(userId, data) {
    return prisma.subscription.create({ data: { ...data, userId } });
  }

  async updateSubscription(id, data) {
    return prisma.subscription.update({ where: { id }, data });
  }

  async deleteSubscription(id) {
    return prisma.subscription.delete({ where: { id } });
  }

  async getMonthlySubscriptionLoad(userId) {
    const subs = await this.getActiveSubscriptions(userId);
    let monthly = 0;
    for (const s of subs) {
      const amt = parseFloat(s.amount);
      if (s.cycle === 'WEEKLY') monthly += amt * 4;
      else if (s.cycle === 'MONTHLY') monthly += amt;
      else if (s.cycle === 'QUARTERLY') monthly += amt / 3;
      else if (s.cycle === 'YEARLY') monthly += amt / 12;
    }
    return Math.round(monthly * 100) / 100;
  }

  // ══════════════════════════════════════════════
  // DEBTS
  // ══════════════════════════════════════════════

  async getDebts(userId) {
    return prisma.debt.findMany({
      where: { userId }, orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async createDebt(userId, data) {
    return prisma.debt.create({ data: { ...data, userId } });
  }

  async updateDebt(id, data) {
    return prisma.debt.update({ where: { id }, data });
  }

  async deleteDebt(id) {
    return prisma.debt.delete({ where: { id } });
  }

  async getTotalDebt(userId) {
    const debts = await prisma.debt.findMany({ where: { userId, status: 'ACTIVE' } });
    return debts.reduce((sum, d) => sum + parseFloat(d.totalAmount) - parseFloat(d.paidAmount), 0);
  }

  async getTotalMonthlyEmi(userId) {
    const debts = await prisma.debt.findMany({ where: { userId, status: 'ACTIVE' } });
    return debts.reduce((sum, d) => sum + parseFloat(d.monthlyEmi), 0);
  }

  // ══════════════════════════════════════════════
  // INSURANCE
  // ══════════════════════════════════════════════

  async getInsurance(userId) {
    return prisma.insurance.findMany({
      where: { userId }, orderBy: { expiryDate: 'asc' },
    });
  }

  async createInsurance(userId, data) {
    return prisma.insurance.create({
      data: { ...data, expiryDate: new Date(data.expiryDate), userId },
    });
  }

  async updateInsurance(id, data) {
    if (data.expiryDate) data.expiryDate = new Date(data.expiryDate);
    return prisma.insurance.update({ where: { id }, data });
  }

  async deleteInsurance(id) {
    return prisma.insurance.delete({ where: { id } });
  }

  async getActiveInsuranceCount(userId) {
    return prisma.insurance.count({ where: { userId, status: 'ACTIVE' } });
  }

  // ══════════════════════════════════════════════
  // BILLS
  // ══════════════════════════════════════════════

  async getBills(userId) {
    return prisma.bill.findMany({
      where: { userId }, orderBy: { dueDate: 'asc' },
    });
  }

  async getUpcomingBills(userId, limit = 10) {
    return prisma.bill.findMany({
      where: { userId, status: 'UPCOMING', dueDate: { gte: new Date() } },
      orderBy: { dueDate: 'asc' },
      take: limit,
    });
  }

  async createBill(userId, data) {
    return prisma.bill.create({
      data: { ...data, dueDate: new Date(data.dueDate), userId },
    });
  }

  async updateBill(id, data) {
    if (data.dueDate) data.dueDate = new Date(data.dueDate);
    return prisma.bill.update({ where: { id }, data });
  }

  async payBill(id) {
    return prisma.bill.update({
      where: { id },
      data: { status: 'PAID', paidAt: new Date() },
    });
  }

  async deleteBill(id) {
    return prisma.bill.delete({ where: { id } });
  }

  async getBillsPaidCount(userId, startDate, endDate) {
    const [paid, total] = await Promise.all([
      prisma.bill.count({ where: { userId, status: 'PAID', paidAt: { gte: startDate, lte: endDate } } }),
      prisma.bill.count({ where: { userId, dueDate: { gte: startDate, lte: endDate } } }),
    ]);
    return { paid, total };
  }

  // ══════════════════════════════════════════════
  // MONEY STREAKS
  // ══════════════════════════════════════════════

  async getStreaks(userId) {
    return prisma.moneyStreak.findMany({ where: { userId } });
  }

  async upsertStreak(userId, streakType, currentStreak, bestStreak) {
    return prisma.moneyStreak.upsert({
      where: { userId_streakType: { userId, streakType } },
      create: { userId, streakType, currentStreak, bestStreak, lastUpdated: new Date() },
      update: { currentStreak, bestStreak: { set: bestStreak }, lastUpdated: new Date() },
    });
  }

  async incrementStreak(userId, streakType) {
    const existing = await prisma.moneyStreak.findUnique({
      where: { userId_streakType: { userId, streakType } },
    });
    const current = (existing?.currentStreak || 0) + 1;
    const best = Math.max(current, existing?.bestStreak || 0);
    return this.upsertStreak(userId, streakType, current, best);
  }

  async resetStreak(userId, streakType) {
    const existing = await prisma.moneyStreak.findUnique({
      where: { userId_streakType: { userId, streakType } },
    });
    return this.upsertStreak(userId, streakType, 0, existing?.bestStreak || 0);
  }

  // ══════════════════════════════════════════════
  // MONTHLY REFLECTIONS
  // ══════════════════════════════════════════════

  async getReflections(userId) {
    return prisma.monthlyReflection.findMany({
      where: { userId }, orderBy: { month: 'desc' },
    });
  }

  async getReflectionByMonth(userId, month) {
    return prisma.monthlyReflection.findUnique({
      where: { userId_month: { userId, month } },
    });
  }

  async upsertReflection(userId, data) {
    return prisma.monthlyReflection.upsert({
      where: { userId_month: { userId, month: data.month } },
      create: { ...data, userId },
      update: { whatWentWell: data.whatWentWell, unnecessarySpending: data.unnecessarySpending, improvementPlan: data.improvementPlan },
    });
  }

  // ══════════════════════════════════════════════
  // AI FINANCE INSIGHTS
  // ══════════════════════════════════════════════

  async createInsight(userId, data) {
    return prisma.aIFinanceInsight.create({ data: { ...data, userId } });
  }

  async getInsights(userId, type, limit = 10) {
    const where = { userId };
    if (type) where.type = type;
    return prisma.aIFinanceInsight.findMany({
      where, orderBy: { createdAt: 'desc' }, take: limit,
    });
  }

  async getLatestInsight(userId, type) {
    return prisma.aIFinanceInsight.findFirst({
      where: { userId, type }, orderBy: { createdAt: 'desc' },
    });
  }

  async markInsightRead(id) {
    return prisma.aIFinanceInsight.update({ where: { id }, data: { isRead: true } });
  }

  // ══════════════════════════════════════════════
  // WEEKLY FINANCE CHALLENGES
  // ══════════════════════════════════════════════

  async getActiveChallenges(userId) {
    const now = new Date();
    return prisma.weeklyFinanceChallenge.findMany({
      where: { userId, weekEnd: { gte: now } },
      orderBy: { weekStart: 'desc' },
    });
  }

  async getChallengesByWeek(userId, weekStart) {
    return prisma.weeklyFinanceChallenge.findMany({
      where: { userId, weekStart },
    });
  }

  async createChallenge(userId, data) {
    return prisma.weeklyFinanceChallenge.create({ data: { ...data, userId } });
  }

  async updateChallengeProgress(id, progress) {
    const challenge = await prisma.weeklyFinanceChallenge.findUnique({ where: { id } });
    if (!challenge) return null;
    const isCompleted = progress >= challenge.target;
    return prisma.weeklyFinanceChallenge.update({
      where: { id },
      data: {
        progress,
        isCompleted,
        completedAt: isCompleted && !challenge.isCompleted ? new Date() : challenge.completedAt,
      },
    });
  }

  // ══════════════════════════════════════════════
  // UNIFIED OBLIGATIONS ENGINE
  // ══════════════════════════════════════════════

  async getMonthlyObligations(userId) {
    const now = new Date();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [bills, subscriptions, debts] = await Promise.all([
      prisma.bill.findMany({
        where: { userId, status: 'UPCOMING', dueDate: { gte: now, lte: monthEnd } },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.subscription.findMany({
        where: { userId, status: 'ACTIVE', nextRenewal: { gte: now, lte: monthEnd } },
        orderBy: { nextRenewal: 'asc' },
      }),
      prisma.debt.findMany({
        where: { userId, status: 'ACTIVE' },
        orderBy: { dueDay: 'asc' },
      }),
    ]);

    const obligations = [
      ...bills.map(b => ({ id: b.id, source: 'bill', title: b.title, amount: parseFloat(b.amount), dueDate: b.dueDate, category: b.category, status: b.status })),
      ...subscriptions.map(s => ({ id: s.id, source: 'subscription', title: s.merchant, amount: parseFloat(s.amount), dueDate: s.nextRenewal, category: s.category || 'Subscription', status: 'UPCOMING' })),
      ...debts.map(d => ({ id: d.id, source: 'debt', title: d.title, amount: parseFloat(d.monthlyEmi), dueDate: new Date(now.getFullYear(), now.getMonth(), d.dueDay), category: 'EMI', status: 'UPCOMING' })),
    ];

    obligations.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    const totalMonthly = obligations.reduce((s, o) => s + o.amount, 0);

    return { obligations, totalMonthly: Math.round(totalMonthly * 100) / 100 };
  }
}

export const financeRepository = new FinanceRepository();
