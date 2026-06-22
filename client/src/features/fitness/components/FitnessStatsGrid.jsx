import { Card } from '@/design-system/components';
import { Dumbbell, Timer, Flame, TrendingUp } from 'lucide-react';
import { formatDuration } from '@/shared/utils/formatters';

export function FitnessStatsGrid({ stats }) {
  if (!stats) return null;

  const items = [
    { label: 'Total Workouts', value: stats.totalWorkouts, icon: Dumbbell, color: 'text-accent bg-accent-dim' },
    { label: 'This Week', value: stats.thisWeek, icon: TrendingUp, color: 'text-success bg-success-dim' },
    { label: 'Total Time', value: formatDuration(stats.totalMinutes), icon: Timer, color: 'text-warning bg-warning-dim' },
    { label: 'Avg/Session', value: formatDuration(stats.totalWorkouts ? Math.round(stats.totalMinutes / stats.totalWorkouts) : 0), icon: Flame, color: 'text-danger bg-danger-dim' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {items.map((item) => (
        <Card key={item.label} className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${item.color}`}>
            <item.icon className="w-4 h-4" />
          </div>
          <div>
            <p className="stat-number text-lg font-bold text-white">{item.value}</p>
            <p className="text-[10px] text-[var(--th-text-secondary)]">{item.label}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
