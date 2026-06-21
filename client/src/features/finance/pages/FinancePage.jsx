import { lazy, Suspense, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, CreditCard, TrendingUp, Shield, Brain, Plus, Sparkles, Target } from 'lucide-react';
import { AnimatedPage } from '@/design-system/components';
import clsx from 'clsx';
import BudgetModal from '../components/BudgetModal';
import ActiveBudgetsModal from '../components/ActiveBudgetsModal';
import { TransactionForm } from '../components/TransactionForm';

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
  overview: { title: 'Finance Overview', subtitle: 'Your Money OS - Track, Grow & Achieve Financial Freedom' },
  spend: { title: 'Finance Overview', subtitle: 'Your Money OS - Track, Grow & Achieve Financial Freedom' },
  build: { title: 'Finance Overview', subtitle: 'Your Money OS - Track, Grow & Achieve Financial Freedom' },
  protect: { title: 'Finance Overview', subtitle: 'Your Money OS - Track, Grow & Achieve Financial Freedom' },
  intelligence: { title: 'Finance Overview', subtitle: 'Your Money OS - Track, Grow & Achieve Financial Freedom' },
};

const TAB_COLORS = {
  overview: '#F59E0B',
  spend: '#F59E0B',
  build: '#F59E0B',
  protect: '#F59E0B',
  intelligence: '#F59E0B',
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
  const [initialAiText, setInitialAiText] = useState('');
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showActiveBudgetsModal, setShowActiveBudgetsModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const tabInfo = TAB_TITLES[activeTab] || TAB_TITLES.overview;

  const formProps = {
    onOpenTransactionForm: (text = '') => {
      setInitialAiText(typeof text === 'string' ? text : '');
      setShowTransactionForm(true);
    },
    onOpenActiveBudgetsModal: () => setShowActiveBudgetsModal(true),
    onOpenBudgetForm: (budget = null) => {
      setEditingBudget(budget);
      setShowBudgetForm(true);
    }
  };

  const renderTab = () => {
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
          <div className="flex items-center gap-3">
            {activeTab !== 'intelligence' && (
              <button
                onClick={() => setShowActiveBudgetsModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-gray-700 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Target className="w-4 h-4 text-amber-500" />
                Set Budget
              </button>
            )}
            <button
              onClick={() => setShowTransactionForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: '#F59E0B' }}
            >
              {activeTab === 'intelligence' ? <Sparkles className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {activeTab === 'intelligence' ? 'Ask AI CFO' : 'Add Transaction'}
            </button>
          </div>
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
                  'flex items-center gap-2 px-4 py-2 text-sm whitespace-nowrap transition-all rounded-lg',
                  isActive ? 'font-semibold shadow-sm' : 'font-medium hover:bg-black/5 dark:hover:bg-white/5'
                )}
                style={{
                  color: isActive ? '#fff' : 'var(--th-text-secondary)',
                  background: isActive ? '#F59E0B' : 'transparent',
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

      <BudgetModal 
        isOpen={showBudgetForm} 
        onClose={() => {
          setShowBudgetForm(false);
          setEditingBudget(null);
        }}
        editingBudget={editingBudget}
      />

      <ActiveBudgetsModal 
        isOpen={showActiveBudgetsModal} 
        onClose={() => setShowActiveBudgetsModal(false)}
        onOpenBudgetForm={formProps.onOpenBudgetForm}
      />

      <TransactionForm 
        isOpen={showTransactionForm} 
        onClose={() => {
          setShowTransactionForm(false);
          setInitialAiText('');
        }}
        initialAiText={initialAiText}
      />
    </AnimatedPage>
  );
}
