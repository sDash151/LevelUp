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

  const modules = data.map(item => ({
    ...item,
    ...config[item.id] || config.habits,
    data: Array.from({ length: 10 }, () => ({ value: Math.random() * 100 })),
    trend: item.change,
    title: item.name
  }));

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold" style={{ color: 'var(--th-text)' }}>Cross-Module Performance</h2>
        <div className="shadow-sm rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-medium cursor-pointer transition-colors hover:opacity-80" style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)', color: 'var(--th-text-secondary)' }}>
          This Month ▾
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.id} className="shadow-sm p-5 rounded-2xl flex flex-col hover:shadow-md transition-shadow" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
              <div className="flex items-center gap-2 mb-3 font-medium text-sm" style={{ color: 'var(--th-text-secondary)' }}>
                <Icon size={16} className={m.color} />
                {m.title}
              </div>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-extrabold" style={{ color: 'var(--th-text)' }}>{Math.round(m.score)}</span>
                <span className="text-sm font-medium" style={{ color: 'var(--th-text-muted)' }}>%</span>
              </div>
              <div className="text-xs font-medium mb-3" style={{ color: 'var(--th-text-muted)' }}>{m.label}</div>

              <div className={`text-xs font-semibold flex items-center gap-1 mb-4 ${m.trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {m.trend > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {Math.abs(m.trend)}%
              </div>

              <div className="h-10 w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={m.data}>
                    <defs>
                      <linearGradient id={`grad-${m.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={m.stroke} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={m.stroke} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke={m.stroke} strokeWidth={2} fillOpacity={1} fill={`url(#grad-${m.id})`} />
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
