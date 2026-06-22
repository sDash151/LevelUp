import { ArrowUp, ArrowDown, Info, ChevronDown } from 'lucide-react';

export default function StrengthProgressTable({ data = [] }) {
  return (
    <div className="rounded-3xl p-6 h-full shadow-sm flex flex-col" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-bold" style={{ color: 'var(--th-text)' }}>Strength Progress</h3>
          <Info className="w-3.5 h-3.5 text-[var(--th-text-dim)]" />
        </div>
        <button className="flex items-center gap-1 text-[10px] font-semibold text-[var(--th-text-secondary)] hover:text-[var(--th-text)] transition">
          View All <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs" style={{ color: 'var(--th-text-secondary)' }}>No strength data yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: 'var(--th-text-dim)' }}>
                <th className="text-left pb-4 font-semibold text-[10px]">Exercise</th>
                <th className="text-center pb-4 font-semibold text-[10px]">Last Record</th>
                <th className="text-center pb-4 font-semibold text-[10px]">Best Record</th>
                <th className="text-right pb-4 font-semibold text-[10px]">Progress</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 7).map((row, i) => {
                const isBetter = row.progress >= 0;
                const formattedProg = typeof row.progress === 'number' ? row.progress.toFixed(1) : row.progress;
                return (
                  <tr key={i} className="border-t border-[var(--th-border)] dark:border-[var(--th-border)]">
                    <td className="py-3.5 font-bold" style={{ color: 'var(--th-text)' }}>{row.exercise}</td>
                    <td className="py-3.5 text-center font-medium" style={{ color: 'var(--th-text-secondary)' }}>{row.lastRecord}</td>
                    <td className="py-3.5 text-center font-medium" style={{ color: 'var(--th-text-secondary)' }}>{row.bestRecord}</td>
                    <td className="py-3.5">
                      <div className="flex flex-col items-end gap-1">
                        <div className={`flex items-center gap-0.5 text-[10px] font-bold ${isBetter ? 'text-emerald-500' : 'text-red-500'}`}>
                          {isBetter ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                          {formattedProg}%
                        </div>
                        {/* Fake mini sparkline underline */}
                        <div className="flex gap-0.5 justify-end w-12">
                           <div className={`h-0.5 flex-1 rounded-full ${isBetter ? 'bg-emerald-500/20' : 'bg-red-500/20'}`} />
                           <div className={`h-0.5 flex-1 rounded-full ${isBetter ? 'bg-emerald-500/40' : 'bg-red-500/40'}`} />
                           <div className={`h-0.5 flex-1 rounded-full ${isBetter ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
