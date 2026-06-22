import { Calendar, Clock, Flame, Briefcase } from 'lucide-react';

export default function ThisWeekSummary({ weekStats, targetWorkouts = null }) {
  if (!weekStats) return null;

  return (
    <div className="rounded-2xl p-5 bg-[var(--th-card)] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[var(--th-border)] mt-5">
      <h3 className="text-sm font-bold text-[var(--th-text)] mb-4">This Week Summary</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-2xl bg-[var(--th-bg-secondary)] border border-[var(--th-border)] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10/80 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4 h-4 text-blue-500" strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-semibold text-[var(--th-text-dim)] mb-0.5">Workouts</span>
            <span className="text-[13px] font-black text-[var(--th-text)]">
              {weekStats.workouts} {targetWorkouts && <span className="text-[11px] text-[var(--th-text-dim)]">/ {targetWorkouts}</span>}
            </span>
            <span className="text-[8px] font-semibold text-[var(--th-text-dim)] mt-0.5">Sessions</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[var(--th-bg-secondary)] border border-[var(--th-border)] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10/80 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-emerald-500" strokeWidth={2.2} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-semibold text-[var(--th-text-dim)] mb-0.5">Duration</span>
            <span className="text-[13px] font-black text-[var(--th-text)]">{Math.floor((weekStats.duration || 0) / 60)}h {(weekStats.duration || 0) % 60}m</span>
            <span className="text-[8px] font-semibold text-[var(--th-text-dim)] mt-0.5">Total</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[var(--th-bg-secondary)] border border-[var(--th-border)] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-500/10/80 flex items-center justify-center flex-shrink-0">
            <Flame className="w-4 h-4 text-red-500" strokeWidth={2.2} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-semibold text-[var(--th-text-dim)] mb-0.5">Calories</span>
            <span className="text-[13px] font-black text-[var(--th-text)]">{(weekStats.calories || 0).toLocaleString()} <span className="text-[10px] font-bold text-[var(--th-text)]">kcal</span></span>
            <span className="text-[8px] font-semibold text-[var(--th-text-dim)] mt-0.5">Total</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[var(--th-bg-secondary)] border border-[var(--th-border)] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10/80 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-4 h-4 text-purple-500" strokeWidth={2.2} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-semibold text-[var(--th-text-dim)] mb-0.5">Volume</span>
            <span className="text-[13px] font-black text-[var(--th-text)]">{(weekStats.volume || 0).toLocaleString()} <span className="text-[10px] font-bold text-[var(--th-text)]">kg</span></span>
            <span className="text-[8px] font-semibold text-[var(--th-text-dim)] mt-0.5">Total</span>
          </div>
        </div>
      </div>
    </div>
  );
}
