import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Search, Filter, Send, Sparkles, ChevronRight, ChevronDown,
  ArrowUpRight, ArrowDownLeft, ArrowLeftRight, MoreHorizontal,
} from 'lucide-react';
import { useSpendData, useTransactions, useCreateTransaction, useAILogTransaction } from '../hooks/useFinance';
import { useUser } from '@/features/auth/hooks/useAuth';
import KPICard from './KPICard';
import ScoreGauge from './ScoreGauge';
import {
  formatCurrency, formatDate, formatDateShort, getChangeColor, getRiskColor,
  abbreviateNumber, CATEGORY_ICONS, CATEGORY_COLORS, MOOD_LABELS,
  NECESSITY_LABELS, STREAK_CONFIG,
} from '../utils';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart,
  PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';

function CardShell({ title, subtitle, action, actionLabel, children, className = '' }) {
  return (
    <div className={`rounded-2xl p-4 ${className}`} style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-3">
          <div>
            {title && <h3 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>{title}</h3>}
            {subtitle && <p className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>{subtitle}</p>}
          </div>
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

function SpendSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[1,2,3,4,5,6,7].map(i => <div key={i} className="h-24 rounded-2xl" style={{ background: 'var(--th-card)' }} />)}
      </div>
      <div className="h-96 rounded-2xl" style={{ background: 'var(--th-card)' }} />
    </div>
  );
}

const TYPE_ICONS = {
  INCOME: { icon: ArrowDownLeft, color: '#10B981', bg: '#10B98120' },
  EXPENSE: { icon: ArrowUpRight, color: '#EF4444', bg: '#EF444420' },
  TRANSFER: { icon: ArrowLeftRight, color: '#3B82F6', bg: '#3B82F620' },
};

const BREAKDOWN_COLORS = ['#F59E0B', '#EC4899', '#3B82F6', '#10B981', '#8B5CF6', '#F97316', '#6366F1', '#14B8A6'];

export default function SpendTab() {
  const { data, isLoading } = useSpendData();
  const { data: user } = useUser();
  const currency = user?.baseCurrency || 'INR';

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [aiText, setAiText] = useState('');

  const { data: txnData, isLoading: txnLoading } = useTransactions({ search, type: typeFilter || undefined, sort, page, limit: 10 });
  const aiLog = useAILogTransaction();
  const createTxn = useCreateTransaction();

  if (isLoading) return <SpendSkeleton />;
  if (!data) return null;

  const { kpis, budgetEngine, spendingBreakdown, topCategories, moodTracking, spendingTrend, streaks } = data;
  const transactions = txnData?.data || [];
  const totalPages = txnData?.totalPages || 1;

  const handleAILog = async () => {
    if (!aiText.trim()) return;
    const result = await aiLog.mutateAsync(aiText);
    if (result?.data) setAiText('');
  };

  return (
    <div className="space-y-4">
      {/* ════════ KPI CARDS ════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <KPICard icon="💸" label="Total Spend" value={kpis.totalSpend?.current} change={kpis.totalSpend?.change} color="#EF4444" currency={currency} index={0} />
        <KPICard icon="💰" label="Total Income" value={kpis.totalIncome?.current} change={kpis.totalIncome?.change} color="#10B981" currency={currency} index={1} />
        <KPICard icon="📊" label="Net Cash Flow" value={kpis.netCashFlow?.current} change={kpis.netCashFlow?.change} color="#3B82F6" currency={currency} index={2} />
        <KPICard icon="📉" label="Avg. Daily Spend" value={kpis.avgDailySpend?.current} subtext="/day" color="#F59E0B" currency={currency} index={3} />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-3 flex flex-col items-center justify-center" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <span className="text-[10px] font-medium mb-1" style={{ color: 'var(--th-text-secondary)' }}>Budget Health</span>
          <ScoreGauge score={kpis.budgetHealth?.score || 0} label={kpis.budgetHealth?.label} size={60} strokeWidth={5} />
        </motion.div>
        <KPICard icon="⚠️" label="Budget Over Limit" value={`${kpis.budgetsOverLimit?.count || 0}`} subtext="Categories" color="#EF4444" index={5} />
        <KPICard icon="📝" label="Transactions" value={`${kpis.transactionCount?.current || 0}`} change={kpis.transactionCount?.change} color="#8B5CF6" index={6} />
      </div>

      {/* ════════ MAIN CONTENT + SIDEBAR ════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Left 2/3: Transactions ── */}
        <div className="lg:col-span-2 space-y-4">
          <CardShell title="Recent Transactions">
            {/* Search + Filter + Type tabs */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex gap-1">
                {['', 'EXPENSE', 'INCOME', 'TRANSFER'].map(t => (
                  <button key={t} onClick={() => { setTypeFilter(t); setPage(1); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: typeFilter === t ? (t === 'EXPENSE' ? '#EF4444' : t === 'INCOME' ? '#10B981' : t === 'TRANSFER' ? '#3B82F6' : 'var(--th-primary)') : 'transparent',
                      color: typeFilter === t ? '#fff' : 'var(--th-text-secondary)',
                    }}>
                    {t || 'All'}
                  </button>
                ))}
              </div>
              <div className="flex-1 min-w-[200px] relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--th-text-secondary)' }} />
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search transactions, merchants..."
                  className="w-full pl-8 pr-3 py-2 rounded-lg text-xs outline-none"
                  style={{ background: 'var(--th-bg)', color: 'var(--th-text)', border: '1px solid var(--th-border)' }} />
              </div>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="px-3 py-2 rounded-lg text-xs outline-none appearance-none cursor-pointer"
                style={{ background: 'var(--th-bg)', color: 'var(--th-text)', border: '1px solid var(--th-border)' }}>
                <option value="latest">Sort: Latest</option>
                <option value="oldest">Oldest</option>
                <option value="highest">Highest</option>
                <option value="lowest">Lowest</option>
              </select>
            </div>

            {/* Transactions table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ color: 'var(--th-text-secondary)' }}>
                    <th className="text-left py-2 font-medium">Date</th>
                    <th className="text-left py-2 font-medium">Merchant</th>
                    <th className="text-left py-2 font-medium">Category</th>
                    <th className="text-left py-2 font-medium">Type</th>
                    <th className="text-right py-2 font-medium">Amount</th>
                    <th className="text-left py-2 font-medium">Payment</th>
                    <th className="text-left py-2 font-medium">Mood</th>
                    <th className="text-left py-2 font-medium">Tags</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length > 0 ? transactions.map((txn) => {
                    const typeConfig = TYPE_ICONS[txn.type] || TYPE_ICONS.EXPENSE;
                    const TypeIcon = typeConfig.icon;
                    return (
                      <tr key={txn.id} className="hover:bg-black/3 dark:hover:bg-white/3 transition-colors" style={{ borderTop: '1px solid var(--th-border)' }}>
                        <td className="py-2.5" style={{ color: 'var(--th-text-secondary)' }}>{formatDateShort(txn.date)}</td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px]" style={{ background: typeConfig.bg }}>
                              {CATEGORY_ICONS[txn.category] || '💸'}
                            </span>
                            <span className="font-medium" style={{ color: 'var(--th-text)' }}>{txn.merchant || txn.description || '-'}</span>
                          </div>
                        </td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium" style={{ background: `${CATEGORY_COLORS[txn.category] || '#6366F1'}15`, color: CATEGORY_COLORS[txn.category] || '#6366F1' }}>
                            {txn.category}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium" style={{ background: typeConfig.bg, color: typeConfig.color }}>
                            {txn.type === 'INCOME' ? 'Income' : txn.type === 'TRANSFER' ? 'Transfer' : 'Expense'}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-semibold" style={{ color: txn.type === 'INCOME' ? '#10B981' : '#EF4444' }}>
                          {txn.type === 'INCOME' ? '+' : '-'}{formatCurrency(txn.amount, currency)}
                        </td>
                        <td className="py-2.5" style={{ color: 'var(--th-text-secondary)' }}>{txn.paymentMethod || '-'}</td>
                        <td className="py-2.5">{txn.mood ? MOOD_LABELS[txn.mood]?.emoji : '-'}</td>
                        <td className="py-2.5">
                          <div className="flex gap-1">
                            {txn.tags?.slice(0, 2).map(tag => (
                              <span key={tag} className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: 'var(--th-bg)', color: 'var(--th-text-secondary)' }}>{tag}</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan={8} className="py-8 text-center" style={{ color: 'var(--th-text-secondary)' }}>No transactions found. Start logging!</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--th-border)' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-xs disabled:opacity-40" style={{ background: 'var(--th-bg)', color: 'var(--th-text)' }}>Previous</button>
                <span className="px-3 py-1.5 text-xs" style={{ color: 'var(--th-text-secondary)' }}>Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs disabled:opacity-40" style={{ background: 'var(--th-bg)', color: 'var(--th-text)' }}>Next</button>
              </div>
            )}
          </CardShell>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="space-y-4">
          {/* AI Smart Logging */}
          <CardShell title="AI Smart Logging" subtitle="Beta">
            <div className="relative">
              <input value={aiText} onChange={e => setAiText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAILog()}
                placeholder="I paid ₹280 for protein shake"
                className="w-full px-3 py-2.5 pr-10 rounded-lg text-xs outline-none"
                style={{ background: 'var(--th-bg)', color: 'var(--th-text)', border: '1px solid var(--th-border)' }} />
              <button onClick={handleAILog} disabled={aiLog.isPending || !aiText.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md disabled:opacity-40"
                style={{ background: 'var(--th-primary)', color: '#fff' }}>
                <Send className="w-3 h-3" />
              </button>
            </div>
            {aiLog.data?.data && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 p-3 rounded-lg text-xs space-y-1" style={{ background: 'var(--th-bg)' }}>
                <div className="grid grid-cols-3 gap-2">
                  <div><span style={{ color: 'var(--th-text-secondary)' }}>Amount</span><p className="font-semibold" style={{ color: 'var(--th-text)' }}>{formatCurrency(aiLog.data.data.amount || 0, currency)}</p></div>
                  <div><span style={{ color: 'var(--th-text-secondary)' }}>Category</span><p className="font-semibold" style={{ color: 'var(--th-text)' }}>{aiLog.data.data.category}</p></div>
                  <div><span style={{ color: 'var(--th-text-secondary)' }}>Type</span><p className="font-semibold" style={{ color: 'var(--th-text)' }}>{aiLog.data.data.type}</p></div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button className="flex-1 px-3 py-1.5 rounded-lg text-xs" style={{ background: 'var(--th-card)', color: 'var(--th-text)', border: '1px solid var(--th-border)' }}>Edit</button>
                  <button onClick={() => createTxn.mutate(aiLog.data.data)} className="flex-1 px-3 py-1.5 rounded-lg text-xs text-white font-semibold" style={{ background: '#F59E0B' }}>Log Transaction</button>
                </div>
              </motion.div>
            )}
          </CardShell>

          {/* Budget Engine Overview */}
          <CardShell title="Budget Engine Overview" action={() => {}} actionLabel="View All Budgets">
            <div className="space-y-2.5">
              {budgetEngine?.slice(0, 5).map((b) => (
                <div key={b.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: 'var(--th-text)' }}>{b.category?.name || 'Budget'}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>{formatCurrency(b.spent, currency, true)} / {formatCurrency(b.monthlyLimit, currency, true)}</span>
                      <span className="text-[10px] font-semibold" style={{ color: getRiskColor(b.riskPercent) }}>{b.riskPercent}%</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--th-bg)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(b.riskPercent, 100)}%`, background: getRiskColor(b.riskPercent) }} />
                  </div>
                </div>
              ))}
              {(!budgetEngine || budgetEngine.length === 0) && (
                <p className="text-xs text-center py-3" style={{ color: 'var(--th-text-secondary)' }}>No budgets set</p>
              )}
            </div>
          </CardShell>

          {/* Money Mood Tracker */}
          <CardShell title="Money Mood Tracker">
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(MOOD_LABELS).map(([key, config]) => {
                const moodData = moodTracking?.find(m => m.mood === key);
                return (
                  <div key={key} className="text-center p-2 rounded-xl" style={{ background: `${config.color}10` }}>
                    <span className="text-lg">{config.emoji}</span>
                    <p className="text-sm font-bold mt-1" style={{ color: config.color }}>{moodData?.percentage || 0}%</p>
                    <p className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>{config.label}</p>
                  </div>
                );
              })}
            </div>
          </CardShell>

          {/* Active Streaks */}
          <CardShell title="Active Streaks" action={() => {}}>
            <div className="space-y-2.5">
              {streaks?.map((s) => {
                const config = STREAK_CONFIG[s.type];
                return (
                  <div key={s.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{config?.icon}</span>
                      <span className="text-xs font-medium" style={{ color: 'var(--th-text)' }}>{config?.label}</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: config?.color }}>{s.current} days</span>
                  </div>
                );
              })}
            </div>
          </CardShell>
        </div>
      </div>

      {/* ════════ BOTTOM ANALYTICS ════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Spending Breakdown — Donut */}
        <CardShell title="Spending Breakdown">
          <div className="flex items-center gap-3">
            <div className="w-28 h-28 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={spendingBreakdown?.slice(0, 8) || []} dataKey="amount" nameKey="category"
                    cx="50%" cy="50%" innerRadius={32} outerRadius={50} paddingAngle={1} strokeWidth={0}>
                    {spendingBreakdown?.slice(0, 8).map((_, i) => <Cell key={i} fill={BREAKDOWN_COLORS[i]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold" style={{ color: 'var(--th-text)' }}>{formatCurrency(kpis.totalSpend?.current || 0, currency, true)}</span>
                <span className="text-[8px]" style={{ color: 'var(--th-text-secondary)' }}>Total Spent</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              {spendingBreakdown?.slice(0, 6).map((c, i) => (
                <div key={c.category} className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: BREAKDOWN_COLORS[i] }} />
                    <span className="truncate" style={{ color: 'var(--th-text)' }}>{c.category}</span>
                    <span style={{ color: 'var(--th-text-secondary)' }}>{c.percentage}%</span>
                  </div>
                  <span className="font-medium flex-shrink-0" style={{ color: 'var(--th-text)' }}>{formatCurrency(c.amount, currency, true)}</span>
                </div>
              ))}
            </div>
          </div>
        </CardShell>

        {/* Spend Personality — Radar */}
        <CardShell title="Spend Personality" subtitle="Based on your last 30 days">
          <div className="h-36 flex items-center justify-center">
            <p className="text-xs" style={{ color: 'var(--th-text-secondary)' }}>
              <Sparkles className="w-4 h-4 inline mr-1" style={{ color: '#F59E0B' }} />
              AI-generated personality — check Intelligence tab
            </p>
          </div>
        </CardShell>

        {/* Top Categories */}
        <CardShell title="Top Categories by Spend" action={() => {}} actionLabel="View All Categories">
          <div className="space-y-2">
            {topCategories?.map((c, i) => (
              <div key={c.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 flex items-center justify-center text-xs font-bold rounded" style={{ background: 'var(--th-bg)', color: 'var(--th-text-secondary)' }}>{i + 1}</span>
                  <span className="text-xs font-medium" style={{ color: 'var(--th-text)' }}>{c.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold" style={{ color: 'var(--th-text)' }}>{formatCurrency(c.amount, currency, true)}</span>
                  <span className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>{c.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardShell>

        {/* Financial XP */}
        <CardShell title="Financial XP">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">⚡</span>
            <div>
              <span className="text-2xl font-bold" style={{ color: 'var(--th-text)' }}>
                {user?.totalXp || 0}
              </span>
              <span className="text-xs ml-1" style={{ color: 'var(--th-text-secondary)' }}>/ 1000 XP</span>
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white" style={{ background: '#8B5CF6' }}>
                Level {user?.level || 1}
              </span>
            </div>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--th-bg)' }}>
            <div className="h-full rounded-full" style={{ width: `${Math.min(((user?.totalXp || 0) % 1000) / 10, 100)}%`, background: 'linear-gradient(90deg, #8B5CF6, #6366F1)' }} />
          </div>
          <p className="text-[10px] mt-1.5" style={{ color: 'var(--th-text-secondary)' }}>Keep going! You're doing great.</p>
        </CardShell>
      </div>

      {/* ════════ BOTTOM ROW 2 ════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Spending Trend — Line chart */}
        <CardShell title="Spending Trend">
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spendingTrend || []}>
                <CartesianGrid stroke="var(--th-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--th-text-secondary)' }} tickFormatter={v => v?.split('-').pop()} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: 'var(--th-text-secondary)' }} axisLine={false} tickLine={false} tickFormatter={v => abbreviateNumber(v)} width={35} />
                <Tooltip contentStyle={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', borderRadius: 12, fontSize: 11 }} formatter={v => formatCurrency(v, currency)} />
                <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} dot={false} name="Income" />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} dot={false} name="Expenses" />
                <Line type="monotone" dataKey="savings" stroke="#3B82F6" strokeWidth={2} dot={false} name="Savings" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardShell>

        {/* Monthly Cash Flow — Bar */}
        <CardShell title="Monthly Cash Flow">
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendingTrend?.slice(-7) || []}>
                <CartesianGrid stroke="var(--th-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--th-text-secondary)' }} tickFormatter={v => v?.split('-').pop()} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: 'var(--th-text-secondary)' }} axisLine={false} tickLine={false} tickFormatter={v => abbreviateNumber(v)} width={35} />
                <Tooltip contentStyle={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', borderRadius: 12, fontSize: 11 }} formatter={v => formatCurrency(v, currency)} />
                <Bar dataKey="income" fill="#10B981" radius={[3,3,0,0]} barSize={10} />
                <Bar dataKey="expenses" fill="#EF4444" radius={[3,3,0,0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardShell>

        {/* Expense Leak Detection */}
        <CardShell title="Expense Leak Detection">
          <div className="space-y-2">
            {(data.spendingBreakdown || []).filter(c => ['Food & Dining', 'Entertainment', 'Shopping'].includes(c.category)).slice(0, 3).map((leak) => (
              <div key={leak.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{CATEGORY_ICONS[leak.category] || '💸'}</span>
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--th-text)' }}>{leak.category}</p>
                    <p className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>{leak.percentage}% of total</p>
                  </div>
                </div>
                <span className="text-xs font-semibold" style={{ color: '#EF4444' }}>{formatCurrency(leak.amount, currency)}</span>
              </div>
            ))}
          </div>
        </CardShell>
      </div>
    </div>
  );
}
