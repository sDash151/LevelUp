import { habitsRepository } from './habits.repository.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { UnauthorizedError } from '../../shared/errors/AuthError.js';
import { prisma } from '../../config/database.js';

class HabitsService {
  async getHabits(userId) {
    const habits = await habitsRepository.findAllByUser(userId);
    return habits.map((h) => ({
      ...h,
      completedToday: h.logs.length > 0,
      logs: undefined,
    }));
  }

  async getHabit(userId, habitId) {
    const habit = await habitsRepository.findById(habitId);
    if (!habit) throw new NotFoundError('Habit');
    if (habit.userId !== userId) throw new UnauthorizedError('Not your habit');
    const streakData = await habitsRepository.getStreakData(habitId);
    return { ...habit, currentStreak: this._calculateStreak(streakData.map((l) => l.completedAt)) };
  }

  async createHabit(userId, data) {
    return habitsRepository.create(userId, data);
  }

  async updateHabit(userId, habitId, data) {
    const habit = await habitsRepository.findById(habitId);
    if (!habit) throw new NotFoundError('Habit');
    if (habit.userId !== userId) throw new UnauthorizedError('Not your habit');
    return habitsRepository.update(habitId, data);
  }

  async deleteHabit(userId, habitId) {
    const habit = await habitsRepository.findById(habitId);
    if (!habit) throw new NotFoundError('Habit');
    if (habit.userId !== userId) throw new UnauthorizedError('Not your habit');
    return habitsRepository.delete(habitId);
  }

  async toggleComplete(userId, habitId, date) {
    const habit = await habitsRepository.findById(habitId);
    if (!habit) throw new NotFoundError('Habit');
    if (habit.userId !== userId) throw new UnauthorizedError('Not your habit');

    const existingLog = await habitsRepository.findLog(habitId, date);
    if (existingLog) {
      await habitsRepository.deleteLog(habitId, date);
      // Revoke XP
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { totalXp: true } });
      const newXp = Math.max(0, (user.totalXp || 0) - 10);
      const newLevel = Math.floor(newXp / 1000) + 1;
      await prisma.user.update({ where: { id: userId }, data: { totalXp: newXp, level: newLevel } });
      return { completed: false };
    }
    await habitsRepository.createLog(habitId, userId, date);
    // Award XP
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { totalXp: true } });
    const newXp = (user.totalXp || 0) + 10;
    const newLevel = Math.floor(newXp / 1000) + 1;
    await prisma.user.update({ where: { id: userId }, data: { totalXp: newXp, level: newLevel } });
    return { completed: true };
  }

  async getStats(userId) {
    const habits = await habitsRepository.findAllByUser(userId);
    const today = new Date().toISOString().split('T')[0];
    const completed = habits.filter((h) => h.logs.length > 0).length;
    return { total: habits.length, completed, percentage: habits.length ? Math.round((completed / habits.length) * 100) : 0 };
  }

  async getRichStats(userId) {
    return habitsRepository.getRichStats(userId);
  }

  async getCalendarStats(userId, year, month, selectedDate) {
    return habitsRepository.getCalendarStats(userId, year, month, selectedDate);
  }

  _calculateStreak(dates) {
    if (!dates.length) return 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = new Date(today);

    for (const d of dates) {
      const logDate = new Date(d);
      logDate.setHours(0, 0, 0, 0);
      if (logDate.getTime() === checkDate.getTime()) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (streak === 0 && checkDate.getTime() - logDate.getTime() === 86400000) {
        // Allow streak to start from yesterday
        checkDate = new Date(logDate);
        streak = 1;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }
}

export const habitsService = new HabitsService();
