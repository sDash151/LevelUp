import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '@/design-system/components';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const today = new Date().getDay();
const todayIndex = today === 0 ? 6 : today - 1;

const data = DAYS.map((day, i) => ({
  day,
  value: i <= todayIndex ? [65, 80, 45, 90, 70, 55, 0][i] : 0,
}));

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs">
      <p className="text-zinc-400">{label}</p>
      <p className="text-white font-semibold">{payload[0].value}%</p>
    </div>
  );
}

export function WeeklyProgress() {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-white mb-4">This Week</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barCategoryGap="20%">
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
          <YAxis hide domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={i === todayIndex ? '#6366f1' : 'rgba(255,255,255,0.08)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
