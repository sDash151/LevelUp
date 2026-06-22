import React from 'react';
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function TrendCharts({ trends }) {
  const { weekly = [], monthly = [] } = trends || {};

  // Format weekly data for chart
  let weeklyData = weekly.map(s => {
    const d = new Date(s.snapshotDate);
    return {
      name: `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`,
      'XP Earned': s.xpEarned,
      'Tasks Completed': s.tasksCompleted,
      'Consistency %': s.consistencyIndex
    };
  });

  // Fix single data point issue by prepending a "yesterday" zero-state
  if (weeklyData.length === 1 && weekly[0]) {
    const d = new Date(weekly[0].snapshotDate);
    d.setDate(d.getDate() - 1);
    weeklyData.unshift({
      name: `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`,
      'XP Earned': 0,
      'Tasks Completed': 0,
      'Consistency %': 0
    });
  }

  // Format monthly data for chart
  let monthlyData = monthly.map((s, idx) => {
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

  if (monthlyData.length === 1 && monthly[0]) {
    const d = new Date(monthly[0].snapshotDate);
    d.setDate(d.getDate() - 1);
    monthlyData.unshift({
      name: `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`,
      'Life Score': 0,
      'Wealth Growth': 0,
      'Fitness Progress': 0,
      'DSA Progress': 0
    });
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-md border p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)]" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-3">{label}</p>
          <div className="flex flex-col gap-2.5">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                  <span className="font-medium" style={{ color: 'var(--th-text-secondary)' }}>{entry.name}</span>
                </div>
                <span className="font-bold" style={{ color: 'var(--th-text)' }}>{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Weekly Performance Trend */}
      <div className="shadow-sm p-6 rounded-3xl flex flex-col" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
        <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--th-text)' }}>Weekly Performance Trend</h2>
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
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="name" stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
              <Area type="monotone" dataKey="XP Earned" stroke="#fbbf24" fillOpacity={1} fill="url(#colorXp)" strokeWidth={3} />
              <Area type="monotone" dataKey="Tasks Completed" stroke="#34d399" fillOpacity={1} fill="url(#colorTasks)" strokeWidth={3} />
              <Area type="monotone" dataKey="Consistency %" stroke="#a78bfa" fillOpacity={1} fill="url(#colorConsistency)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Growth Trend */}
      <div className="shadow-sm p-6 rounded-3xl flex flex-col" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
        <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--th-text)' }}>Monthly Growth Trend</h2>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="name" stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f3f4f6', strokeWidth: 2, strokeDasharray: '5 5' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
              <Line type="monotone" dataKey="Life Score" stroke="#fbbf24" strokeWidth={3} dot={{r: 4, fill: '#fbbf24', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 7, strokeWidth: 0}} />
              <Line type="monotone" dataKey="Wealth Growth" stroke="#34d399" strokeWidth={3} dot={{r: 4, fill: '#34d399', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 7, strokeWidth: 0}} />
              <Line type="monotone" dataKey="Fitness Progress" stroke="#fb7185" strokeWidth={3} dot={{r: 4, fill: '#fb7185', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 7, strokeWidth: 0}} />
              <Line type="monotone" dataKey="DSA Progress" stroke="#a78bfa" strokeWidth={3} dot={{r: 4, fill: '#a78bfa', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 7, strokeWidth: 0}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
