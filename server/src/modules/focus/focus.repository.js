import { prisma } from '../../config/database.js';

const XP_PER_HABIT = 10;

class FocusRepository {
  async createSession(userId, { duration, label }) {
    return prisma.focusSession.create({
      data: { userId, duration, label: label || 'Deep Work Session' },
    });
  }

  async completeSession(sessionId, userId, actualMins) {
    const session = await prisma.focusSession.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId) return null;
    if (session.completedAt) return session; // already completed

    const [updated] = await prisma.$transaction([
      prisma.focusSession.update({
        where: { id: sessionId },
        data: { completedAt: new Date(), actualMins },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          totalXp: { increment: Math.floor(actualMins / 5) }, // 1 XP per 5 mins
        },
      }),
    ]);

    // Recalculate level
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { totalXp: true, level: true } });
    const newLevel = Math.floor(user.totalXp / 1000) + 1;
    if (newLevel !== user.level) {
      await prisma.user.update({ where: { id: userId }, data: { level: newLevel } });
    }
    return updated;
  }

  async getTodaySessions(userId) {
    const today = new Date(new Date().toISOString().split('T')[0]);
    return prisma.focusSession.findMany({
      where: { userId, createdAt: { gte: today } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteSession(sessionId, userId) {
    const session = await prisma.focusSession.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId) return null;
    return prisma.focusSession.delete({ where: { id: sessionId } });
  }
}

export const focusRepository = new FocusRepository();
export { XP_PER_HABIT };
