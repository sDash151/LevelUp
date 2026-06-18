import { prisma } from '../../config/database.js';

class AnalyticsRepository {
  async getOverview(userId) {
    const now = new Date();
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay()); weekStart.setHours(0,0,0,0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(now.getDate() - 30);

    const [
      totalHabits, habitsCompletedToday, habitsCompletedWeek,
      activeGoals, completedGoals,
      reflectionsThisMonth,
      dsaSolved, dsaTotal,
      jobsActive, jobsTotal,
      projectsActive,
      workoutsThisWeek, totalWorkoutMinutes,
      monthlyIncome, monthlyExpense,
    ] = await Promise.all([
      prisma.habit.count({ where: { userId, isArchived: false } }),
      prisma.habitLog.count({ where: { userId, completedAt: new Date(now.toISOString().split('T')[0]) } }),
      prisma.habitLog.count({ where: { userId, completedAt: { gte: weekStart } } }),
      prisma.goal.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.goal.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.reflection.count({ where: { userId, date: { gte: monthStart } } }),
      prisma.dsaProblem.count({ where: { userId, status: 'SOLVED' } }),
      prisma.dsaProblem.count({ where: { userId } }),
      prisma.jobApplication.count({ where: { userId, status: { in: ['APPLIED', 'PHONE_SCREEN', 'INTERVIEW'] } } }),
      prisma.jobApplication.count({ where: { userId } }),
      prisma.project.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.workout.count({ where: { userId, date: { gte: weekStart } } }),
      prisma.workout.aggregate({ where: { userId, date: { gte: monthStart } }, _sum: { duration: true } }),
      prisma.transaction.aggregate({ where: { userId, type: 'INCOME', date: { gte: monthStart } }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { userId, type: 'EXPENSE', date: { gte: monthStart } }, _sum: { amount: true } }),
    ]);

    return {
      habits: { total: totalHabits, completedToday: habitsCompletedToday, completedThisWeek: habitsCompletedWeek },
      goals: { active: activeGoals, completed: completedGoals },
      reflections: { thisMonth: reflectionsThisMonth },
      dsa: { solved: dsaSolved, total: dsaTotal },
      jobs: { active: jobsActive, total: jobsTotal },
      projects: { active: projectsActive },
      fitness: { workoutsThisWeek, totalMinutesThisMonth: totalWorkoutMinutes._sum.duration || 0 },
      finance: {
        monthlyIncome: Number(monthlyIncome._sum.amount) || 0,
        monthlyExpense: Number(monthlyExpense._sum.amount) || 0,
        savings: (Number(monthlyIncome._sum.amount) || 0) - (Number(monthlyExpense._sum.amount) || 0),
      },
    };
  }

  async getHabitTrends(userId, days = 30) {
    const since = new Date(); since.setDate(since.getDate() - days);
    const logs = await prisma.habitLog.findMany({
      where: { userId, completedAt: { gte: since } },
      select: { completedAt: true },
      orderBy: { completedAt: 'asc' },
    });
    const totalHabits = await prisma.habit.count({ where: { userId, isArchived: false } });
    const grouped = {};
    logs.forEach((l) => {
      const key = l.completedAt.toISOString().split('T')[0];
      grouped[key] = (grouped[key] || 0) + 1;
    });
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(since); d.setDate(d.getDate() + i + 1);
      const key = d.toISOString().split('T')[0];
      const count = grouped[key] || 0;
      return { date: key, completed: count, total: totalHabits, rate: totalHabits ? Math.round((count / totalHabits) * 100) : 0 };
    });
  }

  async getWeeklyActivity(userId) {
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 6); weekStart.setHours(0,0,0,0);
    const [habitLogs, workouts, dsaProblems, reflections] = await Promise.all([
      prisma.habitLog.findMany({ where: { userId, completedAt: { gte: weekStart } }, select: { completedAt: true } }),
      prisma.workout.findMany({ where: { userId, date: { gte: weekStart } }, select: { date: true, duration: true } }),
      prisma.dsaProblem.findMany({ where: { userId, createdAt: { gte: weekStart } }, select: { createdAt: true } }),
      prisma.reflection.findMany({ where: { userId, date: { gte: weekStart } }, select: { date: true } }),
    ]);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart); d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      return {
        date: key, day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        habits: habitLogs.filter((l) => l.completedAt.toISOString().split('T')[0] === key).length,
        workoutMins: workouts.filter((w) => w.date.toISOString().split('T')[0] === key).reduce((s, w) => s + (w.duration || 0), 0),
        dsaProblems: dsaProblems.filter((p) => p.createdAt.toISOString().split('T')[0] === key).length,
        reflections: reflections.filter((r) => r.date.toISOString().split('T')[0] === key).length,
      };
    });
  }
}

export const analyticsRepository = new AnalyticsRepository();
