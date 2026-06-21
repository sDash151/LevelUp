import { TrendingUp, Shield, Calendar, Dumbbell, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';

export default function PlanKpiCards({ plan }) {
  const cards = [
    { label: 'Plan Adherence', value: `${plan.adherence || 0}%`, sub: 'This Week', icon: TrendingUp, color: '#10B981', barPct: plan.adherence || 0 },
    { label: 'Current Phase', value: (plan.phase || 'N/A').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), sub: `Week ${plan.weekNumber || 1} of ${plan.totalWeeks || 8}`, icon: Shield, color: '#8B5CF6' },
    { label: 'Sessions This Week', value: `${plan.sessionsThisWeek?.completed || 0} / ${plan.sessionsThisWeek?.target || 5}`, sub: 'Sessions Completed', icon: Calendar, color: '#3B82F6' },
    { label: 'Next Workout', value: plan.nextWorkout?.type || 'Rest Day', sub: plan.nextWorkout ? `${plan.nextWorkout.day?.charAt(0).toUpperCase() + plan.nextWorkout.day?.slice(1)}` : 'Enjoy your rest', icon: Dumbbell, color: '#E8A23A' },
    { label: 'Weekly Volume Goal', value: `${((plan.weeklyVolumeGoal?.current || 0) / 1000).toFixed(1)}k kg`, sub: `${((plan.weeklyVolumeGoal?.current || 0) / 1000).toFixed(1)} / ${((plan.weeklyVolumeGoal?.target || 16000) / 1000).toFixed(0)}k kg`, icon: BarChart3, color: '#EF4444', barPct: plan.weeklyVolumeGoal?.target > 0 ? Math.round(((plan.weeklyVolumeGoal?.current || 0) / plan.weeklyVolumeGoal.target) * 100) : 0 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium" style={{ color: 'var(--th-text-secondary)' }}>{card.label}</span>
              <Icon className="w-4 h-4" style={{ color: card.color }} />
            </div>
            <p className="text-lg font-bold mb-0.5" style={{ color: 'var(--th-text)' }}>{card.value}</p>
            <p className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>{card.sub}</p>
            {card.barPct !== undefined && (
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, card.barPct)}%`, background: card.color }} />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
