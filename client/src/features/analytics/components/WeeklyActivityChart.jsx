import { Card } from '@/design-system/components';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function ActivityTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs space-y-1">
      <p className="text-zinc-400 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.fill }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export function WeeklyActivityChart({ activity = [] }) {
  if (!activity.length) return null;

  return (
    <Card className="mb-6">
      <h3 className="text-sm font-semibold text-white mb-4">Weekly Activity</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={activity} barGap={2} barSize={10}>
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
          <YAxis hide />
          <Tooltip content={<ActivityTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 10, color: '#71717a', paddingTop: 8 }} />
          <Bar dataKey="habits" name="Habits" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="workoutMins" name="Workout (min)" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="dsaProblems" name="DSA" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          <Bar dataKey="reflections" name="Reflections" fill="#06b6d4" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
