import { useState } from 'react';
import { Info, ArrowUp, ArrowDown, X, Calendar } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

const MeasurementSparkline = ({ data, dataKey, color }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-[40px] h-[15px] ml-4 flex items-center justify-center">
        <div className="w-full h-[1px] bg-[var(--th-bg-secondary)] dark:bg-[var(--th-bg-secondary)]" />
      </div>
    );
  }

  // If only 1 data point, duplicate it so Recharts can draw a flat line
  const chartData = data.length === 1 ? [data[0], data[0]] : data;

  // Find min and max for the domain to make the sparkline dynamic
  const values = chartData.map(d => d[dataKey]).filter(v => typeof v === 'number');
  if (values.length === 0) return <div className="w-[40px] h-[15px] ml-4" />;
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.1 || 1;

  return (
    <div className="w-[40px] h-[20px] ml-4 opacity-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <YAxis domain={[min - padding, max + padding]} hide />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={1.5} 
            dot={false} 
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function BodyMeasurementsCard({ data, range = '3M' }) {
  const [showModal, setShowModal] = useState(false);
  
  const rangeLabels = {
    '7D': 'Last 7 Days',
    '1M': 'This Month',
    '3M': 'Last 3 Months',
    '6M': 'Last 6 Months',
    '1Y': 'This Year',
    'ALL': 'All Time',
  };
  const rangeLabel = rangeLabels[range] || 'This Month';

  if (!data?.current) return (
    <div className="rounded-3xl p-6 h-full shadow-sm flex flex-col" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-bold" style={{ color: 'var(--th-text)' }}>Body Measurements</h3>
          <Info className="w-3.5 h-3.5 text-[var(--th-text-dim)]" />
        </div>
        <span className="text-[10px] font-semibold text-[var(--th-text-secondary)]">{rangeLabel}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-xs" style={{ color: 'var(--th-text-secondary)' }}>Log measurements to track your progress</p>
      </div>
    </div>
  );

  const formatVal = (val) => typeof val === 'number' ? Number(val.toFixed(1)) : val;

  const measurements = [
    { label: 'Chest', key: 'chest', value: formatVal(data.current.chest), change: formatVal(data.changes?.chest), unit: 'cm', color: '#3B82F6', bgColor: '#3B82F615' },
    { label: 'Waist', key: 'waist', value: formatVal(data.current.waist), change: formatVal(data.changes?.waist), unit: 'cm', color: '#10B981', bgColor: '#10B98115' },
    { label: 'Arms', key: 'arms', value: formatVal(data.current.arms), change: formatVal(data.changes?.arms), unit: 'cm', color: '#8B5CF6', bgColor: '#8B5CF615' },
    { label: 'Thighs', key: 'thighs', value: formatVal(data.current.thighs), change: formatVal(data.changes?.thighs), unit: 'cm', color: '#F97316', bgColor: '#F9731615' },
  ];

  return (
    <>
      <div className="rounded-3xl p-6 h-full shadow-sm flex flex-col" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold" style={{ color: 'var(--th-text)' }}>Body Measurements</h3>
            <Info className="w-3.5 h-3.5 text-[var(--th-text-dim)]" />
          </div>
          <span className="text-[10px] font-semibold text-[var(--th-text-secondary)]">{rangeLabel}</span>
        </div>

        <div className="space-y-4 flex-1">
          {measurements.map(m => {
            const isWaist = m.label === 'Waist';
            const isBetter = isWaist ? m.change <= 0 : m.change >= 0;
            const changeAbs = m.change ? Math.abs(m.change) : 0;

            return (
              <div key={m.label} className="flex items-center justify-between group">
                <div className="flex items-center gap-3 w-1/3">
                  <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: m.bgColor }}>
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ border: `1.5px solid ${m.color}` }} />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: 'var(--th-text-secondary)' }}>{m.label}</span>
                </div>
                
                <div className="flex items-center justify-between w-2/3">
                  <span className="text-xs font-bold w-16" style={{ color: 'var(--th-text)' }}>{m.value || '--'} <span className="text-[10px] font-medium opacity-60">{m.unit}</span></span>
                  
                  <div className="w-16 flex items-center">
                    {m.change != null && m.change !== 0 ? (
                      <span className={`flex items-center gap-0.5 text-[10px] font-bold ${isBetter ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isBetter ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {changeAbs} {m.unit}
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-[var(--th-text-dim)]">--</span>
                    )}
                  </div>

                  <MeasurementSparkline data={data.history} dataKey={m.key} color={isBetter ? '#10B981' : '#F43F5E'} />
                </div>
              </div>
            );
          })}
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="w-full mt-6 py-2 rounded-xl text-[11px] font-bold text-violet-500 bg-violet-500/10 hover:bg-violet-100 transition-colors dark:bg-violet-500/10 dark:hover:bg-violet-500/20"
        >
          View All Measurements
        </button>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-6 shadow-2xl" 
              style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--th-bg-secondary)' }}>
                    <Calendar className="w-5 h-5" style={{ color: 'var(--th-primary)' }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: 'var(--th-text)' }}>Measurement History</h2>
                    <p className="text-xs font-semibold" style={{ color: 'var(--th-text-secondary)' }}>All recorded body measurements</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg transition" style={{ hover: 'var(--th-highlight)' }}>
                  <X className="w-5 h-5" style={{ color: 'var(--th-text-secondary)' }} />
                </button>
              </div>

              <div className="space-y-3">
                {(!data.history || data.history.length === 0) ? (
                  <p className="text-sm text-center py-8" style={{ color: 'var(--th-text-secondary)' }}>No history available yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--th-border)', background: 'var(--th-bg-secondary)' }}>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--th-border)' }}>
                          <th className="py-3 px-4 text-xs font-bold" style={{ color: 'var(--th-text-secondary)' }}>Date</th>
                          <th className="py-3 px-4 text-xs font-bold" style={{ color: 'var(--th-text-secondary)' }}>Chest</th>
                          <th className="py-3 px-4 text-xs font-bold" style={{ color: 'var(--th-text-secondary)' }}>Waist</th>
                          <th className="py-3 px-4 text-xs font-bold" style={{ color: 'var(--th-text-secondary)' }}>Arms</th>
                          <th className="py-3 px-4 text-xs font-bold" style={{ color: 'var(--th-text-secondary)' }}>Thighs</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...data.history].reverse().map((log, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--th-border)' }} className="transition-colors hover:opacity-80 dark:hover:bg-[var(--th-card)]/5">
                            <td className="py-3 px-4 text-xs font-semibold" style={{ color: 'var(--th-text)' }}>
                              {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="py-3 px-4 text-xs font-medium" style={{ color: 'var(--th-text-secondary)' }}>{log.chest ? `${log.chest}cm` : '-'}</td>
                            <td className="py-3 px-4 text-xs font-medium" style={{ color: 'var(--th-text-secondary)' }}>{log.waist ? `${log.waist}cm` : '-'}</td>
                            <td className="py-3 px-4 text-xs font-medium" style={{ color: 'var(--th-text-secondary)' }}>{log.arms ? `${log.arms}cm` : '-'}</td>
                            <td className="py-3 px-4 text-xs font-medium" style={{ color: 'var(--th-text-secondary)' }}>{log.thighs ? `${log.thighs}cm` : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
