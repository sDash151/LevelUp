import { motion } from 'motion/react';
import { Dumbbell, Bed, Check, Clock, Coffee, Shirt, Footprints, Flame, Weight } from 'lucide-react';

const STATUS_STYLES = {
  completed: { color: '#10B981', bg: 'rgba(16,185,129,0.15)', label: 'Completed' },
  today: { color: '#E8A23A', bg: 'rgba(232,162,58,0.15)', label: 'Today' },
  upcoming: { color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)', label: 'Upcoming' },
  missed: { color: '#EF4444', bg: 'rgba(239,68,68,0.15)', label: 'Missed' },
  rest: { color: '#9CA3AF', bg: 'rgba(156,163,175,0.15)', label: 'Rest' },
};

const getWorkoutStyle = (name, isRest) => {
  if (isRest) return { icon: Coffee, color: '#10B981', bg: 'rgba(16,185,129,0.15)' };
  const n = (name || '').toLowerCase();
  if (n.includes('push')) return { icon: Dumbbell, color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' };
  if (n.includes('pull')) return { icon: Dumbbell, color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' };
  if (n.includes('leg') || n.includes('lower')) return { icon: Footprints, color: '#F97316', bg: 'rgba(249,115,22,0.15)' };
  if (n.includes('upper') || n.includes('chest') || n.includes('back')) return { icon: Shirt, color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' };
  return { icon: Flame, color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' };
};

export default function WeekPlanCards({ weekPlan = [] }) {
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>This Week's Plan</h3>
        <div className="flex gap-2">
          <button className="text-[10px] font-bold px-3 py-1.5 rounded-lg" style={{ background: 'var(--th-highlight)', color: 'var(--th-text)' }}>Week View</button>
          <button className="text-[10px] font-bold px-3 py-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">Calendar View</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {weekPlan.map((day, i) => {
          const statusStyle = STATUS_STYLES[day.status] || STATUS_STYLES.upcoming;
          const workoutStyle = getWorkoutStyle(day.name, day.isRest);
          const Icon = workoutStyle.icon;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl p-3 flex flex-col items-center border"
              style={{ background: 'var(--th-bg)', borderColor: 'var(--th-border)' }}
            >
              <p className="text-[10px] font-medium mb-1.5" style={{ color: 'var(--th-text-secondary)' }}>{dayLabels[i]}</p>
              <p className="text-xs font-bold mb-3 text-center truncate w-full" style={{ color: 'var(--th-text)' }}>{day.name || 'Rest Day'}</p>
              
              <div className="w-8 h-8 rounded-full flex items-center justify-center mb-4" style={{ background: workoutStyle.bg }}>
                <Icon className="w-4 h-4" style={{ color: workoutStyle.color }} />
              </div>

              <div className="px-2.5 py-1 rounded-md mb-3" style={{ background: statusStyle.bg }}>
                <p className="text-[9px] font-bold" style={{ color: statusStyle.color }}>{statusStyle.label}</p>
              </div>

              {!day.isRest ? (
                <div className="text-[9px] w-full mt-auto space-y-1.5" style={{ color: 'var(--th-text-dim)' }}>
                  {(day.duration || day.estimatedDuration) && (
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{day.status === 'completed' ? '' : 'Est. '}{day.duration || day.estimatedDuration} mins</span>
                    </div>
                  )}
                  {(day.totalVolume || day.estimatedVolume) && (
                    <div className="flex items-center justify-center gap-1">
                      <Weight className="w-3 h-3" />
                      <span>{day.status === 'completed' ? '' : 'Est. '}{(day.totalVolume || day.estimatedVolume).toLocaleString()} kg</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[9px] w-full mt-auto text-center" style={{ color: 'var(--th-text-dim)' }}>
                  <p>Rest & Recover</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
