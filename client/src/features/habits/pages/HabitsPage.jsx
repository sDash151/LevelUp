import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, CheckCircle2, TrendingUp, Flame, Target, Wallet, Dumbbell,
  List, CalendarDays, Filter, ChevronLeft, ChevronRight, Trash2, Pencil,
  LayoutGrid, BarChart2, Circle,
} from 'lucide-react';
import { AnimatedPage, PageSkeleton } from '@/design-system/components';
import { useHabitRichStats, useToggleHabit, useDeleteHabit, useCreateHabit, useUpdateHabit } from '../hooks/useHabits';
import { HabitForm } from '../components/HabitForm';
import { HabitsCalendarView } from '../components/HabitsCalendarView';
import { AIHabitInsight } from '../components/AIHabitInsight';
import clsx from 'clsx';

/* ─── Constants ─── */
const CATEGORY_CONFIG = {
  all: { label: 'All Habits', emoji: '⚡', color: 'var(--th-primary)' },
  mindfulness: { label: 'Mindfulness', emoji: '🧘', color: '#8b5cf6' },
  fitness: { label: 'Fitness', emoji: '💪', color: '#10b981' },
  learning: { label: 'Learning', emoji: '📚', color: '#f59e0b' },
  career: { label: 'Career', emoji: '💼', color: '#6366f1' },
  health: { label: 'Health', emoji: '❤️', color: '#ef4444' },
  general: { label: 'General', emoji: '✦', color: '#06b6d4' },
};

/* ─── Circular Progress Ring ─── */
function CircleRing({ pct = 0, size = 80, stroke = 6, color = 'var(--th-primary)', children, fluid = false }) {
  if (fluid) {
    // Fluid mode: SVG fills its parent container 100%
    const vbSize = 100;
    const r = (vbSize - stroke * 2) / 2;
    const c = 2 * Math.PI * r;
    const offset = c - (pct / 100) * c;
    return (
      <div className="relative flex items-center justify-center" style={{ width: '100%', height: '100%' }}>
        <svg viewBox={`0 0 ${vbSize} ${vbSize}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          <circle cx={vbSize / 2} cy={vbSize / 2} r={r} fill="none" stroke="var(--th-highlight)" strokeWidth={stroke} />
          <motion.circle cx={vbSize / 2} cy={vbSize / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeLinecap="round" initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }} style={{ strokeDasharray: c }} />
        </svg>
        <div className="relative z-10 text-center">{children}</div>
      </div>
    );
  }
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 absolute inset-0">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--th-highlight)" strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }} style={{ strokeDasharray: c }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center z-10">{children}</div>
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({ title, icon: Icon, iconColor, children, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}>
      <div className="rounded-2xl p-4 relative overflow-hidden h-full"
        style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', boxShadow: 'var(--th-shadow)' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] font-medium" style={{ color: 'var(--th-text-secondary)' }}>{title}</span>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${iconColor}18` }}>
            <Icon className="w-3.5 h-3.5" style={{ color: iconColor }} />
          </div>
        </div>
        {children}
      </div>
    </motion.div>
  );
}

/* ─── Progress Bar ─── */
function ProgressBar({ pct, color }) {
  return (
    <div className="mt-2 h-1 rounded-full" style={{ background: 'var(--th-highlight)' }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
        className="h-full rounded-full" style={{ background: color }} />
    </div>
  );
}

/* ─── Habit Row (Desktop) ─── */
function HabitRow({ habit, onToggle, onEdit, onDelete }) {
  const today = new Date().toISOString().split('T')[0];
  const catConfig = CATEGORY_CONFIG[habit.category] || CATEGORY_CONFIG.general;
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
      className="flex items-center gap-4 px-4 py-3 rounded-xl transition-colors group"
      style={{ background: 'transparent', border: '1px solid transparent' }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--th-highlight)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
      {/* Color dot + name */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: habit.color }} />
        <div className="min-w-0">
          <p className="text-[14px] font-medium truncate" style={{ color: 'var(--th-text)', textDecoration: habit.completedToday ? 'line-through' : 'none', opacity: habit.completedToday ? 0.6 : 1 }}>{habit.name}</p>
          <span className="text-[11px] px-1.5 py-0.5 rounded-md" style={{ background: `${catConfig.color}15`, color: catConfig.color }}>
            {catConfig.emoji} {catConfig.label}
          </span>
        </div>
      </div>
      {/* Streak */}
      <div className="w-24 text-center hidden sm:block">
        <p className="text-[15px] font-bold" style={{ color: 'var(--th-text)' }}>{habit.currentStreak ?? 0}</p>
        <p className="text-[11px]" style={{ color: 'var(--th-text-dim)' }}>days 🔥</p>
      </div>
      {/* Consistency */}
      <div className="w-24 text-center hidden md:block">
        <p className="text-[14px] font-semibold" style={{ color: 'var(--th-text)' }}>{habit.consistencyPct ?? 0}%</p>
        <div className="h-1 rounded-full mt-1" style={{ background: 'var(--th-highlight)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${habit.consistencyPct ?? 0}%`, background: habit.color }} />
        </div>
      </div>
      {/* Today toggle */}
      <button onClick={() => onToggle(habit.id, today)}
        className={clsx('w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all hover:scale-110 ml-auto',
          habit.completedToday ? 'border-emerald-500 bg-emerald-500' : 'hover:border-emerald-400')}
        style={!habit.completedToday ? { borderColor: 'var(--th-text-dim)' } : undefined}>
        {habit.completedToday && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
      </button>
      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(habit)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--th-highlight)]" style={{ color: 'var(--th-text-dim)' }}>
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onDelete(habit.id)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/10" style={{ color: 'var(--th-text-dim)' }}>
          <Trash2 className="w-3.5 h-3.5 hover:text-red-400" />
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Habit Card (Mobile) ─── */
function HabitCard({ habit, onToggle, onEdit, onDelete, isEditMode }) {
  const today = new Date().toISOString().split('T')[0];
  const catConfig = CATEGORY_CONFIG[habit.category] || CATEGORY_CONFIG.general;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
      className="p-4 rounded-2xl" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${habit.color}20` }}>
          <span className="text-base">{catConfig.emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold truncate" style={{ color: 'var(--th-text)', textDecoration: habit.completedToday ? 'line-through' : 'none', opacity: habit.completedToday ? 0.6 : 1 }}>{habit.name}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[11px]" style={{ color: 'var(--th-text-dim)' }}>🔥 {habit.currentStreak ?? 0} day streak</span>
            <span className="text-[11px]" style={{ color: 'var(--th-text-dim)' }}>{habit.consistencyPct ?? 0}% consistent</span>
          </div>
          <AnimatePresence>
            {isEditMode && (
              <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 12 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} className="flex items-center gap-2 overflow-hidden">
                <button onClick={() => onEdit(habit)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors active:scale-95" style={{ background: 'var(--th-highlight)', color: 'var(--th-text-secondary)' }}>
                  <Pencil className="w-3.5 h-3.5" /> <span className="text-[11px] font-medium">Edit</span>
                </button>
                <button onClick={() => onDelete(habit.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors active:scale-95" style={{ background: 'var(--th-highlight)', color: 'var(--th-text-secondary)' }}>
                  <Trash2 className="w-3.5 h-3.5 hover:text-red-400" /> <span className="text-[11px] font-medium hover:text-red-400">Delete</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button onClick={() => onToggle(habit.id, today)}
          className={clsx('w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all hover:scale-110',
            habit.completedToday ? 'border-emerald-500 bg-emerald-500' : '')}
          style={!habit.completedToday ? { borderColor: 'var(--th-text-dim)' } : undefined}>
          {habit.completedToday && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Mini Calendar ─── */
function HabitCalendar({ logDates = [] }) {
  const [current, setCurrent] = useState(new Date());
  const year = current.getFullYear();
  const month = current.getMonth();
  const logSet = new Set(logDates);
  const today = new Date().toISOString().split('T')[0];

  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7; // Monday start
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(offset).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const prev = () => setCurrent(new Date(year, month - 1, 1));
  const next = () => setCurrent(new Date(year, month + 1, 1));

  const monthName = current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-semibold" style={{ color: 'var(--th-text)' }}>Habit Calendar</h3>
        <div className="flex items-center gap-2">
          <span className="text-[12px]" style={{ color: 'var(--th-text-muted)' }}>{monthName}</span>
          <button onClick={prev} className="w-6 h-6 flex items-center justify-center rounded-md transition-colors" style={{ color: 'var(--th-text-dim)' }}><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={next} className="w-6 h-6 flex items-center justify-center rounded-md transition-colors" style={{ color: 'var(--th-text-dim)' }}><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i} className="text-center text-[11px] font-medium" style={{ color: 'var(--th-text-dim)' }}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1.5 gap-x-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === today;
          const hasLog = logSet.has(dateStr);
          return (
            <div key={dateStr} className="flex flex-col items-center gap-0.5">
              <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-medium transition-colors')}
                style={{
                  background: isToday ? 'var(--th-primary)' : 'transparent',
                  color: isToday ? '#08080d' : 'var(--th-text-secondary)',
                }}>
                {day}
              </div>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: hasLog ? '#10b981' : 'transparent' }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Weekly Overview Circles ─── */
function WeeklyOverview({ data = [] }) {
  const row1 = data.slice(0, 4);
  const row2 = data.slice(4);
  const renderCircle = (d) => (
    <div key={d.day} className="flex flex-col items-center gap-2">
      <CircleRing pct={d.pct} size={48} stroke={4} color={d.isToday ? '#E8B94A' : '#10b981'}>
        <span className="text-[11px] font-bold leading-none" style={{ color: d.isToday ? '#E8B94A' : 'var(--th-text)' }}>
          {d.pct}%
        </span>
      </CircleRing>
      <span className="text-[11px] font-semibold" style={{ color: d.isToday ? '#E8B94A' : 'var(--th-text-dim)' }}>
        {d.day}
      </span>
    </div>
  );
  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-around">
        {row1.map(renderCircle)}
      </div>
      <div className="flex items-center justify-around px-8">
        {row2.map(renderCircle)}
      </div>
    </div>
  );
}

/* ─── Top Habits Bar Chart ─── */
function TopHabitsChart({ habits = [] }) {
  if (!habits.length) {
    return (
      <div className="flex flex-col items-center justify-center py-6 gap-2">
        <BarChart2 className="w-8 h-8" style={{ color: 'var(--th-text-dim)' }} />
        <p className="text-[12px]" style={{ color: 'var(--th-text-dim)' }}>No data yet</p>
        <p className="text-[11px]" style={{ color: 'var(--th-text-dim)' }}>Add habits to see your top habits here</p>
      </div>
    );
  }
  const max = Math.max(...habits.map((h) => h.streak), 1);
  return (
    <div className="space-y-2.5">
      {habits.map((h) => (
        <div key={h.id} className="flex items-center gap-3">
          <span className="text-[12px] w-28 truncate" style={{ color: 'var(--th-text-secondary)' }}>{h.name}</span>
          <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--th-highlight)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${(h.streak / max) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
              className="h-full rounded-full" style={{ background: h.color }} />
          </div>
          <span className="text-[12px] w-8 text-right font-medium" style={{ color: 'var(--th-text-muted)' }}>{h.streak}d</span>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN HABITS PAGE
   ════════════════════════════════════════ */
export default function HabitsPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useHabitRichStats();
  const toggleHabit = useToggleHabit();
  const deleteHabit = useDeleteHabit();
  const createHabit = useCreateHabit();
  const updateHabit = useUpdateHabit();

  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('list'); // 'list' | 'calendar'
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [isMobileEditMode, setIsMobileEditMode] = useState(false);

  const habits = stats?.habits ?? [];
  const today = new Date().toISOString().split('T')[0];

  const filteredHabits = useMemo(() => {
    if (filter === 'all') return habits;
    return habits.filter((h) => h.category === filter);
  }, [habits, filter]);

  const handleToggle = (id) => toggleHabit.mutate({ id, date: today });
  const handleEdit = (habit) => { setEditingHabit(habit); setShowForm(true); };
  const handleDelete = (id) => deleteHabit.mutate(id);
  const handleSubmit = (data) => {
    if (editingHabit) {
      updateHabit.mutate({ id: editingHabit.id, data });
    } else {
      createHabit.mutate(data);
    }
  };

  const catKeys = ['all', 'mindfulness', 'fitness', 'learning', 'career', 'health'];

  /* ─── Shared category filter strip ─── */
  const CategoryFilters = () => (
    <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
      {catKeys.map((cat) => {
        const cfg = CATEGORY_CONFIG[cat];
        return (
          <button key={cat} onClick={() => setFilter(cat)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium whitespace-nowrap transition-all"
            style={{
              background: filter === cat ? 'rgba(var(--th-primary-rgb), 0.12)' : 'var(--th-card)',
              border: filter === cat ? '1px solid rgba(var(--th-primary-rgb), 0.3)' : '1px solid var(--th-border)',
              color: filter === cat ? 'var(--th-primary)' : 'var(--th-text-muted)',
            }}>
            <span>{cfg.emoji}</span> {cfg.label}
          </button>
        );
      })}
    </div>
  );

  if (isLoading || !stats) return <PageSkeleton />;

  return (
    <AnimatedPage>

      {/* ══════════════════════════════════════
          MOBILE LAYOUT  (hidden on lg+)
          ══════════════════════════════════════ */}
      <div className="lg:hidden w-full overflow-x-hidden">

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--th-text)' }}>Habits</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--th-text-muted)' }}>
              <span className="font-semibold" style={{ color: 'var(--th-primary)' }}>{stats?.completedToday ?? 0}</span>
              {' of '}
              <span className="font-semibold" style={{ color: 'var(--th-primary)' }}>{stats?.totalActive ?? 0}</span>
              {' completed today'}
            </p>
          </div>
          {/* List / Calendar toggle */}
          <div className="flex items-center gap-1 rounded-xl p-1 mr-12" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
            <button onClick={() => setView('list')} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{ background: view === 'list' ? 'var(--th-primary)' : 'transparent', color: view === 'list' ? '#08080d' : 'var(--th-text-muted)' }}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setView('calendar')} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{ background: view === 'calendar' ? 'var(--th-primary)' : 'transparent', color: view === 'calendar' ? '#08080d' : 'var(--th-text-muted)' }}>
              <CalendarDays className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category filter tabs — only in list view */}
        {view === 'list' && (
          <div className="mb-4">
            <CategoryFilters />
          </div>
        )}

        {/* Calendar view */}
        {view === 'calendar' && (
          <HabitsCalendarView onNavigate={navigate} />
        )}

        {/* List view content */}
        {view === 'list' && (
          <>

        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Daily Progress */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-medium" style={{ color: 'var(--th-text-secondary)' }}>Daily Progress</span>
              <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--th-primary)' }} />
            </div>
            <div className="flex justify-center">
              <CircleRing pct={stats?.todayPct ?? 0} size={80} stroke={6} color="var(--th-primary)">
                <span className="text-[16px] font-bold" style={{ color: 'var(--th-text)' }}>{stats?.todayPct ?? 0}%</span>
              </CircleRing>
            </div>
            <p className="text-center text-[11px] mt-2" style={{ color: 'var(--th-text-muted)' }}>
              {(stats?.todayPct ?? 0) === 100 ? 'Perfect day! 🎉' : 'Complete today!'}
            </p>
          </motion.div>

          {/* Current Streak */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-medium" style={{ color: 'var(--th-text-secondary)' }}>Current Streak</span>
              <Flame className="w-3.5 h-3.5" style={{ color: '#f97316' }} />
            </div>
            <p className="text-4xl font-bold" style={{ color: 'var(--th-text)' }}>{stats?.currentStreak ?? 0}</p>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--th-text-muted)' }}>days</p>
            <p className="text-[12px] mt-4" style={{ color: 'var(--th-text-dim)' }}>Best: {stats?.bestStreak ?? 0} days 🏆</p>
          </motion.div>

          {/* Weekly Consistency */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-medium" style={{ color: 'var(--th-text-secondary)' }}>Weekly Consistency</span>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: '#06b6d4' }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#06b6d4' }} />
              </div>
            </div>
            <p className="text-3xl font-bold" style={{ color: 'var(--th-text)' }}>{stats?.weeklyPct ?? 0}%</p>
            <p className="text-[12px] mt-1" style={{ color: 'var(--th-text-muted)' }}>{stats?.weekCompleted ?? 0} of {(stats?.weekTotal ?? 0) * 7} habits</p>
            <ProgressBar pct={stats?.weeklyPct ?? 0} color="#06b6d4" />
          </motion.div>

          {/* Monthly Progress */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-medium" style={{ color: 'var(--th-text-secondary)' }}>Monthly Progress</span>
              <CalendarDays className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
            </div>
            <p className="text-3xl font-bold" style={{ color: 'var(--th-text)' }}>{stats?.monthlyPct ?? 0}%</p>
            <p className="text-[12px] mt-1" style={{ color: 'var(--th-text-muted)' }}>{stats?.monthCompleted ?? 0} of {stats?.monthTotal ?? 0} habits</p>
            <ProgressBar pct={stats?.monthlyPct ?? 0} color="#10b981" />
          </motion.div>
        </div>

        {/* Total Habits + Quick Actions — side by side */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Total Habits */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-medium" style={{ color: 'var(--th-text-secondary)' }}>Total Habits</span>
              <LayoutGrid className="w-3.5 h-3.5" style={{ color: '#6366f1' }} />
            </div>
            <p className="text-4xl font-bold" style={{ color: 'var(--th-text)' }}>{stats?.totalActive ?? 0}</p>
            <button className="text-[12px] font-semibold mt-2 block" style={{ color: 'var(--th-primary)' }}>
              Active habits
            </button>
            <p className="text-[12px] mt-1" style={{ color: 'var(--th-text-dim)' }}>{stats?.totalArchived ?? 0} archived</p>
          </motion.div>

          {/* Quick Actions — 2×2 grid */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
            <span className="text-[12px] font-medium block mb-3" style={{ color: 'var(--th-text-secondary)' }}>Quick Actions</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: CheckCircle2, label: 'Log Habit', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', iconColor: '#10b981', action: () => { setEditingHabit(null); setShowForm(true); } },
                { icon: Target, label: 'Add Goal', bg: 'rgba(232,185,74,0.1)', border: 'rgba(232,185,74,0.2)', iconColor: '#E8B94A', action: () => navigate('/goals') },
                { icon: Dumbbell, label: 'Workout', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)', iconColor: '#6366f1', action: () => navigate('/fitness') },
                { icon: Wallet, label: 'Finance', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.2)', iconColor: '#f97316', action: () => navigate('/finance') },
              ].map((a) => (
                <button key={a.label} onClick={a.action}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all active:scale-95"
                  style={{ background: a.bg, border: `1px solid ${a.border}` }}>
                  <a.icon className="w-5 h-5" style={{ color: a.iconColor }} />
                  <span className="text-[10px] font-medium leading-tight text-center" style={{ color: 'var(--th-text-muted)' }}>{a.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Today's Habits section */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <h3 className="text-[15px] font-semibold" style={{ color: 'var(--th-text)' }}>Today's Habits</h3>
            <button onClick={() => setIsMobileEditMode(!isMobileEditMode)} className="text-[13px] font-medium" style={{ color: isMobileEditMode ? 'var(--th-text-muted)' : 'var(--th-primary)' }}>
              {isMobileEditMode ? 'Done' : 'Edit'}
            </button>
          </div>

          {filteredHabits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 gap-3">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" style={{ color: 'var(--th-text-dim)', opacity: 0.25 }} />
                <span className="absolute -top-1 -right-1 text-lg opacity-40">✦</span>
                <span className="absolute -bottom-1 -left-1 text-lg opacity-40">✦</span>
              </div>
              <p className="text-[15px] font-semibold" style={{ color: 'var(--th-text)' }}>No habits yet</p>
              <p className="text-[13px]" style={{ color: 'var(--th-text-muted)' }}>Add habits to track your progress</p>
            </div>
          ) : (
            <div className="px-3 pb-3 space-y-2">
              <AnimatePresence>
                {filteredHabits.map((habit) => (
                  <HabitCard key={habit.id} habit={habit} onToggle={handleToggle} onEdit={handleEdit} onDelete={handleDelete} isEditMode={isMobileEditMode} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* AI Insight — mobile */}
        <div className="mt-4">
          <AIHabitInsight />
        </div>

        {/* Weekly Overview — mobile */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl p-4 mt-3" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[15px] font-semibold" style={{ color: 'var(--th-text)' }}>Weekly Overview</h3>
            <span className="text-[12px] px-2.5 py-1 rounded-lg" style={{ background: 'var(--th-highlight)', color: 'var(--th-text-muted)' }}>This Week</span>
          </div>
          {stats?.weeklyOverview?.length ? (
            <WeeklyOverview data={stats.weeklyOverview} />
          ) : (
            <div className="flex items-center justify-center h-20">
              <p className="text-[12px]" style={{ color: 'var(--th-text-dim)' }}>No data yet</p>
            </div>
          )}
        </motion.div>

        {/* Top Habits — mobile */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="rounded-2xl p-4 mt-3" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-semibold" style={{ color: 'var(--th-text)' }}>Top Habits</h3>
            <BarChart2 className="w-4 h-4" style={{ color: 'var(--th-text-dim)' }} />
          </div>
          <TopHabitsChart habits={stats?.topHabits ?? []} />
        </motion.div>

        {/* Habit Calendar — mobile */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-2xl p-4 mt-3" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <HabitCalendar logDates={stats?.logDates ?? []} />
        </motion.div>

        {/* Categories — mobile */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="rounded-2xl p-4 mt-3 mb-20" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <h3 className="text-[15px] font-semibold mb-3" style={{ color: 'var(--th-text)' }}>Categories</h3>
          <div className="space-y-1.5">
            {(stats?.categories ?? []).map((cat) => (
              <button key={cat.key} onClick={() => setFilter(cat.key)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all active:scale-[0.98]"
                style={{ background: filter === cat.key ? 'var(--th-highlight)' : 'transparent' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                  <span className="text-[13px] font-medium" style={{ color: 'var(--th-text-secondary)' }}>{cat.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px]" style={{ color: 'var(--th-text-dim)' }}>{cat.count} habits</span>
                  <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--th-text-dim)' }} />
                </div>
              </button>
            ))}
          </div>
        </motion.div>

          </>
        )}
      </div>


      {/* ══════════════════════════════════════
          DESKTOP LAYOUT  (hidden below lg)
          ══════════════════════════════════════ */}
      <div className="hidden lg:block">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[28px] font-bold" style={{ color: 'var(--th-text)' }}>Habits</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--th-text-muted)' }}>
              <span className="font-semibold" style={{ color: 'var(--th-primary)' }}>{stats?.completedToday ?? 0}</span>
              {' of '}
              <span className="font-semibold" style={{ color: 'var(--th-primary)' }}>{stats?.totalActive ?? 0}</span>
              {' completed today'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl p-1 gap-1" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
              <button onClick={() => setView('list')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all"
                style={{ background: view === 'list' ? 'var(--th-primary)' : 'transparent', color: view === 'list' ? '#08080d' : 'var(--th-text-muted)' }}>
                <List className="w-3.5 h-3.5" /> List
              </button>
              <button onClick={() => setView('calendar')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all"
                style={{ background: view === 'calendar' ? 'var(--th-primary)' : 'transparent', color: view === 'calendar' ? '#08080d' : 'var(--th-text-muted)' }}>
                <CalendarDays className="w-3.5 h-3.5" /> Calendar
              </button>
            </div>
            <div className="flex items-center gap-2">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => { setEditingHabit(null); setShowForm(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all"
                style={{ background: 'var(--th-primary)', color: '#08080d' }}>
                <Plus className="w-4 h-4" /> Add Habit
              </motion.button>
            </div>
          </div>
        </div>

        {/* Calendar view — desktop */}
        {view === 'calendar' && (
          <HabitsCalendarView onNavigate={navigate} />
        )}

        {/* List view — desktop */}
        {view === 'list' && (
          <>
        {/* 5 Stat Cards */}
        <div className="grid grid-cols-5 gap-3 mb-5">
          <StatCard title="Daily Progress" icon={TrendingUp} iconColor="var(--th-primary)" delay={0.05}>
            <div className="flex justify-center">
              <CircleRing pct={stats?.todayPct ?? 0} size={72} stroke={6} color="var(--th-primary)">
                <span className="text-[15px] font-bold" style={{ color: 'var(--th-text)' }}>{stats?.todayPct ?? 0}%</span>
              </CircleRing>
            </div>
            <p className="text-center text-[11px] mt-2" style={{ color: 'var(--th-text-muted)' }}>
              {(stats?.todayPct ?? 0) === 100 ? 'Perfect day! 🎉' : (stats?.todayPct ?? 0) > 0 ? 'Keep going!' : 'Complete today!'}
            </p>
          </StatCard>

          <StatCard title="Current Streak" icon={Flame} iconColor="#f97316" delay={0.1}>
            <p className="text-3xl font-bold" style={{ color: 'var(--th-text)' }}>{stats?.currentStreak ?? 0}</p>
            <p className="text-[13px]" style={{ color: 'var(--th-text-muted)' }}>days</p>
            <p className="text-[12px] mt-2" style={{ color: 'var(--th-text-dim)' }}>Best: {stats?.bestStreak ?? 0} days 🏆</p>
          </StatCard>

          <StatCard title="Weekly Consistency" icon={() => <span className="text-sm">◎</span>} iconColor="#06b6d4" delay={0.15}>
            <p className="text-2xl font-bold" style={{ color: 'var(--th-text)' }}>{stats?.weeklyPct ?? 0}%</p>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--th-text-muted)' }}>{stats?.weekCompleted ?? 0} of {(stats?.weekTotal ?? 0) * 7} habits</p>
            <ProgressBar pct={stats?.weeklyPct ?? 0} color="#06b6d4" />
          </StatCard>

          <StatCard title="Monthly Progress" icon={CalendarDays} iconColor="#10b981" delay={0.2}>
            <p className="text-2xl font-bold" style={{ color: 'var(--th-text)' }}>{stats?.monthlyPct ?? 0}%</p>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--th-text-muted)' }}>{stats?.monthCompleted ?? 0} of {stats?.monthTotal ?? 0} habits</p>
            <ProgressBar pct={stats?.monthlyPct ?? 0} color="#10b981" />
          </StatCard>

          <StatCard title="Total Habits" icon={LayoutGrid} iconColor="#6366f1" delay={0.25}>
            <p className="text-3xl font-bold" style={{ color: 'var(--th-text)' }}>{stats?.totalActive ?? 0}</p>
            <button className="text-[12px] font-semibold mt-1 block" style={{ color: 'var(--th-primary)' }}>Active habits</button>
            <p className="text-[12px] mt-1" style={{ color: 'var(--th-text-dim)' }}>{stats?.totalArchived ?? 0} archived</p>
          </StatCard>
        </div>

        {/* Main content: habits list + sidebar */}
        <div className="flex gap-5">
          <div className="flex-1 min-w-0">
            {/* Category filter + Filter */}
            <div className="flex items-center gap-3 mb-4">
              <CategoryFilters />
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium shrink-0 transition-all"
                style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', color: 'var(--th-text-muted)' }}>
                <Filter className="w-3.5 h-3.5" /> Filter
              </button>
            </div>

            {/* Table header */}
            {filteredHabits.length > 0 && (
              <div className="grid grid-cols-[1fr_100px_100px_80px_60px] gap-4 px-4 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--th-text-dim)' }}>Habit</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-center" style={{ color: 'var(--th-text-dim)' }}>Streak</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-center" style={{ color: 'var(--th-text-dim)' }}>Consistency</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-center" style={{ color: 'var(--th-text-dim)' }}>Today</span>
              </div>
            )}

            {/* Habit list */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
              {filteredHabits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--th-highlight)' }}>
                    <CheckCircle2 className="w-8 h-8" style={{ color: 'var(--th-text-dim)' }} />
                  </div>
                  <p className="text-[16px] font-semibold" style={{ color: 'var(--th-text)' }}>No habits yet</p>
                  <p className="text-[13px]" style={{ color: 'var(--th-text-muted)' }}>Start building better habits today!</p>
                  <button onClick={() => { setEditingHabit(null); setShowForm(true); }}
                    className="flex items-center gap-2 mt-1 px-4 py-2 rounded-xl text-[13px] font-medium transition-all hover:brightness-110"
                    style={{ background: 'rgba(var(--th-primary-rgb), 0.12)', border: '1px solid rgba(var(--th-primary-rgb), 0.25)', color: 'var(--th-primary)' }}>
                    <Plus className="w-4 h-4" /> Add Your First Habit
                  </button>
                </div>
              ) : (
                <AnimatePresence>
                  <div className="divide-y" style={{ borderColor: 'var(--th-border)' }}>
                    {filteredHabits.map((habit) => (
                      <HabitRow key={habit.id} habit={habit} onToggle={handleToggle} onEdit={handleEdit} onDelete={handleDelete} />
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </div>

            {/* AI Insight */}
            <div className="mt-5">
              <AIHabitInsight />
            </div>

            {/* Weekly Overview + Top Habits moved to right sidebar */}
          </div>

          {/* Right Sidebar */}
          <div className="flex flex-col gap-4 w-[280px] shrink-0">
            {/* Habit Calendar */}
            <div className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
              <HabitCalendar logDates={stats?.logDates ?? []} />
            </div>
            {/* Categories */}
            <div className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
              <h3 className="text-[14px] font-semibold mb-3" style={{ color: 'var(--th-text)' }}>Categories</h3>
              <div className="space-y-2">
                {(stats?.categories ?? []).map((cat) => (
                  <button key={cat.key} onClick={() => setFilter(cat.key)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-all hover:bg-[var(--th-highlight)]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                      <span className="text-[13px]" style={{ color: 'var(--th-text-secondary)' }}>{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[12px]" style={{ color: 'var(--th-text-dim)' }}>{cat.count} habits</span>
                      <ChevronRight className="w-3 h-3" style={{ color: 'var(--th-text-dim)' }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Weekly Overview */}
            <div className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[14px] font-semibold" style={{ color: 'var(--th-text)' }}>Weekly Overview</h3>
                <span className="text-[11px] px-2.5 py-1 rounded-lg" style={{ background: 'var(--th-highlight)', color: 'var(--th-text-muted)' }}>This Week</span>
              </div>
              {stats?.weeklyOverview?.length ? (
                <WeeklyOverview data={stats.weeklyOverview} />
              ) : (
                <div className="flex items-center justify-center h-20">
                  <p className="text-[12px]" style={{ color: 'var(--th-text-dim)' }}>No data yet</p>
                </div>
              )}
            </div>
            
            {/* Top Habits */}
            <div className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-semibold" style={{ color: 'var(--th-text)' }}>Top Habits</h3>
                <BarChart2 className="w-4 h-4" style={{ color: 'var(--th-text-dim)' }} />
              </div>
              <TopHabitsChart habits={stats?.topHabits ?? []} />
            </div>
          </div>
        </div>
          </>
        )}
      </div>

      {/* ─── FAB (Mobile) ─── */}
      <button
        onClick={() => { setEditingHabit(null); setShowForm(true); }}
        className="lg:hidden fixed bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-transform active:scale-95"
        style={{ background: 'linear-gradient(135deg, #E8A23A, #D4891A)' }}>
        <Plus className="w-6 h-6" />
      </button>

      {/* ─── Habit Form Modal ─── */}
      <HabitForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingHabit(null); }}
        onSubmit={handleSubmit}
        habit={editingHabit}
      />
    </AnimatedPage>
  );
}
