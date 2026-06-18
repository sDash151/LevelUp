import { motion } from 'motion/react';
import clsx from 'clsx';

export function ProgressRing({
  progress = 0,
  size = 120,
  strokeWidth = 8,
  label,
  sublabel,
  color = 'url(#progressGradient)',
  className,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <div className={clsx('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="stat-number text-2xl font-bold text-white">{label ?? `${Math.round(progress)}%`}</span>
        {sublabel && <span className="text-xs text-zinc-500 mt-0.5">{sublabel}</span>}
      </div>
    </div>
  );
}
