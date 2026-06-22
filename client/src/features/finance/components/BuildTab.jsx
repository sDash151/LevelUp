import { motion } from 'motion/react';
import { ChevronRight, Plus, Target, Check, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '@/design-system/components/Modal';
import { useBuildData, useContributeToGoal } from '../hooks/useFinance';
import { useUser } from '@/features/auth/hooks/useAuth';
import KPICard from './KPICard';
import ScoreGauge from './ScoreGauge';
import { FinanceGoalFormModal } from './FinanceGoalFormModal';
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

export default function BuildTab({ onOpenContributeModal }) {
  const { data, isLoading } = useBuildData();
  const { data: user } = useUser();
  const currency = user?.baseCurrency || 'INR';
  const contribute = useContributeToGoal();
  
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showSavingsHistoryModal, setShowSavingsHistoryModal] = useState(false);
  
  const [showGoalFormModal, setShowGoalFormModal] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState(null);

  const handleCreateGoal = () => { setGoalToEdit(null); setShowGoalFormModal(true); };
  const handleEditGoal = (goal) => { setGoalToEdit(goal); setShowGoalFormModal(true); };

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
        <KPICard icon="📈" label="Investment Value" value={kpis.investmentValue?.current} change={kpis.investmentValue?.change} color="#F59E0B" currency={currency} index={2} />
        <KPICard icon="🎯" label="Opportunity Fund" value={kpis.opportunityFund?.current} change={kpis.opportunityFund?.change} color="#3B82F6" currency={currency} index={3} />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-[16px] p-6 pb-12 flex flex-col min-h-[160px] shadow-[0_2px_10px_rgba(0,0,0,0.02)]" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[13px] flex-shrink-0 text-orange-500" style={{ background: 'var(--th-card-solid)' }}>
              🛡️
            </span>
            <span className="text-[11px] font-bold leading-tight" style={{ color: 'var(--th-text-secondary)' }}>Wealth Score</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center mt-3">
            <ScoreGauge score={kpis.wealthScore?.score || 0} label={kpis.wealthScore?.label || "Excellent"} size={60} strokeWidth={5} />
          </div>
        </motion.div>
      </div>

      {/* ════════ MAIN + SIDEBAR ════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Financial Goals */}
          <CardShell title="Financial Goals" action={() => setShowGoalsModal(true)} actionLabel="View All Goals">
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

          {/* Quick Actions */}
          <CardShell title="Quick Actions">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Create New Goal', icon: '🎯', action: handleCreateGoal },
                { label: 'Add to Opportunity Fund', icon: '💰', action: () => setShowOpportunityModal(true) },
                { label: 'Invest in Skills', icon: '📚', action: () => setShowSkillsModal(true) },
                { label: 'View All Investments', icon: '📈', action: () => setShowGoalsModal(true) },
              ].map(a => (
                <button key={a.label} onClick={a.action} className="w-full flex flex-col items-center justify-center p-4 rounded-xl text-xs font-medium transition-all hover:scale-[1.02] shadow-sm hover:shadow-md"
                  style={{ background: 'var(--th-bg)', color: 'var(--th-text)' }}>
                  <span className="text-2xl mb-2">{a.icon}</span>
                  <span className="font-bold text-center">{a.label}</span>
                </button>
              ))}
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
              <button onClick={() => setShowOpportunityModal(true)} className="w-full py-2 rounded-lg text-xs font-semibold text-white" style={{ background: '#10B981' }}>Add Money</button>
            </CardShell>

            <CardShell title="Skill Investment Tracker" action={() => setShowSkillsModal(true)} actionLabel="View All">
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
                    <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-success)' }} /><span style={{ color: 'var(--th-text)' }}>{goalStats?.onTrack || 0}</span>
                    <span style={{ color: 'var(--color-success)' }}>On Track</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-warning)' }} /><span style={{ color: 'var(--th-text)' }}>{goalStats?.behind || 0}</span>
                    <span style={{ color: 'var(--color-warning)' }}>Behind</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-danger)' }} /><span style={{ color: 'var(--th-text)' }}>{goalStats?.atRisk || 0}</span>
                    <span style={{ color: 'var(--color-danger)' }}>At Risk</span>
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
          <CardShell title="Savings Streak" action={() => setShowSavingsHistoryModal(true)} actionLabel="View History">
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
              {(() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const dayOfWeek = today.getDay();
                const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
                
                const endDate = new Date(today);
                endDate.setDate(today.getDate() + daysUntilSunday);
                
                const startDate = new Date(endDate);
                startDate.setDate(endDate.getDate() - 34);

                return Array.from({ length: 35 }, (_, i) => {
                  const date = new Date(startDate);
                  date.setDate(startDate.getDate() + i);
                  const dateStr = date.toISOString().split('T')[0];
                  
                  const isFuture = date > today;
                  const contribution = contributionCalendar?.find(c => c.date === dateStr);
                  const hasData = contribution && contribution.amount > 0;
                  
                  return (
                    <div key={i} className={`w-full aspect-square rounded-full flex items-center justify-center text-[8px] transition-transform ${hasData ? 'cursor-pointer hover:scale-110' : ''} ${isFuture ? 'opacity-30' : ''}`}
                      style={{ background: hasData ? '#10B981' : 'var(--th-bg)', color: hasData ? '#fff' : 'var(--th-text-secondary)', boxShadow: hasData ? '0 2px 4px rgba(16,185,129,0.3)' : 'none' }}
                      title={hasData ? `${contribution.label}: ${formatCurrency(contribution.amount, currency)}` : isFuture ? 'Future' : 'No contribution'}>
                      {date.getDate()}
                    </div>
                  );
                });
              })()}
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
        </div>
      </div>

      {/* ════════ MODALS ════════ */}
      <Modal isOpen={showGoalsModal} onClose={() => setShowGoalsModal(false)} title="Financial Goals" size="md">
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm" style={{ color: 'var(--th-text-secondary)' }}>Track your progress across all major financial objectives.</p>
            <button onClick={handleCreateGoal} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors hover:opacity-80" style={{ background: 'var(--th-primary)', color: '#08080d' }}>
              + New Goal
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto pr-2 hide-scrollbar space-y-3">
            {goals.map(g => {
              const current = parseFloat(g.currentAmount);
              const target = parseFloat(g.targetAmount);
              const progress = Math.min((current / target) * 100, 100);
              const isCompleted = g.isCompleted || progress >= 100;
              return (
                <div key={g.id} className="rounded-xl p-4 flex gap-4 items-center group relative border" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-xl shadow-inner`} style={{ background: isCompleted ? 'var(--color-success)' : 'var(--th-card-solid)', color: isCompleted ? '#ffffff' : 'var(--th-text)' }}>
                    {isCompleted ? <Check className="w-6 h-6" /> : (GOAL_TYPE_CONFIG[g.goalType]?.icon || '🎯')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold truncate" style={{ color: 'var(--th-text)' }}>{g.title}</h4>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--th-text-secondary)' }}>{formatCurrency(current, currency, true)} of {formatCurrency(target, currency, true)}</p>
                    <div className="w-full h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: 'var(--th-border)' }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: isCompleted ? 'var(--color-success)' : 'var(--th-primary)' }} />
                    </div>
                  </div>
                  {/* Edit button on hover */}
                  <button 
                    onClick={() => handleEditGoal(g)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg shadow-sm hover:opacity-80"
                    style={{ background: 'var(--th-card-solid)', color: 'var(--th-text)' }}
                  >
                    ✏️
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>

      <Modal isOpen={showOpportunityModal} onClose={() => setShowOpportunityModal(false)} title="Opportunity Fund" size="sm">
        <div className="text-center py-4">
           <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4" style={{ background: 'var(--th-card-solid)' }}>🎯</div>
           <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--th-text)' }}>{formatCurrency(opportunityFund?.current || 0, currency)}</h3>
           <p className="text-sm mb-6" style={{ color: 'var(--th-text-secondary)' }}>Available to deploy</p>
           
           <div className="rounded-xl p-4 text-left mb-6 border" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}>
             <p className="text-sm font-medium mb-2" style={{ color: 'var(--th-text)' }}>Fund Allocation</p>
             <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--th-border)' }}>
                <div className="h-full rounded-full" style={{width: opportunityFund?.goal ? Math.min((opportunityFund.current / opportunityFund.goal.targetAmount) * 100, 100) + '%' : '0%', background: 'var(--th-primary)'}} />
             </div>
             <p className="text-xs mt-2 text-right" style={{ color: 'var(--th-text-secondary)' }}>Target: {opportunityFund?.goal ? formatCurrency(opportunityFund.goal.targetAmount, currency, true) : 'Not set'}</p>
           </div>
           
           <button 
              onClick={() => { 
                setShowOpportunityModal(false); 
                onOpenContributeModal(opportunityFund?.goal);
              }} 
              className="w-full py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-md"
              style={{ background: 'var(--th-primary)', color: '#08080d' }}
           >
              Contribute Now
           </button>
        </div>
      </Modal>

      <Modal isOpen={showSkillsModal} onClose={() => setShowSkillsModal(false)} title="Skill Investments" size="md">
        <div className="space-y-4">
           <div className="rounded-xl p-4 flex items-center justify-between border" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}>
              <div>
                 <span className="text-sm font-bold block" style={{ color: 'var(--th-text)' }}>Total Invested</span>
                 <span className="text-xs font-medium" style={{ color: 'var(--th-text-secondary)' }}>In your personal growth</span>
              </div>
              <span className="text-xl font-black" style={{ color: 'var(--th-primary)' }}>{formatCurrency(skillInvestments?.totalInvested || 0, currency)}</span>
           </div>
           <div className="space-y-3 mt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--th-text-muted)' }}>Breakdown</h4>
              {skillInvestments?.breakdown && Object.entries(skillInvestments.breakdown).filter(([,v]) => v > 0).map(([key, value], i) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: 'var(--th-border)', background: 'var(--th-card)' }}>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: ['#8B5CF620', '#3B82F620', '#10B98120', '#F59E0B20'][i % 4], color: ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'][i % 4] }}>
                       {key === 'learning' ? '📚' : key === 'tools' ? '💻' : key === 'health' ? '🏋️' : '💼'}
                    </span>
                    <span className="text-sm font-bold capitalize" style={{ color: 'var(--th-text)' }}>{key}</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: 'var(--th-text)' }}>{formatCurrency(value, currency)}</span>
                </div>
              ))}
           </div>
        </div>
      </Modal>

      <Modal isOpen={showSavingsHistoryModal} onClose={() => setShowSavingsHistoryModal(false)} title="Recent Savings" size="md">
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm" style={{ color: 'var(--th-text-secondary)' }}>Your savings activity over the past 20 days.</p>
            <button onClick={() => { setShowSavingsHistoryModal(false); onOpenContributeModal(null); }} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors hover:opacity-80" style={{ background: 'var(--th-primary)', color: '#08080d' }}>
              + Log Savings
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto pr-2 hide-scrollbar space-y-2">
            {Array.from({ length: 20 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - i);
              const savingsStreakData = streaks?.find(s => s.type === 'savings');
              const hasData = i < (savingsStreakData?.current || 0);
              
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm" style={{ background: hasData ? 'var(--th-card-solid)' : 'transparent', border: hasData ? 'none' : '1px solid var(--th-border)' }}>
                      {hasData ? '💰' : '💤'}
                    </div>
                    <div>
                      <span className="text-[14px] font-bold block" style={{ color: 'var(--th-text)' }}>
                        {date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-[12px] font-medium" style={{ color: hasData ? 'var(--color-success)' : 'var(--th-text-muted)' }}>
                        {hasData ? 'Streak Maintained' : 'No activity'}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[14px] font-bold ${hasData ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {hasData ? `🔥` : '-'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
      
      <FinanceGoalFormModal 
        isOpen={showGoalFormModal}
        onClose={() => setShowGoalFormModal(false)}
        goalToEdit={goalToEdit}
      />
    </div>
  );
}
