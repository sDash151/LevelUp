import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Dumbbell } from 'lucide-react';
import { AnimatedPage, EmptyState } from '@/design-system/components';
import { useWorkouts, useFitnessStats, useCreateWorkout, useDeleteWorkout } from '../hooks/useFitness';
import { FitnessStatsGrid } from '../components/FitnessStatsGrid';
import { WorkoutCard } from '../components/WorkoutCard';
import { WorkoutForm } from '../components/WorkoutForm';
import clsx from 'clsx';

const TYPE_FILTERS = [null, 'STRENGTH', 'CARDIO', 'HIIT', 'YOGA'];

export default function FitnessPage() {
  const [typeFilter, setTypeFilter] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { data: workouts = [] } = useWorkouts(typeFilter);
  const { data: stats } = useFitnessStats();
  const createWorkout = useCreateWorkout();
  const deleteWorkout = useDeleteWorkout();

  return (
    <AnimatedPage>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Fitness</h1>
        <p className="text-sm text-zinc-500 mt-1">Track your workouts & body metrics</p>
      </div>

      <FitnessStatsGrid stats={stats} />

      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 pb-1">
        {TYPE_FILTERS.map((f) => (
          <button key={f || 'all'} onClick={() => setTypeFilter(f)} className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all', typeFilter === f ? 'bg-accent text-white' : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]')}>{f || 'All'}</button>
        ))}
      </div>

      {workouts.length === 0 ? (
        <EmptyState icon={Dumbbell} title="No workouts logged" description="Start tracking your fitness journey" action={{ children: 'Log Workout', onClick: () => setShowForm(true) }} />
      ) : (
        <div className="space-y-3">
          {workouts.map((w, i) => (
            <motion.div key={w.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <WorkoutCard workout={w} onDelete={(id) => deleteWorkout.mutate(id)} />
            </motion.div>
          ))}
        </div>
      )}

      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowForm(true)} className="fixed bottom-24 lg:bottom-8 right-6 w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-glow-accent z-40">
        <Plus className="w-6 h-6" />
      </motion.button>

      <WorkoutForm isOpen={showForm} onClose={() => setShowForm(false)} onSubmit={(data) => createWorkout.mutate(data)} />
    </AnimatedPage>
  );
}
