import { useFitnessPlan, useWorkoutMemory, useTopLifts, usePlanInsights, useAIOverviewInsight } from '../hooks/useFitness';
import PlanKpiCards from './PlanKpiCards';
import WeekPlanCards from './WeekPlanCards';
import TodayWorkoutCard from './TodayWorkoutCard';
import WorkoutMemoryCard from './WorkoutMemoryCard';
import TopLiftsProgress from './TopLiftsProgress';
import AIFitnessInsight from './AIFitnessInsight';
import PlanInsightsCards from './PlanInsightsCards';

export default function MyPlanTab() {
  const { data: planData, isLoading } = useFitnessPlan();
  const { data: memoryData } = useWorkoutMemory();
  const { data: liftsData } = useTopLifts();
  const { data: insightsData } = usePlanInsights();
  const { data: aiData, refetch: refetchAI, isFetching: isFetchingAI } = useAIOverviewInsight();

  const plan = planData?.data || planData || {};
  const memories = memoryData?.data?.memories || memoryData?.memories || [];
  const lastSession = memoryData?.data?.lastSession || memoryData?.lastSession || null;
  const lifts = liftsData?.data?.lifts || liftsData?.lifts || [];
  const insights = insightsData?.data?.insights || insightsData?.insights || {};
  const aiInsight = aiData?.data?.insight || aiData?.insight || null;

  if (isLoading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 rounded-2xl" style={{ background: 'var(--th-card)' }} />)}</div>;

  if (!plan.hasPlan) return (
    <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <p className="text-lg font-semibold mb-2" style={{ color: 'var(--th-text)' }}>No Active Plan</p>
      <p className="text-sm mb-4" style={{ color: 'var(--th-text-secondary)' }}>Generate an AI-powered workout plan to get started</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <PlanKpiCards plan={plan} />

      <WeekPlanCards weekPlan={plan.weekPlan} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 flex flex-col h-full space-y-5">
          <TodayWorkoutCard workout={plan.todayWorkout} />
          <div className="flex-1 min-h-[200px]">
            <AIFitnessInsight insight={aiInsight} onGenerate={refetchAI} isGenerating={isFetchingAI} />
          </div>
        </div>
        <div className="lg:col-span-4 space-y-5">
          <WorkoutMemoryCard memories={memories} lastSession={lastSession} />
          <TopLiftsProgress lifts={lifts} />
        </div>
      </div>

      <PlanInsightsCards insights={insights} />
    </div>
  );
}
