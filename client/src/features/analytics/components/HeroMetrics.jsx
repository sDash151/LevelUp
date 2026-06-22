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
          <div key={m.id} className="shadow-sm p-4 flex flex-col justify-between rounded-2xl min-h-[140px] min-w-[180px] flex-1 hover:shadow-md transition-shadow" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5 font-medium text-xs" style={{ color: 'var(--th-text-secondary)' }}>
                <Icon size={14} style={{ color: m.color }} />
                {m.title}
              </div>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-extrabold" style={{ color: 'var(--th-text)' }}>{m.value}</span>
                {m.suffix && <span className="text-sm font-medium opacity-50" style={{ color: 'var(--th-text)' }}>{m.suffix}</span>}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: m.color }}>
                <div className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
                {m.label}
              </div>
            </div>

            <div className="h-8 w-full mt-3">
              <ResponsiveContainer width="100%" height="100%">
                {m.chartType === 'area' ? (
                  <AreaChart data={m.data}>
                    <defs>
                      <linearGradient id={`grad-${m.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={m.stroke} stopOpacity={0.2} />
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
