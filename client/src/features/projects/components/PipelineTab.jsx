import { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, MoreVertical, GitCommit, Clock, GitBranch, Search, Filter,
  SlidersHorizontal, ChevronDown, Settings, Lightbulb, ClipboardList,
  Hammer, FlaskConical, Rocket, X, FolderKanban, BarChart3, FileText,
  Check, Circle, AlertTriangle, Flame, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Plus, Briefcase, Target,
  GripVertical, Loader2,
} from 'lucide-react';
import { usePipeline, useMovePipelineProject } from '../hooks/useProjects';
import clsx from 'clsx';

const card = 'rounded-2xl shadow-sm';
const cardStyle = { background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' };

const STAGES = [
  { key: 'IDEA', label: 'Idea', Icon: Lightbulb, color: '#6b7280', bg: '#f9fafb' },
  { key: 'PLANNING', label: 'Planning', Icon: ClipboardList, color: '#3b82f6', bg: '#eff6ff' },
  { key: 'BUILDING', label: 'Building', Icon: Hammer, color: '#f59e0b', bg: '#fffbeb', highlight: true },
  { key: 'TESTING', label: 'Testing', Icon: FlaskConical, color: '#8b5cf6', bg: '#f5f3ff' },
  { key: 'SHIPPED', label: 'Shipped', Icon: Rocket, color: '#10b981', bg: '#ecfdf5' },
];

const DRAG_MIME = 'application/x-levelup-pipeline-project';

function getAdjacentStage(stageKey, direction) {
  const idx = STAGES.findIndex(s => s.key === stageKey);
  if (idx === -1) return null;
  const nextIdx = direction === 'next' ? idx + 1 : idx - 1;
  return STAGES[nextIdx]?.key ?? null;
}

function getStageMeta(stageKey) {
  return STAGES.find(s => s.key === stageKey);
}

function parseDragPayload(event) {
  try {
    const raw = event.dataTransfer.getData(DRAG_MIME);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.projectId || !parsed?.fromStage) return null;
    return parsed;
  } catch {
    return null;
  }
}

const COLORS = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

function getColor(t = '') {
  let h = 0;
  for (let i = 0; i < t.length; i++) h = t.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

function timeAgo(d) {
  if (!d) return 'Recently';
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function daysAgo(d) {
  if (!d) return 'Recently';
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

/** Normalize portfolio score to 0–10 and format for display */
function formatPortfolioScore(raw, fallback = 9.1) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return fallback.toFixed(1);
  const score = n > 10 ? n / 10 : n;
  return Math.min(10, Math.max(0, score)).toFixed(1);
}

/* ─── Mini bar chart for KPI cards ─── */
function MiniBars({ heights, color }) {
  return (
    <div className="flex items-end gap-0.5 h-8">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-1.5 rounded-t-sm"
          style={{ height: `${h}%`, minHeight: 3, background: color, opacity: 0.7 + (i % 3) * 0.1 }}
        />
      ))}
    </div>
  );
}

/* ─── KPI Summary Cards ─── */
function PipelineKpis({ pipeline }) {
  const building = pipeline.BUILDING?.length || 0;
  const planning = pipeline.PLANNING?.length || 0;
  const testing = pipeline.TESTING?.length || 0;
  const activeBuilds = building + planning + testing || 7;
  const shipped = pipeline.SHIPPED?.length || 3;
  const blocked = pipeline.BUILDING?.filter(p => p.priority === 'HIGH').length || 2;
  const totalCommits = pipeline.BUILDING?.reduce((s, p) => s + (p.metrics?.commitCount || 0), 0) || 42;

  const kpis = [
    { label: 'Active Builds', value: activeBuilds, sub: 'In Progress', color: '#10b981', bars: [40, 70, 55, 90, 60, 80, 45] },
    { label: 'Shipping Velocity', value: shipped, sub: 'Shipped this month', color: '#f59e0b', bars: [30, 50, 80, 45, 70, 55, 90] },
    { label: 'Blocked Projects', value: blocked, sub: 'Needs attention', color: '#ef4444', bars: [60, 40, 75, 35, 55, 45, 65], warn: true },
    { label: 'Build Momentum', value: totalCommits, sub: 'Commits this week', color: '#3b82f6', bars: [50, 65, 80, 70, 95, 85, 100], streak: '16 day streak' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {kpis.map(k => (
        <div key={k.label} className={clsx(card, 'p-4 flex items-start justify-between gap-3')} style={cardStyle}>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              {k.warn && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
              <p className="text-[10px] font-medium" style={{ color: 'var(--th-text-dim)' }}>{k.label}</p>
            </div>
            <p className="text-[26px] font-bold leading-none" style={{ color: 'var(--th-text)' }}>{k.value}</p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--th-text-dim)' }}>{k.sub}</p>
            {k.streak && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold mt-1.5 px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
                <Flame className="w-2.5 h-2.5" /> {k.streak}
              </span>
            )}
          </div>
          <MiniBars heights={k.bars} color={k.color} />
        </div>
      ))}
    </div>
  );
}

/* ─── Stage-specific cards ─── */
function IdeaCard({ project, onSelect }) {
  const col = getColor(project.title);
  const impacts = ['High', 'Medium', 'Low'];
  const impact = impacts[project.title?.length % 3];

  return (
    <motion.div layout onClick={() => onSelect?.(project)}
      className={clsx(card, 'p-3.5 cursor-pointer hover:-translate-y-0.5 transition-all')}
      style={cardStyle}>
      <div className="flex items-start gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[10px] shrink-0" style={{ background: col }}>
          {project.title?.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold truncate" style={{ color: 'var(--th-text)' }}>{project.title}</p>
          <p className="text-[10px] line-clamp-2 mt-0.5 leading-relaxed" style={{ color: 'var(--th-text-dim)' }}>
            {project.description || 'New project idea'}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {(project.stack?.length ? project.stack.slice(0, 3) : ['AI', 'SaaS']).map(t => (
          <span key={t} className="text-[8px] px-1.5 py-0.5 rounded font-medium" style={{ background: 'var(--th-bg-secondary)', color: 'var(--th-text-dim)' }}>{t}</span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className={clsx('text-[8px] font-bold px-1.5 py-0.5 rounded', impact === 'High' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600')}>
          {impact} Impact
        </span>
        <span className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>Added {daysAgo(project.createdAt)}</span>
      </div>
    </motion.div>
  );
}

function PlanningCard({ project, onSelect }) {
  const col = getColor(project.title);
  const progress = project.metrics?.portfolioScore ? Math.round(project.metrics.portfolioScore * 10) : 70;
  const tasks = project.tasks?.slice(0, 3) || [
    { title: 'Architecture', status: 'done' },
    { title: 'DB Schema', status: 'done' },
    { title: 'API Design', status: 'todo' },
  ];

  return (
    <motion.div layout onClick={() => onSelect?.(project)}
      className={clsx(card, 'p-3.5 cursor-pointer hover:-translate-y-0.5 transition-all')}
      style={cardStyle}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[10px] shrink-0" style={{ background: col }}>
            {project.title?.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-bold truncate" style={{ color: 'var(--th-text)' }}>{project.title}</p>
            <p className="text-[10px] line-clamp-1 mt-0.5" style={{ color: 'var(--th-text-dim)' }}>{project.description}</p>
          </div>
        </div>
        <div className="relative w-9 h-9 shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--th-bg-secondary)" strokeWidth="3" />
            <circle cx="18" cy="18" r="15" fill="none" stroke="#3b82f6" strokeWidth="3"
              strokeDasharray={`${progress} ${100 - progress}`} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold" style={{ color: 'var(--th-text)' }}>{progress}%</span>
        </div>
      </div>
      <div className="space-y-1 mb-2">
        {tasks.map((t, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {t.status === 'done'
              ? <Check className="w-3 h-3 text-emerald-500 shrink-0" />
              : <Circle className="w-3 h-3 shrink-0" style={{ color: 'var(--th-border)' }} />}
            <span className="text-[10px]" style={{ color: t.status === 'done' ? 'var(--th-text-dim)' : 'var(--th-text)' }}>{t.title}</span>
          </div>
        ))}
      </div>
      <p className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>
        Target: {project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Jun 15'}
      </p>
    </motion.div>
  );
}

function BuildingCard({ project, onSelect, selected }) {
  const col = getColor(project.title);
  const m = project.metrics || {};
  const nextTask = project.tasks?.find(t => t.status !== 'done')?.title || 'Implement subscription flow';

  return (
    <motion.div layout onClick={() => onSelect?.(project)}
      className={clsx(card, 'p-3.5 cursor-pointer hover:-translate-y-0.5 transition-all', selected && 'ring-2 ring-amber-400/60')}
      style={cardStyle}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[10px] shrink-0" style={{ background: col }}>
            {project.title?.charAt(0)}
          </div>
          <p className="text-[12px] font-bold truncate" style={{ color: 'var(--th-text)' }}>{project.title}</p>
        </div>
        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-500 shrink-0">High</span>
      </div>
      <div className="mb-2">
        <p className="text-[9px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'var(--th-text-dim)' }}>Current Milestone</p>
        <p className="text-[11px] font-semibold" style={{ color: 'var(--th-text)' }}>Payments & Subscriptions</p>
      </div>
      <div className="flex items-start gap-1.5 mb-3">
        <Circle className="w-3 h-3 mt-0.5 shrink-0" style={{ color: 'var(--th-border)' }} />
        <div>
          <p className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>Next Task</p>
          <p className="text-[10px] font-medium" style={{ color: 'var(--th-text)' }}>{nextTask}</p>
        </div>
      </div>
      {[
        { label: 'Backend', pct: 70, color: '#f59e0b' },
        { label: 'Frontend', pct: 50, color: '#3b82f6' },
        { label: 'Testing', pct: 0, color: '#8b5cf6' },
      ].map(bar => (
        <div key={bar.label} className="mb-1.5">
          <div className="flex justify-between text-[9px] mb-0.5">
            <span style={{ color: 'var(--th-text-dim)' }}>{bar.label}</span>
            <span className="font-semibold" style={{ color: bar.color }}>{bar.pct}%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--th-bg-secondary)' }}>
            <div className="h-full rounded-full" style={{ width: `${bar.pct}%`, background: bar.color }} />
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 flex-wrap text-[8px] mt-2 pt-2" style={{ color: 'var(--th-text-dim)', borderTop: '1px solid var(--th-border)' }}>
        <span className="flex items-center gap-0.5"><GitCommit className="w-2.5 h-2.5" />{m.commitCount || 24} commits</span>
        <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{timeAgo(project.updatedAt)}</span>
        <span className="flex items-center gap-0.5"><GitBranch className="w-2.5 h-2.5" />main</span>
        <span className="flex items-center gap-0.5"><Flame className="w-2.5 h-2.5" />{m.buildStreak || 14}d streak</span>
        <span className="flex items-center gap-0.5 text-red-500"><AlertTriangle className="w-2.5 h-2.5" />1 blocker</span>
      </div>
      <div className="flex -space-x-1.5 mt-2">
        {['#8b5cf6', '#10b981', '#3b82f6'].map(c => (
          <div key={c} className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[7px] font-bold text-white"
            style={{ background: c, borderColor: 'var(--th-card-solid)' }}>S</div>
        ))}
      </div>
    </motion.div>
  );
}

function TestingCard({ project, onSelect }) {
  const col = getColor(project.title);
  const checks = [
    { label: 'Test Cases', pct: 75 },
    { label: 'Coverage', pct: 62 },
    { label: 'Deployment Ready', pct: 0, text: 'No' },
  ];

  return (
    <motion.div layout onClick={() => onSelect?.(project)}
      className={clsx(card, 'p-3.5 cursor-pointer hover:-translate-y-0.5 transition-all')}
      style={cardStyle}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[10px] shrink-0" style={{ background: col }}>
            {project.title?.charAt(0)}
          </div>
          <p className="text-[12px] font-bold truncate" style={{ color: 'var(--th-text)' }}>{project.title}</p>
        </div>
        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 shrink-0">Low</span>
      </div>
      <div className="flex items-center gap-3 mb-2 text-[10px]">
        <span style={{ color: 'var(--th-text-dim)' }}>Bugs: <strong style={{ color: 'var(--th-text)' }}>4</strong> total</span>
        <span className="text-red-500 font-semibold">1 Critical</span>
      </div>
      <div className="space-y-1.5">
        {checks.map(c => (
          <div key={c.label}>
            <div className="flex justify-between text-[9px] mb-0.5">
              <span style={{ color: 'var(--th-text-dim)' }}>{c.label}</span>
              <span className="font-semibold" style={{ color: 'var(--th-text)' }}>{c.text ?? `${c.pct}%`}</span>
            </div>
            {!c.text && (
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--th-bg-secondary)' }}>
                <div className="h-full rounded-full bg-violet-500" style={{ width: `${c.pct}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ShippedCard({ project, onSelect }) {
  const col = getColor(project.title);
  const scoreLabel = formatPortfolioScore(project.metrics?.portfolioScore, 9.1);
  const scoreNum = parseFloat(scoreLabel);
  const ringR = 15;
  const ringC = 2 * Math.PI * ringR;
  const ringLen = (scoreNum / 10) * ringC;

  return (
    <motion.div layout onClick={() => onSelect?.(project)}
      className={clsx(card, 'p-3.5 cursor-pointer hover:-translate-y-0.5 transition-all overflow-hidden')}
      style={cardStyle}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[10px] shrink-0" style={{ background: col }}>
            {project.title?.charAt(0)}
          </div>
          <p className="text-[12px] font-bold truncate" style={{ color: 'var(--th-text)' }}>{project.title}</p>
        </div>
        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 shrink-0">Live</span>
      </div>
      <div className="space-y-0.5 mb-2 text-[10px]" style={{ color: 'var(--th-text-dim)' }}>
        <p>Launched: {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'May 1, 2025'}</p>
        <p>Version: v1.0.0</p>
        <p>{project.metrics?.commitCount || 156} commits</p>
      </div>
      <div className="flex items-center gap-2.5 pt-2 min-w-0 overflow-hidden" style={{ borderTop: '1px solid var(--th-border)' }}>
        <div className="relative w-10 h-10 shrink-0 overflow-hidden">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r={ringR} fill="none" stroke="var(--th-bg-secondary)" strokeWidth="3" />
            <circle cx="18" cy="18" r={ringR} fill="none" stroke="#10b981" strokeWidth="3"
              strokeDasharray={`${ringLen} ${ringC - ringLen}`} strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-emerald-600 tabular-nums leading-none">
            {scoreLabel}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold truncate" style={{ color: 'var(--th-text)' }}>Portfolio Score</p>
          <p className="text-[9px] tabular-nums truncate" style={{ color: 'var(--th-text-dim)' }}>{scoreLabel} / 10</p>
        </div>
      </div>
    </motion.div>
  );
}

function StageCard({ project, stageKey, onSelect, selected }) {
  switch (stageKey) {
    case 'IDEA': return <IdeaCard project={project} onSelect={onSelect} />;
    case 'PLANNING': return <PlanningCard project={project} onSelect={onSelect} />;
    case 'BUILDING': return <BuildingCard project={project} onSelect={onSelect} selected={selected} />;
    case 'TESTING': return <TestingCard project={project} onSelect={onSelect} />;
    case 'SHIPPED': return <ShippedCard project={project} onSelect={onSelect} />;
    default: return <IdeaCard project={project} onSelect={onSelect} />;
  }
}

/** Wraps cards with drag support and prev/next stage shortcuts */
function PipelineCardChrome({ project, stageKey, onSelect, selected, onMoveStage, isMoving, children }) {
  const prevKey = getAdjacentStage(stageKey, 'prev');
  const nextKey = getAdjacentStage(stageKey, 'next');
  const prevMeta = prevKey ? getStageMeta(prevKey) : null;
  const nextMeta = nextKey ? getStageMeta(nextKey) : null;

  const handleDragStart = (e) => {
    e.dataTransfer.setData(DRAG_MIME, JSON.stringify({ projectId: project.id, fromStage: stageKey }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <motion.div layout className="group">
      <div
        draggable={!isMoving}
        onDragStart={handleDragStart}
        className={clsx('relative', isMoving && 'opacity-50 pointer-events-none')}
      >
        {!isMoving && (
          <div
            className="absolute top-2 right-2 z-10 p-0.5 rounded opacity-0 group-hover:opacity-40 cursor-grab active:cursor-grabbing"
            style={{ color: 'var(--th-text-dim)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-3 h-3" />
          </div>
        )}
        {isMoving && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/60">
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--th-primary)' }} />
          </div>
        )}
        {children}
      </div>

      <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          type="button"
          disabled={!prevKey || isMoving}
          onClick={(e) => { e.stopPropagation(); onMoveStage(project.id, prevKey); }}
          className={clsx(
            'flex-1 flex items-center justify-center gap-0.5 py-1 rounded-lg text-[9px] font-semibold transition-colors',
            prevKey ? 'hover:opacity-90' : 'opacity-30 cursor-not-allowed'
          )}
          style={{ background: 'var(--th-bg-secondary)', color: 'var(--th-text-secondary)', border: '1px solid var(--th-border)' }}
          title={prevMeta ? `Move to ${prevMeta.label}` : undefined}
        >
          <ChevronLeft className="w-3 h-3 shrink-0" />
          <span className="truncate">{prevMeta?.label || 'Back'}</span>
        </button>
        <button
          type="button"
          disabled={!nextKey || isMoving}
          onClick={(e) => { e.stopPropagation(); onMoveStage(project.id, nextKey); }}
          className={clsx(
            'flex-1 flex items-center justify-center gap-0.5 py-1 rounded-lg text-[9px] font-semibold transition-colors',
            nextKey ? 'hover:opacity-90' : 'opacity-30 cursor-not-allowed'
          )}
          style={{ background: 'var(--th-bg-secondary)', color: 'var(--th-text-secondary)', border: '1px solid var(--th-border)' }}
          title={nextMeta ? `Move to ${nextMeta.label}` : undefined}
        >
          <span className="truncate">{nextMeta?.label || 'Next'}</span>
          <ChevronRight className="w-3 h-3 shrink-0" />
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Project Context Drawer ─── */
function ProjectContextDrawer({ project, onClose, onMoveStage, isMoving }) {
  const [tab, setTab] = useState('ai');

  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!project) return;
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [project, handleEscape]);

  const col = getColor(project?.title);
  const scoreLabel = formatPortfolioScore(project?.metrics?.portfolioScore, 8.6);
  const score = parseFloat(scoreLabel);
  const scoreRingR = 15;
  const scoreRingC = 2 * Math.PI * scoreRingR;
  const scoreRingLen = (score / 10) * scoreRingC;
  const statusLabel = { IDEA: 'Idea', PLANNING: 'Planning', BUILDING: 'Building', TESTING: 'Testing', SHIPPED: 'Shipped' }[project?.status] || 'Building';
  const statusCls = {
    BUILDING: 'bg-amber-50 text-amber-600',
    SHIPPED: 'bg-emerald-50 text-emerald-600',
    TESTING: 'bg-violet-50 text-violet-600',
    PLANNING: 'bg-blue-50 text-blue-600',
  }[project?.status] || 'bg-amber-50 text-amber-600';

  const tabs = [
    { key: 'ai', Icon: Sparkles },
    { key: 'folder', Icon: FolderKanban },
    { key: 'chart', Icon: BarChart3 },
    { key: 'doc', Icon: FileText },
  ];

  const aiTasks = [
    'Add webhook retry with exponential backoff',
    'Implement subscription tier management',
    'Set up Stripe webhook signature validation',
  ];

  const improvements = [
    { text: 'Add Redis caching layer', priority: 'High' },
    { text: 'Write integration tests for payments', priority: 'Medium' },
    { text: 'Add API rate limiting', priority: 'Medium' },
  ];

  const metrics = [
    { label: 'Scalability', value: 8.5 },
    { label: 'Testing', value: 7.8 },
    { label: 'Code Quality', value: 8.2 },
    { label: 'Documentation', value: 8.0 },
  ];

  return createPortal(
    <AnimatePresence>
      {project && (
        <div key="project-context-drawer" className="fixed inset-0 z-[200]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="absolute inset-0 bg-black/25 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 34, stiffness: 300, mass: 0.85 }}
            className="absolute top-0 right-0 h-full w-full max-w-[320px] shadow-2xl flex flex-col"
            style={{ background: 'var(--th-card-solid)', borderLeft: '1px solid var(--th-border)' }}
          >
        <div className="flex items-center justify-between p-4 border-b shrink-0" style={{ borderColor: 'var(--th-border)' }}>
          <h3 className="text-[13px] font-bold" style={{ color: 'var(--th-text)' }}>Project Context</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-70 transition-opacity" style={{ color: 'var(--th-text-dim)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 border-b shrink-0" style={{ borderColor: 'var(--th-border)' }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0" style={{ background: col }}>
              {project.title?.charAt(0)}
            </div>
            <div>
              <p className="text-[14px] font-bold" style={{ color: 'var(--th-text)' }}>{project.title}</p>
              <p className="text-[10px] mt-0.5 line-clamp-2" style={{ color: 'var(--th-text-dim)' }}>
                {project.description || 'No description'}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded', statusCls)}>{statusLabel}</span>
                {(project.metrics?.buildStreak > 0) && (
                  <span className="text-[9px] flex items-center gap-0.5" style={{ color: 'var(--th-text-dim)' }}>
                    <Flame className="w-2.5 h-2.5 text-orange-500" /> {project.metrics.buildStreak} day streak
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-1 mt-3">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={clsx('p-2 rounded-lg transition-colors', tab === t.key ? 'bg-amber-50' : 'hover:opacity-70')}
                style={{ color: tab === t.key ? 'var(--th-primary)' : 'var(--th-text-dim)' }}>
                <t.Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--th-border)' }}>
            <p className="text-[9px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--th-text-dim)' }}>Move to stage</p>
            <div className="flex flex-wrap gap-1.5">
              {STAGES.map(stage => {
                const isCurrent = project.status === stage.key;
                return (
                  <button
                    key={stage.key}
                    type="button"
                    disabled={isCurrent || isMoving}
                    onClick={() => onMoveStage?.(project.id, stage.key)}
                    className={clsx(
                      'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-semibold transition-all',
                      isCurrent ? 'ring-2 ring-offset-1' : 'hover:scale-[1.02] disabled:opacity-40'
                    )}
                    style={{
                      background: `${stage.color}18`,
                      color: stage.color,
                      ...(isCurrent ? { boxShadow: `0 0 0 2px ${stage.color}` } : {}),
                    }}
                  >
                    <stage.Icon className="w-3 h-3" />
                    {stage.label}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 mt-2">
              {(() => {
                const prevKey = getAdjacentStage(project.status, 'prev');
                const nextKey = getAdjacentStage(project.status, 'next');
                const prevMeta = prevKey ? getStageMeta(prevKey) : null;
                const nextMeta = nextKey ? getStageMeta(nextKey) : null;
                return (
                  <>
                    <button
                      type="button"
                      disabled={!prevKey || isMoving}
                      onClick={() => onMoveStage?.(project.id, prevKey)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-semibold transition-colors disabled:opacity-40"
                      style={{ background: 'var(--th-bg-secondary)', color: 'var(--th-text-secondary)', border: '1px solid var(--th-border)' }}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      {prevMeta?.label || 'Previous'}
                    </button>
                    <button
                      type="button"
                      disabled={!nextKey || isMoving}
                      onClick={() => onMoveStage?.(project.id, nextKey)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-semibold transition-colors disabled:opacity-40"
                      style={{ background: 'var(--th-bg-secondary)', color: 'var(--th-text-secondary)', border: '1px solid var(--th-border)' }}
                    >
                      {nextMeta?.label || 'Next'}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--th-primary)' }} />
              <p className="text-[11px] font-bold" style={{ color: 'var(--th-text)' }}>AI Builder</p>
            </div>
            <div className="space-y-2">
              {aiTasks.map((task, i) => (
                <label key={i} className="flex items-start gap-2 p-2 rounded-lg cursor-pointer" style={{ background: 'var(--th-bg-secondary)' }}>
                  <input type="checkbox" className="mt-0.5 rounded" />
                  <span className="text-[10px] leading-relaxed" style={{ color: 'var(--th-text-secondary)' }}>{task}</span>
                </label>
              ))}
            </div>
            <button className="w-full mt-2 text-[10px] font-semibold py-2 rounded-lg transition-colors hover:opacity-90"
              style={{ background: 'rgba(var(--th-primary-rgb), 0.1)', color: 'var(--th-primary)' }}>
              Generate More Ideas
            </button>
          </div>

          <div className="p-3 rounded-xl" style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Briefcase className="w-3.5 h-3.5" style={{ color: 'var(--th-primary)' }} />
              <p className="text-[11px] font-bold" style={{ color: 'var(--th-text)' }}>Job Sync</p>
            </div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold" style={{ color: 'var(--th-text)' }}>Backend Engineer Role</p>
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600">Active</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--th-border)' }}>
                <div className="h-full rounded-full bg-emerald-500" style={{ width: '82%' }} />
              </div>
              <span className="text-[10px] font-bold text-emerald-600">82%</span>
            </div>
            <p className="text-[9px] mb-1.5" style={{ color: 'var(--th-text-dim)' }}>Suggested improvements</p>
            {improvements.map((imp, i) => (
              <div key={i} className="flex items-center gap-1.5 mb-1">
                {imp.priority === 'High'
                  ? <ArrowUp className="w-3 h-3 text-red-500 shrink-0" />
                  : <ArrowDown className="w-3 h-3 text-amber-500 shrink-0" />}
                <span className="text-[10px] flex-1" style={{ color: 'var(--th-text-secondary)' }}>{imp.text}</span>
                <span className={clsx('text-[8px] font-bold', imp.priority === 'High' ? 'text-red-500' : 'text-amber-500')}>{imp.priority}</span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl" style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)' }}>
            <div className="flex items-center gap-1.5 mb-3">
              <Target className="w-3.5 h-3.5" style={{ color: 'var(--th-primary)' }} />
              <p className="text-[11px] font-bold" style={{ color: 'var(--th-text)' }}>AI Portfolio Review</p>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="relative w-14 h-14 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r={scoreRingR} fill="none" stroke="var(--th-border)" strokeWidth="3" />
                  <circle cx="18" cy="18" r={scoreRingR} fill="none" stroke="#10b981" strokeWidth="3"
                    strokeDasharray={`${scoreRingLen} ${scoreRingC - scoreRingLen}`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums" style={{ color: 'var(--th-text)' }}>
                  {scoreLabel}
                </span>
              </div>
              <div>
                <p className="text-[11px] font-bold tabular-nums" style={{ color: 'var(--th-text)' }}>{scoreLabel}/10</p>
                <p className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>Great progress! Keep building.</p>
              </div>
            </div>
            {metrics.map(m => (
              <div key={m.label} className="flex items-center justify-between mb-1.5">
                <span className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>{m.label}</span>
                <span className="text-[10px] font-bold tabular-nums" style={{ color: 'var(--th-text)' }}>{m.value}/10</span>
              </div>
            ))}
            <button className="w-full mt-2 text-[10px] font-semibold py-2 rounded-lg text-white transition-colors hover:opacity-90"
              style={{ background: 'var(--th-primary)' }}>
              Improve with AI
            </button>
          </div>
        </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* ─── Main Pipeline Tab ─── */
export default function PipelineTab() {
  const { data: pipelineData } = usePipeline();
  const moveMutation = useMovePipelineProject();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  const pipeline = pipelineData?.data?.pipeline || pipelineData?.pipeline || {};

  const filteredPipeline = useMemo(() => {
    const result = {};
    for (const stage of STAGES) {
      let items = pipeline[stage.key] || [];
      if (search) items = items.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()));
      result[stage.key] = items;
    }
    return result;
  }, [pipeline, search]);

  const openProject = (proj) => setSelected(proj);
  const closeDrawer = () => setSelected(null);

  const handleMoveStage = useCallback((projectId, newStatus) => {
    if (!projectId || !newStatus) return;

    let currentStatus = null;
    for (const stage of STAGES) {
      if ((pipeline[stage.key] || []).some(p => p.id === projectId)) {
        currentStatus = stage.key;
        break;
      }
    }
    if (currentStatus === newStatus) return;

    moveMutation.mutate(
      { projectId, newStatus },
      {
        onSuccess: (res) => {
          const updated = res?.data?.project;
          if (updated && selected?.id === updated.id) {
            setSelected(updated);
          }
        },
      }
    );
  }, [moveMutation, pipeline, selected]);

  const handleColumnDragOver = useCallback((e, stageKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageKey);
  }, []);

  const handleColumnDrop = useCallback((e, stageKey) => {
    e.preventDefault();
    setDragOverStage(null);
    const payload = parseDragPayload(e);
    if (!payload || payload.fromStage === stageKey) return;
    handleMoveStage(payload.projectId, stageKey);
  }, [handleMoveStage]);

  const movingProjectId = moveMutation.isPending ? moveMutation.variables?.projectId : null;

  const addLabels = { IDEA: 'Add Idea', PLANNING: 'Add Project', BUILDING: 'Add Project', TESTING: 'Add Project', SHIPPED: 'Add Project' };

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <PipelineKpis pipeline={pipeline} />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--th-text-dim)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects in pipeline..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-[12px] outline-none"
            style={{ background: 'var(--th-bg-secondary)', color: 'var(--th-text)', border: '1px solid var(--th-border)' }}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-1 px-3 py-2 rounded-xl text-[11px] font-medium"
            style={{ background: 'var(--th-bg-secondary)', color: 'var(--th-text-secondary)', border: '1px solid var(--th-border)' }}>
            Group: Stages <ChevronDown className="w-3 h-3" />
          </button>
          <button className="flex items-center gap-1 px-3 py-2 rounded-xl text-[11px] font-medium"
            style={{ background: 'var(--th-bg-secondary)', color: 'var(--th-text-secondary)', border: '1px solid var(--th-border)' }}>
            <Filter className="w-3 h-3" /> Filter
          </button>
          <button className="flex items-center gap-1 px-3 py-2 rounded-xl text-[11px] font-medium"
            style={{ background: 'var(--th-bg-secondary)', color: 'var(--th-text-secondary)', border: '1px solid var(--th-border)' }}>
            <SlidersHorizontal className="w-3 h-3" /> Sort
          </button>
        </div>
      </div>

      {/* Kanban — full width */}
      <div className="w-full overflow-x-auto hide-scrollbar">
        <div className="flex gap-3 w-full min-w-0 pb-2">
          {STAGES.map(stage => {
            const items = filteredPipeline[stage.key] || [];
            return (
              <div key={stage.key} className="flex-1 min-w-[220px] max-w-none flex flex-col">
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
                      <stage.Icon className="w-3.5 h-3.5" style={{ color: stage.color }} />
                      <span className="text-[12px] font-bold" style={{ color: 'var(--th-text)' }}>{stage.label}</span>
                      <span className="text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: `${stage.color}18`, color: stage.color }}>
                        {items.length}
                      </span>
                    </div>
                    <button className="p-0.5 opacity-50 hover:opacity-100"><MoreVertical className="w-3.5 h-3.5" style={{ color: 'var(--th-text-dim)' }} /></button>
                  </div>

                  {/* Column body — drop target */}
                  <div
                    onDragOver={(e) => handleColumnDragOver(e, stage.key)}
                    onDragLeave={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget)) {
                        setDragOverStage(prev => (prev === stage.key ? null : prev));
                      }
                    }}
                    onDrop={(e) => handleColumnDrop(e, stage.key)}
                    className={clsx(
                      'flex-1 rounded-xl p-2 space-y-2 min-h-[420px] transition-all duration-200',
                      stage.highlight && 'ring-1 ring-amber-200/50',
                      dragOverStage === stage.key && 'ring-2 ring-offset-2'
                    )}
                    style={{
                      background: stage.bg,
                      border: dragOverStage === stage.key ? `2px dashed ${stage.color}` : '1px solid var(--th-border)',
                      boxShadow: dragOverStage === stage.key ? `0 0 0 3px ${stage.color}22` : undefined,
                    }}
                  >
                    <AnimatePresence>
                      {items.map(p => (
                        <PipelineCardChrome
                          key={p.id}
                          project={p}
                          stageKey={stage.key}
                          onSelect={openProject}
                          selected={selected?.id === p.id}
                          onMoveStage={handleMoveStage}
                          isMoving={movingProjectId === p.id}
                        >
                          <StageCard
                            project={p}
                            stageKey={stage.key}
                            onSelect={openProject}
                            selected={selected?.id === p.id}
                          />
                        </PipelineCardChrome>
                      ))}
                    </AnimatePresence>
                    {items.length === 0 && (
                      <div className="flex items-center justify-center h-20 opacity-40">
                        <p className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>No projects</p>
                      </div>
                    )}
                    <button className="w-full flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-semibold transition-colors hover:opacity-80"
                      style={{ color: 'var(--th-text-dim)', border: '1px dashed var(--th-border)' }}>
                      <Plus className="w-3 h-3" /> {addLabels[stage.key]}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Board footer */}
          <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--th-border)' }}>
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-lg" style={{ border: '1px solid var(--th-border)' }}>
                <ChevronLeft className="w-3.5 h-3.5" style={{ color: 'var(--th-text-dim)' }} />
              </button>
              <button className="p-1.5 rounded-lg" style={{ border: '1px solid var(--th-border)' }}>
                <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--th-text-dim)' }} />
              </button>
              <span className="text-[10px] ml-1" style={{ color: 'var(--th-text-dim)' }}>Scroll horizontally to view all stages</span>
            </div>
            <span className="text-[10px] hidden sm:block" style={{ color: 'var(--th-text-dim)' }}>
              Drag cards between columns or use arrow buttons to move stages
            </span>
            <button className="flex items-center gap-1 text-[10px] font-semibold px-3 py-1.5 rounded-lg"
              style={{ color: 'var(--th-text-secondary)', border: '1px solid var(--th-border)' }}>
              <Settings className="w-3 h-3" /> Pipeline Settings
            </button>
          </div>
        </div>

      {/* Project Context drawer — opens on card click only */}
      <ProjectContextDrawer
        project={selected}
        onClose={closeDrawer}
        onMoveStage={handleMoveStage}
        isMoving={!!movingProjectId && movingProjectId === selected?.id}
      />
    </div>
  );
}
