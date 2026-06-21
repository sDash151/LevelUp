import { Calendar, Clock, Flame, Briefcase } from 'lucide-react';

export default function ThisWeekSummary({ weekStats, targetWorkouts = null }) {
  if (!weekStats) return null;

  return (
    <div className="rounded-2xl p-5 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-zinc-100 mt-5">
      <h3 className="text-sm font-bold text-zinc-900 mb-4">This Week Summary</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50/80 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4 h-4 text-blue-500" strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-semibold text-zinc-400 mb-0.5">Workouts</span>
            <span className="text-[13px] font-black text-zinc-900">
              {weekStats.workouts} {targetWorkouts && <span className="text-[11px] text-zinc-400">/ {targetWorkouts}</span>}
            </span>
            <span className="text-[8px] font-semibold text-zinc-400 mt-0.5">Sessions</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50/80 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-emerald-500" strokeWidth={2.2} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-semibold text-zinc-400 mb-0.5">Duration</span>
            <span className="text-[13px] font-black text-zinc-900">{Math.floor((weekStats.duration || 0) / 60)}h {(weekStats.duration || 0) % 60}m</span>
            <span className="text-[8px] font-semibold text-zinc-400 mt-0.5">Total</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-50/80 flex items-center justify-center flex-shrink-0">
            <Flame className="w-4 h-4 text-red-500" strokeWidth={2.2} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-semibold text-zinc-400 mb-0.5">Calories</span>
            <span className="text-[13px] font-black text-zinc-900">{(weekStats.calories || 0).toLocaleString()} <span className="text-[10px] font-bold text-zinc-900">kcal</span></span>
            <span className="text-[8px] font-semibold text-zinc-400 mt-0.5">Total</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-50/80 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-4 h-4 text-purple-500" strokeWidth={2.2} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-semibold text-zinc-400 mb-0.5">Volume</span>
            <span className="text-[13px] font-black text-zinc-900">{(weekStats.volume || 0).toLocaleString()} <span className="text-[10px] font-bold text-zinc-900">kg</span></span>
            <span className="text-[8px] font-semibold text-zinc-400 mt-0.5">Total</span>
          </div>
        </div>
      </div>
    </div>
  );
}
