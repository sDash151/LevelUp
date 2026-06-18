import { reflectionsRepository } from './reflections.repository.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { UnauthorizedError } from '../../shared/errors/AuthError.js';
import { ConflictError } from '../../shared/errors/ConflictError.js';

class ReflectionsService {
  async getReflections(userId, type, page, limit) {
    return reflectionsRepository.findAllByUser(userId, type, page, limit);
  }

  async getReflection(userId, id) {
    const r = await reflectionsRepository.findById(id);
    if (!r) throw new NotFoundError('Reflection');
    if (r.userId !== userId) throw new UnauthorizedError('Not your reflection');
    return r;
  }

  async createReflection(userId, data) {
    const existing = await reflectionsRepository.findByDate(userId, data.date, data.type);
    if (existing) throw new ConflictError(`You already have a ${data.type.toLowerCase()} reflection for this date`);
    return reflectionsRepository.create(userId, data);
  }

  async updateReflection(userId, id, data) {
    const r = await reflectionsRepository.findById(id);
    if (!r) throw new NotFoundError('Reflection');
    if (r.userId !== userId) throw new UnauthorizedError('Not your reflection');
    return reflectionsRepository.update(id, data);
  }

  async deleteReflection(userId, id) {
    const r = await reflectionsRepository.findById(id);
    if (!r) throw new NotFoundError('Reflection');
    if (r.userId !== userId) throw new UnauthorizedError('Not your reflection');
    return reflectionsRepository.delete(id);
  }

  async getMoodHistory(userId, days) {
    return reflectionsRepository.getMoodHistory(userId, days);
  }

  async getStats(userId) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get all reflections for this month and last month
    const allReflections = await reflectionsRepository.findAllForStats(userId);
    const thisMonth = allReflections.filter(r => r.date >= monthStart && r.date <= monthEnd);
    const lastMonth = allReflections.filter(r => r.date >= lastMonthStart && r.date <= lastMonthEnd);

    // --- Streak ---
    const { streak, bestStreak, weekDots } = _computeStreak(allReflections, now);

    // --- Average Mood ---
    const moodsThisMonth = thisMonth.filter(r => r.mood != null).map(r => r.mood);
    const moodsLastMonth = lastMonth.filter(r => r.mood != null).map(r => r.mood);
    const avgMood = moodsThisMonth.length ? +(moodsThisMonth.reduce((a, b) => a + b, 0) / moodsThisMonth.length).toFixed(1) : 0;
    const avgMoodLast = moodsLastMonth.length ? +(moodsLastMonth.reduce((a, b) => a + b, 0) / moodsLastMonth.length).toFixed(1) : 0;
    const avgMoodChange = +(avgMood - avgMoodLast).toFixed(1);
    const moodLabel = avgMood >= 4.5 ? 'Amazing' : avgMood >= 3.5 ? 'Great' : avgMood >= 2.5 ? 'Good' : avgMood >= 1.5 ? 'Okay' : 'Low';

    // --- Growth Score ---
    const consistencyScore = thisMonth.length > 0 ? Math.min(100, Math.round((thisMonth.length / now.getDate()) * 100)) : 0;
    const moodScore = avgMood > 0 ? Math.round((avgMood / 5) * 100) : 0;
    const depthScore = thisMonth.filter(r => r.gratitude || r.improvements).length;
    const depthPct = thisMonth.length > 0 ? Math.round((depthScore / thisMonth.length) * 100) : 0;
    const growthScore = Math.round(consistencyScore * 0.4 + moodScore * 0.3 + depthPct * 0.3);
    const lastConsistency = lastMonth.length > 0 ? Math.min(100, Math.round((lastMonth.length / lastMonthEnd.getDate()) * 100)) : 0;
    const lastMoodScore = avgMoodLast > 0 ? Math.round((avgMoodLast / 5) * 100) : 0;
    const lastDepthCount = lastMonth.filter(r => r.gratitude || r.improvements).length;
    const lastDepthPct = lastMonth.length > 0 ? Math.round((lastDepthCount / lastMonth.length) * 100) : 0;
    const lastGrowthScore = Math.round(lastConsistency * 0.4 + lastMoodScore * 0.3 + lastDepthPct * 0.3);
    const growthScoreChange = growthScore - lastGrowthScore;
    const growthLabel = growthScore >= 80 ? 'High' : growthScore >= 60 ? 'Good' : growthScore >= 40 ? 'Fair' : 'Low';

    // --- Monthly Count ---
    const monthlyCount = thisMonth.length;
    const lastMonthlyCount = lastMonth.length;
    const monthlyCountChange = lastMonthlyCount > 0 ? Math.round(((monthlyCount - lastMonthlyCount) / lastMonthlyCount) * 100) : (monthlyCount > 0 ? 100 : 0);

    // --- Calendar Days ---
    const daysInMonth = monthEnd.getDate();
    const reflectionDates = new Set(thisMonth.map(r => r.date.toISOString().split('T')[0]));
    const calendarDays = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isPast = d <= now.getDate();
      calendarDays.push({
        date: dateStr,
        hasEntry: reflectionDates.has(dateStr),
        missed: isPast && !reflectionDates.has(dateStr),
      });
    }

    // --- Top Emotions (derived from tags) ---
    const emotionMap = {};
    const EMOTION_CONFIG = {
      Grateful: { emoji: '😊', color: '#10b981' },
      Motivated: { emoji: '💪', color: '#E8B94A' },
      Calm: { emoji: '😌', color: '#06b6d4' },
      Anxious: { emoji: '😰', color: '#f97316' },
      Tired: { emoji: '😴', color: '#ef4444' },
      Happy: { emoji: '😊', color: '#10b981' },
      Focused: { emoji: '🎯', color: '#6366f1' },
      Stressed: { emoji: '😣', color: '#ef4444' },
      Productive: { emoji: '⚡', color: '#E8B94A' },
      Relaxed: { emoji: '🧘', color: '#06b6d4' },
    };
    // Derive emotions from mood values
    thisMonth.forEach(r => {
      if (r.mood >= 4) { emotionMap['Grateful'] = (emotionMap['Grateful'] || 0) + 1; }
      if (r.mood >= 4) { emotionMap['Motivated'] = (emotionMap['Motivated'] || 0) + 1; }
      if (r.mood === 3) { emotionMap['Calm'] = (emotionMap['Calm'] || 0) + 1; }
      if (r.mood <= 2 && r.mood != null) { emotionMap['Anxious'] = (emotionMap['Anxious'] || 0) + 1; }
      if (r.mood === 1) { emotionMap['Tired'] = (emotionMap['Tired'] || 0) + 1; }
      // Also count from tags
      (r.tags || []).forEach(tag => {
        const normalized = tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
        if (EMOTION_CONFIG[normalized]) {
          emotionMap[normalized] = (emotionMap[normalized] || 0) + 1;
        }
      });
    });
    const totalEmotions = Object.values(emotionMap).reduce((a, b) => a + b, 0) || 1;
    const topEmotions = Object.entries(emotionMap)
      .map(([name, count]) => ({
        name,
        emoji: EMOTION_CONFIG[name]?.emoji || '🙂',
        pct: Math.round((count / totalEmotions) * 100),
        color: EMOTION_CONFIG[name]?.color || '#71717a',
      }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 5);

    // --- Top Tags ---
    const tagMap = {};
    thisMonth.forEach(r => {
      (r.tags || []).forEach(t => { tagMap[t] = (tagMap[t] || 0) + 1; });
    });
    const topTags = Object.entries(tagMap)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // --- Mood Journey (daily data for the chart) ---
    const moodJourney = [];
    for (let d = 1; d <= Math.min(daysInMonth, now.getDate()); d++) {
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const entry = thisMonth.find(r => r.date.toISOString().split('T')[0] === dateStr);
      if (entry?.mood) {
        const labels = ['', 'Bad', 'Low', 'Okay', 'Good', 'Amazing'];
        moodJourney.push({ date: dateStr, mood: entry.mood, label: labels[entry.mood] || '' });
      }
    }

    return {
      streak, bestStreak, weekDots,
      avgMood, avgMoodChange, moodLabel,
      growthScore, growthScoreChange, growthLabel,
      monthlyCount, monthlyCountChange,
      calendarDays,
      topEmotions,
      topTags,
      moodJourney,
    };
  }
}

function _computeStreak(reflections, now) {
  // Sort by date desc
  const dates = [...new Set(reflections.map(r => r.date.toISOString().split('T')[0]))].sort().reverse();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    if (dates.includes(ds)) streak++;
    else if (i > 0) break;
  }

  // Best streak (simplified — scan all dates)
  const sortedDates = [...new Set(reflections.map(r => r.date.toISOString().split('T')[0]))].sort();
  let bestStreak = 0, currentRun = 0;
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) { currentRun = 1; }
    else {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diff = (curr - prev) / 86400000;
      currentRun = diff === 1 ? currentRun + 1 : 1;
    }
    bestStreak = Math.max(bestStreak, currentRun);
  }

  // Week dots (M T W T F S S)
  const weekDots = [];
  const today = now.getDay(); // 0=Sun
  const mondayOffset = today === 0 ? 6 : today - 1;
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - mondayOffset + i);
    const ds = d.toISOString().split('T')[0];
    weekDots.push(dates.includes(ds));
  }

  return { streak, bestStreak: Math.max(bestStreak, streak), weekDots };
}

export const reflectionsService = new ReflectionsService();
