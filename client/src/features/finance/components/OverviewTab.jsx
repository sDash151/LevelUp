import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Wallet, Clock, TrendingUp, Flame, ChevronRight, Sparkles, Target,
} from 'lucide-react';
import { useFinanceOverview } from '../hooks/useFinance';
import { useUser } from '@/features/auth/hooks/useAuth';
import KPICard from './KPICard';
import ScoreGauge from './ScoreGauge';
import {
  formatCurrency, formatPercent, getScoreColor, getRiskColor,
  abbreviateNumber, CATEGORY_ICONS, CATEGORY_COLORS, STREAK_CONFIG,
} from '../utils';
import { Modal } from '@/design-system/components/Modal';
import {
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

function CardShell({ title, action, actionLabel, children, className = '', titleAction, headerRight }) {
  return (
    <div className={`rounded-[20px] p-5 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] ${className}`} style={{ border: '1px solid #F3F4F6' }}>
      {(title || action || titleAction || headerRight) && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            {title && <h3 className="text-[15px] font-bold text-gray-900">{title}</h3>}
            {titleAction}
          </div>
          {headerRight && (
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              {headerRight}
            </div>
          )}
          {action && (
            <button onClick={action} className="text-[12px] font-semibold flex items-center gap-0.5 hover:underline text-[#F59E0B]">
              {actionLabel || 'View All'} <ChevronRight className="w-3.5 h-3.5" />
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
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {[1,2,3,4,5].map(i => <div key={i} className="h-[160px] rounded-[20px] bg-white border border-gray-100" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-72 rounded-[20px] bg-white border border-gray-100 md:col-span-1" />
            <div className="h-72 rounded-[20px] bg-white border border-gray-100 md:col-span-2" />
          </div>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <div className="h-48 rounded-[20px] bg-white border border-gray-100" />
        </div>
      </div>
    </div>
  );
}

const WEALTH_COLORS = ['#F59E0B', '#3B82F6', '#8B5CF6', '#10B981', '#EC4899', '#EF4444'];

export default function OverviewTab() {
  const { data, isLoading, error } = useFinanceOverview();
  const { data: user } = useUser();
  const currency = user?.baseCurrency || 'INR';
  const [showObligationsModal, setShowObligationsModal] = useState(false);
  const [showStreaksModal, setShowStreaksModal] = useState(false);
  const [showBudgetsModal, setShowBudgetsModal] = useState(false);
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const navigate = useNavigate();

  if (isLoading) return <OverviewSkeleton />;
  if (error) return (
    <div className="rounded-[20px] p-8 text-center bg-white border border-gray-100">
      <p className="text-sm text-gray-500">Failed to load financial overview. Please try again.</p>
    </div>
  );
  if (!data) return null;

  const { kpis, wealthAllocation, cashFlow, expenseLeaks, budgetHealth, upcomingObligations, emergencyFund, streaks, aiInsight, upgradeScore, lifeROI, monthlyReflection } = data;

  return (
    <div className="space-y-6">
      {/* ════════ ROW 1: KPI CARDS ════════ */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <KPICard icon={<Wallet className="w-4 h-4" />} label="Net Worth" value={kpis.netWorth?.current} change={kpis.netWorth?.change} color="#F59E0B" currency={currency} index={0} />
        <KPICard 
          icon={<Clock className="w-4 h-4" />} 
          label="Cash Reserve" 
          value={`${kpis.cashReserve?.months || 0}`} 
          subtext="Months of expenses covered" 
          statusLabel={kpis.cashReserve?.label}
          statusColor={kpis.cashReserve?.label === 'Healthy' ? '#10B981' : kpis.cashReserve?.label === 'Moderate' ? '#F59E0B' : '#EF4444'}
          color="#8B5CF6" 
          index={1} 
        />
        <KPICard icon={<TrendingUp className="w-4 h-4" />} label="Savings Velocity" value={kpis.savingsVelocity?.current} subtext="/mo" change={kpis.savingsVelocity?.velocity} color="#10B981" currency={currency} index={2} />
        <KPICard icon={<Flame className="w-4 h-4" />} label="Burn Rate" value={kpis.burnRate?.daily} subtext="/day" change={kpis.burnRate?.change} color="#EF4444" currency={currency} index={3} />

        {/* Freedom Score */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="relative overflow-hidden rounded-[20px] p-5 flex flex-col items-center justify-center min-h-[160px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100"
        >
          <div className="absolute top-5 left-5 flex items-center gap-2.5">
             <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-amber-50 text-amber-500">
               <Target className="w-4 h-4" />
             </span>
             <span className="text-[13px] font-semibold text-gray-500">Freedom Score</span>
          </div>
          <div className="mt-8">
            <ScoreGauge score={kpis.freedomScore?.score || 0} label={kpis.freedomScore?.label || "Good Progress"} size={80} strokeWidth={6} />
          </div>
        </motion.div>
      </div>

      {/* ════════ ROW 2: WEALTH ALLOCATION & CASH FLOW RIVER ════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <CardShell title="Wealth Allocation" action={() => setShowAccountsModal(true)} actionLabel="View All Accounts" className="lg:col-span-2">
              <div className="flex flex-col items-center gap-4 mt-2">
                <div className="w-56 h-56 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={wealthAllocation?.filter(w => w.amount > 0) || []}
                        dataKey="amount" nameKey="type"
                        cx="50%" cy="50%" innerRadius={75} outerRadius={105}
                        paddingAngle={2} strokeWidth={0}
                      >
                        {wealthAllocation?.filter(w => w.amount > 0).map((entry, i) => (
                          <Cell key={entry.type} fill={WEALTH_COLORS[i % WEALTH_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[16px] font-bold text-gray-900">{formatCurrency(kpis.netWorth?.current || 0, currency, true)}</span>
                    <span className="text-[12px] font-medium text-gray-400 mt-0.5">Total</span>
                  </div>
                </div>
                <div className="w-full grid grid-cols-2 gap-y-2 gap-x-4">
                  {wealthAllocation?.map((w, i) => (
                    <div key={w.type} className="flex flex-col text-[11px]">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: WEALTH_COLORS[i % WEALTH_COLORS.length] }} />
                        <span className="capitalize text-gray-600 font-medium">{w.type}</span>
                        <span className="text-gray-400">{w.percentage}%</span>
                      </div>
                      <span className="font-semibold text-gray-900 ml-3.5">{formatCurrency(w.amount, currency, true)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardShell>

            <CardShell 
              title="Cash Flow River" 
              className="lg:col-span-3"
              headerRight={
                <>
                  <span className="text-[12px] font-semibold text-gray-900 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]"></span> Income {formatCurrency(cashFlow?.income || 0, currency, true)}
                  </span>
                  <span className="text-[12px] font-semibold text-gray-900 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50">
                    <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span> Expenses {formatCurrency(cashFlow?.expenses || 0, currency, true)}
                  </span>
                  <span className="text-[12px] font-semibold text-gray-900 flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50">
                    <span className="w-2 h-2 rounded-full bg-[#3B82F6]"></span> Savings {formatCurrency(cashFlow?.savings || 0, currency, true)}
                  </span>
                </>
              }
            >
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashFlow?.weeklyBreakdown || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#F3F4F6" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(v) => v?.split('-').slice(1).join('/')} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => abbreviateNumber(v)} />
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid #F3F4F6', borderRadius: 12, fontSize: 12, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      formatter={(v) => formatCurrency(v, currency)}
                    />
                    <Area type="monotone" dataKey="income" stroke="#10B981" fill="url(#incomeGrad)" strokeWidth={2.5} name="Income" />
                    <Area type="monotone" dataKey="expenses" stroke="#EF4444" fill="url(#expenseGrad)" strokeWidth={2.5} name="Expenses" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] font-medium text-gray-400 mt-2">This Month</p>
            </CardShell>
      </div>

      {/* ════════ MASTER GRID: HORIZONTAL ROWS ════════ */}
      <div className="space-y-6">
        
        {/* ── Row 1: 3 Items ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardShell 
            title="Expense Leak Detection"
          >
            <div className="space-y-6 mt-2 h-[200px] overflow-y-auto pr-2">
              {expenseLeaks?.length > 0 ? expenseLeaks.map((leak, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl">{CATEGORY_ICONS[leak.category] || '💸'}</span>
                    <div>
                      <p className="text-[13px] font-bold text-gray-900 leading-tight">{leak.category}</p>
                      <p className="text-[11px] font-medium text-gray-400 mt-0.5">{leak.percentage}% of total leaks</p>
                    </div>
                  </div>
                  <span className="text-[14px] font-bold text-gray-900">{formatCurrency(leak.amount, currency)}</span>
                </div>
              )) : (
                <p className="text-xs text-center py-4 text-gray-500">No leaks detected! 🎉</p>
              )}
            </div>
            {expenseLeaks?.length > 0 && (
              <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
                <span className="text-[13px] font-medium text-gray-500">Total Leaks</span>
                <span className="text-[15px] font-bold text-red-500">
                  {formatCurrency(expenseLeaks.reduce((s, l) => s + l.amount, 0), currency)}
                </span>
              </div>
            )}
          </CardShell>

          <CardShell 
            title="Budget Health"
          >
            <div className="space-y-4">
              {budgetHealth?.slice(0, 4).map((b) => (
                <div key={b.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{CATEGORY_ICONS[b.category?.name] || '💡'}</span>
                      <span className="text-[13px] font-bold text-gray-900">{b.category?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-gray-500">
                        {formatCurrency(b.spent, currency, true)} / {formatCurrency(b.monthlyLimit, currency, true)}
                      </span>
                      <span className="text-[11px] font-bold" style={{ color: getRiskColor(b.riskPercent) }}>{b.riskPercent}%</span>
                    </div>
                  </div>
                  <div className="w-full h-[6px] rounded-full bg-gray-100 overflow-hidden">
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
                <p className="text-xs text-center py-4 text-gray-500">No budgets set yet</p>
              )}
            </div>
            {budgetHealth?.length > 0 && (
              <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                <button 
                  onClick={() => setShowBudgetsModal(true)}
                  className="text-[13px] font-semibold text-gray-500 hover:text-gray-900"
                >
                  View All Budgets
                </button>
              </div>
            )}</CardShell>

          <CardShell 
            title="Monthly Cash Flow"
          >
            <div className="h-[210px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlow?.weeklyBreakdown || []} barGap={4}>
                  <CartesianGrid stroke="#F3F4F6" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={v => `W${v?.split('-')[1]}`} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => abbreviateNumber(v)} width={30} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #F3F4F6', borderRadius: 12, fontSize: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    formatter={(v) => formatCurrency(v, currency)}
                  />
                  <Bar dataKey="income" fill="#10B981" radius={[2, 2, 0, 0]} barSize={8} name="Income" />
                  <Bar dataKey="expenses" fill="#EF4444" radius={[2, 2, 0, 0]} barSize={8} name="Expenses" />
                  <Bar dataKey="savings" fill="#3B82F6" radius={[2, 2, 0, 0]} barSize={8} name="Investments" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500"><span className="w-2 h-2 rounded-full bg-[#10B981]" /> Income</span>
              <span className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500"><span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Expenses</span>
              <span className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500"><span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> Investments</span>
            </div>
          </CardShell>
        </div>

        {/* ── Row 2: 3 Items ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardShell title="Upgrade Score">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
              <div>
                <div className="flex items-end gap-1">
                  <span className="text-[28px] font-bold leading-none text-gray-900">{upgradeScore?.score || 0}</span>
                  <span className="text-[13px] font-medium text-gray-400 mb-1">/ 1000</span>
                  <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white mb-1" style={{ background: '#F59E0B' }}>
                    Level {upgradeScore?.level || 1}
                  </span>
                </div>
              </div>
            </div>
            <div className="w-full h-2 rounded-full mt-4 bg-gray-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: '#F59E0B' }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((upgradeScore?.score || 0) / 10, 100)}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <p className="text-[11px] font-medium text-gray-400 mt-2">You're investing in yourself. Keep it up!</p>
          </CardShell>

          <CardShell 
            title="Life ROI"
          >
            {lifeROI ? (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'health', label: 'Health', color: '#10B981', sub: 'Lost 2.5 kg' },
                  { key: 'learning', label: 'Learning', color: '#10B981', sub: 'Completed 2 courses' },
                  { key: 'career', label: 'Career', color: '#10B981', sub: 'Built 1 project' },
                ].map(({ key, label, color, sub }) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-[12px] font-bold text-gray-900" style={{ color }}>{label}</span>
                    <p className="text-[13px] font-bold text-gray-900 mt-1">
                      {formatCurrency(lifeROI[key]?.invested || 0, currency, true)} <span className="text-[10px] font-medium text-gray-400 font-normal">spent</span>
                    </p>
                    <p className="text-[10px] font-medium text-gray-400 mt-1">{sub}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-center py-4 text-gray-500">Start tracking to see your Life ROI</p>
            )}
          </CardShell>

          <CardShell title="Monthly Reflection">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0">
                <span className="text-sm">💭</span>
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-medium text-gray-600 leading-tight mb-1">
                  How was your financial journey this month?
                </p>
                <p className="text-[11px] font-medium text-gray-400 mb-4">Reflect to improve next month.</p>
                <button 
                  onClick={() => navigate('/reflections')}
                  className="w-full py-2.5 rounded-lg text-[13px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors"
                >
                  Start Reflection
                </button>
              </div>
            </div>
          </CardShell>
        </div>

        {/* ── Row 3: 3 Items ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardShell 
            title="Upcoming Obligations" 
            action={upcomingObligations?.length > 4 ? () => setShowObligationsModal(true) : undefined}
          >
            <div className="space-y-4">
              {upcomingObligations?.length > 0 ? upcomingObligations.slice(0, 4).map((ob) => (
                <div key={ob.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-lg">
                      {ob.source === 'bill' ? '📄' : ob.source === 'subscription' ? '🔁' : '💳'}
                    </span>
                    <span className="text-[13px] font-bold text-gray-900 truncate">{ob.title}</span>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-[13px] font-bold text-gray-900">{formatCurrency(ob.amount, currency, true)}</span>
                    <span className="text-[11px] font-medium text-gray-400 w-10 text-right">
                      {new Date(ob.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-center py-3 text-gray-500">No upcoming obligations</p>
              )}
            </div>
          </CardShell>

          <CardShell title="Emergency Fund">
            <div className="flex items-center justify-between mb-5 mt-2">
              <div>
                <p className="text-[12px] font-medium text-gray-400 mb-1">Target Amount</p>
                <p className="text-[16px] font-bold text-gray-900">{formatCurrency(emergencyFund?.target || 0, currency, true)}</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] font-medium text-gray-400 mb-1">Current Amount</p>
                <p className="text-[16px] font-bold text-gray-900">{formatCurrency(emergencyFund?.current || 0, currency, true)}</p>
              </div>
            </div>
            <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden mb-4">
              <motion.div className="h-full rounded-full" style={{ background: '#F59E0B' }}
                initial={{ width: 0 }} animate={{ width: `${Math.min(emergencyFund?.progress || 0, 100)}%` }}
                transition={{ duration: 1 }} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[12px] font-bold text-amber-500">{emergencyFund?.progress || 0}%</span>
              <span className="text-[11px] font-medium text-gray-400">
                Recommended: {formatCurrency(emergencyFund?.target || 0, currency, true)}
              </span>
            </div>
            <button className="w-full mt-6 pt-5 text-[13px] font-semibold text-gray-500 hover:text-gray-900 text-center border-t border-gray-100">
              Edit Goal
            </button>
          </CardShell>

          <CardShell 
            title="Active Streaks" 
            action={streaks?.length > 4 ? () => setShowStreaksModal(true) : undefined}
          >
            <div className="space-y-4">
              {streaks?.slice(0, 4).map((streak) => {
                const config = STREAK_CONFIG[streak.type];
                return (
                  <div key={streak.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-lg">{config?.icon || '🔥'}</span>
                      <span className="text-[13px] font-bold text-gray-900">{config?.label || streak.type}</span>
                    </div>
                    <span className="text-[13px] font-bold" style={{ color: config?.color || '#F59E0B' }}>
                      {streak.current} days
                    </span>
                  </div>
                );
              })}
            </div>
          </CardShell>
        </div>

        {/* ── Row 4: AI Insight (Horizontal Full Width) ── */}
        <CardShell title="AI CFO Insight" className="bg-gradient-to-r from-purple-50 via-white to-purple-50/30 border-purple-100/50">
          {aiInsight ? (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-2">
              <div className="flex items-start md:items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-[14px] leading-relaxed text-gray-700 font-medium max-w-4xl">
                  Great job! Your savings rate improved by 5%. You can save <span className="font-bold text-purple-700">{formatCurrency(2300, currency, true)}</span> more this month by reducing food delivery expenses.
                </p>
              </div>
              <button className="whitespace-nowrap px-6 py-3 rounded-xl text-[13px] font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-sm shadow-purple-200">
                View All Insights
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 py-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-[13px] font-medium text-gray-500">AI insights will appear after you log some transactions.</p>
            </div>
          )}
        </CardShell>

      </div>

      <Modal isOpen={showObligationsModal} onClose={() => setShowObligationsModal(false)} title="Upcoming Obligations" size="md">
        <div className="space-y-4">
          {upcomingObligations?.map((ob) => (
            <div key={ob.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-4 min-w-0">
                <span className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl">
                  {ob.source === 'bill' ? '📄' : ob.source === 'subscription' ? '🔁' : '💳'}
                </span>
                <div>
                  <span className="text-[14px] font-bold text-gray-900 block truncate">{ob.title}</span>
                  <span className="text-[12px] font-medium text-gray-400 capitalize">{ob.source}</span>
                </div>
              </div>
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-[14px] font-bold text-gray-900">{formatCurrency(ob.amount, currency, true)}</span>
                <span className="text-[12px] font-medium text-gray-400">
                  {new Date(ob.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={showStreaksModal} onClose={() => setShowStreaksModal(false)} title="Active Streaks" size="md">
        <div className="space-y-4">
          {streaks?.map((streak) => {
            const config = STREAK_CONFIG[streak.type];
            return (
              <div key={streak.type} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl">{config?.icon || '🔥'}</span>
                  <div>
                    <span className="text-[14px] font-bold text-gray-900 block">{config?.label || streak.type}</span>
                    <span className="text-[12px] font-medium text-gray-400">Best: {streak.bestStreak || 0} days</span>
                  </div>
                </div>
                <span className="text-[14px] font-bold" style={{ color: config?.color || '#F59E0B' }}>
                  {streak.current} days
                </span>
              </div>
            );
          })}
        </div>
      </Modal>

      <Modal isOpen={showBudgetsModal} onClose={() => setShowBudgetsModal(false)} title="All Budgets" size="md">
        <div className="space-y-4">
          {budgetHealth?.map((b) => (
            <div key={b.id} className="flex flex-col gap-1.5 py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 flex items-center justify-center text-xs">{CATEGORY_ICONS[b.category?.name] || '💡'}</span>
                  <span className="text-[13px] font-bold text-gray-900">{b.category?.name || 'Budget'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-gray-400">{formatCurrency(b.spent, currency, true)} / {formatCurrency(b.monthlyLimit, currency, true)}</span>
                  <span className="text-[11px] font-bold w-8 text-right" style={{ color: getRiskColor(b.riskPercent) }}>{b.riskPercent}%</span>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <motion.div 
                  className="h-full rounded-full" 
                  style={{ background: getRiskColor(b.riskPercent) }}
                  initial={{ width: 0 }} 
                  animate={{ width: `${Math.min(b.riskPercent, 100)}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={showAccountsModal} onClose={() => setShowAccountsModal(false)} title="All Accounts" size="md">
        <div className="space-y-4">
          {data?.accounts?.map((acc) => (
            <div key={acc.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl">
                  {acc.type === 'cash' ? '💵' : acc.type === 'savings' ? '🏦' : acc.type === 'investment' ? '📈' : '💳'}
                </span>
                <div>
                  <span className="text-[14px] font-bold text-gray-900 block">{acc.name}</span>
                  <span className="text-[12px] font-medium text-gray-400 capitalize">{acc.type}</span>
                </div>
              </div>
              <span className="text-[14px] font-bold text-gray-900">{formatCurrency(acc.balance, currency)}</span>
            </div>
          ))}
        </div>
      </Modal>

    </div>
  );
}
