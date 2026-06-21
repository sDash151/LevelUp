import { useFitnessOverview, useAIOverviewInsight } from '../hooks/useFitness';
import FitnessKpiCards from './FitnessKpiCards';
import WeeklyProgressChart from './WeeklyProgressChart';
import MuscleGroupBalance from './MuscleGroupBalance';
import WorkoutCalendar from './WorkoutCalendar';
import NutritionSummaryCard from './NutritionSummaryCard';
import BodyProgressCard from './BodyProgressCard';
import PerformanceHighlights from './PerformanceHighlights';
import AIFitnessInsight from './AIFitnessInsight';
import TodaySummaryBar from './TodaySummaryBar';

export default function OverviewTab() {
  const { data, isLoading } = useFitnessOverview();
  const { data: aiData, refetch: refetchAI, isFetching: isFetchingAI } = useAIOverviewInsight();
  const overview = data?.data || data || {};
  const aiInsight = aiData?.data?.insight || aiData?.insight || null;

  if (isLoading) return <OverviewSkeleton />;

  return (
    <div className="space-y-6">
      {/* Row 1: 5 KPI Cards */}
      <FitnessKpiCards overview={overview} />

      {/* Main Grid: 2 Columns for better spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyProgressChart data={overview.weeklyProgress} />
        <MuscleGroupBalance data={overview.muscleGroupBalance} />
        
        <WorkoutCalendar calendar={overview.workoutCalendar} />
        <NutritionSummaryCard data={overview.nutritionSummary} />
        
        <BodyProgressCard data={overview.bodyProgress} />
        <PerformanceHighlights data={overview.performanceHighlights} />
      </div>

      {/* Full Width Row: AI Insight */}
      <AIFitnessInsight insight={aiInsight} onGenerate={refetchAI} isGenerating={isFetchingAI} />

      {/* Full Width Row: Today Summary */}
      <TodaySummaryBar data={overview.todaySummary} />
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[1,2,3,4,5].map(i => <div key={i} className="h-28 rounded-2xl" style={{ background: 'var(--th-card)' }} />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 rounded-2xl" style={{ background: 'var(--th-card)' }} />)}
      </div>
    </div>
  );
}
