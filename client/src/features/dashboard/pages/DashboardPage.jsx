import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Flame, Clock, CheckCircle2, Star,
  Search, Bell, ChevronDown,
  CheckCircle, Target, Dumbbell, Wallet,
  Sparkles, ArrowRight, Calendar, Play, Pause, RotateCcw, Quote, Trophy, Zap,
} from 'lucide-react';
import { AnimatedPage } from '@/design-system/components';
import { useAuthStore } from '@/shared/stores/authStore';
import { getGreeting, formatDate } from '@/shared/utils/dates';
import { useDashboardSummary, useStartFocus, useCompleteFocus } from '../hooks/useDashboard';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/utils/api-client';
import clsx from 'clsx';

/* ─── Motivation quotes ─── */
const QUOTES = [
  { text: "Discipline today, freedom tomorrow. Keep showing up.", highlight: "showing up" },
  { text: "Small steps every day compound into extraordinary results.", highlight: "compound" },
  { text: "Your future self is watching you right now through your memories.", highlight: "memories" },
  { text: "The secret of your success is hidden in your daily routine.", highlight: "daily routine" },
  { text: "Progress is progress, no matter how small. Keep going.", highlight: "Keep going" },
  { text: "Winners aren't born. They're built one habit at a time.", highlight: "one habit at a time" },
  { text: "Don't count the days. Make the days count.", highlight: "Make the days count" },
];
const dailyQuote = QUOTES[new Date().getDate() % QUOTES.length];

/* ─── Card wrapper ─── */
function DCard({ children, className, gold, ...props }) {
  return (
    <div
      className={clsx('rounded-2xl p-5 relative overflow-hidden', className)}
      style={{
        background: gold ? 'rgba(var(--th-primary-rgb), 0.06)' : 'var(--th-card)',
        border: gold ? '1px solid rgba(var(--th-primary-rgb), 0.2)' : '1px solid var(--th-border)',
        boxShadow: 'var(--th-shadow)',
      }}
      {...props}
    >
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[var(--th-highlight)] to-transparent" />
      {children}
    </div>
  );
}

/* ─── SVG Progress Ring ─── */
function ProgressRing({ percent = 0, size = 120, stroke = 8 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--th-highlight)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
        stroke="url(#goldRing)" initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        style={{ strokeDasharray: c }}
      />
      <defs>
        <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--th-primary)" /><stop offset="100%" stopColor="var(--th-primary-dark)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Mini Sparkline ─── */
function MiniSparkline({ data = [], color = '#10b981' }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const w = 80, h = 32, gap = w / Math.max(data.length - 1, 1);
  const points = data.map((v, i) => `${i * gap},${h - (v / max) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="mt-2">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </svg>
  );
}

/* ─── Stat Card ─── */
function StatCard({ title, icon: Icon, iconColor, children, gold, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}>
      <DCard gold={gold} className="h-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] font-medium" style={{ color: 'var(--th-text-secondary)' }}>{title}</span>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${iconColor}22` }}>
            <Icon className="w-4 h-4" style={{ color: iconColor }} />
          </div>
        </div>
        {children}
      </DCard>
    </motion.div>
  );
}

/* ─── Quick Action Button ─── */
function ActionBtn({ icon: Icon, label, color, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2.5 group">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105" style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span className="text-[12px] group-hover:brightness-125 transition-colors" style={{ color: 'var(--th-text-muted)' }}>{label}</span>
    </button>
  );
}

/* ─── Weekly Bar Chart ─── */
function WeeklyBars({ data }) {
  if (!data?.length) return <div className="h-[140px] flex items-center justify-center text-[13px]" style={{ color: 'var(--th-text-dim)' }}>No data yet</div>;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end justify-between gap-2 h-[140px] pt-6">
      {data.map((d, i) => {
        const h = (d.value / max) * 100;
        return (
          <div key={d.day || i} className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-[11px] font-semibold" style={{ color: d.isHighest ? 'var(--th-primary)' : 'transparent' }}>{d.value}%</span>
            <div className="w-full rounded-t-md relative" style={{ height: `${Math.max(h, 4)}%` }}>
              <motion.div
                initial={{ height: 0 }} animate={{ height: '100%' }}
                transition={{ delay: 0.5 + i * 0.06, duration: 0.5 }}
                className="absolute bottom-0 w-full rounded-t-md"
                style={{ background: d.isHighest ? 'linear-gradient(to top, var(--th-primary-dark), var(--th-primary))' : 'linear-gradient(to top, rgba(var(--th-primary-rgb), 0.2), rgba(var(--th-primary-rgb), 0.4))' }}
              />
            </div>
            <span className="text-[11px]" style={{ color: 'var(--th-text-dim)' }}>{d.day}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Habit Consistency Heatmap (real data) ─── */
function HabitHeatmap({ data }) {
  if (!data?.length) {
    return <div className="text-[13px] text-center py-4" style={{ color: 'var(--th-text-dim)' }}>Add habits to see consistency</div>;
  }
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  // Show last 7 days labels
  const last7 = data[0]?.days?.slice(-7) ?? [];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 pl-24">
        {dayLabels.map((d, i) => <span key={i} className="flex-1 text-center text-[11px] font-medium" style={{ color: 'var(--th-text-dim)' }}>{d}</span>)}
      </div>
      {data.map((habit) => {
        const last7days = (habit.days || []).slice(-7);
        return (
          <div key={habit.name} className="flex items-center gap-2">
            <span className="w-24 text-[11px] truncate" style={{ color: 'var(--th-text-muted)' }}>{habit.name}</span>
            <div className="flex-1 flex gap-1.5">
              {last7days.map((done, i) => (
                <div key={i} className="flex-1 aspect-square rounded-[4px] transition-colors"
                  style={{ background: done ? (habit.color || '#10b981') : 'var(--th-highlight)' }}
                />
              ))}
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-end gap-1.5 pt-1">
        <span className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>Miss</span>
        <div className="w-3 h-3 rounded-[3px]" style={{ background: 'var(--th-highlight)' }} />
        <div className="w-3 h-3 rounded-[3px]" style={{ background: '#10b981' }} />
        <span className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>Done</span>
      </div>
    </div>
  );
}

/* ─── Today's Habits List (interactive) ─── */
function TodaysHabits({ habits, onToggle }) {
  if (!habits?.length) {
    return (
      <div className="text-center py-4">
        <p className="text-[13px]" style={{ color: 'var(--th-text-dim)' }}>No habits yet</p>
        <p className="text-[12px] mt-1" style={{ color: 'var(--th-text-dim)' }}>Add habits to track your progress</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {habits.map((h) => (
        <div key={h.id} className="flex items-center gap-3 group">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: h.completed ? '#10b98115' : 'var(--th-highlight)' }}>
            <span className="text-sm">{h.icon === 'check-circle' ? '✓' : '•'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium truncate" style={{ color: h.completed ? 'var(--th-text)' : 'var(--th-text-muted)', textDecoration: h.completed ? 'none' : 'none' }}>{h.name}</p>
            <p className="text-[11px]" style={{ color: 'var(--th-text-dim)' }}>{h.category}</p>
          </div>
          <button
            onClick={() => onToggle(h.id, h.completed)}
            className={clsx('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all hover:scale-110',
              h.completed ? 'border-emerald-500 bg-emerald-500' : 'hover:border-emerald-400')}
            style={!h.completed ? { borderColor: 'var(--th-text-dim)' } : undefined}
          >
            {h.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─── Goals Progress (real data) ─── */
function GoalsProgress({ goals }) {
  if (!goals?.length) {
    return <p className="text-[13px] text-center py-2" style={{ color: 'var(--th-text-dim)' }}>No active goals</p>;
  }
  return (
    <div className="space-y-3.5">
      {goals.map((g) => (
        <div key={g.id}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[13px] truncate max-w-[140px]" style={{ color: 'var(--th-text-secondary)' }}>{g.name}</span>
            <span className="text-[12px] font-medium" style={{ color: 'var(--th-text-muted)' }}>{g.pct}%</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: 'var(--th-highlight)' }}>
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${g.pct}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.8 }}
              className="h-full rounded-full" style={{ background: g.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Focus Timer (real — persists sessions) ─── */
function FocusTimer() {
  const DURATIONS = [5, 15, 25, 45, 60];
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [label, setLabel] = useState('Deep Work Session');
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const startFocus = useStartFocus();
  const completeFocus = useCompleteFocus();

  const totalSecs = selectedDuration * 60;
  const progress = (timeLeft / totalSecs) * 100;
  const r = 25, circumference = 2 * Math.PI * r;
  const offset = circumference - (progress / 100) * circumference;

  const formatTime = (secs) => `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;

  const handleStart = async () => {
    const session = await startFocus.mutateAsync({ duration: selectedDuration, label });
    setSessionId(session.id);
    startTimeRef.current = Date.now();
    setIsRunning(true);
  };

  const handleComplete = useCallback(async (actualSecs) => {
    setIsRunning(false);
    setCompleted(true);
    if (sessionId) {
      const actualMins = Math.ceil(actualSecs / 60);
      await completeFocus.mutateAsync({ id: sessionId, actualMins });
    }
    setSessionId(null);
  }, [sessionId, completeFocus]);

  const handleReset = () => {
    setIsRunning(false);
    setCompleted(false);
    setTimeLeft(selectedDuration * 60);
    setSessionId(null);
    clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
            handleComplete(elapsed);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, handleComplete]);

  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(selectedDuration * 60);
      setCompleted(false);
    }
  }, [selectedDuration, isRunning]);

  return (
    <div>
      {/* Duration selector */}
      {!isRunning && !completed && (
        <div className="flex gap-1 mb-3 flex-wrap">
          {DURATIONS.map((d) => (
            <button key={d} onClick={() => setSelectedDuration(d)}
              className="px-2 py-0.5 rounded-md text-[11px] font-medium transition-all"
              style={{
                background: selectedDuration === d ? 'var(--th-primary)' : 'var(--th-highlight)',
                color: selectedDuration === d ? '#08080d' : 'var(--th-text-muted)',
              }}>
              {d}m
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <svg width={64} height={64} className="-rotate-90">
            <circle cx={32} cy={32} r={r} fill="none" stroke="rgba(168,85,247,0.15)" strokeWidth={4} />
            <motion.circle cx={32} cy={32} r={r} fill="none" stroke={completed ? '#10b981' : '#a855f7'}
              strokeWidth={4} strokeLinecap="round"
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.5 }}
              style={{ strokeDasharray: circumference }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {completed
              ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              : <span className="text-[13px] font-bold" style={{ color: 'var(--th-text)' }}>{formatTime(timeLeft)}</span>
            }
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {completed ? (
            <div>
              <p className="text-[13px] font-semibold text-emerald-500">Session complete! 🎉</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--th-text-muted)' }}>XP awarded</p>
              <button onClick={handleReset} className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all hover:brightness-110"
                style={{ background: 'var(--th-highlight)', color: 'var(--th-text-muted)' }}>
                <RotateCcw className="w-3 h-3" /> New session
              </button>
            </div>
          ) : (
            <div>
              <p className="text-[13px] font-medium truncate" style={{ color: 'var(--th-text)' }}>{label}</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--th-text-muted)' }}>
                {isRunning ? 'Stay focused!' : 'Eliminate distractions.'}
              </p>
              <div className="flex gap-2 mt-2">
                {isRunning ? (
                  <button onClick={() => setIsRunning(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-white transition-all hover:brightness-110"
                    style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                    <Pause className="w-3 h-3 fill-current" /> Pause
                  </button>
                ) : (
                  <button onClick={handleStart} disabled={startFocus.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-white transition-all hover:brightness-110 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}>
                    <Play className="w-3 h-3 fill-current" /> Start Focus
                  </button>
                )}
                {isRunning && (
                  <button onClick={() => { const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000); handleComplete(elapsed); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all hover:brightness-110"
                    style={{ background: 'var(--th-highlight)', color: 'var(--th-text-muted)' }}>
                    Done
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Upcoming item ─── */
function UpcomingItem({ item }) {
  const icons = { goal: Target, habit: CheckCircle, event: Calendar };
  const Icon = icons[item?.type] || Calendar;
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(var(--th-primary-rgb), 0.1)' }}>
        <Icon className="w-4 h-4" style={{ color: 'var(--th-primary)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium truncate" style={{ color: 'var(--th-text)' }}>{item.title}</p>
        <p className="text-[11px]" style={{ color: 'var(--th-text-muted)' }}>{item.subtitle}</p>
      </div>
      <ArrowRight className="w-4 h-4 shrink-0" style={{ color: 'var(--th-text-dim)' }} />
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN DASHBOARD PAGE
   ════════════════════════════════════════ */
export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading } = useDashboardSummary();
  const firstName = user?.name?.split(' ')[0] || 'there';

  // Toggle habit from dashboard
  const handleToggleHabit = async (habitId, currentlyCompleted) => {
    const today = new Date().toISOString().split('T')[0];
    await api.post(`/habits/${habitId}/complete`, { date: today });
    qc.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
  };

  // Safely get data
  const todayProgress = data?.todayProgress ?? 0;
  const currentStreak = data?.currentStreak ?? 0;
  const bestStreak = data?.bestStreak ?? 0;
  const focusTimeFormatted = data?.focusTimeFormatted || '0m';
  const focusWeekDelta = data?.focusTimeWeekDelta ?? 0;
  const focusSparkline = data?.focusSparkline || [];
  const habitsCompleted = data?.habitsCompleted ?? 0;
  const habitsTotal = data?.habitsTotal ?? 0;
  const completionSparkline = data?.completionSparkline || [];
  const level = data?.level ?? 1;
  const totalXp = data?.totalXp ?? 0;
  const xpForNextLevel = data?.xpForNextLevel ?? 1000;
  const xpProgress = data?.xpProgress ?? 0;
  const weeklyProgress = data?.weeklyProgress || [];
  const habitConsistency = data?.habitConsistency || [];
  const todayHabits = data?.todayHabits || [];
  const smartSummary = data?.smartSummary;
  const goalsProgress = data?.goalsProgress || [];
  const upcoming = data?.upcoming || [];

  const progressLabel = todayProgress >= 80 ? '🔥 On fire!' : todayProgress >= 50 ? 'Great job!' : todayProgress > 0 ? 'Keep going!' : 'Start today!';

  return (
    <AnimatedPage>
      {/* ─── Header ─── */}
      <div className="flex items-start justify-between mb-8">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-[28px] font-bold" style={{ color: 'var(--th-text)' }}>
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--th-text-muted)' }}>
            {formatDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="hidden md:flex items-center gap-3">
          <button className="w-10 h-10 rounded-xl flex items-center justify-center transition-all" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', color: 'var(--th-text-muted)' }}>
            <Search className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center transition-all relative" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', color: 'var(--th-text-muted)' }}>
            <Bell className="w-4 h-4" />
            {upcoming.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />}
          </button>
        </motion.div>
      </div>

      {/* ─── Stat Cards Row ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-4">
        <StatCard title="Daily Progress" icon={TrendingUp} iconColor="var(--th-primary)" delay={0.1}>
          <div className="flex flex-col items-center">
            <div className="relative">
              <ProgressRing percent={todayProgress} size={100} stroke={7} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold" style={{ color: 'var(--th-text)' }}>{todayProgress}%</span>
              </div>
            </div>
            <span className="text-[12px] mt-1" style={{ color: 'var(--th-text-muted)' }}>{progressLabel}</span>
          </div>
        </StatCard>

        <StatCard title="Current Streak" icon={Flame} iconColor="#f97316" delay={0.15}>
          <p className="text-3xl font-bold" style={{ color: 'var(--th-text)' }}>{currentStreak}</p>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--th-text-muted)' }}>days</p>
          <p className="text-[12px] mt-3" style={{ color: 'var(--th-text-dim)' }}>Best: {bestStreak} days 🏆</p>
        </StatCard>

        <StatCard title="Focus Time" icon={Clock} iconColor="#06b6d4" delay={0.2}>
          <p className="text-2xl font-bold" style={{ color: 'var(--th-text)' }}>{focusTimeFormatted}</p>
          <p className={clsx('text-[12px] mt-0.5', focusWeekDelta >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {focusWeekDelta >= 0 ? '+' : ''}{focusWeekDelta}% vs last week
          </p>
          <MiniSparkline data={focusSparkline} color="#06b6d4" />
        </StatCard>

        <StatCard title="Tasks Done" icon={CheckCircle2} iconColor="#10b981" delay={0.25}>
          <p className="text-3xl font-bold" style={{ color: 'var(--th-text)' }}>
            {habitsCompleted} <span className="text-lg font-normal" style={{ color: 'var(--th-text-muted)' }}>/ {habitsTotal}</span>
          </p>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--th-text-muted)' }}>
            {habitsTotal ? Math.round((habitsCompleted / habitsTotal) * 100) : 0}% completed
          </p>
          <MiniSparkline data={completionSparkline} color="#10b981" />
        </StatCard>

        <StatCard title="Level" icon={Star} iconColor="var(--th-primary)" gold delay={0.3}>
          <p className="text-2xl font-bold" style={{ color: 'var(--th-text)' }}>Level {level}</p>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--th-primary)' }}>{totalXp} / {xpForNextLevel} XP</p>
          <div className="mt-3 h-2 rounded-full" style={{ background: 'var(--th-highlight)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }} transition={{ duration: 1.2, delay: 0.6 }}
              className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, var(--th-primary-dark), var(--th-primary))' }} />
          </div>
        </StatCard>
      </div>

      {/* ─── Smart Summary + Quick Actions ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="lg:col-span-3">
          <DCard>
            <div className="flex items-center gap-2.5 mb-3">
              <Sparkles className="w-5 h-5" style={{ color: 'var(--th-primary)' }} />
              <h3 className="text-[15px] font-semibold" style={{ color: 'var(--th-text)' }}>Smart Summary</h3>
            </div>
            <p className="text-[13px] mb-4" style={{ color: 'var(--th-text-secondary)' }}>
              {smartSummary?.message || (isLoading ? 'Loading...' : 'Add and complete habits to see insights!')}
            </p>
            {smartSummary && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  smartSummary.mostConsistent && { tag: 'Most Consistent', name: smartSummary.mostConsistent.name, sub: `${smartSummary.mostConsistent.streak} days this week`, color: '#10b981' },
                  smartSummary.topPerformer && { tag: 'Top Performer', name: smartSummary.topPerformer.name, sub: `${smartSummary.topPerformer.pct}% completed`, color: 'var(--th-primary)' },
                  smartSummary.needsAttention && { tag: 'Needs Attention', name: smartSummary.needsAttention.name, sub: `${smartSummary.needsAttention.daysThisWeek}/7 days this week`, color: '#f97316' },
                ].filter(Boolean).map((s) => (
                  <div key={s.name} className="rounded-xl p-3" style={{ background: `${s.color}08`, border: `1px solid ${s.color}15` }}>
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: s.color }}>{s.tag}</span>
                    <p className="text-[13px] font-medium mt-1" style={{ color: 'var(--th-text)' }}>{s.name}</p>
                    <p className="text-[11px]" style={{ color: 'var(--th-text-muted)' }}>{s.sub}</p>
                  </div>
                ))}
              </div>
            )}
          </DCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
          <DCard className="h-full">
            <h3 className="text-[15px] font-semibold mb-5" style={{ color: 'var(--th-text)' }}>Quick Actions</h3>
            <div className="grid grid-cols-4 gap-3">
              <ActionBtn icon={CheckCircle} label="Log Habit" color="#10b981" onClick={() => navigate('/habits')} />
              <ActionBtn icon={Target} label="Add Goal" color="var(--th-primary)" onClick={() => navigate('/goals')} />
              <ActionBtn icon={Dumbbell} label="Workout" color="#6366f1" onClick={() => navigate('/fitness')} />
              <ActionBtn icon={Wallet} label="Finance" color="#f97316" onClick={() => navigate('/finance')} />
            </div>
          </DCard>
        </motion.div>
      </div>

      {/* ─── Weekly Progress + Habit Consistency + Today's Habits ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <DCard className="h-full">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[15px] font-semibold" style={{ color: 'var(--th-text)' }}>Weekly Progress</h3>
              <span className="text-[12px]" style={{ color: 'var(--th-text-muted)' }}>Completion %</span>
            </div>
            <WeeklyBars data={weeklyProgress} />
          </DCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <DCard className="h-full">
            <h3 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--th-text)' }}>Habit Consistency</h3>
            <HabitHeatmap data={habitConsistency} />
          </DCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <DCard className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold" style={{ color: 'var(--th-text)' }}>Today's Habits</h3>
              <button onClick={() => navigate('/habits')} className="text-[12px] font-medium hover:brightness-110 transition-colors" style={{ color: 'var(--th-primary)' }}>View all</button>
            </div>
            <TodaysHabits habits={todayHabits.slice(0, 5)} onToggle={handleToggleHabit} />
          </DCard>
        </motion.div>
      </div>

      {/* ─── Bottom Row ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <DCard className="h-full">
            <h3 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--th-text)' }}>Upcoming</h3>
            {upcoming.length ? (
              <div className="divide-y" style={{ borderColor: 'var(--th-border)' }}>
                {upcoming.map((item, i) => <UpcomingItem key={i} item={item} />)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 gap-2">
                <Calendar className="w-8 h-8" style={{ color: 'var(--th-text-dim)' }} />
                <p className="text-[12px]" style={{ color: 'var(--th-text-dim)' }}>All caught up! 🎉</p>
              </div>
            )}
          </DCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
          <DCard className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold" style={{ color: 'var(--th-text)' }}>Goals Progress</h3>
              <button onClick={() => navigate('/goals')} className="text-[12px] font-medium hover:brightness-110 transition-colors" style={{ color: 'var(--th-primary)' }}>View all</button>
            </div>
            <GoalsProgress goals={goalsProgress} />
          </DCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <DCard className="h-full">
            <h3 className="text-[15px] font-semibold mb-3" style={{ color: 'var(--th-text)' }}>Focus Timer</h3>
            <FocusTimer />
          </DCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}>
          <DCard className="h-full">
            <div className="flex items-center gap-2 mb-3">
              <Quote className="w-4 h-4" style={{ color: 'var(--th-primary)' }} />
              <h3 className="text-[15px] font-semibold" style={{ color: 'var(--th-text)' }}>Motivation</h3>
            </div>
            <blockquote className="text-[14px] leading-relaxed italic" style={{ color: 'var(--th-text-secondary)' }}>
              "{dailyQuote.text.split(dailyQuote.highlight).map((part, i, arr) =>
                i < arr.length - 1
                  ? <span key={i}>{part}<span className="underline decoration-[var(--th-primary)]/40 underline-offset-2 not-italic font-medium" style={{ color: 'var(--th-primary)' }}>{dailyQuote.highlight}</span></span>
                  : <span key={i}>{part}</span>
              )}"
            </blockquote>
            <p className="text-[11px] mt-3" style={{ color: 'var(--th-text-dim)' }}>Daily quote — refreshes each day</p>
          </DCard>
        </motion.div>
      </div>
    </AnimatedPage>
  );
}
