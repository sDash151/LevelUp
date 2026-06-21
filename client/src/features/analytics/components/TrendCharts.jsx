import React from 'react';
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function TrendCharts({ trends }) {
  const { weekly = [], monthly = [] } = trends || {};

  // Format weekly data for chart
  const weeklyData = weekly.map(s => {
    const d = new Date(s.snapshotDate);
    return {
      name: `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`,
      'XP Earned': s.xpEarned,
      'Tasks Completed': s.tasksCompleted,
      'Consistency %': s.consistencyIndex
    };
  });

  // Format monthly data for chart
  const monthlyData = monthly.map((s, idx) => {
    // Show label every ~7 days to match design
    const d = new Date(s.snapshotDate);
    const showLabel = idx % 7 === 0 || idx === monthly.length - 1;
    return {
      name: showLabel ? `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}` : '',
      'Life Score': s.lifeScore,
      'Wealth Growth': s.moneyScore,
      'Fitness Progress': s.bodyScore,
      'DSA Progress': s.mindScore // approximating DSA with mindScore for now
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-slate-300 font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-400">{entry.name}:</span>
              <span className="text-white font-semibold">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Weekly Performance Trend */}
      <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 flex flex-col">
        <h2 className="text-xl font-bold text-white mb-6">Weekly Performance Trend</h2>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorConsistency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
              <Area type="monotone" dataKey="XP Earned" stroke="#fbbf24" fillOpacity={1} fill="url(#colorXp)" strokeWidth={2} />
              <Area type="monotone" dataKey="Tasks Completed" stroke="#34d399" fillOpacity={1} fill="url(#colorTasks)" strokeWidth={2} />
              <Area type="monotone" dataKey="Consistency %" stroke="#a78bfa" fillOpacity={1} fill="url(#colorConsistency)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Growth Trend */}
      <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 flex flex-col">
        <h2 className="text-xl font-bold text-white mb-6">Monthly Growth Trend</h2>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
              <Line type="monotone" dataKey="Life Score" stroke="#fbbf24" strokeWidth={2} dot={{r: 3, fill: '#fbbf24'}} activeDot={{r: 6}} />
              <Line type="monotone" dataKey="Wealth Growth" stroke="#34d399" strokeWidth={2} dot={{r: 3, fill: '#34d399'}} activeDot={{r: 6}} />
              <Line type="monotone" dataKey="Fitness Progress" stroke="#fb7185" strokeWidth={2} dot={{r: 3, fill: '#fb7185'}} activeDot={{r: 6}} />
              <Line type="monotone" dataKey="DSA Progress" stroke="#a78bfa" strokeWidth={2} dot={{r: 3, fill: '#a78bfa'}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
