import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Plus, Target, ChevronLeft, ChevronRight, TrendingUp, TrendingDown,
  CheckCircle2, AlertTriangle, Circle, MoreVertical, Filter, ArrowRight,
  Heart, Dumbbell, BookOpen, Briefcase, Star, Flame, Trash2, Pencil,
  Zap, Trophy, Award, Sparkles, Brain, Calendar, BarChart3,
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import clsx from 'clsx';

/* ═══════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════ */
const CATEGORY_CONFIG = {
  ALL:      { label: 'All Goals',  emoji: '⚡', color: 'var(--th-primary)' },
  HEALTH:   { label: 'Health',     emoji: '❤️', color: '#ef4444' },
  FITNESS:  { label: 'Fitness',    emoji: '💪', color: '#10b981' },
  LEARNING: { label: 'Learning',   emoji: '📚', color: '#f59e0b' },
  CAREER:   { label: 'Career',     emoji: '💼', color: '#6366f1' },
  PERSONAL: { label: 'Personal',   emoji: '⭐', color: '#E8B94A' },
};

const CATEGORY_ICONS = {
  HEALTH: Heart, FITNESS: Dumbbell, LEARNING: BookOpen,
  CAREER: Briefcase, PERSONAL: Star,
};

const CATEGORY_COLORS = {
  HEALTH: '#ef4444', FITNESS: '#10b981', LEARNING: '#f59e0b',
  CAREER: '#6366f1', PERSONAL: '#E8B94A',
};

const DONUT_COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6366f1', '#E8B94A'];

const ACHIEVEMENT_ICONS = {
  streak: CheckCircle2, week: Zap, halfway: Trophy, best: Star, crusher: Award,
};
const ACHIEVEMENT_COLORS = {
  streak: '#10b981', week: '#10b981', halfway: '#E8B94A', best: '#E8B94A', crusher: '#6366f1',
};

/* ═══════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════ */
function getGoalStatus(goal) {
  if (goal.progress === 100 || goal.status === 'COMPLETED') return 'completed';
  if (goal.progress === 0 && (!goal.milestones?.length || goal.milestones.every(m => !m.isCompleted))) return 'not_started';
  const now = new Date();
  const start = new Date(goal.startDate);
  const end = new Date(goal.endDate);
  const totalDays = Math.max(1, (end - start) / 86400000);
  const elapsed = Math.max(0, (now - start) / 86400000);
  const expectedPct = Math.min(100, (elapsed / totalDays) * 100);
  return goal.progress >= expectedPct * 0.8 ? 'on_track' : 'needs_attention';
}

function getWeekMilestones(goal) {
  const ms = goal.milestones ?? [];
  const start = new Date(goal.startDate);
  const weeks = [[], [], [], []];
  ms.forEach(m => {
    if (!m.completedAt) {
      const idx = weeks.findIndex(w => w.length < Math.ceil(ms.length / 4));
      if (idx >= 0) weeks[idx].push({ ...m, weekIdx: idx });
      return;
    }
    const d = new Date(m.completedAt);
    const dayDiff = Math.max(0, (d - start) / 86400000);
    const weekIdx = Math.min(3, Math.floor(dayDiff / 7));
    weeks[weekIdx].push(m);
  });
  return weeks.map(w => ({
    hasCompleted: w.some(m => m.isCompleted),
    allCompleted: w.length > 0 && w.every(m => m.isCompleted),
    count: w.length,
  }));
}

function formatDueDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

/* ═══════════════════════════════════════════════════════
   PROGRESS RING (reusable)
   ═══════════════════════════════════════════════════════ */
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
   STATUS BADGE
   ═══════════════════════════════════════════════════════ */
function StatusBadge({ status }) {
  const cfg = {
    completed: { label: 'Completed', bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
    on_track: { label: 'On Track', bg: 'rgba(232,185,74,0.12)', color: '#E8B94A' },
    needs_attention: { label: 'Needs Attention', bg: 'rgba(249,115,22,0.12)', color: '#f97316' },
    not_started: { label: 'Not Started', bg: 'var(--th-highlight)', color: 'var(--th-text-muted)' },
  }[status] ?? { label: status, bg: 'var(--th-highlight)', color: 'var(--th-text-muted)' };
  return (
    <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
  );
}

/* ═══════════════════════════════════════════════════════
   1. MONTHLY PROGRESS HERO CARD
   ═══════════════════════════════════════════════════════ */
function MonthlyProgressHero({ overallProgress, currentStreak, bestStreak, className = '' }) {
  const statusLabel = (overallProgress >= 60) ? 'On Track' : overallProgress >= 30 ? 'Needs Work' : 'Getting Started';
  const statusColor = (overallProgress >= 60) ? '#10b981' : overallProgress >= 30 ? '#f97316' : 'var(--th-text-muted)';
  return (
    <div className={`rounded-2xl p-5 lg:p-6 relative overflow-hidden flex flex-col ${className}`}
      style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[14px] lg:text-[15px] font-semibold" style={{ color: 'var(--th-text)' }}>Monthly Progress</h3>
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold" style={{ background: `${statusColor}18`, color: statusColor }}>
          {statusLabel}
        </span>
      </div>
      {/* Content */}
      <div className="flex items-center gap-6 lg:gap-10 flex-1">
        {/* Ring */}
        <div className="relative shrink-0">
          <ProgressRing pct={overallProgress} size={140} stroke={11} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[32px] font-black leading-none" style={{ color: 'var(--th-text)' }}>{overallProgress}%</span>
            <span className="text-[10px] mt-1" style={{ color: 'var(--th-text-dim)' }}>of monthly target</span>
          </div>
        </div>
        {/* Streak */}
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[12px]" style={{ color: 'var(--th-text-muted)' }}>Current Streak</span>
            <Flame className="w-3.5 h-3.5" style={{ color: '#f97316' }} />
          </div>
          <p className="text-[48px] font-black leading-none" style={{ color: 'var(--th-text)' }}>{currentStreak}</p>
          <p className="text-[14px] mt-1" style={{ color: 'var(--th-text-muted)' }}>days</p>
          <div className="flex items-center gap-1.5 mt-4">
            <span className="text-[11px]" style={{ color: 'var(--th-text-dim)' }}>Best: {bestStreak} days</span>
            <Trophy className="w-3 h-3" style={{ color: '#E8B94A' }} />
          </div>
        </div>
      </div>
      {/* Decorative sparkline */}
      <svg className="absolute bottom-0 left-0 right-0 w-full opacity-25" height="50" viewBox="0 0 400 50" preserveAspectRatio="none">
        <path d="M0 40 Q40 15 80 30 T160 20 T240 28 T320 12 T400 22" fill="none" stroke="var(--th-primary)" strokeWidth="2" />
        <path d="M0 45 Q50 20 100 35 T200 22 T300 30 T400 18" fill="none" stroke="var(--th-primary)" strokeWidth="1.5" opacity="0.5" />
        <path d="M0 48 Q60 25 120 38 T240 25 T360 32 T400 20" fill="none" stroke="var(--th-primary)" strokeWidth="1" opacity="0.3" />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   2. STAT CARDS (XP, Goals Achieved, Success Rate, Health Score)
   ═══════════════════════════════════════════════════════ */
function MonthlyStatCard({ icon, iconColor, label, value, sub, change, changeSuffix = 'vs last month' }) {
  const isPositive = (change ?? 0) >= 0;
  return (
    <div className="rounded-2xl p-4 flex flex-col h-full" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center gap-2 mb-2">
        {icon && <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: `${iconColor}15`, color: iconColor }}>{icon}</div>}
        <p className="text-[12px] font-semibold" style={{ color: 'var(--th-text-secondary)' }}>{label}</p>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-[28px] font-black leading-none" style={{ color: 'var(--th-text)' }}>{value}</p>
        {sub && <p className="text-[11px] mt-1.5" style={{ color: 'var(--th-text-dim)' }}>{sub}</p>}
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-auto pt-2">
          {isPositive ? <TrendingUp className="w-3 h-3" style={{ color: '#10b981' }} /> : <TrendingDown className="w-3 h-3" style={{ color: '#ef4444' }} />}
          <span className="text-[10px] font-semibold" style={{ color: isPositive ? '#10b981' : '#ef4444' }}>
            {isPositive ? '+' : ''}{change}% <span style={{ color: 'var(--th-text-dim)', fontWeight: 'normal' }}>{changeSuffix}</span>
          </span>
        </div>
      )}
    </div>
  );
}

function HealthScoreCard({ score }) {
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Work';
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#E8B94A' : '#f97316';
  return (
    <div className="rounded-2xl p-4 flex flex-col h-full" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: '#ef444418', color: '#ef4444' }}>
          <Heart className="w-3 h-3" />
        </div>
        <p className="text-[12px] font-semibold" style={{ color: 'var(--th-text-secondary)' }}>Goal Health Score</p>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          <ProgressRing pct={score} size={80} stroke={7} color={color} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[20px] font-black" style={{ color: 'var(--th-text)' }}>{score}</span>
            <span className="text-[10px] mt-0.5" style={{ color: 'var(--th-text-dim)' }}>/100</span>
          </div>
        </div>
      </div>
      <p className="text-center text-[12px] font-semibold mt-1" style={{ color }}>{label}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   3. CATEGORY FILTERS (reused)
   ═══════════════════════════════════════════════════════ */
function CategoryFilters({ active, onChange }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
        <button key={key} onClick={() => onChange(key)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold whitespace-nowrap transition-all shrink-0"
          style={{
            background: active === key ? 'var(--th-primary)' : 'var(--th-card)',
            color: active === key ? '#08080d' : 'var(--th-text-secondary)',
            border: active === key ? 'none' : '1px solid var(--th-border)',
          }}>
          <span>{cfg.emoji}</span> {cfg.label}
        </button>
      ))}
      <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium whitespace-nowrap shrink-0"
        style={{ background: 'var(--th-card)', color: 'var(--th-text-muted)', border: '1px solid var(--th-border)' }}>
        <Filter className="w-3 h-3" /> Filter
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   4. GOALS TABLE WITH MILESTONE COLUMNS
   ═══════════════════════════════════════════════════════ */
function MonthlyGoalRow({ goal, onEdit, onDelete }) {
  const status = getGoalStatus(goal);
  const cat = goal.category ?? 'PERSONAL';
  const CatIcon = CATEGORY_ICONS[cat] ?? Star;
  const catColor = CATEGORY_COLORS[cat] ?? '#E8B94A';
  const weekMilestones = getWeekMilestones(goal);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.tr initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="group" style={{ borderBottom: '1px solid var(--th-border)' }}>
      {/* Goal */}
      <td className="py-3.5 pr-3">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full shrink-0"
            style={{ background: status === 'completed' ? '#10b981' : status === 'on_track' ? '#E8B94A' : status === 'needs_attention' ? '#f97316' : 'var(--th-text-dim)' }} />
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: catColor + '18' }}>
            <CatIcon className="w-4 h-4" style={{ color: catColor }} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--th-text)' }}>{goal.title}</p>
            <p className="text-[11px] truncate" style={{ color: 'var(--th-text-dim)' }}>{goal.description || ''}</p>
          </div>
        </div>
      </td>
      {/* Progress */}
      <td className="py-3.5 pr-3">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold w-10" style={{ color: 'var(--th-text)' }}>{goal.progress}%</span>
          <div className="w-16 h-2 rounded-full overflow-hidden" style={{ background: 'var(--th-highlight)' }}>
            <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${goal.progress}%` }}
              transition={{ duration: 0.8 }}
              style={{ background: goal.progress >= 80 ? '#10b981' : goal.progress >= 40 ? '#E8B94A' : '#f97316' }} />
          </div>
        </div>
      </td>
      {/* Milestones W1-W4 */}
      <td className="py-3.5 pr-3">
        <div className="flex items-center gap-2">
          {['W1', 'W2', 'W3', 'W4'].map((label, i) => {
            const wk = weekMilestones[i];
            return (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <span className="text-[9px] font-medium" style={{ color: 'var(--th-text-dim)' }}>{label}</span>
                <div className={clsx('w-5 h-5 rounded-full flex items-center justify-center border')}
                  style={{
                    background: wk?.allCompleted ? '#10b981' : wk?.hasCompleted ? 'rgba(16,185,129,0.15)' : 'transparent',
                    borderColor: wk?.allCompleted ? '#10b981' : wk?.hasCompleted ? '#10b981' : 'var(--th-border)',
                    color: wk?.allCompleted ? '#fff' : wk?.hasCompleted ? '#10b981' : 'var(--th-text-dim)',
                  }}>
                  {wk?.allCompleted ? <CheckCircle2 className="w-3 h-3" /> : wk?.hasCompleted ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                </div>
              </div>
            );
          })}
        </div>
      </td>
      {/* Due */}
      <td className="py-3.5 pr-3">
        <span className="text-[12px]" style={{ color: 'var(--th-text-secondary)' }}>{formatDueDate(goal.endDate)}</span>
      </td>
      {/* Status */}
      <td className="py-3.5 pr-3"><StatusBadge status={status} /></td>
      {/* Actions */}
      <td className="py-3.5">
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 rounded-lg hover:bg-[var(--th-highlight)]">
            <MoreVertical className="w-4 h-4" style={{ color: 'var(--th-text-dim)' }} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-40 rounded-xl p-1.5 min-w-[140px] shadow-lg"
                style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}>
                <button onClick={() => { setMenuOpen(false); onEdit?.(goal); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] hover:bg-[var(--th-highlight)]"
                  style={{ color: 'var(--th-text-secondary)' }}><Pencil className="w-3.5 h-3.5" /> Edit</button>
                <button onClick={() => { setMenuOpen(false); onDelete?.(goal.id); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] hover:bg-[var(--th-highlight)]"
                  style={{ color: '#ef4444' }}><Trash2 className="w-3.5 h-3.5" /> Delete</button>
              </div>
            </>
          )}
        </div>
      </td>
    </motion.tr>
  );
}

/* Mobile goal card for monthly */
function MonthlyGoalCardMobile({ goal, onEdit, onDelete }) {
  const status = getGoalStatus(goal);
  const cat = goal.category ?? 'PERSONAL';
  const CatIcon = CATEGORY_ICONS[cat] ?? Star;
  const catColor = CATEGORY_COLORS[cat] ?? '#E8B94A';
  const weekMilestones = getWeekMilestones(goal);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: catColor + '18' }}>
            <CatIcon className="w-3.5 h-3.5" style={{ color: catColor }} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--th-text)' }}>{goal.title}</p>
            <p className="text-[11px] truncate" style={{ color: 'var(--th-text-dim)' }}>{goal.description || ''}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>
      {/* Progress + Milestones row */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold" style={{ color: 'var(--th-text)' }}>{goal.progress}%</span>
          <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--th-highlight)' }}>
            <div className="h-full rounded-full" style={{
              width: `${goal.progress}%`,
              background: goal.progress >= 80 ? '#10b981' : goal.progress >= 40 ? '#E8B94A' : '#f97316',
            }} />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {['W1', 'W2', 'W3', 'W4'].map((label, i) => {
            const wk = weekMilestones[i];
            return (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <span className="text-[8px]" style={{ color: 'var(--th-text-dim)' }}>{label}</span>
                <div className="w-4 h-4 rounded-full flex items-center justify-center border"
                  style={{
                    background: wk?.allCompleted ? '#10b981' : 'transparent',
                    borderColor: wk?.allCompleted ? '#10b981' : wk?.hasCompleted ? '#10b981' : 'var(--th-border)',
                    color: wk?.allCompleted ? '#fff' : wk?.hasCompleted ? '#10b981' : 'var(--th-text-dim)',
                  }}>
                  {(wk?.allCompleted || wk?.hasCompleted) ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Circle className="w-2.5 h-2.5" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   5. ENHANCED CALENDAR
   ═══════════════════════════════════════════════════════ */
function MonthlyCalendar({ calendarDays = [] }) {
  const [current, setCurrent] = useState(new Date());
  const year = current.getFullYear();
  const month = current.getMonth();
  const today = new Date().toISOString().split('T')[0];
  const daySet = new Map(calendarDays.map(d => [d.date, d.status]));

  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(offset).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  const monthName = current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-semibold" style={{ color: 'var(--th-text)' }}>{monthName}</h3>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrent(new Date(year, month - 1, 1))} className="w-6 h-6 flex items-center justify-center rounded-md" style={{ color: 'var(--th-text-dim)' }}>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setCurrent(new Date(year, month + 1, 1))} className="w-6 h-6 flex items-center justify-center rounded-md" style={{ color: 'var(--th-text-dim)' }}>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i} className="text-center text-[9px] font-semibold" style={{ color: 'var(--th-text-dim)' }}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1 gap-x-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === today;
          const status = daySet.get(dateStr);
          return (
            <div key={dateStr} className="flex flex-col items-center">
              <div className={clsx('w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium')}
                style={{
                  background: isToday ? 'var(--th-primary)' : 'transparent',
                  color: isToday ? '#08080d' : 'var(--th-text-secondary)',
                }}>{day}</div>
              {status && (
                <div className="w-1.5 h-1.5 rounded-full mt-0.5"
                  style={{ background: status === 'completed' ? '#10b981' : status === 'partial' ? '#f59e0b' : '#ef4444' }} />
              )}
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--th-border)' }}>
        <div className="flex items-center gap-1">
          <span className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>Less</span>
          {[0.2, 0.4, 0.6, 0.8, 1].map((o, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: '#E8B94A', opacity: o }} />
          ))}
          <span className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>More</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
            <span className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>Missed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} />
            <span className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>Milestone</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: '#E8B94A' }} />
            <span className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>Streak</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   6. MONTHLY INSIGHTS
   ═══════════════════════════════════════════════════════ */
function MonthlyInsights({ insights }) {
  if (!insights) return null;
  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <h3 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--th-text)' }}>Monthly Insights</h3>
      <div className="space-y-3.5">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#6366f118' }}>
            <Calendar className="w-3.5 h-3.5" style={{ color: '#6366f1' }} />
          </div>
          <div>
            <p className="text-[11px]" style={{ color: 'var(--th-text-muted)' }}>Most productive day</p>
            <p className="text-[13px] font-semibold" style={{ color: '#10b981' }}>{insights.mostProductiveDay}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#E8B94A18' }}>
            <BarChart3 className="w-3.5 h-3.5" style={{ color: '#E8B94A' }} />
          </div>
          <div>
            <p className="text-[11px]" style={{ color: 'var(--th-text-muted)' }}>Peak category</p>
            <p className="text-[13px] font-semibold" style={{ color: 'var(--th-text)' }}>{insights.peakCategory}</p>
            <p className="text-[11px]" style={{ color: '#10b981' }}>{insights.peakCategoryProgress}% of progress</p>
          </div>
        </div>
        {insights.weakestGoal && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#ef444418' }}>
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
            </div>
            <div>
              <p className="text-[11px]" style={{ color: 'var(--th-text-muted)' }}>Weakest goal</p>
              <p className="text-[13px] font-semibold" style={{ color: '#E8B94A' }}>{insights.weakestGoal.title}</p>
              <p className="text-[11px]" style={{ color: '#f97316' }}>{insights.weakestGoal.progress}% progress</p>
            </div>
          </div>
        )}
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#10b98118' }}>
            <TrendingUp className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
          </div>
          <div>
            <p className="text-[11px]" style={{ color: 'var(--th-text-muted)' }}>Improvement</p>
            <p className="text-[13px] font-semibold" style={{ color: '#10b981' }}>+{insights.improvementPct}%</p>
            <p className="text-[11px]" style={{ color: 'var(--th-text-dim)' }}>vs last month</p>
          </div>
        </div>
      </div>
      <button className="flex items-center gap-1.5 mt-4 pt-3 w-full text-[12px] font-semibold justify-center"
        style={{ borderTop: '1px solid var(--th-border)', color: 'var(--th-text-muted)' }}>
        View All Insights <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   7. GOAL MOMENTUM CHART
   ═══════════════════════════════════════════════════════ */
function GoalMomentumChart({ momentum = [], bestWeekIndex = 0 }) {
  const data = momentum.length ? momentum : [
    { week: 'Week 1', progress: 0 }, { week: 'Week 2', progress: 0 },
    { week: 'Week 3', progress: 0 }, { week: 'Week 4', progress: 0 },
    { week: 'Week 5', progress: 0 },
  ];
  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-[14px] font-semibold" style={{ color: 'var(--th-text)' }}>Goal Momentum</h3>
          <p className="text-[11px]" style={{ color: 'var(--th-text-dim)' }}>Your progress journey this month</p>
        </div>
        {data[bestWeekIndex] && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold"
            style={{ background: '#E8B94A18', color: '#E8B94A' }}>
            <Star className="w-3 h-3" /> Best Week
          </div>
        )}
      </div>
      <div className="h-[200px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="momentumGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--th-border)" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--th-text-dim)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--th-text-dim)' }} axisLine={false} tickLine={false}
              tickFormatter={v => `${v}%`} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)', borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: 'var(--th-text-muted)' }} formatter={v => [`${v}%`, 'Progress']} />
            <Area type="monotone" dataKey="progress" stroke="#10b981" strokeWidth={2.5}
              fill="url(#momentumGrad)" dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#10b981' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   8. GOALS BY CATEGORY DONUT
   ═══════════════════════════════════════════════════════ */
function GoalsByCategoryChart({ categoryBreakdown = [], totalGoals = 0 }) {
  const data = categoryBreakdown.length ? categoryBreakdown : [{ category: 'PERSONAL', count: 0, percentage: 100 }];
  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <h3 className="text-[14px] font-semibold mb-2" style={{ color: 'var(--th-text)' }}>Goals by Category</h3>
      <div className="flex items-center gap-4">
        <div className="relative w-[130px] h-[130px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="count" nameKey="category" cx="50%" cy="50%"
                innerRadius={38} outerRadius={58} paddingAngle={3} strokeWidth={0}>
                {data.map((_, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[data[i].category] || DONUT_COLORS[i % DONUT_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[18px] font-black" style={{ color: 'var(--th-text)' }}>{totalGoals}</span>
            <span className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>Total Goals</span>
          </div>
        </div>
        <div className="space-y-2 flex-1">
          {data.map((item, i) => (
            <div key={item.category} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: CATEGORY_COLORS[item.category] || DONUT_COLORS[i] }} />
                <span className="text-[11px]" style={{ color: 'var(--th-text-secondary)' }}>
                  {CATEGORY_CONFIG[item.category]?.label || item.category}
                </span>
              </div>
              <span className="text-[11px] font-semibold" style={{ color: 'var(--th-text)' }}>
                {item.count} ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   9. GOAL PERFORMANCE OVERVIEW
   ═══════════════════════════════════════════════════════ */
function GoalPerformanceChart({ performance = [] }) {
  const data = performance.length ? performance : [];
  if (!data.length) return null;
  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[14px] font-semibold" style={{ color: 'var(--th-text)' }}>Goal Performance Overview</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5"><div className="w-4 h-px" style={{ borderTop: '2px dashed var(--th-text-dim)' }} /><span className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>Target</span></div>
          <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 rounded" style={{ background: '#10b981' }} /><span className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>Actual</span></div>
          <div className="flex items-center gap-1.5"><div className="w-4 h-px" style={{ borderTop: '2px dotted #E8B94A' }} /><span className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>Trend</span></div>
        </div>
      </div>
      <div className="h-[180px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--th-border)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--th-text-dim)' }} axisLine={false} tickLine={false}
              tickFormatter={d => { const dt = new Date(d); return `${dt.getDate()} ${dt.toLocaleString('en', { month: 'short' })}`; }} />
            <YAxis tick={{ fontSize: 9, fill: 'var(--th-text-dim)' }} axisLine={false} tickLine={false}
              tickFormatter={v => `${v}%`} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)', borderRadius: 12, fontSize: 11 }} />
            <Area type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} fill="url(#perfGrad)" dot={false} />
            <Line type="monotone" dataKey="target" stroke="var(--th-text-dim)" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
            <Line type="monotone" dataKey="trend" stroke="#E8B94A" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   10. ACHIEVEMENT TIMELINE
   ═══════════════════════════════════════════════════════ */
function AchievementTimeline({ achievements = [] }) {
  if (!achievements.length) return null;
  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="mb-4">
        <h3 className="text-[14px] font-semibold" style={{ color: 'var(--th-text)' }}>Achievement Timeline</h3>
        <p className="text-[11px]" style={{ color: 'var(--th-text-dim)' }}>Your key milestones this month</p>
      </div>
      <div className="flex items-start gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {achievements.map((a, i) => {
          const Icon = ACHIEVEMENT_ICONS[a.icon] || Award;
          const color = ACHIEVEMENT_COLORS[a.icon] || '#E8B94A';
          return (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0 min-w-[80px]">
              <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: `${color}18` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <p className="text-[10px] font-medium text-center leading-tight" style={{ color: 'var(--th-text-secondary)' }}>{a.title}</p>
              <p className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>
                {new Date(a.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   11. AI GOAL OPTIMIZER
   ═══════════════════════════════════════════════════════ */
function AIGoalOptimizer({ insights, goals }) {
  const suggestions = useMemo(() => {
    const tips = [];
    if (insights?.weakestGoal) {
      tips.push({ icon: <Brain className="w-4 h-4" />, color: '#6366f1',
        text: `Focus more on ${insights.weakestGoal.title}`,
        sub: 'Your progress is lagging compared to other goals.' });
    }
    if (insights?.peakCategory) {
      tips.push({ icon: <Zap className="w-4 h-4" />, color: '#10b981',
        text: `Keep pushing your ${insights.peakCategory.toLowerCase()} goals!`,
        sub: "You're performing great this month." });
    }
    tips.push({ icon: <Sparkles className="w-4 h-4" />, color: '#E8B94A',
      text: `Best day to maximize productivity: ${insights?.mostProductiveDay || 'Monday'}`,
      sub: `${insights?.mostProductiveDay || 'Monday'} is your power day!` });
    return tips;
  }, [insights, goals]);

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4" style={{ color: 'var(--th-primary)' }} />
        <h3 className="text-[14px] font-semibold" style={{ color: 'var(--th-text)' }}>AI Goal Optimizer</h3>
      </div>
      <p className="text-[11px] mb-4" style={{ color: 'var(--th-text-dim)' }}>Personalized suggestions to help you achieve more</p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
        {suggestions.map((tip, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl p-3" style={{ background: 'var(--th-highlight)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${tip.color}15`, color: tip.color }}>
              {tip.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold leading-snug" style={{ color: 'var(--th-text)' }}>{tip.text}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--th-text-dim)' }}>{tip.sub}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--th-border)' }}>
        <div className="flex items-center gap-1.5">
          <Star className="w-3 h-3" style={{ color: 'var(--th-primary)' }} />
          <span className="text-[11px]" style={{ color: 'var(--th-text-dim)' }}>
            <strong style={{ color: 'var(--th-text-muted)' }}>Pro Tip:</strong> Small consistent steps lead to big achievements.
          </span>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold"
          style={{ background: 'var(--th-primary)', color: '#08080d' }}>
          Optimize Goals <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN EXPORT: MonthlyGoalsView
   ═══════════════════════════════════════════════════════ */
export default function MonthlyGoalsView({
  goals, stats, isLoading, categoryFilter, setCategoryFilter,
  onShowForm, onEdit, onDelete,
}) {
  const s = stats ?? {};
  const filteredGoals = useMemo(() => {
    if (categoryFilter === 'ALL') return goals;
    return goals.filter(g => (g.category ?? 'PERSONAL') === categoryFilter);
  }, [goals, categoryFilter]);

  /* Compute fallback stats from goals if API doesn't return them */
  const computed = useMemo(() => {
    const g = goals ?? [];
    const total = g.length;
    if (!total) return { overallProgress: 0, completedCount: 0, totalGoals: 0, onTrackCount: 0, needsAttentionCount: 0, completionRate: 0 };
    const overallProgress = Math.round(g.reduce((sum, x) => sum + (x.progress ?? 0), 0) / total);
    let completedCount = 0, onTrackCount = 0, needsAttentionCount = 0;
    g.forEach(goal => { const st = getGoalStatus(goal); if (st === 'completed') completedCount++; else if (st === 'on_track') onTrackCount++; else if (st === 'needs_attention') needsAttentionCount++; });
    const allMs = g.flatMap(x => x.milestones ?? []);
    const completionRate = allMs.length ? Math.round(allMs.filter(m => m.isCompleted).length / allMs.length * 100) : 0;
    return { overallProgress, completedCount, totalGoals: total, onTrackCount, needsAttentionCount, completionRate };
  }, [goals]);

  const progress = s.overallProgress ?? computed.overallProgress;
  const currentStreak = s.currentStreak ?? 0;
  const bestStreak = s.bestStreak ?? currentStreak;
  const totalXp = s.totalXp ?? ((goals ?? []).flatMap(g => g.milestones ?? []).filter(m => m.isCompleted).length * 50);
  const goalsAchieved = s.completedCount ?? computed.completedCount;
  const totalGoals = s.totalGoals ?? computed.totalGoals;
  const successRate = s.successRate ?? (totalGoals > 0 ? Math.round(((computed.completedCount + computed.onTrackCount) / totalGoals) * 100) : 0);
  const healthScore = s.goalHealthScore ?? Math.round(progress * 0.4 + (s.completionRate ?? computed.completionRate) * 0.3 + successRate * 0.2 + Math.min(currentStreak * 2, 100) * 0.1);
  const calDays = s.calendarDays ?? [];
  const momentum = s.momentum ?? [];
  const bestWeekIndex = s.bestWeekIndex ?? 0;
  const categoryBreakdown = s.categoryBreakdown ?? [];
  const achievements = s.achievements ?? [];
  const insights = s.insights ?? null;
  const performance = s.performance ?? [];

  return (
    <>
      {/* ══════════════════════════════════════
          DESKTOP LAYOUT
          ══════════════════════════════════════ */}
      <div className="hidden lg:block space-y-5">
        {/* Row 1: Hero + Stats */}
        <div className="grid grid-cols-12 gap-4" style={{ minHeight: '260px' }}>
          <div className="col-span-5 flex">
            <MonthlyProgressHero className="flex-1" overallProgress={progress} currentStreak={currentStreak} bestStreak={bestStreak} />
          </div>
          <div className="col-span-7 grid grid-cols-2 gap-3">
            <MonthlyStatCard label="Total XP Earned" value={totalXp.toLocaleString()}
              icon={<Zap className="w-3.5 h-3.5" />} iconColor="#E8B94A"
              sub="XP" change={s.xpChange ?? 18} />
            <MonthlyStatCard label="Goals Achieved"
              value={<><span>{goalsAchieved}</span><span className="text-[16px] font-normal" style={{ color: 'var(--th-text-dim)' }}> / {totalGoals}</span></>}
              icon={<Target className="w-3.5 h-3.5" />} iconColor="#10b981"
              sub={`goals`} change={s.completedChange ?? 0} changeSuffix="vs last month" />
            <MonthlyStatCard label="Success Rate" value={`${successRate}%`}
              icon={<CheckCircle2 className="w-3.5 h-3.5" />} iconColor="#10b981"
              sub="consistency" change={s.successRateChange ?? 10} />
            <HealthScoreCard score={healthScore} />
          </div>
        </div>

        {/* Category Filters */}
        <CategoryFilters active={categoryFilter} onChange={setCategoryFilter} />

        {/* Row 2: Goals Table + Calendar & Insights Sidebar */}
        <div className="flex gap-4">
          <div className="flex-1 min-w-0">
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
              <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--th-border)' }}>
                <h3 className="text-[14px] font-semibold" style={{ color: 'var(--th-text)' }}>Your Goals This Month</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--th-border)' }}>
                    {['GOAL', 'PROGRESS', 'MILESTONES', 'DUE', 'STATUS', ''].map((col, i) => (
                      <th key={col || i} className={clsx('text-left text-[11px] font-semibold uppercase px-4 py-2.5', i === 0 && 'pl-5')}
                        style={{ color: 'var(--th-text-dim)' }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-8 rounded-lg animate-pulse" style={{ background: 'var(--th-highlight)' }} /></td></tr>
                    ))
                  ) : filteredGoals.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-16">
                      <Target className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--th-text-dim)' }} />
                      <p className="text-[13px]" style={{ color: 'var(--th-text-muted)' }}>No monthly goals found</p>
                    </td></tr>
                  ) : filteredGoals.map(goal => (
                    <MonthlyGoalRow key={goal.id} goal={goal} onEdit={onEdit} onDelete={onDelete} />
                  ))}
                </tbody>
              </table>
            </div>
            {filteredGoals.length > 0 && (
              <button onClick={onShowForm} className="flex items-center gap-1.5 mt-4 text-[13px] font-semibold" style={{ color: 'var(--th-primary)' }}>
                <Plus className="w-4 h-4" /> Add New Goal
              </button>
            )}
          </div>
          {/* Right Sidebar */}
          <div className="w-[250px] shrink-0 space-y-4">
            <MonthlyCalendar calendarDays={calDays} />
            <MonthlyInsights insights={insights} />
          </div>
        </div>

        {/* Row 3: Charts */}
        <div className="grid grid-cols-2 gap-4">
          <GoalMomentumChart momentum={momentum} bestWeekIndex={bestWeekIndex} />
          <GoalsByCategoryChart categoryBreakdown={categoryBreakdown} totalGoals={totalGoals} />
        </div>

        {/* Row 4: Performance + Timeline */}
        <div className="grid grid-cols-2 gap-4">
          <GoalPerformanceChart performance={performance} />
          <AchievementTimeline achievements={achievements} />
        </div>

        {/* Row 5: AI Optimizer */}
        <AIGoalOptimizer insights={insights} goals={goals} />
      </div>

      {/* ══════════════════════════════════════
          MOBILE LAYOUT
          ══════════════════════════════════════ */}
      <div className="lg:hidden space-y-4">
        {/* Hero */}
        <MonthlyProgressHero overallProgress={progress} currentStreak={currentStreak} bestStreak={bestStreak} />

        {/* Stats 2x2 */}
        <div className="grid grid-cols-2 gap-3">
          <MonthlyStatCard label="Total XP Earned" value={totalXp.toLocaleString()}
            icon={<Zap className="w-3.5 h-3.5" />} iconColor="#E8B94A"
            sub="XP" change={s.xpChange ?? 18} />
          <MonthlyStatCard label="Goals Achieved"
            value={<><span>{goalsAchieved}</span><span className="text-[14px] font-normal" style={{ color: 'var(--th-text-dim)' }}> / {totalGoals}</span></>}
            icon={<Target className="w-3.5 h-3.5" />} iconColor="#10b981"
            sub="goals" change={s.completedChange ?? 0} />
          <MonthlyStatCard label="Success Rate" value={`${successRate}%`}
            icon={<CheckCircle2 className="w-3.5 h-3.5" />} iconColor="#10b981"
            sub="consistency" change={s.successRateChange ?? 10} />
          <HealthScoreCard score={healthScore} />
        </div>

        {/* Category Filters */}
        <CategoryFilters active={categoryFilter} onChange={setCategoryFilter} />

        {/* Goals List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14px] font-semibold" style={{ color: 'var(--th-text)' }}>Your Goals This Month</h3>
            <span className="text-[11px] font-medium" style={{ color: 'var(--th-primary)' }}>View all</span>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--th-card)' }} />
              ))
            ) : filteredGoals.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--th-text-dim)' }} />
                <p className="text-[13px]" style={{ color: 'var(--th-text-muted)' }}>No monthly goals yet</p>
                <button onClick={onShowForm} className="mt-3 px-4 py-2 rounded-xl text-[12px] font-semibold"
                  style={{ background: 'var(--th-primary)', color: '#08080d' }}>Create Goal</button>
              </div>
            ) : filteredGoals.map(goal => (
              <MonthlyGoalCardMobile key={goal.id} goal={goal} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </div>

        {/* Charts */}
        <GoalMomentumChart momentum={momentum} bestWeekIndex={bestWeekIndex} />
        <GoalsByCategoryChart categoryBreakdown={categoryBreakdown} totalGoals={totalGoals} />
      </div>
    </>
  );
}
