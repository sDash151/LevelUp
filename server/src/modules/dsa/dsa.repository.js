import { prisma } from '../../config/database.js';

class DsaRepository {
  async findAllByUser(userId, filters = {}, page = 1, limit = 20) {
    const where = { userId };
    if (filters.topic) where.topic = filters.topic;
    if (filters.difficulty) where.difficulty = filters.difficulty;
    if (filters.status) where.status = filters.status;
    if (filters.platform) where.platform = filters.platform;

    const [data, total] = await Promise.all([
      prisma.dsaProblem.findMany({
        where, orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit, take: limit,
      }),
      prisma.dsaProblem.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findById(id) {
    return prisma.dsaProblem.findUnique({ where: { id } });
  }

  async create(userId, data) {
    return prisma.dsaProblem.create({ data: { ...data, userId } });
  }

  async update(id, data) {
    return prisma.dsaProblem.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.dsaProblem.delete({ where: { id } });
  }

  async getStats(userId) {
    const [total, byDifficulty, byTopic, byStatus] = await Promise.all([
      prisma.dsaProblem.count({ where: { userId } }),
      prisma.dsaProblem.groupBy({ by: ['difficulty'], where: { userId }, _count: { id: true } }),
      prisma.dsaProblem.groupBy({ by: ['topic'], where: { userId }, _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 10 }),
      prisma.dsaProblem.groupBy({ by: ['status'], where: { userId }, _count: { id: true } }),
    ]);
    return { total, byDifficulty, byTopic, byStatus };
  }
}

export const dsaRepository = new DsaRepository();
