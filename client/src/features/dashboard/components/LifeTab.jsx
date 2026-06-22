import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Target, PenTool, ArrowRight } from 'lucide-react';
import { DCard, WeeklyBars } from './DashboardShared';
import clsx from 'clsx';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/utils/api-client';

/* ─── Habit Consistency Heatmap ─── */
function HabitHeatmap({ data, className }) {
  if (!data?.length) {
    return <div className="text-[13px] text-center py-4" style={{ color: 'var(--th-text-dim)' }}>Add habits to see consistency</div>;
  }
  
  // Dynamically generate the last 7 days labels ending today
  const dayLabels = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-US', { weekday: 'narrow' });
  });
  
  return (
    <div className={clsx("flex flex-col space-y-2", className)}>
      <div className="flex items-center gap-2 pl-24 pr-1 shrink-0">
        {dayLabels.map((d, i) => <span key={i} className="flex-1 text-center text-[11px] font-medium" style={{ color: 'var(--th-text-dim)' }}>{d}</span>)}
      </div>
      
      <div className="overflow-y-auto pr-1 space-y-2 flex-1 min-h-[120px] hide-scrollbar">
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
      </div>
      <div className="flex items-center justify-end gap-1.5 pt-1 shrink-0">
        <span className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>Miss</span>
        <div className="w-3 h-3 rounded-[3px]" style={{ background: 'var(--th-highlight)' }} />
        <div className="w-3 h-3 rounded-[3px]" style={{ background: '#10b981' }} />
        <span className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>Done</span>
      </div>
    </div>
  );
}

/* ─── Today's Habits List ─── */
function TodaysHabits({ habits, onToggle, className }) {
  if (!habits?.length) {
    return (
      <div className={clsx("text-center py-4", className)}>
        <p className="text-[13px]" style={{ color: 'var(--th-text-dim)' }}>No habits yet</p>
        <p className="text-[12px] mt-1" style={{ color: 'var(--th-text-dim)' }}>Add habits to track your progress</p>
      </div>
    );
  }
  return (
    <div className={clsx("space-y-3 overflow-y-auto pr-1 hide-scrollbar", className)}>
      {habits.map((h) => (
        <div key={h.id} className="flex items-center gap-3 group">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: h.completed ? '#10b98115' : 'var(--th-highlight)' }}>
            <span className="text-sm">{h.icon === 'check-circle' ? '✓' : '•'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium truncate" style={{ color: h.completed ? 'var(--th-text)' : 'var(--th-text-muted)' }}>{h.name}</p>
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

/* ─── Goals Progress ─── */
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

export default function LifeTab({ data, isLoading }) {
  const navigate = useNavigate();
  const qc = useQueryClient();

  if (isLoading || !data) return null;

  const weeklyProgress = data.weeklyProgress || [];
  const habitConsistency = data.habitConsistency || [];
  const todayHabits = data.todayHabits || [];
  const goalsProgress = data.goalsProgress || [];

  const handleToggleHabit = async (habitId) => {
    const today = new Date().toISOString().split('T')[0];
    await api.post(`/habits/${habitId}/complete`, { date: today });
    qc.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Weekly Progress */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="h-[340px]">
          <DCard className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[15px] font-semibold" style={{ color: 'var(--th-text)' }}>Weekly Progress</h3>
              <span className="text-[12px]" style={{ color: 'var(--th-text-muted)' }}>Completion %</span>
            </div>
            <WeeklyBars data={weeklyProgress} className="flex-1" />
          </DCard>
        </motion.div>

        {/* Habit Consistency Heatmap */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="h-[340px]">
          <DCard className="h-full flex flex-col">
            <h3 className="text-[15px] font-semibold mb-4 shrink-0" style={{ color: 'var(--th-text)' }}>Habit Consistency</h3>
            <HabitHeatmap data={habitConsistency} className="flex-1 min-h-0" />
          </DCard>
        </motion.div>

        {/* Today's Habits */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="h-[340px]">
          <DCard className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-[15px] font-semibold" style={{ color: 'var(--th-text)' }}>Today's Habits</h3>
              <button onClick={() => navigate('/habits')} className="text-[12px] font-medium hover:brightness-110 transition-colors" style={{ color: 'var(--th-primary)' }}>View all</button>
            </div>
            <TodaysHabits habits={todayHabits} onToggle={handleToggleHabit} className="flex-1 min-h-[120px]" />
          </DCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Goals Progress */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <DCard className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold" style={{ color: 'var(--th-text)' }}>Goals Progress</h3>
              <button onClick={() => navigate('/goals')} className="text-[12px] font-medium hover:brightness-110 transition-colors" style={{ color: 'var(--th-primary)' }}>View all</button>
            </div>
            <GoalsProgress goals={goalsProgress} />
          </DCard>
        </motion.div>

        {/* Reflections Shortcut */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <DCard className="h-full flex flex-col justify-center items-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(var(--th-primary-rgb), 0.1)' }}>
              <PenTool className="w-8 h-8" style={{ color: 'var(--th-primary)' }} />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--th-text)' }}>Daily Reflection</h3>
            <p className="text-[13px] mb-5 max-w-[280px]" style={{ color: 'var(--th-text-secondary)' }}>
              Take 2 minutes to clear your mind, express gratitude, and document your journey.
            </p>
            <button onClick={() => navigate('/reflections')} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:scale-105"
              style={{ background: 'var(--th-primary)', color: '#08080d' }}>
              Write Entry <ArrowRight className="w-4 h-4" />
            </button>
          </DCard>
        </motion.div>
      </div>
    </div>
  );
}
