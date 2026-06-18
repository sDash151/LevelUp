import { prisma } from '../../config/database.js';

class FinanceRepository {
  async findAllByUser(userId, filters = {}, page = 1, limit = 20) {
    const where = { userId };
    if (filters.type) where.type = filters.type;
    if (filters.category) where.category = filters.category;
    const [data, total] = await Promise.all([
      prisma.transaction.findMany({ where, orderBy: { date: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.transaction.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findById(id) { return prisma.transaction.findUnique({ where: { id } }); }

  async create(userId, data) {
    return prisma.transaction.create({ data: { ...data, date: new Date(data.date), userId } });
  }

  async update(id, data) {
    const processed = { ...data };
    if (data.date) processed.date = new Date(data.date);
    return prisma.transaction.update({ where: { id }, data: processed });
  }

  async delete(id) { return prisma.transaction.delete({ where: { id } }); }

  async getSummary(userId) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [income, expense, byCategory] = await Promise.all([
      prisma.transaction.aggregate({ where: { userId, type: 'INCOME', date: { gte: monthStart } }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { userId, type: 'EXPENSE', date: { gte: monthStart } }, _sum: { amount: true } }),
      prisma.transaction.groupBy({
        by: ['category'], where: { userId, type: 'EXPENSE', date: { gte: monthStart } },
        _sum: { amount: true }, orderBy: { _sum: { amount: 'desc' } }, take: 8,
      }),
    ]);

    return {
      monthlyIncome: income._sum.amount || 0,
      monthlyExpense: expense._sum.amount || 0,
      savings: (income._sum.amount || 0) - (expense._sum.amount || 0),
      byCategory: byCategory.map((c) => ({ category: c.category, amount: c._sum.amount })),
    };
  }
}

export const financeRepository = new FinanceRepository();
