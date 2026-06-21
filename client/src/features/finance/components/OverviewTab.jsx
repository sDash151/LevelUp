import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Wallet, Clock, TrendingUp, Flame, ArrowRight, ChevronRight, Sparkles,
  PenLine, Shield, Zap, Target, BookOpen, Briefcase, Wrench,
} from 'lucide-react';
import { useFinanceOverview } from '../hooks/useFinance';
import { useUser } from '@/features/auth/hooks/useAuth';
import KPICard from './KPICard';
import ScoreGauge from './ScoreGauge';
import {
  formatCurrency, formatPercent, getScoreColor, getRiskColor,
  abbreviateNumber, CATEGORY_ICONS, CATEGORY_COLORS, STREAK_CONFIG,
} from '../utils';
import {
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

function CardShell({ title, action, actionLabel, children, className = '' }) {
  return (
    <div className={`rounded-2xl p-4 ${className}`} style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
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

function OverviewSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[1,2,3,4,5].map(i => <div key={i} className="h-[120px] rounded-2xl" style={{ background: 'var(--th-card)' }} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-64 rounded-2xl" style={{ background: 'var(--th-card)' }} />
            <div className="h-64 rounded-2xl" style={{ background: 'var(--th-card)' }} />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-48 rounded-2xl" style={{ background: 'var(--th-card)' }} />
          <div className="h-32 rounded-2xl" style={{ background: 'var(--th-card)' }} />
        </div>
      </div>
    </div>
  );
}

const WEALTH_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function OverviewTab() {
  const { data, isLoading, error } = useFinanceOverview();
  const { data: user } = useUser();
  const currency = user?.baseCurrency || 'INR';

  if (isLoading) return <OverviewSkeleton />;
  if (error) return (
    <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--th-card)' }}>
      <p className="text-sm" style={{ color: 'var(--th-text-secondary)' }}>Failed to load financial overview. Please try again.</p>
    </div>
  );
  if (!data) return null;

  const { kpis, wealthAllocation, cashFlow, expenseLeaks, budgetHealth, upcomingObligations, totalMonthlyObligations, emergencyFund, streaks, aiInsight, upgradeScore, lifeROI, monthlyReflection } = data;

  return (
    <div className="space-y-4">
      {/* ════════ ROW 1: KPI CARDS ════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard icon="💰" label="Net Worth" value={kpis.netWorth?.current} change={kpis.netWorth?.change} color="#6366F1" currency={currency} index={0} />
        <KPICard icon="🏦" label="Cash Reserve" value={`${kpis.cashReserve?.months || 0} Months`} subtext="of expenses covered" color="#3B82F6" index={1} />
        <KPICard icon="📈" label="Savings Velocity" value={kpis.savingsVelocity?.current} subtext="/mo" change={kpis.savingsVelocity?.velocity} color="#10B981" currency={currency} index={2} />
        <KPICard icon="🔥" label="Burn Rate" value={kpis.burnRate?.daily} subtext="/day" change={kpis.burnRate?.change} color="#F59E0B" currency={currency} index={3} />

        {/* Freedom Score — special card with gauge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="rounded-2xl p-4 flex flex-col items-center justify-center"
          style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}
        >
          <span className="text-xs font-medium mb-2" style={{ color: 'var(--th-text-secondary)' }}>🎯 Freedom Score</span>
          <ScoreGauge score={kpis.freedomScore?.score || 0} label={kpis.freedomScore?.label} size={80} strokeWidth={7} />
        </motion.div>
      </div>

      {/* ════════ ROW 2: MAIN CONTENT + SIDEBAR ════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Left: 2/3 width ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Wealth Allocation + Cash Flow River */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Wealth Allocation — Donut */}
            <CardShell title="Wealth Allocation" action={() => {}} actionLabel="View All Accounts">
              <div className="flex items-center gap-4">
                <div className="w-36 h-36 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={wealthAllocation?.filter(w => w.amount > 0) || []}
                        dataKey="amount" nameKey="type"
                        cx="50%" cy="50%" innerRadius={40} outerRadius={62}
                        paddingAngle={2} strokeWidth={0}
                      >
                        {wealthAllocation?.filter(w => w.amount > 0).map((entry, i) => (
                          <Cell key={entry.type} fill={WEALTH_COLORS[i % WEALTH_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs" style={{ color: 'var(--th-text-secondary)' }}>{formatCurrency(kpis.netWorth?.current || 0, currency, true)}</span>
                    <span className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>Total</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  {wealthAllocation?.map((w, i) => (
                    <div key={w.type} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: WEALTH_COLORS[i % WEALTH_COLORS.length] }} />
                        <span className="capitalize truncate" style={{ color: 'var(--th-text)' }}>{w.type}</span>
                        <span style={{ color: 'var(--th-text-secondary)' }}>{w.percentage}%</span>
                      </div>
                      <span className="font-medium flex-shrink-0" style={{ color: 'var(--th-text)' }}>{formatCurrency(w.amount, currency, true)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardShell>

            {/* Cash Flow River — Area Chart */}
            <CardShell title="Cash Flow River">
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashFlow?.weeklyBreakdown || []}>
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--th-border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--th-text-secondary)' }} tickFormatter={(v) => v?.split('-').slice(1).join('/')} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--th-text-secondary)' }} axisLine={false} tickLine={false} tickFormatter={(v) => abbreviateNumber(v)} width={40} />
                    <Tooltip
                      contentStyle={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', borderRadius: 12, fontSize: 12 }}
                      formatter={(v) => formatCurrency(v, currency)}
                    />
                    <Area type="monotone" dataKey="income" stroke="#10B981" fill="url(#incomeGrad)" strokeWidth={2} name="Income" />
                    <Area type="monotone" dataKey="expenses" stroke="#EF4444" fill="url(#expenseGrad)" strokeWidth={2} name="Expenses" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-2">
                <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--th-text-secondary)' }}>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Income <span className="font-semibold" style={{ color: 'var(--th-text)' }}>{formatCurrency(cashFlow?.income || 0, currency, true)}</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--th-text-secondary)' }}>
                  <span className="w-2 h-2 rounded-full bg-red-500" /> Expenses <span className="font-semibold" style={{ color: 'var(--th-text)' }}>{formatCurrency(cashFlow?.expenses || 0, currency, true)}</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--th-text-secondary)' }}>
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Savings <span className="font-semibold" style={{ color: 'var(--th-text)' }}>{formatCurrency(cashFlow?.savings || 0, currency, true)}</span>
                </span>
              </div>
            </CardShell>
          </div>

          {/* ── Bottom row: Leak Detection + Budget Health + Monthly Cash Flow ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Expense Leak Detection */}
            <CardShell title="Expense Leak Detection">
              <div className="space-y-3">
                {expenseLeaks?.length > 0 ? expenseLeaks.slice(0, 3).map((leak, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{CATEGORY_ICONS[leak.category] || '💸'}</span>
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--th-text)' }}>{leak.category}</p>
                        <p className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>{leak.percentage}% of total leaks</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: '#EF4444' }}>{formatCurrency(leak.amount, currency)}</span>
                  </div>
                )) : (
                  <p className="text-xs text-center py-4" style={{ color: 'var(--th-text-secondary)' }}>No leaks detected! 🎉</p>
                )}
              </div>
              {expenseLeaks?.length > 0 && (
                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--th-border)' }}>
                  <span className="text-xs font-medium" style={{ color: 'var(--th-text-secondary)' }}>Total Leaks</span>
                  <span className="text-sm font-bold" style={{ color: '#EF4444' }}>
                    {formatCurrency(expenseLeaks.reduce((s, l) => s + l.amount, 0), currency)}
                  </span>
                </div>
              )}
            </CardShell>

            {/* Budget Health */}
            <CardShell title="Budget Health">
              <div className="space-y-2.5">
                {budgetHealth?.slice(0, 4).map((b) => (
                  <div key={b.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium truncate" style={{ color: 'var(--th-text)' }}>{b.category?.name || 'Unknown'}</span>
                      <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--th-text-secondary)' }}>
                        {formatCurrency(b.spent, currency, true)} / {formatCurrency(b.monthlyLimit, currency, true)}
                      </span>
                      <span className="text-[10px] font-semibold flex-shrink-0 ml-2" style={{ color: getRiskColor(b.riskPercent) }}>{b.riskPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--th-bg)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: getRiskColor(b.riskPercent) }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(b.riskPercent, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
                {(!budgetHealth || budgetHealth.length === 0) && (
                  <p className="text-xs text-center py-4" style={{ color: 'var(--th-text-secondary)' }}>No budgets set yet</p>
                )}
              </div>
              {budgetHealth?.length > 0 && (
                <button className="w-full mt-3 pt-3 text-xs font-medium text-center hover:underline" style={{ color: 'var(--th-primary)', borderTop: '1px solid var(--th-border)' }}>
                  View All Budgets
                </button>
              )}
            </CardShell>

            {/* Monthly Cash Flow — Bar Chart */}
            <CardShell title="Monthly Cash Flow">
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashFlow?.weeklyBreakdown || []} barGap={2}>
                    <CartesianGrid stroke="var(--th-border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 9, fill: 'var(--th-text-secondary)' }} tickFormatter={v => v?.split('-').slice(1).join('/')} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: 'var(--th-text-secondary)' }} axisLine={false} tickLine={false} tickFormatter={v => abbreviateNumber(v)} width={35} />
                    <Tooltip
                      contentStyle={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', borderRadius: 12, fontSize: 11 }}
                      formatter={(v) => formatCurrency(v, currency)}
                    />
                    <Bar dataKey="income" fill="#10B981" radius={[3, 3, 0, 0]} barSize={12} name="Income" />
                    <Bar dataKey="expenses" fill="#EF4444" radius={[3, 3, 0, 0]} barSize={12} name="Expenses" />
                    <Bar dataKey="savings" fill="#3B82F6" radius={[3, 3, 0, 0]} barSize={12} name="Savings" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 mt-1">
                <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--th-text-secondary)' }}><span className="w-1.5 h-1.5 rounded-sm bg-emerald-500" /> Income</span>
                <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--th-text-secondary)' }}><span className="w-1.5 h-1.5 rounded-sm bg-red-500" /> Expenses</span>
                <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--th-text-secondary)' }}><span className="w-1.5 h-1.5 rounded-sm bg-blue-500" /> Investments</span>
              </div>
            </CardShell>
          </div>

          {/* ── Bottom-most: Upgrade Score + Life ROI ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upgrade Score */}
            <CardShell title="Upgrade Score">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <span className="text-2xl font-bold" style={{ color: 'var(--th-text)' }}>{upgradeScore?.score || 0}</span>
                    <span className="text-sm ml-1" style={{ color: 'var(--th-text-secondary)' }}>/ 1000</span>
                    <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white" style={{ background: '#F59E0B' }}>
                      Level {upgradeScore?.level || 1}
                    </span>
                  </div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 rounded-full mt-3 overflow-hidden" style={{ background: 'var(--th-bg)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #F59E0B, #EF4444)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((upgradeScore?.score || 0) / 10, 100)}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--th-text-secondary)' }}>You're investing in yourself! Keep it up!</p>
            </CardShell>

            {/* Life ROI */}
            <CardShell title="Life ROI">
              {lifeROI ? (
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { key: 'health', label: 'Health', icon: '💪', color: '#10B981' },
                    { key: 'learning', label: 'Learning', icon: '📚', color: '#8B5CF6' },
                    { key: 'career', label: 'Career', icon: '💼', color: '#3B82F6' },
                    { key: 'tools', label: 'Tools', icon: '🛠️', color: '#F59E0B' },
                  ].map(({ key, label, icon, color }) => (
                    <div key={key} className="text-center">
                      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
                      <p className="text-xs font-bold mt-1" style={{ color: 'var(--th-text)' }}>
                        {formatCurrency(lifeROI[key]?.invested || 0, currency, true)}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>spent</p>
                      {lifeROI[key]?.outcomes?.[0] && (
                        <p className="text-[10px] mt-1 truncate" style={{ color: 'var(--th-text-secondary)' }}>
                          {lifeROI[key].outcomes[0]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-center py-4" style={{ color: 'var(--th-text-secondary)' }}>Start tracking to see your Life ROI</p>
              )}
            </CardShell>
          </div>
        </div>

        {/* ── Right Sidebar: 1/3 width ── */}
        <div className="space-y-4">
          {/* Upcoming Obligations */}
          <CardShell title="Upcoming Obligations" action={() => {}} actionLabel="View All">
            <div className="space-y-3">
              {upcomingObligations?.length > 0 ? upcomingObligations.slice(0, 4).map((ob) => (
                <div key={ob.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm">
                      {ob.source === 'bill' ? '📄' : ob.source === 'subscription' ? '🔁' : '💳'}
                    </span>
                    <span className="text-xs font-medium truncate" style={{ color: 'var(--th-text)' }}>{ob.title}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs font-semibold" style={{ color: 'var(--th-text)' }}>{formatCurrency(ob.amount, currency)}</span>
                    <span className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>
                      {new Date(ob.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-center py-3" style={{ color: 'var(--th-text-secondary)' }}>No upcoming obligations</p>
              )}
            </div>
          </CardShell>

          {/* Emergency Fund */}
          <CardShell title="Emergency Fund" action={() => {}} actionLabel="Edit Goal">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>Target Amount</p>
                <p className="text-xs font-semibold" style={{ color: 'var(--th-text)' }}>{formatCurrency(emergencyFund?.target || 0, currency)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>Current Amount</p>
                <p className="text-xs font-semibold" style={{ color: 'var(--th-text)' }}>{formatCurrency(emergencyFund?.current || 0, currency)}</p>
              </div>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--th-bg)' }}>
              <motion.div className="h-full rounded-full" style={{ background: '#F59E0B' }}
                initial={{ width: 0 }} animate={{ width: `${Math.min(emergencyFund?.progress || 0, 100)}%` }}
                transition={{ duration: 1 }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] font-medium" style={{ color: '#F59E0B' }}>{emergencyFund?.progress || 0}%</span>
              <span className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>
                Recommended: {formatCurrency(emergencyFund?.target || 0, currency, true)} ({emergencyFund?.monthsCovered || 0} months)
              </span>
            </div>
          </CardShell>

          {/* Active Streaks */}
          <CardShell title="Active Streaks" action={() => {}} actionLabel="View All">
            <div className="space-y-2.5">
              {streaks?.map((streak) => {
                const config = STREAK_CONFIG[streak.type];
                return (
                  <div key={streak.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{config?.icon || '🔥'}</span>
                      <span className="text-xs font-medium" style={{ color: 'var(--th-text)' }}>{config?.label || streak.type}</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: config?.color || 'var(--th-primary)' }}>
                      {streak.current} days
                    </span>
                  </div>
                );
              })}
            </div>
          </CardShell>

          {/* AI Insight */}
          <CardShell title="AI Insight">
            {aiInsight ? (
              <div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--th-text-secondary)' }}>
                  {typeof aiInsight === 'string' ? aiInsight : aiInsight.summary || 'No insights available yet.'}
                </p>
                <button className="mt-2 text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: 'var(--th-primary)' }}>
                  View All Insights <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 py-2">
                <Sparkles className="w-4 h-4" style={{ color: '#F59E0B' }} />
                <p className="text-xs" style={{ color: 'var(--th-text-secondary)' }}>AI insights will appear after you log some transactions.</p>
              </div>
            )}
          </CardShell>

          {/* Monthly Reflection */}
          <CardShell title="Monthly Reflection">
            {monthlyReflection ? (
              <div>
                <p className="text-xs" style={{ color: 'var(--th-text-secondary)' }}>
                  {monthlyReflection.whatWentWell?.slice(0, 80) || 'Reflection completed'}...
                </p>
                <button className="mt-2 text-xs font-medium hover:underline" style={{ color: 'var(--th-primary)' }}>Edit Reflection</button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs mb-2" style={{ color: 'var(--th-text-secondary)' }}>How was your financial journey this month?</p>
                <p className="text-xs mb-3" style={{ color: 'var(--th-text-secondary)' }}>Reflect to improve next month.</p>
                <button className="px-4 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: '#F59E0B' }}>
                  Start Reflection
                </button>
              </div>
            )}
          </CardShell>
        </div>
      </div>
    </div>
  );
}
