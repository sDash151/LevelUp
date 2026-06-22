import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs shadow-lg" style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}>
      <p className="font-medium mb-1" style={{ color: 'var(--th-text-secondary)' }}>{label}</p>
      <p className="font-bold text-emerald-500">{payload[0].value} kg</p>
    </div>
  );
}

export default function BodyProgressCard({ data }) {
  if (!data) return null;
  const items = [
    { label: 'Weight', value: data.weight?.current, unit: 'kg', change: data.weight?.change, color: '#10B981', isPositive: data.weight?.change <= 0 },
    { label: 'Body Fat', value: data.bodyFat?.current, unit: '%', change: data.bodyFat?.change, color: '#F59E0B', isPositive: data.bodyFat?.change <= 0 },
    { label: 'Muscle Mass', value: data.muscleMass?.current, unit: 'kg', change: data.muscleMass?.change, color: '#10B981', isPositive: data.muscleMass?.change >= 0 },
  ];

  // Placeholder for the area chart since historical data isn't passed here directly yet
  const chartData = [
    { date: 'W1', value: data.weight?.current ? data.weight.current + 0.6 : 0 },
    { date: 'W2', value: data.weight?.current ? data.weight.current + 0.3 : 0 },
    { date: 'W3', value: data.weight?.current ? data.weight.current + 0.1 : 0 },
    { date: 'W4', value: data.weight?.current || 0 },
  ];

  return (
    <div className="rounded-2xl p-5 h-full flex flex-col" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Body Progress</h3>
        <div className="flex items-center gap-1 text-[10px] text-[var(--th-text-dim)] font-medium">
          This Month <span className="text-[8px]">▼</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {items.map(item => (
          <div key={item.label}>
            <p className="text-[10px] mb-0.5" style={{ color: 'var(--th-text-secondary)' }}>{item.label}</p>
            <p className="text-lg font-bold" style={{ color: 'var(--th-text)' }}>
              {item.value} <span className="text-[10px] font-medium text-[var(--th-text-dim)]">{item.unit}</span>
            </p>
            <p className={`text-[10px] font-semibold ${item.isPositive ? 'text-emerald-500' : 'text-emerald-500'}`}>
              ↑ +{item.change} {item.unit}
            </p>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-[120px] relative mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--th-text-dim)', fontSize: 10 }} dy={10} />
            <YAxis domain={[68, 74]} axisLine={false} tickLine={false} tick={{ fill: 'var(--th-text-dim)', fontSize: 10 }} ticks={[68, 70, 72, 74]} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorWeight)" />
            
            {/* Custom badge for last data point */}
            <ReferenceDot x="Jun 20" y={72.4} r={4} fill="#10B981" stroke="var(--th-bg)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="absolute top-2 right-4 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
          72.4 kg
        </div>
      </div>
    </div>
  );
}
