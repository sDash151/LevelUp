import { prisma } from '../../config/database.js';

class InsightsRepository {
  async generateInsights(userId) {
    const now = new Date();
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const insights = [];

    // ── Habit Insights ──
    const totalHabits = await prisma.habit.count({ where: { userId, isArchived: false } });
    const weekLogs = await prisma.habitLog.count({ where: { userId, completedAt: { gte: weekStart } } });
    const weekRate = totalHabits ? Math.round((weekLogs / (totalHabits * 7)) * 100) : 0;

    if (weekRate >= 80) insights.push({ type: 'success', category: 'habits', title: 'Crushing your habits!', description: `${weekRate}% completion rate this week. You're building strong routines.`, metric: `${weekRate}%` });
    else if (weekRate >= 50) insights.push({ type: 'info', category: 'habits', title: 'Decent habit week', description: `${weekRate}% completion. Push for 80%+ next week.`, metric: `${weekRate}%` });
    else if (totalHabits > 0) insights.push({ type: 'warning', category: 'habits', title: 'Habits need attention', description: `Only ${weekRate}% completion this week. Try reducing to 3 key habits.`, metric: `${weekRate}%` });

    // ── Goal Insights ──
    const activeGoals = await prisma.goal.findMany({ where: { userId, status: 'IN_PROGRESS' }, select: { title: true, progress: true, endDate: true } });
    const nearDeadline = activeGoals.filter((g) => {
      const daysLeft = Math.ceil((new Date(g.endDate) - now) / 86400000);
      return daysLeft <= 7 && daysLeft > 0 && g.progress < 80;
    });
    if (nearDeadline.length > 0) insights.push({ type: 'warning', category: 'goals', title: `${nearDeadline.length} goal(s) due soon`, description: `"${nearDeadline[0].title}" needs attention — deadline within 7 days.`, metric: `${nearDeadline.length}` });

    const completedGoals = await prisma.goal.count({ where: { userId, status: 'COMPLETED', updatedAt: { gte: weekStart } } });
    if (completedGoals > 0) insights.push({ type: 'success', category: 'goals', title: `${completedGoals} goal(s) completed!`, description: 'Great progress this week. Keep the momentum going.', metric: `${completedGoals}` });

    // ── DSA Insights ──
    const weekDsa = await prisma.dsaProblem.count({ where: { userId, createdAt: { gte: weekStart } } });
    const solvedDsa = await prisma.dsaProblem.count({ where: { userId, status: 'SOLVED', createdAt: { gte: weekStart } } });
    if (weekDsa >= 5) insights.push({ type: 'success', category: 'dsa', title: 'Strong DSA week!', description: `${weekDsa} problems tackled, ${solvedDsa} solved. Consistency is key.`, metric: `${weekDsa}` });
    else if (weekDsa === 0) insights.push({ type: 'tip', category: 'dsa', title: 'No DSA this week', description: 'Try solving at least 3 problems per week to stay sharp.', metric: '0' });

    // ── Job Insights ──
    const activeJobs = await prisma.jobApplication.count({ where: { userId, status: { in: ['APPLIED', 'PHONE_SCREEN', 'INTERVIEW'] } } });
    const offers = await prisma.jobApplication.count({ where: { userId, status: 'OFFER' } });
    if (offers > 0) insights.push({ type: 'success', category: 'jobs', title: `${offers} offer(s) pending!`, description: 'Congratulations! Review your offers carefully.', metric: `${offers}` });
    if (activeJobs > 5) insights.push({ type: 'info', category: 'jobs', title: `${activeJobs} active applications`, description: 'Good pipeline. Focus on preparation for upcoming interviews.', metric: `${activeJobs}` });

    // ── Fitness Insights ──
    const weekWorkouts = await prisma.workout.count({ where: { userId, date: { gte: weekStart } } });
    if (weekWorkouts >= 4) insights.push({ type: 'success', category: 'fitness', title: 'Great fitness week!', description: `${weekWorkouts} workouts completed. Your consistency is paying off.`, metric: `${weekWorkouts}` });
    else if (weekWorkouts === 0) insights.push({ type: 'warning', category: 'fitness', title: 'No workouts this week', description: 'Even a 20-minute walk counts. Move your body today.', metric: '0' });

    // ── Finance Insights ──
    const monthExpense = await prisma.transaction.aggregate({ where: { userId, type: 'EXPENSE', date: { gte: monthStart } }, _sum: { amount: true } });
    const monthIncome = await prisma.transaction.aggregate({ where: { userId, type: 'INCOME', date: { gte: monthStart } }, _sum: { amount: true } });
    const expense = Number(monthExpense._sum.amount) || 0;
    const income = Number(monthIncome._sum.amount) || 0;
    const savingsRate = income ? Math.round(((income - expense) / income) * 100) : 0;
    if (savingsRate >= 30) insights.push({ type: 'success', category: 'finance', title: 'Excellent savings!', description: `${savingsRate}% savings rate this month. You're building wealth.`, metric: `${savingsRate}%` });
    else if (savingsRate < 10 && income > 0) insights.push({ type: 'warning', category: 'finance', title: 'Low savings rate', description: `Only ${savingsRate}% saved. Review your expenses.`, metric: `${savingsRate}%` });

    // ── Reflection Insights ──
    const weekReflections = await prisma.reflection.count({ where: { userId, date: { gte: weekStart } } });
    if (weekReflections === 0) insights.push({ type: 'tip', category: 'reflections', title: 'Take time to reflect', description: 'Journaling boosts self-awareness. Write a quick reflection today.', metric: '0' });

    return insights;
  }
}

export const insightsRepository = new InsightsRepository();
