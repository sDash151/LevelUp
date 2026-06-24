import { useState } from 'react';
import { useProgress, useAIProgressInsight, useTopLifts } from '../hooks/useFitness';
import TopLiftsProgress from './TopLiftsProgress';
import ProgressKpiCards from './ProgressKpiCards';
import TimeRangeFilter from './TimeRangeFilter';
import BodyWeightTrend from './BodyWeightTrend';
import BodyMeasurementsCard from './BodyMeasurementsCard';
import StrengthProgressTable from './StrengthProgressTable';
import VolumeProgressChart from './VolumeProgressChart';
import ProgressPhotosTimeline from './ProgressPhotosTimeline';
import MilestonesCard from './MilestonesCard';
import NextGoalCard from './NextGoalCard';
import AIProgressInsight from './AIProgressInsight';

export default function ProgressTab() {
  const [range, setRange] = useState('3M');
  const { data, isLoading } = useProgress(range);
  const { data: aiData, refetch: refetchAI, isFetching: isFetchingAI } = useAIProgressInsight();
  const { data: liftsData } = useTopLifts();

  const progress = data?.data || data || {};
  const aiInsight = aiData?.data?.insight || aiData?.insight || null;
  const lifts = liftsData?.data?.lifts || liftsData?.lifts || [];

  if (isLoading) return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl" style={{ background: 'var(--th-card)' }} />)}</div>
      <div className="h-64 rounded-2xl" style={{ background: 'var(--th-card)' }} />
    </div>
  );

  return (
    <div className="space-y-5">
      <ProgressKpiCards kpis={progress.kpis} />
      <TimeRangeFilter range={range} onRangeChange={setRange} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <BodyWeightTrend data={progress.bodyWeightTrend} range={range} />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6">
          <BodyMeasurementsCard data={progress.bodyMeasurements} range={range} />
          <ProgressPhotosTimeline photos={progress.photos} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <StrengthProgressTable data={progress.strengthProgress} />
        </div>
        <div className="lg:col-span-5 flex flex-col gap-6">
          <TopLiftsProgress lifts={lifts} />
          <VolumeProgressChart data={progress.volumeProgress} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <AIProgressInsight insight={aiInsight} onGenerate={refetchAI} isGenerating={isFetchingAI} />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6">
          <MilestonesCard milestones={progress.milestones} />
          <NextGoalCard milestones={progress.milestones} />
        </div>
      </div>
    </div>
  );
}
