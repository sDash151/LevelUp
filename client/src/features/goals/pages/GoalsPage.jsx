import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Target, ChevronLeft, ChevronRight, TrendingUp, TrendingDown,
  CheckCircle2, AlertTriangle, Circle, MoreVertical, Filter,
  Heart, Dumbbell, BookOpen, Briefcase, Star, Zap, Flame, Trash2, Pencil,
} from 'lucide-react';
import { AnimatedPage, PageSkeleton } from '@/design-system/components';
import { useGoals, useGoalStats, useToggleMilestone, useCreateGoal, useUpdateGoal, useDeleteGoal } from '../hooks/useGoals';
import { GoalForm } from '../components/GoalForm';
import MonthlyGoalsView from '../components/MonthlyGoalsView';
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
  HEALTH:   Heart,
  FITNESS:  Dumbbell,
  LEARNING: BookOpen,
  CAREER:   Briefcase,
  PERSONAL: Star,
};

const CATEGORY_COLORS = {
  HEALTH:   '#ef4444',
  FITNESS:  '#10b981',
  LEARNING: '#f59e0b',
  CAREER:   '#6366f1',
  PERSONAL: '#E8B94A',
};

const MOTIVATIONAL_QUOTES = [
  { text: 'Discipline today, success tomorrow.', sub: 'Keep leveling up! 💪' },
  { text: 'Small steps lead to big changes.', sub: 'Stay consistent! 🔥' },
  { text: 'Progress, not perfection.', sub: 'Keep pushing forward! 🚀' },
  { text: 'Your goals don\'t care about your excuses.', sub: 'Take action now! ⚡' },
];

/* ═══════════════════════════════════════════════════════
   HELPER FUNCTIONS
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

function getGoalStreak(goal) {
  if (!goal.milestones?.length) return 0;
  const completedDates = goal.milestones
    .filter(m => m.isCompleted && m.completedAt)
    .map(m => new Date(m.completedAt).toISOString().split('T')[0]);
  if (!completedDates.length) return 0;
  const uniqueDates = [...new Set(completedDates)].sort().reverse();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    if (uniqueDates.includes(ds)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

function formatDueDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
}

function getDaysLeft(endDate) {
  return Math.max(0, Math.ceil((new Date(endDate) - new Date()) / 86400000));
}

/* ═══════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════ */

/* ─── Progress Ring ─── */
function ProgressRing({ pct = 0, size = 96, stroke = 9 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
        stroke="var(--th-highlight)" />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
        stroke="var(--th-primary)" strokeLinecap="round"
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
        strokeDasharray={circ} />
    </svg>
  );
}

/* ─── Status Badge ─── */
function StatusBadge({ status }) {
  const cfg = {
    completed: { label: 'Completed', bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
    on_track: { label: 'On Track', bg: 'rgba(232,185,74,0.12)', color: '#E8B94A' },
    needs_attention: { label: 'Needs Attention', bg: 'rgba(249,115,22,0.12)', color: '#f97316' },
    not_started: { label: 'Not Started', bg: 'var(--th-highlight)', color: 'var(--th-text-muted)' },
  }[status] ?? { label: status, bg: 'var(--th-highlight)', color: 'var(--th-text-muted)' };

  return (
    <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

/* ─── StatCard ─── */
function StatCard({ icon, iconColor, label, value, sub, change, changeSuffix = 'vs last week', isRing, pct }) {
  const isPositive = (change ?? 0) >= 0;
  return (
    <div className="rounded-2xl p-4 flex flex-col h-full" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-start gap-2 mb-2 min-h-[24px]">
        {icon && <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: `${iconColor}15`, color: iconColor }}>{icon}</div>}
        <p className="text-[12px] xl:text-[13px] font-semibold leading-tight pt-0.5" style={{ color: 'var(--th-text)' }}>{label}</p>
      </div>
      {isRing ? (
        <div className="flex-1 flex flex-col items-center justify-center py-2">
          <div className="relative">
            <ProgressRing pct={pct ?? 0} size={84} stroke={8} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[20px] xl:text-[22px] font-black" style={{ color: 'var(--th-text)' }}>{pct ?? 0}%</span>
            </div>
          </div>
          <p className="text-[11px] mt-3 text-center leading-tight" style={{ color: 'var(--th-text-muted)' }}>{sub}</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-2 text-center">
          <p className="text-[28px] xl:text-[34px] font-black leading-none" style={{ color: 'var(--th-text)' }}>{value}</p>
          {sub && <p className="text-[11px] xl:text-[12px] mt-2 text-zinc-500 leading-tight">{sub}</p>}
        </div>
      )}
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-auto pt-2">
          <div className="shrink-0">
            {isPositive ? <TrendingUp className="w-3 h-3 xl:w-3.5 xl:h-3.5" style={{ color: '#10b981' }} /> : <TrendingDown className="w-3 h-3 xl:w-3.5 xl:h-3.5" style={{ color: '#ef4444' }} />}
          </div>
          <span className="text-[10px] xl:text-[11px] font-semibold leading-tight" style={{ color: isPositive ? '#10b981' : '#ef4444' }}>
            {isPositive ? '+' : ''}{change}% <span style={{ color: 'var(--th-text-dim)', fontWeight: 'normal' }}>{changeSuffix}</span>
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Goal Mini Calendar ─── */
function GoalCalendar({ calendarDays = [] }) {
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
                }}>
                {day}
              </div>
              {status && (
                <div className="w-1 h-1 rounded-full mt-0.5"
                  style={{ background: status === 'completed' ? '#10b981' : status === 'partial' ? '#f59e0b' : '#ef4444' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Category Filters ─── */
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

/* ─── Weekly Overview Panel ─── */
function WeeklyOverview({ goals }) {
  const counts = useMemo(() => {
    const c = { completed: 0, on_track: 0, needs_attention: 0, not_started: 0 };
    (goals ?? []).forEach(g => { const s = getGoalStatus(g); if (c[s] !== undefined) c[s]++; });
    return c;
  }, [goals]);

  const items = [
    { icon: <CheckCircle2 className="w-4 h-4" />, color: '#10b981', label: 'Completed', count: counts.completed },
    { icon: <Target className="w-4 h-4" />, color: '#E8B94A', label: 'On Track', count: counts.on_track },
    { icon: <AlertTriangle className="w-4 h-4" />, color: '#f97316', label: 'Needs Attention', count: counts.needs_attention },
    { icon: <Circle className="w-4 h-4" />, color: 'var(--th-text-dim)', label: 'Not Started', count: counts.not_started },
  ];

  return (
    <div className="rounded-2xl p-4 lg:p-5" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <h3 className="text-[14px] font-semibold mb-4 flex items-center justify-between" style={{ color: 'var(--th-text)' }}>
        Weekly Overview
        <ChevronRight className="w-4 h-4" style={{ color: 'var(--th-text-dim)' }} />
      </h3>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div style={{ color: item.color }}>{item.icon}</div>
              <span className="text-[13px]" style={{ color: 'var(--th-text-secondary)' }}>{item.label}</span>
            </div>
            <span className="text-[12px] font-semibold" style={{ color: item.color }}>
              {item.count} {item.count === 1 ? 'goal' : 'goals'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Motivation Boost ─── */
function MotivationBoost() {
  const quote = MOTIVATIONAL_QUOTES[new Date().getDate() % MOTIVATIONAL_QUOTES.length];
  return (
    <div className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-[13px] font-semibold" style={{ color: 'var(--th-text)' }}>Motivation Boost</span>
        <span>✨</span>
      </div>
      <div className="flex gap-3">
        <span className="text-[32px] font-black leading-none mt-1" style={{ color: 'var(--th-primary)', opacity: 0.3 }}>"</span>
        <div>
          <p className="text-[14px] font-semibold leading-snug" style={{ color: 'var(--th-text)' }}>{quote.text}</p>
          <p className="text-[12px] mt-2" style={{ color: 'var(--th-text-muted)' }}>{quote.sub}</p>
        </div>
      </div>
      {/* Decorative line */}
      <svg className="absolute bottom-0 right-0 opacity-20" width="140" height="40" viewBox="0 0 140 40">
        <path d="M0 35 Q30 10 60 25 T120 15 T140 30" fill="none" stroke="var(--th-primary)" strokeWidth="2" />
        <path d="M0 38 Q35 15 70 28 T130 18" fill="none" stroke="var(--th-primary)" strokeWidth="1.5" opacity="0.5" />
      </svg>
    </div>
  );
}

/* ─── Goal Table Row (Desktop) ─── */
function GoalTableRow({ goal, onToggle, onEdit, onDelete }) {
  const status = getGoalStatus(goal);
  const streak = getGoalStreak(goal);
  const cat = goal.category ?? 'PERSONAL';
  const CatIcon = CATEGORY_ICONS[cat] ?? Star;
  const catColor = CATEGORY_COLORS[cat] ?? '#E8B94A';
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.tr initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="group transition-colors" style={{ borderBottom: '1px solid var(--th-border)' }}>
      {/* Status dot + Category icon + Goal info */}
      <td className="py-3.5 pr-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full shrink-0"
            style={{ background: status === 'completed' ? '#10b981' : status === 'on_track' ? '#E8B94A' : status === 'needs_attention' ? '#f97316' : 'var(--th-text-dim)' }} />
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: catColor + '18' }}>
            <CatIcon className="w-4 h-4" style={{ color: catColor }} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--th-text)' }}>{goal.title}</p>
            <p className="text-[11px] truncate" style={{ color: 'var(--th-text-dim)' }}>{goal.description || 'No description'}</p>
          </div>
        </div>
      </td>
      {/* Progress */}
      <td className="py-3.5 pr-4">
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-semibold w-10" style={{ color: 'var(--th-text)' }}>{goal.progress}%</span>
          <div className="w-20 h-2 rounded-full overflow-hidden" style={{ background: 'var(--th-highlight)' }}>
            <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${goal.progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ background: goal.progress >= 80 ? '#10b981' : goal.progress >= 40 ? '#E8B94A' : '#f97316' }} />
          </div>
        </div>
      </td>
      {/* Streak */}
      <td className="py-3.5 pr-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-semibold" style={{ color: 'var(--th-text)' }}>{streak}</span>
          <Flame className="w-3.5 h-3.5" style={{ color: streak > 0 ? '#f97316' : 'var(--th-text-dim)' }} />
        </div>
        <span className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>days</span>
      </td>
      {/* Due */}
      <td className="py-3.5 pr-4">
        <span className="text-[12px]" style={{ color: 'var(--th-text-secondary)' }}>{formatDueDate(goal.endDate)}</span>
      </td>
      {/* Status */}
      <td className="py-3.5 pr-4">
        <StatusBadge status={status} />
      </td>
      {/* Actions */}
      <td className="py-3.5">
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 rounded-lg transition-all hover:bg-[var(--th-highlight)]">
            <MoreVertical className="w-4 h-4" style={{ color: 'var(--th-text-dim)' }} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-40 rounded-xl p-1.5 min-w-[140px] shadow-lg"
                style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}>
                <button onClick={() => { setMenuOpen(false); onEdit?.(goal); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] transition-colors hover:bg-[var(--th-highlight)]"
                  style={{ color: 'var(--th-text-secondary)' }}>
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => { setMenuOpen(false); onDelete?.(goal.id); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] transition-colors hover:bg-[var(--th-highlight)]"
                  style={{ color: '#ef4444' }}>
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </td>
    </motion.tr>
  );
}

/* ─── Goal Card (Mobile) ─── */
function GoalCardMobile({ goal, onEdit, onDelete }) {
  const status = getGoalStatus(goal);
  const streak = getGoalStreak(goal);
  const cat = goal.category ?? 'PERSONAL';
  const CatIcon = CATEGORY_ICONS[cat] ?? Star;
  const catColor = CATEGORY_COLORS[cat] ?? '#E8B94A';
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: catColor + '18' }}>
            <CatIcon className="w-3.5 h-3.5" style={{ color: catColor }} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--th-text)' }}>{goal.title}</p>
            <p className="text-[11px] truncate" style={{ color: 'var(--th-text-dim)' }}>{goal.description || ''}</p>
          </div>
        </div>
        <div className="relative ml-2 shrink-0">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 rounded-md" style={{ color: 'var(--th-text-dim)' }}>
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-7 z-40 rounded-xl p-1.5 min-w-[120px] shadow-lg"
                style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}>
                <button onClick={() => { setMenuOpen(false); onEdit?.(goal); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] hover:bg-[var(--th-highlight)]"
                  style={{ color: 'var(--th-text-secondary)' }}>
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => { setMenuOpen(false); onDelete?.(goal.id); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] hover:bg-[var(--th-highlight)]"
                  style={{ color: '#ef4444' }}>
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Progress + Streak + Status row */}
      <div className="flex items-center gap-4">
        {/* Progress */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-bold" style={{ color: 'var(--th-text)' }}>{goal.progress}%</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--th-highlight)' }}>
              <div className="h-full rounded-full" style={{
                width: `${goal.progress}%`,
                background: goal.progress >= 80 ? '#10b981' : goal.progress >= 40 ? '#E8B94A' : '#f97316',
              }} />
            </div>
          </div>
        </div>
        {/* Streak */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[12px] font-bold" style={{ color: 'var(--th-text)' }}>{streak}</span>
          <Flame className="w-3 h-3" style={{ color: streak > 0 ? '#f97316' : 'var(--th-text-dim)' }} />
        </div>
        {/* Status */}
        <StatusBadge status={status} />
      </div>
    </motion.div>
  );
}


/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function GoalsPage() {
  const [activeTab, setActiveTab] = useState('WEEKLY');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const { data: goals = [], isLoading } = useGoals(activeTab);
  const { data: stats } = useGoalStats(activeTab);
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoalMut = useDeleteGoal();
  const toggleMilestone = useToggleMilestone();
  const navigate = useNavigate();

  /* ─── Derived data ─── */
  const filteredGoals = useMemo(() => {
    if (categoryFilter === 'ALL') return goals;
    return goals.filter(g => (g.category ?? 'PERSONAL') === categoryFilter);
  }, [goals, categoryFilter]);

  const computedStats = useMemo(() => {
    const g = goals ?? [];
    const total = g.length;
    if (!total) return { overallProgress: 0, completedCount: 0, totalGoals: 0, onTrackCount: 0, needsAttentionCount: 0, notStartedCount: 0, completionRate: 0 };
    const overallProgress = Math.round(g.reduce((s, x) => s + (x.progress ?? 0), 0) / total);
    let completedCount = 0, onTrackCount = 0, needsAttentionCount = 0, notStartedCount = 0;
    g.forEach(goal => {
      const s = getGoalStatus(goal);
      if (s === 'completed') completedCount++;
      else if (s === 'on_track') onTrackCount++;
      else if (s === 'needs_attention') needsAttentionCount++;
      else notStartedCount++;
    });
    const allMilestones = g.flatMap(x => x.milestones ?? []);
    const completionRate = allMilestones.length ? Math.round(allMilestones.filter(m => m.isCompleted).length / allMilestones.length * 100) : 0;
    return { overallProgress, completedCount, totalGoals: total, onTrackCount, needsAttentionCount, notStartedCount, completionRate };
  }, [goals]);

  const s = (stats && Object.keys(stats).length > 0) ? stats : computedStats;
  const calDays = stats?.calendarDays ?? [];

  const handleSubmit = useCallback((data) => {
    if (editingGoal) {
      updateGoal.mutate({ id: editingGoal.id, data });
    } else {
      createGoal.mutate(data);
    }
    setShowForm(false);
    setEditingGoal(null);
  }, [editingGoal, createGoal, updateGoal]);

  const handleDelete = useCallback((id) => {
    deleteGoalMut.mutate(id);
  }, [deleteGoalMut]);

  const handleEdit = useCallback((goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  }, []);

  return (
    <AnimatedPage>

      {/* ══════════════════════════════════════
          MOBILE LAYOUT
          ══════════════════════════════════════ */}
      <div className="lg:hidden w-full overflow-x-hidden">
        {activeTab === 'MONTHLY' ? (
          <div className="pb-24">
            {/* Mobile Monthly Header */}
            <div className="mb-2 pr-12">
              <h1 className="text-[22px] font-bold" style={{ color: 'var(--th-text)' }}>Goals</h1>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--th-text-muted)' }}>Track your weekly & monthly goals</p>
            </div>
            {/* Weekly / Monthly toggle */}
            <div className="flex rounded-xl p-1 mb-4 w-fit" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
              {['WEEKLY', 'MONTHLY'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="px-5 py-2 text-[12px] font-semibold rounded-lg transition-all"
                  style={{
                    background: activeTab === tab ? 'var(--th-primary)' : 'transparent',
                    color: activeTab === tab ? '#08080d' : 'var(--th-text-muted)',
                  }}>
                  {tab === 'WEEKLY' ? 'Weekly' : 'Monthly'}
                </button>
              ))}
            </div>
            <MonthlyGoalsView
              goals={goals}
              stats={s}
              isLoading={isLoading}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              onShowForm={() => { setEditingGoal(null); setShowForm(true); }}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        ) : (
        <div>

        {/* Header */}
        <div className="mb-2 pr-12">
          <h1 className="text-[22px] font-bold" style={{ color: 'var(--th-text)' }}>Goals</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--th-text-muted)' }}>Track your weekly & monthly goals</p>
        </div>

        {/* Weekly / Monthly toggle */}
        <div className="flex rounded-xl p-1 mb-4 w-fit" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          {['WEEKLY', 'MONTHLY'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-5 py-2 text-[12px] font-semibold rounded-lg transition-all"
              style={{
                background: activeTab === tab ? 'var(--th-primary)' : 'transparent',
                color: activeTab === tab ? '#08080d' : 'var(--th-text-muted)',
              }}>
              {tab === 'WEEKLY' ? 'Weekly' : 'Monthly'}
            </button>
          ))}
        </div>

        {/* Stats 2x2 grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <StatCard label="Goals Progress" isRing pct={s.overallProgress} sub="Overall Progress"
            icon={<TrendingUp className="w-3.5 h-3.5" />} iconColor="#E8B94A"
            change={s.progressChange ?? 0} />
          <StatCard label="Completed" value={s.completedCount}
            icon={<CheckCircle2 className="w-3.5 h-3.5" />} iconColor="#10b981"
            sub={`of ${s.totalGoals} goals`} change={s.completedChange ?? 0} />
          <StatCard label="On Track" value={s.onTrackCount}
            icon={<Target className="w-3.5 h-3.5" />} iconColor="#E8B94A"
            sub="goal" change={s.onTrackChange ?? 0} />
          <StatCard label="Needs Attention" value={s.needsAttentionCount}
            icon={<AlertTriangle className="w-3.5 h-3.5" />} iconColor="#f97316"
            sub="goal" change={s.attentionChange ?? 0} />
        </div>

        {/* Completion Rate + Calendar */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard label="Completion Rate" value={`${s.completionRate}%`}
            icon={<Target className="w-3.5 h-3.5" />} iconColor="#10b981"
            sub="avg. completion" change={s.rateChange ?? 0} />
          <GoalCalendar calendarDays={calDays} />
        </div>

        {/* Category Filters */}
        <div className="mb-4">
          <CategoryFilters active={categoryFilter} onChange={setCategoryFilter} />
        </div>

        {/* Tab header */}
        <div className="flex items-center gap-4 px-1 mb-2 border-b" style={{ borderColor: 'var(--th-border)' }}>
          {['GOAL', 'PROGRESS', 'STREAK', 'STATUS'].map(col => (
            <span key={col} className={clsx('text-[10px] font-semibold pb-2 uppercase', col === 'GOAL' ? 'flex-1' : '')}
              style={{ color: 'var(--th-text-dim)' }}>{col}</span>
          ))}
        </div>

        {/* Goal cards */}
        <div className="space-y-3 mb-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--th-card)' }} />
            ))
          ) : filteredGoals.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--th-text-dim)' }} />
              <p className="text-[13px] font-medium" style={{ color: 'var(--th-text-muted)' }}>No {activeTab.toLowerCase()} goals yet</p>
              <button onClick={() => setShowForm(true)} className="mt-3 px-4 py-2 rounded-xl text-[12px] font-semibold"
                style={{ background: 'var(--th-primary)', color: '#08080d' }}>Create Goal</button>
            </div>
          ) : (
            filteredGoals.map((goal, i) => (
              <motion.div key={goal.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}>
                <GoalCardMobile goal={goal} onEdit={handleEdit} onDelete={handleDelete} />
              </motion.div>
            ))
          )}
        </div>

        {/* Add New Goal link */}
        {filteredGoals.length > 0 && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-[12px] font-semibold mb-4"
            style={{ color: 'var(--th-primary)' }}>
            <Plus className="w-3.5 h-3.5" /> Add New Goal
          </button>
        )}

        {/* Weekly Overview */}
        <div className="mb-4">
          <WeeklyOverview goals={goals} />
        </div>

        {/* Motivation Boost */}
        <div className="mb-6">
          <MotivationBoost />
        </div>
      </div>
        )}
      </div>


      {/* ══════════════════════════════════════
          DESKTOP LAYOUT
          ══════════════════════════════════════ */}
      <div className="hidden lg:block">

        {/* Header — always visible */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[28px] font-bold" style={{ color: 'var(--th-text)' }}>Goals</h1>
            <p className="text-[13px] mt-1" style={{ color: 'var(--th-text-muted)' }}>Track your weekly & monthly goals</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Weekly/Monthly toggle */}
            <div className="flex rounded-xl p-1" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
              {['WEEKLY', 'MONTHLY'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="px-5 py-2 text-[13px] font-semibold rounded-lg transition-all"
                  style={{
                    background: activeTab === tab ? 'var(--th-primary)' : 'transparent',
                    color: activeTab === tab ? '#08080d' : 'var(--th-text-muted)',
                  }}>
                  {tab === 'WEEKLY' ? 'Weekly' : 'Monthly'}
                </button>
              ))}
            </div>
            {/* Add Goal button */}
            <button onClick={() => { setEditingGoal(null); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:opacity-90"
              style={{ background: 'var(--th-primary)', color: '#08080d' }}>
              <Plus className="w-4 h-4" /> Add Goal
            </button>
          </div>
        </div>

        {/* Monthly view — completely different layout */}
        {activeTab === 'MONTHLY' && (
          <MonthlyGoalsView
            goals={goals}
            stats={s}
            isLoading={isLoading}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            onShowForm={() => { setEditingGoal(null); setShowForm(true); }}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        {activeTab !== 'MONTHLY' && (<>

        {/* Stats Row + Calendar */}
        <div className="flex gap-4 mb-5">
          {/* 5 stat cards */}
          <div className="flex-1 grid grid-cols-5 gap-3">
            <StatCard label="Goals Progress" isRing pct={s.overallProgress} sub="Overall Progress"
              icon={<TrendingUp className="w-3.5 h-3.5" />} iconColor="#E8B94A"
              change={s.progressChange ?? 0} />
            <StatCard label="Completed" value={s.completedCount}
              icon={<CheckCircle2 className="w-3.5 h-3.5" />} iconColor="#10b981"
              sub={`of ${s.totalGoals} goals`} change={s.completedChange ?? 0} />
            <StatCard label="On Track" value={s.onTrackCount}
              icon={<Target className="w-3.5 h-3.5" />} iconColor="#E8B94A"
              sub="goal" change={s.onTrackChange ?? 0} />
            <StatCard label="Needs Attention" value={s.needsAttentionCount}
              icon={<AlertTriangle className="w-3.5 h-3.5" />} iconColor="#f97316"
              sub="goal" change={s.attentionChange ?? 0} />
            <StatCard label="Completion Rate" value={`${s.completionRate}%`}
              icon={<Target className="w-3.5 h-3.5" />} iconColor="#10b981"
              sub="avg. completion" change={s.rateChange ?? 0} />
          </div>
          {/* Calendar */}
          <div className="w-[220px] shrink-0">
            <GoalCalendar calendarDays={calDays} />
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-5">
          <CategoryFilters active={categoryFilter} onChange={setCategoryFilter} />
        </div>

        {/* Main content: Table + Sidebar */}
        <div className="flex gap-4">
          {/* Goals Table */}
          <div className="flex-1 min-w-0">
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--th-border)' }}>
                    {['GOAL', 'PROGRESS', 'STREAK', 'DUE', 'STATUS', ''].map((col, i) => (
                      <th key={col || i} className={clsx('text-left text-[11px] font-semibold uppercase px-4 py-3', i === 0 && 'pl-5')}
                        style={{ color: 'var(--th-text-dim)' }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}><td colSpan={6} className="px-5 py-4">
                        <div className="h-8 rounded-lg animate-pulse" style={{ background: 'var(--th-highlight)' }} />
                      </td></tr>
                    ))
                  ) : filteredGoals.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-16">
                      <Target className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--th-text-dim)' }} />
                      <p className="text-[13px]" style={{ color: 'var(--th-text-muted)' }}>No goals found</p>
                    </td></tr>
                  ) : (
                    filteredGoals.map(goal => (
                      <GoalTableRow key={goal.id} goal={goal} onToggle={toggleMilestone}
                        onEdit={handleEdit} onDelete={handleDelete} />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Add New Goal link */}
            {filteredGoals.length > 0 && (
              <button onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 mt-4 text-[13px] font-semibold transition-colors hover:opacity-80"
                style={{ color: 'var(--th-primary)' }}>
                <Plus className="w-4 h-4" /> Add New Goal
              </button>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-[240px] shrink-0 space-y-4">
            <WeeklyOverview goals={goals} />
            <MotivationBoost />
          </div>
        </div>
        </>)}
      </div>


      {/* ─── FAB (Mobile) ─── */}
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => { setEditingGoal(null); setShowForm(true); }}
        className="fixed bottom-20 lg:hidden left-1/2 -translate-x-1/2 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl z-40"
        style={{ background: 'var(--th-primary)' }}>
        <Plus className="w-6 h-6" style={{ color: '#08080d' }} />
      </motion.button>

      {/* ─── Goal Form Modal ─── */}
      <GoalForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingGoal(null); }}
        onSubmit={handleSubmit}
        goal={editingGoal}
      />
    </AnimatedPage>
  );
}
