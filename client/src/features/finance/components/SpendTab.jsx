import { useState } from 'react';
import { motion } from 'motion/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Search, Filter, Send, Sparkles, ChevronRight, Plus, Trash2,
  ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Edit2, Zap, Flame, ChevronDown
} from 'lucide-react';
import { useSpendData, useTransactions, useCreateTransaction, useAILogTransaction, useSpendPersonality, useFinanceOverview, useCategories, useCreateBudget, useUpdateBudget, useDeleteBudget, useDeleteTransaction } from '../hooks/useFinance';
import { useUser } from '@/features/auth/hooks/useAuth';
import KPICard from './KPICard';
import ScoreGauge from './ScoreGauge';
import { Modal, Select } from '@/design-system/components';
import {
  formatCurrency, formatDateShort, getRiskColor,
  abbreviateNumber, CATEGORY_ICONS, CATEGORY_COLORS, MOOD_LABELS,
  STREAK_CONFIG,
} from '../utils';

import ActiveBudgetsModal from './ActiveBudgetsModal';
import MoodAnalyticsModal from './MoodAnalyticsModal';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart,
  PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';

function CardShell({ title, subtitle, action, actionLabel, children, className = '', titleAction }) {
  return (
    <div className={`rounded-[20px] p-5 shadow-sm flex flex-col ${className}`} style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)', borderStyle: 'solid', borderWidth: '1px' }}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div>
              {title && <h3 className="text-[15px] font-bold" style={{ color: 'var(--th-text)' }}>{title}</h3>}
              {subtitle && <p className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--th-text-muted)' }}>{subtitle}</p>}
            </div>
            {titleAction}
          </div>
          {action && (
            <button onClick={action} className="text-[12px] font-semibold flex items-center gap-0.5 hover:underline" style={{ color: 'var(--th-primary)' }}>
              {actionLabel || 'View All'} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {children}
      </div>
    </div>
  );
}

function SpendSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
        {[1,2,3,4,5,6,7].map(i => <div key={i} className="h-[160px] rounded-[20px] border" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }} />)}
      </div>
      <div className="h-96 rounded-[20px] border" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }} />
    </div>
  );
}

const TYPE_ICONS = {
  INCOME: { icon: ArrowDownLeft, color: '#10B981', bg: '#10B98115' },
  EXPENSE: { icon: ArrowUpRight, color: '#EF4444', bg: '#EF444415' },
  TRANSFER: { icon: ArrowLeftRight, color: '#3B82F6', bg: '#3B82F615' },
};

const BREAKDOWN_COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#F97316', '#6366F1', '#14B8A6'];

export default function SpendTab({ onOpenTransactionForm, onOpenActiveBudgetsModal, onEditTransaction }) {
  const qc = useQueryClient();
  const { data, isLoading } = useSpendData();
  const { data: user } = useUser();
  const currency = user?.baseCurrency || 'INR';

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [aiText, setAiText] = useState('');
  const [isPersonalityModalOpen, setIsPersonalityModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [txnToDelete, setTxnToDelete] = useState(null);

  const { data: personality, isLoading: isPersonalityLoading } = useSpendPersonality();
  const { data: overview } = useFinanceOverview();
  const { data: categories } = useCategories();

  const { data: txnData } = useTransactions({ search, type: typeFilter || undefined, sort, page, limit: 10 });
  const deleteBudget = useDeleteBudget();
  const deleteTxn = useDeleteTransaction();

  const handleDeleteTransaction = (id) => {
    setTxnToDelete(id);
  };

  const confirmDeleteTransaction = () => {
    if (txnToDelete) {
      deleteTxn.mutate(txnToDelete, {
        onSuccess: () => setTxnToDelete(null)
      });
    }
  };

  if (isLoading) return <SpendSkeleton />;
  if (!data) return null;

  const { kpis, budgetEngine, spendingBreakdown, topCategories, moodTracking, spendingTrend, streaks } = data;

  const expenseLeaks = overview?.expenseLeaks || [];
  const transactions = txnData?.data || [];
  const totalPages = txnData?.totalPages || 1;

  const handleAILog = () => {
    if (!aiText.trim()) return;
    onOpenTransactionForm(aiText);
    setAiText('');
  };

  const handleDeleteBudget = async (id) => {
    try {
      qc.setQueryData(['finance', 'spend'], (old) => {
        if (!old) return old;
        const newBudgetEngine = old.budgetEngine ? old.budgetEngine.filter(b => b.id !== id) : [];
        return { ...old, budgetEngine: newBudgetEngine };
      });
      await deleteBudget.mutateAsync(id);
      qc.invalidateQueries({ queryKey: ['finance'] });
    } catch (e) {
      console.error("Failed to delete budget", e);
    }
  };

  const categoryOptions = [];
  const seenCats = new Set();
  (categories || []).forEach(c => {
    if (!seenCats.has(c.name)) {
      seenCats.add(c.name);
      categoryOptions.push({ value: c.id, label: c.name });
    }
  });

  return (
    <div className="space-y-6">
      {/* ════════ KPI CARDS ════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
        <KPICard icon={<ArrowUpRight className="w-4 h-4" />} label="Total Spent" value={kpis.totalSpend?.current} change={kpis.totalSpend?.change} color="#EF4444" currency={currency} index={0} />
        <KPICard icon={<ArrowDownLeft className="w-4 h-4" />} label="Total Income" value={kpis.totalIncome?.current} change={kpis.totalIncome?.change} color="#10B981" currency={currency} index={1} />
        <KPICard icon={<ArrowLeftRight className="w-4 h-4" />} label="Net Cash Flow" value={kpis.netCashFlow?.current} change={kpis.netCashFlow?.change} color="#3B82F6" currency={currency} index={2} />
        <KPICard icon={<span className="text-amber-500 font-bold">📄</span>} label="Transactions" value={`${kpis.transactionCount?.current || 0}`} change={kpis.transactionCount?.change} color="#F59E0B" index={3} />
        <KPICard icon={<Flame className="w-4 h-4" />} label="Avg. Daily Spend" value={kpis.avgDailySpend?.current} subtext="/day" change={kpis.avgDailySpend?.change} color="#F59E0B" currency={currency} index={4} />
        
        <div className="relative overflow-hidden rounded-[20px] p-4 flex flex-col items-center justify-center min-h-[160px] shadow-sm border" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}>
          <div className="absolute top-4 left-4 flex items-center gap-2">
             <span className="w-6 h-6 rounded-full flex items-center justify-center text-sm" style={{ background: 'var(--color-success-dim)', color: 'var(--color-success)' }}>✓</span>
             <span className="text-[11px] font-semibold" style={{ color: 'var(--th-text-secondary)' }}>Budget Health</span>
          </div>
          <div className="mt-8">
            <ScoreGauge score={kpis.budgetHealth?.score || 0} label={kpis.budgetHealth?.label || "Good"} size={70} strokeWidth={5} />
          </div>
        </div>

        <KPICard icon={<span className="text-red-500 font-bold">!</span>} label="Budget Over Limit" value={`${kpis.budgetsOverLimit?.count || 0}`} subtext="Categories" color="#EF4444" index={6} />
      </div>

      {/* ════════ RECENT TRANSACTIONS (Full Width) ════════ */}
      <CardShell title="Recent Transactions">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--th-highlight)' }}>
                {['', 'EXPENSE', 'INCOME', 'TRANSFER'].map(t => (
                  <button key={t} onClick={() => { setTypeFilter(t); setPage(1); }}
                    className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all ${typeFilter === t ? 'shadow-sm' : 'hover:opacity-80'}`}
                    style={typeFilter === t ? { background: 'var(--th-primary)', color: '#08080d' } : { color: 'var(--th-text-secondary)' }}>
                    {t || 'All'}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--th-text-muted)' }} />
                  <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search transactions..."
                    className="w-64 pl-9 pr-4 py-2 rounded-xl text-[13px] font-medium border outline-none focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:opacity-50"
                    style={{ background: 'var(--th-highlight)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }} />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl border text-[13px] font-bold hover:opacity-80 transition-opacity" style={{ background: 'var(--th-highlight)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }}>
                  <Filter className="w-4 h-4" /> Filter
                </button>
                <select value={sort} onChange={e => setSort(e.target.value)}
                  className="px-4 py-2 rounded-xl text-[13px] font-bold border outline-none cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ background: 'var(--th-highlight)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }}>
                  <option value="latest">Sort: Latest</option>
                  <option value="oldest">Oldest</option>
                  <option value="highest">Highest</option>
                  <option value="lowest">Lowest</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto pb-4">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b" style={{ color: 'var(--th-text-muted)', borderColor: 'var(--th-border)' }}>
                    <th className="text-left py-3 font-semibold w-8">
                       <input type="checkbox" className="rounded border-gray-300 text-amber-500 focus:ring-amber-500/20" />
                    </th>
                    <th className="text-left py-3 font-semibold">Date</th>
                    <th className="text-left py-3 font-semibold">Merchant</th>
                    <th className="text-left py-3 font-semibold">Category</th>
                    <th className="text-left py-3 font-semibold">Type</th>
                    <th className="text-right py-3 font-semibold">Amount</th>
                    <th className="text-left py-3 font-semibold px-4">Payment</th>
                    <th className="text-center py-3 font-semibold">Mood</th>
                    <th className="text-left py-3 font-semibold">Tags</th>
                    <th className="text-right py-3 font-semibold px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length > 0 ? transactions.map((txn) => {
                    const typeConfig = TYPE_ICONS[txn.type] || TYPE_ICONS.EXPENSE;
                    return (
                      <tr key={txn.id} className="border-b transition-colors group hover:opacity-80" style={{ borderColor: 'var(--th-border)' }}>
                        <td className="py-3.5">
                           <input type="checkbox" className="rounded border-gray-300 text-amber-500 focus:ring-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </td>
                        <td className="py-3.5 font-medium" style={{ color: 'var(--th-text-secondary)' }}>{formatDateShort(txn.date)}</td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full flex items-center justify-center text-[13px]" style={{ background: typeConfig.bg }}>
                              {CATEGORY_ICONS[txn.category] || '💸'}
                            </span>
                            <span className="font-bold" style={{ color: 'var(--th-text)' }}>{txn.merchant || txn.description || '-'}</span>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <span className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--th-text-secondary)' }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: CATEGORY_COLORS[txn.category] || '#6366F1' }} />
                            {txn.category}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className="font-medium" style={{ color: typeConfig.color }}>
                            {txn.type === 'INCOME' ? 'Income' : txn.type === 'TRANSFER' ? 'Transfer' : 'Expense'}
                          </span>
                        </td>
                        <td className="py-3.5 text-right font-bold" style={{ color: txn.type === 'INCOME' ? '#10B981' : '#EF4444' }}>
                          {txn.type === 'INCOME' ? '+' : '-'}{formatCurrency(txn.amount, currency)}
                        </td>
                        <td className="py-3.5 px-4">
                           <span className="px-2 py-1 rounded font-semibold text-[11px]" style={{ background: 'var(--th-highlight)', color: 'var(--th-text-secondary)' }}>{txn.paymentMethod || 'UPI'}</span>
                        </td>
                        <td className="py-3.5 text-center text-lg">{txn.mood ? MOOD_LABELS[txn.mood]?.emoji : '-'}</td>
                        <td className="py-3.5">
                          <div className="flex gap-1.5">
                            {(txn.tags?.length ? txn.tags : ['General']).slice(0, 2).map(tag => (
                              <span key={tag} className="px-2 py-0.5 rounded-md font-medium text-[10px]" style={{ background: 'var(--th-highlight)', color: 'var(--th-text-secondary)' }}>{tag}</span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onEditTransaction && onEditTransaction(txn)} className="p-1.5 rounded-lg hover:opacity-80 transition-all" style={{ background: 'var(--th-highlight)', color: 'var(--th-text-secondary)' }} title="Edit">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteTransaction(txn.id)} className="p-1.5 rounded-lg hover:opacity-80 transition-all" style={{ background: 'var(--color-danger-dim)', color: 'var(--color-danger)' }} title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan={10} className="py-12 text-center font-medium" style={{ color: 'var(--th-text-muted)' }}>No transactions found. Start logging!</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'var(--th-border)' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 rounded-xl text-[13px] font-bold disabled:opacity-40 transition-opacity hover:opacity-80"
                  style={{ background: 'var(--th-highlight)', color: 'var(--th-text-secondary)' }}>Previous</button>
                <span className="px-4 py-2 text-[13px] font-medium" style={{ color: 'var(--th-text-muted)' }}>Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl text-[13px] font-bold disabled:opacity-40 transition-opacity hover:opacity-80"
                  style={{ background: 'var(--th-highlight)', color: 'var(--th-text-secondary)' }}>Next</button>
              </div>
            )}
          </CardShell>

      {/* ════════ LOWER GRID ════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            
            <CardShell 
               title="Spending Breakdown" className="lg:h-[400px]"
            >
              <div className="flex flex-col items-center gap-4 mt-2">
                <div className="w-36 h-36 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={spendingBreakdown?.slice(0, 6) || []} dataKey="amount" nameKey="category"
                        cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={2} strokeWidth={0}>
                        {spendingBreakdown?.slice(0, 6).map((_, i) => <Cell key={i} fill={BREAKDOWN_COLORS[i]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                    <span className="text-[14px] font-bold" style={{ color: 'var(--th-text)' }}>{formatCurrency(kpis.totalSpend?.current || 0, currency, true)}</span>
                    <span className="text-[10px] font-medium" style={{ color: 'var(--th-text-muted)' }}>Total Spent</span>
                  </div>
                </div>
                <div className="w-full flex flex-col gap-2">
                  {spendingBreakdown?.slice(0, 5).map((c, i) => (
                    <div key={c.category} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: BREAKDOWN_COLORS[i] }} />
                        <span className="truncate font-medium" style={{ color: 'var(--th-text-secondary)' }}>{c.category}</span>
                        <span style={{ color: 'var(--th-text-muted)' }}>{c.percentage}%</span>
                      </div>
                      <span className="font-semibold flex-shrink-0" style={{ color: 'var(--th-text)' }}>{formatCurrency(c.amount, currency, true)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardShell>

            <CardShell title="Spend Personality" subtitle="Based on your last 30 days" className="lg:h-[400px]">
              {isPersonalityLoading ? (
                <div className="flex items-center justify-center h-48 text-sm" style={{ color: 'var(--th-text-muted)' }}>Analyzing personality...</div>
              ) : (
                <div className="flex flex-col items-center mt-2">
                   <div className="h-32 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="60%" data={[
                          { subject: 'Impulse', A: personality?.scores?.impulseControl || 0 },
                          { subject: 'Planning', A: personality?.scores?.planningScore || 0 },
                          { subject: 'Consistency', A: personality?.scores?.savingsConsistency || 0 },
                          { subject: 'Budgeting', A: personality?.scores?.budgetControl || 0 },
                       ]}>
                         <PolarGrid stroke="var(--th-border)" />
                         <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--th-text-muted)', fontSize: 9 }} />
                         <Radar dataKey="A" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} />
                       </RadarChart>
                     </ResponsiveContainer>
                   </div>
                   <div className="mt-4 text-center">
                      <p className="text-[11px] font-medium" style={{ color: 'var(--th-text-muted)' }}>Your Type</p>
                      <p className="text-[13px] font-bold text-amber-500 mt-0.5">{personality?.label || 'Analyzing...'}</p>
                      <p className="text-[11px] font-medium leading-tight mt-2 px-2 text-center italic" style={{ color: 'var(--th-text-secondary)' }}>Click "See Insights" for detailed analysis.</p>
                   </div>
                   <button onClick={() => setIsPersonalityModalOpen(true)} className="w-full mt-4 py-2 rounded-lg text-[12px] font-bold transition-opacity hover:opacity-80" style={{ background: 'var(--th-highlight)', color: 'var(--th-text-secondary)' }}>See Insights</button>
                </div>
              )}
            </CardShell>

            <CardShell 
               title="Top Categories by Spend" className="lg:h-[400px]"
            >
               <div className="flex flex-col h-full">
                 <div className="space-y-4 mt-2 flex-1">
                   {topCategories?.map((c, i) => (
                     <div key={c.category} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <span className="w-6 h-6 flex items-center justify-center text-[11px] font-bold rounded-lg" style={{ background: 'var(--th-highlight)', color: 'var(--th-text-secondary)' }}>{i + 1}</span>
                         <span className="text-[13px] font-bold" style={{ color: 'var(--th-text)' }}>{c.category}</span>
                       </div>
                       <div className="flex items-center gap-3">
                         <span className="text-[13px] font-bold" style={{ color: 'var(--th-text)' }}>{formatCurrency(c.amount, currency, true)}</span>
                         <span className="text-[11px] font-medium w-8 text-right" style={{ color: 'var(--th-text-muted)' }}>{c.percentage}%</span>
                       </div>
                     </div>
                   ))}
                 </div>
                 <button onClick={() => setIsCategoriesModalOpen(true)} className="w-full mt-4 py-2 rounded-lg text-[12px] font-bold shrink-0 transition-opacity hover:opacity-80 mt-auto" style={{ background: 'var(--th-highlight)', color: 'var(--th-text-secondary)' }}>View All Categories</button>
               </div>
            </CardShell>

            <CardShell title="Financial XP">
              <div className="flex items-start gap-4 mt-2">
                <span className="text-3xl text-amber-500 mt-1"><Zap className="w-8 h-8 fill-amber-500" /></span>
                <div className="flex-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold leading-none" style={{ color: 'var(--th-text)' }}>
                      {user?.totalXp || 8595}
                    </span>
                    <span className="text-[12px] font-medium" style={{ color: 'var(--th-text-muted)' }}>/ 1000</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                     <span className="text-[11px] font-bold" style={{ color: 'var(--th-text-muted)' }}>XP</span>
                     <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-[#8B5CF6]">
                       Level {user?.level || 2}
                     </span>
                  </div>
                </div>
              </div>
              <div className="w-full h-2.5 rounded-full mt-6 overflow-hidden" style={{ background: 'var(--th-highlight)' }}>
                <div className="h-full rounded-full" style={{ width: `${Math.min(((user?.totalXp || 8595) % 1000) / 10, 100)}%`, background: '#8B5CF6' }} />
              </div>
              <p className="text-[11px] font-medium mt-3" style={{ color: 'var(--th-text-muted)' }}>Keep going! You're doing great.</p>
            </CardShell>


            <CardShell 
               title="Expense Leak Detection"
            >
              <div className="space-y-3 mt-1 max-h-[140px] overflow-y-auto no-scrollbar pr-1">
                {expenseLeaks?.length > 0 ? expenseLeaks.map((leak, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl flex items-center justify-center text-lg" style={{ background: 'var(--th-highlight)' }}>{CATEGORY_ICONS[leak.category] || '💸'}</span>
                      <div>
                        <p className="text-[13px] font-bold leading-tight" style={{ color: 'var(--th-text)' }}>{leak.category}</p>
                        <p className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--th-text-muted)' }}>{leak.percentage}% of total leaks</p>
                      </div>
                    </div>
                    <span className="text-[13px] font-bold" style={{ color: 'var(--th-text)' }}>{formatCurrency(leak.amount, currency, true)}</span>
                  </div>
                )) : (
                  <p className="text-xs text-center py-2" style={{ color: 'var(--th-text-secondary)' }}>No leaks detected! 🎉</p>
                )}
              </div>
              {expenseLeaks?.length > 0 && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t shrink-0" style={{ borderColor: 'var(--th-border)' }}>
                   <span className="text-[12px] font-bold" style={{ color: 'var(--th-text-secondary)' }}>Total Leaks</span>
                   <span className="text-[14px] font-bold text-red-500">
                     {formatCurrency(expenseLeaks.reduce((s, l) => s + l.amount, 0), currency, true)}
                   </span>
                </div>
              )}
            </CardShell>

            <CardShell 
               title="Monthly Cash Flow"
            >
              <div className="h-40 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spendingTrend?.slice(-7) || []} barGap={4}>
                    <CartesianGrid stroke="var(--th-border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--th-text-muted)' }} tickFormatter={v => `W${v?.split('-')[2] || '1'}`} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--th-text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => abbreviateNumber(v)} width={30} />
                    <Tooltip contentStyle={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)', borderRadius: 12, fontSize: 12, color: 'var(--th-text)' }} formatter={v => formatCurrency(v, currency)} />
                    <Bar dataKey="income" fill="#10B981" radius={[2,2,0,0]} barSize={8} />
                    <Bar dataKey="expenses" fill="#EF4444" radius={[2,2,0,0]} barSize={8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardShell>



          
          <CardShell 
             title={<span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500" /> AI Smart Logging</span>} 
             className="lg:col-span-2 relative overflow-hidden" 
             titleAction={<span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 text-[10px] font-bold border border-amber-200/50 shadow-sm shadow-amber-100">✨ Beta</span>}
          >
            {/* Ambient Background Glows */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="mt-2 mb-5 relative z-10">
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--th-text-secondary)' }}>
                Skip the manual forms. Just type what you spent money on naturally, and our <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">AI Engine</span> will instantly categorize the transaction, detect the merchant, assign tags, and analyze your spending mood.
              </p>
            </div>
            
            <div className="relative z-10 group rounded-[13px] p-[1.5px] transition-all duration-300">
              {/* Gradient Border Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/40 via-orange-400/40 to-purple-400/40 opacity-50 group-hover:opacity-100 transition duration-500 rounded-[13px]" />
              
              <div className="relative rounded-xl flex items-center h-full" style={{ background: 'var(--th-card-solid)' }}>
                <input value={aiText} onChange={e => setAiText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAILog()}
                  placeholder="e.g., 'Paid ₹280 for a protein shake after workout'"
                  className="w-full pl-5 pr-14 py-3.5 rounded-xl text-[14px] font-medium bg-transparent border-none outline-none focus:ring-0 placeholder:opacity-50"
                  style={{ color: 'var(--th-text)' }} />
                <button onClick={handleAILog} disabled={!aiText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg disabled:opacity-40 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-500/20 transition-all">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="mt-4 flex flex-wrap items-center gap-2 relative z-10">
               <span className="text-[11px] font-medium" style={{ color: 'var(--th-text-muted)' }}>Try saying:</span>
               {["☕ Coffee ₹150", "🍿 Movie tickets ₹800", "🚕 Uber to work ₹250"].map(hint => (
                 <button key={hint} onClick={() => setAiText(hint.replace(/[^a-zA-Z0-9 ₹]/g, '').trim())} 
                   className="px-2.5 py-1 rounded-full border text-[11px] font-medium transition-opacity hover:opacity-80 shadow-sm"
                   style={{ background: 'var(--th-card-solid)', borderColor: 'var(--th-border)', color: 'var(--th-text-secondary)' }}>
                   {hint}
                 </button>
               ))}
            </div>
          </CardShell>

          <CardShell 
             title="Budget Engine Overview" 
             action={() => onOpenActiveBudgetsModal()} actionLabel="View All Budgets"
          >
            <div className="space-y-5 mt-2">
              {budgetEngine?.slice(0, 5).map((b) => (
                <div key={b.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                       <span className="w-5 h-5 flex items-center justify-center text-xs">{CATEGORY_ICONS[b.category?.name] || '💡'}</span>
                       <span className="text-[13px] font-bold" style={{ color: 'var(--th-text)' }}>{b.category?.name || 'Budget'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium" style={{ color: 'var(--th-text-muted)' }}>{formatCurrency(b.spent, currency, true)} / {formatCurrency(b.monthlyLimit, currency, true)}</span>
                      <span className="text-[11px] font-bold w-8 text-right" style={{ color: getRiskColor(b.riskPercent) }}>{b.riskPercent}%</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--th-highlight)' }}>
                    <motion.div className="h-full rounded-full" style={{ background: getRiskColor(b.riskPercent) }}
                      initial={{ width: 0 }} animate={{ width: `${Math.min(b.riskPercent, 100)}%` }} transition={{ duration: 0.8 }} />
                  </div>
                </div>
              ))}
            </div>
          </CardShell>

          <CardShell 
             title="Money Mood Tracker"
          >
            <div className="grid grid-cols-3 gap-3 mt-2">
              {moodTracking?.length > 0 ? moodTracking.map(m => (
                <div key={m.mood} className="flex flex-col items-center justify-center p-3 rounded-2xl border" style={{ background: `${MOOD_LABELS[m.mood]?.color || '#9CA3AF'}15`, borderColor: 'var(--th-border)' }}>
                  <span className="text-2xl mb-1">{MOOD_LABELS[m.mood]?.emoji || '😐'}</span>
                  <span className="text-[16px] font-bold" style={{ color: MOOD_LABELS[m.mood]?.color || '#9CA3AF' }}>{m.percentage}%</span>
                  <span className="text-[11px] font-bold mt-1" style={{ color: 'var(--th-text)' }}>{MOOD_LABELS[m.mood]?.label || m.mood}</span>
                  <span className="text-[9px] font-medium mt-0.5" style={{ color: 'var(--th-text-muted)' }}>{m.count} transactions</span>
                </div>
              )) : (
                <div className="col-span-3 text-center text-sm py-4" style={{ color: 'var(--th-text-muted)' }}>No mood data this month</div>
              )}
            </div>
            <button onClick={() => setIsMoodModalOpen(true)} className="w-full mt-4 py-2.5 rounded-lg text-[12px] font-bold transition-opacity hover:opacity-80" style={{ background: 'var(--th-highlight)', color: 'var(--th-text-secondary)' }}>View Mood Analytics</button>
          </CardShell>

          <CardShell title="Active Streaks" action={() => {}}>
            <div className="space-y-4 mt-2">
              {streaks?.map((s) => {
                const config = STREAK_CONFIG[s.type];
                return (
                  <div key={s.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{config?.icon}</span>
                      <span className="text-[13px] font-bold" style={{ color: 'var(--th-text)' }}>{config?.label}</span>
                    </div>
                    <span className="text-[13px] font-bold" style={{ color: config?.color }}>{s.current} days</span>
                  </div>
                );
              })}
            </div>
          </CardShell>

            <CardShell 
               title="Spending Trend"
            >
              <div className="h-40 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={spendingTrend || []} margin={{ left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="var(--th-border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--th-text-muted)' }} tickFormatter={v => v?.split('-').pop()} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--th-text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => abbreviateNumber(v)} />
                    <Tooltip contentStyle={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)', borderRadius: 12, fontSize: 12, color: 'var(--th-text)' }} formatter={v => formatCurrency(v, currency)} />
                    <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="savings" stroke="#3B82F6" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 mt-1">
                <span className="flex items-center gap-1.5 text-[10px] font-bold" style={{ color: 'var(--th-text-muted)' }}><span className="w-2 h-2 rounded-full bg-[#10B981]" /> Income</span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold" style={{ color: 'var(--th-text-muted)' }}><span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Expenses</span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold" style={{ color: 'var(--th-text-muted)' }}><span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> Savings</span>
              </div>
            </CardShell>

      </div>

      <Modal isOpen={isPersonalityModalOpen} onClose={() => setIsPersonalityModalOpen(false)} title="Spend Personality Insights">
        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="text-center">
              <span className="inline-block p-3 rounded-full mb-3" style={{ background: 'var(--th-highlight)' }}>
                <Sparkles className="w-8 h-8 text-amber-500" />
              </span>
              <h2 className="text-xl font-bold" style={{ color: 'var(--th-text)' }}>{personality?.label || 'Analyzing...'}</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--th-text-secondary)' }}>Based on your last 30 days</p>
            </div>
          </div>
          
          <div className="rounded-2xl p-5 mb-6 border" style={{ background: 'var(--th-highlight)', borderColor: 'var(--th-border)' }}>
            <h3 className="text-[13px] font-bold mb-2" style={{ color: 'var(--th-text)' }}>Analysis</h3>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--th-text-secondary)' }}>
              {personality?.description || 'Need more data to determine your personality type. Log more transactions!'}
            </p>
          </div>

          {personality?.tips && personality.tips.length > 0 && (
            <div>
              <h3 className="text-[13px] font-bold mb-3 px-1" style={{ color: 'var(--th-text)' }}>Actionable Tips</h3>
              <div className="space-y-3">
                {personality.tips.map((tip, idx) => (
                  <div key={idx} className="flex gap-3 p-3 border rounded-xl shadow-sm" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}>
                    <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5" style={{ background: 'var(--th-highlight)', color: 'var(--th-primary)' }}>{idx + 1}</span>
                    <p className="text-[13px] leading-relaxed" style={{ color: 'var(--th-text-secondary)' }}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal isOpen={isCategoriesModalOpen} onClose={() => setIsCategoriesModalOpen(false)} title="All Categories by Spend">
        <div className="p-4 max-h-[70vh] overflow-y-auto no-scrollbar">
          <div className="space-y-4">
            {spendingBreakdown?.map((c, i) => (
              <div key={c.category} className="flex items-center justify-between p-3 rounded-xl border" style={{ background: 'var(--th-highlight)', borderColor: 'var(--th-border)' }}>
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 flex items-center justify-center text-[13px] font-bold rounded-lg shadow-sm" style={{ background: 'var(--th-card-solid)', color: 'var(--th-text-secondary)' }}>{i + 1}</span>
                  <div>
                    <span className="text-[14px] font-bold block" style={{ color: 'var(--th-text)' }}>{c.category}</span>
                    <span className="text-[12px] font-medium block mt-0.5" style={{ color: 'var(--th-text-muted)' }}>{c.count} transactions</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[15px] font-bold" style={{ color: 'var(--th-text)' }}>{formatCurrency(c.amount, currency, true)}</span>
                  <span className="text-[12px] font-bold px-2 py-0.5 rounded-md" style={{ background: 'var(--th-highlight)', color: 'var(--th-primary)' }}>{c.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <MoodAnalyticsModal isOpen={isMoodModalOpen} onClose={() => setIsMoodModalOpen(false)} />

      <Modal isOpen={!!txnToDelete} onClose={() => setTxnToDelete(null)} title="Delete Transaction" size="sm">
        <div className="space-y-6 pb-4">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-50 text-red-500 mb-2 shadow-sm border border-red-100">
               <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900" style={{ color: 'var(--th-text)' }}>Are you sure?</h3>
            <p className="text-sm font-medium" style={{ color: 'var(--th-text-secondary)' }}>
              Do you really want to delete this transaction? This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setTxnToDelete(null)}
              className="flex-1 py-3 rounded-xl text-[13px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'var(--th-highlight)', color: 'var(--th-text)' }}
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteTransaction}
              disabled={deleteTxn.isPending}
              className="flex-1 py-3 rounded-xl text-[13px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-sm"
              style={{ background: 'var(--color-danger, #EF4444)', color: '#ffffff' }}
            >
              {deleteTxn.isPending ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
