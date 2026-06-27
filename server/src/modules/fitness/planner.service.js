// ══════════════════════════════════════════════════════════════
// Planner Service — Master Orchestrator for Plan Generation
// Connects: ScientificEngine → AI → Validator → DB
// ══════════════════════════════════════════════════════════════

import fs from 'fs';
import path from 'path';
import { prisma } from '../../config/database.js';
import { scientificEngine } from './scientific-engine.js';
import { fitnessAI } from './fitness.ai.js';
import { planValidator } from './plan-validator.js';
import { getWorkoutFallback, getDietFallback, getRecoveryFallback } from './plan-fallbacks.js';

function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

class PlannerService {

  // ═══ CORE FLOW 1: WORKOUT PLAN ═══
  async generateWorkoutPlan(userId, params = {}) {
    const profile = await this._enrichWithProfile(userId, params);
    const targets = scientificEngine.computeFullTargets(profile);
    const exercises = await this._getFilteredExercises(profile);

    const constraints = {
      equipmentAvailable: profile.equipmentAvailable || ['full_gym'],
      injuryFlags: profile.injuryFlags || [],
      fitnessLevel: profile.experienceLevel || 'intermediate',
    };

    const result = await planValidator.generateWithRetry(
      async (prevErrors) => {
        const plan = await fitnessAI.generateWorkoutPlan({
          profile, targets, previousErrors: prevErrors,
        });
        if (plan) {
          await this._mapPlanToCatalog(plan, exercises);
        }
        return plan;
      },
      (plan) => planValidator.validateWorkoutPlan(plan, constraints),
      constraints,
    );

    let finalPlan;
    let status = result.status;

    if (result.plan) {
      finalPlan = result.plan;
    } else {
      // Fallback
      finalPlan = getWorkoutFallback(profile.splitType, profile.trainingDays);
      status = 'fallback';
    }

    // Version linkage — find previous active plan
    const previousWorkout = await prisma.workoutPlan.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    const nextVersion = previousWorkout ? previousWorkout.version + 1 : 1;
    const parentPlanId = previousWorkout?.id || null;

    // Deactivate old plans (never delete)
    await prisma.workoutPlan.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    // Save new plan with version chain
    const saved = await prisma.workoutPlan.create({
      data: {
        userId,
        name: finalPlan.name || 'AI Generated Plan',
        phase: finalPlan.phase || 'general',
        totalWeeks: finalPlan.totalWeeks || 8,
        schedule: finalPlan.schedule,
        equipmentAvailable: profile.equipmentAvailable || ['full_gym'],
        injuryFlags: profile.injuryFlags || [],
        progressionType: finalPlan.progressionType || 'linear',
        deloadWeek: finalPlan.deloadWeek || 4,
        weeklyOverloadRules: finalPlan.weeklyOverloadRules || null,
        fitnessLevel: profile.experienceLevel || 'intermediate',
        isActive: true,
        version: nextVersion,
        parentPlanId,
      },
    });

    // Log generation
    await this._logGeneration(userId, 'workout', profile, finalPlan, status, result.retryCount);

    return { plan: saved, status, retryCount: result.retryCount || 0 };
  }

  // ═══ CORE FLOW 2: DIET PLAN ═══
  async generateDietPlan(userId, params = {}) {
    const profile = await this._enrichWithProfile(userId, params);
    const targets = scientificEngine.computeFullTargets(profile);
    const foodCatalog = await this._getFilteredFoods(profile);

    const constraints = {
      targetCalories: targets.targetCalories,
      targetProtein: targets.protein,
      targetCarbs: targets.carbs,
      targetFats: targets.fats,
      dietType: profile.dietType,
      foodDislikes: profile.foodDislikes || [],
      budget: profile.budget,
      cookingAbility: profile.cookingAbility,
      accessibilityMode: profile.accessibilityMode,
    };

    const result = await planValidator.generateWithRetry(
      (prevErrors) => fitnessAI.generateDietPlan({
        profile, targets, foodCatalog, previousErrors: prevErrors,
      }),
      (plan) => planValidator.validateDietPlan(plan, constraints),
      constraints,
    );

    let finalPlan;
    let status = result.status;

    if (result.plan) {
      finalPlan = result.plan;
    } else {
      finalPlan = getDietFallback(targets, profile.dietType, profile.foodStyle);
      status = 'fallback';
    }

    // Version linkage — find previous active diet plan
    const previousDiet = await prisma.dietPlan.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    const nextDietVersion = previousDiet ? previousDiet.version + 1 : 1;
    const dietParentId = previousDiet?.id || null;

    // Deactivate old diet plans (never delete)
    await prisma.dietPlan.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    // Save new diet plan with version chain
    const saved = await prisma.dietPlan.create({
      data: {
        userId,
        goal: profile.goal || 'general',
        caloriesTarget: targets.targetCalories || 2000,
        proteinTarget: targets.protein || 150,
        carbTarget: targets.carbs || 250,
        fatTarget: targets.fats || 60,
        foodStyle: profile.foodStyle || 'hybrid',
        budget: profile.budget,
        accessibilityMode: profile.accessibilityMode || false,
        mealsJson: finalPlan.meals || finalPlan,
        groceryJson: finalPlan.grocery || null,
        isActive: true,
        version: nextDietVersion,
        parentPlanId: dietParentId,
      },
    });

    // Update profile macros
    await prisma.fitnessProfile.update({
      where: { userId },
      data: {
        dailyCalorieGoal: targets.targetCalories,
        dailyProteinGoal: targets.protein,
        dailyCarbsGoal: targets.carbs,
        dailyFatsGoal: targets.fats,
      },
    });

    await this._logGeneration(userId, 'diet', profile, finalPlan, status, result.retryCount);

    return { plan: saved, status, retryCount: result.retryCount || 0 };
  }

  // ═══ CORE FLOW 3: RECOVERY PLAN ═══
  async generateRecoveryPlan(userId, params = {}) {
    const profile = await this._enrichWithProfile(userId, params);
    const targets = scientificEngine.computeFullTargets(profile);

    // Get active workout schedule for overlap validation
    const activeWorkout = await prisma.workoutPlan.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    const workoutSchedule = activeWorkout?.schedule || [];

    const constraints = {
      trainingDays: profile.trainingDays,
      weight: profile.weight,
      injuryFlags: profile.injuryFlags || [],
      workoutSchedule,
    };

    const result = await planValidator.generateWithRetry(
      (prevErrors) => fitnessAI.generateRecoveryPlan({
        profile, targets, workoutSchedule, previousErrors: prevErrors,
      }),
      (plan) => planValidator.validateRecoveryPlan(plan, constraints),
      constraints,
    );

    let finalPlan;
    let status = result.status;

    if (result.plan) {
      finalPlan = result.plan;
    } else {
      finalPlan = getRecoveryFallback(profile);
      status = 'fallback';
    }

    // Version linkage — find previous active recovery plan
    const previousRecovery = await prisma.recoveryPlan.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    const nextRecVersion = previousRecovery ? previousRecovery.version + 1 : 1;
    const recParentId = previousRecovery?.id || null;

    // Deactivate old recovery plans (never delete)
    await prisma.recoveryPlan.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    const saved = await prisma.recoveryPlan.create({
      data: {
        userId,
        sleepTarget: finalPlan.sleepTarget || targets.sleepTarget,
        hydrationTarget: finalPlan.hydrationTarget || targets.waterTarget,
        mobilityPlan: finalPlan.mobilityPlan || null,
        recoveryDays: finalPlan.recoveryDays || ['sunday'],
        stressManagement: finalPlan.stressManagement || null,
        isActive: true,
        version: nextRecVersion,
        parentPlanId: recParentId,
      },
    });

    await this._logGeneration(userId, 'recovery', profile, finalPlan, status, result.retryCount);

    return { plan: saved, status, retryCount: result.retryCount || 0 };
  }

  // ═══ CORE FLOW 4: FULL TRANSFORMATION ═══
  async generateTransformationPlan(userId, params = {}) {
    const [workout, diet, recovery] = await Promise.all([
      this.generateWorkoutPlan(userId, params),
      this.generateDietPlan(userId, params),
      this.generateRecoveryPlan(userId, params),
    ]);

    return { workout, diet, recovery };
  }

  // ═══ COACH CHAT ═══
  async parseCoachMessage(userId, text, currentConstraints = {}) {
    const profile = await this._getProfile(userId);
    const combinedProfile = { ...(profile || {}), ...(currentConstraints || {}) };
    const result = await fitnessAI.parseCoachIntent(text, combinedProfile);
    return result;
  }

  async generateFromChat(userId, params) {
    const planType = params.planType || 'transformation';
    if (planType === 'workout') return this.generateWorkoutPlan(userId, params);
    if (planType === 'diet') return this.generateDietPlan(userId, params);
    if (planType === 'recovery') return this.generateRecoveryPlan(userId, params);
    return this.generateTransformationPlan(userId, params);
  }

  // ═══ SMART SWAPS ═══
  async swapMeal(userId, planId, day, mealType) {
    const plan = await prisma.dietPlan.findFirst({ where: { id: planId, userId } });
    if (!plan) throw new Error('Diet plan not found');

    const profile = await this._enrichWithProfile(userId);
    const targets = scientificEngine.computeFullTargets(profile);
    const foodCatalog = await this._getFilteredFoods(profile);

    // Get the specific meal to swap
    const meals = plan.mealsJson;
    const dayIndex = meals.findIndex(d => d.day.toLowerCase() === day.toLowerCase());
    if (dayIndex === -1) throw new Error('Day not found');

    const mealIndex = meals[dayIndex].meals.findIndex(m => m.type === mealType);
    if (mealIndex === -1) throw new Error('Meal type not found');

    const currentMeal = meals[dayIndex].meals[mealIndex];

    // Generate a single replacement meal via AI
    const replacement = await fitnessAI.generateDietPlan({
      profile, targets, foodCatalog,
      previousErrors: [`Generate ONLY a single ${mealType} meal replacement for ${day}. The current meal "${currentMeal.name}" needs to be swapped. Keep same approximate calories (${currentMeal.calories}).`],
    });

    if (replacement?.meals?.[0]?.meals?.[0]) {
      meals[dayIndex].meals[mealIndex] = replacement.meals[0].meals[0];
      meals[dayIndex].meals[mealIndex].type = mealType;

      await prisma.dietPlan.update({
        where: { id: planId },
        data: { mealsJson: meals },
      });
    }

    return { meals, swapped: mealType, day };
  }

  async swapExercise(userId, planId, day, exerciseIndex, targetExerciseName, reason) {
    const plan = await prisma.workoutPlan.findFirst({ where: { id: planId, userId } });
    if (!plan) throw new Error('Workout plan not found');

    const profile = await this._enrichWithProfile(userId);
    const exercises = await this._getFilteredExercises(profile);
    const schedule = plan.schedule;

    const dayObj = schedule.find(d => d.day.toLowerCase() === day.toLowerCase());
    if (!dayObj || dayObj.isRest) throw new Error('Day not found or is rest day');

    const currentExercise = dayObj.exercises[exerciseIndex];
    if (!currentExercise) throw new Error('Exercise index invalid');

    let alt = null;
    if (targetExerciseName) {
      alt = exercises.find(e => e.name === targetExerciseName);
    } 
    
    if (!alt) {
      // Deep AI Swap
      const suggestedName = await fitnessAI.generateSwap(
        currentExercise.name,
        currentExercise.muscleGroup,
        dayObj.type,
        reason
      );
      
      if (suggestedName) {
        try {
          const embsPath = path.resolve(process.cwd(), 'src', 'data', 'exercise_embeddings.json');
          if (fs.existsSync(embsPath)) {
            const embeddings = JSON.parse(fs.readFileSync(embsPath, 'utf8'));
            const userVector = await fitnessAI.generateEmbedding(suggestedName);
            
            if (userVector) {
              let bestScore = -1;
              for (const ex of exercises) {
                if (ex.name.toLowerCase() === currentExercise.name.toLowerCase()) continue;
                const catVec = embeddings[ex.slug];
                if (catVec) {
                  const score = cosineSimilarity(userVector, catVec);
                  if (score > bestScore) {
                    bestScore = score;
                    alt = ex;
                  }
                }
              }
              // If it's a terrible match, drop it
              if (bestScore < 0.5) alt = null;
            }
          }
        } catch (e) {
          console.warn("AI swap semantic match failed:", e.message);
        }
      }

      // Fallback
      if (!alt) {
        const alternatives = exercises.filter(e =>
          e.muscleGroup === currentExercise.muscleGroup &&
          e.name !== currentExercise.name
        );
        if (alternatives.length > 0) {
          alt = alternatives[Math.floor(Math.random() * alternatives.length)];
        }
      }
    }

    if (alt) {
      const newMuscleGroup = (alt.primaryMuscles && alt.primaryMuscles.length > 0) ? alt.primaryMuscles.join(',') : (alt.muscleGroup || currentExercise.muscleGroup);
      console.log(`[AI Manual Swap] Swapping "${currentExercise.name}" -> "${alt.name}". Updated muscleGroup to "${newMuscleGroup}"`);
      
      dayObj.exercises[exerciseIndex] = {
        ...currentExercise,
        name: alt.name,
        muscleGroup: newMuscleGroup,
        equipment: alt.equipmentType || currentExercise.equipment,
        notes: `Swapped from ${currentExercise.name}`,
      };

      await prisma.workoutPlan.update({
        where: { id: planId },
        data: { schedule },
      });
    }

    return { schedule, swapped: currentExercise.name, replacement: dayObj.exercises[exerciseIndex].name };
  }

  // ═══ ADHERENCE ENGINE ═══
  async getAdherenceScore(userId) {
    const now = new Date();
    const weekEnd = now;
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [workoutPlan, dietPlan, recoveryPlan, sessions, mealLogs, waterLogs, sleepLogs, recoveryLogs] = await Promise.all([
      prisma.workoutPlan.findFirst({ where: { userId, isActive: true }, orderBy: { createdAt: 'desc' } }),
      prisma.dietPlan.findFirst({ where: { userId, isActive: true }, orderBy: { createdAt: 'desc' } }),
      prisma.recoveryPlan.findFirst({ where: { userId, isActive: true }, orderBy: { createdAt: 'desc' } }),
      prisma.workoutSession.findMany({ where: { userId, date: { gte: weekStart, lte: weekEnd } } }),
      prisma.mealLog.findMany({ where: { userId, date: { gte: weekStart, lte: weekEnd } } }),
      prisma.waterLog.findMany({ where: { userId, createdAt: { gte: weekStart, lte: weekEnd } } }),
      prisma.sleepLog.findMany({ where: { userId, date: { gte: weekStart, lte: weekEnd } } }),
      prisma.recoveryLog.findMany({ where: { userId, date: { gte: weekStart, lte: weekEnd } } }),
    ]);

    // Workout adherence (35%)
    const plannedWorkouts = workoutPlan ?
      workoutPlan.schedule.filter(d => !d.isRest).length : 5; // 1 week
    const workoutScore = Math.min(100, (sessions.length / plannedWorkouts) * 100);

    // Meal adherence (30%) - Merging MealLogs and completionLogs
    let trackedMealsCount = mealLogs.length;
    if (dietPlan && dietPlan.completionLogs) {
      const { completed = [] } = dietPlan.completionLogs;
      trackedMealsCount += completed.filter(c => new Date(c.date) >= weekStart && new Date(c.date) <= weekEnd).length;
    }
    const plannedMeals = 4 * 7; // 4 meals × 7 days
    const mealScore = Math.min(100, (trackedMealsCount / plannedMeals) * 100);

    // Sleep adherence (15%) - Using actual SleepLogs
    let sleepScore = 0;
    if (sleepLogs.length > 0) {
      const avgSleep = sleepLogs.reduce((s, l) => s + l.hoursSlept, 0) / sleepLogs.length;
      sleepScore = avgSleep >= 7 ? 100 : avgSleep >= 6 ? 80 : avgSleep >= 5 ? 60 : 40;
    } else {
      const profile = await this._getProfile(userId);
      sleepScore = profile?.sleepHours >= 7 ? 80 : profile?.sleepHours >= 6 ? 60 : 40;
    }

    // Hydration adherence (10%)
    const dailyWaterTarget = recoveryPlan?.hydrationTarget || 3.0;
    const totalWater = waterLogs.reduce((sum, l) => sum + l.amount, 0);
    const avgDailyWater = totalWater / 7; // 7 days
    const hydrationScore = Math.min(100, (avgDailyWater / dailyWaterTarget) * 100);

    // Recovery adherence (10%) - Using RecoveryLogs
    let recoveryScore = 50;
    if (recoveryPlan) {
       const plannedRecoveryDays = recoveryPlan.recoveryDays?.length || 1;
       recoveryScore = Math.min(100, (recoveryLogs.length / plannedRecoveryDays) * 100);
       // Base score if plan exists but no logs yet
       if (recoveryScore === 0) recoveryScore = 70;
    }

    const totalScore = Math.round(
      workoutScore * 0.35 +
      mealScore * 0.30 +
      sleepScore * 0.15 +
      hydrationScore * 0.10 +
      recoveryScore * 0.10
    );

    // Persist
    const adherence = await prisma.adherenceScore.create({
      data: {
        userId,
        workoutScore: Math.round(workoutScore),
        mealScore: Math.round(mealScore),
        sleepScore: Math.round(sleepScore),
        hydrationScore: Math.round(hydrationScore),
        recoveryScore: Math.round(recoveryScore),
        totalScore,
        weekStart,
        weekEnd,
      },
    });

    return adherence;
  }

  // ═══ ADAPTIVE REVIEW (14-day) ═══
  async getAdaptiveReview(userId) {
    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Trend intelligence — use averages, not latest
    const [metrics14, metrics30, measures14, measures30, adherenceHistory, exercises14, exercises30] = await Promise.all([
      prisma.bodyMetric.findMany({ where: { userId, date: { gte: fourteenDaysAgo } }, orderBy: { date: 'asc' } }),
      prisma.bodyMetric.findMany({ where: { userId, date: { gte: thirtyDaysAgo } }, orderBy: { date: 'asc' } }),
      prisma.bodyMeasurement.findMany({ where: { userId, date: { gte: fourteenDaysAgo } }, orderBy: { date: 'asc' } }),
      prisma.bodyMeasurement.findMany({ where: { userId, date: { gte: thirtyDaysAgo } }, orderBy: { date: 'asc' } }),
      prisma.adherenceScore.findMany({ where: { userId, createdAt: { gte: thirtyDaysAgo } }, orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.exerciseLog.findMany({ where: { session: { userId }, createdAt: { gte: fourteenDaysAgo } }, include: { session: true } }),
      prisma.exerciseLog.findMany({ where: { session: { userId }, createdAt: { gte: thirtyDaysAgo, lt: fourteenDaysAgo } }, include: { session: true } })
    ]);

    // Body Composition Delta
    const avg14Weight = metrics14.length > 0 ? metrics14.reduce((s, m) => s + (m.weight || 0), 0) / metrics14.filter(m => m.weight).length : null;
    const avg30Weight = metrics30.length > 0 ? metrics30.reduce((s, m) => s + (m.weight || 0), 0) / metrics30.filter(m => m.weight).length : null;
    const weightDelta = avg14Weight && avg30Weight ? avg14Weight - avg30Weight : null;

    const avg14BodyFat = metrics14.length > 0 ? metrics14.reduce((s, m) => s + (m.bodyFat || 0), 0) / metrics14.filter(m => m.bodyFat).length : null;
    const avg30BodyFat = metrics30.length > 0 ? metrics30.reduce((s, m) => s + (m.bodyFat || 0), 0) / metrics30.filter(m => m.bodyFat).length : null;
    const bodyFatDelta = avg14BodyFat && avg30BodyFat ? avg14BodyFat - avg30BodyFat : null;

    const avg14Muscle = metrics14.length > 0 ? metrics14.reduce((s, m) => s + (m.muscleMass || 0), 0) / metrics14.filter(m => m.muscleMass).length : null;
    const avg30Muscle = metrics30.length > 0 ? metrics30.reduce((s, m) => s + (m.muscleMass || 0), 0) / metrics30.filter(m => m.muscleMass).length : null;
    const muscleMassDelta = avg14Muscle && avg30Muscle ? avg14Muscle - avg30Muscle : null;

    const avg14Waist = measures14.length > 0 ? measures14.reduce((s, m) => s + (m.waist || 0), 0) / measures14.filter(m => m.waist).length : null;
    const avg30Waist = measures30.length > 0 ? measures30.reduce((s, m) => s + (m.waist || 0), 0) / measures30.filter(m => m.waist).length : null;
    const waistDelta = avg14Waist && avg30Waist ? avg14Waist - avg30Waist : null;

    // Strength Delta
    const vol14 = exercises14.reduce((sum, ex) => sum + (ex.totalVolume || 0), 0);
    const vol30 = exercises30.reduce((sum, ex) => sum + (ex.totalVolume || 0), 0);
    const volumeDelta = vol30 > 0 ? ((vol14 - vol30) / vol30) * 100 : 0;
    
    const topLifts14 = exercises14.filter(ex => ex.bestSet).map(ex => ex.bestSet.weight || 0);
    const topLifts30 = exercises30.filter(ex => ex.bestSet).map(ex => ex.bestSet.weight || 0);
    const avgTopLift14 = topLifts14.length ? topLifts14.reduce((a,b)=>a+b,0)/topLifts14.length : 0;
    const avgTopLift30 = topLifts30.length ? topLifts30.reduce((a,b)=>a+b,0)/topLifts30.length : 0;
    const topLiftProgression = avgTopLift30 > 0 ? ((avgTopLift14 - avgTopLift30) / avgTopLift30) * 100 : 0;

    const reps14 = exercises14.reduce((sum, ex) => sum + (Array.isArray(ex.sets) ? ex.sets.reduce((s, set) => s + (set.reps || 0), 0) : 0), 0);
    const reps30 = exercises30.reduce((sum, ex) => sum + (Array.isArray(ex.sets) ? ex.sets.reduce((s, set) => s + (set.reps || 0), 0) : 0), 0);
    const repProgression = reps30 > 0 ? ((reps14 - reps30) / reps30) * 100 : 0;

    const currentAdherence = await this.getAdherenceScore(userId);

    return {
      trends: {
        avg14Weight: avg14Weight ? Math.round(avg14Weight * 10) / 10 : null,
        avg30Weight: avg30Weight ? Math.round(avg30Weight * 10) / 10 : null,
        weightDelta: weightDelta ? Math.round(weightDelta * 10) / 10 : null,
        bodyFatDelta: bodyFatDelta ? Math.round(bodyFatDelta * 10) / 10 : null,
        muscleMassDelta: muscleMassDelta ? Math.round(muscleMassDelta * 10) / 10 : null,
        waistDelta: waistDelta ? Math.round(waistDelta * 10) / 10 : null,
        volumeProgressionPercent: Math.round(volumeDelta),
        topLiftProgressionPercent: Math.round(topLiftProgression),
        repProgressionPercent: Math.round(repProgression),
      },
      adherence: currentAdherence,
      adherenceHistory: adherenceHistory.map(a => ({
        date: a.createdAt,
        weekStart: a.weekStart,
        weekEnd: a.weekEnd,
        total: a.totalScore,
        workout: a.workoutScore,
        meal: a.mealScore,
      })),
      metricsCount: metrics14.length,
    };
  }

  // ═══ GET ACTIVE PLANS ═══
  async getActivePlans(userId) {
    const [workout, diet, recovery] = await Promise.all([
      prisma.workoutPlan.findFirst({ where: { userId, isActive: true }, orderBy: { createdAt: 'desc' } }),
      prisma.dietPlan.findFirst({ where: { userId, isActive: true }, orderBy: { createdAt: 'desc' } }),
      prisma.recoveryPlan.findFirst({ where: { userId, isActive: true }, orderBy: { createdAt: 'desc' } }),
    ]);

    const profile = await this._getProfile(userId);
    const targets = profile ? scientificEngine.computeFullTargets(profile) : null;

    return { workout, diet, recovery, targets };
  }

  // ═══ GET PLAN HISTORY ═══
  async getPlanHistory(userId) {
    const [workouts, diets, recoveries] = await Promise.all([
      prisma.workoutPlan.findMany({ where: { userId, isActive: false }, orderBy: { createdAt: 'desc' } }),
      prisma.dietPlan.findMany({ where: { userId, isActive: false }, orderBy: { createdAt: 'desc' } }),
      prisma.recoveryPlan.findMany({ where: { userId, isActive: false }, orderBy: { createdAt: 'desc' } }),
    ]);

    return { workouts, diets, recoveries };
  }

  // ═══ HELPERS ═══

  async _getProfile(userId) {
    const profile = await prisma.fitnessProfile.findUnique({ 
      where: { userId },
      include: { user: { select: { dateOfBirth: true, gender: true } } }
    });
    if (!profile) return null;
    
    let age = null;
    if (profile.user?.dateOfBirth) {
      const diff = Date.now() - new Date(profile.user.dateOfBirth).getTime();
      age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
    }
    
    return {
      ...profile,
      age: age,
      gender: profile.user?.gender,
      user: undefined
    };
  }

  async _enrichWithProfile(userId, overrides = {}) {
    const profile = await this._getProfile(userId);
    if (!profile) throw new Error('Fitness profile not found. Please complete onboarding first.');

    return {
      ...profile,
      ...overrides,
      // Merge arrays — don't override, extend
      equipmentAvailable: overrides.equipmentAvailable || profile.equipmentAvailable || ['full_gym'],
      injuryFlags: overrides.injuryFlags || profile.injuryFlags || [],
      foodDislikes: overrides.foodDislikes || profile.foodDislikes || [],
      supplements: overrides.supplements || profile.supplements || [],
      mealTiming: overrides.mealTiming || profile.mealTiming || ['morning', 'afternoon', 'evening', 'night'],
    };
  }

  async _getFilteredExercises(profile) {
    const where = {};
    // Filter by equipment
    if (profile.equipmentAvailable && !profile.equipmentAvailable.includes('full_gym')) {
      where.equipmentType = { in: [...profile.equipmentAvailable, 'bodyweight', null] };
    }
    // Filter by difficulty for beginners
    if (profile.experienceLevel === 'beginner') {
      where.difficulty = { in: ['beginner', 'intermediate', null] };
    }

    return prisma.exerciseCatalog.findMany({ where });
  }

  async _getFilteredFoods(profile) {
    const where = {};
    // Filter by diet type
    if (profile.dietType) {
      where.dietType = { has: profile.dietType };
    }
    // Filter by cooking ability
    if (profile.cookingAbility === 'cannot_cook') {
      where.cookingDifficulty = { in: ['none', 'basic'] };
    }
    // Prioritize accessibility
    if (profile.accessibilityMode) {
      where.availabilityScore = { gte: 7 };
    }

    // ── RAG Food Retrieval ─────────────────────────────────────
    // Priority 1: Verified foods (USDA / INDB / manual — most accurate macros)
    const verifiedFoods = await prisma.foodCatalog.findMany({
      where: { ...where, isVerified: true },
      orderBy: [{ availabilityScore: 'desc' }, { name: 'asc' }],
      take: 30,
    });

    // Priority 2: Supplement with unverified foods to fill up to 40 total
    const remainingSlots = 40 - verifiedFoods.length;
    const verifiedIds = verifiedFoods.map(f => f.id);

    let supplementFoods = [];
    if (remainingSlots > 0) {
      supplementFoods = await prisma.foodCatalog.findMany({
        where: { ...where, id: { notIn: verifiedIds } },
        orderBy: [{ availabilityScore: 'desc' }],
        take: remainingSlots,
      });
    }

    // Verified foods first — Gemini will naturally prefer them
    return [...verifiedFoods, ...supplementFoods];
  }

  async _logGeneration(userId, planType, inputParams, outputPlan, status, retryCount) {
    try {
      await prisma.planGenerationLog.create({
        data: {
          userId,
          planType,
          inputParams: { goal: inputParams.goal, weight: inputParams.weight, trainingDays: inputParams.trainingDays },
          outputPlan: outputPlan ? { name: outputPlan.name, type: planType } : null,
          status,
          retryCount: retryCount || 0,
        },
      });
    } catch (err) {
      console.error('Failed to log plan generation:', err.message);
    }
  }

  async _mapPlanToCatalog(plan, allowedExercises) {
    if (!plan.schedule) return;

    let embeddings = null;
    try {
      const embsPath = path.resolve(process.cwd(), 'src', 'data', 'exercise_embeddings.json');
      if (fs.existsSync(embsPath)) {
        embeddings = JSON.parse(fs.readFileSync(embsPath, 'utf8'));
      }
    } catch (e) {
      console.warn("Could not load exercise embeddings for RAG mapping.", e.message);
      return;
    }

    if (!embeddings) return;

    console.log(`\n\n=== [DEBUG] SEMANTIC RAG MAPPING STARTED ===`);
    console.log(`Available Catalog Exercises to map against: ${allowedExercises.length}`);
    for (const day of plan.schedule) {
      if (day.isRest || !day.exercises) continue;
      
      for (const ex of day.exercises) {
        if (!ex.name) continue;

        // Generate embedding for AI's generic exercise name
        const userVector = await fitnessAI.generateEmbedding(ex.name);
        if (!userVector) continue;

        let bestScore = -1;
        let bestMatch = null;

        // Only map to exercises that passed the strict DB filters
        for (const catEx of allowedExercises) {
          const catVec = embeddings[catEx.slug];
          if (catVec) {
            const score = cosineSimilarity(userVector, catVec);
            if (score > bestScore) {
              bestScore = score;
              bestMatch = catEx;
            }
          }
        }

        // If we found a good semantic match, snap the AI's exercise to our catalog
        if (bestMatch && bestScore > 0.6) {
          console.log(`[RAG Match SUCCESS] AI: "${ex.name}" --> Catalog: "${bestMatch.name}" (Score: ${bestScore.toFixed(2)})`);
          ex.name = bestMatch.name;
          // Only overwrite equipment if it wasn't specified, or if we trust the catalog more
          // The validator will check the final plan.
          ex.equipment = bestMatch.equipmentType || ex.equipment;
          
          if (bestMatch.primaryMuscles && bestMatch.primaryMuscles.length > 0) {
            ex.muscleGroup = bestMatch.primaryMuscles.join(',');
            console.log(`  [Data Swap] Updated muscleGroup: "${ex.muscleGroup}" (from DB primaryMuscles)`);
          } else {
            ex.muscleGroup = bestMatch.muscleGroup || ex.muscleGroup;
            console.log(`  [Data Swap] Kept/Updated muscleGroup: "${ex.muscleGroup}"`);
          }
        } else {
          console.log(`[RAG Match FAILED] AI: "${ex.name}" --> No catalog match found > 0.6 (Best score: ${bestScore.toFixed(2)})`);
        }
      }
    }
    console.log(`============================================\n\n`);
  }
}

export const plannerService = new PlannerService();
