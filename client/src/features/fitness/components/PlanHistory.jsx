import { motion } from 'motion/react';
import { History, Dumbbell, Apple, Moon, GitMerge, CalendarDays } from 'lucide-react';
import { usePlanHistory } from '../hooks/useFitness';

export default function PlanHistory() {
  const { data, isLoading } = usePlanHistory();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <span className="text-sm font-medium text-[var(--th-text-secondary)]">Loading history...</span>
      </div>
    );
  }

  if (!data || (!data.workouts?.length && !data.diets?.length && !data.recoveries?.length)) {
    return (
      <div className="text-center p-8 bg-[var(--th-card)] border border-[var(--th-border)] rounded-2xl">
        <History className="w-10 h-10 mx-auto mb-3 text-[var(--th-text-secondary)] opacity-50" />
        <h3 className="font-bold text-[var(--th-text)]">No Plan History</h3>
        <p className="text-sm text-[var(--th-text-secondary)] mt-1">
          Your inactive plans will appear here once you generate and activate new ones.
        </p>
      </div>
    );
  }

  const renderPlanList = (plans, type, icon, color) => {
    if (!plans || plans.length === 0) return null;
    const Icon = icon;

    return (
      <div className="space-y-4 mb-8">
        <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-2" style={{ color: 'var(--th-text-secondary)' }}>
          <Icon className="w-4 h-4" /> {type} History
        </h4>
        <div className="relative border-l-2 ml-3 pl-6 pb-2 space-y-6" style={{ borderColor: 'var(--th-border)' }}>
          {plans.map((plan, idx) => (
            <motion.div key={plan.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="relative">
              <div className="absolute -left-[31px] w-4 h-4 rounded-full border-[3px] bg-[var(--th-bg)]" style={{ borderColor: color }} />
              
              <div className="bg-[var(--th-card)] border rounded-2xl p-4 shadow-sm" style={{ borderColor: 'var(--th-border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2 py-1 rounded-md" style={{ background: `${color}20`, color }}>
                      v{plan.version || 1}
                    </span>
                    <h5 className="font-bold text-[var(--th-text)]">{plan.name || plan.goal || 'Custom Plan'}</h5>
                  </div>
                  <span className="text-[10px] font-medium text-[var(--th-text-secondary)] flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    {new Date(plan.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-[var(--th-text-secondary)] mb-3">
                  {plan.parentPlanId && (
                    <div className="flex items-center gap-1">
                      <GitMerge className="w-3 h-3" /> Evolved from v{(plan.version || 1) - 1}
                    </div>
                  )}
                  {plan.phase && <span>• {plan.phase} phase</span>}
                  {plan.caloriesTarget && <span>• {plan.caloriesTarget} kcal</span>}
                  {plan.sleepTarget && <span>• {plan.sleepTarget}h Sleep</span>}
                </div>

                <div className="text-xs font-medium px-3 py-1.5 rounded-lg inline-block border border-dashed" style={{ background: 'var(--th-bg)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }}>
                  Deactivated — Replaced by newer plan
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-bold text-[var(--th-text)] mb-6">Routine Evolution</h3>
      {renderPlanList(data.workouts, 'Workout', Dumbbell, '#6366f1')}
      {renderPlanList(data.diets, 'Diet', Apple, '#10b981')}
      {renderPlanList(data.recoveries, 'Recovery', Moon, '#8b5cf6')}
    </div>
  );
}
