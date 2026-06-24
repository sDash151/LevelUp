import { z } from 'zod';

export const logWorkoutSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    type: z.enum(['push', 'pull', 'legs', 'strength', 'hiit', 'swimming', 'calisthenics', 'cardio', 'yoga', 'mobility', 'sports']),
    muscleGroups: z.array(z.string()).optional(),
    duration: z.number().int().min(1).max(600),
    notes: z.string().max(1000).optional(),
    date: z.string().optional(),
    planDayId: z.string().optional(),
    exercises: z.array(z.object({
      name: z.string().min(1),
      muscleGroup: z.string().optional(),
      notes: z.string().optional(),
      sets: z.array(z.object({
        setNumber: z.number().int().optional(),
        reps: z.number().int().min(0).max(10000).optional(),
        weight: z.number().min(0).max(1000).optional(),
        duration: z.number().min(0).max(10000).optional(),
        distance: z.number().min(0).max(10000).optional(),
        isWarmup: z.boolean().optional().default(false),
      })).min(1),
    })).optional().default([]),
  }),
});

export const smartParseSchema = z.object({
  body: z.object({
    text: z.string().min(5).max(2000),
  }),
});

export const logFoodSchema = z.object({
  body: z.object({
    mealType: z.enum(['breakfast', 'lunch', 'pre_workout', 'dinner', 'snacks']),
    foodItems: z.array(z.object({
      name: z.string().min(1),
      quantity: z.string().optional(),
      calories: z.number().min(0),
      protein: z.number().min(0),
      carbs: z.number().min(0),
      fats: z.number().min(0),
      fiber: z.number().min(0).optional(),
      sugar: z.number().min(0).optional(),
      sodium: z.number().min(0).optional(),
    })).min(1),
    date: z.string().optional(),
    time: z.string().optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const updateWorkoutSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    type: z.enum(['push', 'pull', 'legs', 'strength', 'hiit', 'swimming', 'calisthenics', 'cardio', 'yoga', 'mobility', 'sports']),
    muscleGroups: z.array(z.string()).optional(),
    duration: z.number().int().min(1).max(600),
    notes: z.string().max(1000).optional(),
    date: z.string().optional(),
    planDayId: z.string().optional(),
    exercises: z.array(z.object({
      name: z.string().min(1),
      muscleGroup: z.string().optional(),
      notes: z.string().optional(),
      sets: z.array(z.object({
        setNumber: z.number().int().optional(),
        reps: z.number().int().min(0).max(10000).optional(),
        weight: z.number().min(0).max(1000).optional(),
        duration: z.number().min(0).max(10000).optional(),
        distance: z.number().min(0).max(10000).optional(),
        isWarmup: z.boolean().optional().default(false),
      })).min(1),
    })).optional().default([]),
  }),
});

export const updateMealSchema = z.object({
  body: z.object({
    mealType: z.enum(['breakfast', 'lunch', 'pre_workout', 'dinner', 'snacks']).optional(),
    foodItems: z.array(z.object({
      name: z.string().min(1),
      quantity: z.string().optional(),
      calories: z.number().min(0),
      protein: z.number().min(0),
      carbs: z.number().min(0),
      fats: z.number().min(0),
      fiber: z.number().min(0).optional(),
      sugar: z.number().min(0).optional(),
      sodium: z.number().min(0).optional(),
    })).min(1).optional(),
    date: z.string().optional(),
    time: z.string().optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const logWaterSchema = z.object({
  body: z.object({
    amount: z.number().min(-5).max(5).refine(val => val !== 0, { message: "Amount cannot be zero" }),
    date: z.string().optional(),
  }),
});

export const logMetricSchema = z.object({
  body: z.object({
    weight: z.number().min(20).max(300).optional(),
    bodyFat: z.number().min(1).max(60).optional(),
    muscleMass: z.number().min(10).max(200).optional(),
    date: z.string().optional(),
    notes: z.string().max(500).optional(),
  }).refine(data => data.weight || data.bodyFat || data.muscleMass, {
    message: 'At least one metric (weight, bodyFat, or muscleMass) is required',
  }),
});

export const logMeasurementSchema = z.object({
  body: z.object({
    chest: z.number().min(30).max(200).optional(),
    waist: z.number().min(30).max(200).optional(),
    arms: z.number().min(10).max(80).optional(),
    thighs: z.number().min(20).max(120).optional(),
    date: z.string().optional(),
  }).refine(data => data.chest || data.waist || data.arms || data.thighs, {
    message: 'At least one measurement is required',
  }),
});

export const profileSchema = z.object({
  body: z.object({
    height: z.number().min(50).max(300).optional(),
    weight: z.number().min(20).max(300).optional(),
    bodyFat: z.number().min(1).max(60).optional(),
    goal: z.enum(['strength', 'hypertrophy', 'cutting', 'endurance', 'general']).optional(),
    trainingDays: z.number().int().min(1).max(7).optional(),
    splitType: z.enum(['push_pull_legs', 'upper_lower', 'full_body', 'bro_split']).optional(),
    experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    dailyCalorieGoal: z.number().int().min(500).max(10000).optional(),
    dailyProteinGoal: z.number().int().min(10).max(500).optional(),
    dailyCarbsGoal: z.number().int().min(10).max(1000).optional(),
    dailyFatsGoal: z.number().int().min(10).max(500).optional(),
    dailyWaterGoal: z.number().min(0.5).max(10).optional(),
  }),
});

export const milestoneSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    type: z.enum(['weight', 'lift', 'body_fat', 'endurance']),
    targetValue: z.number().optional(),
    currentValue: z.number().optional(),
  }),
});

export const uploadPhotoSchema = z.object({
  body: z.object({
    publicId: z.string().optional(),
    secureUrl: z.string().optional(),
    url: z.string().optional(),
    base64String: z.string().optional(),
    caption: z.string().max(500).optional(),
    date: z.string().optional(),
  }),
});

// ══════════════════════════════════════════════════════════════
// AI MASTER PLANNER SCHEMAS
// ══════════════════════════════════════════════════════════════

export const generatePlanSchema = z.object({
  body: z.object({
    // Body metrics (optional if already in profile)
    weight: z.number().min(20).max(300).optional(),
    height: z.number().min(50).max(300).optional(),
    age: z.number().int().min(10).max(100).optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    // Goal & timeline
    goal: z.enum(['fat_loss', 'muscle_gain', 'recomp', 'strength', 'endurance', 'general', 'cutting', 'hypertrophy', 'maintenance']).optional(),
    timeline: z.enum(['4', '8', '12', 'flexible']).optional(),
    // Training
    experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    trainingDays: z.number().int().min(1).max(7).optional(),
    splitType: z.enum(['push_pull_legs', 'upper_lower', 'full_body', 'bro_split']).optional(),
    equipmentAvailable: z.array(z.enum(['full_gym', 'dumbbells', 'bands', 'home', 'bodyweight'])).optional(),
    injuryFlags: z.array(z.string().max(50)).optional(),
    // Diet
    dietType: z.enum(['veg', 'eggetarian', 'non_veg', 'vegan']).optional(),
    foodStyle: z.enum(['familiar', 'hybrid', 'mixed', 'bodybuilding']).optional(),
    budget: z.number().int().min(1000).max(100000).optional(),
    cookingAbility: z.enum(['cannot_cook', 'basic', 'full']).optional(),
    foodDislikes: z.array(z.string().max(50)).optional(),
    accessibilityMode: z.boolean().optional(),
    // Lifestyle
    lifestyle: z.enum(['student', 'desk_job', 'active_job', 'shift_worker']).optional(),
    supplements: z.array(z.enum(['none', 'whey', 'creatine'])).optional(),
    sleepHours: z.number().min(3).max(14).optional(),
    mealTiming: z.array(z.enum(['morning', 'afternoon', 'evening', 'night'])).optional(),
  }),
});

export const coachMessageSchema = z.object({
  body: z.object({
    text: z.string().min(3).max(2000),
    currentConstraints: z.any().optional(),
  }),
});

export const chatGenerateSchema = z.object({
  body: z.object({
    planType: z.enum(['workout', 'diet', 'recovery', 'transformation']).optional().default('transformation'),
    // All fields from generatePlanSchema are optional here too
    weight: z.number().min(20).max(300).optional(),
    height: z.number().min(50).max(300).optional(),
    age: z.number().int().min(10).max(100).optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    goal: z.enum(['fat_loss', 'muscle_gain', 'recomp', 'strength', 'endurance', 'general', 'cutting', 'hypertrophy', 'maintenance']).optional(),
    trainingDays: z.number().int().min(1).max(7).optional(),
    equipmentAvailable: z.array(z.string()).optional(),
    dietType: z.enum(['veg', 'eggetarian', 'non_veg', 'vegan']).optional(),
    timeline: z.string().optional(),
  }),
});

export const swapMealSchema = z.object({
  body: z.object({
    planId: z.string().min(1),
    day: z.string().min(1),
    mealType: z.enum(['breakfast', 'lunch', 'snack', 'dinner', 'pre_workout']),
  }),
});

export const swapExerciseSchema = z.object({
  body: z.object({
    planId: z.string().min(1),
    day: z.string().min(1),
    exerciseIndex: z.number().int().min(0).max(20),
    targetExerciseName: z.string().optional(),
  }),
});

