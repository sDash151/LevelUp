import { motion } from 'motion/react';
import { Card, Badge } from '@/design-system/components';
import { ExternalLink, Clock, Trash2, Star } from 'lucide-react';
import clsx from 'clsx';

const diffColors = { EASY: 'success', MEDIUM: 'warning', HARD: 'danger' };
const statusColors = { SOLVED: 'success', ATTEMPTED: 'warning', REVISIT: 'info', TODO: 'default' };

export function ProblemCard({ problem, onDelete, onStatusChange }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} layout>
      <Card className="group">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h3 className="font-medium text-sm text-white truncate">{problem.title}</h3>
              {problem.url && (
                <a href={problem.url} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-accent transition-colors">
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={diffColors[problem.difficulty]} size="sm">{problem.difficulty}</Badge>
              <Badge variant={statusColors[problem.status]} size="sm">{problem.status.replace('_', ' ')}</Badge>
              <span className="text-[10px] text-zinc-500">{problem.platform}</span>
              <span className="text-[10px] text-zinc-600">• {problem.topic}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {problem.timeSpent > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-zinc-500">
                <Clock className="w-3 h-3" />{problem.timeSpent}m
              </span>
            )}
            {problem.rating && (
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={clsx('w-2.5 h-2.5', i < problem.rating ? 'text-warning fill-warning' : 'text-zinc-800')} />
                ))}
              </div>
            )}
            <button
              onClick={() => onDelete?.(problem.id)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded text-zinc-600 hover:text-danger transition-all"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
        {problem.notes && (
          <p className="text-xs text-zinc-500 mt-2 pt-2 border-t border-white/[0.04]">{problem.notes}</p>
        )}
      </Card>
    </motion.div>
  );
}
