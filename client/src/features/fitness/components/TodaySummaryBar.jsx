import { Dumbbell, Flame, CheckCircle2, Egg } from 'lucide-react';

export default function TodaySummaryBar({ data }) {
  if (!data) return null;
  const { workout, calories, volume, protein, score } = data;

  return (
    <div className="rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      {/* Status */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="flex flex-col">
          <p className="text-sm font-bold mb-1" style={{ color: 'var(--th-text)' }}>Today's Summary</p>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-emerald-600">Great work today!</p>
              <p className="text-[10px] text-gray-500 font-medium">You've completed your workout and logged your nutrition.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 ml-auto flex-wrap">
        {workout && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-500/10 flex items-center justify-center">
              <Dumbbell className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div>
              <p className="text-[9px] font-semibold text-gray-400">Workout</p>
              <p className="text-[11px] font-bold" style={{ color: 'var(--th-text)' }}>{workout.name}</p>
              <p className="text-[9px] font-semibold text-emerald-500">{workout.completed ? 'Completed' : 'Planned'}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-rose-500/10 flex items-center justify-center">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div>
            <p className="text-[9px] font-semibold text-gray-400">Calories Burned</p>
            <p className="text-[13px] font-bold" style={{ color: 'var(--th-text)' }}>{calories} <span className="text-[9px] text-gray-400">kcal</span></p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-purple-500/10 flex items-center justify-center">
            <Dumbbell className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div>
            <p className="text-[9px] font-semibold text-gray-400">Volume</p>
            <p className="text-[13px] font-bold" style={{ color: 'var(--th-text)' }}>{(volume || 0).toLocaleString()} <span className="text-[9px] text-gray-400">kg</span></p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center">
            <Egg className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div>
            <p className="text-[9px] font-semibold text-gray-400">Protein</p>
            <p className="text-[13px] font-bold" style={{ color: 'var(--th-text)' }}>{protein?.consumed || protein} <span className="text-[9px] text-gray-400">g</span></p>
            {protein?.goal && <p className="text-[8px] font-medium text-gray-400">{Math.round((protein.consumed / protein.goal)*100)}% goal</p>}
          </div>
        </div>

        <div className="pl-4 border-l border-gray-100 dark:border-gray-800 text-center flex flex-col items-center">
          <p className="text-[9px] font-semibold text-gray-400 mb-1">Daily Score</p>
          <div className="flex flex-col items-center justify-center">
            <span className="text-xl font-extrabold text-amber-500 leading-none">{score}</span>
            <span className="text-[9px] font-bold text-amber-600 mt-1">Excellent</span>
          </div>
        </div>
      </div>
    </div>
  );
}
