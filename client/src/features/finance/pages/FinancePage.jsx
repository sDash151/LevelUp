import { lazy, Suspense, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, CreditCard, TrendingUp, Shield, Brain, Plus, Sparkles, Target, PieChart } from 'lucide-react';
import { AnimatedPage } from '@/design-system/components';
import clsx from 'clsx';
import BudgetModal from '../components/BudgetModal';
import ActiveBudgetsModal from '../components/ActiveBudgetsModal';
import { TransactionForm } from '../components/TransactionForm';
import { ContributeModal } from '../components/ContributeModal';
import { AICFOChatModal } from '../components/AICFOChatModal';

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
  overview: { title: 'Finance Hub 🏦', subtitle: 'Your Money OS - Track, Grow & Achieve Financial Freedom' },
  spend: { title: 'Spend Analytics 💳', subtitle: 'Master your cash flow, optimize your budget & cut the fat.' },
  build: { title: 'Wealth Builder 🚀', subtitle: 'Grow your net worth, hit your goals & invest in your future.' },
  protect: { title: 'Financial Defense 🛡️', subtitle: 'Secure your assets, kill debt & bulletproof your life.' },
  intelligence: { title: 'AI CFO Dashboard 🧠', subtitle: 'Deep insights, risk alerts & hyper-personalized financial strategies.' },
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
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [initialAiText, setInitialAiText] = useState('');
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showActiveBudgetsModal, setShowActiveBudgetsModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showAIChatModal, setShowAIChatModal] = useState(false);
  const [contributeDefaultGoal, setContributeDefaultGoal] = useState(null);

  const tabInfo = TAB_TITLES[activeTab] || TAB_TITLES.overview;

  const formProps = {
    onOpenTransactionForm: (text = '') => {
      setEditingTransaction(null);
      setInitialAiText(typeof text === 'string' ? text : '');
      setShowTransactionForm(true);
    },
    onEditTransaction: (txn) => {
      if (txn.type === 'TRANSFER') {
        setEditingTransaction(txn);
        setShowContributeModal(true);
      } else {
        setEditingTransaction(txn);
        setInitialAiText('');
        setShowTransactionForm(true);
      }
    },
    onOpenActiveBudgetsModal: () => setShowActiveBudgetsModal(true),
    onOpenBudgetForm: (budget = null) => {
      setEditingBudget(budget);
      setShowBudgetForm(true);
    },
    onOpenContributeModal: (defaultGoal = null) => {
      setContributeDefaultGoal(defaultGoal);
      setShowContributeModal(true);
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab {...formProps} />;
      case 'spend': return <SpendTab {...formProps} />;
      case 'build': return <BuildTab {...formProps} />;
      case 'protect': return <ProtectTab {...formProps} />;
      case 'intelligence': return <IntelligenceTab onOpenChat={() => setShowAIChatModal(true)} {...formProps} />;
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] hover:opacity-80"
                style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }}
              >
                <PieChart className="w-4 h-4 text-amber-500" />
                Set Budget
              </button>
            )}
            <button
              onClick={() => {
                if (activeTab === 'intelligence') {
                  setShowAIChatModal(true);
                } else if (activeTab === 'build' || activeTab === 'protect') {
                  setContributeDefaultGoal(null);
                  setShowContributeModal(true);
                } else {
                  setEditingTransaction(null);
                  setShowTransactionForm(true);
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] hover:opacity-80"
              style={{ background: 'var(--th-primary)', color: '#08080d' }}
            >
              {activeTab === 'intelligence' ? <Sparkles className="w-4 h-4" /> : (activeTab === 'build' || activeTab === 'protect') ? <Target className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {activeTab === 'intelligence' ? 'Ask AI CFO' : (activeTab === 'build' || activeTab === 'protect') ? 'Contribute to Goal' : 'Add Transaction'}
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
                  color: isActive ? '#08080d' : 'var(--th-text-secondary)',
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
          setEditingTransaction(null);
        }} 
        initialAiText={initialAiText} 
        initialData={editingTransaction}
      />

      <ContributeModal 
        isOpen={showContributeModal} 
        onClose={() => {
          setShowContributeModal(false);
          setEditingTransaction(null);
        }} 
        defaultGoal={contributeDefaultGoal}
        editingTransaction={editingTransaction && editingTransaction.type === 'TRANSFER' ? editingTransaction : null}
      />

      <AICFOChatModal 
        isOpen={showAIChatModal}
        onClose={() => setShowAIChatModal(false)}
      />
    </AnimatedPage>
  );
}
