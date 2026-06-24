import { Dumbbell, Clock, Target, Activity, Footprints, Shirt, Flame, Coffee } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const getWorkoutStyle = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('push')) return { icon: Dumbbell, color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' };
  if (n.includes('pull')) return { icon: Dumbbell, color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' };
  if (n.includes('leg') || n.includes('lower')) return { icon: Footprints, color: '#F97316', bg: 'rgba(249,115,22,0.15)' };
  if (n.includes('upper') || n.includes('chest') || n.includes('back')) return { icon: Shirt, color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' };
  return { icon: Flame, color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' };
};

export default function TodayWorkoutCard({ workout }) {
  const navigate = useNavigate();

  if (!workout || workout.isRest) return (
    <div className="rounded-2xl p-6" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--th-text)' }}>Today's Workout</h3>
      <p className="text-sm flex items-center gap-2" style={{ color: 'var(--th-text-secondary)' }}><Coffee className="w-4 h-4 text-[#10B981]"/> Rest Day — Recovery is part of the process</p>
    </div>
  );

  const exercises = workout.exercises || [];
  const style = getWorkoutStyle(workout.name);
  const Icon = style.icon;

  const duration = workout.duration || workout.estimatedDuration || 55;
  const volume = workout.totalVolume || workout.estimatedVolume || 0;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      {/* Header Section */}
      <div className="p-6 pb-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-4 md:gap-0">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-2xl flex flex-shrink-0 items-center justify-center" style={{ background: style.bg }}>
              <Icon className="w-7 h-7" style={{ color: style.color }} />
            </div>
            <div className="mt-0.5">
              <p className="text-[11px] font-semibold mb-0.5" style={{ color: 'var(--th-text-secondary)' }}>Today's Workout</p>
              <h2 className="text-xl font-bold" style={{ color: 'var(--th-text)' }}>{workout.name || workout.type}</h2>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-md self-start md:self-auto" style={{ background: 'rgba(139,92,246,0.1)' }}>
            <span className="text-[10px] font-bold" style={{ color: '#8B5CF6' }}>
              {workout.status === 'completed' ? 'Completed' : 'Scheduled for Tomorrow'}
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-0">
          <div className="flex flex-wrap md:flex-nowrap gap-6 md:gap-10">
            {workout.muscleGroups?.length > 0 && (
              <div>
                <p className="text-[10px] font-medium mb-1.5" style={{ color: 'var(--th-text-secondary)' }}>Focus</p>
                <div className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" style={{ color: '#F97316' }} />
                  <p className="text-xs font-semibold" style={{ color: 'var(--th-text-dim)' }}>
                    {(workout.muscleGroups || []).map(g => g.charAt(0).toUpperCase() + g.slice(1).replace('_', ' ')).join(', ')}
                  </p>
                </div>
              </div>
            )}
            <div>
              <p className="text-[10px] font-medium mb-1.5" style={{ color: 'var(--th-text-secondary)' }}>Duration</p>
              <p className="text-xs font-bold" style={{ color: 'var(--th-text)' }}>{workout.status !== 'completed' ? `${duration-5}-${duration+5}` : duration} mins</p>
            </div>
            <div>
              <p className="text-[10px] font-medium mb-1.5" style={{ color: 'var(--th-text-secondary)' }}>{workout.status !== 'completed' ? 'Est. ' : ''}Volume</p>
              <p className="text-xs font-bold" style={{ color: 'var(--th-text)' }}>{volume.toLocaleString()}{workout.status !== 'completed' ? '+' : ''} kg</p>
            </div>
          </div>

          <button 
            onClick={() => {
              toast.dismiss();
              navigate('/fitness?tab=plan');
            }}
            className="w-full md:w-auto px-5 py-3 md:py-2.5 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 cursor-pointer text-center shadow-md active:scale-95" 
            style={{ background: '#8B5CF6' }}>
            Log from Plan
          </button>
        </div>
      </div>

      {/* Key Exercises */}
      {exercises.length > 0 && (
        <div className="p-6 pt-5" style={{ borderTop: '1px solid var(--th-border)' }}>
          <p className="text-xs font-bold mb-4" style={{ color: 'var(--th-text)' }}>Key Exercises</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {exercises.slice(0, 6).map((ex, i) => {
              let emoji = '🏋️';
              const name = (ex.name || '').toLowerCase();
              if (name.includes('squat') || name.includes('leg press') || name.includes('calf') || name.includes('extension')) emoji = '🦵';
              else if (name.includes('pull up') || name.includes('pull-up')) emoji = '🧗';
              else if (name.includes('row')) emoji = '🚣';
              else if (name.includes('bicep') || name.includes('curl')) emoji = '💪';
              else if (name.includes('tricep') || name.includes('pushdown')) emoji = '🦾';
              else if (name.includes('deadlift')) emoji = '🏋️‍♂️';
              else if (name.includes('bench press') || name.includes('chest')) emoji = '🛏️';

              return (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl border" style={{ background: 'transparent', borderColor: 'var(--th-border)' }}>
                  <div className="w-6 h-6 flex flex-shrink-0 items-center justify-center text-lg">
                     {emoji}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold" style={{ color: 'var(--th-text)' }}>{ex.name}</p>
                    <p className="text-[9px] mt-0.5" style={{ color: 'var(--th-text-dim)' }}>{ex.sets ? ex.sets.length || ex.sets : 3} sets</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
