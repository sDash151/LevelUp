import { prisma } from '../../config/database.js';

class DashboardRepository {
  // ─── Today's habit completion ───
  async getTodayHabitCompletion(userId) {
    const today = new Date(new Date().toISOString().split('T')[0]);
    const [total, completed] = await Promise.all([
      prisma.habit.count({ where: { userId, isArchived: false } }),
      prisma.habitLog.count({ where: { userId, completedAt: today } }),
    ]);
    return { total, completed, percentage: total ? Math.round((completed / total) * 100) : 0 };
  }

  // ─── All active habits with today's completion ───
  async getTodayHabits(userId) {
    const today = new Date(new Date().toISOString().split('T')[0]);
    return prisma.habit.findMany({
      where: { userId, isArchived: false },
      include: {
        logs: { where: { completedAt: today }, take: 1 },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ─── Last N days of habit logs per day for streaks ───
  async getAllHabitLogs(userId, days = 365) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return prisma.habitLog.findMany({
      where: { userId, completedAt: { gte: since } },
      select: { completedAt: true, habitId: true },
      orderBy: { completedAt: 'desc' },
    });
  }

  // ─── Weekly progress: last 7 days per-day completion % ───
  async getWeeklyProgress(userId) {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      days.push(new Date(d.toISOString().split('T')[0]));
    }
    const total = await prisma.habit.count({ where: { userId, isArchived: false, frequency: 'DAILY' } });
    const results = await Promise.all(
      days.map(async (day) => {
        const completed = await prisma.habitLog.count({ where: { userId, completedAt: day } });
        return {
          day: day.toLocaleDateString('en-US', { weekday: 'short' }),
          value: total ? Math.round((completed / total) * 100) : 0,
          date: day.toISOString().split('T')[0],
        };
      })
    );
    const maxVal = Math.max(...results.map((r) => r.value), 1);
    return results.map((r) => ({ ...r, isHighest: r.value === maxVal && r.value > 0 }));
  }

  // ─── Habit consistency: top 5 habits × last 28 days ───
  async getHabitConsistency(userId) {
    const habits = await prisma.habit.findMany({
      where: { userId, isArchived: false },
      orderBy: { createdAt: 'asc' },
    });
    if (!habits.length) return [];

    const now = new Date();
    const days = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      days.push(new Date(d.toISOString().split('T')[0]));
    }

    const since = new Date(now);
    since.setDate(now.getDate() - 28);
    const logs = await prisma.habitLog.findMany({
      where: { userId, completedAt: { gte: since } },
      select: { habitId: true, completedAt: true },
    });
    const logSet = new Set(logs.map((l) => `${l.habitId}_${new Date(l.completedAt).toISOString().split('T')[0]}`));

    return habits.map((h) => ({
      name: h.name,
      color: h.color,
      days: days.map((d) => (logSet.has(`${h.id}_${d.toISOString().split('T')[0]}`) ? 1 : 0)),
    }));
  }

  // ─── Goals progress ───
  async getGoalsProgress(userId) {
    const goals = await prisma.goal.findMany({
      where: { userId, status: 'IN_PROGRESS' },
      include: { milestones: true },
      orderBy: { createdAt: 'asc' },
      take: 5,
    });
    const colors = ['#6366f1', '#E8B94A', '#10b981', '#f97316', '#06b6d4'];
    return goals.map((g, i) => {
      const total = g.milestones.length;
      const done = g.milestones.filter((m) => m.isCompleted).length;
      const pct = total ? Math.round((done / total) * 100) : g.progress || 0;
      return { id: g.id, name: g.title, pct, color: colors[i % colors.length], endDate: g.endDate };
    });
  }

  // ─── Upcoming: goals near deadline + uncompleted habits today ───
  async getUpcoming(userId) {
    const today = new Date(new Date().toISOString().split('T')[0]);
    const in7Days = new Date(today);
    in7Days.setDate(today.getDate() + 7);

    const [goalsDue, pendingHabits] = await Promise.all([
      prisma.goal.findMany({
        where: { userId, status: 'IN_PROGRESS', endDate: { gte: today, lte: in7Days } },
        orderBy: { endDate: 'asc' },
        take: 2,
      }),
      prisma.habit.findMany({
        where: {
          userId, isArchived: false, frequency: 'DAILY',
          logs: { none: { completedAt: today } },
        },
        take: 2,
      }),
    ]);

    const upcoming = [];
    for (const g of goalsDue) {
      const diff = Math.ceil((new Date(g.endDate) - today) / 86400000);
      upcoming.push({
        title: g.title,
        subtitle: diff === 0 ? 'Due today!' : `Due in ${diff} day${diff > 1 ? 's' : ''}`,
        type: 'goal',
        icon: 'target',
      });
    }
    for (const h of pendingHabits) {
      upcoming.push({ title: h.name, subtitle: 'Not done today', type: 'habit', icon: h.icon });
    }
    return upcoming.slice(0, 3);
  }

  // ─── Smart summary from last 7 days ───
  async getSmartSummary(userId) {
    const habits = await prisma.habit.findMany({ where: { userId, isArchived: false } });
    if (!habits.length) return null;

    const since = new Date();
    since.setDate(since.getDate() - 7);
    const logs = await prisma.habitLog.findMany({
      where: { userId, completedAt: { gte: since } },
      select: { habitId: true },
    });
    const countMap = {};
    for (const l of logs) {
      countMap[l.habitId] = (countMap[l.habitId] || 0) + 1;
    }
    const habitStats = habits.map((h) => ({
      id: h.id, name: h.name, count: countMap[h.id] || 0, pct: Math.round(((countMap[h.id] || 0) / 7) * 100),
    }));
    const sorted = [...habitStats].sort((a, b) => b.count - a.count);
    const mostConsistent = sorted[0];
    const topPerformer = sorted.find((h) => h.pct >= 50) || sorted[0];
    const needsAttention = [...habitStats].sort((a, b) => a.count - b.count)[0];

    const avg = Math.round(habitStats.reduce((s, h) => s + h.pct, 0) / habitStats.length);
    let message = "Keep pushing — every day counts!";
    if (avg >= 80) message = "Outstanding week! You're crushing your habits! 🔥";
    else if (avg >= 60) message = "Great consistency this week. Keep the momentum going!";
    else if (avg >= 40) message = "Solid effort this week. A few more habits and you'll be unstoppable!";
    else message = "Rough week? That's okay. Small steps lead to big results.";

    return {
      message,
      mostConsistent: mostConsistent ? { name: mostConsistent.name, streak: mostConsistent.count } : null,
      topPerformer: topPerformer ? { name: topPerformer.name, pct: topPerformer.pct } : null,
      needsAttention: needsAttention ? { name: needsAttention.name, daysThisWeek: needsAttention.count } : null,
    };
  }

  // ─── Focus time today + last 7 days sparkline ───
  async getFocusStats(userId) {
    const today = new Date(new Date().toISOString().split('T')[0]);
    const todaySessions = await prisma.focusSession.findMany({
      where: { userId, completedAt: { not: null }, createdAt: { gte: today } },
      select: { actualMins: true },
    });
    const focusTimeToday = todaySessions.reduce((s, f) => s + (f.actualMins || 0), 0);

    // Last 7 days sparkline
    const sparkline = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.toISOString().split('T')[0]);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const sessions = await prisma.focusSession.findMany({
        where: { userId, completedAt: { not: null }, createdAt: { gte: dayStart, lt: dayEnd } },
        select: { actualMins: true },
      });
      sparkline.push(sessions.reduce((s, f) => s + (f.actualMins || 0), 0));
    }

    // This week vs last week delta
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const lastWeekStart = new Date();
    lastWeekStart.setDate(lastWeekStart.getDate() - 14);

    const [thisWeekMins, lastWeekMins] = await Promise.all([
      prisma.focusSession.aggregate({
        where: { userId, completedAt: { not: null }, createdAt: { gte: weekStart } },
        _sum: { actualMins: true },
      }),
      prisma.focusSession.aggregate({
        where: { userId, completedAt: { not: null }, createdAt: { gte: lastWeekStart, lt: weekStart } },
        _sum: { actualMins: true },
      }),
    ]);
    const thisW = thisWeekMins._sum.actualMins || 0;
    const lastW = lastWeekMins._sum.actualMins || 0;
    const weekDelta = lastW ? Math.round(((thisW - lastW) / lastW) * 100) : 0;

    return { focusTimeToday, focusSparkline: sparkline, focusTimeWeekDelta: weekDelta };
  }

  // ─── User XP + level ───
  async getUserXp(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { totalXp: true, level: true } });
    return user || { totalXp: 0, level: 1 };
  }

  // ─── Best streak across all habits ───
  async getBestCurrentStreak(userId) {
    const habits = await prisma.habit.findMany({
      where: { userId, isArchived: false },
      select: { id: true },
    });
    if (!habits.length) return { currentStreak: 0, bestStreak: 0 };

    let maxCurrent = 0;
    let maxBest = 0;
    for (const h of habits) {
      const logs = await prisma.habitLog.findMany({
        where: { habitId: h.id },
        select: { completedAt: true },
        orderBy: { completedAt: 'desc' },
        take: 365,
      });
      const dates = logs.map((l) => l.completedAt);
      const current = _calculateStreak(dates);
      const best = _calculateBestStreak(dates);
      if (current > maxCurrent) maxCurrent = current;
      if (best > maxBest) maxBest = best;
    }
    return { currentStreak: maxCurrent, bestStreak: maxBest };
  }

  // ─── Completion sparkline (last 7 days habit count) ───
  async getCompletionSparkline(userId) {
    const sparkline = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const day = new Date(d.toISOString().split('T')[0]);
      const count = await prisma.habitLog.count({ where: { userId, completedAt: day } });
      sparkline.push(count);
    }
    return sparkline;
  }
}

// ─── Pure streak helpers ───
function _calculateStreak(dates) {
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
      checkDate = new Date(logDate);
      streak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function _calculateBestStreak(dates) {
  if (!dates.length) return 0;
  const sorted = [...dates].sort((a, b) => new Date(a) - new Date(b));
  let best = 1, current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    prev.setHours(0, 0, 0, 0);
    curr.setHours(0, 0, 0, 0);
    const diff = (curr - prev) / 86400000;
    if (diff === 1) { current++; best = Math.max(best, current); }
    else if (diff > 1) { current = 1; }
  }
  return best;
}

export const dashboardRepository = new DashboardRepository();
