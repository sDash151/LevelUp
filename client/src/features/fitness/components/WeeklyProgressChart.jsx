import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs shadow-lg" style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}>
      <p className="font-medium mb-1" style={{ color: 'var(--th-text-secondary)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value?.toLocaleString()}</span></p>
      ))}
    </div>
  );
}

// Dummy daily data for visual matching
const dailyData = [
  { day: 'Mon', thisWeek: 45, lastWeek: 30 },
  { day: 'Tue', thisWeek: 60, lastWeek: 45 },
  { day: 'Wed', thisWeek: 85, lastWeek: 60 },
  { day: 'Thu', thisWeek: 0, lastWeek: 0, isRest: true },
  { day: 'Fri', thisWeek: 55, lastWeek: 40 },
  { day: 'Sat', thisWeek: 0, lastWeek: 50 },
  { day: 'Sun', thisWeek: 70, lastWeek: 0, isRest: true }
];

export default function WeeklyProgressChart({ data }) {
  const tw = data?.thisWeek || {};
  const lw = data?.lastWeek || {};

  const statCards = [
    { label: 'Workouts', value: tw.workouts || 0, change: (tw.workouts || 0) - (lw.workouts || 0), prefix: '' },
    { label: 'Volume', value: `${((tw.volume || 0)).toLocaleString()}`, change: tw.volume - lw.volume, prefix: 'kg' },
    { label: 'Calories', value: `${(tw.calories || 0).toLocaleString()}`, change: tw.calories - lw.calories, prefix: 'kcal' },
    { label: 'Active Minutes', value: tw.activeMinutes || 0, change: tw.activeMinutes - lw.activeMinutes, prefix: 'mins' },
  ];

  return (
    <div className="rounded-2xl p-5 h-full" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Weekly Progress</h3>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> This Week</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700" /> Last Week</span>
        </div>
      </div>

      {/* Stat summary */}
      <div className="flex items-center mb-6">
        {statCards.map((s, i) => (
          <div key={s.label} className="flex-1 flex items-center">
            <div className="flex-1">
              <p className="text-[10px] mb-1" style={{ color: 'var(--th-text-secondary)' }}>{s.label}</p>
              <p className="text-[15px] font-extrabold leading-tight mb-1" style={{ color: 'var(--th-text)' }}>{s.value} <span className="text-[10px] font-semibold text-gray-400">{s.prefix}</span></p>
              <p className={`text-[10px] font-semibold ${s.change >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                {s.change >= 0 ? '↑ ' : '↓ '}{Math.abs(s.change)} {s.prefix}
              </p>
            </div>
            {i < statCards.length - 1 && (
              <div className="w-px h-14 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-700 to-transparent mx-2 sm:mx-4 opacity-70" />
            )}
          </div>
        ))}
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={dailyData} barGap={4}>
            <XAxis dataKey="day" axisLine={{ stroke: 'var(--th-border)' }} tickLine={false} tick={{ fill: 'var(--th-text-dim)', fontSize: 10, fontWeight: 500 }} dy={10} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="thisWeek" name="This Week" fill="#10B981" radius={[2, 2, 0, 0]} barSize={10} />
            <Bar dataKey="lastWeek" name="Last Week" fill="#E5E7EB" radius={[2, 2, 0, 0]} barSize={10} />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Rest Day overlays (rough approximation for design matching) */}
        <div className="absolute top-10 right-[6%] bg-amber-500/10 px-2 py-1.5 rounded-lg">
          <p className="text-[9px] font-semibold text-amber-500 leading-tight text-center">Rest<br/>Day</p>
        </div>
      </div>
    </div>
  );
}
