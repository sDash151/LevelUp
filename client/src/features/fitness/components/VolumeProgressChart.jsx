import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Info, ChevronDown } from 'lucide-react';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 text-xs shadow-xl" style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}>
      <p className="font-semibold mb-1" style={{ color: 'var(--th-text-secondary)' }}>Week of {label}</p>
      <p className="text-lg font-bold text-violet-500">
        {payload[0]?.value?.toLocaleString()} <span className="text-[10px] font-medium opacity-70">kg</span>
      </p>
      {payload[0]?.payload?.sessions && <p className="text-[10px] font-medium mt-1" style={{ color: 'var(--th-text-dim)' }}>{payload[0].payload.sessions} sessions</p>}
    </div>
  );
}

export default function VolumeProgressChart({ data = [] }) {
  const chartData = data.map(d => ({
    week: new Date(d.week).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    volume: d.volume,
    sessions: d.sessions,
  }));

  const maxVolume = Math.max(...chartData.map(d => d.volume), 1);

  return (
    <div className="rounded-3xl p-6 h-full shadow-sm flex flex-col" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-bold" style={{ color: 'var(--th-text)' }}>Volume Progress</h3>
          <Info className="w-3.5 h-3.5 text-[var(--th-text-dim)]" />
        </div>
        <button className="flex items-center gap-1 text-[10px] font-semibold text-[var(--th-text-secondary)] hover:text-[var(--th-text)] transition">
          Last 30 Days <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      <div className="flex-1 min-h-[220px]">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center"><p className="text-xs" style={{ color: 'var(--th-text-secondary)' }}>No volume data yet</p></div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--th-border)" opacity={0.5} />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: 'var(--th-text-dim)', fontSize: 10, fontWeight: 500 }} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                tick={{ fill: 'var(--th-text-dim)', fontSize: 10, fontWeight: 500 }} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--th-border)', opacity: 0.2 }} />
              <Bar dataKey="volume" radius={[4, 4, 0, 0]} maxBarSize={30}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.volume === maxVolume ? '#8B5CF6' : '#C4B5FD'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
