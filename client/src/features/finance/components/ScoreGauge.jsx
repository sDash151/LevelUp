import { motion } from 'motion/react';
import { getScoreColor } from '../utils';

/**
 * Circular gauge for Freedom Score / Protection Score / Wealth Score / AI Confidence.
 * Matches the design: circular progress ring with score in center + label below.
 */
export default function ScoreGauge({ score = 0, label, maxScore = 100, size = 80, strokeWidth = 6 }) {
  const color = getScoreColor(score);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score / maxScore, 1);
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background ring */}
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#F3F4F6" strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-[24px] font-bold text-gray-900 leading-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-[10px] font-medium text-gray-400 leading-none mt-1">/{maxScore}</span>
        </div>
      </div>
      {label && (
        <span className="text-[11px] font-medium mt-1.5 flex items-center gap-1.5" style={{ color }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
          {label}
        </span>
      )}
    </div>
  );
}
