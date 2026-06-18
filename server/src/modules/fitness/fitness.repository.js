import { prisma } from '../../config/database.js';

class FitnessRepository {
  // ── Workouts ──
  async findWorkouts(userId, filters = {}, page = 1, limit = 20) {
    const where = { userId };
    if (filters.type) where.type = filters.type;
    const [data, total] = await Promise.all([
      prisma.workout.findMany({ where, orderBy: { date: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.workout.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findWorkoutById(id) { return prisma.workout.findUnique({ where: { id } }); }

  async createWorkout(userId, data) {
    return prisma.workout.create({ data: { ...data, date: new Date(data.date), userId } });
  }

  async updateWorkout(id, data) { return prisma.workout.update({ where: { id }, data }); }
  async deleteWorkout(id) { return prisma.workout.delete({ where: { id } }); }

  // ── Daily Logs ──
  async findLog(userId, date) {
    return prisma.fitnessLog.findFirst({ where: { userId, date: new Date(date) } });
  }

  async upsertLog(userId, data) {
    const date = new Date(data.date);
    const existing = await this.findLog(userId, data.date);
    if (existing) {
      return prisma.fitnessLog.update({ where: { id: existing.id }, data: { ...data, date } });
    }
    return prisma.fitnessLog.create({ data: { ...data, date, userId } });
  }

  async getLogHistory(userId, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return prisma.fitnessLog.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: 'asc' },
    });
  }

  // ── Stats ──
  async getStats(userId) {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const [totalWorkouts, thisWeek, totalDuration, byType] = await Promise.all([
      prisma.workout.count({ where: { userId } }),
      prisma.workout.count({ where: { userId, date: { gte: weekStart } } }),
      prisma.workout.aggregate({ where: { userId }, _sum: { duration: true } }),
      prisma.workout.groupBy({ by: ['type'], where: { userId }, _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
    ]);

    return { totalWorkouts, thisWeek, totalMinutes: totalDuration._sum.duration || 0, byType };
  }
}

export const fitnessRepository = new FitnessRepository();
