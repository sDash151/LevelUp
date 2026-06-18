import { prisma } from '../../config/database.js';

class GoalsRepository {
  async findAllByUser(userId, type) {
    const where = { userId };
    if (type) where.type = type;
    return prisma.goal.findMany({
      where,
      include: { milestones: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id) {
    return prisma.goal.findUnique({ where: { id }, include: { milestones: { orderBy: { createdAt: 'asc' } } } });
  }

  async create(userId, data) {
    const { milestones, ...goalData } = data;
    return prisma.goal.create({
      data: {
        ...goalData,
        startDate: new Date(goalData.startDate),
        endDate: new Date(goalData.endDate),
        userId,
        milestones: milestones?.length ? { create: milestones } : undefined,
      },
      include: { milestones: true },
    });
  }

  async update(id, data) {
    return prisma.goal.update({ where: { id }, data, include: { milestones: true } });
  }

  async delete(id) {
    return prisma.goal.delete({ where: { id } });
  }

  async findMilestone(milestoneId) {
    return prisma.goalMilestone.findUnique({ where: { id: milestoneId }, include: { goal: true } });
  }

  async toggleMilestone(milestoneId, isCompleted) {
    return prisma.goalMilestone.update({
      where: { id: milestoneId },
      data: { isCompleted, completedAt: isCompleted ? new Date() : null },
    });
  }

  async updateProgress(goalId) {
    const milestones = await prisma.goalMilestone.findMany({ where: { goalId } });
    if (!milestones.length) return;
    const completed = milestones.filter((m) => m.isCompleted).length;
    const progress = Math.round((completed / milestones.length) * 100);
    const status = progress === 100 ? 'COMPLETED' : 'IN_PROGRESS';
    return prisma.goal.update({ where: { id: goalId }, data: { progress, status } });
  }

  async findAllByUserWithMilestones(userId, type) {
    const where = { userId };
    if (type) where.type = type;
    return prisma.goal.findMany({
      where,
      include: { milestones: true },
    });
  }

  async findMilestoneCompletions(userId, startDate, endDate) {
    return prisma.goalMilestone.findMany({
      where: {
        goal: { userId },
        isCompleted: true,
        completedAt: { gte: startDate, lte: endDate },
      },
      select: { completedAt: true },
    });
  }

  async findMilestonesByDateRange(userId, startDate, endDate) {
    return prisma.goalMilestone.findMany({
      where: {
        goal: { userId },
        completedAt: { gte: startDate, lte: endDate },
        isCompleted: true,
      },
      include: { goal: { select: { id: true, title: true, category: true } } },
      orderBy: { completedAt: 'asc' },
    });
  }
}

export const goalsRepository = new GoalsRepository();

