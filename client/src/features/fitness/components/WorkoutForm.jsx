import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Plus, Trash2, Sparkles, Loader2, Dumbbell } from 'lucide-react';
import { motion } from 'motion/react';
import { useLogWorkout, useUpdateWorkout, useSmartParseWorkout, useWorkoutMemory, useExerciseCatalog } from '../hooks/useFitness';
import { Select } from '../../../design-system/components/Select';

const TYPES = ['push', 'pull', 'legs', 'strength', 'hiit', 'swimming', 'calisthenics', 'cardio', 'yoga', 'mobility', 'sports'];
const MUSCLES = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full_body'];

function ExerciseCombobox({ value, onChange, catalog }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch(value); // Revert to valid value if clicked outside
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const filtered = useMemo(() => {
    if (!search) return catalog.slice(0, 50);
    const lowerSearch = search.toLowerCase();
    return catalog.filter(c => c.name.toLowerCase().includes(lowerSearch)).slice(0, 50);
  }, [search, catalog]);

  return (
    <div className="relative flex-1 w-full" ref={wrapperRef}>
      <input 
        type="text" 
        value={search}
        onChange={e => { setSearch(e.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        placeholder="Search exercise..." 
        className="w-full px-2 py-1.5 rounded-lg text-xs outline-none" 
        style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }} 
      />
      {isOpen && (
        <div className="absolute z-[60] w-full mt-1 max-h-48 overflow-y-auto rounded-lg shadow-xl" style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}>
          {filtered.length > 0 ? (
            filtered.map(c => (
              <button
                key={c.id}
                className="w-full text-left px-3 py-2 text-xs hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                style={{ color: 'var(--th-text)' }}
                onClick={() => {
                  onChange(c.name);
                  setSearch(c.name);
                  setIsOpen(false);
                }}
              >
                {c.name}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-xs" style={{ color: 'var(--th-text-secondary)' }}>No matches found</div>
          )}
        </div>
      )}
    </div>
  );
}


export default function WorkoutForm({ onClose, initialData = null, editingSessionId = null }) {
  const [mode, setMode] = useState('quick');
  const [smartText, setSmartText] = useState('');
  
  const getInitialForm = () => {
    if (!initialData) return {
      name: '', type: 'strength', duration: 45, date: new Date().toISOString().split('T')[0], notes: '', muscleGroups: [],
      exercises: [{ name: '', muscleGroup: 'chest', metricType: 'weight_reps', sets: [{ setNumber: 1, reps: 10, weight: 0, isWarmup: false }] }],
    };
    return {
      name: initialData.name || '',
      type: initialData.type || 'strength',
      duration: initialData.duration || 45,
      date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: initialData.notes || '',
      muscleGroups: initialData.muscleGroups || [],
      exercises: initialData.exercises?.length > 0 ? initialData.exercises.map(ex => {
        const isCardio = ex.sets?.some(s => (s.duration !== undefined && s.duration > 0) || (s.distance !== undefined && s.distance > 0));
        return {
          name: ex.name || '',
          muscleGroup: ex.muscleGroup || 'chest',
          metricType: isCardio ? 'time_distance' : 'weight_reps',
          sets: ex.sets?.map((s, i) => ({
            setNumber: s.setNumber || i + 1,
            reps: s.reps || 0,
            weight: s.weight || 0,
            duration: s.duration || 0,
            distance: s.distance || 0,
            isWarmup: s.isWarmup || false
          })) || [{ setNumber: 1, reps: 10, weight: 0, isWarmup: false }]
        };
      }) : [{ name: '', muscleGroup: 'chest', metricType: 'weight_reps', sets: [{ setNumber: 1, reps: 10, weight: 0, isWarmup: false }] }]
    };
  };

  const [form, setForm] = useState(getInitialForm());

  const { data: memoryDataRaw } = useWorkoutMemory();
  const memoryData = memoryDataRaw?.data?.memories || memoryDataRaw?.memories || [];

  const catalogQuery = useExerciseCatalog();
  const rawData = catalogQuery.data?.data;
  const catalog = Array.isArray(rawData) ? rawData : (rawData?.catalog || []);

  useEffect(() => {
    if (memoryData.length > 0 && form.exercises.length > 0 && !editingSessionId) {
      setForm(prev => {
        let hasChanges = false;
        
        const getWords = (str) => str.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
        const isMatch = (name1, name2) => {
          const words1 = getWords(name1);
          const words2 = getWords(name2);
          if (words1.length === 0 || words2.length === 0) return false;
          const [shorter, longer] = words1.length < words2.length ? [words1, words2] : [words2, words1];
          return shorter.every(w => longer.includes(w));
        };

        const newExercises = prev.exercises.map(ex => {
          if (!ex.name || ex.metricType !== 'weight_reps') return ex;
          
          // Strict match since we now enforce catalog names
          const mem = memoryData.find(m => m.exerciseName.toLowerCase() === ex.name.toLowerCase());
          if (!mem) return ex;
          
          const targetStats = mem.suggested || mem.bestPerformance || mem.lastPerformance;
          if (!targetStats || !targetStats.weight) return ex;

          const newSets = ex.sets.map(s => {
            if (s.weight === 0) {
              hasChanges = true;
              const isOverload = mem.suggested && mem.lastPerformance && mem.suggested.weight > mem.lastPerformance.weight;
              return { 
                ...s, 
                weight: targetStats.weight, 
                reps: s.reps === 0 ? (targetStats.reps || 10) : s.reps,
                isOverload
              };
            }
            return { ...s, isOverload: false };
          });
          return { ...ex, sets: newSets };
        });
        
        return hasChanges ? { ...prev, exercises: newExercises } : prev;
      });
    }
  }, [memoryData, editingSessionId]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const logMut = useLogWorkout();
  const updateMut = useUpdateWorkout();
  const parseMut = useSmartParseWorkout();
  
  const isPending = logMut.isPending || updateMut.isPending;

  const addExercise = () => setForm(f => ({
    ...f, exercises: [...f.exercises, { name: '', muscleGroup: 'chest', metricType: 'weight_reps', sets: [{ setNumber: 1, reps: 10, weight: 0, isWarmup: false }] }],
  }));
  const removeExercise = (idx) => setForm(f => ({ ...f, exercises: f.exercises.filter((_, i) => i !== idx) }));
  const updateExercise = (idx, field, val) => setForm(f => {
    let newEx = f.exercises.map((e, i) => i === idx ? { ...e, [field]: val } : e);
    if (field === 'metricType') {
      newEx = newEx.map((e, i) => i === idx ? { 
        ...e, 
        sets: [{ setNumber: 1, reps: val === 'weight_reps' ? 10 : undefined, weight: val === 'weight_reps' ? 0 : undefined, duration: val === 'time_distance' ? 10 : undefined, distance: val === 'time_distance' ? 0 : undefined, isWarmup: false }] 
      } : e);
    }
    return { ...f, exercises: newEx };
  });
  const addSet = (exIdx) => setForm(f => ({
    ...f, exercises: f.exercises.map((e, i) => i === exIdx ? { 
      ...e, 
      sets: [...e.sets, { 
        setNumber: e.sets.length + 1, 
        reps: e.metricType === 'weight_reps' ? (e.sets[e.sets.length - 1]?.reps || 10) : undefined, 
        weight: e.metricType === 'weight_reps' ? (e.sets[e.sets.length - 1]?.weight || 0) : undefined, 
        duration: e.metricType === 'time_distance' ? (e.sets[e.sets.length - 1]?.duration || 10) : undefined, 
        distance: e.metricType === 'time_distance' ? (e.sets[e.sets.length - 1]?.distance || 0) : undefined, 
        isWarmup: false 
      }] 
    } : e),
  }));
  const updateSet = (exIdx, setIdx, field, val) => setForm(f => ({
    ...f, exercises: f.exercises.map((e, i) => i === exIdx ? { ...e, sets: e.sets.map((s, j) => j === setIdx ? { ...s, [field]: val } : s) } : e),
  }));
  const removeSet = (exIdx, setIdx) => setForm(f => ({
    ...f, exercises: f.exercises.map((e, i) => i === exIdx ? { ...e, sets: e.sets.filter((_, j) => j !== setIdx) } : e),
  }));

  const handleQuickSubmit = () => { 
    if (!form.name) return; 
    if (editingSessionId) {
      updateMut.mutate({ id: editingSessionId, ...form }, { onSuccess: () => onClose() });
    } else {
      logMut.mutate(form, { onSuccess: () => onClose() }); 
    }
  };
  const handleSmartParse = () => { 
    if (!smartText.trim()) return; 
    parseMut.mutate(smartText, { 
      onSuccess: (d) => {
        const p = d?.data?.parsed || d?.parsed || null;
        if (p) {
          setForm(prev => ({
            ...prev,
            name: p.name || prev.name,
            type: p.type || prev.type,
            duration: p.duration || prev.duration,
            notes: p.notes || prev.notes,
            exercises: (p.exercises && p.exercises.length > 0) ? p.exercises.map(ex => {
              const isCardio = ex.sets?.some(s => (s.duration && s.duration > 0) || (s.distance && s.distance > 0));
              return {
                name: ex.name || '',
                muscleGroup: ex.muscleGroup || 'chest',
                metricType: isCardio ? 'time_distance' : 'weight_reps',
                sets: (ex.sets && ex.sets.length > 0) ? ex.sets.map(s => ({
                  setNumber: s.setNumber || 1,
                  reps: isCardio ? undefined : (s.reps || 0),
                  weight: isCardio ? undefined : (s.weight || 0),
                  duration: isCardio ? (s.duration || 0) : undefined,
                  distance: isCardio ? (s.distance || 0) : undefined,
                  isWarmup: s.isWarmup || false
                })) : [{ setNumber: 1, reps: isCardio ? undefined : 0, weight: isCardio ? undefined : 0, duration: isCardio ? 10 : undefined, distance: isCardio ? 0 : undefined, isWarmup: false }]
              };
            }) : prev.exercises
          }));
          setMode('quick');
          setSmartText('');
        }
      } 
    }); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-4 sm:p-6" style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(232,162,58,0.1)' }}><Dumbbell className="w-5 h-5 text-[#E8A23A]" /></div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--th-text)' }}>{editingSessionId ? 'Edit Workout' : 'Log Workout'}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:opacity-80 transition"><X className="w-5 h-5" style={{ color: 'var(--th-text-secondary)' }} /></button>
        </div>
        <div className="flex items-center gap-2 mb-5 p-1 rounded-xl" style={{ background: 'var(--th-bg-secondary)' }}>
          {[{ key: 'quick', label: 'Quick Log', icon: Dumbbell }, { key: 'smart', label: 'Smart Log', icon: Sparkles }].map(m => (
            <button key={m.key} onClick={() => setMode(m.key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition"
              style={{ background: mode === m.key ? 'var(--th-card)' : 'transparent', color: mode === m.key ? 'var(--th-text)' : 'var(--th-text-secondary)', boxShadow: mode === m.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
              <m.icon className="w-3.5 h-3.5" /> {m.label}
            </button>
          ))}
        </div>

        {mode === 'smart' ? (
          <div className="space-y-4">
            <textarea value={smartText} onChange={e => setSmartText(e.target.value)}
              placeholder="e.g., Bench press 3x12 at 60kg, incline dumbbell 3x10 20kg, cable flies 3x15, tricep pushdowns 4x12 25kg"
              className="w-full h-32 px-4 py-3 rounded-xl text-sm resize-none outline-none"
              style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }} />
            <button onClick={handleSmartParse} disabled={parseMut.isPending || !smartText.trim()}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #E8A23A, #D4891A)' }}>
              {parseMut.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Parsing...</> : <><Sparkles className="w-4 h-4" /> Parse with AI</>}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium mb-1 block" style={{ color: 'var(--th-text-secondary)' }}>Workout Name</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Push Day" className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }} />
              </div>
              <div>
                <label className="text-[11px] font-medium mb-1 block" style={{ color: 'var(--th-text-secondary)' }}>Type</label>
                <Select
                  value={form.type}
                  onChange={v => setForm(f => ({ ...f, type: v }))}
                  options={TYPES.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
                  className="w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium mb-1 block" style={{ color: 'var(--th-text-secondary)' }}>Duration (mins)</label>
                <input type="number" min="0" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0) }))} className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }} />
              </div>
              <div>
                <label className="text-[11px] font-medium mb-1 block" style={{ color: 'var(--th-text-secondary)' }}>Date</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-semibold" style={{ color: 'var(--th-text-secondary)' }}>Exercises</label>
                <button onClick={addExercise} className="flex items-center gap-1 text-[11px] font-medium" style={{ color: 'var(--th-primary)' }}><Plus className="w-3 h-3" /> Add</button>
              </div>
              <div className="space-y-3 pr-1">
                {form.exercises.map((ex, eIdx) => (
                  <div key={eIdx} className="p-3 rounded-xl" style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)' }}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                      <div className="flex items-center gap-2 w-full sm:flex-1">
                        <ExerciseCombobox 
                          value={ex.name} 
                          onChange={(val) => {
                            updateExercise(eIdx, 'name', val);
                            const matched = catalog.find(c => c.name === val);
                            if (matched && matched.muscleGroup) {
                              updateExercise(eIdx, 'muscleGroup', matched.muscleGroup);
                            }
                          }} 
                          catalog={catalog} 
                        />
                        <div className="sm:hidden flex-shrink-0">
                          {form.exercises.length > 1 && <button onClick={() => removeExercise(eIdx)} className="p-1.5"><Trash2 className="w-4 h-4 text-red-400" /></button>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="flex rounded-lg p-0.5 shrink-0" style={{ background: 'var(--th-bg-primary)', border: '1px solid var(--th-border)' }}>
                          <button onClick={() => updateExercise(eIdx, 'metricType', 'weight_reps')} className={`px-2 py-1 text-[10px] rounded-md transition-all ${ex.metricType === 'weight_reps' ? 'shadow-sm' : 'opacity-50'}`} style={{ background: ex.metricType === 'weight_reps' ? 'var(--th-card)' : 'transparent', color: 'var(--th-text)' }}>🏋️</button>
                          <button onClick={() => updateExercise(eIdx, 'metricType', 'time_distance')} className={`px-2 py-1 text-[10px] rounded-md transition-all ${ex.metricType === 'time_distance' ? 'shadow-sm' : 'opacity-50'}`} style={{ background: ex.metricType === 'time_distance' ? 'var(--th-card)' : 'transparent', color: 'var(--th-text)' }}>⏱️</button>
                        </div>
                        <div className="flex-1 sm:w-auto">
                          <Select
                            value={ex.muscleGroup}
                            onChange={v => updateExercise(eIdx, 'muscleGroup', v)}
                            options={MUSCLES.map(m => ({ value: m, label: m.replace('_', ' ') }))}
                            className="w-full sm:w-[100px]"
                            disabled={!!ex.name}
                          />
                        </div>
                        <div className="hidden sm:block shrink-0">
                          {form.exercises.length > 1 && <button onClick={() => removeExercise(eIdx)} className="p-1"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {ex.metricType === 'weight_reps' ? (
                        <div className="grid grid-cols-[32px_1fr_1fr_24px] gap-1 text-[9px] font-medium" style={{ color: 'var(--th-text-dim)' }}><span>Set</span><span>Weight</span><span>Reps</span><span /></div>
                      ) : (
                        <div className="grid grid-cols-[32px_1fr_1fr_24px] gap-1 text-[9px] font-medium" style={{ color: 'var(--th-text-dim)' }}><span>Set</span><span>Time (m)</span><span>Dist (km)</span><span /></div>
                      )}
                      {ex.sets.map((s, sIdx) => (
                        <div key={sIdx} className="grid grid-cols-[32px_1fr_1fr_24px] gap-1 items-center">
                          <span className="text-[10px] text-center" style={{ color: 'var(--th-text-dim)' }}>{sIdx + 1}</span>
                          {ex.metricType === 'weight_reps' ? (
                            <>
                              <div className="relative flex items-center min-w-0 w-full">
                                <input type="number" min="0" value={s.weight} onChange={e => updateSet(eIdx, sIdx, 'weight', e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))} className="w-full px-2 py-1 rounded text-[11px] outline-none transition-colors" style={{ background: 'var(--th-card)', border: s.isOverload ? '1px solid #10b981' : '1px solid var(--th-border)', color: 'var(--th-text)' }} />
                                {s.isOverload && <div className="absolute right-1 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-[8px]" title="Progressive Overload Target">↑</div>}
                              </div>
                              <input type="number" min="0" value={s.reps} onChange={e => updateSet(eIdx, sIdx, 'reps', e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))} className="w-full min-w-0 px-2 py-1 rounded text-[11px] outline-none" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }} />
                            </>
                          ) : (
                            <>
                              <input type="number" min="0" value={s.duration} onChange={e => updateSet(eIdx, sIdx, 'duration', e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))} className="w-full min-w-0 px-2 py-1 rounded text-[11px] outline-none" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }} />
                              <input type="number" min="0" value={s.distance} onChange={e => updateSet(eIdx, sIdx, 'distance', e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))} className="w-full min-w-0 px-2 py-1 rounded text-[11px] outline-none" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }} />
                            </>
                          )}
                          {ex.sets.length > 1 ? <button onClick={() => removeSet(eIdx, sIdx)}><X className="w-3 h-3 text-red-400" /></button> : <span />}
                        </div>
                      ))}
                    </div>
                    <button onClick={() => addSet(eIdx)} className="mt-1.5 text-[10px] font-medium" style={{ color: 'var(--th-primary)' }}>+ Add Set</button>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleQuickSubmit} disabled={isPending || !form.name}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #E8A23A, #D4891A)' }}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Dumbbell className="w-4 h-4" />} {editingSessionId ? 'Update Workout' : 'Log Workout'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
