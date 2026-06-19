import { motion } from 'motion/react';
import { Waves, GitCompareArrows, Search, TreeDeciduous, Network, Layers, BrainCircuit, ArrowLeftRight, Undo2 } from 'lucide-react';

const PATTERN_ICONS = {
  'Sliding Window': Waves, 'Two Pointer': GitCompareArrows, 'Binary Search': Search,
  Trees: TreeDeciduous, Graphs: Network, Stack: Layers, 'Dynamic Programming': BrainCircuit,
  Backtracking: Undo2, default: ArrowLeftRight,
};

function getMasteryColor(pct) {
  if (pct >= 80) return '#10b981'; // Mastered
  if (pct >= 50) return '#f59e0b'; // Strong
  return '#ef4444'; // Needs Work
}

export function DsaPatternMastery({ patterns = [] }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Pattern Mastery</h3>
        <span className="text-[11px] cursor-pointer" style={{ color: 'var(--th-primary)' }}>View all</span>
      </div>

      {patterns.length === 0 ? (
        <p className="text-[11px] italic py-4" style={{ color: 'var(--th-text-secondary)' }}>Solve problems to track pattern mastery</p>
      ) : (
        <>
          {/* Responsive columns, scrollable if many */}
          <div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 mb-3 overflow-y-auto pr-1"
            style={{ 
              maxHeight: '320px',
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--th-border) transparent'
            }}
          >
            {patterns.map((p, i) => {
              const IconComp = PATTERN_ICONS[p.pattern] || PATTERN_ICONS.default;
              const color = getMasteryColor(p.masteryPct);
              return (
                <motion.div
                  key={p.pattern}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl p-2.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:-translate-y-0.5"
                  style={{ 
                    background: 'var(--th-card)', 
                    border: '1px solid var(--th-border)',
                    minHeight: '75px',
                  }}
                >
                  {/* Icon */}
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center mb-1.5" 
                    style={{ background: `${color}12` }}
                  >
                    <IconComp className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                  
                  {/* Pattern Name */}
                  <p className="text-[10px] font-bold mb-1 break-words px-0.5 leading-tight" style={{ color: 'var(--th-text)' }}>
                    {p.pattern}
                  </p>
                  
                  {/* Percentage */}
                  <p className="text-[14px] font-bold leading-none" style={{ color }}>{p.masteryPct}%</p>
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 pt-2" style={{ borderTop: '1px solid var(--th-border)' }}>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} />
              <span className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>Mastered (80%+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} />
              <span className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>Strong (50-79%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
              <span className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>Needs Work (&lt;50%)</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
