import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import clsx from 'clsx';

export function MilestoneList({ milestones = [], onToggle }) {
  return (
    <div className="space-y-2">
      <AnimatePresence>
        {milestones.map((m) => (
          <motion.button
            key={m.id}
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onClick={() => onToggle?.(m.id)}
            className="flex items-center gap-3 w-full text-left group py-1"
          >
            <div
              className={clsx(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                m.isCompleted
                  ? 'bg-success border-success'
                  : 'border-zinc-700 group-hover:border-zinc-400'
              )}
            >
              <motion.div animate={{ scale: m.isCompleted ? 1 : 0 }} transition={{ type: 'spring', stiffness: 400 }}>
                <Check className="w-3 h-3 text-white" />
              </motion.div>
            </div>
            <span
              className={clsx(
                'text-sm transition-all',
                m.isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-200'
              )}
            >
              {m.title}
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
