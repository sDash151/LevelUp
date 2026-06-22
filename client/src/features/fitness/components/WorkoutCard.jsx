import { motion } from 'motion/react';
import { Card, Badge } from '@/design-system/components';
import { Clock, Flame, Trash2 } from 'lucide-react';
import { formatRelative } from '@/shared/utils/dates';
import { formatDuration } from '@/shared/utils/formatters';

const typeColors = { STRENGTH: 'accent', CARDIO: 'success', FLEXIBILITY: 'info', SPORTS: 'warning', YOGA: 'info', HIIT: 'danger', OTHER: 'default' };

export function WorkoutCard({ workout, onDelete }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} layout>
      <Card className="group">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm text-white truncate">{workout.name}</h3>
              <Badge variant={typeColors[workout.type]} size="sm">{workout.type}</Badge>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-[var(--th-text-secondary)]">
              <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{formatDuration(workout.duration)}</span>
              {workout.caloriesBurned > 0 && <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-orange-400" />{workout.caloriesBurned} cal</span>}
              <span>{formatRelative(workout.date)}</span>
            </div>
          </div>
          <button onClick={() => onDelete?.(workout.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-[var(--th-text-secondary)] hover:text-danger transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Exercises */}
        {workout.exercises?.length > 0 && (
          <div className="pt-2 border-t border-white/[0.04] space-y-1">
            {workout.exercises.slice(0, 4).map((ex, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-[var(--th-text-dim)]">{ex.name}</span>
                <span className="text-[var(--th-text-secondary)] stat-number">
                  {ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : ''}
                  {ex.weight ? ` @ ${ex.weight}kg` : ''}
                  {ex.duration ? `${ex.duration}m` : ''}
                </span>
              </div>
            ))}
            {workout.exercises.length > 4 && <p className="text-[10px] text-[var(--th-text-secondary)]">+{workout.exercises.length - 4} more</p>}
          </div>
        )}

        {workout.notes && <p className="text-[10px] text-[var(--th-text-secondary)] mt-2 italic">{workout.notes}</p>}
      </Card>
    </motion.div>
  );
}
