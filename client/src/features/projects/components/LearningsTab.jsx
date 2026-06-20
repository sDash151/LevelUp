import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lightbulb, Bug, Code, Building2, Target, Search, ChevronDown, 
  ArrowRight, MoreVertical, Sparkles, Database, Zap, Rocket, Cloud
} from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { Select } from '../../../design-system/components/Select';
import clsx from 'clsx';

const SUB_TABS = [
  { key: 'learning', label: 'Learnings' },
  { key: 'bug', label: 'Bugs' },
  { key: 'architecture', label: 'Architecture' },
  { key: 'pattern', label: 'Patterns' },
  { key: 'all', label: 'All' },
];

const TYPE_COLORS = {
  learning: { bg: '#10b98115', text: '#10b981', icon: Lightbulb }, // Green
  bug: { bg: '#f59e0b15', text: '#f59e0b', icon: Bug }, // Orange
  architecture: { bg: '#3b82f615', text: '#3b82f6', icon: Building2 }, // Blue
  pattern: { bg: '#8b5cf615', text: '#8b5cf6', icon: Code }, // Purple
};

function MiniBars({ heights, color }) {
  return (
    <div className="flex items-end gap-[3px] h-7">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-1.5 rounded-t-sm"
          style={{ height: `${h}%`, minHeight: 3, background: color, opacity: 0.5 + (i % 3) * 0.2 }}
        />
      ))}
    </div>
  );
}

/* ─── KPI Cards ─── */
function KpiCards({ learnings }) {
  const total = learnings.length;
  const bugs = learnings.filter(l => l.type === 'bug').length;
  const patterns = learnings.filter(l => l.type === 'pattern').length;
  const architecture = learnings.filter(l => l.type === 'architecture').length;
  const avgImpact = total > 0 ? (learnings.reduce((s, l) => s + (l.impactScore || 5), 0) / total).toFixed(1) : '0.0';

  const thisMonth = new Date();
  thisMonth.setDate(1);
  const recentLearnings = learnings.filter(l => new Date(l.createdAt) >= thisMonth).length;

  const kpis = [
    { label: 'Total Learnings', value: total, trend: `+${recentLearnings} this month`, icon: Lightbulb, color: '#f59e0b', bars: Array.from({length: 9}, () => Math.random() * 60 + 40) },
    { label: 'Bugs Solved', value: bugs, trend: '', icon: Bug, color: '#10b981', bars: Array.from({length: 9}, () => Math.random() * 60 + 40) },
    { label: 'Patterns Created', value: patterns, trend: '', icon: Code, color: '#8b5cf6', bars: Array.from({length: 9}, () => Math.random() * 60 + 40) },
    { label: 'Architecture Decisions', value: architecture, trend: '', icon: Building2, color: '#3b82f6', bars: Array.from({length: 9}, () => Math.random() * 60 + 40) },
    { label: 'Avg. Impact Score', value: `${avgImpact}/10`, trend: '', icon: Target, color: '#f59e0b', bars: Array.from({length: 9}, () => Math.random() * 60 + 40) },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6 sm:mb-8">
      {kpis.map((k, i) => (
        <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
          className="rounded-2xl p-5 flex flex-col justify-between shadow-sm" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${k.color}15` }}>
              <k.icon className="w-4 h-4" style={{ color: k.color }} />
            </div>
            <span className="text-[12px] font-bold" style={{ color: 'var(--th-text)' }}>{k.label}</span>
          </div>
          <p className="text-[28px] font-bold mb-3 leading-none tracking-tight" style={{ color: 'var(--th-text)' }}>{k.value}</p>
          <div className="flex items-end justify-between">
            <span className="text-[10px] font-bold text-emerald-500">{k.trend}</span>
            <MiniBars heights={k.bars} color={k.color} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Learning Card ─── */
function LearningCard({ learning, index }) {
  const type = TYPE_COLORS[learning.type] || TYPE_COLORS.learning;
  const iconList = [Lightbulb, Database, Zap, Rocket, Code, Cloud];
  const Icon = iconList[(learning.title.length) % iconList.length];
  const tags = learning.tags || [];
  const projectName = learning.project?.title || 'Unknown Project';

  return (
    <div
      className="p-4 sm:p-5 flex flex-col md:flex-row items-start gap-4 md:gap-5 transition-all"
      style={{ borderBottom: '1px solid var(--th-border)' }}
      onMouseOver={e => e.currentTarget.style.background='var(--th-bg-secondary)'}
      onMouseOut={e => e.currentTarget.style.background='transparent'}
    >
      {/* Icon & Mobile Title row */}
      <div className="flex items-start gap-3 w-full md:w-auto">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: type.bg }}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: type.text }} />
        </div>
        
        {/* Mobile Title & Tags */}
        <div className="md:hidden flex-1 min-w-0">
          <h4 className="text-[13px] font-bold truncate mb-1" style={{ color: 'var(--th-text)' }}>{learning.title}</h4>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[11px] font-bold truncate max-w-[140px]" style={{ color: 'var(--th-text-dim)' }}>{projectName}</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: type.bg, color: type.text }}>
              {learning.type.charAt(0).toUpperCase() + learning.type.slice(1)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Desktop Column 1: Title & Tags */}
      <div className="hidden md:flex w-[30%] min-w-0 flex-col justify-start">
        <h4 className="text-[13px] font-bold truncate mb-1.5" style={{ color: 'var(--th-text)' }}>{learning.title}</h4>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[11px] font-bold truncate max-w-[120px]" style={{ color: 'var(--th-text-dim)' }}>
            {projectName}
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: type.bg, color: type.text }}>
            {learning.type.charAt(0).toUpperCase() + learning.type.slice(1)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md font-medium" style={{ background: 'var(--th-bg-secondary)', color: 'var(--th-text-dim)' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Column 2: Description */}
      <div className="flex-1 min-w-0 md:px-6 w-full md:w-auto">
        <p className="text-[12px] leading-relaxed" style={{ color: 'var(--th-text)' }}>
          {learning.description}
        </p>
        {/* Mobile only tags below description */}
        <div className="md:hidden flex items-center gap-1.5 flex-wrap mt-3">
          {tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md font-medium" style={{ background: 'var(--th-bg-secondary)', color: 'var(--th-text-dim)' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Column 3: Stats & Actions */}
      <div className="w-full md:w-[120px] shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between md:self-stretch mt-3 md:mt-0 pt-3 md:pt-0 border-t border-transparent md:border-none" style={{ borderTopColor: 'var(--th-border)' }}>
        <div className="flex flex-row md:flex-col items-center md:items-end gap-2 md:gap-1 mt-0 md:mt-1">
          <span className="text-[10px] font-bold" style={{ color: 'var(--th-text-dim)' }}>Impact</span>
          <span className="text-[14px] font-bold text-emerald-500">
            {learning.impactScore}/10
          </span>
        </div>
        <div className="flex items-center gap-3 mb-0 md:mb-1">
          <span className="text-[10px] font-medium" style={{ color: 'var(--th-text-dim)' }}>
            {learning.createdAt ? '2d ago' : ''}
          </span>
          <button className="p-1 hover:opacity-70 transition-opacity">
            <MoreVertical className="w-4 h-4" style={{ color: 'var(--th-text-dim)' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── AI Insights Panel (Horizontal) ─── */
function AIInsightsPanel({ learnings }) {
  const [, setSearchParams] = useSearchParams();

  const tagCounts = {};
  learnings.forEach(l => {
    (l.tags || []).forEach(t => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });
  
  const knowledgeAreas = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count }))
    .slice(0, 7);

  const totalTags = Object.values(tagCounts).reduce((a, b) => a + b, 0);

  const growthAreas = knowledgeAreas.slice(0, 5).map((k, i) => ({
    label: k.label,
    pct: totalTags > 0 ? Math.round((k.count / totalTags) * 200) : 0, 
    color: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'][i % 5]
  })).map(g => ({ ...g, pct: g.pct > 100 ? 100 : g.pct }));

  const recentLearnings = learnings.slice(0, 3).map(l => ({
    title: l.title,
    project: l.project?.title || 'Unknown',
    icon: TYPE_COLORS[l.type]?.icon || Lightbulb,
    color: TYPE_COLORS[l.type]?.text || '#10b981'
  }));

  const topTag = knowledgeAreas[0]?.label || 'development';
  
  return (
    <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl shadow-sm" style={{ border: '1px solid var(--th-border)', background: 'var(--th-card)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-[14px] sm:text-[15px] font-bold" style={{ color: 'var(--th-text)' }}>AI Insights</h3>
        <button 
          onClick={() => setSearchParams({ tab: 'intelligence' })}
          className="flex items-center gap-1 text-[11px] font-semibold hover:opacity-70" 
          style={{ color: 'var(--th-text-dim)' }}
        >
          View Full Report <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8 items-start">
        {/* Top Insight */}
        <div className="p-4 sm:p-5 rounded-2xl relative overflow-hidden h-full" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <p className="text-[12px] font-bold text-amber-900">Top Insight</p>
          </div>
          <p className="text-[13px] leading-relaxed text-amber-900/80 relative z-10 font-medium">
            You're exploring a lot of <strong>{topTag}</strong> topics.<br className="hidden sm:block" /> Consider creating reusable patterns or adding them to your core stack.
          </p>
          <Sparkles className="absolute right-4 bottom-4 w-10 h-10 text-amber-400 opacity-40" />
        </div>

        {/* Growth Areas */}
        <div>
          <h4 className="text-[12px] sm:text-[13px] font-bold mb-3 sm:mb-4" style={{ color: 'var(--th-text)' }}>Your Growth Areas</h4>
          <div className="space-y-3">
            {growthAreas.length > 0 ? growthAreas.map(g => (
              <div key={g.label} className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-semibold" style={{ color: 'var(--th-text)' }}>{g.label}</span>
                  <span className="text-[12px] font-bold" style={{ color: 'var(--th-text)' }}>{g.pct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--th-bg-secondary)' }}>
                  <div className="h-full rounded-full" style={{ width: `${g.pct}%`, background: g.color }} />
                </div>
              </div>
            )) : <p className="text-[11px] italic" style={{ color: 'var(--th-text-dim)' }}>No growth data yet</p>}
          </div>
        </div>

        {/* Recently Applied Learnings */}
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h4 className="text-[12px] sm:text-[13px] font-bold" style={{ color: 'var(--th-text)' }}>Recently Applied</h4>
          </div>
          <div className="space-y-4">
            {recentLearnings.length > 0 ? recentLearnings.map((l, i) => {
              const IconComp = l.icon;
              return (
                <div key={i} className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center mt-0.5 shrink-0" style={{ background: `${l.color}15` }}>
                      <IconComp className="w-3 h-3" style={{ color: l.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold truncate leading-tight mb-0.5" style={{ color: 'var(--th-text)' }}>{l.title}</p>
                      <p className="text-[10px] font-semibold" style={{ color: 'var(--th-text-dim)' }}>{l.project}</p>
                    </div>
                  </div>
                </div>
              );
            }) : <p className="text-[11px] italic" style={{ color: 'var(--th-text-dim)' }}>No recent learnings</p>}
          </div>
        </div>

        {/* Top Knowledge Areas */}
        <div>
          <h4 className="text-[12px] sm:text-[13px] font-bold mb-3 sm:mb-4" style={{ color: 'var(--th-text)' }}>Top Knowledge Areas</h4>
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {knowledgeAreas.length > 0 ? knowledgeAreas.map(k => (
              <div key={k.label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all hover:bg-black/[0.02]" style={{ border: '1px solid var(--th-border)', background: 'var(--th-bg-secondary)' }}>
                <span className="text-[11px] font-semibold" style={{ color: 'var(--th-text)' }}>{k.label}</span>
                <span className="text-[10px] font-bold" style={{ color: 'var(--th-text-dim)' }}>{k.count}</span>
              </div>
            )) : <p className="text-[11px] italic" style={{ color: 'var(--th-text-dim)' }}>No knowledge areas yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Learnings Tab ─── */
export default function LearningsTab() {
  const [subTab, setSubTab] = useState('learning'); 
  const [search, setSearch] = useState('');
  const [projectIdFilter, setProjectIdFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { data: projectsData } = useProjects({});
  const projects = projectsData?.data || [];

  const allLearnings = projects.flatMap(p =>
    (p.learnings || []).map(l => ({ ...l, project: p }))
  );

  const allTags = Array.from(new Set(allLearnings.flatMap(l => l.tags || []))).sort();

  let learnings = subTab === 'all' ? allLearnings : allLearnings.filter(l => l.type === subTab);
  
  if (projectIdFilter !== 'all') {
    learnings = learnings.filter(l => l.project?.id === projectIdFilter);
  }
  
  if (tagFilter !== 'all') {
    learnings = learnings.filter(l => (l.tags || []).includes(tagFilter));
  }

  if (search) learnings = learnings.filter(l =>
    l.title?.toLowerCase().includes(search.toLowerCase()) ||
    l.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (sortBy === 'latest') {
    learnings.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } else if (sortBy === 'impact') {
    learnings.sort((a, b) => (b.impactScore || 0) - (a.impactScore || 0));
  }

  const totalPages = Math.ceil(learnings.length / itemsPerPage) || 1;
  const paginatedLearnings = learnings.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const projectOptions = [{ value: 'all', label: 'All Projects' }, ...projects.map(p => ({ value: p.id, label: p.title }))];
  const tagOptions = [{ value: 'all', label: 'All Tags' }, ...allTags.map(t => ({ value: t, label: t }))];
  const sortOptions = [{ value: 'latest', label: 'Latest First' }, { value: 'impact', label: 'Highest Impact' }];

  return (
    <div className="flex flex-col">
      
      <KpiCards learnings={allLearnings} />

      {/* Horizontal AI Insights Panel */}
      <AIInsightsPanel learnings={allLearnings} />

      {/* Underlined Sub-Tabs */}
      <div className="flex items-center gap-6 sm:gap-10 mb-6 sm:mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide" style={{ borderBottom: '1px solid var(--th-border)' }}>
        {SUB_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setSubTab(t.key)}
            className={clsx(
              'pb-3 text-[13px] sm:text-[14px] font-bold transition-all relative shrink-0',
              subTab === t.key ? 'text-amber-500' : 'text-slate-500 hover:text-slate-700'
            )}
            style={{ color: subTab === t.key ? '#f59e0b' : 'var(--th-text-dim)' }}
          >
            {t.label}
            {subTab === t.key && (
              <motion.div
                layoutId="learning_tab_indicator"
                className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-amber-500 rounded-t-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Filters Row */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full xl:w-auto flex-wrap">
          <div className="relative w-full sm:w-auto z-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--th-text-dim)' }} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search learnings..."
              className="pl-10 pr-4 py-2.5 rounded-xl text-[13px] font-medium w-full sm:w-[260px] outline-none"
              style={{ background: 'var(--th-bg-secondary)', color: 'var(--th-text)', border: '1px solid var(--th-border)' }}
            />
          </div>
          
          <div className="flex sm:flex-row gap-3 w-full sm:w-auto z-20">
            <Select 
              options={projectOptions} 
              value={projectIdFilter} 
              onChange={val => { setProjectIdFilter(val); setPage(1); }} 
              className="w-full sm:w-40" 
            />
            <Select 
              options={tagOptions} 
              value={tagFilter} 
              onChange={val => { setTagFilter(val); setPage(1); }} 
              className="w-full sm:w-36" 
            />
          </div>
        </div>

        <div className="w-full sm:w-40 xl:w-auto mt-2 xl:mt-0 z-20">
          <Select 
            options={sortOptions} 
            value={sortBy} 
            onChange={val => { setSortBy(val); setPage(1); }} 
            className="w-full xl:w-40" 
          />
        </div>
      </div>

      {/* Learnings List Container */}
      <div className="rounded-2xl overflow-hidden shadow-sm z-0" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
        {paginatedLearnings.length === 0 ? (
          <div className="text-center py-20">
            <Lightbulb className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--th-text-dim)' }} />
            <p className="text-[15px] font-bold" style={{ color: 'var(--th-text)' }}>No learnings found</p>
            <p className="text-[13px] mt-1" style={{ color: 'var(--th-text-dim)' }}>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {paginatedLearnings.map((l, i) => <LearningCard key={l.id} learning={l} index={i} />)}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-5" style={{ background: 'var(--th-bg)' }}>
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-semibold disabled:opacity-50" 
              style={{ color: 'var(--th-text-dim)' }}
            >
              {'<'}
            </button>
            <span className="text-[13px] font-semibold mx-1" style={{ color: 'var(--th-text-dim)' }}>
              Page {page} of {totalPages}
            </span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-semibold disabled:opacity-50" 
              style={{ color: 'var(--th-text-dim)' }}
            >
              {'>'}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

