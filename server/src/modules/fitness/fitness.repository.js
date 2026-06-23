import { prisma } from '../../config/database.js';

class FitnessRepository {
  // ══════════════════════════════════════════════
  // EXERCISE CATALOG
  // ══════════════════════════════════════════════
  async getAllExercises() {
    return prisma.exerciseCatalog.findMany({ orderBy: { name: 'asc' } });
  }

  async findExerciseBySlug(slug) {
    return prisma.exerciseCatalog.findUnique({ where: { slug } });
  }

  async findExerciseByName(name) {
    return prisma.exerciseCatalog.findFirst({ where: { name: { equals: name, mode: 'insensitive' } } });
  }

  async searchExercises(query) {
    return prisma.exerciseCatalog.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      take: 20,
    });
  }

  // ══════════════════════════════════════════════
  // FITNESS PROFILE
  // ══════════════════════════════════════════════
  async getProfile(userId) {
    return prisma.fitnessProfile.findUnique({ where: { userId } });
  }

  async upsertProfile(userId, data) {
    return prisma.fitnessProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  // ══════════════════════════════════════════════
  // WORKOUT PLAN
  // ══════════════════════════════════════════════
  async getActivePlan(userId) {
    return prisma.workoutPlan.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPlan(userId, data) {
    // Deactivate previous plans
    await prisma.workoutPlan.updateMany({ where: { userId, isActive: true }, data: { isActive: false } });
    return prisma.workoutPlan.create({ data: { userId, ...data } });
  }

  async updatePlan(id, data) {
    return prisma.workoutPlan.update({ where: { id }, data });
  }

  // ══════════════════════════════════════════════
  // WORKOUT SESSION
  // ══════════════════════════════════════════════
  async createSession(userId, data) {
    return prisma.workoutSession.create({
      data: { userId, ...data },
      include: { exercises: true },
    });
  }

  async getSessionById(id) {
    return prisma.workoutSession.findUnique({
      where: { id },
      include: { exercises: { orderBy: { orderIndex: 'asc' } } },
    });
  }

  async getSessions(userId, { search, type, muscleGroup, startDate, endDate, skip = 0, take = 20 } = {}) {
    const where = { userId };
    if (type) where.type = type;
    if (muscleGroup) where.muscleGroups = { has: muscleGroup };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    const [sessions, total] = await Promise.all([
      prisma.workoutSession.findMany({
        where, include: { exercises: { orderBy: { orderIndex: 'asc' } } },
        orderBy: { date: 'desc' }, skip, take,
      }),
      prisma.workoutSession.count({ where }),
    ]);
    return { sessions, total };
  }

  async getSessionsByDateRange(userId, startDate, endDate) {
    return prisma.workoutSession.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      include: { exercises: { orderBy: { orderIndex: 'asc' } } },
      orderBy: { date: 'desc' },
    });
  }

  async getWeekSessions(userId, weekStart, weekEnd) {
    return prisma.workoutSession.findMany({
      where: { userId, date: { gte: weekStart, lte: weekEnd } },
      include: { exercises: true },
      orderBy: { date: 'asc' },
    });
  }

  async getSessionStats(userId) {
    const result = await prisma.workoutSession.aggregate({
      where: { userId },
      _count: true,
      _sum: { duration: true, caloriesBurned: true, totalVolume: true },
    });
    return {
      totalWorkouts: result._count,
      totalDuration: result._sum.duration || 0,
      totalCalories: result._sum.caloriesBurned || 0,
      totalVolume: result._sum.totalVolume || 0,
    };
  }

  async getRecentSessions(userId, limit = 10) {
    return prisma.workoutSession.findMany({
      where: { userId },
      include: { exercises: { orderBy: { orderIndex: 'asc' } } },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }

  async deleteSession(id) {
    return prisma.workoutSession.delete({ where: { id } });
  }

  // ══════════════════════════════════════════════
  // EXERCISE LOG
  // ══════════════════════════════════════════════
  async createExerciseLogs(sessionId, exercises) {
    return prisma.exerciseLog.createMany({
      data: exercises.map((e, i) => ({ sessionId, ...e, orderIndex: i })),
    });
  }

  async getExerciseHistory(userId, exerciseName, limit = 10) {
    return prisma.exerciseLog.findMany({
      where: { name: { equals: exerciseName, mode: 'insensitive' }, session: { userId } },
      include: { session: { select: { date: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getOldestExerciseLog(userId, exerciseName) {
    return prisma.exerciseLog.findFirst({
      where: { name: { equals: exerciseName, mode: 'insensitive' }, session: { userId } },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ══════════════════════════════════════════════
  // WORKOUT MEMORY
  // ══════════════════════════════════════════════
  async getMemory(userId, exerciseName) {
    return prisma.workoutMemory.findUnique({
      where: { userId_exerciseName: { userId, exerciseName } },
    });
  }

  async getAllMemories(userId) {
    return prisma.workoutMemory.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async upsertMemory(userId, exerciseName, data) {
    return prisma.workoutMemory.upsert({
      where: { userId_exerciseName: { userId, exerciseName } },
      update: data,
      create: { userId, exerciseName, ...data },
    });
  }

  async getTopLifts(userId, limit = 10) {
    return prisma.workoutMemory.findMany({
      where: { userId },
      orderBy: { bestWeight: 'desc' },
      take: limit,
    });
  }

  // ══════════════════════════════════════════════
  // MEAL LOG
  // ══════════════════════════════════════════════
  async createMeal(userId, data) {
    return prisma.mealLog.create({ data: { userId, ...data } });
  }

  async getMealsByDate(userId, date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    return prisma.mealLog.findMany({
      where: { userId, date: { gte: dayStart, lte: dayEnd } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getRecentFoods(userId, limit = 10) {
    return prisma.mealLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getMealsByDateRange(userId, startDate, endDate) {
    return prisma.mealLog.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'desc' },
    });
  }

  async deleteMeal(id) {
    return prisma.mealLog.delete({ where: { id } });
  }

  // ══════════════════════════════════════════════
  // WATER LOG (event-based)
  // ══════════════════════════════════════════════
  async createWaterEntry(userId, amount) {
    return prisma.waterLog.create({ data: { userId, amount } });
  }

  async getWaterByDate(userId, date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    const entries = await prisma.waterLog.findMany({
      where: { userId, createdAt: { gte: dayStart, lte: dayEnd } },
      orderBy: { createdAt: 'asc' },
    });
    const total = entries.reduce((sum, e) => sum + e.amount, 0);
    return { entries, total };
  }

  async getWaterByDateRange(userId, startDate, endDate) {
    return prisma.waterLog.findMany({
      where: { userId, createdAt: { gte: startDate, lte: endDate } },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ══════════════════════════════════════════════
  // BODY METRIC
  // ══════════════════════════════════════════════
  async createMetric(userId, data) {
    return prisma.bodyMetric.create({ data: { userId, ...data } });
  }

  async getMetrics(userId, startDate, endDate) {
    const where = { userId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    return prisma.bodyMetric.findMany({ where, orderBy: { date: 'asc' } });
  }

  async getLatestMetric(userId) {
    return prisma.bodyMetric.findFirst({ where: { userId }, orderBy: { date: 'desc' } });
  }

  // ══════════════════════════════════════════════
  // BODY MEASUREMENT
  // ══════════════════════════════════════════════
  async createMeasurement(userId, data) {
    return prisma.bodyMeasurement.create({ data: { userId, ...data } });
  }

  async getMeasurements(userId, startDate, endDate) {
    const where = { userId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    return prisma.bodyMeasurement.findMany({ where, orderBy: { date: 'asc' } });
  }

  async getLatestMeasurement(userId) {
    return prisma.bodyMeasurement.findFirst({ where: { userId }, orderBy: { date: 'desc' } });
  }

  // ══════════════════════════════════════════════
  // PROGRESS PHOTO
  // ══════════════════════════════════════════════
  async createPhoto(userId, data) {
    return prisma.progressPhoto.create({ data: { userId, ...data } });
  }

  async getPhotos(userId, limit = 20) {
    return prisma.progressPhoto.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }

  async deletePhoto(id) {
    return prisma.progressPhoto.delete({ where: { id } });
  }

  async getPhotoCount(userId) {
    return prisma.progressPhoto.count({ where: { userId } });
  }

  // ══════════════════════════════════════════════
  // MILESTONE
  // ══════════════════════════════════════════════
  async createMilestone(userId, data) {
    return prisma.fitnessMilestone.create({ data: { userId, ...data } });
  }

  async getMilestones(userId) {
    return prisma.fitnessMilestone.findMany({
      where: { userId },
      orderBy: [{ isAchieved: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async updateMilestone(id, data) {
    return prisma.fitnessMilestone.update({ where: { id }, data });
  }

  async deleteMilestone(id) {
    return prisma.fitnessMilestone.delete({ where: { id } });
  }

  // ══════════════════════════════════════════════
  // INSIGHT
  // ══════════════════════════════════════════════
  async createInsight(userId, type, content) {
    return prisma.fitnessInsight.create({ data: { userId, type, content } });
  }

  async getLatestInsight(userId, type) {
    return prisma.fitnessInsight.findFirst({
      where: { userId, type },
      orderBy: { generatedAt: 'desc' },
    });
  }

  async getInsights(userId, type) {
    const where = { userId };
    if (type) where.type = type;
    return prisma.fitnessInsight.findMany({
      where,
      orderBy: { generatedAt: 'desc' },
      take: 10,
    });
  }

  // ══════════════════════════════════════════════
  // AGGREGATION HELPERS
  // ══════════════════════════════════════════════
  async getPRsCount(userId) {
    // Count distinct exercises where bestWeight > 0
    const memories = await prisma.workoutMemory.findMany({
      where: { userId, bestWeight: { gt: 0 } },
    });
    return memories.length;
  }

  async getMonthSessionDates(userId, year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    return prisma.workoutSession.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      select: { date: true, type: true, name: true },
      orderBy: { date: 'asc' },
    });
  }
}

export const fitnessRepository = new FitnessRepository();
