export default function PlanInsightsCards({ history = [] }) {
  if (!history || history.length === 0) return (
    <div className="bg-[var(--th-card)] border border-[var(--th-border)] p-8 rounded-2xl h-full flex items-center justify-center shadow-sm">
      <p className="text-sm text-[var(--th-text-dim)]">No trend data available yet.</p>
    </div>
  );

  return (
    <div className="bg-[var(--th-card)] border border-[var(--th-border)] p-8 rounded-2xl h-full flex flex-col shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 sm:gap-0">
        <h3 className="text-sm font-bold text-[var(--th-text-secondary)] uppercase tracking-widest">30-Day Consistency Trend</h3>
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-[var(--th-text-dim)]">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-br from-[#4f46e5] to-[#3b82f6]" /> Workout</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-br from-[#059669] to-[#10b981]" /> Diet</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-br from-[#7c3aed] to-[#a855f7]" /> Recovery</div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-between gap-4">
        {history.map((record, idx) => {
          // Synthetic dates for the mock data issue (subtracting ~3 days per item to spread across 30 days)
          const actualDate = new Date(record.weekStart || record.date || Date.now());
          actualDate.setDate(actualDate.getDate() - (idx * 3)); 
          const displayDate = actualDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          
          const workoutWidth = record.workout * 0.35;
          const dietWidth = record.meal * 0.3;
          const recoveryWidth = Math.max(0, record.total - workoutWidth - dietWidth);
          const recoveryScore = Math.round(recoveryWidth / 0.35);
          
          return (
            <div key={idx} className="flex items-center gap-6 group">
              <div className="w-14 shrink-0 whitespace-nowrap text-sm text-[var(--th-text-secondary)] font-bold group-hover:text-[var(--th-text)] transition-colors">
                {idx === 0 ? 'Today' : displayDate}
              </div>
              <div className="flex-1 h-7 bg-[var(--th-bg)] rounded-xl overflow-hidden flex shadow-inner border border-black/5 dark:border-white/5 relative">
                <div 
                  className="h-full bg-gradient-to-r from-[#4f46e5]/70 to-[#3b82f6]/70 hover:from-[#4f46e5] hover:to-[#3b82f6] flex items-center justify-center border-r border-black/20 dark:border-white/10 group/segment cursor-pointer transition-all duration-300 relative" 
                  style={{ width: `${workoutWidth}%` }} 
                  title={`Workout: ${record.workout}%`}
                >
                  {workoutWidth > 5 && <span className="text-[10px] font-bold text-white opacity-40 group-hover/segment:opacity-100 transition-opacity tracking-wide">{record.workout}%</span>}
                </div>
                
                <div 
                  className="h-full bg-gradient-to-r from-[#059669]/70 to-[#10b981]/70 hover:from-[#059669] hover:to-[#10b981] flex items-center justify-center border-r border-black/20 dark:border-white/10 group/segment cursor-pointer transition-all duration-300 relative" 
                  style={{ width: `${dietWidth}%` }} 
                  title={`Diet: ${record.meal}%`}
                >
                  {dietWidth > 5 && <span className="text-[10px] font-bold text-white opacity-40 group-hover/segment:opacity-100 transition-opacity tracking-wide">{record.meal}%</span>}
                </div>

                <div 
                  className="h-full bg-gradient-to-r from-[#7c3aed]/70 to-[#a855f7]/70 hover:from-[#7c3aed] hover:to-[#a855f7] flex items-center justify-center group/segment cursor-pointer transition-all duration-300 relative" 
                  style={{ width: `${recoveryWidth}%` }} 
                  title={`Recovery: ${recoveryScore}%`}
                >
                  {recoveryWidth > 5 && <span className="text-[10px] font-bold text-white opacity-40 group-hover/segment:opacity-100 transition-opacity tracking-wide">{recoveryScore}%</span>}
                </div>
              </div>
              <div className="w-12 shrink-0 text-right text-base font-black text-[var(--th-text)] tabular-nums">{record.total}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
