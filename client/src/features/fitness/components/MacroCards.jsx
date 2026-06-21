import { motion } from 'motion/react';
import { Flame, Beef, Wheat, Droplet, TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

const MACRO_CONFIG = [
  { key: 'calories', label: 'Calories', icon: Flame, unit: 'kcal', color: '#E8A23A', ringColor: '#E8A23A' },
  { key: 'protein', label: 'Protein', icon: Beef, unit: 'g', color: '#10B981', ringColor: '#10B981' },
  { key: 'carbs', label: 'Carbs', icon: Wheat, unit: 'g', color: '#F59E0B', ringColor: '#F59E0B' }, // Yellow/Orange for Carbs in image
  { key: 'fats', label: 'Fats', icon: Droplet, unit: 'g', color: '#EF4444', ringColor: '#EF4444' }, // Red for fats in image
];

function ProgressRing({ size = 110, stroke = 8, pct = 0, color = '#E8A23A' }) {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(pct, 100) / 100) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90 drop-shadow-sm">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
    </svg>
  );
}

export default function MacroCards({ macros }) {
  if (!macros) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {MACRO_CONFIG.map((cfg, i) => {
        const m = macros[cfg.key] || {};
        const consumed = m.consumed || 0;
        const goal = m.goal || 1;
        const remaining = m.remaining || 0;
        const pct = Math.round((consumed / goal) * 100);

        const isHigh = pct > 100;
        const statusText = isHigh ? 'High' : 'On Track';
        const statusColor = isHigh ? '#EF4444' : '#10B981';

        return (
          <motion.div key={cfg.key} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-3xl p-5 relative overflow-hidden" style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)', boxShadow: 'var(--th-shadow)' }}>
            
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <cfg.icon className="w-4 h-4" style={{ color: cfg.color }} />
                <span className="text-sm font-bold" style={{ color: 'var(--th-text)' }}>{cfg.label}</span>
              </div>
              <span className="text-xs font-bold" style={{ color: statusColor }}>{statusText}</span>
            </div>

            {/* Body */}
            <div className="flex items-center justify-between">
              {/* Ring Area */}
              <div className="relative flex-shrink-0 flex items-center justify-center">
                <ProgressRing pct={pct} color={cfg.ringColor} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                  <span className="text-xl font-extrabold tracking-tight leading-none" style={{ color: 'var(--th-text)' }}>
                    {consumed.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-semibold mt-1" style={{ color: 'var(--th-text-dim)' }}>
                    / {goal.toLocaleString()}
                  </span>
                  <span className="text-[9px] font-semibold" style={{ color: 'var(--th-text-dim)' }}>
                    {cfg.unit}
                  </span>
                </div>
              </div>

              {/* Stats Area */}
              <div className="flex flex-col gap-3 text-right">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--th-text-secondary)' }}>Remaining</p>
                  <p className="text-sm font-bold" style={{ color: cfg.color }}>{remaining} {cfg.unit}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--th-text-secondary)' }}>Daily Goal</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--th-text)' }}>{goal} {cfg.unit}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 flex items-center gap-1.5" style={{ color: statusColor }}>
              {isHigh ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
              <span className="text-xs font-bold">{pct}% <span className="font-medium" style={{ color: 'var(--th-text-secondary)' }}>of goal</span></span>
            </div>

          </motion.div>
        );
      })}
    </div>
  );
}
