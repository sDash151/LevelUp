import React from 'react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { TrendingUp, CheckCircle, Zap, Shield, Target } from 'lucide-react';

export default function HeroMetrics({ data }) {
  // Use generic upward mock data for sparklines to simulate history since hero stats might not have an array 
  const sparklineMock = [
    { value: 20 }, { value: 35 }, { value: 25 }, { value: 45 }, { value: 30 }, { value: 60 }, { value: 50 }, { value: 80 }
  ];

  const momentumMock = [
    { value: 30 }, { value: 40 }, { value: 35 }, { value: 50 }, { value: 65 }, { value: 60 }, { value: 80 }, { value: 90 }, { value: 100 }
  ];

  const metrics = [
    {
      id: 'lifeScore',
      title: 'Life Score',
      value: `${Math.round(data?.lifeScore || 0)}`,
      suffix: '/100',
      label: data?.label || 'Calculating...',
      icon: Target,
      color: 'text-emerald-400',
      dot: 'bg-emerald-400',
      border: 'border-emerald-400/50',
      chartType: 'area',
      stroke: '#34d399',
      data: sparklineMock
    },
    {
      id: 'growth',
      title: 'Growth Velocity',
      value: `${data?.growthVelocity > 0 ? '+' : ''}${Math.round(data?.growthVelocity || 0)}%`,
      label: 'vs last month',
      icon: TrendingUp,
      color: 'text-purple-400',
      dot: 'bg-purple-400',
      border: 'border-purple-400/50',
      chartType: 'area',
      stroke: '#c084fc',
      data: sparklineMock
    },
    {
      id: 'consistency',
      title: 'Consistency Index',
      value: `${Math.round(data?.consistencyIndex || 0)}%`,
      label: 'Keep it up!',
      icon: CheckCircle,
      color: 'text-amber-400',
      dot: 'bg-amber-400',
      border: 'border-amber-400/50',
      chartType: 'area',
      stroke: '#fbbf24',
      data: sparklineMock
    },
    {
      id: 'upgrade',
      title: 'Upgrade Score',
      value: `${data?.upgradeScore || 0}`,
      suffix: '/1000 XP',
      label: 'Advanced',
      icon: Shield,
      color: 'text-blue-400',
      dot: 'bg-blue-400',
      border: 'border-blue-400/50',
      chartType: 'area',
      stroke: '#60a5fa',
      data: sparklineMock
    },
    {
      id: 'momentum',
      title: 'Momentum',
      value: data?.momentum?.state || 'Stable',
      label: data?.momentum?.state === 'Rising' ? 'Upward Trend' : data?.momentum?.state === 'Falling' ? 'Downward Trend' : 'Steady',
      icon: Zap,
      color: 'text-rose-400',
      dot: 'bg-rose-400',
      border: 'border-rose-400/50',
      chartType: 'bar',
      stroke: '#fb7185',
      data: momentumMock
    }
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 mb-4 scrollbar-hide">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div key={m.id} className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 flex flex-col relative overflow-hidden min-w-[200px] flex-1 hover:bg-slate-800/40 transition-colors">
            {/* Top Border Accent */}
            <div className={`absolute top-0 left-0 right-0 h-1 border-t ${m.border}`} />
            
            <div className="flex items-center gap-2 mb-3">
              <Icon size={16} className={m.color} />
              <span className="font-semibold text-slate-200 text-sm whitespace-nowrap">{m.title}</span>
            </div>

            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-bold text-white">{m.value}</span>
              {m.suffix && <span className="text-sm font-medium text-slate-400">{m.suffix}</span>}
            </div>

            <div className="flex items-center gap-2 mb-4 text-xs font-medium text-slate-400">
              <div className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
              {m.label}
            </div>

            <div className="h-12 w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                {m.chartType === 'area' ? (
                  <AreaChart data={m.data}>
                    <defs>
                      <linearGradient id={`grad-${m.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={m.stroke} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={m.stroke} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke={m.stroke} fill={`url(#grad-${m.id})`} strokeWidth={2} isAnimationActive={false} />
                  </AreaChart>
                ) : (
                  <BarChart data={m.data}>
                    <Bar dataKey="value" fill={m.stroke} radius={[2, 2, 0, 0]} fillOpacity={0.6} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
}
