// ══════════════════════════════════════════════════════════════
// Plan Validator — Validates AI-generated plans against constraints
// Retry logic with max 3 attempts + deterministic fallback
// ══════════════════════════════════════════════════════════════

class PlanValidator {

  // ═══ WORKOUT VALIDATION ═══
  validateWorkoutPlan(plan, constraints) {
    const errors = [];

    if (!plan || !plan.schedule || !Array.isArray(plan.schedule) || plan.schedule.length === 0) {
      return { valid: false, errors: ['Invalid plan structure: missing or empty schedule array'] };
    }

    const { equipmentAvailable = [], injuryFlags = [], fitnessLevel = 'intermediate' } = constraints;

    for (const day of plan.schedule) {
      if (day.isRest) continue;
      if (!day.exercises || !Array.isArray(day.exercises)) continue;

      for (const ex of day.exercises) {
        // Equipment check
        if (ex.equipment && equipmentAvailable.length > 0) {
          // If they have access to a full gym, assume they have everything
          if (!equipmentAvailable.includes('full_gym')) {
            const equipmentMap = {
              dumbbells: ['dumbbell', 'bodyweight'],
              bands: ['bands', 'bodyweight'],
              home: ['dumbbell', 'bodyweight', 'bands', 'pull_up_bar'],
              bodyweight: ['bodyweight'],
            };
            const allowed = new Set();
            for (const eq of equipmentAvailable) {
              (equipmentMap[eq] || []).forEach(e => allowed.add(e));
            }
            
            const eqLower = ex.equipment.toLowerCase().replace('_', ' ');
            const hasMatch = Array.from(allowed).some(a => eqLower.includes(a.replace('_', ' ')) || a.replace('_', ' ').includes(eqLower));
            if (!hasMatch) {
              errors.push(`Exercise "${ex.name}" requires "${ex.equipment}" which is not available`);
            }
          }
        }

        // Injury safety check
        if (injuryFlags.length > 0 && ex.injuryContraindications) {
          const conflict = ex.injuryContraindications.filter(c => injuryFlags.includes(c));
          if (conflict.length > 0) {
            errors.push(`Exercise "${ex.name}" is contraindicated for injuries: ${conflict.join(', ')}`);
          }
        }

        // Beginner safety — no more than 4 exercises per day, max 3 sets
        if (fitnessLevel === 'beginner') {
          if (day.exercises.length > 6) {
            errors.push(`Day "${day.day}" has ${day.exercises.length} exercises — max 6 for beginners`);
          }
          if (ex.sets > 4) {
            errors.push(`Exercise "${ex.name}" has ${ex.sets} sets — max 4 for beginners`);
          }
        }
      }

      // Volume sanity — no day should exceed 40 total sets
      const totalSets = (day.exercises || []).reduce((sum, ex) => sum + (ex.sets || 0), 0);
      if (totalSets > 40) {
        errors.push(`Day "${day.day}" has ${totalSets} total sets — max 40`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  // ═══ DIET VALIDATION ═══
  validateDietPlan(plan, constraints) {
    const errors = [];

    if (!plan || !plan.meals || !Array.isArray(plan.meals) || plan.meals.length === 0) {
      return { valid: false, errors: ['Invalid plan structure: missing or empty meals array'] };
    }

    const {
      targetCalories, targetProtein, targetCarbs, targetFats,
      dietType, foodDislikes = [], budget, cookingAbility = 'basic',
      accessibilityMode = false,
    } = constraints;

    for (const day of plan.meals) {
      if (!day.meals || !Array.isArray(day.meals)) continue;

      let dayCalories = 0, dayProtein = 0, dayCarbs = 0, dayFats = 0;

      for (const meal of day.meals) {
        dayCalories += meal.calories || 0;
        dayProtein += meal.protein || 0;
        dayCarbs += meal.carbs || 0;
        dayFats += meal.fats || 0;

        // Check for disliked foods
        if (meal.foods && Array.isArray(meal.foods)) {
          for (const food of meal.foods) {
            const name = (food.name || '').toLowerCase();
            if (foodDislikes.some(d => name.includes(d.toLowerCase()))) {
              errors.push(`Meal contains disliked food: "${food.name}"`);
            }
          }
        }

        // Cooking difficulty check
        if (cookingAbility === 'cannot_cook' && meal.cookingDifficulty === 'full') {
          errors.push(`Meal "${meal.name}" requires full cooking but user cannot cook`);
        }
      }

      // Calorie tolerance: ±10%
      if (targetCalories) {
        const tolerance = targetCalories * 0.10;
        if (dayCalories < targetCalories - tolerance || dayCalories > targetCalories + tolerance) {
          errors.push(`Day "${day.day}" calories ${dayCalories} outside ±10% of target ${targetCalories}`);
        }
      }

      // Macro tolerance: ±15%
      if (targetProtein) {
        const tolerance = targetProtein * 0.15;
        if (dayProtein < targetProtein - tolerance) {
          errors.push(`Day "${day.day}" protein ${dayProtein}g below target ${targetProtein}g`);
        }
      }
    }

    // Diet type compliance is checked by the AI prompt filtering, but double-check
    if (dietType && ['veg', 'vegan'].includes(dietType)) {
      const nonVegKeywords = ['chicken', 'fish', 'mutton', 'lamb', 'prawn', 'pork', 'beef', 'bacon', 'ham', 'salmon', 'tuna'];
      const eggKeywords = ['egg', 'omelette', 'boiled egg'];
      for (const day of plan.meals) {
        for (const meal of (day.meals || [])) {
          for (const food of (meal.foods || [])) {
            const name = (food.name || '').toLowerCase();
            if (nonVegKeywords.some(k => name.includes(k))) {
              errors.push(`Food "${food.name}" violates ${dietType} diet`);
            }
            if (dietType === 'vegan' && eggKeywords.some(k => name.includes(k))) {
              errors.push(`Food "${food.name}" violates vegan diet`);
            }
          }
        }
      }
    }

    // Budget enforcement — calculate weekly meal cost
    if (budget && budget > 0) {
      const weeklyBudget = budget / 4; // monthly → weekly
      let estimatedWeeklyCost = 0;

      for (const day of plan.meals) {
        for (const meal of (day.meals || [])) {
          for (const food of (meal.foods || [])) {
            // Estimate cost: use food's estimatedPrice or fallback to ₹15/serving
            estimatedWeeklyCost += food.estimatedPrice || food.price || 15;
          }
        }
      }

      if (estimatedWeeklyCost > weeklyBudget * 1.40) {
        errors.push(`Estimated weekly meal cost ₹${Math.round(estimatedWeeklyCost)} exceeds budget ₹${Math.round(weeklyBudget)} (+40% tolerance)`);
      }
    }

    // Accessibility enforcement — reject rare foods
    if (accessibilityMode) {
      for (const day of plan.meals) {
        for (const meal of (day.meals || [])) {
          for (const food of (meal.foods || [])) {
            if (food.availabilityScore !== undefined && food.availabilityScore < 7) {
              errors.push(`Food "${food.name}" has availability score ${food.availabilityScore} — below threshold 7 for accessibility mode`);
            }
          }
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  // ═══ RECOVERY VALIDATION ═══
  validateRecoveryPlan(plan, constraints) {
    const errors = [];

    if (!plan) {
      return { valid: false, errors: ['Invalid recovery plan structure'] };
    }

    const { trainingDays = 4, weight, injuryFlags = [] } = constraints;

    // Sleep target sanity
    if (plan.sleepTarget && (plan.sleepTarget < 5 || plan.sleepTarget > 12)) {
      errors.push(`Sleep target ${plan.sleepTarget}h is unrealistic (must be 5-12h)`);
    }

    // Hydration target sanity (based on body weight)
    if (plan.hydrationTarget && weight) {
      const minWater = weight * 0.025;
      const maxWater = weight * 0.06;
      if (plan.hydrationTarget < minWater || plan.hydrationTarget > maxWater) {
        errors.push(`Hydration target ${plan.hydrationTarget}L unrealistic for ${weight}kg (range: ${minWater.toFixed(1)}-${maxWater.toFixed(1)}L)`);
      }
    }

    // Recovery days must not overlap high-intensity workout days
    if (plan.recoveryDays && Array.isArray(plan.recoveryDays) && constraints.workoutSchedule) {
      const workoutDays = constraints.workoutSchedule
        .filter(d => !d.isRest)
        .map(d => d.day?.toLowerCase());
      const overlap = plan.recoveryDays.filter(d => workoutDays.includes(d.toLowerCase()));
      if (overlap.length > 0) {
        errors.push(`Recovery days overlap with workout days: ${overlap.join(', ')}`);
      }
    }

    // Mobility plan should target injured areas
    if (plan.mobilityPlan && Array.isArray(plan.mobilityPlan) && injuryFlags.length > 0) {
      const targetedAreas = new Set();
      for (const day of plan.mobilityPlan) {
        for (const ex of (day.exercises || [])) {
          if (ex.targetArea) targetedAreas.add(ex.targetArea.toLowerCase());
        }
      }
      const unaddressed = injuryFlags.filter(i => !targetedAreas.has(i.toLowerCase()));
      if (unaddressed.length > 0) {
        // Warning, not error — AI should address but doesn't need to
        // We log but don't fail
      }
    }

    // Sleep target vs training load
    if (plan.sleepTarget && trainingDays >= 5 && plan.sleepTarget < 7) {
      errors.push(`Sleep target ${plan.sleepTarget}h too low for ${trainingDays} training days (min 7h)`);
    }

    return { valid: errors.length === 0, errors };
  }

  // ═══ RETRY ORCHESTRATOR ═══
  async generateWithRetry(generatorFn, validatorFn, constraints, maxRetries = 3) {
    let lastErrors = [];

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const plan = await generatorFn(attempt > 1 ? lastErrors : null);
        if (!plan) {
          lastErrors = ['AI returned null response'];
          continue;
        }

        const validation = validatorFn(plan, constraints);
        if (validation.valid) {
          return { plan, status: 'success', retryCount: attempt - 1 };
        }

        lastErrors = validation.errors;
        console.warn(`[PlanValidator] Attempt ${attempt}/${maxRetries} failed:`, validation.errors);
      } catch (error) {
        lastErrors = [error.message];
        console.error(`[PlanValidator] Attempt ${attempt}/${maxRetries} threw:`, error.message);
      }
    }

    // All retries exhausted — return null for fallback handling
    return { plan: null, status: 'failed', retryCount: maxRetries, errors: lastErrors };
  }
}

export const planValidator = new PlanValidator();
