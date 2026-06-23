import { useState } from 'react';
import { useNutrition, useAINutritionInsight } from '../hooks/useFitness';
import MacroCards from './MacroCards';
import NutrientBreakdown from './NutrientBreakdown';
import MealSummary from './MealSummary';
import WaterIntakeCard from './WaterIntakeCard';
import NutritionScoreCard from './NutritionScoreCard';
import TopFoodSources from './TopFoodSources';
import RecentFoods from './RecentFoods';
import AIFitnessInsight from './AIFitnessInsight';
import { Calendar, ChevronDown } from 'lucide-react';
import FoodLogForm from './FoodLogForm';

export default function NutritionTab() {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [initialMealType, setInitialMealType] = useState('lunch');
  const [showFoodForm, setShowFoodForm] = useState(false);
  const { data, isLoading } = useNutrition(date);
  const nutrition = data?.data || data || {};
  const aiInsightQuery = useAINutritionInsight(date);

  const isToday = date === today;
  const dateLabel = isToday ? 'Today' : new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  if (isLoading) return (
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-36 rounded-3xl" style={{ background: 'var(--th-card-solid)' }} />)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">{[1,2,3].map(i => <div key={i} className="h-96 rounded-3xl" style={{ background: 'var(--th-card-solid)' }} />)}</div>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Global Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--th-text)' }}>Nutrition Dashboard</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--th-text-dim)' }}>Track your daily meals, macros, and hydration.</p>
        </div>

        {/* Global Date Selector */}
        <div 
          className="relative flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-colors shadow-sm group/date"
          style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}
          onClick={(e) => {
            const input = e.currentTarget.querySelector('input');
            if (input && input.showPicker) {
              try { input.showPicker(); } catch (err) {}
            }
          }}
        >
          <Calendar className="w-4 h-4" style={{ color: 'var(--th-text-dim)' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--th-text)' }}>{dateLabel}</span>
          <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover/date:translate-y-0.5" style={{ color: 'var(--th-text-dim)' }} />
          <input 
            type="date" 
            className="absolute inset-0 opacity-0 pointer-events-none w-full h-full"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={today}
          />
        </div>
      </div>

      <MacroCards macros={nutrition.macros} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Left Column */}
        <div className="flex flex-col gap-5">
          <NutrientBreakdown nutrients={nutrition.nutrients} />
          <TopFoodSources foods={nutrition.topFoodSources} />
        </div>

        {/* Middle Column */}
        <div className="flex flex-col gap-5">
          <MealSummary 
            meals={nutrition.mealSummary} 
            onAddMeal={(mealType) => {
              setInitialMealType(mealType);
              setShowFoodForm(true);
            }} 
          />
          <RecentFoods foods={nutrition.recentFoods} />
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-5">
          <WaterIntakeCard water={nutrition.water} />
          <NutritionScoreCard score={nutrition.nutritionScore} />
        </div>
      </div>

      {/* Full Width AI Insight */}
      <div className="w-full">
        <AIFitnessInsight 
          insight={aiInsightQuery.data?.data?.insight || nutrition.aiInsight} 
          onGenerate={() => aiInsightQuery.refetch()} 
          isGenerating={aiInsightQuery.isFetching}
          title="AI Nutrition Insight" 
        />
      </div>

      {showFoodForm && <FoodLogForm onClose={() => setShowFoodForm(false)} initialMealType={initialMealType} selectedDate={date} />}
    </div>
  );
}
