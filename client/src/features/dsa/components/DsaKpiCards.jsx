import { motion } from 'motion/react';
import { CheckCircle2, Flame, Shield, CalendarClock, Star, TrendingUp } from 'lucide-react';

const cards = [
  { key: 'solved', label: 'Total Solved', sub: (s) => `Across ${s.pathCount} paths`, icon: CheckCircle2, color: '#10b981', getValue: (s) => s.totalSolved, type: 'sparkline' },
  { key: 'streak', label: 'Current Streak', sub: (s) => `Best: ${s.bestStreak} days`, icon: Flame, color: '#f97316', getValue: (s) => `${s.streak}`, unit: 'days', type: 'sparkline' },
  { key: 'readiness', label: 'Interview Readiness', sub: () => 'Strong Progress', icon: Shield, color: '#f59e0b', getValue: (s) => `${s.readinessPct}%`, type: 'arc' },
  { key: 'revision', label: 'Revision Due', sub: () => 'Priority today', icon: CalendarClock, color: '#ef4444', getValue: (s) => s.revisionDue, alert: true },
  { key: 'patterns', label: 'Pattern Mastery', sub: () => 'Patterns Unlocked', icon: Star, color: '#eab308', getValue: (s) => `${s.patternsUnlocked} / ${s.totalPatterns}`, type: 'ring' },
];

export function DsaKpiCards({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const value = card.getValue(stats);
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}
          >
            {/* Left Icon */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: `${card.color}10`, border: `1px solid ${card.color}30` }}>
              <Icon className="w-5 h-5" style={{ color: card.color }} />
            </div>

            {/* Right Content */}
            <div className="flex-1 flex flex-col min-w-0">
              <p className="text-[11px] font-medium truncate" style={{ color: 'var(--th-text-secondary)' }}>{card.label}</p>
              
              <div className="flex items-center justify-between mt-0.5 mb-0.5">
                <p className="text-[22px] font-bold leading-none whitespace-nowrap tracking-tight" style={{ color: 'var(--th-text)' }}>
                  {value}
                  {card.unit && <span className="text-xs font-normal ml-1" style={{ color: 'var(--th-text-secondary)' }}>{card.unit}</span>}
                </p>

                <div className="flex shrink-0 items-center justify-center w-8 h-8">
                  {card.alert && stats.revisionDue > 0 ? (
                    <div className="w-4 h-4 rounded-full flex items-center justify-center bg-red-500/20 text-red-500 text-[10px] font-bold">!</div>
                  ) : card.type === 'sparkline' ? (
                    <svg width="32" height="12" viewBox="0 0 32 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 8C4.5 8 6 11 9.5 11C13 11 15.5 3 19 3C22.5 3 25 6 28.5 6C29.5 6 30.5 4.5 31 3" stroke={card.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : card.type === 'arc' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="-rotate-90">
                      <circle cx="12" cy="12" r="10" stroke="var(--th-border)" strokeWidth="3" />
                      <circle cx="12" cy="12" r="10" stroke={card.color} strokeWidth="3" strokeDasharray="62.8" strokeDashoffset="18" strokeLinecap="round" />
                    </svg>
                  ) : card.type === 'ring' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="-rotate-90">
                      <circle cx="12" cy="12" r="10" stroke="var(--th-border)" strokeWidth="3" />
                      <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="3" strokeDasharray="62.8" strokeDashoffset="30" strokeLinecap="round" />
                    </svg>
                  ) : null}
                </div>
              </div>

              <p className="text-[10px] truncate" style={{ color: 'var(--th-text-secondary)' }}>{card.sub(stats)}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
