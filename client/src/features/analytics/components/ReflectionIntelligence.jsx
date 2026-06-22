import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis } from 'recharts';
import { CheckCircle, Smile, Flame, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ReflectionIntelligence({ data }) {
  const navigate = useNavigate();
  const { reflections = {}, predictions = [] } = data || {};
  const stats = reflections.stats || {};
  const moodHistory = reflections.moodTrend || [];

  const moodData = moodHistory.map((m, i) => ({
    name: i.toString(),
    value: m.mood // using the 'mood' property returned from the backend
  }));

  if (moodData.length === 0) {
    // Mock data for UI if missing
    for (let i = 0; i < 30; i++) {
      moodData.push({ name: String(i), value: Math.random() * 5 + 5 });
    }
  }

  const statCards = [
    { label: 'Productive Days', value: `${stats.productiveDays || 0} days`, icon: CheckCircle, color: 'text-emerald-500' },
    { label: 'Average Mood', value: stats.averageMood || 'Neutral', icon: Smile, color: 'text-amber-500' },
    { label: 'Burnout Days', value: `${stats.burnoutDays || 0} days`, icon: Flame, color: 'text-rose-500' },
    { label: 'Low Focus Days', value: `${stats.lowFocusDays || 0} days`, icon: Target, color: 'text-blue-500' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Reflection Intelligence */}
      <div className="shadow-sm p-6 rounded-3xl flex flex-col" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--th-text)' }}>Reflection Intelligence</h2>
          <div className="shadow-sm rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-medium cursor-pointer transition-colors hover:opacity-80" style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)', color: 'var(--th-text-secondary)' }}>
            This Month ▾
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Chart Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            <div className="border rounded-2xl p-4 flex flex-col" style={{ background: 'var(--th-card)', borderColor: '#3b82f640' }}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--th-text)' }}>Mood Trend</h3>
              <div className="flex-1 min-h-[140px] w-full flex relative">
                <div className="flex flex-col justify-between items-center w-8 text-lg border-r border-blue-200/50 pr-2">
                  <span>🤩</span>
                  <span>😐</span>
                  <span>😫</span>
                </div>
                <div className="flex-1 h-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={moodData} margin={{ top: 10, right: 0, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="moodColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                      <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#moodColor)" dot={{r: 3, fill: '#3b82f6', strokeWidth: 0}} activeDot={{r: 5, fill: '#2563eb'}} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Stats Pills */}
            <div className="flex flex-col gap-3 justify-center">
              {statCards.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl border shadow-sm" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}>
                    <div className="flex items-center gap-2">
                      <Icon size={16} className={stat.color} />
                      <span className="text-xs font-medium" style={{ color: 'var(--th-text-secondary)' }}>{stat.label}</span>
                    </div>
                    <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-auto text-center">
          <button 
            onClick={() => navigate('/reflections')}
            className="text-amber-500 hover:text-amber-600 text-sm font-semibold transition-colors"
          >
            View All Reflections
          </button>
        </div>
      </div>

      {/* Prediction Engine */}
      <div className="shadow-sm p-6 rounded-3xl flex flex-col" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--th-text)' }}>Prediction Engine</h2>
          <div className="shadow-sm rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-medium cursor-pointer transition-colors hover:opacity-80" style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)', color: 'var(--th-text-secondary)' }}>
            At current pace
          </div>
        </div>

        <div className="flex flex-col gap-5 flex-1 justify-center mb-6">
          {predictions.map((pred, idx) => {
            const icons = ['💰', '💻', '💪', '💼', '📚'];
            const icon = icons[idx % icons.length];
            
            return (
              <div key={idx} className="group cursor-pointer">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-semibold flex items-center gap-2 group-hover:text-amber-600 transition-colors" style={{ color: 'var(--th-text)' }}>
                    <span>{icon}</span> {pred.title}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--th-text-secondary)' }}>
                    {pred.targetDays ? `Target in ${pred.targetDays} days` : pred.targetText || 'In Progress'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-full rounded-full overflow-hidden flex-1" style={{ background: 'var(--th-bg-secondary)' }}>
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                      style={{ width: `${pred.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold w-8 text-right" style={{ color: 'var(--th-text)' }}>{pred.progress}%</span>
                </div>
                
                {pred.explanation && (
                  <div className="hidden group-hover:block mt-2 p-2 rounded border text-xs" style={{ background: 'var(--th-card-solid)', borderColor: 'var(--th-border)', color: 'var(--th-text-secondary)' }}>
                    <p>{pred.explanation}</p>
                    {pred.tip && <p className="text-amber-600 mt-1 italic">Tip: {pred.tip}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-auto text-center">
          <button 
            onClick={() => navigate('/insights')}
            className="w-full py-3 text-amber-500 hover:text-amber-600 font-semibold text-sm transition-colors rounded-xl hover:bg-amber-50"
          >
            View All Predictions
          </button>
        </div>
      </div>
    </div>
  );
}
