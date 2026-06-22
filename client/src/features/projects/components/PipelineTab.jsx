import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, MoreVertical, GitCommit, Clock, GitBranch, Search, Filter,
  SlidersHorizontal, ChevronDown, Settings, Lightbulb, ClipboardList,
  Hammer, FlaskConical, Rocket, X, FolderKanban, BarChart3, FileText,
  Check, Circle, AlertTriangle, Flame, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Plus, Briefcase, Target,
  GripVertical, Loader2, PenLine, Trash2,
} from 'lucide-react';
import { usePipeline, useMovePipelineProject, useBuildSuggestions, useGenerateBuildSuggestions, useCreateTask, useAnalyzeProject, useUpdateTask, useDeleteTask } from '../hooks/useProjects';
import clsx from 'clsx';
import { Modal } from '../../../design-system/components/Modal';

const card = 'rounded-2xl shadow-sm';
const cardStyle = { background: 'var(--th-card-solid)', border: '1px solid var(--th-border)', boxShadow: 'var(--th-shadow)' };

const STAGES = [
  { key: 'IDEA', label: 'Idea', Icon: Lightbulb, color: '#6b7280', bg: 'var(--th-card)' },
  { key: 'PLANNING', label: 'Planning', Icon: ClipboardList, color: '#3b82f6', bg: 'var(--th-card)' },
  { key: 'BUILDING', label: 'Building', Icon: Hammer, color: '#f59e0b', bg: 'var(--th-card)', highlight: true },
  { key: 'TESTING', label: 'Testing', Icon: FlaskConical, color: '#8b5cf6', bg: 'var(--th-card)' },
  { key: 'SHIPPED', label: 'Shipped', Icon: Rocket, color: '#10b981', bg: 'var(--th-card)' },
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
  const idea = pipeline.IDEA?.length || 0;
  const activeBuilds = building + planning + testing + idea;
  const shipped = pipeline.SHIPPED?.length || 0;

  const allProjects = [
    ...(pipeline.IDEA || []),
    ...(pipeline.PLANNING || []),
    ...(pipeline.BUILDING || []),
    ...(pipeline.TESTING || []),
    ...(pipeline.SHIPPED || []),
  ];

  let blockedCount = 0;
  let totalCommits = 0;
  let maxStreak = 0;

  allProjects.forEach(p => {
    totalCommits += (p.metrics?.commitCount || 0);
    maxStreak = Math.max(maxStreak, p.metrics?.buildStreak || 0);
    const hasBlocker = p.tasks?.some(t => t.status === 'blocked' || t.priority === 'critical');
    if (hasBlocker) blockedCount++;
  });

  const generateBars = (base, offset) => {
    return Array.from({ length: 7 }).map((_, i) => Math.max(15, (Math.abs(Math.sin((base || 14) * (i + offset))) * 100).toFixed(0)));
  };

  const kpis = [
    { label: 'Active Builds', value: activeBuilds, sub: 'In Progress', color: '#10b981', bars: generateBars(activeBuilds, 1) },
    { label: 'Shipping Velocity', value: shipped, sub: 'Total Shipped', color: '#f59e0b', bars: generateBars(shipped, 2) },
    { label: 'Blocked Projects', value: blockedCount, sub: 'Needs attention', color: '#ef4444', bars: generateBars(blockedCount, 3), warn: true },
    { label: 'Build Momentum', value: totalCommits, sub: 'Total Commits', color: '#3b82f6', bars: generateBars(totalCommits, 4), streak: maxStreak > 0 ? `${maxStreak} day streak` : null },
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
              <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold mt-1.5 px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
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
  const impact = project.priority === 'CRITICAL' || project.priority === 'HIGH' ? 'High' : project.priority === 'MEDIUM' ? 'Medium' : 'Low';

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
  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter(t => t.status === 'done').length || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const tasks = project.tasks?.slice(0, 3) || [];

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
        {tasks.length > 0 ? tasks.map((t, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {t.status === 'done'
              ? <Check className="w-3 h-3 text-emerald-500 shrink-0" />
              : <Circle className="w-3 h-3 shrink-0" style={{ color: 'var(--th-border)' }} />}
            <span className="text-[10px] truncate" style={{ color: t.status === 'done' ? 'var(--th-text-dim)' : 'var(--th-text)' }}>{t.title}</span>
          </div>
        )) : (
          <p className="text-[10px] italic" style={{ color: 'var(--th-text-dim)' }}>No tasks planned yet</p>
        )}
      </div>
      <p className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>
        Target: {project.deadline ? new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No deadline set'}
      </p>
    </motion.div>
  );
}

function BuildingCard({ project, onSelect, selected }) {
  const col = getColor(project.title);
  const m = project.metrics || {};
  const tasks = project.tasks || [];
  const nextTask = tasks.find(t => t.status !== 'done');
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const blockersCount = tasks.filter(t => t.status === 'blocked' || t.priority === 'critical').length;
  const isHighPriority = project.priority === 'CRITICAL' || project.priority === 'HIGH';

  return (
    <motion.div layout onClick={() => onSelect?.(project)}
      className={clsx(card, 'p-3.5 cursor-pointer hover:-translate-y-0.5 transition-all', selected && 'ring-2 ring-amber-400/60')}
      style={cardStyle}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[10px] shrink-0" style={{ background: col }}>
            {project.title?.charAt(0)?.toUpperCase()}
          </div>
          <p className="text-[12px] font-bold truncate" style={{ color: 'var(--th-text)' }}>{project.title}</p>
        </div>
        {isHighPriority && (
          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-500 shrink-0">High</span>
        )}
      </div>

      <div className="flex items-start gap-1.5 mb-3 mt-3">
        <Circle className="w-3 h-3 mt-0.5 shrink-0" style={{ color: 'var(--th-border)' }} />
        <div>
          <p className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>Next Task</p>
          <p className="text-[10px] font-medium leading-tight mt-0.5 line-clamp-2" style={{ color: 'var(--th-text)' }}>
            {nextTask ? nextTask.title : 'No pending tasks'}
          </p>
        </div>
      </div>

      <div className="mb-1.5">
        <div className="flex justify-between text-[9px] mb-0.5">
          <span style={{ color: 'var(--th-text-dim)' }}>Task Progress</span>
          <span className="font-semibold" style={{ color: '#f59e0b' }}>{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--th-bg-secondary)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: '#f59e0b' }} />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap text-[8px] mt-3 pt-2" style={{ color: 'var(--th-text-dim)', borderTop: '1px solid var(--th-border)' }}>
        <span className="flex items-center gap-0.5"><GitCommit className="w-2.5 h-2.5" />{m.commitCount || 0} commits</span>
        <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{timeAgo(project.updatedAt)}</span>
        <span className="flex items-center gap-0.5"><GitBranch className="w-2.5 h-2.5" />main</span>
        {(m.buildStreak > 0) && (
          <span className="flex items-center gap-0.5"><Flame className="w-2.5 h-2.5" />{m.buildStreak}d streak</span>
        )}
        {blockersCount > 0 && (
          <span className="flex items-center gap-0.5 text-red-500"><AlertTriangle className="w-2.5 h-2.5" />{blockersCount} blocker{blockersCount !== 1 && 's'}</span>
        )}
      </div>
      
      {project.stack?.length > 0 && (
        <div className="flex -space-x-1.5 mt-2">
          {project.stack.slice(0, 3).map(s => (
            <div key={s} className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[7px] font-bold text-white shrink-0"
              style={{ background: getColor(s), borderColor: 'var(--th-card-solid)' }}>
              {s.charAt(0)}
            </div>
          ))}
          {project.stack.length > 3 && (
            <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[7px] font-bold text-white shrink-0"
              style={{ background: 'var(--th-border)', borderColor: 'var(--th-card-solid)' }}>
              +{project.stack.length - 3}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function TestingCard({ project, onSelect }) {
  const col = getColor(project.title);
  const tasks = project.tasks || [];
  const bugTasks = tasks.filter(t => t.title.toLowerCase().includes('bug') || t.title.toLowerCase().includes('fix'));
  const criticalBugs = bugTasks.filter(t => t.priority === 'critical' || t.priority === 'high').length;
  const isHighPriority = project.priority === 'CRITICAL' || project.priority === 'HIGH';

  const pendingTasks = tasks.filter(t => t.status !== 'done').length;
  const allCriticalDone = tasks.filter(t => t.priority === 'critical' || t.priority === 'high').every(t => t.status === 'done');

  const checks = [
    { label: 'Tasks Remaining', text: String(pendingTasks), pct: pendingTasks > 0 ? 50 : 100 },
    { label: 'Critical Tasks Done', text: allCriticalDone ? 'Yes' : 'No', pct: allCriticalDone ? 100 : 0 },
  ];

  return (
    <motion.div layout onClick={() => onSelect?.(project)}
      className={clsx(card, 'p-3.5 cursor-pointer hover:-translate-y-0.5 transition-all')}
      style={cardStyle}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[10px] shrink-0" style={{ background: col }}>
            {project.title?.charAt(0)?.toUpperCase()}
          </div>
          <p className="text-[12px] font-bold truncate" style={{ color: 'var(--th-text)' }}>{project.title}</p>
        </div>
        {isHighPriority && (
          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-500 shrink-0">High</span>
        )}
      </div>
      <div className="flex items-center gap-3 mb-2 text-[10px]">
        <span style={{ color: 'var(--th-text-dim)' }}>Bugs/Fixes: <strong style={{ color: 'var(--th-text)' }}>{bugTasks.length}</strong> total</span>
        {criticalBugs > 0 && <span className="text-red-500 font-semibold">{criticalBugs} Critical</span>}
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
  const scoreLabel = formatPortfolioScore(project.metrics?.portfolioScore, 0);
  const scoreNum = parseFloat(scoreLabel);
  const ringR = 15;
  const ringC = 2 * Math.PI * ringR;
  const ringLen = (scoreNum / 10) * ringC;
  const commitCount = project.metrics?.commitCount || 0;

  return (
    <motion.div layout onClick={() => onSelect?.(project)}
      className={clsx(card, 'p-3.5 cursor-pointer hover:-translate-y-0.5 transition-all overflow-hidden')}
      style={cardStyle}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[10px] shrink-0" style={{ background: col }}>
            {project.title?.charAt(0)?.toUpperCase()}
          </div>
          <p className="text-[12px] font-bold truncate" style={{ color: 'var(--th-text)' }}>{project.title}</p>
        </div>
        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 shrink-0">Live</span>
      </div>
      <div className="space-y-0.5 mb-2 text-[10px]" style={{ color: 'var(--th-text-dim)' }}>
        <p>Launched: {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}</p>
        <p>{commitCount} commits</p>
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
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl backdrop-blur-[2px]" style={{ background: 'var(--th-bg-secondary)', opacity: 0.8 }}>
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
function ProjectContextDrawer({ project, onClose, onMoveStage, isMoving, onEditProject }) {
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

  // Hooks for AI integrations
  const { data: suggestionsData, isFetching } = useBuildSuggestions(project?.id);
  const generateSuggestions = useGenerateBuildSuggestions();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const analyze = useAnalyzeProject();
  const [createdTasks, setCreatedTasks] = useState(new Set());
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [taskToDelete, setTaskToDelete] = useState(null);
  const aiTasks = suggestionsData?.data?.suggestions || [];

  const handleSaveEdit = async (taskId) => {
    if (!editTaskTitle.trim()) return;
    await updateTask.mutateAsync({ taskId, data: { title: editTaskTitle.trim() } });
    setEditingTaskId(null);
  };

  const handleCreateTask = async (task) => {
    if (createdTasks.has(task.title)) return;
    try {
      await createTask.mutateAsync({ projectId: project.id, data: { title: task.title, description: task.description } });
      setCreatedTasks(prev => new Set(prev).add(task.title));
    } catch (e) {
      console.error(e);
    }
  };

  const col = getColor(project?.title);
  
  // Real intelligence scores
  const int = project?.intelligence || {};
  const avgScore = [int.architectureScore, int.scalabilityScore, int.recruiterScore, int.resumeScore].filter(Boolean);
  const portfolioScore = avgScore.length ? (avgScore.reduce((a,b)=>a+b,0)/avgScore.length).toFixed(1) : (project?.metrics?.portfolioScore ? (project.metrics.portfolioScore / 10).toFixed(1) : '0.0');
  
  const score = parseFloat(portfolioScore);
  const scoreRingR = 15;
  const scoreRingC = 2 * Math.PI * scoreRingR;
  const scoreRingLen = (score / 10) * scoreRingC;
  const statusLabel = { IDEA: 'Idea', PLANNING: 'Planning', BUILDING: 'Building', TESTING: 'Testing', SHIPPED: 'Shipped' }[project?.status] || 'Building';
  const statusCls = {
    BUILDING: 'bg-amber-500/10 text-amber-500',
    SHIPPED: 'bg-emerald-500/10 text-emerald-500',
    TESTING: 'bg-violet-500/10 text-violet-500',
    PLANNING: 'bg-blue-500/10 text-blue-500',
  }[project?.status] || 'bg-amber-500/10 text-amber-500';

  const tabs = [
    { key: 'ai', Icon: Sparkles },
    { key: 'folder', Icon: FolderKanban },
    { key: 'chart', Icon: BarChart3 },
    { key: 'doc', Icon: FileText },
  ];

  const improvements = int.strengths ? [
    ...(int.missingSkills || []).map(s => ({ text: `Add ${s}`, priority: 'High' })),
    ...(int.weaknesses || []).map(w => ({ text: w, priority: 'Medium' }))
  ].slice(0, 4) : [];

  const metrics = [
    { label: 'Scalability', value: int.scalabilityScore || 0 },
    { label: 'Architecture', value: int.architectureScore || 0 },
    { label: 'Resume', value: int.resumeScore || 0 },
    { label: 'Recruiter', value: int.recruiterScore || 0 },
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
          <div className="flex items-center gap-1">
            <button onClick={() => { onClose(); if (onEditProject) onEditProject(project); }} className="p-1.5 rounded-lg hover:opacity-70 transition-opacity" style={{ color: 'var(--th-text-dim)' }}>
              <PenLine className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-70 transition-opacity" style={{ color: 'var(--th-text-dim)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>
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
          {tab === 'ai' && (
            <>
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--th-primary)' }} />
                  <p className="text-[11px] font-bold" style={{ color: 'var(--th-text)' }}>AI Builder</p>
                </div>
                <div className="space-y-2">
                  {isFetching && aiTasks.length === 0 ? (
                    <div className="text-[10px] text-center py-4 italic" style={{ color: 'var(--th-text-dim)' }}>Consulting AI Architect...</div>
                  ) : aiTasks.map((task, i) => (
                    <label key={i} className={clsx("flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-opacity", createdTasks.has(task.title) && "opacity-50")} style={{ background: 'var(--th-bg-secondary)' }}>
                      <input 
                        type="checkbox" 
                        className="mt-0.5 rounded" 
                        checked={createdTasks.has(task.title)} 
                        onChange={() => handleCreateTask(task)} 
                        disabled={createdTasks.has(task.title) || createTask.isPending} 
                      />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold leading-relaxed" style={{ color: 'var(--th-text)' }}>{task.title}</span>
                        <span className="text-[9px] leading-relaxed" style={{ color: 'var(--th-text-secondary)' }}>{task.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <button 
                  onClick={() => generateSuggestions.mutate(project.id)} 
                  disabled={isFetching || generateSuggestions.isPending} 
                  className="w-full mt-2 text-[10px] font-semibold py-2 rounded-lg transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'rgba(var(--th-primary-rgb), 0.1)', color: 'var(--th-primary)' }}>
                  {isFetching || generateSuggestions.isPending ? 'Generating...' : 'Generate More Ideas'}
                </button>
              </div>

              <div className="p-3 rounded-xl" style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)' }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Briefcase className="w-3.5 h-3.5" style={{ color: 'var(--th-primary)' }} />
                  <p className="text-[11px] font-bold" style={{ color: 'var(--th-text)' }}>AI Analysis Feedback</p>
                </div>
                {improvements.length > 0 ? (
                  <>
                    <p className="text-[9px] mb-1.5" style={{ color: 'var(--th-text-dim)' }}>Key Takeaways & Gaps</p>
                    {improvements.map((imp, i) => (
                      <div key={i} className="flex items-start gap-1.5 mb-1.5">
                        {imp.priority === 'High'
                          ? <ArrowDown className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                          : <ArrowUp className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />}
                        <span className="text-[10px] flex-1 leading-tight" style={{ color: 'var(--th-text-secondary)' }}>{imp.text}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="flex flex-col gap-2 py-2">
                    <p className="text-[10px] text-center italic" style={{ color: 'var(--th-text-dim)' }}>Run Project Analysis to see strengths and gaps.</p>
                    <button 
                      onClick={() => analyze.mutate({ projectId: project.id })} 
                      disabled={analyze.isPending}
                      className="w-full text-[10px] font-semibold py-1.5 rounded-lg shadow transition-all hover:opacity-90 disabled:opacity-50 active:scale-[0.98]"
                      style={{ background: 'var(--th-primary)', color: '#fff' }}>
                      {analyze.isPending ? 'Analyzing...' : 'Run Analysis'}
                    </button>
                  </div>
                )}
                {improvements.length > 0 && (
                  <button 
                    onClick={() => analyze.mutate({ projectId: project.id })} 
                    disabled={analyze.isPending}
                    className="w-full mt-2 text-[10px] font-semibold py-1.5 rounded-lg transition-colors hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'rgba(var(--th-primary-rgb), 0.1)', color: 'var(--th-primary)' }}>
                    {analyze.isPending ? 'Analyzing...' : 'Re-Analyze'}
                  </button>
                )}
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
                      {score.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold tabular-nums" style={{ color: 'var(--th-text)' }}>{score.toFixed(1)}/10</p>
                    <p className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>Great progress! Keep building.</p>
                  </div>
                </div>
                <div className="space-y-2 mb-3">
                  {metrics.map(m => (
                    <div key={m.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-semibold" style={{ color: 'var(--th-text-dim)' }}>{m.label}</span>
                        <span className="text-[9px] font-bold" style={{ color: 'var(--th-text)' }}>{m.value.toFixed(1)}</span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--th-border)' }}>
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(m.value / 10) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => analyze.mutate({ projectId: project.id })}
                  disabled={analyze.isPending}
                  className="w-full mt-2 text-[10px] font-semibold py-2 rounded-lg text-white transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'var(--th-primary)' }}>
                  {analyze.isPending ? 'Analyzing Project...' : 'Improve with AI'}
                </button>
              </div>
            </>
          )}

          {tab === 'folder' && (
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <FolderKanban className="w-3.5 h-3.5" style={{ color: 'var(--th-primary)' }} />
                  <p className="text-[11px] font-bold" style={{ color: 'var(--th-text)' }}>Task Manager</p>
                </div>
                
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newTaskText.trim()) return;
                    await createTask.mutateAsync({ projectId: project.id, data: { title: newTaskText.trim() } });
                    setNewTaskText('');
                  }}
                  className="flex gap-2 mb-4"
                >
                  <input
                    type="text"
                    placeholder="Add a new task..."
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    className="flex-1 px-3 py-2 text-[11px] rounded-lg outline-none"
                    style={{ background: 'var(--th-input)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }}
                  />
                  <button 
                    type="submit"
                    disabled={!newTaskText.trim() || createTask.isPending}
                    className="px-3 py-2 rounded-lg transition-colors hover:opacity-80 flex items-center justify-center shrink-0"
                    style={{ background: 'var(--th-primary)', color: '#08080d' }}
                  >
                    {createTask.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>
                </form>

                <div className="space-y-1.5">
                  {(project.tasks || []).length === 0 ? (
                    <p className="text-[10px] text-center italic py-4" style={{ color: 'var(--th-text-dim)' }}>No tasks added yet.</p>
                  ) : (
                    (project.tasks || []).map(task => (
                      <div 
                        key={task.id} 
                        className={clsx(
                          "flex items-start gap-2.5 p-2.5 rounded-lg transition-opacity group",
                          task.status === 'done' && "opacity-50"
                        )}
                        style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)' }}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 rounded cursor-pointer shrink-0"
                          checked={task.status === 'done'}
                          onChange={() => updateTask.mutate({ 
                            taskId: task.id, 
                            data: { status: task.status === 'done' ? 'todo' : 'done' } 
                          })}
                          disabled={updateTask.isPending}
                        />
                        
                        <div className="flex flex-col min-w-0 flex-1 mt-0.5">
                          {editingTaskId === task.id ? (
                            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(task.id); }} className="flex gap-1.5">
                              <input
                                type="text"
                                autoFocus
                                value={editTaskTitle}
                                onChange={(e) => setEditTaskTitle(e.target.value)}
                                onBlur={() => handleSaveEdit(task.id)}
                                className="flex-1 px-2 py-1 text-[11px] rounded outline-none"
                                style={{ background: 'var(--th-input)', border: '1px solid var(--th-primary)', color: 'var(--th-text)' }}
                              />
                            </form>
                          ) : (
                            <>
                              <span 
                                className={clsx("text-[11px] font-medium leading-snug break-words", task.status === 'done' && "line-through")}
                                style={{ color: 'var(--th-text)' }}
                              >
                                {task.title}
                              </span>
                              {task.description && (
                                <span className="text-[9px] mt-0.5 break-words" style={{ color: 'var(--th-text-secondary)' }}>
                                  {task.description}
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        {/* Actions (visible on hover) */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              if (editingTaskId === task.id) {
                                handleSaveEdit(task.id);
                              } else {
                                setEditingTaskId(task.id);
                                setEditTaskTitle(task.title);
                              }
                            }}
                            className="p-1 rounded hover:bg-black/10 transition-colors"
                            style={{ color: 'var(--th-text-dim)' }}
                          >
                            {editingTaskId === task.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <PenLine className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setTaskToDelete(task);
                            }}
                            disabled={deleteTask.isPending}
                            className="p-1 rounded hover:bg-black/10 transition-colors"
                            style={{ color: 'var(--th-text-dim)' }}
                          >
                            <Trash2 className="w-3.5 h-3.5 hover:text-red-500 transition-colors" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        title="Delete Task?"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--th-text)' }}>
            Are you sure you want to delete <span className="font-semibold">"{taskToDelete?.title}"</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setTaskToDelete(null)}
              className="px-4 py-2 text-[11px] font-semibold rounded-xl transition-colors hover:bg-black/10"
              style={{ color: 'var(--th-text)' }}
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (taskToDelete) {
                  await deleteTask.mutateAsync(taskToDelete.id);
                  setTaskToDelete(null);
                }
              }}
              disabled={deleteTask.isPending}
              className="px-4 py-2 text-[11px] font-semibold rounded-xl transition-colors hover:bg-red-600 disabled:opacity-50"
              style={{ background: 'var(--th-danger, #ef4444)', color: '#fff' }}
            >
              {deleteTask.isPending ? 'Deleting...' : 'Delete Task'}
            </button>
          </div>
        </div>
      </Modal>

    </AnimatePresence>,
    document.body
  );
}

/* ─── Main Pipeline Tab ─── */
export default function PipelineTab({ onNewProject, onEditProject }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const targetId = searchParams.get('id');

  const { data: pipelineData } = usePipeline();
  const moveMutation = useMovePipelineProject();
  const [search, setSearch] = useState('');
  const [dragOverStage, setDragOverStage] = useState(null);

  const pipeline = pipelineData?.data?.pipeline || pipelineData?.pipeline || {};

  const selected = useMemo(() => {
    if (!targetId) return null;
    for (const stageKey in pipeline) {
      const found = pipeline[stageKey]?.find(p => p.id === targetId);
      if (found) return found;
    }
    return null;
  }, [targetId, pipeline]);

  const filteredPipeline = useMemo(() => {
    const result = {};
    for (const stage of STAGES) {
      let items = pipeline[stage.key] || [];
      if (search) items = items.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()));
      result[stage.key] = items;
    }
    return result;
  }, [pipeline, search]);

  const openProject = (proj) => {
    setSearchParams(prev => { prev.set('id', proj.id); return prev; }, { replace: true });
  };
  
  const closeDrawer = () => {
    setSearchParams(prev => { prev.delete('id'); return prev; }, { replace: true });
  };

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

    moveMutation.mutate({ projectId, newStatus });
  }, [moveMutation, pipeline]);

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
                      stage.highlight && 'ring-1 ring-amber-500/30',
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
        onEditProject={onEditProject}
      />
    </div>
  );
}
