import { Dumbbell, Clock, Flame, Briefcase, Trophy, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

const Sparkline = ({ data, color }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data) || 1;
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const h = 30;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((d - min) / range) * h * 0.8 - h * 0.1;
    return `${x},${y}`;
  });

  const pathD = `M 0,${h} L 0,${points[0].split(',')[1]} L ${points.join(' L ')} L ${w},${points[points.length-1].split(',')[1]} L ${w},${h} Z`;

  return (
    <svg width="100%" height="40" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="overflow-visible mt-2">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={pathD} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <circle key={i} cx={(i / (data.length - 1)) * w} cy={h - ((d - min) / range) * h * 0.8 - h * 0.1} r="1.5" fill="var(--th-bg)" stroke={color} strokeWidth="1" />
      ))}
    </svg>
  );
};

export default function WorkoutKpiCards({ stats = {}, loading }) {
  const t = stats.trends || {};
  
  const cards = [
    { label: 'Total Workouts', value: stats.totalWorkouts || 0, icon: Dumbbell, color: '#8B5CF6', trend: t.workouts || [0,0,0,0,0,0], sub: `${stats.thisMonth?.workouts || 0} this month` },
    { label: 'Total Duration', value: `${Math.floor((stats.totalDuration || 0) / 60)}h ${(stats.totalDuration || 0) % 60}m`, icon: Clock, color: '#10B981', trend: t.duration || [0,0,0,0,0,0], sub: `+${stats.thisMonth?.duration || 0} mins this month` },
    { label: 'Total Calories', value: (stats.totalCalories || 0).toLocaleString() + ' kcal', icon: Flame, color: '#F97316', trend: t.calories || [0,0,0,0,0,0], sub: `+${(stats.thisMonth?.calories || 0).toLocaleString()} kcal this month` },
    { label: 'Total Volume', value: `${((stats.totalVolume || 0) / 1000).toFixed(1)}k kg`, icon: Briefcase, color: '#EF4444', trend: t.volume || [0,0,0,0,0,0], sub: `+${(stats.thisMonth?.volume || 0).toLocaleString()} kg this month` },
    { label: 'PRs Achieved', value: stats.prsAchieved || 0, icon: Trophy, color: '#EAB308', trend: t.prs || [0,0,0,0,0,0], sub: `+${stats.thisMonth?.prs || 0} this month` },
  ];

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-pulse">
      {[1,2,3,4,5].map(i => <div key={i} className="h-32 rounded-2xl bg-[var(--th-card)] shadow-sm border border-[var(--th-border)]" />)}
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl overflow-hidden bg-[var(--th-card)] shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[var(--th-border)] pt-5 pb-0 flex flex-col justify-between">
            <div className="px-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${card.color}15` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: card.color }} />
                </div>
                <span className="text-[11px] font-bold text-[var(--th-text-secondary)]">{card.label}</span>
              </div>
              <p className="text-[22px] font-black tracking-tight text-[var(--th-text)] leading-none">{card.value}</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-[10px] font-semibold text-[var(--th-text-dim)]">All time</span>
              </div>
              <p className="text-[9px] font-bold mt-1" style={{ color: card.color }}>{card.sub}</p>
            </div>
            <div className="mt-auto px-2">
              <Sparkline data={card.trend} color={card.color} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
