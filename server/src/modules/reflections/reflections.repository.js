import { prisma } from '../../config/database.js';

class ReflectionsRepository {
  async findAllByUser(userId, type, page = 1, limit = 10) {
    const where = { userId };
    if (type) where.type = type;
    const [data, total] = await Promise.all([
      prisma.reflection.findMany({
        where, orderBy: { date: 'desc' },
        skip: (page - 1) * limit, take: limit,
      }),
      prisma.reflection.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findById(id) {
    return prisma.reflection.findUnique({ where: { id } });
  }

  async findByDate(userId, date, type) {
    return prisma.reflection.findFirst({
      where: { userId, date: new Date(date), type },
    });
  }

  async create(userId, data) {
    return prisma.reflection.create({
      data: { ...data, date: new Date(data.date), userId },
    });
  }

  async update(id, data) {
    return prisma.reflection.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.reflection.delete({ where: { id } });
  }

  async getMoodHistory(userId, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return prisma.reflection.findMany({
      where: { userId, date: { gte: since }, mood: { not: null } },
      select: { date: true, mood: true, type: true },
      orderBy: { date: 'asc' },
    });
  }

  async findAllForStats(userId) {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return prisma.reflection.findMany({
      where: { userId, date: { gte: threeMonthsAgo } },
      select: { date: true, mood: true, tags: true, gratitude: true, improvements: true, type: true },
      orderBy: { date: 'asc' },
    });
  }
}

export const reflectionsRepository = new ReflectionsRepository();
