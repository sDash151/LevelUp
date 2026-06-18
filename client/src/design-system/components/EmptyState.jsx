import { motion } from 'motion/react';
import { Button } from './Button';
import clsx from 'clsx';

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      {Icon && (
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
        >
          <Icon className="w-10 h-10 text-zinc-600" />
        </motion.div>
      )}
      <h3 className="text-lg font-semibold text-zinc-300 mb-1">{title}</h3>
      {description && <p className="text-sm text-zinc-500 max-w-xs">{description}</p>}
      {action && <div className="mt-5"><Button size="sm" {...action} /></div>}
    </div>
  );
}
