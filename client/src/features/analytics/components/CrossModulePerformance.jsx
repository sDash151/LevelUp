import React from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Target, Activity, DollarSign, Code, Briefcase, Brain, ArrowUp, ArrowDown } from 'lucide-react';

export default function CrossModulePerformance({ data = [] }) {
  // Mapping ids to icons and colors
  const config = {
    habits: { icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-400/10', stroke: '#34d399' },
    fitness: { icon: Activity, color: 'text-orange-400', bg: 'bg-orange-400/10', stroke: '#fb923c' },
    finance: { icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-400/10', stroke: '#fbbf24' },
    dsa: { icon: Code, color: 'text-purple-400', bg: 'bg-purple-400/10', stroke: '#c084fc' },
    career: { icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-400/10', stroke: '#60a5fa' },
    reflections: { icon: Brain, color: 'text-rose-400', bg: 'bg-rose-400/10', stroke: '#fb7185' }
  };

  // Mock sparkline data
  const sparklineData = Array.from({ length: 10 }, () => ({ value: Math.random() * 100 }));

  return (
    <div className="mb-8">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-xl font-bold text-white">Cross-Module Performance</h2>
        <div className="text-sm text-slate-400 bg-slate-800/50 px-3 py-1 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
          This Month ▾
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {data.map((item) => {
          const conf = config[item.id] || config.habits;
          const Icon = conf.icon;
          const isPositive = item.change >= 0;

          return (
            <div key={item.id} className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 flex flex-col hover:border-slate-600 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-lg ${conf.bg}`}>
                  <Icon size={16} className={conf.color} />
                </div>
                <span className="font-semibold text-slate-200">{item.name}</span>
              </div>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-white">{Math.round(item.score)}</span>
                <span className="text-lg text-slate-400">%</span>
              </div>
              <div className="text-sm text-slate-400 mb-3">{item.label}</div>

              <div className={`text-xs font-medium flex items-center gap-1 mb-3 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                {Math.abs(item.change)}%
              </div>

              <div className="h-10 mt-auto w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData}>
                    <defs>
                      <linearGradient id={`gradient-${item.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={conf.stroke} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={conf.stroke} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={conf.stroke} 
                      fill={`url(#gradient-${item.id})`} 
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
