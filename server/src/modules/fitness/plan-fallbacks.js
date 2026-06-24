// ══════════════════════════════════════════════════════════════
// Plan Fallbacks — Deterministic templates when AI fails 3 times
// These are safe, proven plans that require zero AI
// ══════════════════════════════════════════════════════════════

// ═══ WORKOUT FALLBACKS ═══

const WORKOUT_PPL_BEGINNER = {
  name: 'Beginner Push Pull Legs',
  phase: 'general',
  totalWeeks: 8,
  progressionType: 'linear',
  deloadWeek: 4,
  schedule: [
    { day: 'monday', type: 'Push', muscleGroups: ['chest', 'shoulders', 'triceps'], isRest: false, estimatedDuration: 45, exercises: [
      { name: 'Flat Bench Press', sets: 3, reps: 10, rest: 90, muscleGroup: 'chest' },
      { name: 'Overhead Press', sets: 3, reps: 10, rest: 90, muscleGroup: 'shoulders' },
      { name: 'Incline Dumbbell Press', sets: 3, reps: 12, rest: 60, muscleGroup: 'chest' },
      { name: 'Lateral Raises', sets: 3, reps: 15, rest: 45, muscleGroup: 'shoulders' },
      { name: 'Tricep Pushdowns', sets: 3, reps: 12, rest: 45, muscleGroup: 'triceps' },
    ]},
    { day: 'tuesday', type: 'Pull', muscleGroups: ['back', 'biceps'], isRest: false, estimatedDuration: 45, exercises: [
      { name: 'Barbell Rows', sets: 3, reps: 10, rest: 90, muscleGroup: 'back' },
      { name: 'Lat Pulldowns', sets: 3, reps: 12, rest: 60, muscleGroup: 'back' },
      { name: 'Seated Cable Rows', sets: 3, reps: 12, rest: 60, muscleGroup: 'back' },
      { name: 'Dumbbell Curls', sets: 3, reps: 12, rest: 45, muscleGroup: 'biceps' },
      { name: 'Hammer Curls', sets: 2, reps: 12, rest: 45, muscleGroup: 'biceps' },
    ]},
    { day: 'wednesday', type: 'Legs', muscleGroups: ['legs', 'core'], isRest: false, estimatedDuration: 50, exercises: [
      { name: 'Barbell Squats', sets: 3, reps: 10, rest: 120, muscleGroup: 'legs' },
      { name: 'Romanian Deadlifts', sets: 3, reps: 10, rest: 90, muscleGroup: 'legs' },
      { name: 'Leg Press', sets: 3, reps: 12, rest: 90, muscleGroup: 'legs' },
      { name: 'Leg Curls', sets: 3, reps: 12, rest: 60, muscleGroup: 'legs' },
      { name: 'Calf Raises', sets: 3, reps: 15, rest: 45, muscleGroup: 'legs' },
    ]},
    { day: 'thursday', type: 'Rest Day', isRest: true },
    { day: 'friday', type: 'Push', muscleGroups: ['chest', 'shoulders', 'triceps'], isRest: false, estimatedDuration: 45, exercises: [
      { name: 'Dumbbell Bench Press', sets: 3, reps: 10, rest: 90, muscleGroup: 'chest' },
      { name: 'Dumbbell Shoulder Press', sets: 3, reps: 10, rest: 90, muscleGroup: 'shoulders' },
      { name: 'Cable Flyes', sets: 3, reps: 12, rest: 60, muscleGroup: 'chest' },
      { name: 'Face Pulls', sets: 3, reps: 15, rest: 45, muscleGroup: 'shoulders' },
      { name: 'Overhead Tricep Extension', sets: 3, reps: 12, rest: 45, muscleGroup: 'triceps' },
    ]},
    { day: 'saturday', type: 'Pull', muscleGroups: ['back', 'biceps'], isRest: false, estimatedDuration: 45, exercises: [
      { name: 'Deadlifts', sets: 3, reps: 8, rest: 120, muscleGroup: 'back' },
      { name: 'Pull Ups', sets: 3, reps: 8, rest: 90, muscleGroup: 'back' },
      { name: 'Cable Rows', sets: 3, reps: 12, rest: 60, muscleGroup: 'back' },
      { name: 'Barbell Curls', sets: 3, reps: 12, rest: 45, muscleGroup: 'biceps' },
      { name: 'Cable Curls', sets: 2, reps: 15, rest: 45, muscleGroup: 'biceps' },
    ]},
    { day: 'sunday', type: 'Rest Day', isRest: true },
  ],
};

const WORKOUT_UPPER_LOWER = {
  name: 'Upper Lower Split',
  phase: 'general',
  totalWeeks: 8,
  progressionType: 'linear',
  deloadWeek: 4,
  schedule: [
    { day: 'monday', type: 'Upper Body', muscleGroups: ['chest', 'back', 'shoulders', 'arms'], isRest: false, estimatedDuration: 50, exercises: [
      { name: 'Bench Press', sets: 4, reps: 8, rest: 120, muscleGroup: 'chest' },
      { name: 'Barbell Rows', sets: 4, reps: 8, rest: 90, muscleGroup: 'back' },
      { name: 'Overhead Press', sets: 3, reps: 10, rest: 90, muscleGroup: 'shoulders' },
      { name: 'Lat Pulldowns', sets: 3, reps: 12, rest: 60, muscleGroup: 'back' },
      { name: 'Dumbbell Curls', sets: 2, reps: 12, rest: 45, muscleGroup: 'arms' },
      { name: 'Tricep Pushdowns', sets: 2, reps: 12, rest: 45, muscleGroup: 'arms' },
    ]},
    { day: 'tuesday', type: 'Lower Body', muscleGroups: ['legs', 'core'], isRest: false, estimatedDuration: 50, exercises: [
      { name: 'Squats', sets: 4, reps: 8, rest: 120, muscleGroup: 'legs' },
      { name: 'Romanian Deadlifts', sets: 3, reps: 10, rest: 90, muscleGroup: 'legs' },
      { name: 'Leg Press', sets: 3, reps: 12, rest: 90, muscleGroup: 'legs' },
      { name: 'Leg Curls', sets: 3, reps: 12, rest: 60, muscleGroup: 'legs' },
      { name: 'Calf Raises', sets: 3, reps: 15, rest: 45, muscleGroup: 'legs' },
    ]},
    { day: 'wednesday', type: 'Rest Day', isRest: true },
    { day: 'thursday', type: 'Upper Body', muscleGroups: ['chest', 'back', 'shoulders', 'arms'], isRest: false, estimatedDuration: 50, exercises: [
      { name: 'Incline Dumbbell Press', sets: 3, reps: 10, rest: 90, muscleGroup: 'chest' },
      { name: 'Cable Rows', sets: 3, reps: 12, rest: 60, muscleGroup: 'back' },
      { name: 'Lateral Raises', sets: 3, reps: 15, rest: 45, muscleGroup: 'shoulders' },
      { name: 'Face Pulls', sets: 3, reps: 15, rest: 45, muscleGroup: 'shoulders' },
      { name: 'Hammer Curls', sets: 2, reps: 12, rest: 45, muscleGroup: 'arms' },
      { name: 'Overhead Tricep Extension', sets: 2, reps: 12, rest: 45, muscleGroup: 'arms' },
    ]},
    { day: 'friday', type: 'Lower Body', muscleGroups: ['legs', 'core'], isRest: false, estimatedDuration: 50, exercises: [
      { name: 'Front Squats', sets: 3, reps: 10, rest: 90, muscleGroup: 'legs' },
      { name: 'Hip Thrusts', sets: 3, reps: 12, rest: 90, muscleGroup: 'legs' },
      { name: 'Lunges', sets: 3, reps: 10, rest: 60, muscleGroup: 'legs' },
      { name: 'Leg Extensions', sets: 3, reps: 15, rest: 45, muscleGroup: 'legs' },
      { name: 'Calf Raises', sets: 3, reps: 15, rest: 45, muscleGroup: 'legs' },
    ]},
    { day: 'saturday', type: 'Rest Day', isRest: true },
    { day: 'sunday', type: 'Rest Day', isRest: true },
  ],
};

const WORKOUT_FULLBODY = {
  name: 'Full Body 3-Day',
  phase: 'general',
  totalWeeks: 8,
  progressionType: 'linear',
  deloadWeek: 4,
  schedule: [
    { day: 'monday', type: 'Full Body A', muscleGroups: ['chest', 'back', 'legs', 'shoulders'], isRest: false, estimatedDuration: 50, exercises: [
      { name: 'Squats', sets: 3, reps: 8, rest: 120, muscleGroup: 'legs' },
      { name: 'Bench Press', sets: 3, reps: 8, rest: 90, muscleGroup: 'chest' },
      { name: 'Barbell Rows', sets: 3, reps: 8, rest: 90, muscleGroup: 'back' },
      { name: 'Overhead Press', sets: 3, reps: 10, rest: 60, muscleGroup: 'shoulders' },
      { name: 'Plank', sets: 3, reps: 60, rest: 45, muscleGroup: 'core', notes: '60 seconds' },
    ]},
    { day: 'tuesday', type: 'Rest Day', isRest: true },
    { day: 'wednesday', type: 'Full Body B', muscleGroups: ['legs', 'back', 'chest', 'arms'], isRest: false, estimatedDuration: 50, exercises: [
      { name: 'Deadlifts', sets: 3, reps: 6, rest: 120, muscleGroup: 'back' },
      { name: 'Incline Dumbbell Press', sets: 3, reps: 10, rest: 90, muscleGroup: 'chest' },
      { name: 'Lat Pulldowns', sets: 3, reps: 12, rest: 60, muscleGroup: 'back' },
      { name: 'Lunges', sets: 3, reps: 10, rest: 60, muscleGroup: 'legs' },
      { name: 'Dumbbell Curls', sets: 2, reps: 12, rest: 45, muscleGroup: 'arms' },
    ]},
    { day: 'thursday', type: 'Rest Day', isRest: true },
    { day: 'friday', type: 'Full Body C', muscleGroups: ['legs', 'chest', 'back', 'shoulders'], isRest: false, estimatedDuration: 50, exercises: [
      { name: 'Front Squats', sets: 3, reps: 10, rest: 90, muscleGroup: 'legs' },
      { name: 'Dumbbell Bench Press', sets: 3, reps: 10, rest: 90, muscleGroup: 'chest' },
      { name: 'Cable Rows', sets: 3, reps: 12, rest: 60, muscleGroup: 'back' },
      { name: 'Lateral Raises', sets: 3, reps: 15, rest: 45, muscleGroup: 'shoulders' },
      { name: 'Tricep Pushdowns', sets: 2, reps: 12, rest: 45, muscleGroup: 'arms' },
    ]},
    { day: 'saturday', type: 'Rest Day', isRest: true },
    { day: 'sunday', type: 'Rest Day', isRest: true },
  ],
};

// ═══ DIET FALLBACKS ═══

function buildDietFallback(targets, dietType = 'non_veg', foodStyle = 'hybrid') {
  const targetCalories = targets?.targetCalories || 2000;
  const protein = targets?.protein || 150;
  const carbs = targets?.carbs || 250;
  const fats = targets?.fats || 60;

  const vegMeals = {
    breakfast: { name: 'Oats with Peanut Butter & Banana', foods: [
      { name: 'Oats', quantity: '50g', calories: 190, protein: 7, carbs: 34, fats: 3 },
      { name: 'Peanut Butter', quantity: '20g', calories: 120, protein: 5, carbs: 4, fats: 10 },
      { name: 'Banana', quantity: '1 medium', calories: 105, protein: 1, carbs: 27, fats: 0 },
      { name: 'Milk', quantity: '200ml', calories: 120, protein: 6, carbs: 10, fats: 6 },
    ]},
    lunch: { name: 'Rajma Rice with Curd', foods: [
      { name: 'Rice', quantity: '150g cooked', calories: 195, protein: 4, carbs: 45, fats: 0 },
      { name: 'Rajma', quantity: '100g cooked', calories: 127, protein: 9, carbs: 23, fats: 0 },
      { name: 'Curd', quantity: '100g', calories: 60, protein: 3, carbs: 5, fats: 3 },
      { name: 'Mixed Salad', quantity: '100g', calories: 20, protein: 1, carbs: 4, fats: 0 },
    ]},
    snack: { name: 'Sprouts Chaat with Paneer', foods: [
      { name: 'Sprouts', quantity: '100g', calories: 100, protein: 7, carbs: 17, fats: 1 },
      { name: 'Paneer', quantity: '50g', calories: 132, protein: 9, carbs: 2, fats: 10 },
    ]},
    dinner: { name: 'Paneer Bhurji with Roti', foods: [
      { name: 'Paneer', quantity: '100g', calories: 265, protein: 18, carbs: 4, fats: 20 },
      { name: 'Roti (Whole Wheat)', quantity: '2', calories: 240, protein: 8, carbs: 48, fats: 2 },
      { name: 'Mixed Vegetables', quantity: '100g', calories: 50, protein: 2, carbs: 10, fats: 0 },
    ]},
  };

  const nonVegMeals = {
    breakfast: { name: 'Egg Omelette with Toast & Banana', foods: [
      { name: 'Eggs', quantity: '3 whole', calories: 210, protein: 18, carbs: 2, fats: 15 },
      { name: 'Whole Wheat Toast', quantity: '2 slices', calories: 160, protein: 6, carbs: 28, fats: 2 },
      { name: 'Banana', quantity: '1 medium', calories: 105, protein: 1, carbs: 27, fats: 0 },
    ]},
    lunch: { name: 'Chicken Rice Bowl', foods: [
      { name: 'Chicken Breast', quantity: '150g', calories: 165, protein: 31, carbs: 0, fats: 4 },
      { name: 'Rice', quantity: '150g cooked', calories: 195, protein: 4, carbs: 45, fats: 0 },
      { name: 'Dal', quantity: '100g cooked', calories: 120, protein: 9, carbs: 20, fats: 1 },
      { name: 'Mixed Salad', quantity: '100g', calories: 20, protein: 1, carbs: 4, fats: 0 },
    ]},
    snack: { name: 'Peanut Butter Sandwich & Milk', foods: [
      { name: 'Whole Wheat Bread', quantity: '2 slices', calories: 160, protein: 6, carbs: 28, fats: 2 },
      { name: 'Peanut Butter', quantity: '30g', calories: 180, protein: 7, carbs: 6, fats: 15 },
      { name: 'Milk', quantity: '200ml', calories: 120, protein: 6, carbs: 10, fats: 6 },
    ]},
    dinner: { name: 'Chicken Curry with Roti', foods: [
      { name: 'Chicken Curry', quantity: '200g', calories: 260, protein: 28, carbs: 8, fats: 14 },
      { name: 'Roti (Whole Wheat)', quantity: '2', calories: 240, protein: 8, carbs: 48, fats: 2 },
      { name: 'Raita', quantity: '100g', calories: 55, protein: 3, carbs: 5, fats: 3 },
    ]},
  };

  const baseMeals = ['veg', 'vegan'].includes(dietType) ? vegMeals : nonVegMeals;
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return {
    meals: dayNames.map(day => ({
      day,
      meals: [
        { type: 'breakfast', ...baseMeals.breakfast },
        { type: 'lunch', ...baseMeals.lunch },
        { type: 'snack', ...baseMeals.snack },
        { type: 'dinner', ...baseMeals.dinner },
      ],
    })),
    grocery: _buildGroceryFromMeals(baseMeals),
  };
}

function _buildGroceryFromMeals(meals) {
  const allFoods = new Map();
  for (const meal of Object.values(meals)) {
    for (const food of meal.foods) {
      if (!allFoods.has(food.name)) {
        allFoods.set(food.name, { name: food.name, weeklyQuantity: food.quantity, category: 'grocery' });
      }
    }
  }
  return Array.from(allFoods.values());
}

// ═══ RECOVERY FALLBACK ═══

const RECOVERY_FALLBACK = {
  sleepTarget: 8,
  hydrationTarget: 3.0,
  recoveryDays: ['sunday'],
  mobilityPlan: [
    { day: 'daily', exercises: [
      { name: 'Foam Rolling', duration: 5, targetArea: 'full_body' },
      { name: 'Cat-Cow Stretch', duration: 2, targetArea: 'lower_back' },
      { name: 'Hip Flexor Stretch', duration: 2, targetArea: 'hips' },
      { name: 'Shoulder Dislocates', duration: 2, targetArea: 'shoulder' },
      { name: 'Deep Breathing', duration: 3, targetArea: 'recovery' },
    ]},
  ],
  stressManagement: {
    techniques: ['Deep breathing (5 min)', 'Screen-free hour before bed', 'Light walking'],
    dailyMindfulness: 10,
  },
};

// ═══ EXPORTS ═══

export function getWorkoutFallback(splitType = 'push_pull_legs', trainingDays = 5) {
  if (trainingDays <= 3) return WORKOUT_FULLBODY;
  if (trainingDays <= 4) return WORKOUT_UPPER_LOWER;
  return WORKOUT_PPL_BEGINNER;
}

export function getDietFallback(targets, dietType, foodStyle) {
  return buildDietFallback(targets, dietType, foodStyle);
}

export function getRecoveryFallback(profile = {}) {
  const fallback = { ...RECOVERY_FALLBACK };
  if (profile.weight) {
    fallback.hydrationTarget = Math.round(profile.weight * 0.035 * 10) / 10;
  }
  if (profile.trainingDays >= 5) {
    fallback.sleepTarget = 8.5;
  }
  return fallback;
}
