import { motion } from 'motion/react';
import { Github, ExternalLink, Globe, GitCommit, Clock, GitBranch } from 'lucide-react';

const STATUS = {
  IDEA: { bg: 'bg-orange-50', text: 'text-orange-600', bar: '#f97316', label: 'Idea' },
  PLANNING: { bg: 'bg-blue-50', text: 'text-blue-600', bar: '#3b82f6', label: 'Planning' },
  BUILDING: { bg: 'bg-violet-50', text: 'text-violet-600', bar: '#8b5cf6', label: 'Building' },
  TESTING: { bg: 'bg-violet-50', text: 'text-violet-600', bar: '#8b5cf6', label: 'Testing' },
  SHIPPED: { bg: 'bg-emerald-50', text: 'text-emerald-600', bar: '#10b981', label: 'Shipped' },
  ARCHIVED: { bg: 'bg-slate-100', text: 'text-slate-500', bar: '#94a3b8', label: 'Archived' },
};

const COLORS = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1'];

function getColor(title = '') {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = title.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

function timeAgo(date) {
  if (!date) return '—';
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function scoreStyle(score) {
  if (score >= 8) return { color: '#10b981', bg: '#ecfdf5' };
  if (score >= 6) return { color: '#f59e0b', bg: '#fffbeb' };
  return { color: '#ef4444', bg: '#fef2f2' };
}

export function ProjectCard({ project, onClick, index = 0 }) {
  const st = STATUS[project.status] || STATUS.IDEA;
  const color = getColor(project.title);
  const stack = project.stack || [];
  const m = project.metrics || {};
  
  const tasks = project.tasks || [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  
  const progress = project.status === 'SHIPPED'
    ? 100
    : totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;
  const score = m.portfolioScore || m.qualityScore || 0;
  const scoreDisplay = score > 0 ? score.toFixed(1) : null;
  const sc = scoreDisplay ? scoreStyle(parseFloat(scoreDisplay)) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={onClick}
      className="rounded-2xl p-4 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md flex flex-col h-full shadow-sm"
      style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}
    >
      {/* Header */}
      <div className="flex items-start gap-2.5 mb-2.5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-sm"
          style={{ background: color }}
        >
          {project.title?.charAt(0)?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-[13px] font-bold truncate" style={{ color: 'var(--th-text)' }}>
              {project.title}
            </h3>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${st.bg} ${st.text}`}>
              {st.label}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[11px] line-clamp-2 leading-relaxed mb-3 min-h-[32px]" style={{ color: 'var(--th-text-secondary)' }}>
        {project.description || 'No description added yet.'}
      </p>

      {/* Tech stack */}
      {stack.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {stack.slice(0, 3).map(tech => (
            <span
              key={tech}
              className="text-[9px] px-1.5 py-0.5 rounded font-medium"
              style={{ background: 'var(--th-bg-secondary)', color: 'var(--th-text-dim)', border: '1px solid var(--th-border)' }}
            >
              {tech}
            </span>
          ))}
          {stack.length > 3 && (
            <span className="text-[9px] font-medium" style={{ color: 'var(--th-text-dim)' }}>
              +{stack.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Activity meta */}
      <div className="flex items-center gap-2.5 text-[9px] mb-3 flex-wrap" style={{ color: 'var(--th-text-dim)' }}>
        <span className="flex items-center gap-0.5">
          <GitCommit className="w-3 h-3" />
          {m.commitCount || 0} commits
        </span>
        <span className="flex items-center gap-0.5">
          <Clock className="w-3 h-3" />
          {timeAgo(project.updatedAt)}
        </span>
        <span className="flex items-center gap-0.5">
          <GitBranch className="w-3 h-3" />
          {project.defaultBranch || 'main'}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-3 mt-auto">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>Progress</span>
          <span className="text-[10px] font-bold" style={{ color: st.bar }}>{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--th-bg-secondary)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: st.bar }} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5" style={{ borderTop: '1px solid var(--th-border)' }}>
        <div className="flex items-center gap-2">
          {(project.repoUrl || project.githubRepoId) && (
            <button onClick={(e) => { e.stopPropagation(); if (project.repoUrl) window.open(project.repoUrl, '_blank'); }}>
              <Github className="w-3.5 h-3.5 hover:opacity-70 transition-opacity" style={{ color: 'var(--th-text-dim)' }} />
            </button>
          )}
          {project.liveUrl && (
            <button onClick={(e) => { e.stopPropagation(); window.open(project.liveUrl, '_blank'); }}>
              <ExternalLink className="w-3.5 h-3.5 hover:opacity-70 transition-opacity" style={{ color: 'var(--th-text-dim)' }} />
            </button>
          )}
        </div>
        {scoreDisplay && sc && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-md"
            style={{ color: sc.color, background: sc.bg }}
          >
            {scoreDisplay}/10
          </span>
        )}
      </div>
    </motion.div>
  );
}
