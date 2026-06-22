import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Flame, CheckCircle2, Star, Sparkles, Target, Dumbbell, Wallet, CheckCircle, Calendar } from 'lucide-react';
import { DCard, ProgressRing, MiniSparkline, StatCard, ActionBtn, UpcomingItem } from './DashboardShared';
import clsx from 'clsx';

export default function OverviewTab({ data, isLoading }) {
  const navigate = useNavigate();

  if (isLoading || !data) return null;

  const todayProgress = data.todayProgress ?? 0;
  const currentStreak = data.currentStreak ?? 0;
  const bestStreak = data.bestStreak ?? 0;
  const habitsCompleted = data.habitsCompleted ?? 0;
  const habitsTotal = data.habitsTotal ?? 0;
  const completionSparkline = data.completionSparkline || [];
  const level = data.level ?? 1;
  const totalXp = data.totalXp ?? 0;
  const xpForNextLevel = data.xpForNextLevel ?? 1000;
  const xpProgress = data.xpProgress ?? 0;
  const smartSummary = data.smartSummary;
  const upcoming = data.upcoming || [];

  const progressLabel = todayProgress >= 80 ? '🔥 On fire!' : todayProgress >= 50 ? 'Great job!' : todayProgress > 0 ? 'Keep going!' : 'Start today!';

  return (
    <div className="space-y-4">
      {/* ─── Stat Cards Row ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
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

        <StatCard title="Tasks Done" icon={CheckCircle2} iconColor="#10b981" delay={0.2}>
          <p className="text-3xl font-bold" style={{ color: 'var(--th-text)' }}>
            {habitsCompleted} <span className="text-lg font-normal" style={{ color: 'var(--th-text-muted)' }}>/ {habitsTotal}</span>
          </p>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--th-text-muted)' }}>
            {habitsTotal ? Math.round((habitsCompleted / habitsTotal) * 100) : 0}% completed
          </p>
          <MiniSparkline data={completionSparkline} color="#10b981" />
        </StatCard>

        <StatCard title="Level" icon={Star} iconColor="var(--th-primary)" gold delay={0.25}>
          <p className="text-2xl font-bold" style={{ color: 'var(--th-text)' }}>Level {level}</p>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--th-primary)' }}>{totalXp} / {xpForNextLevel} XP</p>
          <div className="mt-3 h-2 rounded-full" style={{ background: 'var(--th-highlight)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }} transition={{ duration: 1.2, delay: 0.6 }}
              className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, var(--th-primary-dark), var(--th-primary))' }} />
          </div>
        </StatCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
        {/* ─── Smart Summary ─── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-3">
          <DCard className="h-full">
            <div className="flex items-center gap-2.5 mb-3">
              <Sparkles className="w-5 h-5" style={{ color: 'var(--th-primary)' }} />
              <h3 className="text-[15px] font-semibold" style={{ color: 'var(--th-text)' }}>AI Coach Summary</h3>
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
                  <div key={s.tag} className="rounded-xl p-3" style={{ background: `${s.color}08`, border: `1px solid ${s.color}15` }}>
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: s.color }}>{s.tag}</span>
                    <p className="text-[13px] font-medium mt-1" style={{ color: 'var(--th-text)' }}>{s.name}</p>
                    <p className="text-[11px]" style={{ color: 'var(--th-text-muted)' }}>{s.sub}</p>
                  </div>
                ))}
              </div>
            )}
          </DCard>
        </motion.div>

        {/* ─── Quick Actions ─── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="lg:col-span-2">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ─── Upcoming ─── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <DCard className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold" style={{ color: 'var(--th-text)' }}>Upcoming Agenda</h3>
              <button onClick={() => navigate('/goals')} className="text-[12px] font-medium hover:brightness-110 transition-colors" style={{ color: 'var(--th-primary)' }}>View Calendar</button>
            </div>
            {upcoming.length ? (
              <div className="divide-y" style={{ borderColor: 'var(--th-border)' }}>
                {upcoming.map((item, i) => <UpcomingItem key={i} item={item} />)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <Calendar className="w-8 h-8" style={{ color: 'var(--th-text-dim)' }} />
                <p className="text-[12px]" style={{ color: 'var(--th-text-dim)' }}>All caught up! 🎉</p>
              </div>
            )}
          </DCard>
        </motion.div>
      </div>
    </div>
  );
}
