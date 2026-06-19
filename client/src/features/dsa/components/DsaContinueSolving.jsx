import { useState, useDeferredValue, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, ExternalLink, Check, Clock, Circle, MoreVertical, ArrowRight, MessageSquare } from 'lucide-react';
import clsx from 'clsx';
import { Select } from '../../../design-system/components';

const DIFF_COLORS = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444', Unknown: '#6b7280' };
const STATUS_TABS = [
  { key: null, label: 'All' },
  { key: 'TODO', label: 'To Do' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'SOLVED', label: 'Solved' },
  { key: 'BOOKMARKED', label: 'Bookmarked' },
];

function StatusBadge({ status, solvedAt }) {
  if (status === 'SOLVED') {
    const ago = solvedAt ? getRelativeTime(solvedAt) : '';
    return (
      <div className="flex items-center gap-1">
        <Check className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
        <span className="text-[10px]" style={{ color: '#10b981' }}>Solved</span>
        {ago && <span className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>{ago}</span>}
      </div>
    );
  }
  if (status === 'IN_PROGRESS') {
    return (
      <div className="flex items-center gap-1">
        <Clock className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
        <span className="text-[10px]" style={{ color: '#f59e0b' }}>In Progress</span>
      </div>
    );
  }
  if (status === 'REVISING') {
    return (
      <div className="flex items-center gap-1">
        <Clock className="w-3.5 h-3.5" style={{ color: '#3b82f6' }} />
        <span className="text-[10px]" style={{ color: '#3b82f6' }}>Revision</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <Circle className="w-3.5 h-3.5" style={{ color: 'var(--th-text-dim)' }} />
      <span className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>To Do</span>
    </div>
  );
}

function getRelativeTime(date) {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'today';
  if (diff === 1) return '1d ago';
  if (diff < 7) return `${diff}d ago`;
  return `${Math.floor(diff / 7)}w ago`;
}

export function DsaContinueSolving({ problems = [], onProblemClick, onAddNote, onViewAll, totalCount, initialTopic = '' }) {
  const [activeTab, setActiveTab] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);

  useEffect(() => {
    setSelectedTopic(initialTopic);
  }, [initialTopic]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const availableTopics = [...new Set(problems.map(p => p.topic).filter(Boolean))].sort();

  const filtered = problems.filter(p => {
    if (activeTab && p.status !== activeTab) {
      if (activeTab === 'TODO' && (p.status === 'IN_PROGRESS' || p.status === 'SOLVED' || p.status === 'REVISING')) return false;
      if (activeTab !== 'TODO') return p.status === activeTab;
    }

    if (deferredSearchQuery) {
      const q = deferredSearchQuery.toLowerCase().trim();
      const tokens = q.split(/\s+/);
      const searchableText = `${p.title} ${p.topic} ${p.difficulty}`.toLowerCase();
      const matchesSearch = tokens.every(token => searchableText.includes(token));
      if (!matchesSearch) return false;
    }

    if (selectedTopic && p.topic !== selectedTopic) return false;
    if (selectedDifficulty && p.difficulty !== selectedDifficulty) return false;
    return true;
  });

  return (
    <div className="rounded-2xl p-4 flex flex-col" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', height: '500px' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-bold" style={{ color: 'var(--th-text)' }}>Continue Solving</h3>
      </div>

      {/* Tabs + Filters + Search */}
      <div className="flex flex-col gap-3 mb-4 pb-3 border-b" style={{ borderColor: 'var(--th-border)' }}>
        {/* Tabs Row */}
        <div className="flex items-center overflow-x-auto hide-scrollbar">
          {STATUS_TABS.map(tab => {
            let count = '';
            if (tab.key === null && totalCount) count = ` (${totalCount})`;
            else if (tab.key === 'TODO') count = ` (${problems.filter(p => p.status === 'TODO' || !p.status).length})`;
            else if (tab.key === 'IN_PROGRESS') count = ` (${problems.filter(p => p.status === 'IN_PROGRESS').length})`;
            else if (tab.key === 'SOLVED') count = ` (${problems.filter(p => p.status === 'SOLVED').length})`;

            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key || 'all'}
                onClick={() => setActiveTab(tab.key)}
                className="relative pb-2 text-[12px] font-bold whitespace-nowrap transition-colors mr-6"
                style={{ color: isActive ? '#f59e0b' : 'var(--th-text-dim)' }}
              >
                {tab.label}{count}
                {isActive && (
                  <motion.div
                    layoutId="dsaContinueTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-t-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Filters + Search Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Dropdowns */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold" style={{ color: 'var(--th-text-dim)' }}>Difficulty</span>
              <Select
                value={selectedDifficulty}
                onChange={setSelectedDifficulty}
                options={[
                  { value: '', label: 'All' },
                  { value: 'Easy', label: 'Easy' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Hard', label: 'Hard' }
                ]}
                className="w-28"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold" style={{ color: 'var(--th-text-dim)' }}>Topic</span>
              <Select
                value={selectedTopic}
                onChange={setSelectedTopic}
                options={[
                  { value: '', label: 'All' },
                  ...availableTopics.map(t => ({ value: t, label: t }))
                ]}
                className="w-48"
              />
            </div>
          </div>

          {/* Search */}
          <div className="relative w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--th-text-dim)' }} />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-[11px] font-medium outline-none transition-colors border"
              style={{
                color: 'var(--th-text)',
                background: 'var(--th-card)',
                borderColor: 'var(--th-border)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1 min-h-0">
        <table className="w-full table-fixed text-left">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--th-border)' }}>
              <th className="w-[22%] text-[10px] uppercase tracking-wider py-2 pl-2 pr-4 font-bold" style={{ color: 'var(--th-text-dim)' }}>Problem</th>
              <th className="w-[10%] text-[10px] uppercase tracking-wider py-2 px-4 font-bold hidden lg:table-cell" style={{ color: 'var(--th-text-dim)' }}>Path(s)</th>
              <th className="w-[15%] text-[10px] uppercase tracking-wider py-2 px-4 font-bold hidden lg:table-cell" style={{ color: 'var(--th-text-dim)' }}>Topic</th>
              <th className="w-[10%] text-[10px] uppercase tracking-wider py-2 px-4 font-bold" style={{ color: 'var(--th-text-dim)' }}>Difficulty</th>
              <th className="w-[10%] text-[10px] uppercase tracking-wider py-2 px-4 font-bold hidden md:table-cell" style={{ color: 'var(--th-text-dim)' }}>Status</th>

              <th className="w-[10%] text-[10px] uppercase tracking-wider py-2 px-4 font-bold hidden lg:table-cell" style={{ color: 'var(--th-text-dim)' }}>Est. Time</th>
              <th className="w-[8%] text-[10px] uppercase tracking-wider py-2 pl-4 font-bold hidden lg:table-cell" style={{ color: 'var(--th-text-dim)' }}>XP</th>
              <th className="w-[5%] text-[10px] uppercase tracking-wider py-2 font-bold text-center" style={{ color: 'var(--th-text-dim)' }}>Notes</th>
              <th className="w-[10%]"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <motion.tr
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="cursor-pointer transition-colors"
                style={{ borderBottom: '1px solid var(--th-border)' }}
                onClick={() => onProblemClick?.(p)}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--th-card-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td className="py-2.5 pl-2 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium break-words whitespace-normal leading-snug" style={{ color: 'var(--th-text-secondary)' }}>{p.title}</p>
                      {p.leetcodeUrl && (
                        <p className="text-[9px] mt-0.5" style={{ color: 'var(--th-text-dim)' }}>
                          LC · {p.platform || 'LeetCode'}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-4 hidden lg:table-cell">
                  <div className="flex gap-1">
                    <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'rgba(var(--th-primary-rgb), 0.1)' }}>
                      <span className="text-[10px]">⚡</span>
                    </div>
                    {p.paths?.length > 1 && (
                      <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                        <span className="text-[10px]">🧠</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-2.5 px-4 hidden lg:table-cell">
                  <span className="text-[11px]" style={{ color: 'var(--th-text-secondary)' }}>{p.topic}</span>
                </td>
                <td className="py-2.5 px-4">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded" style={{
                    color: DIFF_COLORS[p.difficulty] || '#6b7280',
                    background: `${DIFF_COLORS[p.difficulty] || '#6b7280'}15`,
                  }}>
                    {p.difficulty}
                  </span>
                </td>
                <td className="py-2.5 px-4 hidden md:table-cell">
                  <StatusBadge status={p.status} solvedAt={p.solvedAt} />
                </td>

                <td className="py-2.5 px-4 hidden lg:table-cell">
                  <span className="text-[11px]" style={{ color: 'var(--th-text-dim)' }}>{p.estimatedTime} min</span>
                </td>
                <td className="py-2.5 pl-4 hidden lg:table-cell whitespace-nowrap">
                  <span className="text-[11px] font-medium" style={{ color: '#10b981' }}>+{p.xpEarned || (p.difficulty === 'Easy' ? 10 : p.difficulty === 'Medium' ? 25 : 50)} XP</span>
                </td>
                <td className="py-2.5 text-center">
                  <button
                    className="p-1.5 rounded-lg transition-colors hover:bg-[var(--th-bg-secondary)] border inline-flex items-center justify-center"
                    style={{ 
                      color: p.notes ? '#10b981' : 'var(--th-text-dim)', 
                      borderColor: p.notes ? '#10b981' : 'var(--th-border)', 
                      background: p.notes ? '#10b98118' : 'var(--th-bg)' 
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddNote?.(p);
                    }}
                    title={p.notes ? "View/Edit Note" : "Add Note"}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </td>
                <td className="py-2.5 text-right pr-4">
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition hover:opacity-80 ml-auto"
                    style={{ background: 'var(--th-primary)', color: 'white' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const link = p.url || p.leetcodeUrl;
                      if (link) window.open(link, '_blank');
                    }}
                  >
                    Solve <ExternalLink className="w-3 h-3" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View all */}
      {onViewAll && (
        <div className="mt-3 text-center">
          <button onClick={onViewAll} className="cursor-pointer text-[12px] font-medium flex items-center gap-1 mx-auto transition hover:gap-2" style={{ color: 'var(--th-primary)' }}>
            View all problems <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
