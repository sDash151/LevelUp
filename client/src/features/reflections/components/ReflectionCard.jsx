import { motion } from 'motion/react';
import { Card, Badge } from '@/design-system/components';
import { Trash2, Calendar } from 'lucide-react';
import { formatRelative } from '@/shared/utils/dates';

const MOODS = ['', '😞', '😐', '🙂', '😊', '🤩'];
const MOOD_LABELS = ['', 'Rough', 'Meh', 'Okay', 'Good', 'Amazing'];

export function ReflectionCard({ reflection, onDelete }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant={reflection.type === 'DAILY' ? 'accent' : reflection.type === 'WEEKLY' ? 'info' : 'success'}>
              {reflection.type}
            </Badge>
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatRelative(reflection.date)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {reflection.mood && (
              <span className="text-lg" title={MOOD_LABELS[reflection.mood]}>
                {MOODS[reflection.mood]}
              </span>
            )}
            <button
              onClick={() => onDelete?.(reflection.id)}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-600 hover:text-danger hover:bg-danger-dim transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed mb-3">{reflection.content}</p>

        {(reflection.gratitude || reflection.improvements) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-white/[0.04]">
            {reflection.gratitude && (
              <div>
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Gratitude</p>
                <p className="text-xs text-zinc-400">{reflection.gratitude}</p>
              </div>
            )}
            {reflection.improvements && (
              <div>
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Improve</p>
                <p className="text-xs text-zinc-400">{reflection.improvements}</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
