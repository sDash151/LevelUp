import { motion } from 'motion/react';
import { ChevronRight, Sparkles, ArrowRight, Check, AlertTriangle, Zap } from 'lucide-react';
import { useIntelligenceData, useCFOInsight, useWeeklyChallenges } from '../hooks/useFinance';
import { useUser } from '@/features/auth/hooks/useAuth';
import KPICard from './KPICard';
import ScoreGauge from './ScoreGauge';
import {
  formatCurrency, getScoreColor, abbreviateNumber, STREAK_CONFIG,
  CATEGORY_ICONS,
} from '../utils';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

function CardShell({ title, subtitle, action, actionLabel, children, className = '' }) {
  return (
    <div className={`rounded-2xl p-4 ${className}`} style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-3">
          <div>
            {title && <h3 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>{title}</h3>}
            {subtitle && <p className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>{subtitle}</p>}
          </div>
          {action && <button onClick={action} className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: 'var(--th-primary)' }}>{actionLabel || 'View All'} <ChevronRight className="w-3 h-3" /></button>}
        </div>
      )}
      {children}
    </div>
  );
}

const REVIEW_COLORS = { needs: '#3B82F6', wants: '#F59E0B', savingsInvest: '#10B981', waste: '#EF4444' };
const IMPACT_STYLES = { high: { bg: '#EF444420', color: '#EF4444' }, medium: { bg: '#F59E0B20', color: '#F59E0B' }, low: { bg: '#10B98120', color: '#10B981' } };

export default function IntelligenceTab({ onOpenChat }) {
  const { data, isLoading } = useIntelligenceData();
  const { data: cfoInsight, isLoading: cfoLoading } = useCFOInsight();
  const { data: weeklyChallenges, isLoading: challengesLoading } = useWeeklyChallenges();
  const { data: user } = useUser();
  const currency = user?.baseCurrency || 'INR';

  if (isLoading) return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-5 gap-4">{[1,2,3,4,5].map(i => <div key={i} className="h-28 rounded-2xl" style={{ background: 'var(--th-card)' }} />)}</div>
      <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-64 rounded-2xl" style={{ background: 'var(--th-card)' }} />)}</div>
    </div>
  );
  if (!data) return null;

  const { kpis, spendingReview, challenges, streaks, upgradeScore, monthlyReflection, lifeROI } = data;

  return (
    <div className="space-y-4">
      {/* ════════ KPI CARDS ════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <span className="text-xs font-medium" style={{ color: 'var(--th-text-secondary)' }}>🧠 Financial Health Score</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-bold" style={{ color: 'var(--th-text)' }}>{kpis.financialHealthScore?.score || 0}</span>
            <span className="text-sm" style={{ color: 'var(--th-text-secondary)' }}>/ 100</span>
          </div>
          <span className="text-xs font-medium" style={{ color: getScoreColor(kpis.financialHealthScore?.score) }}>{kpis.financialHealthScore?.label}</span>
        </motion.div>
        <KPICard icon="💡" label="Monthly Optimisation" value={kpis.monthlyOptimisation?.current} subtext="Potential Savings" change={kpis.monthlyOptimisation?.change} color="#10B981" currency={currency} index={1} />
        <KPICard icon="🚀" label="Wealth Growth Potential" value={kpis.wealthGrowthPotential?.amount} subtext={`In ${kpis.wealthGrowthPotential?.period}`} color="#3B82F6" currency={currency} index={2} />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl p-4 flex flex-col justify-center" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <span className="text-xs font-medium" style={{ color: 'var(--th-text-secondary)' }}>💪 Money Discipline</span>
          <p className="text-xl font-bold mt-1" style={{ color: 'var(--th-text)' }}>{kpis.moneyDiscipline?.label || 'N/A'}</p>
          <p className="text-[10px]" style={{ color: '#10B981' }}>Keep it up!</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-3 flex flex-col items-center justify-center" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <span className="text-[10px] font-medium mb-1" style={{ color: 'var(--th-text-secondary)' }}>AI Confidence</span>
          <ScoreGauge score={kpis.aiConfidence?.score || 0} label="High" size={64} strokeWidth={5} />
        </motion.div>
      </div>

      {/* ════════ MAIN + SIDEBAR ════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Spending Review + Top Expense Leaks + Savings Opportunities */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Spending Review — Donut */}
            <CardShell title="Spending Review">
              <div className="flex items-center gap-3">
                <div className="w-28 h-28 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[
                        { name: 'Needs', value: spendingReview?.needs?.amount || 0 },
                        { name: 'Wants', value: spendingReview?.wants?.amount || 0 },
                        { name: 'Savings', value: spendingReview?.savingsInvest?.amount || 0 },
                        { name: 'Waste', value: spendingReview?.waste?.amount || 0 },
                      ].filter(d => d.value > 0)} dataKey="value" cx="50%" cy="50%" innerRadius={32} outerRadius={50} paddingAngle={2} strokeWidth={0}>
                        <Cell fill={REVIEW_COLORS.needs} />
                        <Cell fill={REVIEW_COLORS.wants} />
                        <Cell fill={REVIEW_COLORS.savingsInvest} />
                        <Cell fill={REVIEW_COLORS.waste} />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold" style={{ color: 'var(--th-text)' }}>{formatCurrency(spendingReview?.total || 0, currency, true)}</span>
                    <span className="text-[8px]" style={{ color: 'var(--th-text-secondary)' }}>Total Spent</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  {[
                    { label: 'Needs', data: spendingReview?.needs, color: REVIEW_COLORS.needs },
                    { label: 'Wants', data: spendingReview?.wants, color: REVIEW_COLORS.wants },
                    { label: 'Savings & Invest.', data: spendingReview?.savingsInvest, color: REVIEW_COLORS.savingsInvest },
                    { label: 'Waste', data: spendingReview?.waste, color: REVIEW_COLORS.waste },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between text-[10px] gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                        <span style={{ color: 'var(--th-text)' }}>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium" style={{ color: 'var(--th-text)' }}>{formatCurrency(item.data?.amount || 0, currency, true)}</span>
                        <span style={{ color: 'var(--th-text-secondary)' }}>{item.data?.percentage || 0}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {spendingReview?.waste?.amount > 0 && (
                <p className="text-[10px] mt-2 p-2 rounded-lg" style={{ background: '#EF444410', color: '#EF4444' }}>
                  ⚠️ You spent {formatCurrency(spendingReview.waste.amount, currency)} on unnecessary expenses.
                  <button className="ml-2 font-semibold hover:underline">Review Now</button>
                </p>
              )}
            </CardShell>

            {/* Top Expense Leaks */}
            <CardShell title="Top Expense Leaks">
              <div className="space-y-3">
                {(data.spendingReview?.waste?.amount > 0 ? [
                  { category: 'Food Delivery', amount: spendingReview.waste.amount * 0.4, percentage: 32 },
                  { category: 'Subscriptions', amount: spendingReview.waste.amount * 0.3, percentage: 25 },
                  { category: 'Impulse Shopping', amount: spendingReview.waste.amount * 0.3, percentage: 18 },
                ] : []).map((leak, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{CATEGORY_ICONS[leak.category] || '💸'}</span>
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--th-text)' }}>{leak.category}</p>
                        <p className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>{leak.percentage}% of total leaks</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: '#EF4444' }}>{formatCurrency(leak.amount, currency)}</span>
                  </div>
                ))}
                {spendingReview?.waste?.amount === 0 && (
                  <p className="text-xs text-center py-4" style={{ color: 'var(--th-text-secondary)' }}>No leaks! 🎉</p>
                )}
                <div className="pt-2 mt-1 flex justify-between" style={{ borderTop: '1px solid var(--th-border)' }}>
                  <span className="text-xs" style={{ color: 'var(--th-text-secondary)' }}>Total Leaks</span>
                  <span className="text-sm font-bold" style={{ color: '#EF4444' }}>{formatCurrency(spendingReview?.waste?.amount || 0, currency)}</span>
                </div>
              </div>
            </CardShell>

            {/* Savings Opportunities */}
            <CardShell title="Savings Opportunities">
              <div className="space-y-2.5">
                {(challenges || []).slice(0, 3).map((c, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-sm mt-0.5">💡</span>
                    <div className="flex-1">
                      <p className="text-xs font-medium" style={{ color: 'var(--th-text)' }}>{c.title}</p>
                      <p className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>{c.description}</p>
                    </div>
                  </div>
                ))}
                {(!challenges || challenges.length === 0) && (
                  <p className="text-xs text-center py-3" style={{ color: 'var(--th-text-secondary)' }}>Insights loading...</p>
                )}
              </div>
            </CardShell>
          </div>

          {/* AI Wealth Plan */}
          <CardShell title="AI Wealth Plan" subtitle="Personalized for You">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[
                { icon: '📊', title: 'Shift spending', desc: 'From Dining to Emergency Fund', impact: 'high' },
                { icon: '🔁', title: 'Reduce 2 Subscriptions', desc: "You don't use regularly", impact: 'high' },
                { icon: '📚', title: 'Increase Skill Investment', desc: 'by ₹2,000 this month', impact: 'medium' },
                { icon: '💰', title: 'Automate Savings', desc: 'Save ₹5,000 every month', impact: 'high' },
              ].map((action, i) => {
                const impactStyle = IMPACT_STYLES[action.impact] || IMPACT_STYLES.medium;
                return (
                  <div key={i} className="rounded-xl p-3" style={{ background: 'var(--th-bg)', border: '1px solid var(--th-border)' }}>
                    <span className="text-lg">{action.icon}</span>
                    <p className="text-xs font-semibold mt-1" style={{ color: 'var(--th-text)' }}>{action.title}</p>
                    <p className="text-[10px] mb-2" style={{ color: 'var(--th-text-secondary)' }}>{action.desc}</p>
                    <span className="px-2 py-0.5 rounded text-[9px] font-medium capitalize" style={{ background: impactStyle.bg, color: impactStyle.color }}>
                      {action.impact} Impact
                    </span>
                    <button className="w-full mt-2 py-1.5 rounded-lg text-[10px] font-semibold" style={{ background: 'var(--th-card)', color: 'var(--th-text)', border: '1px solid var(--th-border)' }}>
                      Do Now
                    </button>
                  </div>
                );
              })}
            </div>
          </CardShell>

          {/* Bottom: Streaks + XP + Life ROI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardShell title="Money Streaks" action={() => {}}>
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

            <CardShell title="Financial XP">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <span className="text-2xl font-bold" style={{ color: 'var(--th-text)' }}>{upgradeScore?.score || 0}</span>
                  <span className="text-xs ml-1" style={{ color: 'var(--th-text-secondary)' }}>/ 1000 XP</span>
                  <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white" style={{ background: '#8B5CF6' }}>Level {upgradeScore?.level || 1}</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--th-bg)' }}>
                <div className="h-full rounded-full" style={{ width: `${Math.min((upgradeScore?.score || 0) / 10, 100)}%`, background: 'linear-gradient(90deg, #8B5CF6, #6366F1)' }} />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                <div><p className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>This Month</p><p className="text-xs font-semibold" style={{ color: 'var(--th-text)' }}>+120 XP</p></div>
                <div><p className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>Challenges</p><p className="text-xs font-semibold" style={{ color: 'var(--th-text)' }}>+80 XP</p></div>
                <div><p className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>Goals</p><p className="text-xs font-semibold" style={{ color: 'var(--th-text)' }}>+150 XP</p></div>
              </div>
            </CardShell>

            <CardShell title="Life ROI Tracker" action={() => {}} actionLabel="View Full Report">
              {lifeROI ? (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'health', label: 'Health', icon: '💪', color: '#10B981' },
                    { key: 'learning', label: 'Learning', icon: '📚', color: '#8B5CF6' },
                    { key: 'career', label: 'Career', icon: '💼', color: '#3B82F6' },
                    { key: 'tools', label: 'Tools', icon: '🛠️', color: '#F59E0B' },
                  ].map(({ key, label, icon, color }) => (
                    <div key={key} className="text-center p-2 rounded-lg" style={{ background: `${color}08` }}>
                      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
                      <p className="text-xs font-bold mt-1" style={{ color: 'var(--th-text)' }}>{formatCurrency(lifeROI[key]?.invested || 0, currency, true)}</p>
                      <p className="text-[9px]" style={{ color: 'var(--th-text-secondary)' }}>Invested</p>
                      {lifeROI[key]?.outcomes?.[0] && (
                        <p className="text-[9px] mt-0.5 truncate" style={{ color: 'var(--th-text-secondary)' }}>{lifeROI[key].outcomes[0]}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-center py-4" style={{ color: 'var(--th-text-secondary)' }}>Track spending across modules to see Life ROI</p>
              )}
            </CardShell>
          </div>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="space-y-4">
          {/* AI CFO Insight */}
          <CardShell title="AI CFO Insight">
            {cfoLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 rounded" style={{ background: 'var(--th-bg)', width: '80%' }} />
                <div className="h-3 rounded" style={{ background: 'var(--th-bg)', width: '60%' }} />
                <div className="h-3 rounded" style={{ background: 'var(--th-bg)', width: '70%' }} />
              </div>
            ) : cfoInsight ? (
              <div>
                <div className="flex items-start gap-2 mb-2">
                  <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#F59E0B' }} />
                  <p className="text-xs font-semibold" style={{ color: 'var(--th-text)' }}>
                    {typeof cfoInsight === 'string' ? "You're on the right track! 🚀" : cfoInsight?.title || "AI Analysis Ready"}
                  </p>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--th-text-secondary)' }}>
                  {typeof cfoInsight === 'string' ? cfoInsight : cfoInsight?.summary || 'Focus on reducing expenses and increasing savings.'}
                </p>
                <button onClick={onOpenChat} className="mt-3 text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: 'var(--th-primary)' }}>
                  Chat with AI CFO <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 py-2">
                <Sparkles className="w-4 h-4" style={{ color: '#F59E0B' }} />
                <p className="text-xs" style={{ color: 'var(--th-text-secondary)' }}>Log transactions to unlock AI insights.</p>
              </div>
            )}
          </CardShell>

          {/* Weekly Challenges */}
          <CardShell title="Weekly Challenges" action={() => {}} actionLabel="View All Challenges">
            <div className="space-y-3">
              {(weeklyChallenges || []).slice(0, 3).map((c, i) => (
                <div key={c.id || i} className="p-2.5 rounded-lg" style={{ background: 'var(--th-bg)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold" style={{ color: 'var(--th-text)' }}>{c.title}</span>
                    <span className="text-[10px] font-medium" style={{ color: '#F59E0B' }}>+{c.xpReward || 50} XP</span>
                  </div>
                  <p className="text-[10px] mb-1.5" style={{ color: 'var(--th-text-secondary)' }}>{c.description}</p>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--th-border)' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(((c.currentProgress || 0) / (c.target || 1)) * 100, 100)}%`, background: '#10B981' }} />
                  </div>
                  <span className="text-[9px] mt-0.5 block" style={{ color: 'var(--th-text-secondary)' }}>{c.currentProgress || 0} / {c.target || 1} completed</span>
                </div>
              ))}
              {(!weeklyChallenges || weeklyChallenges.length === 0) && !challengesLoading && (
                <p className="text-xs text-center py-3" style={{ color: 'var(--th-text-secondary)' }}>Challenges generating...</p>
              )}
            </div>
          </CardShell>

          {/* Monthly Reflection */}
          <CardShell title="Monthly Reflection">
            {monthlyReflection ? (
              <div className="space-y-2">
                {[
                  { q: 'Where did most of my money go?', mood: 'High' },
                  { q: 'What can I reduce next month?', mood: 'Medium' },
                  { q: 'What was worth the spending?', mood: 'Low' },
                ].map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-sm mt-0.5">📝</span>
                    <div className="flex-1">
                      <p className="text-xs" style={{ color: 'var(--th-text)' }}>{r.q}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-medium" style={{
                      background: r.mood === 'High' ? '#EF444420' : r.mood === 'Medium' ? '#F59E0B20' : '#10B98120',
                      color: r.mood === 'High' ? '#EF4444' : r.mood === 'Medium' ? '#F59E0B' : '#10B981'
                    }}>{r.mood}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-xs" style={{ color: 'var(--th-text-secondary)' }}>Reflect on your month</p>
                <button className="mt-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: '#F59E0B' }}>Start Reflection</button>
              </div>
            )}
          </CardShell>

          {/* AI Recommendations */}
          <CardShell title="AI Recommendations" action={() => {}} actionLabel="View All">
            <div className="space-y-2.5">
              {[
                { text: 'Keep your savings rate above 30%', sub: 'For financial freedom', impact: 'high' },
                { text: 'Build 6 months emergency fund', sub: 'For financial security', impact: 'high' },
                { text: 'Invest in low-cost index funds', sub: 'For long-term wealth', impact: 'medium' },
              ].map((rec, i) => {
                const impactStyle = IMPACT_STYLES[rec.impact];
                return (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: impactStyle.bg }}>
                      <Check className="w-3 h-3" style={{ color: impactStyle.color }} />
                    </span>
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--th-text)' }}>{rec.text}</p>
                      <p className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>{rec.sub}</p>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium capitalize flex-shrink-0" style={{ background: impactStyle.bg, color: impactStyle.color }}>{rec.impact}</span>
                  </div>
                );
              })}
            </div>
          </CardShell>
        </div>
      </div>
    </div>
  );
}
