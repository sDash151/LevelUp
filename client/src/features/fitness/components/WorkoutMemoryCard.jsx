import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Clock, Dumbbell, Flame, ArrowRight, X } from 'lucide-react';

export default function WorkoutMemoryCard({ memories = [], lastSession = null }) {
  const [showModal, setShowModal] = useState(false);
  const recent = memories.slice(0, 5);

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Workout Memory</h3>
        <span className="text-[10px] cursor-pointer hover:underline" style={{ color: 'var(--th-primary)' }} onClick={() => setShowModal(true)}>View All</span>
      </div>

      {recent.length === 0 ? (
        <p className="text-xs" style={{ color: 'var(--th-text-secondary)' }}>Log workouts to build memory</p>
      ) : (
        <>
          {/* Show Last Session in detail */}
          {lastSession && (
            <div className="mb-4 p-3 rounded-xl" style={{ background: 'var(--th-bg-secondary)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4" style={{ color: 'var(--th-primary)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--th-text)' }}>
                  {lastSession.name} - Last Workout
                </span>
              </div>
              <p className="text-[10px] mb-2" style={{ color: 'var(--th-text-dim)' }}>
                {new Date(lastSession.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <div className="flex items-center gap-4 text-[10px]">
                <span style={{ color: 'var(--th-text-secondary)' }}>
                  <Clock className="w-3 h-3 inline mr-0.5 text-blue-500" /> {lastSession.duration}m
                </span>
                <span style={{ color: 'var(--th-text-secondary)' }}>
                  <Dumbbell className="w-3 h-3 inline mr-0.5 text-emerald-500" /> {Math.round(lastSession.volume).toLocaleString()}kg
                </span>
                <span style={{ color: 'var(--th-text-secondary)' }}>
                  <Flame className="w-3 h-3 inline mr-0.5 text-orange-500" /> {lastSession.calories} kcal
                </span>
              </div>
            </div>
          )}

          {/* Memory list */}
          <div className="space-y-2.5">
            {recent.map((mem, i) => (
              <div key={i} className="flex items-center justify-between text-[11px]">
                <span className="font-medium truncate flex-1" style={{ color: 'var(--th-text)' }}>{mem.exerciseName}</span>
                <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>
                  <span>{mem.lastPerformance?.weight}kg × {mem.lastPerformance?.reps}</span>
                  {mem.suggested && (
                    <>
                      <ArrowRight className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500 font-semibold">{mem.suggested.weight}kg × {mem.suggested.reps}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

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
                    <Brain className="w-5 h-5" style={{ color: 'var(--th-primary)' }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: 'var(--th-text)' }}>All Workout Memories</h2>
                    <p className="text-xs font-semibold" style={{ color: 'var(--th-text-secondary)' }}>Historical performance across exercises</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg transition hover:bg-[var(--th-bg-secondary)]">
                  <X className="w-5 h-5" style={{ color: 'var(--th-text-secondary)' }} />
                </button>
              </div>

              <div className="space-y-3">
                {memories.map((mem, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border gap-4" style={{ borderColor: 'var(--th-border)', background: 'var(--th-card)' }}>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--th-text)' }}>{mem.exerciseName}</h4>
                      <p className="text-[11px]" style={{ color: 'var(--th-text-secondary)' }}>Last logged: {new Date(mem.lastLoggedDate || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm bg-[var(--th-bg)] rounded-lg p-3 border" style={{ borderColor: 'var(--th-border)' }}>
                      <div className="text-center">
                        <span className="block text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--th-text-dim)' }}>Last Performance</span>
                        <span className="font-semibold" style={{ color: 'var(--th-text)' }}>{mem.lastPerformance?.weight}kg × {mem.lastPerformance?.reps}</span>
                      </div>
                      {mem.suggested && (
                        <>
                          <ArrowRight className="w-4 h-4 text-emerald-500" />
                          <div className="text-center">
                            <span className="block text-[9px] font-bold uppercase tracking-wider mb-1 text-emerald-500">Suggested Target</span>
                            <span className="font-bold text-emerald-500">{mem.suggested.weight}kg × {mem.suggested.reps}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {memories.length === 0 && (
                  <p className="text-center py-8 text-sm" style={{ color: 'var(--th-text-secondary)' }}>No memories recorded yet. Start logging workouts!</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
