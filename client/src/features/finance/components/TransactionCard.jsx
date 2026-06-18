import { motion } from 'motion/react';
import { Card } from '@/design-system/components';
import { ArrowUpRight, ArrowDownRight, Trash2, RotateCcw } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/formatters';
import { formatRelative } from '@/shared/utils/dates';
import clsx from 'clsx';

export function TransactionCard({ tx, onDelete }) {
  const isIncome = tx.type === 'INCOME';

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="group flex items-center gap-3">
        {/* Icon */}
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', isIncome ? 'bg-success-dim' : 'bg-danger-dim')}>
          {isIncome ? <ArrowUpRight className="w-5 h-5 text-success" /> : <ArrowDownRight className="w-5 h-5 text-danger" />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-white truncate">{tx.description || tx.category}</h3>
            {tx.isRecurring && <RotateCcw className="w-3 h-3 text-zinc-600 shrink-0" title="Recurring" />}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.04] text-zinc-500">{tx.category}</span>
            <span className="text-[10px] text-zinc-600">{formatRelative(tx.date)}</span>
          </div>
        </div>

        {/* Amount */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={clsx('stat-number text-sm font-bold', isIncome ? 'text-success' : 'text-white')}>
            {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
          </span>
          <button onClick={() => onDelete?.(tx.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-zinc-600 hover:text-danger transition-all">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </Card>
    </motion.div>
  );
}
