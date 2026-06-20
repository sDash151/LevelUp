import { useState } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen, Bug, Layers, Workflow, BarChart3, Search, Sparkles,
  TrendingUp, ArrowRight, Bookmark, Filter, Plus, Star, Target,
} from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import clsx from 'clsx';

const SUB_TABS = [
  { key: 'all', label: 'All', icon: BarChart3 },
  { key: 'learning', label: 'Learnings', icon: BookOpen },
  { key: 'bug', label: 'Bugs', icon: Bug },
  { key: 'architecture', label: 'Architecture', icon: Layers },
  { key: 'pattern', label: 'Patterns', icon: Workflow },
];

const TYPE_COLORS = {
  learning: { bg: '#3b82f615', text: '#3b82f6', icon: BookOpen },
  bug: { bg: '#ef444415', text: '#ef4444', icon: Bug },
  architecture: { bg: '#8b5cf615', text: '#8b5cf6', icon: Layers },
  pattern: { bg: '#10b98115', text: '#10b981', icon: Workflow },
};

const PROJECT_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899', '#14b8a6'];
function getColor(t = '') {
  let h = 0;
  for (let i = 0; i < t.length; i++) h = t.charCodeAt(i) + ((h << 5) - h);
  return PROJECT_COLORS[Math.abs(h) % PROJECT_COLORS.length];
}

/* ─── KPI Cards ─── */
function KpiCards({ learnings }) {
  const total = learnings.length;
  const bugs = learnings.filter(l => l.type === 'bug').length;
  const patterns = learnings.filter(l => l.type === 'pattern').length;
  const architecture = learnings.filter(l => l.type === 'architecture').length;
  const avgImpact = total > 0 ? (learnings.reduce((s, l) => s + (l.impactScore || 5), 0) / total).toFixed(1) : '0';

  const kpis = [
    { label: 'Total Learnings', value: total, icon: BookOpen, color: '#3b82f6' },
    { label: 'Bugs Solved', value: bugs, icon: Bug, color: '#ef4444' },
    { label: 'Patterns', value: patterns, icon: Workflow, color: '#10b981' },
    { label: 'Architecture', value: architecture, icon: Layers, color: '#8b5cf6' },
    { label: 'Avg Impact', value: avgImpact, icon: Star, color: '#f59e0b' },
  ];

  return (
    <div className="grid grid-cols-5 gap-3 mb-6">
      {kpis.map((k, i) => (
        <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
          className="rounded-xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <k.icon className="w-4 h-4" style={{ color: k.color }} />
            <span className="text-[10px] font-medium" style={{ color: 'var(--th-text-dim)' }}>{k.label}</span>
          </div>
          <p className="text-[22px] font-bold" style={{ color: 'var(--th-text)' }}>{k.value}</p>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Learning Card ─── */
function LearningCard({ learning, index }) {
  const type = TYPE_COLORS[learning.type] || TYPE_COLORS.learning;
  const Icon = type.icon;
  const tags = learning.tags || [];
  const projectName = learning.project?.title || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-xl p-4 flex items-start gap-3 transition-all hover:-translate-y-0.5 cursor-pointer"
      style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: type.bg }}>
        <Icon className="w-4 h-4" style={{ color: type.text }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-[13px] font-semibold truncate" style={{ color: 'var(--th-text)' }}>{learning.title}</h4>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0" style={{ background: type.bg, color: type.text }}>{learning.type}</span>
          {projectName && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0 truncate max-w-[100px]"
              style={{ background: `${getColor(projectName)}15`, color: getColor(projectName) }}>
              {projectName}
            </span>
          )}
        </div>
        {learning.description && (
          <p className="text-[11px] line-clamp-2 mb-2" style={{ color: 'var(--th-text-dim)' }}>{learning.description}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {tags.slice(0, 4).map(tag => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ background: 'var(--th-bg-secondary)', color: 'var(--th-text-dim)' }}>#{tag}</span>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-end shrink-0 gap-2">
        <span className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>
          {learning.createdAt ? new Date(learning.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-bold" style={{ color: learning.impactScore >= 8 ? '#10b981' : learning.impactScore >= 5 ? '#f59e0b' : '#6b7280' }}>
            Impact: {learning.impactScore}/10
          </span>
        </div>
        <Bookmark className="w-3.5 h-3.5 cursor-pointer hover:scale-110 transition-transform" style={{ color: 'var(--th-text-dim)' }} />
      </div>
    </motion.div>
  );
}

/* ─── AI Insights Sidebar ─── */
function AIInsightsSidebar() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4" style={{ color: 'var(--th-primary)' }} />
          <h3 className="text-[13px] font-bold" style={{ color: 'var(--th-text)' }}>AI Insights</h3>
        </div>

        <div className="p-3 rounded-xl mb-3" style={{ background: `var(--th-primary)08`, border: '1px solid var(--th-primary)' }}>
          <p className="text-[10px] font-medium mb-1" style={{ color: 'var(--th-primary)' }}>Top Insight</p>
          <p className="text-[11px]" style={{ color: 'var(--th-text)' }}>Your debugging patterns improved 40% this month.</p>
        </div>

        <h4 className="text-[11px] font-semibold mb-2" style={{ color: 'var(--th-text)' }}>Growth Areas</h4>
        {['Testing Strategies', 'CI/CD Pipelines', 'Database Optimization'].map((area, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-3 h-3" style={{ color: '#10b981' }} />
            <span className="text-[11px]" style={{ color: 'var(--th-text-dim)' }}>{area}</span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
        <h3 className="text-[13px] font-bold mb-3" style={{ color: 'var(--th-text)' }}>Top Knowledge Areas</h3>
        {[
          { name: 'Backend APIs', pct: 85 },
          { name: 'Database Design', pct: 72 },
          { name: 'Auth Systems', pct: 68 },
          { name: 'DevOps', pct: 45 },
        ].map(k => (
          <div key={k.name} className="mb-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px]" style={{ color: 'var(--th-text)' }}>{k.name}</span>
              <span className="text-[10px] font-bold" style={{ color: 'var(--th-primary)' }}>{k.pct}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--th-border)' }}>
              <div className="h-full rounded-full" style={{ width: `${k.pct}%`, background: 'var(--th-primary)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Learnings Tab ─── */
export default function LearningsTab() {
  const [subTab, setSubTab] = useState('all');
  const [search, setSearch] = useState('');

  const { data: projectsData } = useProjects({});
  const projects = projectsData?.data || [];

  // Collect all learnings from all projects
  const allLearnings = projects.flatMap(p =>
    (p.learnings || []).map(l => ({ ...l, project: p }))
  );

  // Filter
  let learnings = subTab === 'all' ? allLearnings : allLearnings.filter(l => l.type === subTab);
  if (search) learnings = learnings.filter(l =>
    l.title?.toLowerCase().includes(search.toLowerCase()) ||
    l.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Sort by createdAt desc
  learnings.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  return (
    <div className="flex gap-4">
      <div className="flex-1 min-w-0">
        {/* KPI Cards */}
        <KpiCards learnings={allLearnings} />

        {/* Sub Tabs + Search */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {SUB_TABS.map(t => (
              <button key={t.key} onClick={() => setSubTab(t.key)}
                className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all')}
                style={{
                  background: subTab === t.key ? 'var(--th-primary)' : 'var(--th-bg-secondary)',
                  color: subTab === t.key ? 'white' : 'var(--th-text-dim)',
                  border: subTab === t.key ? 'none' : '1px solid var(--th-border)',
                }}>
                <t.icon className="w-3 h-3" />
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--th-text-dim)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search learnings..."
              className="pl-9 pr-3 py-1.5 rounded-lg text-[12px] w-48 outline-none"
              style={{ background: 'var(--th-bg-secondary)', color: 'var(--th-text)', border: '1px solid var(--th-border)' }} />
          </div>
        </div>

        {/* Learnings List */}
        {learnings.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--th-text-dim)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--th-text)' }}>No learnings yet</p>
            <p className="text-[12px] mt-1" style={{ color: 'var(--th-text-dim)' }}>Start building and capturing knowledge</p>
          </div>
        ) : (
          <div className="space-y-3">
            {learnings.map((l, i) => <LearningCard key={l.id} learning={l} index={i} />)}
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="w-[260px] shrink-0 hidden xl:block">
        <AIInsightsSidebar />
      </div>
    </div>
  );
}
