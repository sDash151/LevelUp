import { Card } from '@/design-system/components';
import clsx from 'clsx';

export function DsaStatsBar({ stats }) {
  if (!stats) return null;
  const solved = stats.byStatus?.find((s) => s.status === 'SOLVED')?._count?.id || 0;
  const easy = stats.byDifficulty?.find((d) => d.difficulty === 'EASY')?._count?.id || 0;
  const medium = stats.byDifficulty?.find((d) => d.difficulty === 'MEDIUM')?._count?.id || 0;
  const hard = stats.byDifficulty?.find((d) => d.difficulty === 'HARD')?._count?.id || 0;

  const items = [
    { label: 'Total', value: stats.total, color: 'text-white' },
    { label: 'Solved', value: solved, color: 'text-success' },
    { label: 'Easy', value: easy, color: 'text-success' },
    { label: 'Medium', value: medium, color: 'text-warning' },
    { label: 'Hard', value: hard, color: 'text-danger' },
  ];

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <p className={clsx('stat-number text-xl font-bold', item.color)}>{item.value}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
