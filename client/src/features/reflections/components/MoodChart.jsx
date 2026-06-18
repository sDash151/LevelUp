import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/design-system/components';
import { useMoodHistory } from '../hooks/useReflections';

const MOODS = ['', '😞', '😐', '🙂', '😊', '🤩'];

function MoodTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs">
      <p className="text-zinc-400">{new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
      <p className="text-white font-semibold">{MOODS[d.mood]} {d.mood}/5</p>
    </div>
  );
}

export function MoodChart() {
  const { data: history = [] } = useMoodHistory();

  const chartData = history.map((h) => ({
    ...h,
    label: new Date(h.date).toLocaleDateString('en-US', { day: 'numeric' }),
  }));

  if (!chartData.length) return null;

  return (
    <Card className="mb-6">
      <h3 className="text-sm font-semibold text-white mb-4">Mood Trend</h3>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={chartData}>
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
          <YAxis domain={[1, 5]} hide />
          <Tooltip content={<MoodTooltip />} cursor={false} />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="#6366f1"
            strokeWidth={2.5}
            dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }}
            activeDot={{ fill: '#818cf8', r: 5, strokeWidth: 2, stroke: '#6366f1' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
