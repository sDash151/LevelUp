import { TrendingUp, TrendingDown, Minus, Activity, Target, Dumbbell, Ruler, Flame } from 'lucide-react';
import { motion } from 'motion/react';

function TrendIndicator({ label, value, icon: Icon, unit = '', inverse = false }) {
  if (value === null || value === undefined) return null;

  const isPositive = value > 0;
  const isNeutral = value === 0;
  
  // For weight, waist, body fat, losing is usually "good" depending on goal, but let's just show raw color coding:
  // Inverse=true means negative is "green" (e.g., body fat lost)
  let color = 'text-gray-500';
  let bgColor = 'bg-gray-500/10';
  let TrendIcon = Minus;

  if (isPositive) {
    color = inverse ? 'text-red-500' : 'text-emerald-500';
    bgColor = inverse ? 'bg-red-500/10' : 'bg-emerald-500/10';
    TrendIcon = TrendingUp;
  } else if (!isNeutral) {
    color = inverse ? 'text-emerald-500' : 'text-red-500';
    bgColor = inverse ? 'bg-emerald-500/10' : 'bg-red-500/10';
    TrendIcon = TrendingDown;
  }

  return (
    <div className="flex items-center justify-between p-4 bg-[var(--th-bg)] border border-[var(--th-border)] rounded-2xl">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${bgColor} ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-medium text-[var(--th-text)]">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-bold ${color}`}>
          {isPositive ? '+' : ''}{value}{unit}
        </span>
        <TrendIcon className={`w-4 h-4 ${color}`} />
      </div>
    </div>
  );
}

export default function AdaptiveReview({ reviewData }) {
  if (!reviewData || !reviewData.trends) return null;

  const { trends } = reviewData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-[var(--th-text)]">
            <Activity className="w-5 h-5 text-[var(--th-primary)]" />
            14-Day Adaptive Review
          </h3>
          <p className="text-sm text-[var(--th-text-secondary)]">AI analysis of your recent progression</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Body Composition Delta */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--th-text-secondary)] ml-1">Body Composition Delta</h4>
          <TrendIndicator label="Body Weight" value={trends.weightDelta} icon={Target} unit="kg" inverse={true} />
          <TrendIndicator label="Body Fat" value={trends.bodyFatDelta} icon={Flame} unit="%" inverse={true} />
          <TrendIndicator label="Muscle Mass" value={trends.muscleMassDelta} icon={Activity} unit="kg" inverse={false} />
          <TrendIndicator label="Waist Size" value={trends.waistDelta} icon={Ruler} unit="in" inverse={true} />
        </motion.div>

        {/* Strength Delta */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--th-text-secondary)] ml-1">Strength Delta</h4>
          <TrendIndicator label="Total Volume" value={trends.volumeProgressionPercent} icon={Dumbbell} unit="%" inverse={false} />
          <TrendIndicator label="Top Lifts" value={trends.topLiftProgressionPercent} icon={Target} unit="%" inverse={false} />
          <TrendIndicator label="Total Reps" value={trends.repProgressionPercent} icon={Activity} unit="%" inverse={false} />
        </motion.div>
      </div>
    </div>
  );
}
