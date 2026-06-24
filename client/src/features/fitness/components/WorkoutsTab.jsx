import { useState } from 'react';
import { Search, Filter, ChevronDown, Dumbbell } from 'lucide-react';
import { useWorkoutStats, useWorkoutHistory, useFitnessPlan, useWorkoutMemory } from '../hooks/useFitness';
import WorkoutMemoryCard from './WorkoutMemoryCard';
import WorkoutKpiCards from './WorkoutKpiCards';
import WorkoutHistoryList from './WorkoutHistoryList';
import WorkoutCalendar from './WorkoutCalendar';
import MuscleGroupFocus from './MuscleGroupFocus';
import ThisWeekSummary from './ThisWeekSummary';
import TodayWorkoutCard from './TodayWorkoutCard';
import { Select } from '../../../design-system/components/Select';

export default function WorkoutsTab({ onEditWorkout }) {
  const [filters, setFilters] = useState({ page: 1, type: '', search: '', limit: 10, muscleGroup: '', timeframe: '' });
  const { data: statsData, isLoading: statsLoading } = useWorkoutStats();
  const { data: historyData, isLoading: histLoading } = useWorkoutHistory(filters);
  const { data: planData } = useFitnessPlan();
  const { data: memoryData } = useWorkoutMemory();

  const stats = statsData?.data?.stats || statsData?.stats || {};
  const sessions = historyData?.data?.sessions || historyData?.sessions || [];
  const total = historyData?.data?.total || historyData?.total || 0;
  
  // The API returns weekPlan at the root of the data object
  const plan = planData?.data || planData || {};
  const targetWorkouts = plan.sessionsThisWeek?.target || null;
  const memories = memoryData?.data?.memories || memoryData?.memories || [];
  const lastSession = memoryData?.data?.lastSession || memoryData?.lastSession || null;

  return (
    <div className="space-y-6">
      <WorkoutKpiCards stats={stats} loading={statsLoading} />

      {/* Today's Workout Card */}
      {plan.todayWorkout && (
        <TodayWorkoutCard workout={plan.todayWorkout} />
      )}

      {/* Search / Filter */}
      <div className="flex flex-wrap items-center gap-4 mt-8 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--th-text-dim)]" />
          <input
            type="text"
            placeholder="Search workouts..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm font-medium outline-none bg-[var(--th-card)] border border-[var(--th-border)] text-[var(--th-text)] placeholder:text-[var(--th-text-dim)] focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Select 
            value={filters.type}
            onChange={v => setFilters(f => ({ ...f, type: v, page: 1 }))}
            options={[
              { value: '', label: 'All Types' },
              { value: 'push', label: 'Push' },
              { value: 'pull', label: 'Pull' },
              { value: 'legs', label: 'Legs' },
              { value: 'strength', label: 'Strength' },
              { value: 'hiit', label: 'HIIT' },
              { value: 'swimming', label: 'Swimming' },
              { value: 'calisthenics', label: 'Calisthenics' },
              { value: 'cardio', label: 'Cardio' },
              { value: 'yoga', label: 'Yoga' },
              { value: 'mobility', label: 'Mobility' },
              { value: 'sports', label: 'Sports' }
            ]}
            className="w-32"
          />
          <Select 
            value={filters.muscleGroup}
            onChange={v => setFilters(f => ({ ...f, muscleGroup: v, page: 1 }))}
            options={[
              { value: '', label: 'All Muscle Groups' },
              { value: 'chest', label: 'Chest' },
              { value: 'back', label: 'Back' },
              { value: 'legs', label: 'Legs' },
              { value: 'shoulders', label: 'Shoulders' },
              { value: 'arms', label: 'Arms' },
              { value: 'core', label: 'Core' }
            ]}
            className="w-40 hidden sm:block"
          />
          <Select 
            value={filters.timeframe}
            onChange={v => setFilters(f => ({ ...f, timeframe: v, page: 1 }))}
            options={[
              { value: '', label: 'All Time' },
              { value: 'this_week', label: 'This Week' },
              { value: 'this_month', label: 'This Month' },
              { value: 'this_year', label: 'This Year' }
            ]}
            className="w-32 hidden md:block"
          />
        </div>

        <div className="flex-1 flex justify-end">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--th-card)] border border-[var(--th-border)] text-[var(--th-text-secondary)] hover:bg-[var(--th-bg-secondary)] transition-colors shadow-sm">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <WorkoutHistoryList sessions={sessions} total={total} loading={histLoading} page={filters.page} onPageChange={p => setFilters(f => ({ ...f, page: p }))} onEditWorkout={onEditWorkout} />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-5">
          <WorkoutMemoryCard memories={memories} lastSession={lastSession} />
          <WorkoutCalendar sessions={sessions} plan={plan} />
          <ThisWeekSummary weekStats={stats.thisWeek} targetWorkouts={targetWorkouts} />
          <MuscleGroupFocus sessions={sessions} />
        </div>
        <div className="md:hidden h-24" />
      </div>
    </div>
  );
}
