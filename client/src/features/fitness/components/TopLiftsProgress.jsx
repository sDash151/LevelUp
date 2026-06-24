import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, X, TrendingUp } from 'lucide-react';

export default function TopLiftsProgress({ lifts = [] }) {
  const [showModal, setShowModal] = useState(false);
  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Top Lifts Progress</h3>
      </div>
      {lifts.length === 0 ? (
        <p className="text-xs" style={{ color: 'var(--th-text-secondary)' }}>No lift data yet</p>
      ) : (
        <div className="space-y-3">
          {lifts.slice(0, 5).map((lift, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--th-text)' }}>{lift.exercise}</p>
                <p className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>{lift.lastWeight}kg → {lift.bestWeight}kg</p>
              </div>
              <span className={`text-[10px] font-bold ${lift.improvement?.value >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                +{lift.improvement?.value || 0} {lift.improvement?.type === 'weight' ? 'kg' : 'reps'}
              </span>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => setShowModal(true)} className="w-full mt-3 py-2 text-[11px] font-medium rounded-lg transition hover:bg-[var(--th-border)]" style={{ background: 'var(--th-bg-secondary)', color: 'var(--th-text-secondary)' }}>
        View Full Progress
      </button>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setShowModal(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-6 shadow-2xl" 
              style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--th-bg-secondary)' }}>
                    <Trophy className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: 'var(--th-text)' }}>All Top Lifts Progress</h2>
                    <p className="text-xs font-semibold" style={{ color: 'var(--th-text-secondary)' }}>Track your maximum strength gains</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg transition hover:bg-[var(--th-bg-secondary)]">
                  <X className="w-5 h-5" style={{ color: 'var(--th-text-secondary)' }} />
                </button>
              </div>

              <div className="space-y-3">
                {lifts.map((lift, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border gap-4" style={{ borderColor: 'var(--th-border)', background: 'var(--th-card)' }}>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--th-text)' }}>{lift.exercise}</h4>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="px-3 py-1.5 rounded-lg bg-[var(--th-bg-secondary)] border border-black/5 dark:border-white/5">
                          <span className="text-[10px] uppercase tracking-wider block font-semibold" style={{ color: 'var(--th-text-dim)' }}>Starting</span>
                          <span className="text-xs font-bold" style={{ color: 'var(--th-text)' }}>{lift.lastWeight}kg</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg border" style={{ borderColor: 'var(--th-border)', background: 'color-mix(in srgb, var(--th-primary) 10%, transparent)' }}>
                          <span className="text-[10px] uppercase tracking-wider block font-semibold" style={{ color: 'var(--th-primary)' }}>Personal Best</span>
                          <span className="text-xs font-bold" style={{ color: 'var(--th-text)' }}>{lift.bestWeight}kg</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="px-4 py-2 rounded-xl border flex items-center gap-2 shadow-sm" style={{ borderColor: 'var(--th-border)', background: 'var(--th-bg)' }}>
                        <TrendingUp className={`w-4 h-4 ${lift.improvement?.value >= 0 ? 'text-emerald-500' : 'text-red-400'}`} />
                        <span className={`text-sm font-black ${lift.improvement?.value >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                          +{lift.improvement?.value || 0} {lift.improvement?.type === 'weight' ? 'kg' : 'reps'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {lifts.length === 0 && (
                  <p className="text-center py-8 text-sm" style={{ color: 'var(--th-text-secondary)' }}>No lifts recorded yet. Start pushing some weight!</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
