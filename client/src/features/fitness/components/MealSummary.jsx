import { useState } from 'react';
import { Coffee, Sun, Dumbbell as PreWorkout, Moon, Apple, Info, ChevronRight, Trash2, Plus, Edit2 } from 'lucide-react';
import clsx from 'clsx';
import { useToast, Modal } from '@/design-system/components';
import { useDeleteFood } from '../hooks/useFitness';

const MEAL_ICONS = { breakfast: Coffee, lunch: Sun, pre_workout: PreWorkout, dinner: Moon, snacks: Apple };
const MEAL_COLORS = { breakfast: '#F59E0B', lunch: '#10B981', pre_workout: '#3B82F6', dinner: '#8B5CF6', snacks: '#EF4444' };

export default function MealSummary({ meals = [], onAddMeal, onEditMeal }) {
  const toast = useToast();
  const delMut = useDeleteFood();
  const [selectedMeal, setSelectedMeal] = useState(null);

  const handleDelete = (logId) => {
    delMut.mutate(logId, {
      onSuccess: () => {
        toast.show({ title: 'Removed', description: 'Meal entry deleted.', type: 'success' });
        // Close modal if this was the last item, otherwise let React Query update the list
        if (selectedMeal?.items?.length <= 1) setSelectedMeal(null);
      }
    });
  };

  const handleRowClick = (meal) => {
    if (meal.calories > 0 && meal.items && meal.items.length > 0) {
      setSelectedMeal(meal);
    } else {
      onAddMeal && onAddMeal(meal.type);
    }
  };

  return (
    <div className="rounded-3xl p-5 h-full" style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)', boxShadow: 'var(--th-shadow)' }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-1.5 group relative">
          <h3 className="text-sm font-bold" style={{ color: 'var(--th-text)' }}>Meal Summary</h3>
          <Info className="w-3.5 h-3.5 cursor-help" style={{ color: 'var(--th-text-muted)' }} />
          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2.5 rounded-xl text-[10px] font-medium shadow-xl z-10 pointer-events-none" style={{ background: 'var(--th-card)', color: 'var(--th-text)', border: '1px solid var(--th-border)' }}>
            A breakdown of your logged meals grouped by time of day, showing calories and macro distribution.
          </div>
        </div>
      </div>

      {meals.length === 0 || meals.every(m => m.calories === 0) ? (
        <p className="text-xs text-center py-5" style={{ color: 'var(--th-text-secondary)' }}>No meals logged yet</p>
      ) : (
        <div className="space-y-5">
          {meals.map((meal, i) => {
            const Icon = MEAL_ICONS[meal.type] || Coffee;
            const color = MEAL_COLORS[meal.type] || '#9CA3AF';
            
            return (
              <div 
                key={i} 
                className="flex items-center gap-4 group cursor-pointer transition-opacity hover:opacity-80"
                onClick={() => handleRowClick(meal)}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, color }}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col gap-1.5 justify-center">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold truncate pr-2" style={{ color: 'var(--th-text)' }}>{meal.label}</p>
                    <ChevronRight className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-1" style={{ color: 'var(--th-text-dim)' }} />
                  </div>
                  
                  <div className="flex items-center justify-between gap-x-2 w-full">
                    <p className="text-[11px] font-semibold truncate min-w-0 flex-1" style={{ color: 'var(--th-text-muted)' }}>
                      {meal.time || 'Anytime'} <span style={{ color: 'var(--th-text-dim)' }}>•</span> {meal.calories.toLocaleString()} kcal
                    </p>
                    <div className="text-[10px] font-bold flex gap-1.5 flex-shrink-0" style={{ color: 'var(--th-text-secondary)' }}>
                      <span>P: <span style={{ color: 'var(--th-text)' }}>{meal.protein}g</span></span>
                      <span>C: <span style={{ color: 'var(--th-text)' }}>{meal.carbs}g</span></span>
                      <span>F: <span style={{ color: 'var(--th-text)' }}>{meal.fats}g</span></span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Meal Details Modal */}
      <Modal isOpen={!!selectedMeal} onClose={() => setSelectedMeal(null)} title={`${selectedMeal?.label || ''} Details`} size="md">
        <div className="space-y-4 pb-2">
          {selectedMeal?.items?.length > 0 ? (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {selectedMeal.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl transition-colors hover:opacity-80 dark:hover:bg-[var(--th-card)]/5" style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)' }}>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate pr-4" style={{ color: 'var(--th-text)' }}>{item.name || 'Food Item'}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--th-text-muted)' }}>{item.quantity || '1 serving'} • {item.calories || 0} kcal</p>
                    <div className="text-[10px] font-medium flex gap-2 mt-1.5" style={{ color: 'var(--th-text-dim)' }}>
                      <span>P: {item.protein || 0}g</span>
                      <span>C: {item.carbs || 0}g</span>
                      <span>F: {item.fats || 0}g</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => {
                        const itemsForLog = selectedMeal.items.filter(i => i.logId === item.logId);
                        setSelectedMeal(null);
                        onEditMeal && onEditMeal({ id: item.logId, mealType: selectedMeal.type, foodItems: itemsForLog });
                      }}
                      className="p-2 rounded-lg transition-colors hover:bg-[var(--th-primary)]/10 text-[var(--th-primary)]"
                      title="Edit Entry"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.logId)}
                      disabled={delMut.isPending}
                      className="p-2 rounded-lg transition-colors hover:bg-red-500/10 text-red-500"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm py-4" style={{ color: 'var(--th-text-secondary)' }}>No items logged.</p>
          )}

          <button
            onClick={() => {
              const type = selectedMeal.type;
              setSelectedMeal(null);
              onAddMeal && onAddMeal(type);
            }}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-[0.98]"
            style={{ background: 'var(--th-primary)', color: '#fff' }}
          >
            <Plus className="w-4 h-4" />
            Add More Food
          </button>
        </div>
      </Modal>
    </div>
  );
}
