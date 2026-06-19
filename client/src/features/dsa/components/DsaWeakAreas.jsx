import { motion } from 'motion/react';
import { TrendingDown } from 'lucide-react';

const TOPIC_COLORS = {
  Graphs: '#ef4444', 'Dynamic Programming': '#f97316', Backtracking: '#eab308',
  Trees: '#10b981', Strings: '#06b6d4', 'Linked List': '#8b5cf6',
  'Binary Search': '#3b82f6', Arrays: '#10b981', Stack: '#f43f5e',
  'Sliding Window': '#14b8a6', 'Hash Map': '#a855f7', Heap: '#ec4899',
  default: '#6b7280',
};

export function DsaWeakAreas({ topics = [] }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', height: '280px' }}>
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Weak Areas</h3>
        <span className="text-[11px] cursor-pointer" style={{ color: 'var(--th-primary)' }}>View all</span>
      </div>

      {topics.length === 0 ? (
        <p className="text-[11px] italic py-4 shrink-0" style={{ color: 'var(--th-text-secondary)' }}>Solve problems to see weak areas</p>
      ) : (
        <div className="space-y-3 overflow-y-auto flex-1 pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--th-border) transparent' }}>
          {topics.map((topic, i) => {
            const color = TOPIC_COLORS[topic.topic] || TOPIC_COLORS.default;
            return (
              <motion.div
                key={topic.topic}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="w-3.5 h-3.5" style={{ color }} />
                  <span className="text-[12px] flex-1" style={{ color: 'var(--th-text-secondary)' }}>{topic.topic}</span>
                  <span className="text-[11px] font-medium" style={{ color }}>{topic.masteryPct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--th-border)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${topic.masteryPct}%` }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
