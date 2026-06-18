import { Card } from '@/design-system/components';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function TrendTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs">
      <p className="text-zinc-400">{d.date}</p>
      <p className="text-white font-semibold">{d.completed}/{d.total} habits</p>
      <p className="text-accent">{d.rate}% completion</p>
    </div>
  );
}

export function HabitTrendChart({ trends = [] }) {
  if (!trends.length) return null;

  const chartData = trends.map((t) => ({
    ...t,
    label: new Date(t.date).toLocaleDateString('en-US', { day: 'numeric' }),
  }));

  return (
    <Card className="mb-6">
      <h3 className="text-sm font-semibold text-white mb-4">Habit Completion Trend (30 Days)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="habitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#52525b', fontSize: 10 }} interval={4} />
          <YAxis domain={[0, 100]} hide />
          <Tooltip content={<TrendTooltip />} cursor={false} />
          <Area type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2} fill="url(#habitGradient)" dot={false} activeDot={{ fill: '#818cf8', r: 4, strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
