import { Trophy, Clock, Dumbbell, Flame } from 'lucide-react';

export default function PerformanceHighlights({ data }) {
  if (!data) return null;
  const d = data;

  const items = [
    { label: 'Heaviest Lift', icon: Trophy, title: d.heaviestLift?.label, value: d.heaviestLift?.value, date: d.heaviestLift?.date, color: '#F59E0B' },
    { label: 'Longest Workout', icon: Clock, title: d.longestWorkout?.label, value: d.longestWorkout?.value, date: d.longestWorkout?.date, color: '#3B82F6' },
    { label: 'Best Volume Day', icon: Dumbbell, title: '', value: d.bestVolumeDay?.value, date: d.bestVolumeDay?.date, color: '#10B981' },
    { label: 'Most Calories Burned', icon: Flame, title: '', value: d.highestCalorieBurn?.value, date: d.highestCalorieBurn?.date, color: '#EF4444' },
  ];

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  return (
    <div className="rounded-2xl p-5 h-full flex flex-col" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Performance Highlights</h3>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
          This Month <span className="text-[8px]">▼</span>
        </div>
      </div>
      <div className="space-y-4 mt-2 flex-1">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15` }}>
                <Icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold" style={{ color: 'var(--th-text-secondary)' }}>{item.label}</p>
                <p className="text-[11px] font-bold truncate mt-0.5" style={{ color: 'var(--th-text)' }}>{item.title ? `${item.title} - ` : ''}{item.value}</p>
              </div>
              <span className="text-[10px] flex-shrink-0 font-medium text-gray-400">{formatDate(item.date)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
