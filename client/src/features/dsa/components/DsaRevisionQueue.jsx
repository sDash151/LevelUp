import { motion } from 'motion/react';
import { Clock, AlertCircle } from 'lucide-react';

const DIFF_COLORS = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };

function getDueLabel(dueDate) {
  if (!dueDate) return { text: 'No date', color: 'var(--th-text-dim)' };
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return { text: 'Due Today', color: '#ef4444' };
  if (diffDays === 1) return { text: 'Due in 1 day', color: '#f97316' };
  return { text: `Due in ${diffDays} days`, color: '#f59e0b' };
}

export function DsaRevisionQueue({ problems = [] }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', height: '280px' }}>
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Revision Queue</h3>
        <span className="text-[11px] cursor-pointer" style={{ color: 'var(--th-primary)' }}>View all</span>
      </div>

      {problems.length === 0 ? (
        <p className="text-[11px] italic py-4 shrink-0" style={{ color: 'var(--th-text-secondary)' }}>No revisions due. Keep solving!</p>
      ) : (
        <div className="space-y-3 overflow-y-auto flex-1 pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--th-border) transparent' }}>
          {problems.map((problem, i) => {
            const due = getDueLabel(problem.dueDate);
            const diffColor = DIFF_COLORS[problem.difficulty] || '#6b7280';
            return (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-2.5 cursor-pointer group"
              >
                <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: due.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium truncate group-hover:underline" style={{ color: 'var(--th-text-secondary)' }}>
                    {problem.title}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--th-text-dim)' }}>
                    {problem.topic} · <span style={{ color: diffColor }}>{problem.difficulty}</span>
                  </p>
                </div>
                <span className="text-[10px] font-medium shrink-0 px-2 py-0.5 rounded-md" style={{ color: due.color, background: `${due.color}15` }}>
                  {due.text}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
