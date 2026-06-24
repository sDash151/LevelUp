import { useState } from 'react';
import { Sparkles, Zap } from 'lucide-react';
import { useFitnessPlan, useWorkoutMemory, useTopLifts, usePlanInsights, useAIOverviewInsight, useActivePlans } from '../hooks/useFitness';
import PlanKpiCards from './PlanKpiCards';
import WeekPlanCards from './WeekPlanCards';

import AIFitnessInsight from './AIFitnessInsight';
import PlanInsightsCards from './PlanInsightsCards';
import ActivePlanView from './ActivePlanView';
import PlanWizard from './PlanWizard';
import AdaptiveReview from './AdaptiveReview';
import AdherenceInsights from './AdherenceInsights';
import PlanHistory from './PlanHistory';
import { useAdaptiveReview } from '../hooks/useFitness';

export default function MyPlanTab({ onLogWorkout, onLogMeal }) {
  const { data: planData, isLoading } = useFitnessPlan();
  const { data: insightsData } = usePlanInsights();
  const { data: aiData, refetch: refetchAI, isFetching: isFetchingAI } = useAIOverviewInsight();
  const { data: activePlansData } = useActivePlans();
  const { data: reviewDataRaw } = useAdaptiveReview();
  const [showWizard, setShowWizard] = useState(false);

  const plan = planData?.data || planData || {};
  const insights = insightsData?.data?.insights || insightsData?.insights || {};
  const aiInsight = aiData?.data?.insight || aiData?.insight || null;
  const activePlans = activePlansData?.data || activePlansData || {};
  const reviewData = reviewDataRaw?.data || reviewDataRaw || null;
  const hasActivePlans = activePlans?.workout || activePlans?.diet || activePlans?.recovery;

  if (isLoading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 rounded-2xl" style={{ background: 'var(--th-card)' }} />)}</div>;

  return (
    <div className="space-y-4 md:space-y-5">
      {/* ── Generate Plan CTA ── */}
      <button
        onClick={() => setShowWizard(true)}
        className="w-full p-4 rounded-2xl border-2 border-dashed transition-all hover:scale-[1.005] active:scale-[0.995] group"
        style={{ borderColor: 'var(--th-primary)', background: 'color-mix(in srgb, var(--th-primary) 5%, var(--th-card))' }}
      >
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E8A23A, #D4891A)' }}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold" style={{ color: 'var(--th-text)' }}>
              {hasActivePlans ? 'Regenerate Your Plan' : 'Make Your Plan'}
            </p>
            <p className="text-xs" style={{ color: 'var(--th-text-secondary)' }}>
              AI-powered workout, diet & recovery planning
            </p>
          </div>
          <Zap className="w-5 h-5 ml-auto" style={{ color: 'var(--th-primary)' }} />
        </div>
      </button>

      {/* ── Active Generated Plans ── */}
      {hasActivePlans && <ActivePlanView onLogWorkout={onLogWorkout} onLogMeal={onLogMeal} />}

      {/* ── Existing Plan View (if user has a manual plan too) ── */}
      {plan.hasPlan && (
        <>
          <div className="flex flex-col h-full space-y-4 md:space-y-5">
            <PlanInsightsCards history={reviewData?.adherenceHistory || []} />
          </div>
        </>
      )}

      <AIFitnessInsight insight={aiInsight} onGenerate={refetchAI} isGenerating={isFetchingAI} />

      {/* ── Adaptive Review & Intelligence ── */}
      {hasActivePlans && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-8">
          <AdaptiveReview reviewData={reviewData} />
          <AdherenceInsights reviewData={reviewData} />
        </div>
      )}

      {/* ── Plan History ── */}
      {hasActivePlans && (
        <div className="mt-8 pt-8 border-t border-[var(--th-border)]">
          <PlanHistory />
        </div>
      )}

      {/* ── Plan Wizard Modal ── */}
      {showWizard && (
        <PlanWizard
          onClose={() => setShowWizard(false)}
          onSuccess={() => setShowWizard(false)}
        />
      )}
    </div>
  );
}
