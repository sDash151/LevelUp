import { lazy, Suspense, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Heart, Briefcase, Rocket, Brain, Plus, Zap, CheckCircle2, Target } from 'lucide-react';
import { AnimatedPage } from '@/design-system/components';
import { useAuthStore } from '@/shared/stores/authStore';
import { getGreeting } from '@/shared/utils/dates';
import { useDashboardSummary } from '../hooks/useDashboard';
import clsx from 'clsx';

// Lazy load tabs
const OverviewTab = lazy(() => import('../components/OverviewTab'));
const LifeTab = lazy(() => import('../components/LifeTab'));
const CareerTab = lazy(() => import('../components/CareerTab'));
const GrowthTab = lazy(() => import('../components/GrowthTab'));
const FocusTab = lazy(() => import('../components/FocusTab'));

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'life', label: 'Life', icon: Heart },
  { key: 'career', label: 'Career', icon: Briefcase },
  { key: 'growth', label: 'Growth', icon: Rocket },
  { key: 'focus', label: 'Focus', icon: Brain },
];

const TAB_TITLES = {
  overview: { title: 'Command Center ⚡', subtitle: 'Your daily snapshot. Keep leveling up.' },
  life: { title: 'Life OS 🌱', subtitle: 'Habits, goals, and reflections to build a better you.' },
  career: { title: 'Career Grind 💼', subtitle: 'DSA tracking and job applications. Land that dream role.' },
  growth: { title: 'Growth Engine 🚀', subtitle: 'Build your portfolio, track GitHub commits, and ship projects.' },
  focus: { title: 'Deep Work 🧠', subtitle: 'Eliminate distractions. Lock in. Accumulate XP.' },
};

function TabSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 rounded-2xl" style={{ background: 'var(--th-card)' }} />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-72 rounded-2xl" style={{ background: 'var(--th-card)' }} />
        <div className="h-72 rounded-2xl" style={{ background: 'var(--th-card)' }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(' ')[0] || 'there';
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const setTab = (key) => setSearchParams({ tab: key }, { replace: true });

  const { data, isLoading } = useDashboardSummary();

  const tabInfo = TAB_TITLES[activeTab] || TAB_TITLES.overview;

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab data={data} isLoading={isLoading} />;
      case 'life': return <LifeTab data={data} isLoading={isLoading} />;
      case 'career': return <CareerTab />;
      case 'growth': return <GrowthTab />;
      case 'focus': return <FocusTab />;
      default: return <OverviewTab data={data} isLoading={isLoading} />;
    }
  };

  const getActionButton = () => {
    if (activeTab === 'life') {
      return (
        <button onClick={() => navigate('/habits')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] hover:opacity-80"
          style={{ background: '#10b981', color: '#fff' }}>
          <CheckCircle2 className="w-4 h-4" /> Log Habit
        </button>
      );
    }
    if (activeTab === 'career') {
      return (
        <button onClick={() => navigate('/jobs')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] hover:opacity-80"
          style={{ background: '#3b82f6', color: '#fff' }}>
          <Briefcase className="w-4 h-4" /> Add Application
        </button>
      );
    }
    if (activeTab === 'growth') {
      return (
        <button onClick={() => navigate('/projects')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] hover:opacity-80"
          style={{ background: '#a855f7', color: '#fff' }}>
          <Plus className="w-4 h-4" /> New Project
        </button>
      );
    }
    if (activeTab === 'focus') return null; // Focus has its own massive start button

    return (
      <button onClick={() => navigate('/goals')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] hover:opacity-80"
        style={{ background: 'var(--th-primary)', color: '#08080d' }}>
        <Zap className="w-4 h-4" /> Add Goal
      </button>
    );
  };

  return (
    <AnimatedPage>
      <div className="space-y-5 max-w-7xl mx-auto">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-xl lg:text-3xl font-bold" style={{ color: 'var(--th-text)' }}>
              {activeTab === 'overview' ? `${getGreeting()}, ${firstName} 👋` : tabInfo.title}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--th-text-secondary)' }}>
              {tabInfo.subtitle}
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            {getActionButton()}
          </motion.div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1 border-b mb-4" style={{ borderColor: 'var(--th-border)' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setTab(tab.key)}
                className={clsx(
                  'flex items-center gap-2 px-5 py-3 text-sm whitespace-nowrap transition-all rounded-t-lg relative',
                  isActive ? 'font-bold' : 'font-medium hover:bg-black/5 dark:hover:bg-white/5'
                )}
                style={{
                  color: isActive ? 'var(--th-primary)' : 'var(--th-text-secondary)',
                }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {isActive && (
                  <motion.div 
                    layoutId="activeTabIndicatorDashboard"
                    className="absolute bottom-0 left-0 right-0 h-0.5" 
                    style={{ background: 'var(--th-primary)' }} 
                  />
                )}
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
