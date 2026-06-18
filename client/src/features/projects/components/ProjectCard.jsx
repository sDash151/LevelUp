import { motion } from 'motion/react';
import { Card, Badge } from '@/design-system/components';
import { Github, ExternalLink, Trash2, Calendar } from 'lucide-react';
import { formatRelative } from '@/shared/utils/dates';
import clsx from 'clsx';

const statusConfig = {
  PLANNING: { color: 'default', label: 'Planning' },
  IN_PROGRESS: { color: 'accent', label: 'In Progress' },
  ON_HOLD: { color: 'warning', label: 'On Hold' },
  COMPLETED: { color: 'success', label: 'Completed' },
  ARCHIVED: { color: 'default', label: 'Archived' },
};

const priorityDot = { LOW: 'bg-zinc-500', MEDIUM: 'bg-info', HIGH: 'bg-warning', CRITICAL: 'bg-danger' };

export function ProjectCard({ project, onDelete }) {
  const status = statusConfig[project.status] || statusConfig.PLANNING;

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      <Card className="group h-full flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={clsx('w-2 h-2 rounded-full shrink-0', priorityDot[project.priority])} title={project.priority} />
            <h3 className="font-semibold text-sm text-white truncate">{project.name}</h3>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant={status.color} size="sm">{status.label}</Badge>
            <button onClick={() => onDelete?.(project.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-zinc-600 hover:text-danger transition-all">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {project.description && <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{project.description}</p>}

        {/* Tech Stack */}
        {project.techStack?.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-3">
            {project.techStack.map((t) => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.04] text-zinc-400 font-medium">{t}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-2 border-t border-white/[0.04] flex items-center justify-between">
          <span className="text-[10px] text-zinc-600 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {formatRelative(project.updatedAt)}
          </span>
          <div className="flex items-center gap-2">
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
                <Github className="w-3.5 h-3.5" />
              </a>
            )}
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-accent transition-colors" onClick={(e) => e.stopPropagation()}>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
