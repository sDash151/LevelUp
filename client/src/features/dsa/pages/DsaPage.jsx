import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Code2 } from 'lucide-react';
import { AnimatedPage, EmptyState } from '@/design-system/components';
import { useDsaProblems, useDsaStats, useCreateDsaProblem, useDeleteDsaProblem } from '../hooks/useDsa';
import { ProblemCard } from '../components/ProblemCard';
import { ProblemForm } from '../components/ProblemForm';
import { DsaStatsBar } from '../components/DsaStatsBar';
import clsx from 'clsx';

const DIFF_FILTERS = [null, 'EASY', 'MEDIUM', 'HARD'];
const STATUS_FILTERS = [null, 'SOLVED', 'ATTEMPTED', 'REVISIT', 'TODO'];

export default function DsaPage() {
  const [diffFilter, setDiffFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { data: problems = [] } = useDsaProblems({ difficulty: diffFilter, status: statusFilter });
  const { data: stats } = useDsaStats();
  const createProblem = useCreateDsaProblem();
  const deleteProblem = useDeleteDsaProblem();

  return (
    <AnimatedPage>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">DSA Tracker</h1>
        <p className="text-sm text-zinc-500 mt-1">Track your problem-solving progress</p>
      </div>

      <DsaStatsBar stats={stats} />

      {/* Filters */}
      <div className="space-y-3 mb-6">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider self-center mr-1 shrink-0">Difficulty:</span>
          {DIFF_FILTERS.map((f) => (
            <button key={f || 'all'} onClick={() => setDiffFilter(f)} className={clsx(
              'px-2.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all',
              diffFilter === f ? 'bg-accent text-white' : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]'
            )}>{f || 'All'}</button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider self-center mr-1 shrink-0">Status:</span>
          {STATUS_FILTERS.map((f) => (
            <button key={f || 'all'} onClick={() => setStatusFilter(f)} className={clsx(
              'px-2.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all',
              statusFilter === f ? 'bg-accent text-white' : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]'
            )}>{f?.replace('_', ' ') || 'All'}</button>
          ))}
        </div>
      </div>

      {problems.length === 0 ? (
        <EmptyState icon={Code2} title="No problems logged" description="Start tracking your DSA journey" action={{ children: 'Log Problem', onClick: () => setShowForm(true) }} />
      ) : (
        <div className="space-y-3">
          {problems.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <ProblemCard problem={p} onDelete={(id) => deleteProblem.mutate(id)} />
            </motion.div>
          ))}
        </div>
      )}

      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowForm(true)}
        className="fixed bottom-24 lg:bottom-8 right-6 w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-glow-accent z-40">
        <Plus className="w-6 h-6" />
      </motion.button>

      <ProblemForm isOpen={showForm} onClose={() => setShowForm(false)} onSubmit={(data) => createProblem.mutate(data)} />
    </AnimatedPage>
  );
}
