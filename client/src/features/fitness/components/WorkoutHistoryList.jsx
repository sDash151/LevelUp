import { Dumbbell, Activity, HeartPulse, Sparkles, Move, Trophy, ChevronRight, Clock, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

const TYPE_CONFIG = {
  push: { color: '#ef4444', icon: Dumbbell, bg: '#fef2f2' }, // Red
  pull: { color: '#3b82f6', icon: Dumbbell, bg: '#eff6ff' }, // Blue
  legs: { color: '#eab308', icon: Dumbbell, bg: '#fefce8' }, // Yellow
  strength: { color: '#6366F1', icon: Dumbbell, bg: '#EEF2FF' },
  cardio: { color: '#10B981', icon: Activity, bg: '#ECFDF5' },
  hiit: { color: '#F43F5E', icon: HeartPulse, bg: '#FFF1F2' },
  swimming: { color: '#0ea5e9', icon: Activity, bg: '#f0f9ff' }, // Sky
  calisthenics: { color: '#8b5cf6', icon: Activity, bg: '#f5f3ff' }, // Violet
  yoga: { color: '#F59E0B', icon: Sparkles, bg: '#FFFBEB' },
  mobility: { color: '#8B5CF6', icon: Move, bg: '#F5F3FF' },
  sports: { color: '#06B6D4', icon: Trophy, bg: '#ECFEFF' },
};

export default function WorkoutHistoryList({ sessions = [], total = 0, loading, page = 1, onPageChange }) {
  const [expanded, setExpanded] = useState(null);
  const [expandedEx, setExpandedEx] = useState(null);
  const LIMIT = 10;
  const totalPages = Math.ceil(total / LIMIT);

  const displaySessions = sessions.slice(0, LIMIT);

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl bg-white shadow-sm border border-zinc-100" />)}
    </div>
  );

  if (sessions.length === 0) return (
    <div className="rounded-2xl p-12 text-center bg-white shadow-sm border border-zinc-100">
      <Dumbbell className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
      <p className="text-base font-bold text-zinc-700">No workouts found</p>
      <p className="text-sm mt-1 text-zinc-500">Adjust your filters or log your first workout.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-zinc-900">Workout History</h3>
      </div>

      {displaySessions.map((s, i) => {
        const isExp = expanded === s.id;
        const conf = TYPE_CONFIG[s.type] || TYPE_CONFIG.strength;
        const Icon = conf.icon;
        
        return (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-2xl overflow-hidden bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-zinc-100 transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
          >
            <button onClick={() => setExpanded(isExp ? null : s.id)} className="w-full p-6 flex items-center justify-between text-left group">
              <div className="flex items-center gap-4 flex-1 min-w-0 pr-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: conf.bg }}>
                  <Icon className="w-4 h-4" style={{ color: conf.color }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-zinc-900 truncate">{s.name}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0" style={{ background: conf.bg, color: conf.color }}>
                      {s.type.charAt(0).toUpperCase() + s.type.slice(1)}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-medium truncate">
                    {(s.muscleGroups || []).map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ') || 'General'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between w-[40%] px-4 flex-shrink-0 border-l border-zinc-100">
                <div className="text-center w-1/3">
                  <p className="text-[10px] font-bold text-zinc-400 mb-1 flex items-center justify-center gap-1"><Clock className="w-3 h-3 text-zinc-400" /> Duration</p>
                  <p className="text-xs font-bold text-zinc-900">{s.duration} <span className="text-zinc-500 font-medium">mins</span></p>
                </div>
                <div className="text-center w-1/3">
                  <p className="text-[10px] font-bold text-zinc-400 mb-1 flex items-center justify-center gap-1"><Flame className="w-3 h-3 text-orange-500" /> Calories</p>
                  <p className="text-xs font-bold text-zinc-900">{s.caloriesBurned} <span className="text-zinc-500 font-medium">kcal</span></p>
                </div>
                <div className="text-center w-1/3">
                  <p className="text-[10px] font-bold text-zinc-400 mb-1 flex items-center justify-center gap-1"><Dumbbell className="w-3 h-3 text-rose-500" /> Volume</p>
                  <p className="text-xs font-bold text-zinc-900">{s.totalVolume ? Math.round(s.totalVolume).toLocaleString() : '--'} <span className="text-zinc-500 font-medium">{s.totalVolume ? 'kg' : ''}</span></p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-32 flex-shrink-0 justify-end border-l border-zinc-100 pl-4">
                <div className="text-right">
                  <p className="text-xs font-medium text-zinc-600">{new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p className="text-[10px] text-zinc-400 font-medium mt-0.5">{new Date(s.completedAt || s.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                </div>
                <ChevronRight className={`w-4 h-4 text-zinc-400 transition-transform ${isExp ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
              </div>
            </button>

            <AnimatePresence>
              {isExp && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-zinc-50 border-t border-zinc-100">
                  <div className="px-6 py-5 space-y-3">
                    {(s.exercises || []).map((ex, j) => {
                      const exKey = `${s.id}-${j}`;
                      const isExExp = expandedEx === exKey;
                      return (
                        <div key={j} className="bg-white border border-zinc-100 shadow-sm rounded-xl overflow-hidden">
                          <button 
                            onClick={() => setExpandedEx(isExExp ? null : exKey)}
                            className="w-full flex items-center justify-between p-3 text-xs hover:bg-zinc-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold bg-zinc-100 text-zinc-600">{j + 1}</span>
                              <span className="font-bold text-zinc-800">{ex.name}</span>
                            </div>
                            <div className="flex items-center gap-4 text-zinc-500 font-medium">
                              <span><strong className="text-zinc-900">{(ex.sets || []).length}</strong> sets</span>
                              <span><strong className="text-zinc-900">{Math.round(ex.totalVolume || 0)}</strong> kg</span>
                              {ex.bestSet && <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md font-bold hidden sm:block">Best: {ex.bestSet.weight}kg × {ex.bestSet.reps}</span>}
                              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExExp ? 'rotate-90' : ''}`} />
                            </div>
                          </button>
                          
                          <AnimatePresence>
                            {isExExp && (
                              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-zinc-50/50 border-t border-zinc-100">
                                <div className="p-3 px-4 space-y-1.5">
                                  <div className="grid grid-cols-[40px_1fr_1fr] gap-4 px-2 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                                    <span className="text-center">Set</span>
                                    <span>{(ex.sets && ex.sets[0] && ex.sets[0].duration !== undefined) ? 'Time' : 'Weight'}</span>
                                    <span>{(ex.sets && ex.sets[0] && ex.sets[0].distance !== undefined) ? 'Dist' : 'Reps'}</span>
                                  </div>
                                  {(ex.sets || []).map((set, setIdx) => (
                                    <div key={setIdx} className="grid grid-cols-[40px_1fr_1fr] gap-4 px-2 py-1.5 items-center text-xs font-medium bg-white rounded-lg border border-zinc-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                      <span className="text-center text-zinc-500">{setIdx + 1}</span>
                                      {set.duration !== undefined ? (
                                        <>
                                          <span className="text-zinc-900">{set.duration} <span className="text-zinc-400 font-normal">m</span></span>
                                          <span className="text-zinc-900">{set.distance} <span className="text-zinc-400 font-normal">km</span></span>
                                        </>
                                      ) : (
                                        <>
                                          <span className="text-zinc-900">{set.weight} <span className="text-zinc-400 font-normal">kg</span></span>
                                          <span className="text-zinc-900">{set.reps} <span className="text-zinc-400 font-normal">reps</span></span>
                                        </>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                    {s.notes && <p className="text-[11px] italic mt-3 text-zinc-500 bg-zinc-100 p-3 rounded-xl">📝 {s.notes}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <button className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1">Load more workouts <ChevronRight className="w-3 h-3 rotate-90" /></button>
        </div>
      )}
    </div>
  );
}
