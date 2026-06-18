import { Card } from '@/design-system/components';
import clsx from 'clsx';

const pipeline = [
  { key: 'SAVED', label: 'Saved', color: 'text-zinc-400' },
  { key: 'APPLIED', label: 'Applied', color: 'text-info' },
  { key: 'PHONE_SCREEN', label: 'Screen', color: 'text-accent' },
  { key: 'INTERVIEW', label: 'Interview', color: 'text-warning' },
  { key: 'OFFER', label: 'Offers', color: 'text-success' },
  { key: 'REJECTED', label: 'Rejected', color: 'text-danger' },
];

export function JobPipeline({ stats }) {
  if (!stats) return null;

  return (
    <Card className="mb-6">
      <h3 className="text-sm font-semibold text-white mb-4">Pipeline Overview</h3>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {pipeline.map((stage) => {
          const count = stats.byStatus?.find((s) => s.status === stage.key)?._count?.id || 0;
          return (
            <div key={stage.key} className="text-center">
              <p className={clsx('stat-number text-2xl font-bold', stage.color)}>{count}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">{stage.label}</p>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/[0.04]">
        <div className="text-center flex-1">
          <p className="stat-number text-lg font-bold text-white">{stats.total}</p>
          <p className="text-[10px] text-zinc-500">Total</p>
        </div>
        <div className="w-px h-8 bg-white/[0.06]" />
        <div className="text-center flex-1">
          <p className="stat-number text-lg font-bold text-accent">{stats.thisWeek}</p>
          <p className="text-[10px] text-zinc-500">This Week</p>
        </div>
      </div>
    </Card>
  );
}
