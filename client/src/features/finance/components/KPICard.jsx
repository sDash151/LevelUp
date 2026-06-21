import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, formatPercent, getChangeColor } from '../utils';

/**
 * Reusable KPI Card matching the design: icon, label, value, change indicator, sparkline.
 */
export default function KPICard({ icon, label, value, subtext, change, sparkData, color = '#6366F1', currency, index = 0 }) {
  const changeColor = getChangeColor(change);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl p-4 flex flex-col justify-between min-h-[120px]"
      style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}
    >
      {/* Top row: icon + label */}
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-base">{icon}</span>}
        <span className="text-xs font-medium truncate" style={{ color: 'var(--th-text-secondary)' }}>{label}</span>
      </div>

      {/* Value */}
      <div className="mb-1">
        <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--th-text)' }}>
          {typeof value === 'number' ? formatCurrency(value, currency, true) : value}
        </span>
        {subtext && (
          <span className="text-xs ml-1.5" style={{ color: 'var(--th-text-secondary)' }}>{subtext}</span>
        )}
      </div>

      {/* Change indicator */}
      {change !== undefined && change !== null && (
        <div className="flex items-center gap-1 text-xs font-medium" style={{ color: changeColor }}>
          {change > 0 ? <TrendingUp className="w-3 h-3" /> : change < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          <span>{formatPercent(change)} vs last month</span>
        </div>
      )}

      {/* Sparkline */}
      {sparkData && sparkData.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-10 opacity-20">
          <svg viewBox={`0 0 ${sparkData.length * 20} 40`} className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`spark-${label?.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={sparkData.map((v, i) => {
                const x = (i / (sparkData.length - 1)) * sparkData.length * 20;
                const max = Math.max(...sparkData);
                const min = Math.min(...sparkData);
                const range = max - min || 1;
                const y = 40 - ((v - min) / range) * 36;
                return `${i === 0 ? 'M' : 'L'}${x},${y}`;
              }).join(' ')}
              fill="none" stroke={color} strokeWidth="2"
            />
            <path
              d={[
                ...sparkData.map((v, i) => {
                  const x = (i / (sparkData.length - 1)) * sparkData.length * 20;
                  const max = Math.max(...sparkData);
                  const min = Math.min(...sparkData);
                  const range = max - min || 1;
                  const y = 40 - ((v - min) / range) * 36;
                  return `${i === 0 ? 'M' : 'L'}${x},${y}`;
                }),
                `L${sparkData.length * 20},40 L0,40 Z`
              ].join(' ')}
              fill={`url(#spark-${label?.replace(/\s/g, '')})`}
            />
          </svg>
        </div>
      )}
    </motion.div>
  );
}
