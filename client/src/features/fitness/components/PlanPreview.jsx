import { motion } from 'motion/react';
import { Dumbbell, Apple, Moon, CheckCircle2, RefreshCw, Settings2, Flame, Droplets, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function PlanPreview({ generatedPlans, onAccept, onRegenerate, onTweak, isGenerating }) {
  // Extract plans correctly whether they come from a full transformation ({ workout: { plan }, diet: { plan } })
  // or a single plan generation ({ plan })
  const workout = generatedPlans.workout?.plan || generatedPlans.workout || (generatedPlans.plan?.schedule ? generatedPlans.plan : null);
  const diet = generatedPlans.diet?.plan || generatedPlans.diet || (generatedPlans.plan?.mealsJson ? generatedPlans.plan : null);
  const recovery = generatedPlans.recovery?.plan || generatedPlans.recovery || (generatedPlans.plan?.recoveryDays ? generatedPlans.plan : null);

  const [activeTab, setActiveTab] = useState(workout ? 'workout' : diet ? 'diet' : 'recovery');
  const [expandedDay, setExpandedDay] = useState(null);

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl mx-auto bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--th-text)]">Your Plan is Ready</h2>
          <p className="text-sm text-[var(--th-text-secondary)]">
            AI has finalized your custom protocol. Review the details below.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-[var(--th-bg)] rounded-xl border border-[var(--th-border)]">
          {workout && (
            <button
              onClick={() => setActiveTab('workout')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'workout' ? 'bg-[var(--th-card)] shadow-sm text-[var(--th-primary)]' : 'text-[var(--th-text-secondary)] hover:text-[var(--th-text)]'}`}
            >
              Workout
            </button>
          )}
          {diet && (
            <button
              onClick={() => setActiveTab('diet')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'diet' ? 'bg-[var(--th-card)] shadow-sm text-[var(--th-primary)]' : 'text-[var(--th-text-secondary)] hover:text-[var(--th-text)]'}`}
            >
              Diet
            </button>
          )}
          {recovery && (
            <button
              onClick={() => setActiveTab('recovery')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'recovery' ? 'bg-[var(--th-card)] shadow-sm text-[var(--th-primary)]' : 'text-[var(--th-text-secondary)] hover:text-[var(--th-text)]'}`}
            >
              Recovery
            </button>
          )}
        </div>

        {/* Content */}
        <div className="bg-[var(--th-card)] border border-[var(--th-border)] rounded-2xl p-4 min-h-[300px]">
          {activeTab === 'workout' && workout && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-[var(--th-border)]">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500"><Dumbbell className="w-5 h-5" /></div>
                <div>
                  <h3 className="font-bold text-[var(--th-text)]">{workout.name}</h3>
                  <p className="text-xs text-[var(--th-text-secondary)] capitalize">{workout.phase} Phase • {workout.totalWeeks} Weeks</p>
                </div>
              </div>
              <div className="space-y-2">
                {Array.isArray(workout.schedule) && workout.schedule.map((day, idx) => (
                  <div key={idx} className="flex flex-col bg-[var(--th-bg)] rounded-xl overflow-hidden transition-all border border-transparent hover:border-[var(--th-border)]">
                    <div 
                      className={`flex justify-between items-center p-3 cursor-pointer ${!day.isRest ? 'hover:bg-[var(--th-hover)]' : ''}`}
                      onClick={() => !day.isRest && setExpandedDay(expandedDay === idx ? null : idx)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold w-8 text-[var(--th-text-secondary)] uppercase">
                          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][idx]}
                        </span>
                        <span className="text-sm font-medium text-[var(--th-text)]">{day.isRest ? 'Rest Day' : day.label || day.focus}</span>
                      </div>
                      {!day.isRest && Array.isArray(day.exercises) && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[var(--th-text-secondary)]">{day.exercises.length} exercises</span>
                          <ChevronRight className={`w-4 h-4 text-[var(--th-text-secondary)] transition-transform ${expandedDay === idx ? 'rotate-90' : ''}`} />
                        </div>
                      )}
                    </div>
                    {expandedDay === idx && !day.isRest && Array.isArray(day.exercises) && (
                      <div className="p-3 pt-0 border-t border-[var(--th-border)] border-dashed mt-1 space-y-2">
                        {day.exercises.map((ex, exIdx) => (
                          <div key={exIdx} className="flex justify-between items-center text-xs">
                            <span className="font-medium text-[var(--th-text)]">• {ex.name}</span>
                            <span className="text-[var(--th-text-secondary)]">{ex.sets} × {ex.reps}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'diet' && diet && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-[var(--th-border)]">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><Apple className="w-5 h-5" /></div>
                <div>
                  <h3 className="font-bold text-[var(--th-text)]">{diet.caloriesTarget} kcal / day</h3>
                  <p className="text-xs text-[var(--th-text-secondary)]">P: {diet.proteinTarget}g • C: {diet.carbTarget}g • F: {diet.fatTarget}g</p>
                </div>
              </div>
              <div className="space-y-3">
                {Array.isArray(diet.mealsJson?.[0]?.meals) && diet.mealsJson[0].meals.map((meal, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[var(--th-bg)] border border-[var(--th-border)] border-dashed">
                    <p className="text-[10px] font-bold text-[var(--th-primary)] uppercase tracking-wide mb-1">{meal.type}</p>
                    <p className="text-sm font-medium text-[var(--th-text)]">{meal.name}</p>
                    <p className="text-xs text-[var(--th-text-secondary)] mt-1">{meal.calories} kcal</p>
                    {Array.isArray(meal.foods) && meal.foods.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {meal.foods.map((f, i) => (
                          <p key={i} className="text-[10px] text-[var(--th-text-secondary)]">
                            • {f.name} - {f.quantity || f.amount}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <p className="text-xs text-center text-[var(--th-text-secondary)] italic mt-2">Showing a typical day's structure</p>
              </div>
            </div>
          )}

          {activeTab === 'recovery' && recovery && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-[var(--th-border)]">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500"><Moon className="w-5 h-5" /></div>
                <div>
                  <h3 className="font-bold text-[var(--th-text)]">Recovery Protocol</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-[var(--th-bg)] text-center">
                  <Moon className="w-5 h-5 mx-auto mb-2 text-purple-500" />
                  <p className="text-lg font-bold text-[var(--th-text)]">{recovery.sleepTarget}h</p>
                  <p className="text-xs text-[var(--th-text-secondary)]">Sleep Target</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--th-bg)] text-center">
                  <Droplets className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                  <p className="text-lg font-bold text-[var(--th-text)]">{recovery.hydrationTarget}L</p>
                  <p className="text-xs text-[var(--th-text-secondary)]">Hydration Target</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-[var(--th-border)] bg-[var(--th-card)] flex flex-col sm:flex-row gap-3">
        <button
          onClick={onAccept}
          className="flex-1 py-3.5 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
          style={{ background: 'var(--th-primary)' }}
        >
          <CheckCircle2 className="w-5 h-5" />
          Accept & Activate Plan
        </button>
        <div className="flex gap-3 sm:w-1/2">
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            className="flex-1 py-3.5 rounded-xl font-bold text-[var(--th-text)] border border-[var(--th-border)] bg-[var(--th-bg)] transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reroll</span>
          </button>
          <button
            onClick={onTweak}
            disabled={isGenerating}
            className="flex-1 py-3.5 rounded-xl font-bold text-[var(--th-text)] border border-[var(--th-border)] bg-[var(--th-bg)] transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline">Tweak</span>
          </button>
        </div>
      </div>
    </div>
  );
}
