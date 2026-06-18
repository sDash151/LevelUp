import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, FolderKanban } from 'lucide-react';
import { AnimatedPage, EmptyState } from '@/design-system/components';
import { useProjects, useCreateProject, useDeleteProject } from '../hooks/useProjects';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectForm } from '../components/ProjectForm';
import clsx from 'clsx';

const TABS = [null, 'IN_PROGRESS', 'PLANNING', 'ON_HOLD', 'COMPLETED'];
const LABELS = { null: 'All', IN_PROGRESS: 'Active', PLANNING: 'Planning', ON_HOLD: 'On Hold', COMPLETED: 'Done' };

export default function ProjectsPage() {
  const [tab, setTab] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { data: projects = [] } = useProjects(tab);
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();

  return (
    <AnimatedPage>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Projects</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your side projects & builds</p>
      </div>

      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 pb-1">
        {TABS.map((t) => (
          <button key={t || 'all'} onClick={() => setTab(t)} className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all', tab === t ? 'bg-accent text-white' : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]')}>{LABELS[t]}</button>
        ))}
      </div>

      {projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects yet" description="Track your builds and side projects" action={{ children: 'New Project', onClick: () => setShowForm(true) }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <ProjectCard project={p} onDelete={(id) => deleteProject.mutate(id)} />
            </motion.div>
          ))}
        </div>
      )}

      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowForm(true)} className="fixed bottom-24 lg:bottom-8 right-6 w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-glow-accent z-40">
        <Plus className="w-6 h-6" />
      </motion.button>

      <ProjectForm isOpen={showForm} onClose={() => setShowForm(false)} onSubmit={(data) => createProject.mutate(data)} />
    </AnimatedPage>
  );
}
