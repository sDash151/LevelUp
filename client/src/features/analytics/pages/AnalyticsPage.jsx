import { AnimatedPage } from '@/design-system/components';
import { useAnalyticsOverview, useHabitTrends, useWeeklyActivity } from '../hooks/useAnalytics';
import { OverviewGrid } from '../components/OverviewGrid';
import { HabitTrendChart } from '../components/HabitTrendChart';
import { WeeklyActivityChart } from '../components/WeeklyActivityChart';
import { FinanceCard, FitnessCard } from '../components/SummaryCards';

export default function AnalyticsPage() {
  const { data: overview } = useAnalyticsOverview();
  const { data: trends } = useHabitTrends(30);
  const { data: activity } = useWeeklyActivity();

  return (
    <AnimatedPage>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-zinc-500 mt-1">Your life in numbers</p>
      </div>

      <OverviewGrid overview={overview} />
      <HabitTrendChart trends={trends} />
      <WeeklyActivityChart activity={activity} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FinanceCard overview={overview} />
        <FitnessCard overview={overview} />
      </div>
    </AnimatedPage>
  );
}
