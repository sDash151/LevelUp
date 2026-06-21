import { lazy, Suspense, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, CreditCard, TrendingUp, Shield, Brain, Plus, Sparkles } from 'lucide-react';
import { AnimatedPage } from '@/design-system/components';
import clsx from 'clsx';

const OverviewTab = lazy(() => import('../components/OverviewTab'));
const SpendTab = lazy(() => import('../components/SpendTab'));
const BuildTab = lazy(() => import('../components/BuildTab'));
const ProtectTab = lazy(() => import('../components/ProtectTab'));
const IntelligenceTab = lazy(() => import('../components/IntelligenceTab'));

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'spend', label: 'Spend', icon: CreditCard },
  { key: 'build', label: 'Build', icon: TrendingUp },
  { key: 'protect', label: 'Protect', icon: Shield },
  { key: 'intelligence', label: 'Intelligence', icon: Brain },
];

const TAB_TITLES = {
  overview: { title: 'Financial Overview', subtitle: 'Your complete money picture at a glance' },
  spend: { title: 'Spending', subtitle: 'Track, analyze & optimize every rupee you spend' },
  build: { title: 'Wealth Building', subtitle: 'Grow your wealth with goals, savings & investments' },
  protect: { title: 'Financial Protection', subtitle: 'Bills, debts, subscriptions & insurance at a glance' },
  intelligence: { title: 'AI Intelligence', subtitle: 'AI-powered financial insights & coaching' },
};

const TAB_COLORS = {
  overview: 'linear-gradient(135deg, #6366F1, #4F46E5)',
  spend: 'linear-gradient(135deg, #EC4899, #DB2777)',
  build: 'linear-gradient(135deg, #10B981, #059669)',
  protect: 'linear-gradient(135deg, #F59E0B, #D97706)',
  intelligence: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
};

function TabSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 rounded-2xl" style={{ background: 'var(--th-card)' }} />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-72 rounded-2xl" style={{ background: 'var(--th-card)' }} />
        <div className="h-72 rounded-2xl" style={{ background: 'var(--th-card)' }} />
      </div>
    </div>
  );
}

export default function FinancePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const setTab = (key) => setSearchParams({ tab: key }, { replace: true });
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  const tabInfo = TAB_TITLES[activeTab] || TAB_TITLES.overview;

  const renderTab = () => {
    const formProps = { showTransactionForm, setShowTransactionForm };
    switch (activeTab) {
      case 'overview': return <OverviewTab {...formProps} />;
      case 'spend': return <SpendTab {...formProps} />;
      case 'build': return <BuildTab {...formProps} />;
      case 'protect': return <ProtectTab {...formProps} />;
      case 'intelligence': return <IntelligenceTab {...formProps} />;
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
            onClick={() => setShowTransactionForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: TAB_COLORS[activeTab] || TAB_COLORS.overview }}
          >
            {activeTab === 'intelligence' ? <Sparkles className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {activeTab === 'intelligence' ? 'Ask AI CFO' : 'Log Transaction'}
          </button>
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setTab(tab.key)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 text-sm whitespace-nowrap transition-all rounded-lg relative',
                  isActive ? 'font-semibold shadow-sm' : 'font-medium hover:bg-black/5 dark:hover:bg-white/5'
                )}
                style={{
                  color: isActive ? '#fff' : 'var(--th-text-secondary)',
                  background: isActive ? TAB_COLORS[tab.key] : 'transparent',
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
