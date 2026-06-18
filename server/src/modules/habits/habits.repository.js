import { prisma } from '../../config/database.js';

class HabitsRepository {
  async findAllByUser(userId) {
    return prisma.habit.findMany({
      where: { userId, isArchived: false },
      include: { logs: { where: { completedAt: { gte: new Date(new Date().toISOString().split('T')[0]) } }, take: 1 } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findAllIncludingArchived(userId) {
    return prisma.habit.findMany({
      where: { userId },
      include: { logs: { where: { completedAt: { gte: new Date(new Date().toISOString().split('T')[0]) } }, take: 1 } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id) {
    return prisma.habit.findUnique({ where: { id }, include: { logs: { orderBy: { completedAt: 'desc' }, take: 30 } } });
  }

  async create(userId, data) {
    return prisma.habit.create({ data: { ...data, userId } });
  }

  async update(id, data) {
    return prisma.habit.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.habit.delete({ where: { id } });
  }

  async findLog(habitId, date) {
    return prisma.habitLog.findUnique({ where: { habitId_completedAt: { habitId, completedAt: new Date(date) } } });
  }

  async createLog(habitId, userId, date, note) {
    return prisma.habitLog.create({ data: { habitId, userId, completedAt: new Date(date), note } });
  }

  async deleteLog(habitId, date) {
    return prisma.habitLog.delete({ where: { habitId_completedAt: { habitId, completedAt: new Date(date) } } });
  }

  async getCompletionStats(userId, startDate, endDate) {
    return prisma.habitLog.groupBy({
      by: ['completedAt'],
      where: { userId, completedAt: { gte: new Date(startDate), lte: new Date(endDate) } },
      _count: { id: true },
    });
  }

  async getStreakData(habitId) {
    return prisma.habitLog.findMany({
      where: { habitId },
      select: { completedAt: true },
      orderBy: { completedAt: 'desc' },
      take: 365,
    });
  }

  // ─── Rich stats for habits page ───
  async getRichStats(userId) {
    const now = new Date();
    const today = new Date(now.toISOString().split('T')[0]);

    // Start of this week (Monday)
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));

    // Start of this month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all active daily habits
    const [activeHabits, archivedCount] = await Promise.all([
      prisma.habit.findMany({
        where: { userId, isArchived: false },
        include: { logs: { orderBy: { completedAt: 'desc' }, take: 365 } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.habit.count({ where: { userId, isArchived: true } }),
    ]);

    // Today's completions
    const completedToday = activeHabits.filter((h) => h.logs.some((l) => new Date(l.completedAt).toISOString().split('T')[0] === today.toISOString().split('T')[0])).length;
    const todayPct = activeHabits.length ? Math.round((completedToday / activeHabits.length) * 100) : 0;

    // Streaks
    let maxStreak = 0, maxBestStreak = 0;
    for (const h of activeHabits) {
      const dates = h.logs.map((l) => l.completedAt);
      const cur = _calculateStreak(dates);
      const best = _calculateBestStreak(dates);
      if (cur > maxStreak) maxStreak = cur;
      if (best > maxBestStreak) maxBestStreak = best;
    }

    // Weekly consistency
    const weekDays = 7;
    let weekCompleted = 0, weekPossible = 0;
    for (const h of activeHabits) {
      if (h.frequency !== 'DAILY') continue;
      weekPossible += weekDays;
      weekCompleted += h.logs.filter((l) => new Date(l.completedAt) >= weekStart).length;
    }
    const weeklyPct = weekPossible ? Math.round((weekCompleted / weekPossible) * 100) : 0;

    // Monthly consistency
    const dayOfMonth = now.getDate();
    let monthCompleted = 0, monthPossible = 0;
    for (const h of activeHabits) {
      if (h.frequency !== 'DAILY') continue;
      monthPossible += dayOfMonth;
      monthCompleted += h.logs.filter((l) => new Date(l.completedAt) >= monthStart).length;
    }
    const monthlyPct = monthPossible ? Math.round((monthCompleted / monthPossible) * 100) : 0;

    // Weekly overview (last 7 days: per-day completion %)
    const weeklyOverview = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const dayDate = new Date(dayStr);
      const count = activeHabits.filter((h) => h.frequency === 'DAILY' && h.logs.some((l) => new Date(l.completedAt).toISOString().split('T')[0] === dayStr)).length;
      const total = activeHabits.filter((h) => h.frequency === 'DAILY').length;
      weeklyOverview.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: dayStr,
        completed: count,
        total,
        pct: total ? Math.round((count / total) * 100) : 0,
        isToday: dayStr === today.toISOString().split('T')[0],
      });
    }

    // Calendar: days in current month with completion data
    const calendarStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const calendarEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const monthLogs = await prisma.habitLog.findMany({
      where: { userId, completedAt: { gte: calendarStart, lte: calendarEnd } },
      select: { completedAt: true },
    });
    const logDates = new Set(monthLogs.map((l) => new Date(l.completedAt).toISOString().split('T')[0]));

    // Top habits (by streak + consistency)
    const topHabits = activeHabits
      .filter((h) => h.frequency === 'DAILY')
      .map((h) => {
        const cur = _calculateStreak(h.logs.map((l) => l.completedAt));
        const last30 = h.logs.filter((l) => new Date(l.completedAt) >= new Date(now.getTime() - 30 * 86400000)).length;
        return {
          id: h.id,
          name: h.name,
          color: h.color,
          icon: h.icon,
          category: h.category,
          streak: cur,
          consistencyPct: Math.round((last30 / 30) * 100),
        };
      })
      .sort((a, b) => b.streak - a.streak || b.consistencyPct - a.consistencyPct)
      .slice(0, 5);

    // Categories breakdown
    const categoryColors = {
      mindfulness: '#8b5cf6',
      fitness: '#10b981',
      learning: '#f59e0b',
      career: '#6366f1',
      health: '#ef4444',
      general: '#06b6d4',
    };
    const CATS = ['mindfulness', 'fitness', 'learning', 'career', 'health'];
    const categories = CATS.map((cat) => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      key: cat,
      count: activeHabits.filter((h) => h.category === cat).length,
      color: categoryColors[cat] || '#06b6d4',
    }));

    // Per-habit streak (to include in habit list)
    const habitsWithStreak = activeHabits.map((h) => ({
      id: h.id,
      name: h.name,
      color: h.color,
      icon: h.icon,
      category: h.category,
      frequency: h.frequency,
      isArchived: h.isArchived,
      completedToday: h.logs.some((l) => new Date(l.completedAt).toISOString().split('T')[0] === today.toISOString().split('T')[0]),
      currentStreak: _calculateStreak(h.logs.map((l) => l.completedAt)),
      consistencyPct: Math.round((h.logs.filter((l) => new Date(l.completedAt) >= new Date(now.getTime() - 30 * 86400000)).length / 30) * 100),
      createdAt: h.createdAt,
    }));

    return {
      totalActive: activeHabits.length,
      totalArchived: archivedCount,
      completedToday,
      todayPct,
      currentStreak: maxStreak,
      bestStreak: maxBestStreak,
      weeklyPct,
      weekCompleted,
      weekTotal: activeHabits.filter((h) => h.frequency === 'DAILY').length,
      monthlyPct,
      monthCompleted,
      monthTotal: activeHabits.filter((h) => h.frequency === 'DAILY').length,
      weeklyOverview,
      logDates: Array.from(logDates),
      topHabits,
      categories,
      habits: habitsWithStreak,
    };
  }

  // ─── Calendar Stats ───
  async getCalendarStats(userId, year, month, selectedDate) {
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const startOfMonth = new Date(Date.UTC(y, m - 1, 1));
    const endOfMonth   = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
    const prevM = m === 1 ? 12 : m - 1;
    const prevY = m === 1 ? y - 1 : y;
    const startOfPrevMonth = new Date(Date.UTC(prevY, prevM - 1, 1));
    const endOfPrevMonth   = new Date(Date.UTC(prevY, prevM, 0, 23, 59, 59, 999));
    const today    = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const habits      = await prisma.habit.findMany({ where: { userId, isArchived: false }, orderBy: { createdAt: 'asc' } });
    const totalHabits = habits.length;
    const monthLogs = await prisma.habitLog.findMany({
      where: { userId, completedAt: { gte: startOfMonth, lte: endOfMonth } },
      select: { completedAt: true, habitId: true },
    });
    const logsByDate = {};
    for (const log of monthLogs) {
      const ds = log.completedAt.toISOString().split('T')[0];
      if (!logsByDate[ds]) logsByDate[ds] = new Set();
      logsByDate[ds].add(log.habitId);
    }
    const daysInMonth  = new Date(y, m, 0).getDate();
    const calendarDays = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const ds       = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isFuture = ds > todayStr;
      const isToday  = ds === todayStr;
      const logged   = logsByDate[ds]?.size ?? 0;
      const pct      = totalHabits > 0 ? Math.round((logged / totalHabits) * 100) : 0;
      let status     = 'no-data';
      if (isFuture)                   status = 'future';
      else if (totalHabits === 0)     status = 'no-data';
      else if (logged === 0)          status = 'missed';
      else if (logged >= totalHabits) status = 'completed';
      else                            status = 'partial';
      calendarDays.push({ date: ds, status, pct, isToday });
    }
    const perfectDays    = calendarDays.filter((d) => d.status === 'completed').length;
    const pastDays       = calendarDays.filter((d) => d.status !== 'future' && d.status !== 'no-data');
    const completionRate = pastDays.length > 0 ? Math.round(pastDays.reduce((s, d) => s + d.pct, 0) / pastDays.length) : 0;
    const prevMonthLogs = await prisma.habitLog.findMany({
      where: { userId, completedAt: { gte: startOfPrevMonth, lte: endOfPrevMonth } },
      select: { completedAt: true, habitId: true },
    });
    const prevLogsByDate = {};
    for (const log of prevMonthLogs) {
      const ds = log.completedAt.toISOString().split('T')[0];
      if (!prevLogsByDate[ds]) prevLogsByDate[ds] = new Set();
      prevLogsByDate[ds].add(log.habitId);
    }
    const prevDaysInMonth = new Date(prevY, prevM, 0).getDate();
    let prevRateSum = 0, prevRateCount = 0;
    for (let d = 1; d <= prevDaysInMonth; d++) {
      const ds     = `${prevY}-${String(prevM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (ds >= todayStr || totalHabits === 0) continue;
      const logged = prevLogsByDate[ds]?.size ?? 0;
      prevRateSum += Math.round((logged / totalHabits) * 100);
      prevRateCount++;
    }
    const prevCompletionRate     = prevRateCount > 0 ? Math.round(prevRateSum / prevRateCount) : 0;
    const completionRateChangePct = completionRate - prevCompletionRate;
    const allLogs = await prisma.habitLog.findMany({
      where: { userId },
      select: { completedAt: true, habitId: true },
      orderBy: { completedAt: 'desc' },
    });
    const allLogsByDate = {};
    for (const log of allLogs) {
      const ds = log.completedAt.toISOString().split('T')[0];
      if (!allLogsByDate[ds]) allLogsByDate[ds] = new Set();
      allLogsByDate[ds].add(log.habitId);
    }
    let currentStreak = 0;
    { const chk = new Date(todayStr); while (true) { const ds = chk.toISOString().split('T')[0]; if (totalHabits === 0 || (allLogsByDate[ds]?.size ?? 0) < totalHabits) break; currentStreak++; chk.setDate(chk.getDate() - 1); } }
    let bestStreak = 0;
    { const fd = Object.keys(allLogsByDate).filter((ds) => totalHabits > 0 && (allLogsByDate[ds]?.size ?? 0) >= totalHabits).sort(); let cur = 0, prev = null; for (const ds of fd) { cur = (prev && (new Date(ds) - new Date(prev)) / 86400000 === 1) ? cur + 1 : 1; bestStreak = Math.max(bestStreak, cur); prev = ds; } bestStreak = Math.max(bestStreak, currentStreak); }
    const pctToRecord = bestStreak > 0 ? Math.min(100, Math.round((currentStreak / bestStreak) * 100)) : (currentStreak > 0 ? 100 : 0);
    const user        = await prisma.user.findUnique({ where: { id: userId }, select: { totalXp: true } });
    const xpThisMonth = monthLogs.length * 10;
    const selDateStr  = selectedDate || todayStr;
    const selLogs     = await prisma.habitLog.findMany({ where: { userId, completedAt: new Date(selDateStr) }, select: { habitId: true } });
    const completedIds = new Set(selLogs.map((l) => l.habitId));
    const selStart = new Date(`${selDateStr}T00:00:00.000Z`);
    const selEnd   = new Date(`${selDateStr}T23:59:59.999Z`);
    const focusSessions = await prisma.focusSession.findMany({ where: { userId, createdAt: { gte: selStart, lte: selEnd } }, select: { actualMins: true, duration: true } });
    const focusMinutes  = focusSessions.reduce((s, sess) => s + (sess.actualMins ?? sess.duration), 0);
    const reflection    = await prisma.reflection.findFirst({ where: { userId, date: new Date(selDateStr) }, select: { mood: true } }).catch(() => null);
    const completedCount = selLogs.length;
    const selectedDay = {
      date: selDateStr,
      habits: habits.map((h) => ({ id: h.id, name: h.name, icon: h.icon, category: h.category, color: h.color, frequency: h.frequency, completed: completedIds.has(h.id) })),
      completedCount,
      totalCount: totalHabits,
      focusMinutes,
      productivity: totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0,
      moodScore: reflection?.mood ?? null,
    };
    const momentum = [];
    for (let i = 7; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const ds = d.toISOString().split('T')[0]; const label = `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}`; const logged = allLogsByDate[ds]?.size ?? 0; let type = 'missed'; if (totalHabits > 0) { if (logged >= totalHabits) type = 'streak'; else if (logged >= totalHabits * 0.75) type = 'high-perf'; else if (logged > 0) type = 'partial'; } momentum.push({ date: ds, label, type, pct: totalHabits > 0 ? Math.round((logged / totalHabits) * 100) : 0, isToday: ds === todayStr }); }
    if (bestStreak > 0) { const si = momentum.findIndex((m) => m.type === 'streak'); if (si !== -1 && currentStreak >= bestStreak) momentum[si].type = 'milestone'; }
    const consistencyTrend = [];
    for (let i = 29; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const ds = d.toISOString().split('T')[0]; const logged = allLogsByDate[ds]?.size ?? 0; const pct = totalHabits > 0 ? Math.round((logged / totalHabits) * 100) : 0; if ([1, 8, 15, 22, 29].includes(i) || i === 0) { consistencyTrend.push({ label: `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}`, pct, date: ds }); } }
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentLogs = await prisma.habitLog.findMany({ where: { userId, completedAt: { gte: thirtyDaysAgo } }, select: { habitId: true } });
    const habitCounts = {}; for (const h of habits) habitCounts[h.id] = 0; for (const l of recentLogs) { if (habitCounts[l.habitId] !== undefined) habitCounts[l.habitId]++; }
    const habitStats = habits.map((h) => ({ id: h.id, name: h.name, icon: h.icon, category: h.category, color: h.color, completedCount: habitCounts[h.id] ?? 0, successRate: Math.min(100, Math.round(((habitCounts[h.id] ?? 0) / 30) * 100)) })).sort((a, b) => b.successRate - a.successRate);
    const bestHabit  = habitStats[0] ?? null;
    const worstHabit = habitStats.length > 1 ? habitStats[habitStats.length - 1] : null;
    return {
      streak: { current: currentStreak, best: bestStreak, pctToRecord },
      completionRate, completionRateChangePct, totalXP: user?.totalXp ?? 0, xpThisMonth, perfectDays, calendarDays, selectedDay, momentum, consistencyTrend, bestHabit,
      worstHabit: worstHabit?.id !== bestHabit?.id ? worstHabit : null,
    };
  }
}


function _calculateStreak(dates) {
  if (!dates.length) return 0;
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let checkDate = new Date(today);
  const sorted = [...dates].sort((a, b) => new Date(b) - new Date(a));
  for (const d of sorted) {
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
  const sorted = [...dates].map((d) => new Date(d)).sort((a, b) => a - b);
  let best = 1, current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    prev.setHours(0, 0, 0, 0); curr.setHours(0, 0, 0, 0);
    const diff = (curr - prev) / 86400000;
    if (diff === 1) { current++; best = Math.max(best, current); }
    else if (diff > 1) { current = 1; }
  }
  return best;
}


export const habitsRepository = new HabitsRepository();
