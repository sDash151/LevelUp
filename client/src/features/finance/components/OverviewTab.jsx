import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
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
import InsightModal from '@/features/analytics/components/InsightModal';
import { getCFOInsight } from '../api';
import toast from 'react-hot-toast';
import {
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

function CardShell({ title, action, actionLabel, children, className = '', titleAction, headerRight }) {
  return (
    <div className={`rounded-[20px] p-5 shadow-sm transition-colors ${className}`} style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      {(title || action || titleAction || headerRight) && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            {title && <h3 className="text-[15px] font-bold" style={{ color: 'var(--th-text)' }}>{title}</h3>}
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
        {[1,2,3,4,5].map(i => <div key={i} className="h-[160px] rounded-[20px]" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-72 rounded-[20px] md:col-span-1" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }} />
            <div className="h-72 rounded-[20px] md:col-span-2" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }} />
          </div>
          <div className="h-48 rounded-[20px]" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }} />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <div className="h-full rounded-[20px]" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }} />
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, insightData: null });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (isLoading) return <OverviewSkeleton />;
  if (!data?.kpis) return (
    <div className="rounded-[20px] p-8 text-center transition-colors" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <p className="text-[14px]" style={{ color: 'var(--th-text-muted)' }}>No financial data available yet.</p>
    </div>
  );
  if (!data) return null;

  const { kpis, wealthAllocation, cashFlow, expenseLeaks, budgetHealth, upcomingObligations, emergencyFund, streaks, aiInsight, upgradeScore, lifeROI, monthlyReflection } = data;

  const formatInsightToMarkdown = (insight) => {
    if (!insight) return '';
    return `
# ${insight.title || 'AI CFO Analysis'}

${insight.summary || ''}

### Key Insights

${(insight.keyInsights || []).map(i => `* ${i}`).join('\n')}

### Action Items

${(insight.actionItems || []).map(i => `* ${i}`).join('\n')}
  `};

  const handleViewInsight = () => {
    if (!aiInsight) return;
    setModalState({
      isOpen: true,
      insightData: formatInsightToMarkdown(aiInsight)
    });
  };

  const handleGenerateCFOInsight = async () => {
    try {
      setIsGenerating(true);
      const res = await getCFOInsight();
      const insight = res.data?.content || res.data || res;
      
      setModalState({
        isOpen: true,
        insightData: formatInsightToMarkdown(insight)
      });
      queryClient.invalidateQueries({ queryKey: ['finance', 'overview'] });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate AI CFO insight.');
    } finally {
      setIsGenerating(false);
    }
  };

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
          className="relative overflow-hidden rounded-[20px] p-5 flex flex-col items-center justify-center min-h-[160px] shadow-sm transition-colors"
          style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}
        >
          <div className="absolute top-5 left-5 flex items-center gap-2.5">
             <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: 'var(--th-highlight)', color: 'var(--th-primary)' }}>
               <Target className="w-4 h-4" />
             </span>
             <span className="text-[13px] font-semibold" style={{ color: 'var(--th-text-dim)' }}>Freedom Score</span>
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
                    <span className="text-[16px] font-bold" style={{ color: 'var(--th-text)' }}>{formatCurrency(kpis.netWorth?.current || 0, currency, true)}</span>
                    <span className="text-[12px] font-medium mt-0.5" style={{ color: 'var(--th-text-muted)' }}>Total</span>
                  </div>
                </div>
                <div className="w-full grid grid-cols-2 gap-y-2 gap-x-4">
                  {wealthAllocation?.map((w, i) => (
                    <div key={w.type} className="flex flex-col text-[11px]">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: WEALTH_COLORS[i % WEALTH_COLORS.length] }} />
                        <span className="capitalize font-medium" style={{ color: 'var(--th-text-secondary)' }}>{w.type}</span>
                        <span style={{ color: 'var(--th-text-muted)' }}>{w.percentage}%</span>
                      </div>
                      <span className="font-semibold ml-3.5" style={{ color: 'var(--th-text)' }}>{formatCurrency(w.amount, currency, true)}</span>
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
                  <span className="text-[12px] font-semibold flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ color: 'var(--th-text)', background: 'var(--color-success-dim)' }}>
                    <span className="w-2 h-2 rounded-full bg-[#10B981]"></span> Income {formatCurrency(cashFlow?.income || 0, currency, true)}
                  </span>
                  <span className="text-[12px] font-semibold flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ color: 'var(--th-text)', background: 'var(--color-danger-dim)' }}>
                    <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span> Expenses {formatCurrency(cashFlow?.expenses || 0, currency, true)}
                  </span>
                  <span className="text-[12px] font-semibold flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ color: 'var(--th-text)', background: 'var(--color-info-dim)' }}>
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
                      contentStyle={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)', color: 'var(--th-text)', borderRadius: 12, fontSize: 12, boxShadow: 'var(--th-shadow)' }}
                      formatter={(v) => formatCurrency(v, currency)}
                    />
                    <Area type="monotone" dataKey="income" stroke="#10B981" fill="url(#incomeGrad)" strokeWidth={2.5} name="Income" />
                    <Area type="monotone" dataKey="expenses" stroke="#EF4444" fill="url(#expenseGrad)" strokeWidth={2.5} name="Expenses" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] font-medium mt-2" style={{ color: 'var(--th-text-muted)' }}>This Month</p>
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
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'var(--th-highlight)' }}>{CATEGORY_ICONS[leak.category] || '💸'}</span>
                    <div>
                      <p className="text-[13px] font-bold leading-tight" style={{ color: 'var(--th-text)' }}>{leak.category}</p>
                      <p className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--th-text-muted)' }}>{leak.percentage}% of total leaks</p>
                    </div>
                  </div>
                  <span className="text-[14px] font-bold" style={{ color: 'var(--th-text)' }}>{formatCurrency(leak.amount, currency)}</span>
                </div>
              )) : (
                <p className="text-xs text-center py-4" style={{ color: 'var(--th-text-muted)' }}>No leaks detected! 🎉</p>
              )}
            </div>
            {expenseLeaks?.length > 0 && (
              <div className="flex items-center justify-between mt-6 pt-5 border-t" style={{ borderColor: 'var(--th-border)' }}>
                <span className="text-[13px] font-medium" style={{ color: 'var(--th-text-secondary)' }}>Total Leaks</span>
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
                      <span className="text-[13px] font-bold" style={{ color: 'var(--th-text)' }}>{b.category?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium" style={{ color: 'var(--th-text-muted)' }}>
                        {formatCurrency(b.spent, currency, true)} / {formatCurrency(b.monthlyLimit, currency, true)}
                      </span>
                      <span className="text-[11px] font-bold" style={{ color: getRiskColor(b.riskPercent) }}>{b.riskPercent}%</span>
                    </div>
                  </div>
                  <div className="w-full h-[6px] rounded-full overflow-hidden" style={{ background: 'var(--th-highlight)' }}>
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
                <p className="text-xs text-center py-4" style={{ color: 'var(--th-text-muted)' }}>No budgets set yet</p>
              )}
            </div>
            {budgetHealth?.length > 0 && (
              <div className="mt-6 pt-5 border-t text-center" style={{ borderColor: 'var(--th-border)' }}>
                <button 
                  onClick={() => setShowBudgetsModal(true)}
                  className="text-[13px] font-semibold hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--th-text-secondary)' }}
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
                    contentStyle={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)', color: 'var(--th-text)', borderRadius: 12, fontSize: 12, boxShadow: 'var(--th-shadow)' }}
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
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--th-highlight)' }}>
                <span className="text-2xl">🔥</span>
              </div>
              <div>
                <div className="flex items-end gap-1">
                  <span className="text-[28px] font-bold leading-none" style={{ color: 'var(--th-text)' }}>{upgradeScore?.score || 0}</span>
                  <span className="text-[13px] font-medium mb-1" style={{ color: 'var(--th-text-muted)' }}>/ 1000</span>
                  <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white mb-1" style={{ background: '#F59E0B' }}>
                    Level {upgradeScore?.level || 1}
                  </span>
                </div>
              </div>
            </div>
            <div className="w-full h-2 rounded-full mt-4 overflow-hidden" style={{ background: 'var(--th-highlight)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: '#F59E0B' }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((upgradeScore?.score || 0) / 10, 100)}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <p className="text-[11px] font-medium mt-2" style={{ color: 'var(--th-text-muted)' }}>You're investing in yourself. Keep it up!</p>
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
                    <span className="text-[12px] font-bold" style={{ color }}>{label}</span>
                    <p className="text-[13px] font-bold mt-1" style={{ color: 'var(--th-text)' }}>
                      {formatCurrency(lifeROI[key]?.invested || 0, currency, true)} <span className="text-[10px] font-medium" style={{ color: 'var(--th-text-muted)' }}>spent</span>
                    </p>
                    <p className="text-[10px] font-medium mt-1" style={{ color: 'var(--th-text-muted)' }}>{sub}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-center py-4" style={{ color: 'var(--th-text-muted)' }}>Start tracking to see your Life ROI</p>
            )}
          </CardShell>

          <CardShell title="Monthly Reflection">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--th-highlight)', color: 'var(--th-text-secondary)' }}>
                <span className="text-sm">💭</span>
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-medium leading-tight mb-1" style={{ color: 'var(--th-text)' }}>
                  How was your financial journey this month?
                </p>
                <p className="text-[11px] font-medium mb-4" style={{ color: 'var(--th-text-muted)' }}>Reflect to improve next month.</p>
                <button 
                  onClick={() => navigate('/reflections')}
                  className="w-full py-2.5 rounded-lg text-[13px] font-bold transition-opacity hover:opacity-90"
                  style={{ background: 'var(--th-primary)', color: '#08080d' }}
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
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: 'var(--th-highlight)' }}>
                      {ob.source === 'bill' ? '📄' : ob.source === 'subscription' ? '🔁' : '💳'}
                    </span>
                    <span className="text-[13px] font-bold truncate" style={{ color: 'var(--th-text)' }}>{ob.title}</span>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-[13px] font-bold" style={{ color: 'var(--th-text)' }}>{formatCurrency(ob.amount, currency, true)}</span>
                    <span className="text-[11px] font-medium w-10 text-right" style={{ color: 'var(--th-text-muted)' }}>
                      {new Date(ob.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-center py-3" style={{ color: 'var(--th-text-muted)' }}>No upcoming obligations</p>
              )}
            </div>
          </CardShell>

          <CardShell title="Emergency Fund">
            <div className="flex items-center justify-between mb-5 mt-2">
              <div>
                <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--th-text-muted)' }}>Target Amount</p>
                <p className="text-[16px] font-bold" style={{ color: 'var(--th-text)' }}>{formatCurrency(emergencyFund?.target || 0, currency, true)}</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--th-text-muted)' }}>Current Amount</p>
                <p className="text-[16px] font-bold" style={{ color: 'var(--th-text)' }}>{formatCurrency(emergencyFund?.current || 0, currency, true)}</p>
              </div>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden mb-4" style={{ background: 'var(--th-highlight)' }}>
              <motion.div className="h-full rounded-full" style={{ background: '#F59E0B' }}
                initial={{ width: 0 }} animate={{ width: `${Math.min(emergencyFund?.progress || 0, 100)}%` }}
                transition={{ duration: 1 }} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[12px] font-bold text-amber-500">{emergencyFund?.progress || 0}%</span>
              <span className="text-[11px] font-medium" style={{ color: 'var(--th-text-muted)' }}>
                Recommended: {formatCurrency(emergencyFund?.target || 0, currency, true)}
              </span>
            </div>
            <button className="w-full mt-6 pt-5 text-[13px] font-semibold text-center border-t transition-opacity hover:opacity-80" style={{ color: 'var(--th-text-secondary)', borderColor: 'var(--th-border)' }}>
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
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: 'var(--th-highlight)' }}>{config?.icon || '🔥'}</span>
                      <span className="text-[13px] font-bold" style={{ color: 'var(--th-text)' }}>{config?.label || streak.type}</span>
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
        <CardShell title="AI CFO Insight">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-2">
            <div className="flex items-start md:items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-accent-dim)' }}>
                <Sparkles className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
              </div>
              <p className="text-[14px] leading-relaxed font-medium max-w-4xl" style={{ color: 'var(--th-text)' }}>
                {aiInsight?.summary || "Your AI CFO is ready to analyze your financial data and generate a personalized wealth strategy."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {aiInsight && (
                <button 
                  onClick={handleViewInsight}
                  className="px-4 py-2 text-sm font-bold rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                  style={{ background: 'var(--th-highlight)', color: 'var(--th-text)' }}
                >
                  View Full Report
                </button>
              )}
              <button 
                onClick={handleGenerateCFOInsight}
                disabled={isGenerating}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-500/30 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                {isGenerating ? "Analyzing..." : (aiInsight ? "Regenerate" : "Generate AI Insight")}
              </button>
            </div>
          </div>
        </CardShell>

      </div>

      <Modal isOpen={showObligationsModal} onClose={() => setShowObligationsModal(false)} title="Upcoming Obligations" size="md">
        <div className="space-y-4">
          {upcomingObligations?.map((ob) => (
            <div key={ob.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: 'var(--th-border)' }}>
              <div className="flex items-center gap-4 min-w-0">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'var(--th-highlight)' }}>
                  {ob.source === 'bill' ? '📄' : ob.source === 'subscription' ? '🔁' : '💳'}
                </span>
                <div>
                  <span className="text-[14px] font-bold block truncate" style={{ color: 'var(--th-text)' }}>{ob.title}</span>
                  <span className="text-[12px] font-medium capitalize" style={{ color: 'var(--th-text-muted)' }}>{ob.source}</span>
                </div>
              </div>
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-[14px] font-bold" style={{ color: 'var(--th-text)' }}>{formatCurrency(ob.amount, currency, true)}</span>
                <span className="text-[12px] font-medium" style={{ color: 'var(--th-text-muted)' }}>
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
              <div key={streak.type} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: 'var(--th-border)' }}>
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'var(--th-highlight)' }}>{config?.icon || '🔥'}</span>
                  <div>
                    <span className="text-[14px] font-bold block" style={{ color: 'var(--th-text)' }}>{config?.label || streak.type}</span>
                    <span className="text-[12px] font-medium" style={{ color: 'var(--th-text-muted)' }}>Best: {streak.bestStreak || 0} days</span>
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
            <div key={b.id} className="flex flex-col gap-1.5 py-2 border-b last:border-0" style={{ borderColor: 'var(--th-border)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 flex items-center justify-center text-xs">{CATEGORY_ICONS[b.category?.name] || '💡'}</span>
                  <span className="text-[13px] font-bold" style={{ color: 'var(--th-text)' }}>{b.category?.name || 'Budget'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium" style={{ color: 'var(--th-text-muted)' }}>{formatCurrency(b.spent, currency, true)} / {formatCurrency(b.monthlyLimit, currency, true)}</span>
                  <span className="text-[11px] font-bold w-8 text-right" style={{ color: getRiskColor(b.riskPercent) }}>{b.riskPercent}%</span>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--th-highlight)' }}>
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
            <div key={acc.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: 'var(--th-border)' }}>
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'var(--th-highlight)' }}>
                  {acc.type === 'cash' ? '💵' : acc.type === 'savings' ? '🏦' : acc.type === 'investment' ? '📈' : '💳'}
                </span>
                <div>
                  <span className="text-[14px] font-bold block" style={{ color: 'var(--th-text)' }}>{acc.name}</span>
                  <span className="text-[12px] font-medium capitalize" style={{ color: 'var(--th-text-muted)' }}>{acc.type}</span>
                </div>
              </div>
              <span className="text-[14px] font-bold" style={{ color: 'var(--th-text)' }}>{formatCurrency(acc.balance, currency)}</span>
            </div>
          ))}
        </div>
      </Modal>

      <InsightModal 
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, insightData: null })}
        insightData={modalState.insightData}
        title="AI CFO Analysis"
        type="roiReport"
      />
    </div>
  );
}
