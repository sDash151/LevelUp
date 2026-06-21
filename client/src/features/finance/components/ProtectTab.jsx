import { motion } from 'motion/react';
import { ChevronRight, AlertTriangle, Shield, Check, Clock, X } from 'lucide-react';
import { useProtectData, usePayBill } from '../hooks/useFinance';
import { useUser } from '@/features/auth/hooks/useAuth';
import KPICard from './KPICard';
import ScoreGauge from './ScoreGauge';
import { formatCurrency, formatDate, formatDateShort, getScoreColor, abbreviateNumber } from '../utils';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

function CardShell({ title, action, actionLabel, children, className = '' }) {
  return (
    <div className={`rounded-2xl p-4 ${className}`} style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-3">
          {title && <h3 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>{title}</h3>}
          {action && <button onClick={action} className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: 'var(--th-primary)' }}>{actionLabel || 'View All'} <ChevronRight className="w-3 h-3" /></button>}
        </div>
      )}
      {children}
    </div>
  );
}

const RISK_COLORS = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };
const DEBT_COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];
const STATUS_STYLES = {
  ACTIVE: { bg: '#10B98120', color: '#10B981', label: 'Active' },
  UPCOMING: { bg: '#3B82F620', color: '#3B82F6', label: 'Upcoming' },
  PAID: { bg: '#10B98120', color: '#10B981', label: 'Paid' },
  OVERDUE: { bg: '#EF444420', color: '#EF4444', label: 'Overdue' },
  EXPIRING_SOON: { bg: '#F59E0B20', color: '#F59E0B', label: 'Expiring Soon' },
};

export default function ProtectTab() {
  const { data, isLoading } = useProtectData();
  const { data: user } = useUser();
  const currency = user?.baseCurrency || 'INR';
  const payBill = usePayBill();

  if (isLoading) return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-6 gap-3">{[1,2,3,4,5,6].map(i => <div key={i} className="h-28 rounded-2xl" style={{ background: 'var(--th-card)' }} />)}</div>
      <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-64 rounded-2xl" style={{ background: 'var(--th-card)' }} />)}</div>
    </div>
  );
  if (!data) return null;

  const { kpis, bills, subscriptions, unusedSubscriptions, emergencyFundPlanner, debtOverview, insurance, protectionOverview } = data;

  return (
    <div className="space-y-4">
      {/* ════════ KPI CARDS ════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <span className="text-xs font-medium" style={{ color: 'var(--th-text-secondary)' }}>🛡️ Total Protection Score</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-bold" style={{ color: 'var(--th-text)' }}>{kpis.protectionScore?.score || 0}</span>
            <span className="text-sm" style={{ color: 'var(--th-text-secondary)' }}>/ 100</span>
          </div>
          <span className="text-xs font-medium" style={{ color: getScoreColor(kpis.protectionScore?.score) }}>{kpis.protectionScore?.label}</span>
        </motion.div>
        <KPICard icon="🏦" label="Emergency Fund" value={kpis.emergencyFund?.current} subtext={`${kpis.emergencyFund?.months} months`} color="#10B981" currency={currency} index={1} />
        <KPICard icon="💳" label="Total Monthly Obligations" value={kpis.totalMonthlyObligations?.current} subtext={`${kpis.totalMonthlyObligations?.percentOfIncome}% of income`} color="#F59E0B" currency={currency} index={2} />
        <KPICard icon="🔁" label="Active Subscriptions" value={`${kpis.activeSubscriptions?.count || 0}`} subtext={`${formatCurrency(kpis.activeSubscriptions?.load || 0, currency, true)} / month`} color="#8B5CF6" index={3} />
        <KPICard icon="📉" label="Total Debt" value={kpis.totalDebt?.current} color="#EF4444" currency={currency} index={4} />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl p-3 flex flex-col items-center justify-center" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <span className="text-[10px] font-medium mb-1" style={{ color: 'var(--th-text-secondary)' }}>Risk Status</span>
          <ScoreGauge score={kpis.protectionScore?.score || 0} label={kpis.riskStatus?.label} size={64} strokeWidth={5} />
        </motion.div>
      </div>

      {/* ════════ MAIN + SIDEBAR ════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Bills + Subscriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upcoming Bills */}
            <CardShell title="Upcoming Bills" action={() => {}} actionLabel="View All Bills">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr style={{ color: 'var(--th-text-secondary)' }}><th className="text-left py-1.5 font-medium">Bill</th><th className="text-right py-1.5 font-medium">Amount</th><th className="text-left py-1.5 font-medium">Due Date</th><th className="text-left py-1.5 font-medium">Status</th></tr></thead>
                  <tbody>
                    {bills?.slice(0, 5).map((bill) => {
                      const st = STATUS_STYLES[bill.status] || STATUS_STYLES.UPCOMING;
                      return (
                        <tr key={bill.id} style={{ borderTop: '1px solid var(--th-border)' }}>
                          <td className="py-2 font-medium" style={{ color: 'var(--th-text)' }}>{bill.title}</td>
                          <td className="py-2 text-right font-semibold" style={{ color: 'var(--th-text)' }}>{formatCurrency(parseFloat(bill.amount), currency)}</td>
                          <td className="py-2" style={{ color: 'var(--th-text-secondary)' }}>{formatDateShort(bill.dueDate)}</td>
                          <td className="py-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                    {(!bills || bills.length === 0) && <tr><td colSpan={4} className="py-4 text-center" style={{ color: 'var(--th-text-secondary)' }}>No upcoming bills</td></tr>}
                  </tbody>
                </table>
              </div>
            </CardShell>

            {/* Subscription Detector */}
            <CardShell title="Subscription Detector" action={() => {}} actionLabel="View All Subscriptions">
              {unusedSubscriptions?.length > 0 && (
                <div className="mb-3 p-2.5 rounded-lg flex items-center justify-between" style={{ background: '#F59E0B10', border: '1px solid #F59E0B30' }}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" style={{ color: '#F59E0B' }} />
                    <span className="text-xs font-medium" style={{ color: '#F59E0B' }}>{unusedSubscriptions.length} subscriptions may be unused</span>
                  </div>
                  <button className="text-[10px] font-semibold" style={{ color: '#F59E0B' }}>Review Now</button>
                </div>
              )}
              <div className="space-y-2.5">
                {subscriptions?.slice(0, 5).map((sub) => {
                  const st = STATUS_STYLES[sub.status] || STATUS_STYLES.ACTIVE;
                  return (
                    <div key={sub.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background: `${st.color}15` }}>
                          {sub.isDetected ? '🔍' : '🔁'}
                        </span>
                        <span className="text-xs font-medium" style={{ color: 'var(--th-text)' }}>{sub.merchant}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold" style={{ color: 'var(--th-text)' }}>{formatCurrency(parseFloat(sub.amount), currency)}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardShell>
          </div>

          {/* Debt + Risk Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Debt Overview */}
            <CardShell title="Debt Overview" action={() => {}} actionLabel="View Debt Details">
              <div className="flex items-center gap-4">
                <div className="w-28 h-28 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={debtOverview?.debts?.filter(d => d.remaining > 0) || []} dataKey="remaining" nameKey="title"
                        cx="50%" cy="50%" innerRadius={32} outerRadius={50} paddingAngle={2} strokeWidth={0}>
                        {debtOverview?.debts?.filter(d => d.remaining > 0).map((_, i) => <Cell key={i} fill={DEBT_COLORS[i % DEBT_COLORS.length]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold" style={{ color: 'var(--th-text)' }}>{formatCurrency(debtOverview?.totalDebt || 0, currency, true)}</span>
                    <span className="text-[8px]" style={{ color: 'var(--th-text-secondary)' }}>Total Debt</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  {debtOverview?.debts?.slice(0, 4).map((d, i) => (
                    <div key={d.id} className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: DEBT_COLORS[i % DEBT_COLORS.length] }} />
                        <span style={{ color: 'var(--th-text)' }}>{d.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium" style={{ color: 'var(--th-text)' }}>{formatCurrency(d.remaining, currency, true)}</span>
                        <span style={{ color: 'var(--th-text-secondary)' }}>{d.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 pt-2 flex justify-between text-xs" style={{ borderTop: '1px solid var(--th-border)' }}>
                <span style={{ color: 'var(--th-text-secondary)' }}>Total Debt</span>
                <span className="font-bold" style={{ color: 'var(--th-text)' }}>{formatCurrency(debtOverview?.totalDebt || 0, currency)}</span>
              </div>
            </CardShell>

            {/* Insurance Tracker */}
            <CardShell title="Insurance Tracker" action={() => {}} actionLabel="View All Insurance">
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead><tr style={{ color: 'var(--th-text-secondary)' }}><th className="text-left py-1">Type</th><th className="text-left py-1">Provider</th><th className="text-left py-1">Expiry</th><th className="text-left py-1">Status</th></tr></thead>
                  <tbody>
                    {insurance?.slice(0, 4).map((ins) => {
                      const st = STATUS_STYLES[ins.status] || STATUS_STYLES.ACTIVE;
                      return (
                        <tr key={ins.id} style={{ borderTop: '1px solid var(--th-border)' }}>
                          <td className="py-2 capitalize font-medium" style={{ color: 'var(--th-text)' }}>{ins.type} Insurance</td>
                          <td className="py-2" style={{ color: 'var(--th-text-secondary)' }}>{ins.provider}</td>
                          <td className="py-2" style={{ color: 'var(--th-text-secondary)' }}>{formatDateShort(ins.expiryDate)}</td>
                          <td className="py-2"><span className="px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ background: st.bg, color: st.color }}>{st.label}</span></td>
                        </tr>
                      );
                    })}
                    {(!insurance || insurance.length === 0) && <tr><td colSpan={4} className="py-4 text-center" style={{ color: 'var(--th-text-secondary)' }}>No insurance policies tracked</td></tr>}
                  </tbody>
                </table>
              </div>
            </CardShell>
          </div>

          {/* Protection Overview (bottom stats bar) */}
          <CardShell title="Protection Overview">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Bills Paid On Time', value: `${protectionOverview?.billsPaidOnTime || 0}%`, sub: 'This Month', color: '#10B981' },
                { label: 'Subscription Load', value: formatCurrency(protectionOverview?.subscriptionLoadMonthly || 0, currency, true), sub: 'Per Month', color: '#F59E0B' },
                { label: 'Debt to Income Ratio', value: `${protectionOverview?.debtToIncomeRatio || 0}%`, sub: protectionOverview?.debtToIncomeRatio < 20 ? 'Healthy' : 'High', color: '#3B82F6' },
                { label: 'Emergency Readiness', value: `${protectionOverview?.emergencyReadiness || 0}%`, sub: 'On Track', color: '#22C55E' },
                { label: 'Insurance Coverage', value: protectionOverview?.insuranceCoverage || '0/4', sub: 'Active', color: '#8B5CF6' },
                { label: 'Overall Protection', value: `${protectionOverview?.overallProtection || 0}`, sub: '/100 Good', color: '#6366F1' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-[10px] font-medium mb-1" style={{ color: 'var(--th-text-secondary)' }}>{stat.label}</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--th-text)' }}>{stat.value}</p>
                  <p className="text-[10px]" style={{ color: stat.color }}>{stat.sub}</p>
                  <div className="w-full h-1.5 rounded-full mt-1.5 overflow-hidden" style={{ background: 'var(--th-bg)' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(parseInt(stat.value) || 0, 100)}%`, background: stat.color }} />
                  </div>
                </div>
              ))}
            </div>
          </CardShell>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="space-y-4">
          {/* Emergency Fund Planner */}
          <CardShell title="Emergency Fund Planner" action={() => {}} actionLabel="Edit Goal">
            <div className="flex justify-center mb-3">
              <ScoreGauge score={emergencyFundPlanner?.progress || 0} label={`${emergencyFundPlanner?.progress || 0}% On Track`} size={96} strokeWidth={8} />
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span style={{ color: 'var(--th-text-secondary)' }}>Target Amount</span><span className="font-semibold" style={{ color: 'var(--th-text)' }}>{formatCurrency(emergencyFundPlanner?.target || 0, currency)}</span></div>
              <div className="flex justify-between"><span style={{ color: 'var(--th-text-secondary)' }}>Current Amount</span><span className="font-semibold" style={{ color: 'var(--th-text)' }}>{formatCurrency(emergencyFundPlanner?.current || 0, currency)}</span></div>
              <div className="flex justify-between"><span style={{ color: 'var(--th-text-secondary)' }}>Monthly Target</span><span className="font-semibold" style={{ color: 'var(--th-text)' }}>{formatCurrency(emergencyFundPlanner?.monthlyTarget || 0, currency)}</span></div>
              <div className="flex justify-between"><span style={{ color: 'var(--th-text-secondary)' }}>Months of Expenses</span><span className="font-semibold" style={{ color: 'var(--th-text)' }}>{emergencyFundPlanner?.monthsCovered || 0} / 6</span></div>
            </div>
            <p className="text-xs mt-3 p-2 rounded-lg" style={{ background: '#10B98110', color: '#10B981' }}>
              {emergencyFundPlanner?.progress >= 70 ? '✅ Great job! You are well protected.' : '💡 Keep going to reach your full goal.'}
            </p>
          </CardShell>

          {/* Build More Protection CTA */}
          <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
            <h3 className="text-sm font-bold text-white mb-1">Build More Protection</h3>
            <p className="text-xs text-white/80 mb-3">Strengthen your financial safety net.</p>
            <div className="space-y-1.5 mb-3">
              {['Increase Emergency Fund', 'Clear High Interest Debt', 'Review Insurance Coverage', 'Reduce Subscription Load'].map(tip => (
                <div key={tip} className="flex items-center gap-2 text-xs text-white/90">
                  <Check className="w-3 h-3 flex-shrink-0" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
            <button className="w-full py-2 rounded-lg text-xs font-semibold bg-white text-amber-700">Take Action Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}
