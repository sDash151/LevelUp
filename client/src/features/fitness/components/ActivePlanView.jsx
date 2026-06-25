import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Dumbbell, Apple, Moon, ChevronDown, ChevronUp, Clock, Flame,
  RefreshCw, Loader2, Zap, Droplets, Target, TrendingUp, ChevronRight, Activity, CalendarDays, Utensils, Check, Coffee, ArrowRight
} from 'lucide-react';
import { useActivePlans, useSwapMeal, useSwapExercise, useAdherenceScore, useWorkoutHistory, useExerciseCatalog, useExerciseSwaps } from '../hooks/useFitness';
import { MuscleHeatmap } from './MuscleHeatmap';
import { useToast } from '@/design-system/components';

// Sleek glowing score ring for Cockpit
function ScoreRing({ score, size = 64, strokeWidth = 5, label, icon: Icon }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div className="flex flex-col items-center gap-2 group relative">
      <div className="relative flex items-center justify-center">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full blur-md opacity-20 transition-opacity group-hover:opacity-40" style={{ background: color }} />
        <svg width={size} height={size} className="transform -rotate-90 relative z-10">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--th-border)" strokeWidth={strokeWidth} fill="none" opacity={0.3} />
          <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute flex flex-col items-center justify-center z-20">
          {Icon ? <Icon className="w-4 h-4 mb-0.5 opacity-80" style={{ color }} /> : null}
          <span className="text-sm font-black tracking-tighter" style={{ color }}>{Math.round(score)}%</span>
        </div>
      </div>
      {label && <span className="text-[10px] font-bold tracking-wider uppercase opacity-70" style={{ color: 'var(--th-text-secondary)' }}>{label}</span>}
    </div>
  );
}

// Target Macro Card (Not a progress bar)
const MacroBadge = ({ label, value, color }) => (
  <div 
    className="flex justify-between items-center w-full bg-[var(--th-bg)] rounded-xl p-3.5 border transition-transform hover:scale-[1.02] shadow-sm"
    style={{ borderColor: 'var(--th-border)', borderBottomWidth: '2px', borderBottomColor: color }}
  >
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }} />
      <span className="text-[10px] font-black uppercase tracking-wider" style={{ color }}>{label}</span>
    </div>
    <span className="text-sm font-black tracking-tight" style={{ color: 'var(--th-text)' }}>{value}</span>
  </div>
);

export default function ActivePlanView({ onLogWorkout, onLogMeal }) {
  const toast = useToast();
  const { data: plansData, isLoading } = useActivePlans();
  const { data: adherenceData } = useAdherenceScore();
  const { data: workoutHistoryData } = useWorkoutHistory({ timeframe: 'this_week' });
  const swapMealMut = useSwapMeal();
  const swapExMut = useSwapExercise();

  const plans = plansData?.data || plansData || {};
  const adherence = adherenceData?.data || adherenceData || null;
  const extractLogs = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.workouts)) return data.workouts;
    if (data.data && Array.isArray(data.data.workouts)) return data.data.workouts;
    if (data.data && Array.isArray(data.data.sessions)) return data.data.sessions;
    if (Array.isArray(data.sessions)) return data.sessions;
    return [];
  };
  const workoutLogs = extractLogs(workoutHistoryData);
  const { workout, diet, recovery, targets } = plans;

  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState(() => {
    const todayDate = new Date();
    return todayDate.getDay() === 0 ? 6 : todayDate.getDay() - 1;
  });
  const [selectedDietDay, setSelectedDietDay] = useState(() => {
    const todayDate = new Date();
    return todayDate.getDay() === 0 ? 6 : todayDate.getDay() - 1;
  });

  const [selectedExercises, setSelectedExercises] = useState({});
  const [selectedFoods, setSelectedFoods] = useState({});
  const [expandedMeals, setExpandedMeals] = useState({});
  
  const { data: catalogData } = useExerciseCatalog();
  const catalog = catalogData?.data || catalogData || [];
  const [guideExercise, setGuideExercise] = useState(null);
  const [swapContext, setSwapContext] = useState(null);
  const [swapResult, setSwapResult] = useState(null);
  const [aiSwapReason, setAiSwapReason] = useState('');

  const findClosestExercise = (generatedName, generatedMuscleGroup = '') => {
    if (!generatedName || !catalog || catalog.length === 0) return null;
    const cleanName = generatedName.toLowerCase().replace(/\([^)]*\)/g, '').trim();
    const searchWords = cleanName.match(/\b\w+\b/g) || [];

    let bestMatch = null;
    let maxScore = 0;

    for (const ex of catalog) {
      const exName = ex.name.toLowerCase().replace(/\([^)]*\)/g, '').trim();
      
      // Exact or substring match
      if (exName === cleanName || exName.includes(cleanName) || cleanName.includes(exName)) return ex;

      // Word intersection match
      const exWords = exName.match(/\b\w+\b/g) || [];
      let score = 0;
      for (const w of searchWords) {
        if (exWords.includes(w)) score++;
      }
      
      // Boost score if the catalog exercise's muscles align with the AI's intended muscle group
      if (generatedMuscleGroup) {
        const mg = generatedMuscleGroup.toLowerCase();
        const allMuscles = [...(ex.primaryMuscles || []), ...(ex.secondaryMuscles || [])].join(' ');
        if (allMuscles.includes(mg) || mg.includes('back') && allMuscles.includes('lats') || mg.includes('legs') && allMuscles.includes('quad')) {
          score += 2;
        }
      }

      // Penalize heavily if the equipment doesn't match
      const equipments = ['dumbbell', 'barbell', 'cable', 'machine', 'smith', 'band'];
      let equipmentMismatch = false;
      for (const eq of equipments) {
        if (searchWords.includes(eq) && !exWords.includes(eq)) equipmentMismatch = true;
        if (!searchWords.includes(eq) && exWords.includes(eq)) equipmentMismatch = true;
      }
      if (equipmentMismatch) score -= 3; // harsher penalty

      if (score > maxScore) {
        maxScore = score;
        bestMatch = ex;
      }
    }
    
    // Only return if reasonable match
    if (maxScore > 0) {
      return bestMatch;
    }
    
    // Fallback: If no match found, try to find an exercise that matches the inferred muscle group
    let fallbackMuscle = generatedMuscleGroup?.toLowerCase() || '';
    if (!fallbackMuscle) {
      if (cleanName.includes('tricep') || cleanName.includes('extension')) fallbackMuscle = 'triceps';
      else if (cleanName.includes('bicep') || cleanName.includes('curl')) fallbackMuscle = 'biceps';
      else if (cleanName.includes('chest') || cleanName.includes('press') || cleanName.includes('fly')) fallbackMuscle = 'chest';
      else if (cleanName.includes('back') || cleanName.includes('row') || cleanName.includes('pull')) fallbackMuscle = 'back';
      else if (cleanName.includes('leg') || cleanName.includes('squat')) fallbackMuscle = 'legs';
      else if (cleanName.includes('shoulder') || cleanName.includes('raise')) fallbackMuscle = 'shoulders';
      else if (cleanName.includes('core') || cleanName.includes('abs')) fallbackMuscle = 'core';
    }

    if (fallbackMuscle) {
      for (const ex of catalog) {
        const allMuscles = [...(ex.primaryMuscles || []), ...(ex.secondaryMuscles || [])].join(' ');
        if (allMuscles.includes(fallbackMuscle) || (fallbackMuscle.includes('back') && allMuscles.includes('lats')) || (fallbackMuscle.includes('legs') && allMuscles.includes('quad'))) {
          // Just return the first one that matches the equipment if possible
          const equipments = ['dumbbell', 'barbell', 'cable', 'machine', 'smith', 'band'];
          let hasEquipment = false;
          for (const eq of equipments) {
            if (searchWords.includes(eq) && ex.name.toLowerCase().includes(eq)) hasEquipment = true;
          }
          if (hasEquipment) return ex;
        }
      }
      // If we couldn't match equipment, just return any exercise for that muscle
      for (const ex of catalog) {
        const allMuscles = [...(ex.primaryMuscles || []), ...(ex.secondaryMuscles || [])].join(' ');
        if (allMuscles.includes(fallbackMuscle) || (fallbackMuscle.includes('back') && allMuscles.includes('lats')) || (fallbackMuscle.includes('legs') && allMuscles.includes('quad'))) {
          return ex;
        }
      }
    }

    return null;
  };
  
  const swapParams = useMemo(() => {
    if (!swapContext) return null;
    
    let exactMuscles = null;
    
    // 1. First, always try to find the exact exercise in the catalog
    if (catalog && catalog.length > 0) {
      const catalogItem = catalog.find(ex => ex.name.toLowerCase() === swapContext.currentName.toLowerCase());
      if (catalogItem && catalogItem.primaryMuscles?.length > 0) {
        exactMuscles = catalogItem.primaryMuscles.join(',');
      }
    }
    
    // 2. If not found in catalog, try AI's explicit muscle group, mapped to DB strings
    if (!exactMuscles && swapContext.muscleGroup) {
      const mg = swapContext.muscleGroup.toLowerCase();
      if (mg.includes('arm')) exactMuscles = 'biceps,triceps,forearms';
      else if (mg.includes('back')) exactMuscles = 'lats,middle back,lower back,traps';
      else if (mg.includes('leg')) exactMuscles = 'quadriceps,hamstrings,glutes,calves,adductors,abductors';
      else if (mg.includes('core') || mg.includes('abs')) exactMuscles = 'abdominals';
      else exactMuscles = mg;
    }
    
    // 3. If STILL no exact muscles, parse the name robustly
    if (!exactMuscles) {
      const name = swapContext.currentName.toLowerCase();
      if (name.includes('tricep') || name.includes('extension') || name.includes('skull crusher')) exactMuscles = 'triceps';
      else if (name.includes('bicep') || name.includes('curl')) exactMuscles = 'biceps';
      else if (name.includes('chest') || name.includes('press') || name.includes('fly') || name.includes('push-up')) exactMuscles = 'chest';
      else if (name.includes('back') || name.includes('row') || name.includes('pull') || name.includes('lat') || name.includes('chin-up')) exactMuscles = 'lats,middle back,lower back,traps';
      else if (name.includes('leg') || name.includes('squat') || name.includes('lunge') || name.includes('calf') || name.includes('rdl') || name.includes('deadlift')) exactMuscles = 'quadriceps,hamstrings,glutes,calves';
      else if (name.includes('shoulder') || name.includes('raise')) exactMuscles = 'shoulders';
      else if (name.includes('core') || name.includes('abs') || name.includes('crunch') || name.includes('plank') || name.includes('sit-up')) exactMuscles = 'abdominals';
    }
      
    return { muscles: exactMuscles || 'full_body', exclude: swapContext.currentName, equipment: null };
  }, [swapContext, catalog]);

  const { data: swapsData, isLoading: swapsLoading } = useExerciseSwaps(swapParams);
  const swaps = swapsData?.data || swapsData || [];

  const toggleExercise = (dayIdx, exIdx) => {
    setSelectedExercises(prev => {
      const daySel = prev[dayIdx] || [];
      if (daySel.includes(exIdx)) return { ...prev, [dayIdx]: daySel.filter(i => i !== exIdx) };
      return { ...prev, [dayIdx]: [...daySel, exIdx] };
    });
  };

  const toggleFood = (dayIdx, mealIdx, fIdx) => {
    const key = `${dayIdx}-${mealIdx}`;
    setSelectedFoods(prev => {
      const sel = prev[key] || [];
      if (sel.includes(fIdx)) return { ...prev, [key]: sel.filter(i => i !== fIdx) };
      return { ...prev, [key]: [...sel, fIdx] };
    });
  };

  const toggleAllFoods = (dayIdx, mealIdx, foodsArray) => {
    const key = `${dayIdx}-${mealIdx}`;
    setSelectedFoods(prev => {
      const currentSel = prev[key] || [];
      if (currentSel.length === foodsArray.length) {
        return { ...prev, [key]: [] };
      }
      return { ...prev, [key]: foodsArray.map((_, i) => i) };
    });
  };

  const handleLogWorkout = (dayIdx) => {
    const day = workout?.schedule?.[dayIdx];
    if (!day) return;
    
    const selectedIndices = selectedExercises[dayIdx] || [];
    const exercisesToLog = selectedIndices.sort().map(idx => day.exercises[idx]);
    
    const dayLabel = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayIdx];
    
    const todayDate = new Date();
    const todayDayOfWeek = todayDate.getDay() === 0 ? 6 : todayDate.getDay() - 1;
    const targetDate = new Date(todayDate);
    targetDate.setDate(todayDate.getDate() - todayDayOfWeek + dayIdx);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    const existingSession = workoutLogs.find(log => {
      if (!log.createdAt && !log.date) return false;
      const logDate = new Date(log.date || log.createdAt);
      return logDate.toISOString().split('T')[0] === targetDateStr;
    });

    onLogWorkout && onLogWorkout(existingSession || {
      name: `${workout.name} - ${day.day || dayLabel} Workout`,
      type: 'strength',
      date: targetDateStr,
      exercises: exercisesToLog.map(ex => ({
        name: ex.name,
        sets: Array.from({ length: ex.sets || 3 }).map(() => ({ weight: ex.weight || 0, reps: ex.reps || 0 }))
      }))
    }, existingSession?.id);
    
    setSelectedExercises(prev => ({ ...prev, [dayIdx]: [] }));
  };

  const handleLogMeal = (dayIdx, mealIdx) => {
    const mealsList = Array.isArray(diet?.mealsJson) ? diet.mealsJson : [];
    const meal = mealsList[dayIdx]?.meals?.[mealIdx];
    if (!meal) return;
    
    const selectedIndices = selectedFoods[`${dayIdx}-${mealIdx}`] || [];
    const foodsToLog = selectedIndices.sort().map(idx => meal.foods[idx]);
    
    onLogMeal && onLogMeal({
      mealType: meal.type,
      notes: `From plan: ${meal.name}`,
      foodItems: foodsToLog.map(f => ({
        name: `${f.name} (${f.quantity || f.amount || ''})`,
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0
      }))
    });
    
    setSelectedFoods(prev => ({ ...prev, [`${dayIdx}-${mealIdx}`]: [] }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 rounded-3xl animate-pulse" style={{ background: 'var(--th-card)' }} />
        ))}
      </div>
    );
  }

  if (!workout && !diet && !recovery) return null;

  return (
    <div className="space-y-6">
      
      {/* ═══ THE COCKPIT (Adherence & Macros Dashboard) ═══ */}
      <div className="rounded-3xl p-5 border overflow-hidden relative shadow-sm" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 space-y-6">
          {/* Adherence Header & Rings */}
          {adherence && (
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20">
                   <Activity className="w-4 h-4 text-indigo-500" />
                </div>
                <div>
                   <h3 className="text-sm font-black tracking-tight" style={{ color: 'var(--th-text)' }}>Intelligence Hub</h3>
                   <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--th-text-secondary)' }}>Weekly Adherence</p>
                </div>
              </div>
              <div className="flex justify-between items-end px-2">
                <ScoreRing score={adherence.workoutScore} size={54} strokeWidth={4} label="Workout" />
                <ScoreRing score={adherence.mealScore} size={54} strokeWidth={4} label="Meals" />
                <ScoreRing score={adherence.totalScore} size={80} strokeWidth={6} label="Global" icon={Target} />
                <ScoreRing score={adherence.sleepScore} size={54} strokeWidth={4} label="Sleep" />
                <ScoreRing score={adherence.hydrationScore} size={54} strokeWidth={4} label="Water" />
              </div>
            </div>
          )}

          {/* Macro Targets */}
          {(targets || diet) && (
            <div className="pt-5 border-t border-[var(--th-border)]">
               <div className="flex items-center gap-2 mb-4">
                 <Flame className="w-4 h-4 text-orange-500" />
                 <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--th-text-secondary)]">Daily Nutrition Protocol</h4>
               </div>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                 <MacroBadge label="Calories" value={`${diet?.caloriesTarget || targets?.targetCalories || '-'} kcal`} color="#F59E0B" />
                 <MacroBadge label="Protein" value={`${diet?.proteinTarget || targets?.protein || '-'}g`} color="#EF4444" />
                 <MacroBadge label="Carbs" value={`${diet?.carbTarget || targets?.carbs || '-'}g`} color="#3B82F6" />
                 <MacroBadge label="Fats" value={`${diet?.fatTarget || targets?.fats || '-'}g`} color="#10B981" />
               </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ WORKOUT PLAN CARD ═══ */}
      {workout && (
        <div>
          <div className="flex items-center gap-3 mb-4 px-1 mt-8">
             <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[var(--th-card)] border border-indigo-500/20 relative overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.15)] group hover:border-indigo-500/40 transition-colors">
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/20 to-transparent pointer-events-none" />
               <Dumbbell className="w-6 h-6 text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.6)] relative z-10" />
             </div>
             <div>
               <h3 className="text-lg font-black tracking-tight" style={{ color: 'var(--th-text)' }}>{workout.name || 'Workout Plan'}</h3>
               <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--th-text-secondary)]">
                 {workout.phase} Phase • {workout.totalWeeks} Weeks • {workout.fitnessLevel}
               </p>
             </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 pt-1 px-2 scroll-pl-2 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {workout.schedule && (() => {
              const todayDate = new Date();
              const todayDayOfWeek = todayDate.getDay() === 0 ? 6 : todayDate.getDay() - 1; // 0=Mon, 6=Sun
              
              return Array.from({ length: 7 }).map((_, originalIdx) => {
                const day = workout.schedule[originalIdx];
                if (!day) return null;
                const isSelected = selectedWorkoutDay === originalIdx;
                const isRest = day.isRest;
                
                const targetDate = new Date(todayDate);
                targetDate.setDate(todayDate.getDate() - todayDayOfWeek + originalIdx);
                const dayNameLabel = targetDate.toLocaleDateString(undefined, { weekday: 'short' });
              
                let badgeClass = '';
                let badgeText = '';
                if (isRest) {
                  badgeText = 'Rest';
                  badgeClass = 'bg-black/5 dark:bg-white/5 text-[var(--th-text-secondary)] border-black/5 dark:border-white/5';
                } else {
                  // Check if there's a logged workout for this specific date
                  const targetDateStr = targetDate.toISOString().split('T')[0];
                  const hasLoggedWorkout = workoutLogs.some(log => {
                    if (!log.createdAt && !log.date) return false;
                    const logDate = new Date(log.date || log.createdAt);
                    return logDate.toISOString().split('T')[0] === targetDateStr;
                  });

                  if (hasLoggedWorkout) {
                    badgeText = 'Completed';
                    badgeClass = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
                  } else if (originalIdx < todayDayOfWeek) {
                    badgeText = 'Missed';
                    badgeClass = 'bg-red-500/10 text-red-500 border-red-500/20';
                  } else if (originalIdx === todayDayOfWeek) {
                    badgeText = 'Today';
                    badgeClass = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
                  } else {
                    badgeText = 'Upcoming';
                    badgeClass = 'bg-violet-500/10 text-violet-500 border-violet-500/20';
                  }
                }

                let estMins = 0;
                let estWeight = 0;
                if (!isRest && day.exercises) {
                   estMins = Math.round(day.exercises.reduce((acc, ex) => acc + (ex.sets * 2.5) + (ex.sets * ((ex.rest||60)/60)), 0));
                   estWeight = day.exercises.reduce((acc, ex) => acc + (ex.sets * ex.reps * (ex.weight || 20)), 0);
                }

                const isToday = originalIdx === todayDayOfWeek;
                const dayLabel = isToday ? 'TODAY' : dayNameLabel.toUpperCase();
                const dateNumLabel = targetDate.getDate();

                return (
                  <button
                    key={originalIdx}
                    onClick={() => setSelectedWorkoutDay(originalIdx)}
                    className={`snap-center shrink-0 w-[120px] sm:w-[130px] flex flex-col items-center p-4 rounded-3xl border transition-all duration-300 shadow-sm hover:-translate-y-1 text-center focus:outline-none ${isSelected ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)] bg-[var(--th-card)]' : 'border-[var(--th-border)] bg-[var(--th-bg)] hover:border-indigo-500/30 hover:shadow-md'}`}
                  >
                    {/* The restored square date badge */}
                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border transition-all mb-4 ${isRest ? 'bg-[var(--th-bg)] border-[var(--th-border)] opacity-70' : isSelected ? 'bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'bg-[var(--th-card)] border-[var(--th-border)] group-hover:border-indigo-500/30'}`}>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--th-text-secondary)]">
                        {dayLabel}
                      </span>
                      <span className="text-[20px] font-black leading-none mt-0.5" style={{ color: isRest ? 'var(--th-text-secondary)' : '#6366F1' }}>
                        {dateNumLabel}
                      </span>
                    </div>

                    <h4 className="text-[13px] font-black truncate w-full" style={{ color: 'var(--th-text)' }}>
                      {isRest ? 'Active Recovery' : (day.type || day.label || day.focus || 'Training')}
                    </h4>

                    {/* Status badge (Today/Upcoming/Missed) */}
                    <div className={`mt-3 px-2 py-1 rounded-md text-[9px] font-black tracking-widest uppercase border w-full text-center ${badgeClass}`}>
                      {badgeText}
                    </div>

                    {/* Stats */}
                    <div className="mt-4 flex flex-col items-center justify-center gap-1.5 w-full text-[10px] font-bold tracking-wider text-[var(--th-text-secondary)] border-t border-[var(--th-border)] pt-3">
                      {isRest ? (
                        <span className="opacity-60 uppercase mt-1 text-center w-full">Rest & Recover</span>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5 w-full justify-center">
                            <Clock className="w-3.5 h-3.5 opacity-60 text-indigo-400" />
                            <span>{estMins} mins</span>
                          </div>
                          <div className="flex items-center gap-1.5 w-full justify-center mt-0.5">
                            <Dumbbell className="w-3.5 h-3.5 opacity-60 text-indigo-400" />
                            <span>{(estWeight).toLocaleString()} kg</span>
                          </div>
                        </>
                      )}
                    </div>
                  </button>
                );
              });
            })()}
          </div>

          <AnimatePresence mode="wait">
            {(() => {
              if (!workout.schedule || !workout.schedule[selectedWorkoutDay] || workout.schedule[selectedWorkoutDay].isRest) return null;
              
              const todayDate = new Date();
              const todayDayOfWeek = todayDate.getDay() === 0 ? 6 : todayDate.getDay() - 1;
              const targetDate = new Date(todayDate);
              targetDate.setDate(todayDate.getDate() - todayDayOfWeek + selectedWorkoutDay);
              const targetDateStr = targetDate.toISOString().split('T')[0];

              const existingSession = workoutLogs.find(log => {
                if (!log.createdAt && !log.date) return false;
                const logDate = new Date(log.date || log.createdAt);
                return logDate.toISOString().split('T')[0] === targetDateStr;
              });
              const isSelectedDayCompleted = !!existingSession;

              return (
              <motion.div
                key={selectedWorkoutDay}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="mt-2"
              >
                <div className="space-y-3">
                  {workout.schedule[selectedWorkoutDay].exercises?.map((ex, exIdx) => (
                    <div key={exIdx} className="group/ex flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-[var(--th-card)] border border-[var(--th-border)] hover:border-indigo-500/30 transition-colors shadow-sm gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={(e) => { e.preventDefault(); if (!isSelectedDayCompleted) toggleExercise(selectedWorkoutDay, exIdx); }}
                            className={`w-5 h-5 rounded flex items-center justify-center border transition-all duration-300 shrink-0 ${
                              isSelectedDayCompleted || (selectedExercises[selectedWorkoutDay] || []).includes(exIdx) 
                              ? 'bg-indigo-500 border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]' 
                              : 'bg-black/10 dark:bg-white/5 border-indigo-500/40 shadow-[0_0_8px_rgba(99,102,241,0.2)] hover:border-indigo-500 hover:shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                            } ${isSelectedDayCompleted ? 'cursor-default opacity-80' : ''}`}
                          >
                            {(isSelectedDayCompleted || (selectedExercises[selectedWorkoutDay] || []).includes(exIdx)) && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                          </button>
                          <div className="w-5 h-5 rounded flex items-center justify-center bg-indigo-500/10 text-indigo-500 text-[10px] font-black">{exIdx + 1}</div>
                          <div 
                            className="flex items-center gap-1.5 cursor-pointer hover:text-indigo-500 transition-colors border-b border-dashed border-indigo-500/30 pb-0.5" 
                            style={{ color: 'var(--th-text)' }}
                            onClick={(e) => { e.stopPropagation(); setGuideExercise(ex); }}
                            title="View Form Guide & Muscles"
                          >
                            <h5 className="text-sm font-bold">{ex.name}</h5>
                            <div className="w-4 h-4 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-500 text-[9px] font-black italic">i</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold tracking-wider px-2 py-1 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                            {ex.sets} SETS × {ex.reps} REPS
                          </span>
                          {ex.weight && (
                            <span className="text-[10px] font-bold tracking-wider px-2 py-1 rounded bg-black/5 dark:bg-white/5 text-[var(--th-text-secondary)]">
                              {ex.weight}kg TARGET
                            </span>
                          )}
                          {ex.rest && (
                            <span className="text-[10px] font-bold tracking-wider px-2 py-1 rounded bg-black/5 dark:bg-white/5 text-[var(--th-text-secondary)] flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {ex.rest}s REST
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSwapContext({ planId: workout.id, day: workout.schedule[selectedWorkoutDay].day, exerciseIndex: exIdx, muscleGroup: ex.muscleGroup, currentName: ex.name }); }}
                        disabled={swapExMut.isPending}
                        className="p-2 rounded-lg bg-[var(--th-bg)] border border-[var(--th-border)] transition-colors hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-500"
                        title="Smart Swap"
                      >
                        {swapExMut.isPending ? <Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> : <RefreshCw className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                  {(isSelectedDayCompleted || selectedExercises[selectedWorkoutDay]?.length > 0) && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-4 rounded-xl border flex items-center justify-between shadow-sm sticky bottom-4 z-10 backdrop-blur-md ${isSelectedDayCompleted ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-indigo-500/10 border-indigo-500/20'}`}>
                      <span className={`text-sm font-bold ${isSelectedDayCompleted ? 'text-emerald-500' : 'text-indigo-500'}`}>
                        {isSelectedDayCompleted ? 'Workout Completed' : `${selectedExercises[selectedWorkoutDay].length} exercises selected`}
                      </span>
                      <button onClick={() => handleLogWorkout(selectedWorkoutDay)} className={`px-4 py-2 text-white rounded-lg text-sm font-bold shadow-md transition-colors active:scale-95 ${isSelectedDayCompleted ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-indigo-500 hover:bg-indigo-600'}`}>
                        {isSelectedDayCompleted ? 'Edit Workout' : 'Log Selected'}
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      )}

      {/* ═══ DIET PLAN CARD ═══ */}
      {diet && (
        <div>
          <div className="flex items-center gap-3 mb-4 px-1 mt-8">
             <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[var(--th-card)] border border-emerald-500/20 relative overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.15)] group hover:border-emerald-500/40 transition-colors">
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/20 to-transparent pointer-events-none" />
               <Utensils className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)] relative z-10" />
             </div>
             <div>
               <h3 className="text-lg font-black tracking-tight" style={{ color: 'var(--th-text)' }}>Nutrition Protocol</h3>
               <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--th-text-secondary)]">
                 Curated Meal Plan
               </p>
             </div>
          </div>

          <div className="flex overflow-x-auto gap-4 pb-4 pt-1 px-2 scroll-pl-2 snap-x sm:justify-start hide-scrollbar relative z-10">
            {(() => {
              const mealsList = Array.isArray(diet.mealsJson) ? diet.mealsJson : [];
              if (mealsList.length === 0) return null;
              
              const todayDate = new Date();
              const currentDayIndex = todayDate.getDay() === 0 ? 6 : todayDate.getDay() - 1; // 0=Mon, 6=Sun
              
              return Array.from({ length: 7 }, (_, i) => (currentDayIndex + i) % 7).map((originalIdx, renderIdx) => {
                const dayPlan = mealsList[originalIdx];
                if (!dayPlan) return null;
                const isSelected = selectedDietDay === originalIdx;
                
                const targetDate = new Date(todayDate);
                targetDate.setDate(todayDate.getDate() + renderIdx);
                const dayNameLabel = targetDate.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase();
                const dateNumLabel = targetDate.getDate();

                return (
                  <button
                    key={originalIdx}
                    onClick={() => setSelectedDietDay(originalIdx)}
                    className={`flex-none w-36 sm:w-40 snap-start flex flex-col p-4 rounded-3xl transition-all duration-300 relative overflow-hidden text-center shadow-sm ${isSelected ? 'bg-emerald-500/5 border-emerald-500 ring-2 ring-emerald-500/20' : 'bg-[var(--th-card)] hover:bg-[var(--th-bg-secondary)] border border-[var(--th-border)] hover:border-emerald-500/30'}`}
                    style={{ minHeight: '160px' }}
                  >
                    {isSelected && <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />}
                    
                    <div className="flex flex-col items-center justify-center relative z-10 w-full h-full">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--th-text-secondary)] mb-1">
                        {renderIdx === 0 ? 'TODAY' : dayNameLabel}
                      </span>
                      <span className={`text-3xl font-black tracking-tighter mb-4 ${isSelected ? 'text-emerald-500' : 'text-[var(--th-text)]'}`}>
                        {dateNumLabel}
                      </span>
                      
                      <span className="text-sm font-bold truncate w-full mb-3" style={{ color: 'var(--th-text)' }}>
                        {dayPlan.day}
                      </span>

                      <div className="mt-auto flex justify-center w-full">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${isSelected ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-black/5 dark:bg-white/5 text-[var(--th-text-secondary)]'}`}>
                          {dayPlan.meals?.length || 0} MEALS
                        </span>
                      </div>
                    </div>
                  </button>
                );
              });
            })()}
          </div>

          <AnimatePresence mode="wait">
            {(() => {
              const mealsList = Array.isArray(diet.mealsJson) ? diet.mealsJson : [];
              const dayPlan = mealsList[selectedDietDay];
              if (!dayPlan || !dayPlan.meals) return null;

              return (
                <motion.div
                  key={selectedDietDay}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 space-y-4"
                >
                  {dayPlan.meals.map((meal, mIdx) => (
                    <div key={mIdx} className="group/meal relative p-4 rounded-xl border border-[var(--th-border)] bg-[var(--th-card)] hover:border-emerald-500/30 transition-colors shadow-sm">
                      <div 
                        onClick={() => setExpandedMeals(prev => ({ ...prev, [`${selectedDietDay}-${mIdx}`]: !prev[`${selectedDietDay}-${mIdx}`] }))}
                        className="flex justify-between items-start mb-3 cursor-pointer group/header"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              {meal.type}
                            </span>
                          </div>
                          <h5 className="text-sm font-bold group-hover/header:text-emerald-500 transition-colors" style={{ color: 'var(--th-text)' }}>{meal.name}</h5>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); swapMealMut.mutate({ planId: diet.id, day: dayPlan.day, mealType: meal.type }); }}
                            disabled={swapMealMut.isPending}
                            className="p-2 rounded-xl bg-[var(--th-bg)] border border-[var(--th-border)] transition-colors hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-500 group-hover/meal:opacity-100 sm:opacity-0"
                            title="Swap meal"
                          >
                            {swapMealMut.isPending ? <Loader2 className="w-4 h-4 animate-spin text-emerald-500" /> : <RefreshCw className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedMeals[`${selectedDietDay}-${mIdx}`] && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            {/* Mini Macro pills for meal */}
                            <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-[var(--th-bg)] border border-black/5 dark:border-white/5">
                               <div className="flex-1 text-center border-r border-[var(--th-border)] last:border-0">
                                 <p className="text-[9px] font-bold text-[var(--th-text-secondary)] uppercase tracking-wider">Kcal</p>
                                 <p className="text-xs font-black" style={{ color: '#F59E0B' }}>{meal.calories}</p>
                               </div>
                               <div className="flex-1 text-center border-r border-[var(--th-border)] last:border-0">
                                 <p className="text-[9px] font-bold text-[var(--th-text-secondary)] uppercase tracking-wider">Pro</p>
                                 <p className="text-xs font-black" style={{ color: '#EF4444' }}>{meal.protein}g</p>
                               </div>
                               <div className="flex-1 text-center border-r border-[var(--th-border)] last:border-0">
                                 <p className="text-[9px] font-bold text-[var(--th-text-secondary)] uppercase tracking-wider">Carb</p>
                                 <p className="text-xs font-black" style={{ color: '#3B82F6' }}>{meal.carbs}g</p>
                               </div>
                               <div className="flex-1 text-center border-r border-[var(--th-border)] last:border-0">
                                 <p className="text-[9px] font-bold text-[var(--th-text-secondary)] uppercase tracking-wider">Fat</p>
                                 <p className="text-xs font-black" style={{ color: '#10B981' }}>{meal.fats}g</p>
                               </div>
                            </div>

                            {meal.foods && meal.foods.length > 0 && (
                              <div className="space-y-2 pl-1 bg-black/5 dark:bg-white/5 p-3 rounded-lg border border-[var(--th-border)] mt-4">
                                <div 
                                  onClick={() => toggleAllFoods(selectedDietDay, mIdx, meal.foods)} 
                                  className="flex items-center gap-3 text-xs cursor-pointer group/chk p-2 -mx-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-black/10 dark:border-white/10 mb-2 pb-3"
                                >
                                  <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all duration-300 shrink-0 ${(selectedFoods[`${selectedDietDay}-${mIdx}`] || []).length === meal.foods.length ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]' : 'bg-black/10 dark:bg-white/5 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)] group-hover/chk:border-emerald-500 group-hover/chk:shadow-[0_0_12px_rgba(16,185,129,0.4)]'}`}>
                                    {((selectedFoods[`${selectedDietDay}-${mIdx}`] || []).length === meal.foods.length) && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                  </div>
                                  <span className={`font-black uppercase tracking-wider transition-colors ${(selectedFoods[`${selectedDietDay}-${mIdx}`] || []).length === meal.foods.length ? 'text-emerald-500' : 'text-[var(--th-text-secondary)]'}`}>
                                    {(selectedFoods[`${selectedDietDay}-${mIdx}`] || []).length === meal.foods.length ? 'Deselect All Foods' : 'Select All Foods'}
                                  </span>
                                </div>
                                {meal.foods.map((f, i) => (
                                  <div key={i} onClick={() => toggleFood(selectedDietDay, mIdx, i)} className="flex items-start gap-3 text-xs cursor-pointer group/chk p-2 -mx-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                    <div className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center border transition-all duration-300 shrink-0 ${(selectedFoods[`${selectedDietDay}-${mIdx}`] || []).includes(i) ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]' : 'bg-black/10 dark:bg-white/5 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)] group-hover/chk:border-emerald-500 group-hover/chk:shadow-[0_0_12px_rgba(16,185,129,0.4)]'}`}>
                                      {(selectedFoods[`${selectedDietDay}-${mIdx}`] || []).includes(i) && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className={`font-semibold transition-colors ${(selectedFoods[`${selectedDietDay}-${mIdx}`] || []).includes(i) ? 'text-emerald-500' : 'text-[var(--th-text)]'}`}>{f.name}</span>
                                      <span className="opacity-70 text-[var(--th-text-secondary)]">{f.quantity || f.amount}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {(selectedFoods[`${selectedDietDay}-${mIdx}`]?.length > 0) && (
                              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between shadow-sm">
                                <span className="text-xs font-bold text-emerald-500">{selectedFoods[`${selectedDietDay}-${mIdx}`].length} items selected</span>
                                <button onClick={() => handleLogMeal(selectedDietDay, mIdx)} className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md hover:bg-emerald-600 transition-colors active:scale-95">
                                  Log Selected
                                </button>
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                                </div>
                  ))}
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      )}

      {/* ═══ RECOVERY PLAN CARD ═══ */}
      {recovery && (
        <div>
          <div className="flex items-center gap-3 mb-4 px-1 mt-8">
             <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[var(--th-card)] border border-blue-500/20 relative overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.15)] group hover:border-blue-500/40 transition-colors">
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-transparent pointer-events-none" />
               <Moon className="w-6 h-6 text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)] relative z-10" />
             </div>
             <div>
               <h3 className="text-lg font-black tracking-tight" style={{ color: 'var(--th-text)' }}>Recovery Protocol</h3>
               <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--th-text-secondary)]">
                 Rest & Optimization
               </p>
             </div>
          </div>
          
          <div className="rounded-3xl p-6 border relative overflow-hidden shadow-sm" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}>
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[80px] opacity-20 bg-blue-500 pointer-events-none" />
            
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl border border-[var(--th-border)] bg-[var(--th-bg)] relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Clock className="w-6 h-6 mb-2 text-blue-500" />
                <p className="text-3xl font-black" style={{ color: 'var(--th-text)' }}>{recovery.sleepTarget}<span className="text-sm text-[var(--th-text-secondary)] font-bold ml-1">hrs</span></p>
                <p className="text-[10px] uppercase font-black tracking-widest text-[var(--th-text-secondary)] mt-1">Deep Sleep Target</p>
              </div>
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl border border-[var(--th-border)] bg-[var(--th-bg)] relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
                <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Droplets className="w-6 h-6 mb-2 text-cyan-500" />
                <p className="text-3xl font-black" style={{ color: 'var(--th-text)' }}>{recovery.hydrationTarget}<span className="text-sm text-[var(--th-text-secondary)] font-bold ml-1">L</span></p>
                <p className="text-[10px] uppercase font-black tracking-widest text-[var(--th-text-secondary)] mt-1">Daily Hydration</p>
              </div>
            </div>

            {recovery.recoveryDays?.length > 0 && (
              <div className="mt-6 pt-5 border-t border-[var(--th-border)] relative z-10">
                <p className="text-[10px] uppercase font-black tracking-widest text-[var(--th-text-secondary)] mb-3">Designated Rest Days</p>
                <div className="flex flex-wrap gap-2">
                  {recovery.recoveryDays.map(d => (
                    <span key={d} className="px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border shadow-sm" style={{ background: 'color-mix(in srgb, #3B82F6 10%, var(--th-card))', color: '#3B82F6', borderColor: 'color-mix(in srgb, #3B82F6 20%, var(--th-border))' }}>
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* ═══ FORM GUIDE MODAL ═══ */}
      <AnimatePresence>
        {guideExercise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setGuideExercise(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-3xl bg-[var(--th-bg)] border border-[var(--th-border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              {(() => {
                const ex = findClosestExercise(guideExercise.name, guideExercise.muscleGroup);
                
                if (!ex) return (
                  <div className="p-8 text-center bg-[var(--th-card)] flex flex-col items-center">
                     <h2 className="text-xl font-black mb-2" style={{ color: 'var(--th-text)' }}>{guideExercise.name}</h2>
                     <p className="text-sm text-[var(--th-text-secondary)]">No detailed form guide found in the catalog for this generated exercise.</p>
                     <button onClick={() => setGuideExercise(null)} className="mt-6 px-4 py-2 bg-[var(--th-bg)] border border-[var(--th-border)] rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm font-bold text-[var(--th-text)]">Close</button>
                  </div>
                );
                return (
                  <>
                    <div className="shrink-0 p-6 border-b border-[var(--th-border)] flex justify-between items-start bg-[var(--th-card)] relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/20">
                        <div className="h-full bg-indigo-500 w-1/3 blur-sm" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black" style={{ color: 'var(--th-text)' }}>{ex.name}</h2>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-wider">{ex.muscleGroup}</span>
                          <span className="px-2 py-1 rounded bg-black/5 dark:bg-white/5 text-[var(--th-text-secondary)] text-[10px] font-black uppercase tracking-wider">{ex.equipmentType || 'Bodyweight'}</span>
                        </div>
                      </div>
                      <button onClick={() => setGuideExercise(null)} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                        <ChevronDown className="w-5 h-5 text-[var(--th-text-secondary)]" />
                      </button>
                    </div>
                    <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                      {ex.images && ex.images.length > 0 && (
                        <div>
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-[var(--th-text-secondary)] mb-3">Demonstration</h4>
                          <div className="flex overflow-x-auto gap-4 pb-2 snap-x hide-scrollbar">
                            {ex.images.map((img, i) => (
                              <img 
                                key={i} 
                                src={img} 
                                alt={`${ex.name} position ${i + 1}`} 
                                className="h-48 md:h-64 w-auto rounded-xl object-contain snap-center bg-white dark:bg-black/20 border border-[var(--th-border)] shadow-sm" 
                                loading="lazy" 
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 shrink-0">
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-[var(--th-text-secondary)] mb-3">Muscle Activation</h4>
                          <div className="bg-[var(--th-card)] rounded-2xl border border-[var(--th-border)] p-4 shadow-inner">
                            <MuscleHeatmap activeMuscles={[...(ex.primaryMuscles || []), ...(ex.secondaryMuscles || [])]} />
                          </div>
                        </div>
                        <div className="flex-[1.5]">
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-[var(--th-text-secondary)] mb-3">Form Guide</h4>
                          <div className="space-y-3">
                            {ex.instructions?.length > 0 ? ex.instructions.map((step, i) => (
                              <div key={i} className="flex gap-3 text-sm">
                                <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 font-black text-[10px] mt-0.5">{i + 1}</span>
                                <p style={{ color: 'var(--th-text)' }} className="leading-relaxed opacity-90">{step}</p>
                              </div>
                            )) : (
                              <p className="text-sm opacity-50 italic">No instructions available.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ SMART SWAP MODAL ═══ */}
      <AnimatePresence>
        {(swapContext || swapResult) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setSwapContext(null); setSwapResult(null); }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-[var(--th-bg)] border border-[var(--th-border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
              
              {swapResult ? (
                <div className="p-8 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-black mb-2" style={{ color: 'var(--th-text)' }}>Swap Successful!</h3>
                  <div className="flex items-center gap-3 w-full bg-[var(--th-card)] border border-[var(--th-border)] rounded-xl p-4 my-4">
                    <div className="flex-1 text-sm font-medium line-through opacity-50 text-right" style={{ color: 'var(--th-text)' }}>{swapResult.old}</div>
                    <ArrowRight className="w-5 h-5 text-indigo-500 shrink-0" />
                    <div className="flex-1 text-sm font-bold text-green-500 text-left">{swapResult.new}</div>
                  </div>
                  <button 
                    onClick={() => { setSwapContext(null); setSwapResult(null); }}
                    className="w-full py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-6 border-b border-[var(--th-border)] bg-[var(--th-card)] flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-black flex items-center gap-2" style={{ color: 'var(--th-text)' }}><RefreshCw className="w-5 h-5 text-indigo-500" /> Smart Swap</h2>
                      <p className="text-xs text-[var(--th-text-secondary)] mt-1">Alternatives for {swapContext?.currentName}</p>
                    </div>
                    <button onClick={() => setSwapContext(null)} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                      <ChevronDown className="w-5 h-5 text-[var(--th-text-secondary)]" />
                    </button>
                  </div>
                  <div className="p-4 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                    {swapsLoading ? (
                      <div className="py-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
                    ) : swaps.length > 0 ? (
                      swaps.map(alt => (
                        <button
                          key={alt.id}
                          disabled={swapExMut.isPending}
                          onClick={() => {
                            swapExMut.mutate({ planId: swapContext.planId, day: swapContext.day, exerciseIndex: swapContext.exerciseIndex, targetExerciseName: alt.name }, {
                              onSuccess: (res) => {
                                const data = res?.data?.data || res?.data;
                                if (data?.swapped && data?.replacement) {
                                  setSwapResult({ old: data.swapped, new: data.replacement });
                                } else {
                                  setSwapContext(null);
                                  toast.success('Exercise swapped successfully!');
                                }
                              }
                            });
                          }}
                          className="flex items-center justify-between p-4 rounded-xl bg-[var(--th-card)] border border-[var(--th-border)] hover:border-indigo-500/50 hover:shadow-md transition-all text-left group"
                        >
                          <div>
                            <h4 className="text-sm font-bold group-hover:text-indigo-500 transition-colors" style={{ color: 'var(--th-text)' }}>{alt.name}</h4>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[9px] uppercase tracking-wider text-[var(--th-text-secondary)]">{alt.equipmentType || 'Bodyweight'}</span>
                              <span className="text-[9px] uppercase tracking-wider text-[var(--th-text-secondary)] flex items-center gap-0.5"><Flame className="w-3 h-3 text-orange-500" /> {alt.difficulty}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all text-indigo-500" />
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-center py-8 text-[var(--th-text-secondary)]">No alternatives found.</p>
                    )}
                    
                    <div className="mt-4 border-t border-[var(--th-border)] pt-4">
                      <input
                        type="text"
                        value={aiSwapReason}
                        onChange={(e) => setAiSwapReason(e.target.value)}
                        placeholder="Why swap? (e.g., 'Shoulder hurts', 'Bench is full')"
                        className="w-full bg-[var(--th-bg)] border border-[var(--th-border)] rounded-xl px-3 py-3 text-sm text-[var(--th-text)] outline-none focus:border-indigo-500 mb-3"
                      />
                      <button
                        disabled={swapExMut.isPending || !aiSwapReason.trim()}
                        onClick={() => {
                          swapExMut.mutate({ planId: swapContext.planId, day: swapContext.day, exerciseIndex: swapContext.exerciseIndex, reason: aiSwapReason }, {
                            onSuccess: (res) => {
                              setAiSwapReason('');
                              const data = res?.data?.data || res?.data;
                              if (data?.swapped && data?.replacement) {
                                setSwapResult({ old: data.swapped, new: data.replacement });
                              } else {
                                setSwapContext(null);
                                toast.success('AI successfully swapped your exercise!');
                              }
                            }
                          });
                        }}
                        className={`w-full p-4 rounded-xl border border-dashed border-indigo-500/30 text-indigo-500 font-bold text-sm flex justify-center items-center gap-2 ${
                          !aiSwapReason.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-500/5 transition-colors'
                        }`}
                      >
                        {swapExMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        {swapExMut.isPending ? 'Generating swap...' : 'Let AI generate a custom swap'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
