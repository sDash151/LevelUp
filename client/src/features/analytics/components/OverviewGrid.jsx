import { Card } from '@/design-system/components';
import { CheckCircle2, Target, Code2, Briefcase, Dumbbell, Wallet, FolderKanban, BookOpen } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/formatters';
import clsx from 'clsx';

const modules = [
  { key: 'habits', label: 'Habits', icon: CheckCircle2, color: 'text-accent bg-accent-dim', getValue: (o) => `${o.habits.completedToday}/${o.habits.total} today` },
  { key: 'goals', label: 'Goals', icon: Target, color: 'text-success bg-success-dim', getValue: (o) => `${o.goals.active} active` },
  { key: 'dsa', label: 'DSA', icon: Code2, color: 'text-warning bg-warning-dim', getValue: (o) => `${o.dsa.solved}/${o.dsa.total} solved` },
  { key: 'jobs', label: 'Jobs', icon: Briefcase, color: 'text-info bg-info-dim', getValue: (o) => `${o.jobs.active} in pipeline` },
  { key: 'projects', label: 'Projects', icon: FolderKanban, color: 'text-violet-400 bg-violet-400/10', getValue: (o) => `${o.projects.active} active` },
  { key: 'fitness', label: 'Fitness', icon: Dumbbell, color: 'text-danger bg-danger-dim', getValue: (o) => `${o.fitness.workoutsThisWeek} this week` },
  { key: 'finance', label: 'Savings', icon: Wallet, color: 'text-emerald-400 bg-emerald-400/10', getValue: (o) => formatCurrency(o.finance.savings) },
  { key: 'reflections', label: 'Reflections', icon: BookOpen, color: 'text-cyan-400 bg-cyan-400/10', getValue: (o) => `${o.reflections.thisMonth} this month` },
];

export function OverviewGrid({ overview }) {
  if (!overview) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {modules.map((m) => (
        <Card key={m.key} className="flex items-center gap-3">
          <div className={clsx('p-2 rounded-xl shrink-0', m.color)}>
            <m.icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="stat-number text-sm font-bold text-white truncate">{m.getValue(overview)}</p>
            <p className="text-[10px] text-zinc-500">{m.label}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
