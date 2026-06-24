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
import ActionChoiceModal from '../components/ActionChoiceModal';

import WorkoutForm from '../components/WorkoutForm';
import FoodLogForm from '../components/FoodLogForm';
import LogMetricForm from '../components/LogMetricForm';
const PlanWizard = lazy(() => import('../components/PlanWizard'));

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
  overview: { label: 'Quick Log', icon: Plus },
  plan: { label: 'Quick Log', icon: Plus },
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
  const [workoutFormState, setWorkoutFormState] = useState({ isOpen: false, initialData: null, editingSessionId: null });
  const [foodFormState, setFoodFormState] = useState({ isOpen: false, initialData: null, editingMealId: null });
  const [showMetricForm, setShowMetricForm] = useState(false);
  const [showPlanWizard, setShowPlanWizard] = useState(false);
  const [showChoiceModal, setShowChoiceModal] = useState(false);

  const tabInfo = TAB_TITLES[activeTab] || TAB_TITLES.overview;
  const actionBtn = ACTION_BUTTONS[activeTab] || ACTION_BUTTONS.overview;

  const handleAction = () => {
    if (activeTab === 'nutrition') setFoodFormState({ isOpen: true, initialData: null, editingMealId: null });
    else if (activeTab === 'progress') setShowMetricForm(true);
    else if (activeTab === 'workouts') setWorkoutFormState({ isOpen: true, initialData: null, editingSessionId: null });
    else setShowChoiceModal(true);
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'plan': return <MyPlanTab 
        onLogWorkout={(data, existingSessionId) => setWorkoutFormState({ isOpen: true, initialData: data, editingSessionId: existingSessionId || null })}
        onLogMeal={(data, existingMealId) => setFoodFormState({ isOpen: true, initialData: data, editingMealId: existingMealId || null })}
      />;
      case 'workouts': return <WorkoutsTab onEditWorkout={(workout) => setWorkoutFormState({ isOpen: true, initialData: workout, editingSessionId: workout.id })} />;
      case 'nutrition': return <NutritionTab onEditMeal={(meal) => setFoodFormState({ isOpen: true, initialData: meal, editingMealId: meal.id })} />;
      case 'progress': return <ProgressTab />;
      default: return <OverviewTab />;
    }
  };

  return (
    <AnimatedPage>
      <div className="space-y-5">
        {/* ── Desktop Header (Hidden on Mobile) ── */}
        <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

        {/* ── Mobile Header (Hidden on Desktop) ── */}
        <div className="md:hidden flex flex-col gap-1 mb-2 pt-2">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--th-text)' }}>{tabInfo.title}</h1>
          <p className="text-xs" style={{ color: 'var(--th-text-secondary)' }}>{tabInfo.subtitle}</p>
        </div>

        {/* ── Desktop Tab Bar (Hidden on Mobile) ── */}
        <div className="hidden md:flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
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

        {/* ── Mobile Sticky Tab Bar (Hidden on Desktop) ── */}
        <div 
          className="md:hidden sticky z-40 -mx-4 px-4 py-3 backdrop-blur-xl border-b transition-all"
          style={{ 
            top: 'env(safe-area-inset-top)',
            background: 'color-mix(in srgb, var(--th-bg) 85%, transparent)',
            borderColor: 'var(--th-border)',
            marginBottom: '1rem'
          }}
        >
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setTab(tab.key)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 text-sm whitespace-nowrap transition-all rounded-full',
                    isActive ? 'font-semibold shadow-sm' : 'font-medium hover:bg-black/5 dark:hover:bg-white/5'
                  )}
                  style={{ 
                    color: isActive ? '#fff' : 'var(--th-text-secondary)',
                    background: isActive ? 'var(--th-primary)' : 'transparent',
                    border: isActive ? 'none' : '1px solid var(--th-border)'
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Mobile FAB (Floating Action Button) ── */}
        <button
          onClick={handleAction}
          className="md:hidden fixed bottom-[5.5rem] right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-transform active:scale-95"
          style={{ background: 'linear-gradient(135deg, #E8A23A, #D4891A)' }}
        >
          <actionBtn.icon className="w-6 h-6" />
        </button>

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

        <ActionChoiceModal 
          isOpen={showChoiceModal} 
          onClose={() => setShowChoiceModal(false)}
          onSelect={(choiceId) => {
            if (choiceId === 'workout') {
              setTab('workouts');
              setWorkoutFormState({ isOpen: true, initialData: null, editingSessionId: null });
            }
            else if (choiceId === 'food') {
              setTab('nutrition');
              setFoodFormState({ isOpen: true, initialData: null, editingMealId: null });
            }
            else if (choiceId === 'metric') {
              setTab('progress');
              setShowMetricForm(true);
            }
            else if (choiceId === 'plan') {
              setTab('plan');
              setShowPlanWizard(true);
            }
          }}
        />

        <Suspense fallback={null}>
          {workoutFormState.isOpen && <WorkoutForm onClose={() => setWorkoutFormState({ isOpen: false, initialData: null, editingSessionId: null })} initialData={workoutFormState.initialData} editingSessionId={workoutFormState.editingSessionId} />}
          {foodFormState.isOpen && <FoodLogForm onClose={() => setFoodFormState({ isOpen: false, initialData: null, editingMealId: null })} initialData={foodFormState.initialData} editingMealId={foodFormState.editingMealId} />}
          {showMetricForm && <LogMetricForm onClose={() => setShowMetricForm(false)} />}
          {showPlanWizard && <PlanWizard onClose={() => setShowPlanWizard(false)} onSuccess={() => setShowPlanWizard(false)} />}
        </Suspense>
      </div>
    </AnimatedPage>
  );
}
