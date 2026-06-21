import { useState } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { useWorkoutStats, useWorkoutHistory, useFitnessPlan } from '../hooks/useFitness';
import WorkoutKpiCards from './WorkoutKpiCards';
import WorkoutHistoryList from './WorkoutHistoryList';
import WorkoutCalendar from './WorkoutCalendar';
import MuscleGroupFocus from './MuscleGroupFocus';
import ThisWeekSummary from './ThisWeekSummary';
import WorkoutForm from './WorkoutForm';
import { Select } from '../../../design-system/components/Select';

export default function WorkoutsTab({ showWorkoutForm, setShowWorkoutForm }) {
  const [filters, setFilters] = useState({ page: 1, type: '', search: '', limit: 10, muscleGroup: '', timeframe: '' });
  const { data: statsData, isLoading: statsLoading } = useWorkoutStats();
  const { data: historyData, isLoading: histLoading } = useWorkoutHistory(filters);
  const { data: planData } = useFitnessPlan();

  const stats = statsData?.data?.stats || statsData?.stats || {};
  const sessions = historyData?.data?.sessions || historyData?.sessions || [];
  const total = historyData?.data?.total || historyData?.total || 0;
  
  // The API returns weekPlan at the root of the data object
  const plan = planData?.data || planData || {};
  const targetWorkouts = plan.sessionsThisWeek?.target || null;

  return (
    <div className="space-y-6">
      <WorkoutKpiCards stats={stats} loading={statsLoading} />

      {/* Search / Filter */}
      <div className="flex flex-wrap items-center gap-4 mt-8 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search workouts..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm font-medium outline-none bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
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
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors shadow-sm">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <WorkoutHistoryList sessions={sessions} total={total} loading={histLoading} page={filters.page} onPageChange={p => setFilters(f => ({ ...f, page: p }))} />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-5">
          <WorkoutCalendar sessions={sessions} plan={plan} />
          <ThisWeekSummary weekStats={stats.thisWeek} targetWorkouts={targetWorkouts} />
          <MuscleGroupFocus sessions={sessions} />
        </div>
      </div>

      {showWorkoutForm && <WorkoutForm onClose={() => setShowWorkoutForm(false)} />}
    </div>
  );
}
