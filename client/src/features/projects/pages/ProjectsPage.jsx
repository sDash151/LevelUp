import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, Plus, Bell, Github,
} from 'lucide-react';
import { AnimatedPage } from '@/design-system/components';
import { useProjectStats, useGithubRepos } from '../hooks/useProjects';
import { ProjectForm } from '../components/ProjectForm';
import clsx from 'clsx';

// Lazy load tab content
const OverviewTab = lazy(() => import('../components/OverviewTab'));
const ProjectsTab = lazy(() => import('../components/ProjectsTab'));
const PipelineTab = lazy(() => import('../components/PipelineTab'));
const LearningsTab = lazy(() => import('../components/LearningsTab'));
const IntelligenceTab = lazy(() => import('../components/IntelligenceTab'));

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'projects', label: 'Projects' },
  { key: 'pipeline', label: 'Pipeline' },
  { key: 'learnings', label: 'Learnings' },
  { key: 'intelligence', label: 'Intelligence' },
];

const TAB_TITLES = {
  overview: { title: 'Projects Tracker', subtitle: 'Build. Ship. Showcase.' },
  projects: { title: 'Projects Tracker', subtitle: 'Build. Ship. Showcase.' },
  pipeline: { title: 'Pipeline', subtitle: 'Track your projects from idea to impact.' },
  learnings: { title: 'Learnings & Insights', subtitle: 'Capture, organize, and reuse knowledge from your building journey.' },
  intelligence: { title: 'Intelligence', subtitle: 'AI-powered insights to help you build better, ship faster, and grow smarter.' },
};

function TabSkeleton() {
  return (
    <div className="space-y-4 mt-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-32 rounded-2xl skeleton-shimmer" style={{ background: 'var(--th-bg-secondary)' }} />
      ))}
    </div>
  );
}

export default function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const [showForm, setShowForm] = useState(false);

  const { data: statsData } = useProjectStats();
  const { data: githubData } = useGithubRepos();
  const stats = statsData?.data?.stats || statsData?.stats || {};
  const githubRepos = githubData?.data?.repos || githubData?.repos || [];
  const isGithubConnected = githubRepos.length > 0 || !!githubData?.data?.connected;

  const hasAttemptedConnect = useRef(false);

  // Handle GitHub OAuth callback
  useEffect(() => {
    const code = searchParams.get('code');
    const returnedState = searchParams.get('state');
    
    if (code && !hasAttemptedConnect.current) {
      hasAttemptedConnect.current = true;
      const savedState = sessionStorage.getItem('github_oauth_state');
      if (!savedState || savedState !== returnedState) {
        console.error('CSRF verification failed: Invalid state parameter');
        searchParams.delete('code');
        searchParams.delete('state');
        setSearchParams(searchParams, { replace: true });
        return;
      }

      import('../api').then(({ connectGithub }) => {
        connectGithub({ code }).then(() => {
          sessionStorage.removeItem('github_oauth_state');
          searchParams.delete('code');
          searchParams.delete('state');
          setSearchParams(searchParams, { replace: true });
          window.location.reload();
        }).catch(err => {
          console.error(err);
          searchParams.delete('code');
          searchParams.delete('state');
          setSearchParams(searchParams, { replace: true });
        });
      });
    }

    if (searchParams.get('github') === 'connected') {
      searchParams.delete('github');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleConnectGithub = async () => {
    if (isGithubConnected) return; // or implement disconnect
    const { getGithubLoginUrl } = await import('../api');
    try {
      const state = crypto.randomUUID();
      sessionStorage.setItem('github_oauth_state', state);
      const url = await getGithubLoginUrl(state);
      if (url) window.location.href = url;
    } catch (err) {
      console.error(err);
    }
  };

  const setTab = (key) => {
    setSearchParams({ tab: key }, { replace: true });
  };

  const tabInfo = TAB_TITLES[activeTab] || TAB_TITLES.overview;

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab onNewProject={() => setShowForm(true)} />;
      case 'projects': return <ProjectsTab onNewProject={() => setShowForm(true)} />;
      case 'pipeline': return <PipelineTab />;
      case 'learnings': return <LearningsTab />;
      case 'intelligence': return <IntelligenceTab />;
      default: return <OverviewTab onNewProject={() => setShowForm(true)} />;
    }
  };

  return (
    <AnimatedPage>
      {/* ── Global Top Bar ── */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-1">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight leading-tight" style={{ color: 'var(--th-text)' }}>
            {tabInfo.title}
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--th-text-secondary)' }}>{tabInfo.subtitle}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] shadow-sm"
            style={{ background: 'var(--th-card-solid)', color: 'var(--th-text)', border: '1px solid var(--th-border)' }}
          >
            <Sparkles className="w-4 h-4" style={{ color: 'var(--th-primary)' }} />
            AI Builder
          </button>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] shadow-md"
            style={{ background: 'linear-gradient(135deg, #f5c95a, #e8a830)' }}
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>

          <button
            className="relative p-2 rounded-xl transition-all hover:opacity-80 shadow-sm"
            style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}
          >
            <Bell className="w-[18px] h-[18px]" style={{ color: 'var(--th-text-secondary)' }} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
          </button>

          <button
            onClick={handleConnectGithub}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all shadow-sm',
              !isGithubConnected && 'hover:opacity-80 active:scale-[0.98] cursor-pointer',
            )}
            style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}
          >
            <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 flex items-center justify-center" style={{ background: 'var(--th-bg-secondary)' }}>
              <Github className="w-4 h-4" style={{ color: 'var(--th-text)' }} />
              {isGithubConnected && (
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[11px] font-bold leading-tight" style={{ color: 'var(--th-text)' }}>
                {isGithubConnected ? 'GitHub Connected' : 'Connect GitHub'}
              </p>
              <p className="text-[10px] leading-tight" style={{ color: 'var(--th-text-dim)' }}>
                {isGithubConnected ? `${githubRepos.length || 12} Repos` : 'Sync your repos'}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex items-center mt-4 mb-5 overflow-x-auto hide-scrollbar border-b" style={{ borderColor: 'var(--th-border)' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setTab(tab.key)}
            className={clsx(
              'px-4 py-2.5 text-[13px] whitespace-nowrap transition-all relative',
              activeTab === tab.key ? 'font-bold' : 'font-medium hover:opacity-70',
            )}
            style={{
              color: activeTab === tab.key ? 'var(--th-primary)' : 'var(--th-text-secondary)',
            }}
          >
            {tab.label}
            {activeTab === tab.key && (
              <motion.div
                layoutId="projects-tab-indicator"
                className="absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full"
                style={{ background: 'var(--th-primary)' }}
              />
            )}
          </button>
        ))}
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

      {/* ── New Project Modal ── */}
      <ProjectForm isOpen={showForm} onClose={() => setShowForm(false)} />
    </AnimatedPage>
  );
}
