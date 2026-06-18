import { motion } from 'motion/react';
import { Check, Flame, MoreHorizontal, Trash2, Pencil } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

const iconMap = {
  brain: Icons.Brain, dumbbell: Icons.Dumbbell, 'book-open': Icons.BookOpen,
  droplets: Icons.Droplets, code: Icons.Code, 'pen-line': Icons.PenLine,
  heart: Icons.Heart, sun: Icons.Sun, moon: Icons.Moon, music: Icons.Music,
  apple: Icons.Apple, target: Icons.Target,
};

export function HabitCard({ habit, onToggle, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const IconComponent = iconMap[habit.icon] || Icons.Circle;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={clsx(
        'glass-card rounded-2xl p-4 flex items-center gap-4 transition-all duration-300',
        habit.completedToday && 'ring-1 ring-success/20'
      )}
    >
      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: habit.color + '18' }}
      >
        <IconComponent className="w-5 h-5" style={{ color: habit.color }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className={clsx('font-medium text-sm', habit.completedToday ? 'text-zinc-400 line-through' : 'text-white')}>
          {habit.name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-white/[0.04] text-zinc-500 capitalize">
            {habit.category}
          </span>
          {habit.streak > 0 && (
            <span className="text-[10px] flex items-center gap-0.5 text-orange-400">
              <Flame className="w-3 h-3" /> {habit.streak}d
            </span>
          )}
        </div>
      </div>

      {/* Menu */}
      <div className="relative">
        <button
          onClick={() => setShowMenu((p) => !p)}
          className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04] transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute right-0 top-8 z-20 glass-strong rounded-xl py-1 w-32 shadow-elevated"
          >
            <button onClick={() => { onEdit?.(habit); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-white/[0.04]">
              <Pencil className="w-3 h-3" /> Edit
            </button>
            <button onClick={() => { onDelete?.(habit.id); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-danger hover:bg-white/[0.04]">
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </motion.div>
        )}
      </div>

      {/* Toggle */}
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={() => onToggle?.(habit.id)}
        className={clsx(
          'w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300',
          habit.completedToday
            ? 'bg-success border-success text-white'
            : 'border-zinc-700 text-transparent hover:border-zinc-500'
        )}
      >
        <motion.div animate={{ scale: habit.completedToday ? 1 : 0 }} transition={{ type: 'spring', stiffness: 400 }}>
          <Check className="w-4 h-4" />
        </motion.div>
      </motion.button>
    </motion.div>
  );
}
