import { prisma } from '../../config/database.js';

class AnalyticsRepository {
  async upsertSnapshot(userId, data) {
    try {
      return await prisma.analyticsSnapshot.upsert({
        where: { 
          userId_snapshotDate: { 
            userId, 
            snapshotDate: data.snapshotDate 
          } 
        },
        update: { ...data },
        create: { userId, ...data },
      });
    } catch (error) {
      console.error('Error upserting snapshot:', error);
      return null;
    }
  }

  async getSnapshots(userId, days = 30) {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffStr = cutoff.toISOString().split('T')[0];
      
      return await prisma.analyticsSnapshot.findMany({
        where: { userId, snapshotDate: { gte: cutoffStr } },
        orderBy: { snapshotDate: 'asc' },
      });
    } catch (error) {
      console.error('Error getting snapshots:', error);
      return [];
    }
  }

  async getLatestSnapshot(userId) {
    try {
      return await prisma.analyticsSnapshot.findFirst({
        where: { userId },
        orderBy: { snapshotDate: 'desc' },
      });
    } catch (error) {
      console.error('Error getting latest snapshot:', error);
      return null;
    }
  }

  async getPreviousSnapshot(userId, beforeDate) {
    try {
      return await prisma.analyticsSnapshot.findFirst({
        where: { userId, snapshotDate: { lt: beforeDate } },
        orderBy: { snapshotDate: 'desc' },
      });
    } catch (error) {
      console.error('Error getting previous snapshot:', error);
      return null;
    }
  }

  async getWeeklySnapshots(userId) {
    return this.getSnapshots(userId, 7);
  }

  async getMonthlySnapshots(userId) {
    return this.getSnapshots(userId, 30);
  }

  async getActiveUserIds() {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7); // Users active in last 7 days
      
      const users = await prisma.user.findMany({
        where: { isOnboarded: true, updatedAt: { gte: cutoff } },
        select: { id: true },
      });
      return users.map(u => u.id);
    } catch (error) {
      console.error('Error getting active user IDs:', error);
      return [];
    }
  }

  async getAIInsight(userId, type) {
    try {
      return await prisma.aIAnalyticsInsight.findFirst({
        where: { userId, type },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error('Error getting AI insight:', error);
      return null;
    }
  }

  async createAIInsight(userId, type, content) {
    try {
      return await prisma.aIAnalyticsInsight.create({
        data: { userId, type, content },
      });
    } catch (error) {
      console.error('Error creating AI insight:', error);
      return null;
    }
  }

  async getDailyXpEarned(userId, date) {
    try {
      // Basic approximation for now
      return 0;
    } catch (error) {
      return 0;
    }
  }

  async getDailyTasksCompleted(userId, date) {
    try {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      const [habits, workouts, dsa, reflections] = await Promise.all([
        prisma.habitLog.count({
          where: { userId, completedAt: { gte: startOfDay, lte: endOfDay } }
        }),
        prisma.workoutSession.count({
          where: { userId, date: { gte: startOfDay, lte: endOfDay } }
        }),
        prisma.dsaUserProgress.count({
          where: { userId, solvedAt: { gte: startOfDay, lte: endOfDay } }
        }),
        prisma.reflection.count({
          where: { userId, date: { gte: startOfDay, lte: endOfDay } }
        })
      ]);

      return habits + workouts + dsa + reflections;
    } catch (error) {
      console.error('Error getting daily tasks completed:', error);
      return 0;
    }
  }

  async getProjectStats(userId) {
    try {
      const [total, shipped] = await Promise.all([
        prisma.project.count({ where: { userId } }),
        prisma.project.count({ where: { userId, status: 'SHIPPED' } }),
      ]);
      return { total, shipped };
    } catch (error) {
      console.error('Error getting project stats:', error);
      return { total: 0, shipped: 0 };
    }
  }
}

export const analyticsRepository = new AnalyticsRepository();
