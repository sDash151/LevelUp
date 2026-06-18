import { motion } from 'motion/react';
import { Flame } from 'lucide-react';
import { Card } from '@/design-system/components';

export function StreakCard({ current = 0, best = 0 }) {
  return (
    <Card className="flex flex-col items-center justify-center py-8 relative overflow-hidden">
      {/* Subtle glow behind fire */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-24 h-24 rounded-full bg-orange-500/10 blur-[40px]" />
      </div>

      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Flame className="w-10 h-10 text-orange-400 drop-shadow-[0_0_12px_rgba(251,146,60,0.5)]" />
      </motion.div>

      <span className="stat-number text-4xl font-bold text-white mt-3">{current}</span>
      <p className="text-sm text-zinc-400 mt-1">Current Streak</p>
      <p className="text-xs text-zinc-600 mt-2">Best: {best} days 🏆</p>
    </Card>
  );
}
