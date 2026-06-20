import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, LayoutGrid, List, Github, PenLine, ArrowRight,
  Package, ChevronDown, FolderOpen,
} from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { getGithubLoginUrl } from '../api';
import { ProjectCard } from './ProjectCard';
import { Select } from '../../../design-system/components/Select';
import clsx from 'clsx';

const FILTERS = [
  { key: null, label: 'All' },
  { key: 'BUILDING', label: 'Building' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'ARCHIVED', label: 'Archived' },
  { key: 'github', label: 'GitHub Connected' },
  { key: 'portfolio', label: 'Portfolio Ready' },
];

const card = 'rounded-2xl shadow-sm';
const cardStyle = { background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' };

export default function ProjectsTab({ onNewProject }) {
  const [, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid');
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('updated');

  const { data: projectsData } = useProjects({});
  const allProjects = projectsData?.data || [];

  let projects = [...allProjects];
  if (filter === 'BUILDING' || filter === 'SHIPPED' || filter === 'ARCHIVED') {
    projects = projects.filter(p => p.status === filter);
  }
  if (filter === 'github') projects = projects.filter(p => p.githubRepoId || p.repoUrl);
  if (filter === 'portfolio') projects = projects.filter(p => (p.metrics?.portfolioScore || 0) >= 7);
  if (search) projects = projects.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()));

  if (sortBy === 'updated') {
    projects.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  } else if (sortBy === 'created') {
    projects.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } else if (sortBy === 'name') {
    projects.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  } else if (sortBy === 'priority') {
    const pWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, default: 0 };
    projects.sort((a, b) => (pWeight[b.priority] || 0) - (pWeight[a.priority] || 0));
  }

  const displayed = projects.slice(0, limit);
  const totalActive = allProjects.filter(p => ['BUILDING', 'PLANNING', 'TESTING', 'IDEA'].includes(p.status)).length;
  const totalShipped = allProjects.filter(p => p.status === 'SHIPPED').length;
  const totalArchived = allProjects.filter(p => p.status === 'ARCHIVED').length;

  const handleGithubConnect = async () => {
    try {
      const state = crypto.randomUUID();
      sessionStorage.setItem('github_oauth_state', state);
      const url = await getGithubLoginUrl(state);
      if (url) window.location.href = url;
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5">
      {/* ── Filter & Search Bar ── */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--th-text-dim)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-[12px] outline-none"
            style={{ background: 'var(--th-bg-secondary)', color: 'var(--th-text)', border: '1px solid var(--th-border)' }}
          />
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 flex-wrap flex-1">
          {FILTERS.map(f => {
            const active = filter === f.key;
            return (
              <button
                key={f.key ?? 'all'}
                onClick={() => setFilter(f.key)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all',
                  active ? 'text-white shadow-sm' : 'hover:opacity-80',
                )}
                style={{
                  background: active ? 'var(--th-primary)' : 'var(--th-bg-secondary)',
                  color: active ? '#fff' : 'var(--th-text-secondary)',
                  border: active ? 'none' : '1px solid var(--th-border)',
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Sort + view */}
        <div className="flex items-center gap-2 shrink-0">
          <Select
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'updated', label: 'Sort by: Last Worked On' },
              { value: 'created', label: 'Sort by: Newest First' },
              { value: 'name', label: 'Sort by: Name (A-Z)' },
              { value: 'priority', label: 'Sort by: Priority' },
            ]}
            className="w-48"
          />
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--th-border)' }}>
            <button
              onClick={() => setView('grid')}
              className="p-2 transition-colors"
              style={{
                background: view === 'grid' ? 'var(--th-primary)' : 'var(--th-card-solid)',
              }}
            >
              <LayoutGrid className="w-3.5 h-3.5" style={{ color: view === 'grid' ? '#fff' : 'var(--th-text-dim)' }} />
            </button>
            <button
              onClick={() => setView('list')}
              className="p-2 transition-colors"
              style={{
                background: view === 'list' ? 'var(--th-primary)' : 'var(--th-card-solid)',
              }}
            >
              <List className="w-3.5 h-3.5" style={{ color: view === 'list' ? '#fff' : 'var(--th-text-dim)' }} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Top Action Cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* New Project card */}
        <div className={clsx(card, 'lg:col-span-8 p-5')} style={cardStyle}>
          <h3 className="text-[14px] font-bold mb-0.5" style={{ color: 'var(--th-text)' }}>New Project</h3>
          <p className="text-[11px] mb-4" style={{ color: 'var(--th-text-dim)' }}>
            Choose how you want to start building something amazing
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleGithubConnect}
              className="flex items-center gap-3 p-4 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-sm text-left group"
              style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}
              >
                <Github className="w-5 h-5" style={{ color: 'var(--th-text)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold" style={{ color: 'var(--th-text)' }}>Connect GitHub Repo</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--th-text-dim)' }}>
                  Import from your existing repositories
                </p>
              </div>
              <ArrowRight className="w-4 h-4 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--th-text-dim)' }} />
            </button>

            <button
              onClick={onNewProject}
              className="flex items-center gap-3 p-4 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-sm text-left group"
              style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}
              >
                <PenLine className="w-5 h-5" style={{ color: 'var(--th-text)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold" style={{ color: 'var(--th-text)' }}>Create Manually</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--th-text-dim)' }}>
                  Add project details manually
                </p>
              </div>
              <ArrowRight className="w-4 h-4 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--th-text-dim)' }} />
            </button>
          </div>
        </div>

        {/* Stats card */}
        <div className={clsx(card, 'lg:col-span-4 p-5 flex items-center justify-between gap-4')} style={cardStyle}>
          <div>
            <p className="text-[28px] font-bold leading-none" style={{ color: 'var(--th-text)' }}>
              {allProjects.length} Projects
            </p>
            <p className="text-[12px] mt-2" style={{ color: 'var(--th-text-dim)' }}>
              {totalActive} Active • {totalShipped} Shipped • {totalArchived} Archived
            </p>
          </div>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(var(--th-primary-rgb), 0.12)' }}
          >
            <FolderOpen className="w-8 h-8" style={{ color: 'var(--th-primary)' }} />
          </div>
        </div>
      </div>

      {/* ── Project Grid ── */}
      {displayed.length === 0 ? (
        <div className={clsx(card, 'text-center py-16')} style={cardStyle}>
          <Package className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--th-text-dim)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>No projects found</p>
          <p className="text-[12px] mt-1" style={{ color: 'var(--th-text-dim)' }}>Start building something amazing</p>
        </div>
      ) : (
        <div className={clsx(
          view === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4'
            : 'flex flex-col gap-3',
        )}>
          {displayed.map((p, i) => (
            <ProjectCard 
              key={p.id} 
              project={p} 
              index={i} 
              onClick={() => setSearchParams({ tab: 'pipeline', id: p.id }, { replace: true })}
            />
          ))}
        </div>
      )}

      {/* ── Footer ── */}
      {projects.length > 0 && (
        <div className="flex flex-col items-center gap-2 pt-2">
          <p className="text-[12px]" style={{ color: 'var(--th-text-dim)' }}>
            Showing {displayed.length} of {projects.length} projects
          </p>
          {projects.length > limit && (
            <button
              onClick={() => setLimit(l => l + 10)}
              className="text-[12px] font-semibold flex items-center gap-1.5 px-5 py-2 rounded-xl transition-all hover:opacity-80"
              style={{ color: 'var(--th-primary)', border: '1px solid var(--th-border)', background: 'var(--th-card-solid)' }}
            >
              Load More Projects
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
