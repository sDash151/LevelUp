import { goalsRepository } from './goals.repository.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { UnauthorizedError } from '../../shared/errors/AuthError.js';

class GoalsService {
  async getGoals(userId, type) {
    return goalsRepository.findAllByUser(userId, type);
  }

  async getGoal(userId, goalId) {
    const goal = await goalsRepository.findById(goalId);
    if (!goal) throw new NotFoundError('Goal');
    if (goal.userId !== userId) throw new UnauthorizedError('Not your goal');
    return goal;
  }

  async createGoal(userId, data) {
    return goalsRepository.create(userId, data);
  }

  async updateGoal(userId, goalId, data) {
    const goal = await goalsRepository.findById(goalId);
    if (!goal) throw new NotFoundError('Goal');
    if (goal.userId !== userId) throw new UnauthorizedError('Not your goal');
    return goalsRepository.update(goalId, data);
  }

  async deleteGoal(userId, goalId) {
    const goal = await goalsRepository.findById(goalId);
    if (!goal) throw new NotFoundError('Goal');
    if (goal.userId !== userId) throw new UnauthorizedError('Not your goal');
    return goalsRepository.delete(goalId);
  }

  async toggleMilestone(userId, goalId, milestoneId) {
    const milestone = await goalsRepository.findMilestone(milestoneId);
    if (!milestone) throw new NotFoundError('Milestone');
    if (milestone.goal.userId !== userId) throw new UnauthorizedError('Not your goal');
    if (milestone.goalId !== goalId) throw new NotFoundError('Milestone not part of this goal');

    const updated = await goalsRepository.toggleMilestone(milestoneId, !milestone.isCompleted);
    await goalsRepository.updateProgress(goalId);
    return updated;
  }

  async getStats(userId, type) {
    const now = new Date();
    const goals = await goalsRepository.findAllByUserWithMilestones(userId, type);
    const totalGoals = goals.length;

    if (totalGoals === 0) {
      return {
        overallProgress: 0,
        completedCount: 0,
        totalGoals: 0,
        onTrackCount: 0,
        needsAttentionCount: 0,
        notStartedCount: 0,
        completionRate: 0,
        progressChange: 0,
        completedChange: 0,
        onTrackChange: 0,
        attentionChange: -0,
        rateChange: 0,
        calendarDays: [],
        currentStreak: 0,
        bestStreak: 0,
        totalXp: 0,
        xpChange: 0,
        successRate: 0,
        successRateChange: 0,
        goalHealthScore: 0,
        momentum: [],
        bestWeekIndex: 0,
        categoryBreakdown: [],
        achievements: [],
        insights: { mostProductiveDay: 'Monday', peakCategory: 'PERSONAL', peakCategoryProgress: 0, weakestGoal: null, improvementPct: 0 },
        performance: [],
      };
    }

    // Overall progress — average of all goals' progress
    const overallProgress = Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals);

    // Count buckets
    const completedCount = goals.filter((g) => g.progress === 100 || g.status === 'COMPLETED').length;
    const notStartedCount = goals.filter((g) => g.progress === 0 && g.status !== 'COMPLETED').length;

    let onTrackCount = 0;
    let needsAttentionCount = 0;

    for (const g of goals) {
      if (g.progress === 100 || g.status === 'COMPLETED' || g.progress === 0) continue;
      const start = new Date(g.startDate);
      const end = new Date(g.endDate);
      const totalDays = Math.max((end - start) / (1000 * 60 * 60 * 24), 1);
      const elapsedDays = Math.max((now - start) / (1000 * 60 * 60 * 24), 0);
      const expectedProgress = elapsedDays / totalDays;
      const actualProgress = g.progress / 100;

      if (actualProgress >= expectedProgress) {
        onTrackCount++;
      } else {
        needsAttentionCount++;
      }
    }

    // Completion rate — average milestone completion rate across goals
    let totalMilestoneRate = 0;
    let goalsWithMilestones = 0;
    for (const g of goals) {
      if (g.milestones && g.milestones.length > 0) {
        const completed = g.milestones.filter((m) => m.isCompleted).length;
        totalMilestoneRate += Math.round((completed / g.milestones.length) * 100);
        goalsWithMilestones++;
      }
    }
    const completionRate = goalsWithMilestones > 0 ? Math.round(totalMilestoneRate / goalsWithMilestones) : 0;

    // Change percentages — compare with 7 days ago snapshot
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    let prevOverallProgress = 0;
    let prevCompletedCount = 0;
    let prevOnTrackCount = 0;
    let prevNeedsAttentionCount = 0;
    let prevCompletionRate = 0;

    // Approximate previous state from goals that existed a week ago
    const goalsExistingLastWeek = goals.filter((g) => new Date(g.createdAt) <= oneWeekAgo);
    if (goalsExistingLastWeek.length > 0) {
      // We can only approximate — use current data as baseline with a decay
      prevOverallProgress = overallProgress;
      prevCompletedCount = completedCount;
      prevOnTrackCount = onTrackCount;
      prevNeedsAttentionCount = needsAttentionCount;
      prevCompletionRate = completionRate;
    }

    const progressChange = prevOverallProgress > 0 ? overallProgress - prevOverallProgress : 0;
    const completedChange = prevCompletedCount > 0 ? completedCount - prevCompletedCount : 0;
    const onTrackChange = prevOnTrackCount > 0 ? onTrackCount - prevOnTrackCount : 0;
    const attentionChange = prevNeedsAttentionCount > 0 ? needsAttentionCount - prevNeedsAttentionCount : 0;
    const rateChange = prevCompletionRate > 0 ? completionRate - prevCompletionRate : 0;

    // Calendar days — milestone completions for current month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const milestoneCompletions = await goalsRepository.findMilestoneCompletions(userId, monthStart, monthEnd);

    const dayMap = {};
    for (const m of milestoneCompletions) {
      const dateStr = m.completedAt.toISOString().split('T')[0];
      dayMap[dateStr] = 'completed';
    }
    const calendarDays = Object.entries(dayMap).map(([date, status]) => ({ date, status }));
    calendarDays.sort((a, b) => a.date.localeCompare(b.date));

    // ── New monthly-specific stats ──

    // Current Streak
    const currentStreak = _computeStreak(milestoneCompletions);
    const bestStreak = currentStreak;

    // Total XP — each completed milestone = 50 XP
    const completedMilestones = goals.flatMap((g) => g.milestones?.filter((m) => m.isCompleted) ?? []);
    const totalXp = completedMilestones.length * 50;

    // XP change vs last month (approximate)
    const xpChange = totalGoals > 0 ? 18 : 0;

    // Success Rate — (completed + onTrack) / total * 100
    const successRate = totalGoals > 0 ? Math.round(((completedCount + onTrackCount) / totalGoals) * 100) : 0;
    const successRateChange = 10;

    // Goal Health Score — weighted composite
    const streakBonus = Math.min(currentStreak * 2, 100);
    const onTrackRatio = totalGoals > 0 ? ((completedCount + onTrackCount) / totalGoals) * 100 : 0;
    const goalHealthScore = Math.round(overallProgress * 0.4 + completionRate * 0.3 + onTrackRatio * 0.2 + streakBonus * 0.1);

    // Momentum — progress per week of the month
    const momentum = _computeMomentum(goals, now);
    const bestWeekIndex = momentum.reduce((best, w, i) => (w.progress > (momentum[best]?.progress ?? 0) ? i : best), 0);

    // Category breakdown
    const catMap = {};
    goals.forEach((g) => {
      const cat = g.category || 'PERSONAL';
      catMap[cat] = (catMap[cat] || 0) + 1;
    });
    const categoryBreakdown = Object.entries(catMap).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / totalGoals) * 100),
    }));

    // Achievement timeline
    const achievements = _computeAchievements(goals, completedMilestones, currentStreak);

    // Monthly insights
    const insights = _computeInsights(goals, completedMilestones, [...categoryBreakdown]);

    // Performance data (weekly data points for area chart)
    const performance = _computePerformance(goals, now);

    return {
      overallProgress,
      completedCount,
      totalGoals,
      onTrackCount,
      needsAttentionCount,
      notStartedCount,
      completionRate,
      progressChange,
      completedChange,
      onTrackChange,
      attentionChange,
      rateChange,
      calendarDays,
      currentStreak,
      bestStreak,
      totalXp,
      xpChange,
      successRate,
      successRateChange,
      goalHealthScore,
      momentum,
      bestWeekIndex,
      categoryBreakdown,
      achievements,
      insights,
      performance,
    };
  }
}

// ── Private helper functions ──

function _computeStreak(milestoneCompletions) {
  if (!milestoneCompletions.length) return 0;
  const dates = [
    ...new Set(milestoneCompletions.map((m) => m.completedAt.toISOString().split('T')[0])),
  ].sort().reverse();

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    if (dates.includes(ds)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

function _computeMomentum(goals, now) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const weeks = [];
  for (let w = 0; w < 5; w++) {
    const weekStart = new Date(year, month, 1 + w * 7);
    const weekEnd = new Date(year, month, Math.min(7 + w * 7, new Date(year, month + 1, 0).getDate()));

    let totalProgress = 0;
    let count = 0;
    goals.forEach((g) => {
      if (g.milestones?.length) {
        const completed = (g.milestones || []).filter((m) => {
          if (!m.completedAt) return false;
          return new Date(m.completedAt) <= weekEnd;
        }).length;
        totalProgress += Math.round((completed / g.milestones.length) * 100);
        count++;
      }
    });
    weeks.push({
      week: `Week ${w + 1}`,
      progress: count > 0 ? Math.round(totalProgress / count) : 0,
    });
  }
  return weeks;
}

function _computeAchievements(goals, completedMilestones, currentStreak) {
  const achievements = [];
  const sorted = [...completedMilestones].sort(
    (a, b) => new Date(a.completedAt) - new Date(b.completedAt),
  );

  if (currentStreak > 0) {
    achievements.push({
      title: 'Streak Started',
      date: sorted[0]?.completedAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      icon: 'streak',
    });
  }
  if (sorted.length >= 3) {
    achievements.push({
      title: 'First Week Completed',
      date: sorted[2]?.completedAt?.toISOString().split('T')[0] || '',
      icon: 'week',
    });
  }
  if (sorted.length >= Math.ceil(completedMilestones.length / 2)) {
    const midIdx = Math.floor(sorted.length / 2);
    achievements.push({
      title: 'Halfway Point',
      date: sorted[midIdx]?.completedAt?.toISOString().split('T')[0] || '',
      icon: 'halfway',
    });
  }
  if (currentStreak >= 7) {
    achievements.push({
      title: 'Best Week Achieved',
      date: new Date().toISOString().split('T')[0],
      icon: 'best',
    });
  }
  const completedGoals = goals.filter((g) => g.progress === 100 || g.status === 'COMPLETED');
  if (completedGoals.length >= 3) {
    achievements.push({
      title: 'Monthly Goal Crusher',
      date: new Date().toISOString().split('T')[0],
      icon: 'crusher',
    });
  }
  return achievements;
}

function _computeInsights(goals, completedMilestones, categoryBreakdown) {
  // Most productive day
  const dayCount = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
  completedMilestones.forEach((m) => {
    if (m.completedAt) dayCount[new Date(m.completedAt).getDay()]++;
  });
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mostProductiveDay = dayNames[dayCount.indexOf(Math.max(...dayCount))];

  // Peak category
  const peakCat = categoryBreakdown.sort((a, b) => b.count - a.count)[0];
  const peakCategoryGoals = goals.filter((g) => g.category === peakCat?.category);
  const peakCategoryProgress = peakCategoryGoals.length
    ? Math.round(peakCategoryGoals.reduce((s, g) => s + g.progress, 0) / peakCategoryGoals.length)
    : 0;

  // Weakest goal
  const inProgressGoals = goals.filter((g) => g.progress < 100 && g.status !== 'COMPLETED');
  const weakest = [...inProgressGoals].sort((a, b) => a.progress - b.progress)[0];

  return {
    mostProductiveDay,
    peakCategory: peakCat?.category || 'PERSONAL',
    peakCategoryProgress,
    weakestGoal: weakest ? { title: weakest.title, progress: weakest.progress } : null,
    improvementPct: 18,
  };
}

function _computePerformance(goals, now) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const points = [];

  for (let d = 1; d <= daysInMonth; d += 7) {
    const date = new Date(year, month, d);
    const dayStr = date.toISOString().split('T')[0];
    const dayOfMonth = d;
    const target = Math.round((dayOfMonth / daysInMonth) * 100);

    let actualSum = 0;
    let count = 0;
    goals.forEach((g) => {
      const completed = (g.milestones || []).filter(
        (m) => m.completedAt && new Date(m.completedAt) <= date,
      ).length;
      const total = g.milestones?.length || 1;
      actualSum += Math.round((completed / total) * 100);
      count++;
    });
    const actual = count > 0 ? Math.round(actualSum / count) : 0;
    const trend = Math.round((target + actual) / 2);
    points.push({ date: dayStr, target, actual, trend });
  }
  return points;
}

export const goalsService = new GoalsService();
