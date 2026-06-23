import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Expand, ChevronDown, ArrowDown, ArrowUp, X, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const dateObj = new Date(payload[0]?.payload?.timestamp || label);
  return (
    <div className="rounded-xl px-4 py-3 text-xs shadow-xl" style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}>
      <p className="font-semibold mb-1" style={{ color: 'var(--th-text-secondary)' }}>{dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-lg font-bold" style={{ color: 'var(--th-text)' }}>
          {Number(p.value).toFixed(1)} <span className="text-[10px] font-medium opacity-70">kg</span>
        </p>
      ))}
    </div>
  );
}

export default function BodyWeightTrend({ data = [], range = '3M' }) {
  const [showModal, setShowModal] = useState(false);

  const rangeLabels = {
    '7D': '7 Days',
    '1M': '1 Month',
    '3M': '3 Months',
    '6M': '6 Months',
    '1Y': '1 Year',
    'ALL': 'All Time',
  };
  const rangeLabel = rangeLabels[range] || '3 Months';

  const rangeDays = { '7D': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 365, 'ALL': 3650 };
  const days = rangeDays[range] || 90;
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  let chartData = data.map(d => ({
    timestamp: new Date(d.date).getTime(),
    Weight: typeof d.weight === 'number' ? Number(d.weight.toFixed(1)) : d.weight,
  }));

  if (range !== 'ALL') {
    chartData = chartData.filter(d => d.timestamp >= startDate.getTime());
  }

  // Calculate footer stats BEFORE padding
  const firstEntry = chartData[0];
  const lastEntry = chartData[chartData.length - 1];
  const change = (lastEntry?.Weight || 0) - (firstEntry?.Weight || 0);
  const isBetter = change <= 0;

  // Extend line to today if they haven't logged today
  if (chartData.length > 0 && lastEntry) {
    if (new Date(lastEntry.timestamp).toDateString() !== now.toDateString()) {
      chartData.push({
        timestamp: now.getTime(),
        Weight: lastEntry.Weight
      });
    }
  }

  // Pad backwards to the exact start of the range to ensure full X-axis span
  if (chartData.length > 0 && range !== 'ALL') {
    if (chartData[0].timestamp > startDate.getTime()) {
      chartData.unshift({
        timestamp: startDate.getTime(),
        Weight: chartData[0].Weight
      });
    }
  }

  return (
    <div className="rounded-3xl p-6 h-full flex flex-col shadow-sm" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold" style={{ color: 'var(--th-text)' }}>Body Weight Trend</h3>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-80 dark:hover:bg-[var(--th-card)]/5" style={{ color: 'var(--th-text-secondary)', border: '1px solid var(--th-border)' }}>
            Weight (kg) <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1 text-[10px] font-semibold text-[var(--th-text-secondary)] hover:text-[var(--th-text)] transition">
            View History <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center"><p className="text-xs" style={{ color: 'var(--th-text-secondary)' }}>Log body metrics to see your trend</p></div>
      ) : (
        <>
          <div className="flex-1 min-h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--th-border)" opacity={0.5} />
                <XAxis 
                  dataKey="timestamp" 
                  type="number" 
                  scale="time"
                  domain={range !== 'ALL' ? [startDate.getTime(), now.getTime()] : ['auto', 'auto']}
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--th-text-dim)', fontSize: 10, fontWeight: 500 }} 
                  dy={10} 
                  minTickGap={30}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(val) => `${val.toFixed(1)} kg`}
                  tick={{ fill: 'var(--th-text-dim)', fontSize: 10, fontWeight: 500 }} 
                  domain={['dataMin - 2', 'dataMax + 2']} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#10B981', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="Weight" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" activeDot={{ r: 6, fill: '#10B981', stroke: 'var(--th-bg)', strokeWidth: 2 }} dot={{ r: 3, fill: '#10B981', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 mt-4" style={{ borderTop: '1px solid var(--th-border)' }}>
            <div className="text-center border-r" style={{ borderColor: 'var(--th-border)' }}>
              <p className="text-sm font-bold" style={{ color: 'var(--th-text)' }}>{firstEntry?.Weight?.toFixed(1)} <span className="text-[10px] font-medium opacity-60">kg</span></p>
              <p className="text-[10px] font-medium text-[var(--th-text-dim)] mt-0.5">{rangeLabel} Ago</p>
            </div>
            <div className="text-center border-r" style={{ borderColor: 'var(--th-border)' }}>
              <p className="text-sm font-bold" style={{ color: 'var(--th-text)' }}>{lastEntry?.Weight?.toFixed(1)} <span className="text-[10px] font-medium opacity-60">kg</span></p>
              <p className="text-[10px] font-medium text-[var(--th-text-dim)] mt-0.5">Current</p>
            </div>
            <div className="text-center">
              <p className={`text-sm font-bold flex items-center justify-center gap-0.5 ${isBetter ? 'text-emerald-500' : 'text-red-500'}`}>
                {isBetter ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />}
                {Math.abs(change).toFixed(1)} <span className="text-[10px] font-medium opacity-70">kg</span>
              </p>
              <p className="text-[10px] font-medium text-[var(--th-text-dim)] mt-0.5">Change</p>
            </div>
          </div>
        </>
      )}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-6 shadow-2xl" 
              style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--th-bg-secondary)' }}>
                    <Calendar className="w-5 h-5" style={{ color: 'var(--th-primary)' }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: 'var(--th-text)' }}>Historical Body Metrics</h2>
                    <p className="text-xs font-semibold" style={{ color: 'var(--th-text-secondary)' }}>Log of Weight, Body Fat, and Muscle Mass</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg transition" style={{ hover: 'var(--th-highlight)' }}>
                  <X className="w-5 h-5" style={{ color: 'var(--th-text-secondary)' }} />
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--th-border)' }}>
                <table className="w-full text-left text-sm">
                  <thead style={{ background: 'var(--th-bg-secondary)', color: 'var(--th-text-secondary)' }}>
                    <tr>
                      <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Weight</th>
                      <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Body Fat</th>
                      <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Muscle Mass</th>
                      <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider w-1/3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ divideColor: 'var(--th-border)' }}>
                    {[...data].reverse().map((m, idx) => (
                      <tr key={idx} className="transition-colors hover:opacity-80 dark:hover:bg-[var(--th-card)]/5">
                        <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: 'var(--th-text)' }}>
                          {new Date(m.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: 'var(--th-text)' }}>
                          {m.weight ? `${m.weight.toFixed(1)} kg` : '-'}
                        </td>
                        <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: 'var(--th-text)' }}>
                          {m.bodyFat ? `${m.bodyFat.toFixed(1)} %` : '-'}
                        </td>
                        <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: 'var(--th-text)' }}>
                          {m.muscleMass ? `${m.muscleMass.toFixed(1)} kg` : '-'}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--th-text-secondary)' }}>
                          {m.notes ? m.notes : '-'}
                        </td>
                      </tr>
                    ))}
                    {data.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-xs" style={{ color: 'var(--th-text-secondary)' }}>No metrics recorded yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
