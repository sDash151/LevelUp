import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Calendar, Search, ChevronLeft, ChevronRight, TrendingUp, TrendingDown,
  MoreVertical, Trash2, Pencil, Info, ChevronDown, ArrowRight, Flame,
  Filter, BookOpen, Trophy,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { AnimatedPage } from '@/design-system/components';
import { useReflections, useReflectionStats, useCreateReflection, useDeleteReflection } from '../hooks/useReflections';
import { ReflectionForm } from '../components/ReflectionForm';
import clsx from 'clsx';

/* ═══════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════ */
const MOODS = ['', '😞', '😐', '🙂', '😊', '🤩'];
const MOOD_LABELS = ['', 'Bad', 'Low', 'Okay', 'Good', 'Amazing'];
const MOOD_COLORS = ['', '#ef4444', '#f97316', '#E8B94A', '#10b981', '#10b981'];

const TAG_COLORS = {
  Productivity: '#E8B94A', Health: '#10b981', Gratitude: '#6366f1',
  Family: '#f59e0b', Learning: '#06b6d4', Work: '#f97316',
  'Self Improvement': '#8b5cf6', 'Mental Health': '#ef4444',
};

const PROMPTS = [
  "What's one thing you did today that your future self will thank you for?",
  "What made you smile today?",
  "What challenge did you overcome recently?",
  "What are you most grateful for right now?",
  "What would you tell your past self from a week ago?",
];

/* ═══════════════════════════════════════════════════════
   HELPER
   ═══════════════════════════════════════════════════════ */
function formatReflectionDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return `Today, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  if (diffDays === 1) return `Yesterday, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  return `${d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
}

function ProgressRing({ pct = 0, size = 96, stroke = 9, color = 'var(--th-primary)', trackColor = 'var(--th-highlight)' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} stroke={trackColor} />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
        stroke={color} strokeLinecap="round"
        initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }} strokeDasharray={circ} />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   1. STAT CARDS
   ═══════════════════════════════════════════════════════ */
function StreakCard({ streak, bestStreak, weekDots }) {
  return (
    <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center gap-1 mb-1">
        <h4 className="text-[12px] font-semibold" style={{ color: 'var(--th-text-secondary)' }}>Reflection Streak</h4>
        <Flame className="w-3 h-3" style={{ color: '#f97316' }} />
      </div>
      <div className="flex items-center gap-3">
        <div>
          <p className="text-[32px] font-black leading-none" style={{ color: 'var(--th-text)' }}>{streak}</p>
          <p className="text-[12px]" style={{ color: 'var(--th-text-muted)' }}>days</p>
          <p className="text-[10px] mt-1.5 flex items-center gap-1" style={{ color: 'var(--th-text-dim)' }}>
            Best: {bestStreak} days <Trophy className="w-2.5 h-2.5" style={{ color: '#E8B94A' }} />
          </p>
        </div>
        <img src="/streak.webp" alt="" className="w-16 h-16 object-contain ml-auto" />
      </div>
      {/* Week dots */}
      <div className="flex items-center gap-2 mt-3">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className={clsx('w-4 h-4 rounded-full flex items-center justify-center text-[8px]')}
              style={{
                background: weekDots?.[i] ? 'var(--th-primary)' : 'var(--th-highlight)',
                color: weekDots?.[i] ? '#08080d' : 'var(--th-text-dim)',
              }}>
              {weekDots?.[i] ? '●' : '○'}
            </div>
            <span className="text-[8px] font-medium" style={{ color: 'var(--th-text-dim)' }}>{day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AvgMoodCard({ avgMood, moodLabel, avgMoodChange }) {
  const emoji = MOODS[Math.round(avgMood)] || '🙂';
  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center gap-1 mb-1">
        <h4 className="text-[12px] font-semibold" style={{ color: 'var(--th-text-secondary)' }}>Average Mood</h4>
        <span className="text-lg">{emoji}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[32px] font-black leading-none" style={{ color: 'var(--th-text)' }}>{avgMood}</span>
        <span className="text-[14px] font-medium" style={{ color: 'var(--th-text-dim)' }}>/ 5</span>
        <span className="text-[13px] font-semibold ml-1" style={{ color: '#10b981' }}>{moodLabel}</span>
      </div>
      <div className="flex items-center gap-1 mt-2">
        {avgMoodChange >= 0 ? <TrendingUp className="w-3 h-3" style={{ color: '#10b981' }} /> : <TrendingDown className="w-3 h-3" style={{ color: '#ef4444' }} />}
        <span className="text-[10px] font-semibold" style={{ color: avgMoodChange >= 0 ? '#10b981' : '#ef4444' }}>
          {avgMoodChange >= 0 ? '+' : ''}{avgMoodChange}
        </span>
        <span className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>vs last month</span>
      </div>
      {/* Mood bar */}
      <div className="h-1.5 rounded-full mt-3 overflow-hidden" style={{ background: 'var(--th-highlight)' }}>
        <div className="h-full rounded-full" style={{ width: `${(avgMood / 5) * 100}%`, background: 'linear-gradient(90deg, #10b981, #E8B94A, #ef4444)' }} />
      </div>
    </div>
  );
}

function GrowthScoreCard({ growthScore, growthLabel, growthScoreChange }) {
  const color = growthScore >= 70 ? '#10b981' : growthScore >= 50 ? '#E8B94A' : '#f97316';
  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center gap-1 mb-2">
        <h4 className="text-[12px] font-semibold" style={{ color: 'var(--th-text-secondary)' }}>Growth Score</h4>
        <span className="text-xs">📈</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <ProgressRing pct={growthScore} size={80} stroke={8} color={color} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[22px] font-black" style={{ color: 'var(--th-text)' }}>{growthScore}</span>
            <span className="text-[10px] mt-1" style={{ color: 'var(--th-text-dim)' }}>/100</span>
          </div>
        </div>
        <div>
          <p className="text-[13px] font-bold" style={{ color }}>{growthLabel}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" style={{ color: '#10b981' }} />
            <span className="text-[10px] font-semibold" style={{ color: '#10b981' }}>↑ {growthScoreChange}%</span>
            <span className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>vs last month</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThisMonthCard({ monthlyCount, monthlyCountChange, onNewReflection }) {
  return (
    <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <h4 className="text-[12px] font-semibold mb-1" style={{ color: 'var(--th-text-secondary)' }}>This Month</h4>
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[32px] font-black leading-none" style={{ color: 'var(--th-text)' }}>{monthlyCount}</span>
            <span className="text-[13px]" style={{ color: 'var(--th-text-muted)' }}>Reflections</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" style={{ color: '#10b981' }} />
            <span className="text-[10px] font-semibold" style={{ color: '#10b981' }}>↑ {monthlyCountChange}%</span>
            <span className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>vs last month</span>
          </div>
        </div>
        <img src="/Write.webp" alt="" className="w-14 h-14 object-contain ml-auto scale-[1.8] origin-right translate-x-3" />
      </div>
      <button onClick={onNewReflection}
        className="flex items-center justify-center gap-1.5 w-full py-2 mt-3 rounded-xl text-[12px] font-semibold transition-all hover:opacity-90"
        style={{ background: 'var(--th-primary)', color: '#08080d' }}>
        <Pencil className="w-3.5 h-3.5" /> Write Reflection
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   2. MOOD JOURNEY CHART
   ═══════════════════════════════════════════════════════ */
function MoodJourneyChart({ moodJourney = [] }) {
  const data = moodJourney.map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
  }));
  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-[14px] font-semibold" style={{ color: 'var(--th-text)' }}>Mood Journey</h3>
          <Info className="w-3.5 h-3.5" style={{ color: 'var(--th-text-dim)' }} />
        </div>
        <button className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg"
          style={{ color: 'var(--th-text-muted)', background: 'var(--th-highlight)' }}>
          This Month <ChevronDown className="w-3 h-3" />
        </button>
      </div>
      {/* Y-axis labels */}
      <div className="flex gap-3">
        <div className="flex flex-col justify-between text-[10px] shrink-0 py-1" style={{ color: 'var(--th-text-dim)', height: '180px' }}>
          <span className="flex items-center gap-1">🤩 5 Amazing</span>
          <span className="flex items-center gap-1">😊 4 Good</span>
          <span className="flex items-center gap-1">🙂 3 Okay</span>
          <span className="flex items-center gap-1">😐 2 Low</span>
          <span className="flex items-center gap-1">😞 1 Bad</span>
        </div>
        <div className="flex-1 h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--th-border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--th-text-dim)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[1, 5]} hide />
              <Tooltip
                contentStyle={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: 'var(--th-text-muted)' }}
                formatter={(value, name) => {
                  const emoji = MOODS[value] || '';
                  return [`${emoji} ${MOOD_LABELS[value]} (${value}/5)`, ''];
                }}
              />
              <Line type="monotone" dataKey="mood" stroke="#E8B94A" strokeWidth={2.5}
                dot={{ fill: '#E8B94A', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#E8B94A', stroke: '#fff', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   3. REFLECTION CALENDAR
   ═══════════════════════════════════════════════════════ */
function ReflectionCalendar({ calendarDays = [] }) {
  const [current, setCurrent] = useState(new Date());
  const year = current.getFullYear();
  const month = current.getMonth();
  const today = new Date().toISOString().split('T')[0];
  const dayMap = new Map(calendarDays.map(d => [d.date, d]));
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(offset).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  const monthName = current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-semibold" style={{ color: 'var(--th-text)' }}>Reflection Calendar</h3>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium" style={{ color: 'var(--th-text-secondary)' }}>{monthName}</span>
          <div className="flex gap-0.5">
            <button onClick={() => setCurrent(new Date(year, month - 1, 1))} className="w-5 h-5 flex items-center justify-center rounded" style={{ color: 'var(--th-text-dim)' }}>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setCurrent(new Date(year, month + 1, 1))} className="w-5 h-5 flex items-center justify-center rounded" style={{ color: 'var(--th-text-dim)' }}>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i} className="text-center text-[10px] font-semibold py-1" style={{ color: 'var(--th-text-dim)' }}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === today;
          const info = dayMap.get(dateStr);
          return (
            <div key={dateStr} className="flex items-center justify-center">
              <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium relative')}
                style={{
                  background: isToday ? 'var(--th-primary)' : info?.hasEntry ? 'rgba(232,185,74,0.12)' : 'transparent',
                  color: isToday ? '#08080d' : info?.hasEntry ? 'var(--th-primary)' : 'var(--th-text-secondary)',
                  fontWeight: isToday || info?.hasEntry ? 700 : 400,
                }}>
                {day}
                {info?.hasEntry && !isToday && <div className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full" style={{ background: '#E8B94A' }} />}
                {info?.missed && !isToday && <div className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--th-text-dim)' }} />}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 pt-2" style={{ borderTop: '1px solid var(--th-border)' }}>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: '#E8B94A' }} /><span className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>Has entry</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: 'var(--th-highlight)' }} /><span className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>No entry</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: 'var(--th-text-dim)' }} /><span className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>Missed</span></div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   4. TOP EMOTIONS
   ═══════════════════════════════════════════════════════ */
function TopEmotions({ topEmotions = [] }) {
  const DEFAULT_EMOTIONS = [
    { name: 'Grateful', emoji: '😊', color: '#10b981' },
    { name: 'Happy', emoji: '😊', color: '#10b981' },
    { name: 'Motivated', emoji: '💪', color: '#E8B94A' },
    { name: 'Productive', emoji: '⚡', color: '#E8B94A' },
    { name: 'Focused', emoji: '🎯', color: '#6366f1' },
    { name: 'Calm', emoji: '😌', color: '#06b6d4' }
  ];

  const displayEmotions = [...topEmotions];
  for (const def of DEFAULT_EMOTIONS) {
    if (displayEmotions.length >= 10) break;
    if (!displayEmotions.find(e => e.name === def.name)) {
      displayEmotions.push({ ...def, pct: 0 });
    }
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-semibold" style={{ color: 'var(--th-text)' }}>Top Emotions</h3>
        <button className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg"
          style={{ color: 'var(--th-text-muted)', background: 'var(--th-highlight)' }}>
          This Month <ChevronDown className="w-3 h-3" />
        </button>
      </div>
      <div className="space-y-2.5">
        {displayEmotions.map((e, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className="text-sm">{e.emoji}</span>
            <span className="text-[12px] font-medium w-16 shrink-0" style={{ color: 'var(--th-text-secondary)' }}>{e.name}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--th-highlight)' }}>
              <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${e.pct}%` }}
                transition={{ duration: 0.8, delay: i * 0.1 }} style={{ background: e.color }} />
            </div>
            <span className="text-[11px] font-semibold w-8 text-right" style={{ color: 'var(--th-text)' }}>{e.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   5. AI REFLECTION INSIGHT
   ═══════════════════════════════════════════════════════ */
function AIInsightCard() {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">✨</span>
        <h3 className="text-[13px] font-semibold" style={{ color: 'var(--th-text)' }}>AI Reflection Insight</h3>
      </div>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-[12px] leading-relaxed mb-1.5" style={{ color: 'var(--th-text-secondary)' }}>
            You've been more consistent with reflections in the evening.
          </p>
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--th-text-secondary)' }}>
            Your self-awareness improved <span style={{ color: '#10b981' }}>14%</span> this month.
          </p>
        </div>
        <img src="/AIInsights.webp" alt="" className="w-34 h-34 object-contain shrink-0 -mr-6" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   6. TOP REFLECTION TAGS
   ═══════════════════════════════════════════════════════ */
function TopReflectionTags({ topTags = [] }) {
  return (
    <div className="rounded-2xl p-3" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[13px] font-semibold" style={{ color: 'var(--th-text)' }}>Top Reflection Tags</h3>
        <button className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg"
          style={{ color: 'var(--th-text-muted)', background: 'var(--th-highlight)' }}>
          This Month <ChevronDown className="w-3 h-3" />
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {topTags.slice(0, 4).map((t, i) => (
          <span key={i} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold"
            style={{
              background: `${TAG_COLORS[t.tag] || 'var(--th-primary)'}15`,
              color: TAG_COLORS[t.tag] || 'var(--th-primary)',
            }}>
            {t.tag} <span className="ml-1 opacity-70">{t.count}</span>
          </span>
        ))}
      </div>
      <button className="flex items-center justify-center gap-1 w-full mt-2.5 pt-2 text-[11px] font-semibold"
        style={{ borderTop: '1px solid var(--th-border)', color: 'var(--th-text-muted)' }}>
        View All Tags <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   7. TODAY'S REFLECTION PROMPT
   ═══════════════════════════════════════════════════════ */
function ReflectionPrompt({ onUsePrompt }) {
  const prompt = PROMPTS[new Date().getDate() % PROMPTS.length];
  return (
    <div className="rounded-2xl p-3.5" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg" style={{ color: 'var(--th-primary)' }}>❝❝</span>
        <h3 className="text-[13px] font-semibold" style={{ color: 'var(--th-text)' }}>Today's Reflection Prompt</h3>
      </div>
      <p className="text-[12px] leading-relaxed mb-2" style={{ color: 'var(--th-text-secondary)' }}>
        {prompt}
      </p>
      <button onClick={onUsePrompt}
        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-[12px] font-semibold"
        style={{ background: 'rgba(232,185,74,0.12)', color: 'var(--th-primary)' }}>
        <Pencil className="w-3.5 h-3.5" /> Use Prompt
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   8. REFLECTION CARD
   ═══════════════════════════════════════════════════════ */
function ReflectionCardNew({ reflection, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const mood = reflection.mood || 3;
  const emoji = MOODS[mood] || '🙂';
  const tags = reflection.tags ?? [];

  return (
    <div className="py-4" style={{ borderBottom: '1px solid var(--th-border)' }}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-lg"
          style={{ background: `${MOOD_COLORS[mood]}15` }}>
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="text-[13px] font-semibold truncate" style={{ color: 'var(--th-text)' }}>
                {reflection.title || 'Reflection'}
              </h4>
              <p className="text-[12px] mt-0.5 line-clamp-2" style={{ color: 'var(--th-text-secondary)' }}>
                {reflection.content}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] whitespace-nowrap" style={{ color: 'var(--th-text-dim)' }}>
                {formatReflectionDate(reflection.createdAt || reflection.date)}
              </span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold"
                style={{ background: `${MOOD_COLORS[mood]}15`, color: MOOD_COLORS[mood] }}>
                {mood}/5
              </div>
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 rounded-lg hover:bg-[var(--th-highlight)]">
                  <MoreVertical className="w-4 h-4" style={{ color: 'var(--th-text-dim)' }} />
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-7 z-40 rounded-xl p-1.5 min-w-[120px] shadow-lg"
                      style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}>
                      <button onClick={() => { setMenuOpen(false); onEdit?.(reflection); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] hover:bg-[var(--th-highlight)]"
                        style={{ color: 'var(--th-text-secondary)' }}><Pencil className="w-3 h-3" /> Edit</button>
                      <button onClick={() => { setMenuOpen(false); onDelete?.(reflection.id); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] hover:bg-[var(--th-highlight)]"
                        style={{ color: '#ef4444' }}><Trash2 className="w-3 h-3" /> Delete</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              {tags.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                  style={{
                    background: `${TAG_COLORS[tag] || 'var(--th-primary)'}15`,
                    color: TAG_COLORS[tag] || 'var(--th-primary)',
                  }}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN: REFLECTIONS PAGE
   ═══════════════════════════════════════════════════════ */
export default function ReflectionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingReflection, setEditingReflection] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [tagFilter, setTagFilter] = useState('ALL');
  const [visibleCount, setVisibleCount] = useState(5);

  const typeMap = { ALL: undefined, TODAY: 'DAILY', WEEK: 'DAILY', MONTH: undefined };
  const { data: reflections = [], isLoading } = useReflections(typeMap[activeFilter]);
  const { data: stats } = useReflectionStats();
  const createReflection = useCreateReflection();
  const deleteReflectionMut = useDeleteReflection();

  const s = stats ?? {};

  const filteredReflections = useMemo(() => {
    let list = reflections;
    const now = new Date();
    if (activeFilter === 'TODAY') {
      const todayStr = now.toISOString().split('T')[0];
      list = list.filter(r => r.date?.split('T')[0] === todayStr || r.date === todayStr);
    } else if (activeFilter === 'WEEK') {
      const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
      list = list.filter(r => new Date(r.date) >= weekAgo);
    } else if (activeFilter === 'MONTH') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      list = list.filter(r => new Date(r.date) >= monthStart);
    }
    if (tagFilter !== 'ALL') {
      list = list.filter(r => (r.tags ?? []).includes(tagFilter));
    }
    return list;
  }, [reflections, activeFilter, tagFilter]);

  const allTags = useMemo(() => {
    const set = new Set();
    reflections.forEach(r => (r.tags ?? []).forEach(t => set.add(t)));
    return ['ALL', ...set];
  }, [reflections]);

  const handleSubmit = useCallback((data) => {
    createReflection.mutate(data);
    setShowForm(false);
    setEditingReflection(null);
  }, [createReflection]);

  const handleDelete = useCallback((id) => {
    deleteReflectionMut.mutate(id);
  }, [deleteReflectionMut]);

  const handleEdit = useCallback((reflection) => {
    setEditingReflection(reflection);
    setShowForm(true);
  }, []);

  return (
    <AnimatedPage>
      {/* ══════════════════════════════════════
          DESKTOP LAYOUT
          ══════════════════════════════════════ */}
      <div className="hidden lg:block">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[28px] font-bold" style={{ color: 'var(--th-text)' }}>Reflections</h1>
            <p className="text-[13px] mt-1" style={{ color: 'var(--th-text-muted)' }}>Journal your thoughts, track your mood and grow every day.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold"
              style={{ background: 'var(--th-card)', color: 'var(--th-text-secondary)', border: '1px solid var(--th-border)' }}>
              <Calendar className="w-4 h-4" /> Calendar
            </button>
            <button onClick={() => { setEditingReflection(null); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold hover:opacity-90"
              style={{ background: 'var(--th-primary)', color: '#08080d' }}>
              <Plus className="w-4 h-4" /> New Reflection
            </button>
            <button className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', color: 'var(--th-text-muted)' }}>
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          <StreakCard streak={s.streak ?? 0} bestStreak={s.bestStreak ?? 0} weekDots={s.weekDots} />
          <AvgMoodCard avgMood={s.avgMood ?? 0} moodLabel={s.moodLabel ?? ''} avgMoodChange={s.avgMoodChange ?? 0} />
          <GrowthScoreCard growthScore={s.growthScore ?? 0} growthLabel={s.growthLabel ?? ''} growthScoreChange={s.growthScoreChange ?? 0} />
          <ThisMonthCard monthlyCount={s.monthlyCount ?? 0} monthlyCountChange={s.monthlyCountChange ?? 0}
            onNewReflection={() => { setEditingReflection(null); setShowForm(true); }} />
        </div>

        {/* Mood Journey + Right Sidebar */}
        <div className="flex gap-4 mb-5">
          {/* Left: Mood Journey */}
          <div className="flex-1 min-w-0">
            <MoodJourneyChart moodJourney={s.moodJourney ?? []} />
          </div>
          {/* Right sidebar column */}
          <div className="w-[260px] shrink-0">
            <AIInsightCard />
          </div>
        </div>

        {/* Calendar + Emotions + Sidebar continued */}
        <div className="flex gap-4 mb-5">
          <div className="flex-1"><ReflectionCalendar calendarDays={s.calendarDays ?? []} /></div>
          <div className="flex-1"><TopEmotions topEmotions={s.topEmotions ?? []} /></div>
          <div className="w-[260px] shrink-0 space-y-4">
            <TopReflectionTags topTags={s.topTags ?? []} />
            <ReflectionPrompt onUsePrompt={() => { setEditingReflection(null); setShowForm(true); }} />
          </div>
        </div>

        {/* Reflections List */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-[14px] font-semibold" style={{ color: 'var(--th-text)' }}>Your Reflections</h3>
              <div className="flex items-center gap-1 ml-2">
                {['ALL', 'TODAY', 'WEEK', 'MONTH'].map(f => (
                  <button key={f} onClick={() => { setActiveFilter(f); setVisibleCount(5); }}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                    style={{
                      background: activeFilter === f ? 'var(--th-primary)' : 'transparent',
                      color: activeFilter === f ? '#08080d' : 'var(--th-text-muted)',
                    }}>
                    {f === 'ALL' ? 'All' : f === 'TODAY' ? 'Today' : f === 'WEEK' ? 'This Week' : 'This Month'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select value={tagFilter} onChange={e => { setTagFilter(e.target.value); setVisibleCount(5); }}
                className="px-3 py-1.5 rounded-lg text-[11px] font-medium appearance-none cursor-pointer"
                style={{ background: 'var(--th-highlight)', color: 'var(--th-text-secondary)', border: 'none', outline: 'none' }}>
                {allTags.map(t => <option key={t} value={t}>{t === 'ALL' ? 'All Tags' : t}</option>)}
              </select>
              <select className="px-3 py-1.5 rounded-lg text-[11px] font-medium appearance-none cursor-pointer"
                style={{ background: 'var(--th-highlight)', color: 'var(--th-text-secondary)', border: 'none', outline: 'none' }}>
                <option>Newest First</option>
                <option>Oldest First</option>
              </select>
            </div>
          </div>
          <div>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 mb-3 rounded-xl animate-pulse" style={{ background: 'var(--th-highlight)' }} />
              ))
            ) : filteredReflections.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--th-text-dim)' }} />
                <p className="text-[13px]" style={{ color: 'var(--th-text-muted)' }}>No reflections found</p>
                <button onClick={() => setShowForm(true)} className="mt-3 px-4 py-2 rounded-xl text-[12px] font-semibold"
                  style={{ background: 'var(--th-primary)', color: '#08080d' }}>Write Reflection</button>
              </div>
            ) : (
              filteredReflections.slice(0, visibleCount).map(r => (
                <ReflectionCardNew key={r.id} reflection={r} onEdit={handleEdit} onDelete={handleDelete} />
              ))
            )}
          </div>
          {(filteredReflections.length > visibleCount || visibleCount > 5) && (
            <div className="flex items-center justify-center gap-6 mt-4 pt-3 w-full" style={{ borderTop: '1px solid var(--th-border)' }}>
              {filteredReflections.length > visibleCount && (
                <button onClick={() => setVisibleCount(v => v + 5)} className="flex items-center justify-center gap-1.5 text-[12px] font-semibold cursor-pointer hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--th-text-muted)' }}>
                  Load More <ChevronDown className="w-3.5 h-3.5" />
                </button>
              )}
              {visibleCount > 5 && (
                <button onClick={() => setVisibleCount(v => Math.max(5, v - 5))} className="flex items-center justify-center gap-1.5 text-[12px] font-semibold cursor-pointer hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--th-text-muted)' }}>
                  Hide Some <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          MOBILE LAYOUT
          ══════════════════════════════════════ */}
      <div className="lg:hidden pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[22px] font-bold" style={{ color: 'var(--th-text)' }}>Reflections</h1>
            <p className="text-[11px]" style={{ color: 'var(--th-text-muted)' }}>Journal your thoughts, track your mood and grow.</p>
          </div>
          <div className="flex items-center mr-12">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', color: 'var(--th-text-muted)' }}>
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StreakCard streak={s.streak ?? 0} bestStreak={s.bestStreak ?? 0} weekDots={s.weekDots} />
          <AvgMoodCard avgMood={s.avgMood ?? 0} moodLabel={s.moodLabel ?? ''} avgMoodChange={s.avgMoodChange ?? 0} />
          <GrowthScoreCard growthScore={s.growthScore ?? 0} growthLabel={s.growthLabel ?? ''} growthScoreChange={s.growthScoreChange ?? 0} />
          <ThisMonthCard monthlyCount={s.monthlyCount ?? 0} monthlyCountChange={s.monthlyCountChange ?? 0}
            onNewReflection={() => { setEditingReflection(null); setShowForm(true); }} />
        </div>

        {/* Mood Journey */}
        <div className="mb-4"><MoodJourneyChart moodJourney={s.moodJourney ?? []} /></div>

        {/* Calendar + Emotions row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <ReflectionCalendar calendarDays={s.calendarDays ?? []} />
          <TopEmotions topEmotions={s.topEmotions ?? []} />
        </div>

        {/* Reflections List */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14px] font-semibold" style={{ color: 'var(--th-text)' }}>Your Reflections</h3>
          </div>
          <div className="flex items-center gap-1 mb-3 overflow-x-auto scrollbar-hide">
            {['ALL', 'TODAY', 'WEEK', 'MONTH'].map(f => (
              <button key={f} onClick={() => { setActiveFilter(f); setVisibleCount(5); }}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0"
                style={{
                  background: activeFilter === f ? 'var(--th-primary)' : 'var(--th-highlight)',
                  color: activeFilter === f ? '#08080d' : 'var(--th-text-muted)',
                }}>
                {f === 'ALL' ? 'All' : f === 'TODAY' ? 'Today' : f === 'WEEK' ? 'Week' : 'Month'}
              </button>
            ))}
          </div>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 mb-3 rounded-xl animate-pulse" style={{ background: 'var(--th-card)' }} />
            ))
          ) : filteredReflections.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--th-text-dim)' }} />
              <p className="text-[12px]" style={{ color: 'var(--th-text-muted)' }}>No reflections yet</p>
            </div>
          ) : (
            filteredReflections.slice(0, visibleCount).map(r => (
              <ReflectionCardNew key={r.id} reflection={r} onEdit={handleEdit} onDelete={handleDelete} />
            ))
          )}
          {(filteredReflections.length > visibleCount || visibleCount > 5) && (
            <div className="flex items-center gap-4 mt-2">
              {filteredReflections.length > visibleCount && (
                <button onClick={() => setVisibleCount(v => v + 5)} className="flex items-center gap-1 text-[12px] font-semibold cursor-pointer hover:opacity-70 transition-opacity" style={{ color: 'var(--th-primary)' }}>
                  Load More <ChevronDown className="w-3.5 h-3.5" />
                </button>
              )}
              {visibleCount > 5 && (
                <button onClick={() => setVisibleCount(v => Math.max(5, v - 5))} className="flex items-center gap-1 text-[12px] font-semibold cursor-pointer hover:opacity-70 transition-opacity" style={{ color: 'var(--th-primary)' }}>
                  Hide Some <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* AI Insight */}
        <div className="mb-4"><AIInsightCard /></div>

        {/* Tags + Prompt */}
        <div className="space-y-4 mb-4">
          <TopReflectionTags topTags={s.topTags ?? []} />
          <ReflectionPrompt onUsePrompt={() => { setEditingReflection(null); setShowForm(true); }} />
        </div>
      </div>

      {/* ─── FAB (Mobile) ─── */}
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => { setEditingReflection(null); setShowForm(true); }}
        className="fixed bottom-20 lg:hidden left-1/2 -translate-x-1/2 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl z-40"
        style={{ background: 'var(--th-primary)' }}>
        <Plus className="w-6 h-6" style={{ color: '#08080d' }} />
      </motion.button>

      {/* ─── Reflection Form Modal ─── */}
      <ReflectionForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingReflection(null); }}
        onSubmit={handleSubmit}
        reflection={editingReflection}
      />
    </AnimatedPage>
  );
}
