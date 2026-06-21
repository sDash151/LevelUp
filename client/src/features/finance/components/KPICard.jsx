import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, formatPercent, getChangeColor } from '../utils';

/**
 * Reusable KPI Card matching the design exactly:
 * Top: Icon + Label
 * Middle: Large Value + Subtext
 * Bottom: Change indicator + clear sparkline line
 */
export default function KPICard({ icon, label, value, subtext, change, statusLabel, statusColor, sparkData, color = '#6366F1', currency, index = 0 }) {
  const changeColor = getChangeColor(change);
  
  // Provide mock sparkline if not provided but we want the aesthetic
  const defaultSpark = [40, 55, 45, 70, 60, 85, 90];
  const data = sparkData || (change !== undefined && change !== null ? defaultSpark : statusLabel ? defaultSpark : null);

  const gradientId = `sparkline-gradient-${index}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="relative overflow-hidden rounded-[16px] p-6 pb-12 flex flex-col bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] min-h-[160px]"
      style={{ border: '1px solid #F3F4F6' }}
    >
      {/* Top row: icon + label */}
      <div className="flex items-center gap-2.5">
        {icon && (
          <span className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[13px] flex-shrink-0" style={{ background: `${color}15`, color }}>
            {icon}
          </span>
        )}
        <span className="text-[11px] font-bold text-gray-700 leading-tight">{label}</span>
      </div>

      {/* Middle Content: Value + Change grouped together */}
      <div className="mt-5 relative z-10 flex-1 flex flex-col">
        <div>
          <span className="text-[20px] font-bold tracking-tight text-gray-900 leading-none block whitespace-nowrap overflow-hidden text-ellipsis">
            {typeof value === 'number' ? formatCurrency(value, currency, false) : value}
          </span>
          {subtext && (
            <span className="text-[11px] font-medium text-gray-400 block mt-1">{subtext}</span>
          )}
        </div>

        {/* Change or Status indicator right below */}
        <div className="mt-1.5 flex items-center gap-1.5">
          {change !== undefined && change !== null ? (
            <>
              <span className="text-[11px] font-bold" style={{ color: changeColor }}>
                {change > 0 ? '↑' : change < 0 ? '↓' : ''} {formatPercent(Math.abs(change))}
              </span>
              <span className="text-[10px] font-medium text-gray-400">vs last month</span>
            </>
          ) : statusLabel ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor || color }} />
              <span className="text-[11px] font-bold" style={{ color: statusColor || color }}>{statusLabel}</span>
            </>
          ) : null}
        </div>
      </div>

      {/* Full-width Sparkline */}
      {data && data.length > 1 && (
        <div className="absolute bottom-0 left-0 w-full h-[60px] pointer-events-none">
          <svg viewBox={`0 0 ${data.length * 10} 30`} className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={changeColor || color} stopOpacity="0.2" />
                <stop offset="100%" stopColor={changeColor || color} stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Gradient Fill */}
            <path
              d={`M0,30 ${data.map((v, i) => {
                const x = (i / (data.length - 1)) * data.length * 10;
                const max = Math.max(...data);
                const min = Math.min(...data);
                const range = max - min || 1;
                const y = 30 - ((v - min) / range) * 20 - 5;
                return `L${x},${y}`;
              }).join(' ')} L${data.length * 10},30 Z`}
              fill={`url(#${gradientId})`}
            />
            {/* Line */}
            <path
              d={data.map((v, i) => {
                const x = (i / (data.length - 1)) * data.length * 10;
                const max = Math.max(...data);
                const min = Math.min(...data);
                const range = max - min || 1;
                const y = 30 - ((v - min) / range) * 20 - 5;
                return `${i === 0 ? 'M' : 'L'}${x},${y}`;
              }).join(' ')}
              fill="none" stroke={changeColor || color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            />
            {/* Dots */}
            {data.map((v, i) => {
                const x = (i / (data.length - 1)) * data.length * 10;
                const max = Math.max(...data);
                const min = Math.min(...data);
                const range = max - min || 1;
                const y = 30 - ((v - min) / range) * 20 - 5;
                return <circle key={i} cx={x} cy={y} r="1.5" fill={changeColor || color} />;
            })}
          </svg>
        </div>
      )}
    </motion.div>
  );
}
