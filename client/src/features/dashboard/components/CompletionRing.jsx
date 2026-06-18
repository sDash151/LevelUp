import { ProgressRing, Card } from '@/design-system/components';

export function CompletionRing({ progress = 0, completed = 0, total = 0 }) {
  return (
    <Card className="flex flex-col items-center py-8">
      <ProgressRing progress={progress} size={140} strokeWidth={10} />
      <p className="text-sm text-zinc-400 mt-4">
        <span className="text-white font-semibold">{completed}</span> of {total} habits completed
      </p>
      <p className="text-xs text-zinc-600 mt-1">Today's Progress</p>
    </Card>
  );
}
