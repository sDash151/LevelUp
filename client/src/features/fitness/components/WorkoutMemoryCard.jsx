import { Brain, Clock, Dumbbell, Flame, ArrowRight } from 'lucide-react';

export default function WorkoutMemoryCard({ memories = [], lastSession = null }) {
  const recent = memories.slice(0, 5);

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Workout Memory</h3>
        <span className="text-[10px] cursor-pointer" style={{ color: 'var(--th-primary)' }}>View All</span>
      </div>

      {recent.length === 0 ? (
        <p className="text-xs" style={{ color: 'var(--th-text-secondary)' }}>Log workouts to build memory</p>
      ) : (
        <>
          {/* Show Last Session in detail */}
          {lastSession && (
            <div className="mb-4 p-3 rounded-xl" style={{ background: 'var(--th-bg-secondary)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4" style={{ color: 'var(--th-primary)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--th-text)' }}>
                  {lastSession.name} - Last Workout
                </span>
              </div>
              <p className="text-[10px] mb-2" style={{ color: 'var(--th-text-dim)' }}>
                {new Date(lastSession.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <div className="flex items-center gap-4 text-[10px]">
                <span style={{ color: 'var(--th-text-secondary)' }}>
                  <Clock className="w-3 h-3 inline mr-0.5 text-blue-500" /> {lastSession.duration}m
                </span>
                <span style={{ color: 'var(--th-text-secondary)' }}>
                  <Dumbbell className="w-3 h-3 inline mr-0.5 text-emerald-500" /> {Math.round(lastSession.volume).toLocaleString()}kg
                </span>
                <span style={{ color: 'var(--th-text-secondary)' }}>
                  <Flame className="w-3 h-3 inline mr-0.5 text-orange-500" /> {lastSession.calories} kcal
                </span>
              </div>
            </div>
          )}

          {/* Memory list */}
          <div className="space-y-2.5">
            {recent.map((mem, i) => (
              <div key={i} className="flex items-center justify-between text-[11px]">
                <span className="font-medium truncate flex-1" style={{ color: 'var(--th-text)' }}>{mem.exerciseName}</span>
                <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>
                  <span>{mem.lastPerformance?.weight}kg × {mem.lastPerformance?.reps}</span>
                  {mem.suggested && (
                    <>
                      <ArrowRight className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500 font-semibold">{mem.suggested.weight}kg × {mem.suggested.reps}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
