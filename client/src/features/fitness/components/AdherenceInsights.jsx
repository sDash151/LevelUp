import { motion } from 'motion/react';
import { Dumbbell, Apple, Moon, Droplets } from 'lucide-react';

function ProgressRing({ radius, stroke, progress, color, icon: Icon }) {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: radius * 2, height: radius * 2 }}>
      <svg height={radius * 2} width={radius * 2} className="-rotate-90 transform">
        <circle
          stroke="var(--th-border)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease 0s' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--th-text)]">
        <Icon className="w-4 h-4 mb-0.5 opacity-80" style={{ color }} />
        <span className="text-xs font-bold">{progress}%</span>
      </div>
    </div>
  );
}

export default function AdherenceInsights({ reviewData }) {
  if (!reviewData || !reviewData.adherence) return null;

  const current = reviewData.adherence;
  const history = reviewData.adherenceHistory || [];

  return (
    <div className="space-y-6">
      <div className="bg-[var(--th-card)] border border-[var(--th-border)] p-6 rounded-2xl">
        <h3 className="text-lg font-bold text-[var(--th-text)] mb-6">Current Week Adherence</h3>
        
        <div className="flex flex-wrap justify-around gap-4">
          <div className="flex flex-col items-center gap-2">
            <ProgressRing radius={40} stroke={6} progress={current.workoutScore} color="#6366f1" icon={Dumbbell} />
            <span className="text-xs font-medium text-[var(--th-text-secondary)]">Workout</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ProgressRing radius={40} stroke={6} progress={current.mealScore} color="#10b981" icon={Apple} />
            <span className="text-xs font-medium text-[var(--th-text-secondary)]">Nutrition</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ProgressRing radius={40} stroke={6} progress={current.sleepScore} color="#8b5cf6" icon={Moon} />
            <span className="text-xs font-medium text-[var(--th-text-secondary)]">Sleep</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ProgressRing radius={40} stroke={6} progress={current.hydrationScore} color="#3b82f6" icon={Droplets} />
            <span className="text-xs font-medium text-[var(--th-text-secondary)]">Hydration</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--th-border)] flex items-center justify-between">
          <span className="text-sm font-bold text-[var(--th-text)]">Total Consistency Score</span>
          <span className={`text-lg font-black ${current.totalScore >= 80 ? 'text-emerald-500' : current.totalScore >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
            {current.totalScore}/100
          </span>
        </div>
      </div>

    </div>
  );
}
