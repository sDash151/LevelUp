import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Wallet } from 'lucide-react';
import { AnimatedPage, EmptyState } from '@/design-system/components';
import { useTransactions, useFinanceSummary, useCreateTransaction, useDeleteTransaction } from '../hooks/useFinance';
import { FinanceSummary } from '../components/FinanceSummary';
import { TransactionCard } from '../components/TransactionCard';
import { TransactionForm } from '../components/TransactionForm';
import clsx from 'clsx';

const FILTERS = [null, 'INCOME', 'EXPENSE'];

export default function FinancePage() {
  const [typeFilter, setTypeFilter] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { data: transactions = [] } = useTransactions(typeFilter ? { type: typeFilter } : {});
  const { data: summary } = useFinanceSummary();
  const createTx = useCreateTransaction();
  const deleteTx = useDeleteTransaction();

  return (
    <AnimatedPage>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Finance</h1>
        <p className="text-sm text-zinc-500 mt-1">Track your income & expenses</p>
      </div>

      <FinanceSummary summary={summary} />

      <div className="flex gap-2 mb-6">
        {FILTERS.map((f) => (
          <button key={f || 'all'} onClick={() => setTypeFilter(f)} className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', typeFilter === f ? 'bg-accent text-white' : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]')}>{f || 'All'}</button>
        ))}
      </div>

      {transactions.length === 0 ? (
        <EmptyState icon={Wallet} title="No transactions" description="Start tracking your money" action={{ children: 'Add Transaction', onClick: () => setShowForm(true) }} />
      ) : (
        <div className="space-y-3">
          {transactions.map((tx, i) => (
            <motion.div key={tx.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <TransactionCard tx={tx} onDelete={(id) => deleteTx.mutate(id)} />
            </motion.div>
          ))}
        </div>
      )}

      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowForm(true)} className="fixed bottom-24 lg:bottom-8 right-6 w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-glow-accent z-40">
        <Plus className="w-6 h-6" />
      </motion.button>

      <TransactionForm isOpen={showForm} onClose={() => setShowForm(false)} onSubmit={(data) => createTx.mutate(data)} />
    </AnimatedPage>
  );
}
