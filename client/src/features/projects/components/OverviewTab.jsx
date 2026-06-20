import { useState } from 'react';
import { useProjects, useProjectStats, useGithubRepos } from '../hooks/useProjects';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight, Bookmark, AlertTriangle, Sparkles, Zap, Github, ExternalLink,
  Code2, Info, ChevronDown, LayoutGrid, List, Database, Container, Layers,
  FileText, User, TrendingUp, Target, Link2,
} from 'lucide-react';
import clsx from 'clsx';

/* ─── Design tokens (matches reference mock) ─── */
const STATUS = {
  IDEA: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Idea' },
  PLANNING: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Planning' },
  BUILDING: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Building' },
  TESTING: { bg: 'bg-violet-50', text: 'text-violet-600', label: 'Testing' },
  SHIPPED: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Shipped' },
  ARCHIVED: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Archived' },
};

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];
function getColor(str) {
  if (!str) return COLORS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

const DEMO_ACTIVE = {
  title: 'Eventria',
  subtitle: 'Event Management Platform',
  status: 'BUILDING',
  color: '#8b5cf6',
  stack: ['Next.js', 'Node.js', 'PostgreSQL', 'Tailwind', 'Prisma'],
  stackExtra: 2,
  lastCommit: '2 hours ago',
  buildStreak: 17,
  progress: 68,
  nextTask: {
    title: 'Add payment webhook',
    subtitle: 'Integrate Razorpay webhook for payments',
    tag: 'Backend',
    date: 'May 28',
  },
  blocker: {
    title: 'Webhook signature mismatch',
    desc: 'Razorpay webhook failing in production',
    priority: 'High',
  },
  aiRecommendation: 'Implement idempotency for webhook events before adding new features',
};

const DEMO_PROJECTS = [
  { id: '1', title: 'Eventria', status: 'BUILDING', color: '#8b5cf6', description: 'Event Management Platform', progress: 68, updatedAt: new Date(Date.now() - 7200000) },
  { id: '2', title: 'DevConnect', status: 'BUILDING', color: '#10b981', description: 'Developer Social Network', progress: 45, updatedAt: new Date(Date.now() - 86400000) },
  { id: '3', title: 'AI Resume Builder', status: 'PLANNING', color: '#3b82f6', description: 'AI-powered resume optimization tool', progress: 20, updatedAt: new Date(Date.now() - 172800000) },
  { id: '4', title: 'Portfolio V2', status: 'TESTING', color: '#f59e0b', description: 'Personal portfolio redesign', progress: 85, updatedAt: new Date(Date.now() - 3600000) },
  { id: '5', title: 'TaskFlow', status: 'SHIPPED', color: '#1a1714', description: 'Minimalist task management app', progress: 100, updatedAt: new Date(Date.now() - 604800000) },
];

const DEMO_LEARNINGS = [
  { icon: Database, color: '#3b82f6', title: 'Prisma Transaction Management', desc: 'Learned how to use $transaction for handling complex database operations.', time: 'Today' },
  { icon: Layers, color: '#ef4444', title: 'Redis Queue Retry Strategy', desc: 'Implemented exponential backoff for failed job retries.', time: 'Yesterday' },
  { icon: Container, color: '#8b5cf6', title: 'Docker Multi-stage Builds', desc: 'Optimized Docker image size using multi-stage builds.', time: '2 days ago' },
];

const DEMO_SCORES = [
  { label: 'Resume Score', value: 82, Icon: FileText, color: '#f59e0b' },
  { label: 'Recruiter Score', value: 75, Icon: User, color: '#eab308' },
  { label: 'Scalability Score', value: 70, Icon: TrendingUp, color: '#10b981' },
  { label: 'Demo Score', value: 85, Icon: Target, color: '#3b82f6' },
  { label: 'Job Sync Score', value: 72, Icon: Link2, color: '#6366f1' },
];

const STACK_TECHS = [
  { name: 'JavaScript', pct: 38, color: '#f59e0b', hours: 54 },
  { name: 'TypeScript', pct: 22, color: '#3b82f6', hours: 31 },
  { name: 'Node.js', pct: 18, color: '#10b981', hours: 26 },
  { name: 'SQL', pct: 10, color: '#6366f1', hours: 14 },
  { name: 'Tailwind CSS', pct: 7, color: '#06b6d4', hours: 10 },
  { name: 'Others', pct: 5, color: '#94a3b8', hours: 7 },
];

const card = 'rounded-2xl shadow-sm border border-black/[0.06] dark:border-white/[0.06]';
const cardBg = { background: 'var(--th-card-solid)' };

/** Correct SVG donut — dash lengths based on circumference, not raw percentages */
function DonutChart({ segments, size = 120, strokeWidth = 11, children }) {
  const vb = 100;
  const r = (vb - strokeWidth) / 2;
  const cx = vb / 2;
  const cy = vb / 2;
  const circumference = 2 * Math.PI * r;

  let offset = 0;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${vb} ${vb}`} className="w-full h-full -rotate-90">
        {segments.map((seg) => {
          const length = (seg.pct / 100) * circumference;
          const circle = (
            <circle
              key={seg.name}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += length;
          return circle;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {children}
      </div>
    </div>
  );
}

/** Single-value ring gauge */
function ScoreRing({ value, size = 88, strokeWidth = 9, color = '#10b981', children }) {
  const vb = 100;
  const r = (vb - strokeWidth) / 2;
  const cx = vb / 2;
  const cy = vb / 2;
  const circumference = 2 * Math.PI * r;
  const length = (value / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${vb} ${vb}`} className="w-full h-full -rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${length} ${circumference - length}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {children}
      </div>
    </div>
  );
}

function timeAgo(d) {
  if (!d) return '';
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hours ago`;
  return `${Math.floor(s / 86400)} days ago`;
}

function StatusBadge({ status }) {
  const st = STATUS[status] || STATUS.BUILDING;
  return (
    <span className={clsx('text-[10px] px-2 py-0.5 rounded-full font-semibold', st.bg, st.text)}>
      {st.label}
    </span>
  );
}

/* ─── Continue Building ─── */
function ContinueBuildingCard({ projects, stats }) {
  const [, setSearchParams] = useSearchParams();

  if (!projects || projects.length === 0) {
    return (
      <div className={clsx(card, 'p-5 h-full w-full flex flex-col items-center justify-center')} style={cardBg}>
        <p className="text-[14px] font-bold" style={{ color: 'var(--th-text)' }}>No projects yet</p>
        <button onClick={() => setSearchParams({ tab: 'projects' }, { replace: true })} className="mt-2 text-[12px] text-amber-500 font-semibold hover:underline">Start building something new!</button>
      </div>
    );
  }

  let activeProject = projects.find(p => p.status === 'BUILDING');
  if (!activeProject) activeProject = [...projects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];

  const d = {
    title: activeProject.title,
    subtitle: activeProject.description || 'No description provided.',
    status: activeProject.status,
    color: getColor(activeProject.title),
    stack: activeProject.stack?.slice(0, 3) || [],
    stackExtra: Math.max(0, (activeProject.stack?.length || 0) - 3),
    lastCommit: activeProject.metrics?.lastCommitAt ? timeAgo(activeProject.metrics.lastCommitAt) : timeAgo(activeProject.updatedAt),
    buildStreak: activeProject.metrics?.buildStreak || 0,
    progress: activeProject.status === 'SHIPPED' ? 100 : activeProject.status === 'BUILDING' ? 68 : activeProject.status === 'TESTING' ? 85 : activeProject.status === 'PLANNING' ? 20 : 0,
    nextTask: (() => {
      const todo = activeProject.tasks?.find(t => t.status === 'todo');
      return todo ? {
        title: todo.title,
        subtitle: todo.description || 'No description',
        tag: todo.priority || 'Medium',
        date: todo.dueDate ? new Date(todo.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No Date'
      } : { title: 'No pending tasks', subtitle: 'You are all caught up!', tag: 'Chill', date: '' };
    })(),
    blocker: (() => {
      const blocked = activeProject.tasks?.find(t => t.status === 'blocked' || t.priority === 'critical');
      return blocked ? {
        title: blocked.title,
        desc: blocked.description || 'No description',
        priority: blocked.priority || 'High',
      } : { title: 'No Blockers', desc: 'Smooth sailing ahead.', priority: 'Low' };
    })(),
    aiRecommendation: activeProject.intelligence?.aiRecommendation || (activeProject.intelligence?.missingSkills?.length > 0 ? `Consider learning ${activeProject.intelligence.missingSkills[0]} to improve your skills.` : 'Keep up the good work! Your project is looking solid.'),
  };

  return (
    <div className={clsx(card, 'p-5 h-full w-full flex flex-col')} style={cardBg}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-[14px] font-bold" style={{ color: 'var(--th-text)' }}>Continue Building</h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold whitespace-nowrap">
          You&apos;re in the zone! 🔥
        </span>
      </div>

      {/* Body */}
      <div className="flex gap-5 flex-1">
        {/* Left — project info + stats */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ background: d.color }}
            >
              {d.title?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-bold leading-tight truncate" style={{ color: 'var(--th-text)' }}>{d.title}</p>
              <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--th-text-secondary)' }}>{d.subtitle}</p>
              <div className="mt-1.5">
                <StatusBadge status={d.status} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-4 mb-4">
            {d.stack.map(s => (
              <span
                key={s}
                className="text-[10px] px-2 py-0.5 rounded-md font-medium border"
                style={{ background: 'var(--th-bg-secondary)', color: 'var(--th-text-secondary)', borderColor: 'var(--th-border)' }}
              >
                {s}
              </span>
            ))}
            {d.stackExtra > 0 && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-md font-medium border"
                style={{ background: 'var(--th-bg-secondary)', color: 'var(--th-text-dim)', borderColor: 'var(--th-border)' }}
              >
                +{d.stackExtra}
              </span>
            )}
          </div>

          <div className="flex items-end gap-5 mt-auto pt-2">
            <div>
              <p className="text-[10px] mb-0.5" style={{ color: 'var(--th-text-dim)' }}>Last Commit</p>
              <p className="text-[12px] font-semibold truncate max-w-[60px]" style={{ color: 'var(--th-text)' }}>{d.lastCommit}</p>
            </div>
            <div>
              <p className="text-[10px] mb-0.5" style={{ color: 'var(--th-text-dim)' }}>Build Streak 🔥</p>
              <p className="text-[12px] font-semibold" style={{ color: 'var(--th-text)' }}>{d.buildStreak} days</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] mb-1" style={{ color: 'var(--th-text-dim)' }}>Progress</p>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold shrink-0" style={{ color: 'var(--th-text)' }}>{d.progress}%</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--th-bg-secondary)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${d.progress}%`, background: d.color }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — task & blocker */}
        <div
          className="w-[195px] shrink-0 pl-4 flex flex-col"
          style={{ borderLeft: '1px solid var(--th-border)' }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--th-text-dim)' }}>
            Next Task
          </p>
          <div className="flex items-start gap-2 mb-5">
            <div
              className="w-3.5 h-3.5 rounded border-2 mt-0.5 shrink-0"
              style={{ borderColor: 'var(--th-border)' }}
            />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold leading-snug truncate" style={{ color: 'var(--th-text)' }}>
                {d.nextTask.title}
              </p>
              <p className="text-[10px] mt-0.5 leading-relaxed line-clamp-2" style={{ color: 'var(--th-text-dim)' }}>
                {d.nextTask.subtitle}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 font-semibold capitalize">
                  {d.nextTask.tag}
                </span>
                <span className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>{d.nextTask.date}</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wide mb-2">Current Blocker</p>
          <div className="flex items-start gap-1.5">
            <AlertTriangle className={clsx("w-3.5 h-3.5 shrink-0 mt-0.5", d.blocker.priority === 'Low' ? "text-emerald-500" : "text-red-500")} />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold leading-snug truncate" style={{ color: 'var(--th-text)' }}>
                {d.blocker.title}
              </p>
              <p className="text-[10px] mt-1 leading-relaxed line-clamp-2" style={{ color: 'var(--th-text-dim)' }}>
                {d.blocker.desc}
              </p>
              {d.blocker.priority !== 'Low' && (
                <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-500 mt-2 capitalize">
                  {d.blocker.priority}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendation footer */}
      <div
        className="mt-4 flex items-center justify-between gap-3 rounded-xl px-4 py-3"
        style={{ background: 'rgba(var(--th-primary-rgb), 0.07)', border: '1px solid rgba(var(--th-primary-rgb), 0.12)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 shrink-0" style={{ color: 'var(--th-primary)' }} />
          <p className="text-[11px] leading-snug truncate" style={{ color: 'var(--th-text-secondary)' }}>
            <span className="font-bold" style={{ color: 'var(--th-primary)' }}>AI Recommendation: </span>
            {d.aiRecommendation}
          </p>
        </div>
        <button
          onClick={() => setSearchParams({ tab: 'pipeline', id: activeProject.id }, { replace: true })}
          className="shrink-0 text-[11px] px-3 py-1.5 rounded-lg font-semibold transition-colors hover:opacity-90"
          style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)', color: 'var(--th-primary)' }}
        >
          View Plan
        </button>
      </div>
    </div>
  );
}

/* ─── GitHub Activity ─── */
function GitHubActivityCard({ projects, githubRepos, stats }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  const totalCommits = projects.reduce((acc, p) => acc + (p.metrics?.commitCount || 0), 0) || 0;
  const totalPRs = projects.reduce((acc, p) => acc + (p.metrics?.prCount || 0), 0) || 0;
  
  let lastCommitProject = [...projects].filter(p => p.metrics?.lastCommitAt).sort((a, b) => new Date(b.metrics.lastCommitAt) - new Date(a.metrics.lastCommitAt))[0];
  let lastPush = lastCommitProject?.metrics?.lastCommitAt ? timeAgo(lastCommitProject.metrics.lastCommitAt) : 'N/A';

  const heights = days.map((_, i) => Math.max(5, (Math.abs(Math.sin((totalCommits || 14) * (i + 1))) * 100).toFixed(0)));
  const barColors = heights.map(h => h > 70 ? 'var(--th-primary)' : '#10b981');

  const displayStats = [
    { label: 'Total Commits', value: totalCommits, large: true },
    { label: 'Last Push', value: lastPush, accent: true },
    { label: 'Pull Requests', value: totalPRs, large: true },
    { label: 'Active Branch', value: 'main', dot: true },
  ];

  return (
    <div className={clsx(card, 'p-5 h-full w-full flex flex-col')} style={cardBg}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-bold" style={{ color: 'var(--th-text)' }}>GitHub Activity</h3>
        <button 
          onClick={() => {
            if (lastCommitProject?.repoUrl) window.open(lastCommitProject.repoUrl, '_blank');
            else if (githubRepos?.[0]?.html_url) window.open(githubRepos[0].html_url, '_blank');
          }}
          className="text-[11px] font-semibold flex items-center gap-0.5 hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed" 
          style={{ color: 'var(--th-primary)' }}
          disabled={!lastCommitProject?.repoUrl && !githubRepos?.length}
        >
          View Repo <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-3 flex-1">
        {displayStats.map(s => (
          <div key={s.label}>
            <p className="text-[10px] mb-0.5" style={{ color: 'var(--th-text-dim)' }}>{s.label}</p>
            {s.large ? (
              <p className="text-[20px] font-bold leading-none" style={{ color: 'var(--th-text)' }}>{s.value}</p>
            ) : s.dot ? (
              <p className="text-[13px] font-semibold flex items-center gap-1" style={{ color: 'var(--th-text)' }}>
                {s.value}
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              </p>
            ) : (
              <p className="text-[13px] font-semibold text-emerald-600">{s.value}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-end gap-1.5 h-[60px] mt-4">
        {days.map((day, i) => (
          <div key={`${day}-${i}`} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <div
              className="w-full rounded-t-sm transition-all duration-500"
              style={{ height: `${heights[i]}%`, minHeight: 4, background: barColors[i] }}
            />
            <span className="text-[9px] font-medium" style={{ color: 'var(--th-text-dim)' }}>{day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── AI Build Insights ─── */
function AIBuildInsightsCard({ projects }) {
  const insights = [];
  
  (projects || []).forEach(p => {
    if (p.intelligence?.scalabilityScore < 60 || p.intelligence?.architectureScore < 60) {
      insights.push({ icon: AlertTriangle, title: 'Bottleneck Detected', desc: `${p.title} architecture needs review`, badge: 'High', badgeBg: '#fef2f2', badgeColor: '#ef4444', iconColor: '#ef4444' });
    }
    if (p.intelligence?.missingSkills?.length > 0) {
      insights.push({ icon: Zap, title: 'Next Suggested Feature', desc: `Learn ${p.intelligence.missingSkills[0]} for ${p.title}`, badge: 'New', badgeBg: '#ecfdf5', badgeColor: '#10b981', iconColor: '#10b981' });
    }
    if (p.intelligence?.weaknesses?.length > 0) {
      insights.push({ icon: Code2, title: 'Architecture Suggestion', desc: `Improve ${p.title}: ${p.intelligence.weaknesses[0]}`, badge: 'Improve', badgeBg: '#eff6ff', badgeColor: '#3b82f6', iconColor: '#3b82f6' });
    }
  });

  if (insights.length === 0) {
    if (!projects || projects.length === 0) {
       insights.push({ icon: AlertTriangle, title: 'No Projects Found', desc: 'Create a project to get AI insights', badge: 'High', badgeBg: '#fef2f2', badgeColor: '#ef4444', iconColor: '#ef4444' });
    } else {
       insights.push({ icon: Zap, title: 'Great Architecture', desc: 'All projects look structurally solid!', badge: 'Good', badgeBg: '#ecfdf5', badgeColor: '#10b981', iconColor: '#10b981' });
       insights.push({ icon: Code2, title: 'Keep Building', desc: 'Add more complex features to get suggestions', badge: 'Improve', badgeBg: '#eff6ff', badgeColor: '#3b82f6', iconColor: '#3b82f6' });
    }
  }

  const displayInsights = insights.slice(0, 3);
  const confidence = projects?.length > 0 ? Math.max(75, Math.floor(projects.reduce((acc, p) => acc + (p.metrics?.portfolioScore || 70), 0) / projects.length)) : 0;

  return (
    <div className={clsx(card, 'p-5 h-full w-full flex flex-col')} style={cardBg}>
      <div className="flex items-center gap-1.5 mb-3">
        <h3 className="text-[14px] font-bold" style={{ color: 'var(--th-text)' }}>AI Build Insights</h3>
        <Info className="w-3.5 h-3.5" style={{ color: 'var(--th-text-dim)' }} />
      </div>

      <div className="space-y-2 flex-1">
        {displayInsights.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 p-2.5 rounded-xl"
            style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)' }}
          >
            <item.icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: item.iconColor }} />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold truncate" style={{ color: 'var(--th-text)' }}>{item.title}</p>
              <p className="text-[10px] mt-0.5 line-clamp-2" style={{ color: 'var(--th-text-dim)' }}>{item.desc}</p>
            </div>
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
              style={{ background: item.badgeBg, color: item.badgeColor }}
            >
              {item.badge}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--th-border)' }}>
        <span className="text-[10px] font-medium" style={{ color: 'var(--th-text-dim)' }}>AI Confidence</span>
        <div className="flex items-center gap-2">
          <div className="w-[72px] h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--th-bg-secondary)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${confidence}%`, background: 'var(--th-primary)' }} />
          </div>
          <span className="text-[11px] font-bold" style={{ color: 'var(--th-primary)' }}>{confidence}%</span>
        </div>
      </div>
    </div>
  );
}

/* ─── My Projects ─── */
function MyProjectsPreview({ projects }) {
  const [, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const display = (projects || []).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);

  return (
    <div className={clsx(card, 'p-5')} style={cardBg}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-bold" style={{ color: 'var(--th-text)' }}>My Projects</h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSearchParams({ tab: 'projects' }, { replace: true })}
            className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ background: 'var(--th-bg-secondary)', color: 'var(--th-text-secondary)', borderColor: 'var(--th-border)' }}
          >
            All Projects <ChevronDown className="w-3 h-3" />
          </button>
          <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: 'var(--th-border)' }}>
            <button
              onClick={() => setViewMode('grid')}
              className={clsx('p-1.5 transition-colors', viewMode === 'grid' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5')}
              style={{ color: viewMode === 'grid' ? 'var(--th-text)' : 'var(--th-text-dim)' }}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={clsx('p-1.5 transition-colors', viewMode === 'list' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5')}
              style={{ color: viewMode === 'list' ? 'var(--th-text)' : 'var(--th-text-dim)' }}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {display.length === 0 ? (
        <div className="py-8 text-center" style={{ color: 'var(--th-text-dim)' }}>
          <p className="text-[12px] font-semibold">No projects yet. Start building!</p>
        </div>
      ) : (
        <div className={clsx("grid gap-3", viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "grid-cols-1 md:grid-cols-2")}>
          {display.map((p, i) => {
            const progress = p.status === 'SHIPPED' ? 100 : p.status === 'BUILDING' ? 68 : p.status === 'TESTING' ? 85 : p.status === 'PLANNING' ? 20 : 0;
            const progressColor = p.status === 'SHIPPED' ? '#10b981'
              : p.status === 'TESTING' ? '#8b5cf6'
              : p.status === 'PLANNING' ? '#3b82f6'
              : p.status === 'BUILDING' ? '#f59e0b' : '#8b5cf6';
            const color = getColor(p.title);

            return (
              <motion.div
                key={p.id || i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSearchParams({ tab: 'pipeline', id: p.id }, { replace: true })}
                className="rounded-xl p-3.5 border cursor-pointer hover:-translate-y-0.5 transition-all"
                style={{ background: 'var(--th-bg-secondary)', borderColor: 'var(--th-border)', boxShadow: 'var(--th-shadow)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                    style={{ background: color }}
                  >
                    {p.title?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold truncate" style={{ color: 'var(--th-text)' }}>{p.title}</p>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
                <p className="text-[10px] line-clamp-2 leading-relaxed min-h-[28px] mb-2.5" style={{ color: 'var(--th-text-secondary)' }}>
                  {p.description || 'No description provided'}
                </p>
                <div className="h-1 rounded-full overflow-hidden mb-1" style={{ background: 'var(--th-card-solid)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: progressColor }} />
                </div>
                <p className="text-[9px] font-semibold mb-2" style={{ color: 'var(--th-text-dim)' }}>{progress}%</p>
                <div className="flex items-center justify-between">
                  <span className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>{timeAgo(p.updatedAt)}</span>
                  <div className="flex items-center gap-1">
                    {p.repoUrl && <button onClick={(e) => { e.stopPropagation(); window.open(p.repoUrl, '_blank'); }}><Github className="w-3 h-3 hover:opacity-70 transition-opacity" style={{ color: 'var(--th-text-dim)' }} /></button>}
                    {p.liveUrl && <button onClick={(e) => { e.stopPropagation(); window.open(p.liveUrl, '_blank'); }}><ExternalLink className="w-3 h-3 hover:opacity-70 transition-opacity" style={{ color: 'var(--th-text-dim)' }} /></button>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="flex justify-center mt-4 pt-3 border-t" style={{ borderColor: 'var(--th-border)' }}>
        <button
          onClick={() => setSearchParams({ tab: 'projects' }, { replace: true })}
          className="text-[11px] font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity"
          style={{ color: 'var(--th-primary)' }}
        >
          View All Projects <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

/* ─── Recent Learnings ─── */
function RecentLearningsPreview({ projects }) {
  const [, setSearchParams] = useSearchParams();

  let allLearnings = [];
  (projects || []).forEach(p => {
    if (p.learnings && p.learnings.length > 0) {
      allLearnings = allLearnings.concat(p.learnings.map(l => ({ ...l, projectTitle: p.title, color: getColor(p.title) })));
    }
  });
  
  allLearnings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const displayLearnings = allLearnings.slice(0, 3);

  return (
    <div className={clsx(card, 'p-5 h-full flex flex-col')} style={cardBg}>
      <h3 className="text-[14px] font-bold mb-4" style={{ color: 'var(--th-text)' }}>Recent Learnings</h3>
      
      <div className="space-y-3.5 flex-1">
        {displayLearnings.length === 0 ? (
          <div className="py-6 text-center" style={{ color: 'var(--th-text-dim)' }}>
            <p className="text-[12px] font-semibold">No learnings captured yet.</p>
          </div>
        ) : (
          displayLearnings.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)' }}>
                <Database className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold leading-snug truncate" style={{ color: 'var(--th-text)' }}>{item.title}</p>
                <p className="text-[10px] mt-0.5 line-clamp-2" style={{ color: 'var(--th-text-dim)' }}>{item.description}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>{timeAgo(item.createdAt)}</span>
                <Bookmark className="w-3.5 h-3.5" style={{ color: 'var(--th-text-dim)', opacity: 0.5 }} />
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="flex justify-center mt-4 pt-3 border-t" style={{ borderColor: 'var(--th-border)' }}>
        <button
          onClick={() => setSearchParams({ tab: 'learnings' }, { replace: true })}
          className="text-[11px] font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity"
          style={{ color: 'var(--th-primary)' }}
        >
          View All Learnings <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

/* ─── Stack Heatmap ─── */
function StackHeatmapPreview({ projects }) {
  const [, setSearchParams] = useSearchParams();

  const allStack = (projects || []).flatMap(p => p.stack || []);
  const skillCounts = {};
  allStack.forEach(s => skillCounts[s] = (skillCounts[s] || 0) + 1);

  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / Math.max(1, allStack.length)) * 100),
      color: getColor(name)
    }));

  const totalHours = projects.reduce((sum, p) => sum + (p.metrics?.commitCount || 0) * 2, 0) || 0; // rough estimation if we don't have time tracking

  return (
    <div className={clsx(card, 'p-5 h-full flex flex-col')} style={cardBg}>
      <h3 className="text-[14px] font-bold mb-5" style={{ color: 'var(--th-text)' }}>
        Stack Heatmap <span className="text-[10px] font-normal ml-1" style={{ color: 'var(--th-text-dim)' }}>(GitHub Powered)</span>
      </h3>
      
      <div className="flex gap-5 items-center flex-1">
        {topSkills.length === 0 ? (
          <div className="flex-1 text-center" style={{ color: 'var(--th-text-dim)' }}>
            <p className="text-[12px] font-semibold">No stack data available</p>
          </div>
        ) : (
          <>
            <DonutChart segments={topSkills} size={116} strokeWidth={12}>
              <p className="text-[9px] leading-none" style={{ color: 'var(--th-text-dim)' }}>This Month</p>
              <p className="text-[20px] font-bold leading-tight mt-0.5" style={{ color: 'var(--th-text)' }}>{totalHours}h</p>
              <p className="text-[9px] leading-none mt-0.5" style={{ color: 'var(--th-text-dim)' }}>Total</p>
            </DonutChart>
            <div className="flex-1 space-y-2">
              {topSkills.map(t => (
                <div key={t.name} className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: t.color }} />
                  <span className="text-[11px] flex-1 truncate" style={{ color: 'var(--th-text)' }}>{t.name}</span>
                  <span className="text-[10px] font-medium tabular-nums" style={{ color: 'var(--th-text-dim)' }}>
                    {t.pct}%
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      <div className="flex justify-center mt-5 pt-4 border-t" style={{ borderColor: 'var(--th-border)' }}>
        <button 
          onClick={() => setSearchParams({ tab: 'intelligence' }, { replace: true })}
          className="text-[11px] font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity"
          style={{ color: 'var(--th-primary)' }}
        >
          View Full Heatmap <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

/* ─── Portfolio Intelligence (tall right sidebar) ─── */
function PortfolioIntelligencePreview({ projects }) {
  const [, setSearchParams] = useSearchParams();
  
  const projectsWithIntel = (projects || []).filter(p => p.intelligence);
  const intelCount = projectsWithIntel.length || 1;
  const avg = (key) => Math.round(projectsWithIntel.reduce((acc, p) => acc + (p.intelligence[key] || 0), 0) / intelCount);
  
  const avgResume = avg('resumeScore') || 0;
  const avgRecruiter = avg('recruiterScore') || 0;
  const avgScalability = avg('scalabilityScore') || 0;
  const avgDemo = avg('demoScore') || 0;
  const avgArch = avg('architectureScore') || 0;
  
  const overall = projectsWithIntel.length ? Math.round((avgResume + avgRecruiter + avgScalability + avgDemo + avgArch) / 5) : 0;
  
  const displayScores = [
    { label: 'Resume Score', value: avgResume, Icon: FileText, color: '#f59e0b' },
    { label: 'Recruiter Score', value: avgRecruiter, Icon: User, color: '#eab308' },
    { label: 'Scalability Score', value: avgScalability, Icon: TrendingUp, color: '#10b981' },
    { label: 'Demo Score', value: avgDemo, Icon: Target, color: '#3b82f6' },
    { label: 'Architecture', value: avgArch, Icon: Layers, color: '#6366f1' },
  ];

  return (
    <div className={clsx(card, 'p-5 h-full w-full flex flex-col')} style={cardBg}>
      <div className="flex items-center gap-1.5 mb-5">
        <h3 className="text-[14px] font-bold" style={{ color: 'var(--th-text)' }}>Portfolio Intelligence</h3>
        <Info className="w-3.5 h-3.5" style={{ color: 'var(--th-text-dim)' }} />
      </div>

      <div className="flex items-center gap-4 mb-5 pb-5 border-b" style={{ borderColor: 'var(--th-border)' }}>
        <ScoreRing value={overall} size={84} strokeWidth={9} color="var(--th-primary)">
          <span className="text-[22px] font-bold leading-none" style={{ color: 'var(--th-text)' }}>{overall}</span>
        </ScoreRing>
        <div>
          <p className="text-[14px] font-bold" style={{ color: 'var(--th-text)' }}>Overall Score</p>
          <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'var(--th-text-dim)' }}>
            {overall > 80 ? 'Exceptional portfolio!' : overall > 50 ? 'Great progress! Keep building.' : 'Add details to improve.'}
          </p>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {displayScores.map(s => (
          <div key={s.label}>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)' }}
              >
                <s.Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
              </div>
              <span className="text-[11px] flex-1" style={{ color: 'var(--th-text)' }}>{s.label}</span>
              <span className="text-[12px] font-bold tabular-nums" style={{ color: s.color }}>{s.value}</span>
              <span className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>/100</span>
            </div>
            <div className="ml-9 h-1 rounded-full overflow-hidden" style={{ background: 'var(--th-bg-secondary)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${s.value}%`, background: s.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-center mt-4" style={{ color: 'var(--th-text-dim)' }}>
        Based on {projectsWithIntel.length} analyzed projects
      </p>

      <div className="flex justify-center mt-3 pt-4 border-t" style={{ borderColor: 'var(--th-border)' }}>
        <button
          onClick={() => setSearchParams({ tab: 'intelligence' }, { replace: true })}
          className="text-[11px] font-semibold italic flex items-center gap-1 hover:opacity-70 transition-opacity"
          style={{ color: 'var(--th-primary)' }}
        >
          View Full Analysis <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

/* ─── Main Overview Tab ─── */
export default function OverviewTab() {
  const { data: projectsData } = useProjects();
  const { data: statsData } = useProjectStats();
  const { data: githubData } = useGithubRepos();

  const projects = projectsData?.data || [];
  const stats = statsData?.data?.stats || statsData?.stats || {};
  const githubRepos = githubData?.data?.repos || githubData?.repos || [];

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Row 1 — equal-height top cards */}
      <div className="col-span-12 xl:col-span-6 flex">
        <ContinueBuildingCard projects={projects} stats={stats} />
      </div>
      <div className="col-span-6 xl:col-span-3 flex">
        <GitHubActivityCard projects={projects} githubRepos={githubRepos} stats={stats} />
      </div>
      <div className="col-span-6 xl:col-span-3 flex">
        <AIBuildInsightsCard projects={projects} />
      </div>

      {/* Row 2 — My Projects (left) + Portfolio Intelligence (right, spans 2 rows) */}
      <div className="col-span-12 xl:col-span-9 xl:row-start-2">
        <MyProjectsPreview projects={projects} />
      </div>
      <div className="col-span-12 xl:col-span-3 xl:row-start-2 xl:row-span-2">
        <PortfolioIntelligencePreview projects={projects} />
      </div>

      {/* Row 3 — Learnings + Heatmap */}
      <div className="col-span-12 lg:col-span-6 xl:col-span-4 xl:row-start-3">
        <RecentLearningsPreview projects={projects} />
      </div>
      <div className="col-span-12 lg:col-span-6 xl:col-span-5 xl:row-start-3">
        <StackHeatmapPreview projects={projects} />
      </div>
    </div>
  );
}
