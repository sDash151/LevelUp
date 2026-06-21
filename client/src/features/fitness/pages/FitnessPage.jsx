import { lazy, Suspense, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, ClipboardList, History, Apple, TrendingUp, Plus, ChevronDown, Sparkles } from 'lucide-react';
import { AnimatedPage } from '@/design-system/components';
import clsx from 'clsx';

const OverviewTab = lazy(() => import('../components/OverviewTab'));
const MyPlanTab = lazy(() => import('../components/MyPlanTab'));
const WorkoutsTab = lazy(() => import('../components/WorkoutsTab'));
const NutritionTab = lazy(() => import('../components/NutritionTab'));
const ProgressTab = lazy(() => import('../components/ProgressTab'));

const TABS = [
  { key: 'overview', label: 'Overview', icon: Dumbbell },
  { key: 'plan', label: 'My Plan', icon: ClipboardList },
  { key: 'workouts', label: 'Workouts', icon: History },
  { key: 'nutrition', label: 'Nutrition', icon: Apple },
  { key: 'progress', label: 'Progress', icon: TrendingUp },
];

const TAB_TITLES = {
  overview: { title: 'Fitness Overview', subtitle: 'Your complete fitness, nutrition & progress at a glance' },
  plan: { title: 'My Plan', subtitle: 'Your personalized workout plan powered by AI' },
  workouts: { title: 'Workouts', subtitle: 'Track, review & improve every workout you do' },
  nutrition: { title: 'Nutrition', subtitle: 'Track your nutrition, hit your macros & fuel your goals' },
  progress: { title: 'Progress', subtitle: 'Track your transformation and celebrate every win' },
};

const ACTION_BUTTONS = {
  overview: { label: 'Log Workout', icon: Plus },
  plan: { label: 'Log Workout', icon: Plus },
  workouts: { label: 'Log Workout', icon: Plus },
  nutrition: { label: 'Log Food', icon: Plus },
  progress: { label: 'Log Measurement', icon: Plus },
};

function TabSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-28 rounded-2xl" style={{ background: 'var(--th-card)' }} />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-64 rounded-2xl" style={{ background: 'var(--th-card)' }} />
        <div className="h-64 rounded-2xl" style={{ background: 'var(--th-card)' }} />
      </div>
    </div>
  );
}

export default function FitnessPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const setTab = (key) => setSearchParams({ tab: key }, { replace: true });
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [showMetricForm, setShowMetricForm] = useState(false);

  const tabInfo = TAB_TITLES[activeTab] || TAB_TITLES.overview;
  const actionBtn = ACTION_BUTTONS[activeTab] || ACTION_BUTTONS.overview;

  const handleAction = () => {
    if (activeTab === 'nutrition') setShowFoodForm(true);
    else if (activeTab === 'progress') setShowMetricForm(true);
    else setShowWorkoutForm(true);
  };

  const renderTab = () => {
    const formProps = {
      showWorkoutForm, setShowWorkoutForm,
      showFoodForm, setShowFoodForm,
      showMetricForm, setShowMetricForm,
    };
    switch (activeTab) {
      case 'overview': return <OverviewTab {...formProps} />;
      case 'plan': return <MyPlanTab {...formProps} />;
      case 'workouts': return <WorkoutsTab {...formProps} />;
      case 'nutrition': return <NutritionTab {...formProps} />;
      case 'progress': return <ProgressTab {...formProps} />;
      default: return <OverviewTab {...formProps} />;
    }
  };

  return (
    <AnimatedPage>
      <div className="space-y-5">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold" style={{ color: 'var(--th-text)' }}>{tabInfo.title}</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--th-text-secondary)' }}>{tabInfo.subtitle}</p>
          </div>
          <button
            onClick={handleAction}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #E8A23A, #D4891A)' }}
          >
            <actionBtn.icon className="w-4 h-4" />
            {actionBtn.label}
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setTab(tab.key)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 text-sm whitespace-nowrap transition-all rounded-lg',
                  isActive ? 'font-semibold shadow-sm' : 'font-medium hover:bg-black/5 dark:hover:bg-white/5'
                )}
                style={{ 
                  color: isActive ? '#fff' : 'var(--th-text-secondary)',
                  background: isActive ? 'var(--th-primary)' : 'transparent',
                }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ── */}
        <Suspense fallback={<TabSkeleton />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </div>
    </AnimatedPage>
  );
}
