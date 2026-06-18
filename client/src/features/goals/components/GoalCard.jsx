import { motion } from 'motion/react';
import { Badge, Card } from '@/design-system/components';
import { Check, Circle } from 'lucide-react';
import clsx from 'clsx';

export function GoalCard({ goal, onToggleMilestone, onClick }) {
  const daysLeft = Math.max(0, Math.ceil((new Date(goal.endDate) - new Date()) / 86400000));

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card className="cursor-pointer" onClick={onClick}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-white text-sm leading-tight flex-1 mr-3">{goal.title}</h3>
          <Badge variant={goal.type === 'WEEKLY' ? 'accent' : 'info'} size="sm">
            {goal.type === 'WEEKLY' ? 'Weekly' : 'Monthly'}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-zinc-500">Progress</span>
            <span className="text-xs font-semibold text-white stat-number">{goal.progress}%</span>
          </div>
          <div className="h-2 bg-zinc-800/60 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goal.progress}%` }}
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
            />
          </div>
        </div>

        {/* Milestones preview */}
        <div className="space-y-1.5 mb-3">
          {goal.milestones?.slice(0, 3).map((m) => (
            <button
              key={m.id}
              onClick={(e) => { e.stopPropagation(); onToggleMilestone?.(goal.id, m.id); }}
              className="flex items-center gap-2 w-full text-left group"
            >
              <div className={clsx(
                'w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all',
                m.isCompleted
                  ? 'bg-success border-success'
                  : 'border-zinc-700 group-hover:border-zinc-500'
              )}>
                {m.isCompleted && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <span className={clsx(
                'text-xs transition-colors',
                m.isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-300'
              )}>
                {m.title}
              </span>
            </button>
          ))}
          {goal.milestones?.length > 3 && (
            <p className="text-[10px] text-zinc-600 pl-6">+{goal.milestones.length - 3} more</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
          <span className={clsx(
            'text-[10px] font-medium',
            daysLeft <= 2 ? 'text-danger' : daysLeft <= 5 ? 'text-warning' : 'text-zinc-500'
          )}>
            {daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}
          </span>
          <div className="flex items-center gap-1 text-[10px] text-zinc-600">
            <Circle className="w-2.5 h-2.5" />
            {goal.milestones?.filter((m) => m.isCompleted).length}/{goal.milestones?.length}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
