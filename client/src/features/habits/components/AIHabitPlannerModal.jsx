import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Loader2, Check } from 'lucide-react';
import { Modal, Button } from '@/design-system/components';
import { usePlanAIHabits, useBulkCreateHabits } from '../hooks/useHabits';
import clsx from 'clsx';

const CATEGORY_ICONS = {
  general: '✦', mindfulness: '🧘', fitness: '💪', learning: '📚', career: '💼', health: '❤️',
};

export function AIHabitPlannerModal({ isOpen, onClose }) {
  const [step, setStep] = useState('input'); // input, loading, selection
  const [goal, setGoal] = useState('');
  const [suggestedHabits, setSuggestedHabits] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);

  const planMutation = usePlanAIHabits();
  const bulkCreateMutation = useBulkCreateHabits();

  const handleGenerate = async () => {
    if (!goal.trim()) return;
    setStep('loading');
    try {
      const res = await planMutation.mutateAsync(goal);
      if (res?.data?.plan) {
        setSuggestedHabits(res.data.plan);
        setSelectedIndices(res.data.plan.map((_, i) => i)); // Select all by default
        setStep('selection');
      } else {
        setStep('input');
      }
    } catch (e) {
      setStep('input');
    }
  };

  const handleCreate = async () => {
    if (selectedIndices.length === 0) return;
    const habitsToCreate = selectedIndices.map(i => suggestedHabits[i]);
    await bulkCreateMutation.mutateAsync(habitsToCreate);
    
    // Reset and close
    setStep('input');
    setGoal('');
    setSuggestedHabits([]);
    setSelectedIndices([]);
    onClose();
  };

  const toggleSelection = (index) => {
    setSelectedIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleClose = () => {
    if (step === 'loading') return; // prevent closing while loading
    setStep('input');
    setGoal('');
    setSuggestedHabits([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="AI Habit Planner" size="md">
      <AnimatePresence mode="wait">
        {step === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col gap-6"
          >
            <div>
              <label className="text-sm font-medium mb-3 block" style={{ color: 'var(--th-text-secondary)' }}>
                What big goal are you trying to achieve?
              </label>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Preparing for the CAT exam, running a marathon, getting better sleep..."
                className="w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-colors resize-none h-32"
                style={{
                  background: 'var(--th-input)',
                  border: '1px solid var(--th-border)',
                  color: 'var(--th-text)',
                }}
              />
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={!goal.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
              style={{ background: 'var(--th-primary)', color: '#08080d' }}
            >
              <Sparkles className="w-4 h-4" /> Generate Plan
            </button>
          </motion.div>
        )}

        {step === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-12 gap-6 text-center"
          >
            <div className="relative">
              <div className="absolute inset-0 blur-xl opacity-50 animate-pulse" style={{ background: 'var(--th-primary)' }}></div>
              <Loader2 className="w-12 h-12 animate-spin relative z-10" style={{ color: 'var(--th-primary)' }} />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--th-text)' }}>Consulting AI Coach...</h3>
              <p className="text-[14px]" style={{ color: 'var(--th-text-secondary)' }}>Analyzing your goal and crafting the perfect daily habits.</p>
            </div>
          </motion.div>
        )}

        {step === 'selection' && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col gap-6"
          >
            <div>
              <p className="text-sm font-medium mb-4" style={{ color: 'var(--th-text-secondary)' }}>
                I recommend these high-impact habits for: <span className="font-bold" style={{ color: 'var(--th-primary)' }}>"{goal}"</span>
              </p>
              
              <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto p-1 -mx-1 custom-scrollbar">
                {suggestedHabits.map((habit, index) => {
                  const isSelected = selectedIndices.includes(index);
                  return (
                    <button
                      key={index}
                      onClick={() => toggleSelection(index)}
                      className={clsx(
                        "w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all",
                        isSelected ? "ring-2" : "opacity-80 hover:opacity-100"
                      )}
                      style={{
                        background: 'var(--th-card-solid)',
                        border: '1px solid var(--th-border)',
                        '--tw-ring-color': habit.color || 'var(--th-primary)'
                      }}
                    >
                      <div 
                        className={clsx(
                          "flex items-center justify-center w-6 h-6 rounded-full transition-colors flex-shrink-0 border-2"
                        )}
                        style={{
                          borderColor: isSelected ? (habit.color || 'var(--th-primary)') : 'var(--th-border)',
                          backgroundColor: isSelected ? (habit.color || 'var(--th-primary)') : 'transparent'
                        }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[13px]">{CATEGORY_ICONS[habit.category?.toLowerCase()] || '✦'}</span>
                          <h4 className="font-semibold text-[15px] truncate" style={{ color: 'var(--th-text)' }}>
                            {habit.name}
                          </h4>
                        </div>
                        <p className="text-[12px] truncate" style={{ color: 'var(--th-text-secondary)' }}>
                          {habit.description}
                        </p>
                      </div>

                      <div className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded" style={{ background: 'var(--th-highlight)', color: 'var(--th-text-muted)' }}>
                        {habit.frequency}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setStep('input')}
                className="px-4 py-3 rounded-xl font-medium transition-colors hover:bg-slate-500/10"
                style={{ color: 'var(--th-text)' }}
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={selectedIndices.length === 0 || bulkCreateMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                style={{ background: 'var(--th-primary)', color: '#08080d' }}
              >
                {bulkCreateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Add {selectedIndices.length} Habits
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
