import { Flame, Calendar, Dumbbell, Zap, Timer } from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

// Specific jagged data to match the UI precisely
const sparklines = {
  volume: [ {val: 30}, {val: 20}, {val: 35}, {val: 18}, {val: 60}, {val: 70}, {val: 85} ],
  calories: [ {val: 20}, {val: 45}, {val: 65}, {val: 70}, {val: 45}, {val: 35}, {val: 80} ],
  active: [ {val: 20}, {val: 50}, {val: 40}, {val: 38}, {val: 70}, {val: 40}, {val: 65} ]
};

function Sparkline({ data, color }) {
  const id = color.replace('#', '');
  return (
    <div className="h-10 w-full mt-2 -mb-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`fade-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide />
          <Area 
            type="monotone" 
            dataKey="val" 
            stroke={color} 
            strokeWidth={2} 
            fillOpacity={1} 
            fill={`url(#fade-${id})`}
            dot={{ r: 2.5, fill: color, strokeWidth: 0, stroke: 'white' }} 
            activeDot={{ r: 4, strokeWidth: 0 }} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function FitnessKpiCards({ overview }) {
  const streak = overview?.streak?.current || 0;
  const bestStreak = overview?.streak?.best || 0;
  const targetSessions = overview?.thisWeek?.target || 5;
  const completedSessions = overview?.thisWeek?.completed || 0;
  const sessionPct = targetSessions > 0 ? Math.round((completedSessions / targetSessions) * 100) : 0;
  
  const vol = overview?.totalVolume?.value || 0;
  const volChange = overview?.totalVolume?.changeVsLastWeek || 0;
  
  const cal = overview?.caloriesBurned?.value || 0;
  const calChange = overview?.caloriesBurned?.changePercent || 0;
  
  const active = overview?.activeMinutes?.value || 0;
  const activeChange = overview?.activeMinutes?.changePercent || 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {/* 1. Workout Streak */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
        className="rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between"
        style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded bg-orange-500/10 flex items-center justify-center">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <span className="text-[11px] font-semibold" style={{ color: 'var(--th-text-secondary)' }}>Workout Streak</span>
        </div>
        <div className="flex items-baseline gap-1.5 mt-1 relative z-10">
          <span className="text-3xl font-extrabold" style={{ color: 'var(--th-text)' }}>{streak}</span>
          <span className="text-xs font-semibold" style={{ color: 'var(--th-text-secondary)' }}>days</span>
        </div>
        <p className="text-[10px] mt-1 font-semibold text-amber-600">Best: {bestStreak} days 🏆</p>
        <p className="text-[9px] mt-1 text-gray-400 leading-tight pr-6 relative z-10">
          {bestStreak > streak ? `${bestStreak - streak} days away from your best streak` : 'You are on your best streak!'}
        </p>
        <div className="absolute right-0 bottom-0 text-[60px] opacity-20 -mr-2 -mb-2 z-0 filter drop-shadow-md">
          🔥
        </div>
      </motion.div>

      {/* 2. This Week */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between"
        style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <span className="text-[11px] font-semibold" style={{ color: 'var(--th-text-secondary)' }}>This Week</span>
        </div>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-3xl font-extrabold" style={{ color: 'var(--th-text)' }}>{completedSessions}</span>
          <span className="text-lg font-bold text-gray-400">/ {targetSessions}</span>
        </div>
        <p className="text-[10px] mt-1 text-gray-500 font-medium">Sessions</p>
        <div className="mt-4">
          <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mb-1.5">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, sessionPct)}%` }} />
          </div>
          <p className="text-[9px] text-gray-500">{sessionPct}% of weekly target</p>
        </div>
      </motion.div>

      {/* 3. Total Volume */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between"
        style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded bg-indigo-500/10 flex items-center justify-center">
            <Dumbbell className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <span className="text-[11px] font-semibold" style={{ color: 'var(--th-text-secondary)' }}>Total Volume</span>
        </div>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-extrabold" style={{ color: 'var(--th-text)' }}>{vol.toLocaleString()}</span>
          <span className="text-[10px] font-semibold text-gray-400">kg</span>
        </div>
        <Sparkline data={sparklines.volume} color="#8B5CF6" />
        <p className="text-[10px] mt-2 font-semibold text-emerald-500">
          ↑ {volChange >= 0 ? '+' : ''}{volChange}% <span className="text-gray-400 font-medium">vs last week</span>
        </p>
      </motion.div>

      {/* 4. Calories Burned */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between"
        style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded bg-rose-500/10 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <span className="text-[11px] font-semibold" style={{ color: 'var(--th-text-secondary)' }}>Calories Burned</span>
        </div>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-extrabold" style={{ color: 'var(--th-text)' }}>{cal.toLocaleString()}</span>
          <span className="text-[10px] font-semibold text-gray-400">kcal</span>
        </div>
        <Sparkline data={sparklines.calories} color="#EF4444" />
        <p className="text-[10px] mt-2 font-semibold text-emerald-500">
          ↑ {calChange >= 0 ? '+' : ''}{calChange}% <span className="text-gray-400 font-medium">vs last week</span>
        </p>
      </motion.div>

      {/* 5. Active Minutes */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between"
        style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded bg-amber-500/10 flex items-center justify-center">
            <Timer className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <span className="text-[11px] font-semibold" style={{ color: 'var(--th-text-secondary)' }}>Active Minutes</span>
        </div>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-extrabold" style={{ color: 'var(--th-text)' }}>{active.toLocaleString()}</span>
          <span className="text-[10px] font-semibold text-gray-400">mins</span>
        </div>
        <Sparkline data={sparklines.active} color="#F59E0B" />
        <p className="text-[10px] mt-2 font-semibold text-emerald-500">
          ↑ {activeChange >= 0 ? '+' : ''}{activeChange}% <span className="text-gray-400 font-medium">vs last week</span>
        </p>
      </motion.div>
    </div>
  );
}
