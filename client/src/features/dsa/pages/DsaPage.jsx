import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, Building2, Bell, Filter } from 'lucide-react';
import { AnimatedPage, useToast } from '@/design-system/components';
import {
  useDsaDashboard, useDsaPaths, useDsaPathProblems, useDsaProblem,
  useDsaRecommendations, useDsaWeakness, useDsaPatterns, useDsaCompanyMode,
  useDsaHeatmap, useDsaQuickResume, useDsaRevision,
  useSolveProblem, useReviseProblem, useUpdateDsaNotes, useSetActivePath,
} from '../hooks/useDsa';
import { DsaKpiCards } from '../components/DsaKpiCards';
import { DsaTodayFocus } from '../components/DsaTodayFocus';
import { DsaQuickResume } from '../components/DsaQuickResume';
import { DsaWeakAreas } from '../components/DsaWeakAreas';
import { DsaRevisionQueue } from '../components/DsaRevisionQueue';
import { DsaPathCarousel } from '../components/DsaPathCarousel';
import { DsaCompanyMode } from '../components/DsaCompanyMode';
import { DsaContinueSolving } from '../components/DsaContinueSolving';
import { DsaPatternMastery } from '../components/DsaPatternMastery';
import { DsaProblemDrawer } from '../components/DsaProblemDrawer';
import { DsaHeatmap } from '../components/DsaHeatmap';
import { DsaPathDetail } from '../components/DsaPathDetail';
import { DsaSkeleton } from '../components/DsaSkeleton';

export default function DsaPage() {
  const toast = useToast();
  const [selectedProblemId, setSelectedProblemId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerInitialTab, setDrawerInitialTab] = useState('Overview');
  const [showPathDropdown, setShowPathDropdown] = useState(false);
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' | 'path-detail'

  // Data hooks
  const { data: dashboard } = useDsaDashboard();
  const { data: paths } = useDsaPaths();
  const { data: recommendations } = useDsaRecommendations();
  const { data: weakness } = useDsaWeakness();
  const { data: patterns } = useDsaPatterns();
  const { data: companyMode } = useDsaCompanyMode();
  const { data: heatmap } = useDsaHeatmap();
  const { data: quickResume } = useDsaQuickResume();
  const { data: revision } = useDsaRevision();

  // Get problems for active path
  const activePath = dashboard?.activePath;
  const { data: activePathProblems } = useDsaPathProblems(activePath?.slug, { limit: 500 });
  const { data: selectedProblem } = useDsaProblem(selectedProblemId);

  // Mutations
  const solveMutation = useSolveProblem();
  const reviseMutation = useReviseProblem();
  const notesMutation = useUpdateDsaNotes();
  const setActivePathMutation = useSetActivePath();

  const handleProblemClick = (p) => {
    setSelectedProblemId(p.id);
    setDrawerInitialTab('Overview');
    setIsDrawerOpen(true);
  };

  const handleAddNoteClick = (p) => {
    setSelectedProblemId(p.id);
    setDrawerInitialTab('Notes');
    setIsDrawerOpen(true);
  };

  const handleSolve = (id) => { solveMutation.mutate({ id }); };
  const handleRevise = (id, performance) => { reviseMutation.mutate({ id, performance }); };
  const handleUpdateNotes = (id, notes) => { notesMutation.mutate({ id, notes }); };
  const handleSetActivePath = (path) => { setActivePathMutation.mutate(path.slug); setShowPathDropdown(false); };

  return (
    <AnimatedPage>
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold" style={{ color: 'var(--th-text)' }}>DSA Tracker</h1>
          <p className="text-[11px]" style={{ color: 'var(--th-text-muted)' }}>Track. Solve. Master. Level Up.</p>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Active Path Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPathDropdown(!showPathDropdown)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[12px] font-medium transition"
              style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }}
            >
              <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ background: 'var(--th-bg-secondary)' }}>
                <Building2 className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
              </div>
              <div className="flex flex-col items-start mr-2">
                <span className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>Active Path</span>
                <span className="font-semibold leading-tight text-[11px]">{activePath?.name || 'Select Path'}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--th-text-dim)' }} />
            </button>
            {showPathDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-1 right-0 z-30 w-56 rounded-xl p-1 shadow-xl overflow-y-auto max-h-64"
                style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}
              >
                {paths?.filter(p => p.isVisible).map(p => (
                  <button key={p.id} onClick={() => handleSetActivePath(p)}
                    className="w-full text-left px-3 py-2 rounded-lg text-[12px] transition"
                    style={{
                      color: activePath?.id === p.id ? 'var(--th-primary)' : 'var(--th-text)',
                      background: activePath?.id === p.id ? 'rgba(var(--th-primary-rgb), 0.08)' : 'transparent',
                    }}
                    onMouseEnter={e => e.target.style.background = 'var(--th-card-hover)'}
                    onMouseLeave={e => e.target.style.background = activePath?.id === p.id ? 'rgba(var(--th-primary-rgb), 0.08)' : 'transparent'}
                  >
                    {p.name}
                    <span className="text-[10px] ml-1" style={{ color: 'var(--th-text-dim)' }}>({p.completionPct}%)</span>
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Company Mode button */}
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition hover:opacity-80"
            style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }}>
            <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ background: 'var(--th-bg-secondary)' }}>
              <Building2 className="w-3.5 h-3.5" style={{ color: '#d97706' }} />
            </div>
            Company Mode
          </button>
        </div>
      </div>

      {/* Close dropdown on background click */}
      {showPathDropdown && <div className="fixed inset-0 z-20" onClick={() => setShowPathDropdown(false)} />}

      {!dashboard ? (
        <DsaSkeleton />
      ) : viewMode === 'path-detail' ? (
        <DsaPathDetail
          path={activePath}
          problems={activePathProblems?.data || []}
          onBack={() => setViewMode('dashboard')}
          onProblemClick={handleProblemClick}
        />
      ) : (
        <div className="space-y-4">
          {/* ── KPI Cards ── */}
          <DsaKpiCards stats={dashboard} />

          {/* ── Quick Resume ── */}
          {quickResume && (
            <DsaQuickResume
              pathName={quickResume.pathName}
              topic={quickResume.topic}
              nextProblem={quickResume.nextProblem}
              eta={quickResume.eta}
              onResume={() => handleProblemClick(quickResume.nextProblem)}
            />
          )}

          {/* ── Row 1: Today's Focus (Full Width) ── */}
          <DsaTodayFocus
            tasks={recommendations?.tasks || []}
            dailyProgress={recommendations?.dailyProgress || 0}
            xpCurrent={recommendations?.xpCurrent || 0}
            xpGoal={recommendations?.xpGoal || 180}
            onTaskClick={(task) => task.problemId && handleProblemClick({ id: task.problemId })}
          />

          {/* ── Row 2: Weak Areas + Revision Queue ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DsaWeakAreas topics={weakness?.topics || []} />
            <DsaRevisionQueue problems={dashboard?.revisionQueue || revision || []} />
          </div>

          {/* ── Row: Your Paths + Company Mode ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8">
              <DsaPathCarousel
                paths={paths || []}
                activePath={activePath ? { id: paths?.find(p => p.slug === activePath.slug)?.id } : null}
                onPathClick={(path) => {
                  handleSetActivePath(path);
                  setViewMode('path-detail'); // Open path detail on path click
                }}
                onViewAll={() => {}}
              />
            </div>
            <div className="lg:col-span-4">
              <DsaCompanyMode
                company={companyMode?.companies?.[0]?.company || null}
                topics={companyMode?.companies?.[0]?.topics || []}
                onViewPack={() => toast.success('Company Prep Packs are coming in the next update!')}
              />
            </div>
          </div>

          {/* ── Continue Solving (Full Width) ── */}
          <div className="w-full">
            <DsaContinueSolving
              problems={activePathProblems?.data || []}
              totalCount={activePathProblems?.pagination?.total}
              onProblemClick={handleProblemClick}
              onAddNote={handleAddNoteClick}
              onViewAll={() => setViewMode('path-detail')}
            />
          </div>

          {/* ── Pattern Mastery (Full Width) ── */}
          <div className="w-full">
            <DsaPatternMastery patterns={patterns || []} />
          </div>

          {/* ── Heatmap ── */}
          <DsaHeatmap data={heatmap || []} />
        </div>
      )}

      {/* ── Problem Drawer ── */}
      <DsaProblemDrawer
        problem={selectedProblem}
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setSelectedProblemId(null); }}
        onSolve={handleSolve}
        onRevise={handleRevise}
        onUpdateNotes={handleUpdateNotes}
        userProgress={selectedProblem?.userProgress}
        revisionHistory={selectedProblem?.revisionHistory}
        initialTab={drawerInitialTab}
      />
    </AnimatedPage>
  );
}
