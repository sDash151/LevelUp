import { motion } from 'motion/react';
import { ChevronRight, Plus, Target, Check, AlertTriangle } from 'lucide-react';
import { useBuildData, useContributeToGoal } from '../hooks/useFinance';
import { useUser } from '@/features/auth/hooks/useAuth';
import KPICard from './KPICard';
import ScoreGauge from './ScoreGauge';
import {
  formatCurrency, formatPercent, formatDateShort, abbreviateNumber,
  GOAL_TYPE_CONFIG, STREAK_CONFIG,
} from '../utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

function CardShell({ title, action, actionLabel, children }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-3">
          {title && <h3 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>{title}</h3>}
          {action && (
            <button onClick={action} className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: 'var(--th-primary)' }}>
              {actionLabel || 'View All'} <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

const BUCKET_COLORS = { Needs: '#3B82F6', Savings: '#10B981', Investments: '#F59E0B', Learning: '#8B5CF6', Fun: '#EC4899' };

export default function BuildTab() {
  const { data, isLoading } = useBuildData();
  const { data: user } = useUser();
  const currency = user?.baseCurrency || 'INR';
  const contribute = useContributeToGoal();

  if (isLoading) return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-5 gap-4">{[1,2,3,4,5].map(i => <div key={i} className="h-28 rounded-2xl" style={{ background: 'var(--th-card)' }} />)}</div>
      <div className="h-48 rounded-2xl" style={{ background: 'var(--th-card)' }} />
    </div>
  );
  if (!data) return null;

  const { kpis, goals, goalStats, savingsStreak, contributionCalendar, savingsTrend, opportunityFund, skillInvestments, wealthBuckets, streaks } = data;

  return (
    <div className="space-y-4">
      {/* ════════ KPI CARDS ════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard icon="📊" label="Total Assets" value={kpis.totalAssets?.current} change={kpis.totalAssets?.change} color="#10B981" currency={currency} index={0} />
        <KPICard icon="💹" label="Savings Rate" value={`${kpis.savingsRate?.current || 0}%`} change={kpis.savingsRate?.change} color="#22C55E" index={1} />
        <KPICard icon="📈" label="Investment Value" value={kpis.investmentValue?.current} color="#F59E0B" currency={currency} index={2} />
        <KPICard icon="🎯" label="Opportunity Fund" value={kpis.opportunityFund?.current} color="#3B82F6" currency={currency} index={3} />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-4 flex flex-col items-center justify-center" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <span className="text-xs font-medium mb-2" style={{ color: 'var(--th-text-secondary)' }}>Wealth Score</span>
          <ScoreGauge score={kpis.wealthScore?.score || 0} label={kpis.wealthScore?.label} size={80} strokeWidth={7} />
        </motion.div>
      </div>

      {/* ════════ MAIN + SIDEBAR ════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Financial Goals */}
          <CardShell title="Financial Goals" action={() => {}} actionLabel="View All Goals">
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
              {goals?.slice(0, 6).map((goal) => {
                const config = GOAL_TYPE_CONFIG[goal.goalType] || GOAL_TYPE_CONFIG.CUSTOM;
                const progress = parseFloat(goal.targetAmount) > 0 ? Math.round((parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100) : 0;
                return (
                  <div key={goal.id} className="flex-shrink-0 w-44 rounded-xl p-3" style={{ background: 'var(--th-bg)', border: '1px solid var(--th-border)' }}>
                    <span className="text-xl">{config.icon}</span>
                    <p className="text-xs font-semibold mt-1 truncate" style={{ color: 'var(--th-text)' }}>{goal.title}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--th-text-secondary)' }}>
                      {formatCurrency(parseFloat(goal.currentAmount), currency, true)} / {formatCurrency(parseFloat(goal.targetAmount), currency, true)}
                    </p>
                    <div className="w-full h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: 'var(--th-border)' }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.min(progress, 100)}%`, background: config.color }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] font-medium" style={{ color: config.color }}>{progress}%</span>
                      {goal.deadline && <span className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>{formatDateShort(goal.deadline)}</span>}
                    </div>
                  </div>
                );
              })}
              {(!goals || goals.length === 0) && (
                <div className="flex-1 text-center py-6">
                  <p className="text-xs" style={{ color: 'var(--th-text-secondary)' }}>No goals yet. Create one to start building!</p>
                </div>
              )}
            </div>
          </CardShell>

          {/* Middle row: Opportunity Fund + Skill Investments + Top Skill Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardShell title="Opportunity Fund">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎯</span>
                <div>
                  <span className="text-lg font-bold" style={{ color: 'var(--th-text)' }}>{formatCurrency(opportunityFund?.current || 0, currency)}</span>
                  <p className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>Available</p>
                </div>
              </div>
              <p className="text-xs mb-3" style={{ color: 'var(--th-text-secondary)' }}>Money set aside for future opportunities and high potential investments.</p>
              <button className="w-full py-2 rounded-lg text-xs font-semibold text-white" style={{ background: '#10B981' }}>Add Money</button>
            </CardShell>

            <CardShell title="Skill Investment Tracker" action={() => {}} actionLabel="View All">
              <div className="space-y-2">
                {skillInvestments?.breakdown && Object.entries(skillInvestments.breakdown).filter(([,v]) => v > 0).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="capitalize" style={{ color: 'var(--th-text)' }}>{key}</span>
                    <span className="font-semibold" style={{ color: 'var(--th-text)' }}>{formatCurrency(value, currency, true)}</span>
                  </div>
                ))}
                <div className="pt-2 mt-2 flex items-center justify-between" style={{ borderTop: '1px solid var(--th-border)' }}>
                  <span className="text-xs font-medium" style={{ color: 'var(--th-text-secondary)' }}>Total Invested</span>
                  <span className="text-xs font-bold" style={{ color: 'var(--th-text)' }}>{formatCurrency(skillInvestments?.totalInvested || 0, currency)}</span>
                </div>
              </div>
            </CardShell>

            <CardShell title="Top Skill Categories">
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={Object.entries(skillInvestments?.breakdown || {}).filter(([,v]) => v > 0).map(([name, value]) => ({ name, value }))}
                        dataKey="value" cx="50%" cy="50%" innerRadius={22} outerRadius={35} paddingAngle={2} strokeWidth={0}>
                        {Object.entries(skillInvestments?.breakdown || {}).filter(([,v]) => v > 0).map((_, i) => (
                          <Cell key={i} fill={['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'][i % 4]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[9px] font-bold" style={{ color: 'var(--th-text)' }}>{formatCurrency(skillInvestments?.totalInvested || 0, currency, true)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {Object.entries(skillInvestments?.breakdown || {}).filter(([,v]) => v > 0).map(([key], i) => (
                    <div key={key} className="flex items-center gap-1.5 text-[10px]">
                      <span className="w-2 h-2 rounded-full" style={{ background: ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'][i % 4] }} />
                      <span className="capitalize" style={{ color: 'var(--th-text)' }}>{key}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardShell>
          </div>

          {/* Bottom: Savings Trend + Goal Progress + Monthly Contributions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardShell title="Savings Trend">
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={savingsTrend || []}>
                    <CartesianGrid stroke="var(--th-border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'var(--th-text-secondary)' }} tickFormatter={v => v?.split('-')[1]} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: 'var(--th-text-secondary)' }} axisLine={false} tickLine={false} tickFormatter={v => abbreviateNumber(v)} width={35} />
                    <Tooltip contentStyle={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', borderRadius: 12, fontSize: 11 }} formatter={v => formatCurrency(v, currency)} />
                    <Bar dataKey="savings" fill="#10B981" radius={[4,4,0,0]} barSize={18} name="Saved" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardShell>

            <CardShell title="Goal Progress Overview">
              <div className="flex items-center gap-4">
                <ScoreGauge score={goalStats?.totalProgress || 0} label="Progress" size={72} strokeWidth={6} />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /><span style={{ color: 'var(--th-text)' }}>{goalStats?.onTrack || 0}</span>
                    <span style={{ color: '#10B981' }}>On Track</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /><span style={{ color: 'var(--th-text)' }}>{goalStats?.behind || 0}</span>
                    <span style={{ color: '#F59E0B' }}>Behind</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-red-500" /><span style={{ color: 'var(--th-text)' }}>{goalStats?.atRisk || 0}</span>
                    <span style={{ color: '#EF4444' }}>At Risk</span>
                  </div>
                </div>
              </div>
            </CardShell>

            <CardShell title="Monthly Contributions">
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={savingsTrend || []}>
                    <CartesianGrid stroke="var(--th-border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'var(--th-text-secondary)' }} tickFormatter={v => v?.split('-')[1]} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: 'var(--th-text-secondary)' }} axisLine={false} tickLine={false} tickFormatter={v => abbreviateNumber(v)} width={35} />
                    <Tooltip contentStyle={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', borderRadius: 12, fontSize: 11 }} formatter={v => formatCurrency(v, currency)} />
                    <Bar dataKey="income" fill="#10B981" radius={[4,4,0,0]} barSize={14} name="Contributions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardShell>
          </div>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="space-y-4">
          {/* Savings Streak */}
          <CardShell title="Savings Streak" action={() => {}}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">💰</span>
              <div>
                <span className="text-2xl font-bold" style={{ color: '#10B981' }}>{savingsStreak?.current || 0}</span>
                <span className="text-sm ml-1" style={{ color: 'var(--th-text-secondary)' }}>days</span>
              </div>
            </div>
            <p className="text-xs mb-2" style={{ color: 'var(--th-text-secondary)' }}>
              {savingsStreak?.current >= 7 ? 'Keep going! 🔥' : 'Start saving daily!'}
            </p>
          </CardShell>

          {/* Contribution Calendar */}
          <CardShell title="Contribution Calendar">
            <div className="grid grid-cols-7 gap-1">
              {['M','T','W','T','F','S','S'].map((d,i) => (
                <span key={i} className="text-[9px] text-center font-medium" style={{ color: 'var(--th-text-secondary)' }}>{d}</span>
              ))}
              {Array.from({ length: 30 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (29 - i));
                const dateStr = date.toISOString().split('T')[0];
                const contribution = contributionCalendar?.find(c => c.date === dateStr);
                const hasData = contribution && contribution.amount > 0;
                return (
                  <div key={i} className="w-full aspect-square rounded-full flex items-center justify-center text-[8px]"
                    style={{ background: hasData ? '#10B981' : 'var(--th-bg)', color: hasData ? '#fff' : 'var(--th-text-secondary)' }}
                    title={hasData ? `${formatCurrency(contribution.amount, currency)}` : 'No contribution'}>
                    {date.getDate()}
                  </div>
                );
              })}
            </div>
          </CardShell>

          {/* Wealth Buckets */}
          <CardShell title="Wealth Buckets">
            <div className="space-y-2.5">
              {wealthBuckets?.map((b) => (
                <div key={b.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: BUCKET_COLORS[b.name] || '#6366F1' }} />
                    <span className="text-xs font-medium truncate" style={{ color: 'var(--th-text)' }}>{b.name}</span>
                    <div className="flex-1 h-1.5 rounded-full mx-2 overflow-hidden" style={{ background: 'var(--th-bg)' }}>
                      <div className="h-full rounded-full" style={{ width: `${b.percentage}%`, background: BUCKET_COLORS[b.name] || '#6366F1' }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-semibold" style={{ color: 'var(--th-text)' }}>{formatCurrency(b.amount, currency, true)}</span>
                    <span className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>{b.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardShell>

          {/* Quick Actions */}
          <CardShell title="Quick Actions">
            <div className="space-y-2">
              {[
                { label: 'Create New Goal', icon: '🎯' },
                { label: 'Add to Opportunity Fund', icon: '💰' },
                { label: 'Invest in Skills', icon: '📚' },
                { label: 'View All Investments', icon: '📈' },
              ].map(a => (
                <button key={a.label} className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.01]"
                  style={{ background: 'var(--th-bg)', color: 'var(--th-text)' }}>
                  <div className="flex items-center gap-2">
                    <span>{a.icon}</span>
                    <span>{a.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--th-text-secondary)' }} />
                </button>
              ))}
            </div>
          </CardShell>
        </div>
      </div>
    </div>
  );
}
