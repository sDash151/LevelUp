// ══════════════════════════════════════════════════════════════
// Scientific Engine — Pure Deterministic Calculations
// Gemini NEVER calculates. This module does ALL the math.
// ══════════════════════════════════════════════════════════════

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,       // desk_job, 0-1 training days
  lightly_active: 1.375, // desk_job, 2-3 training days
  moderately_active: 1.55, // student/desk_job, 4-5 training days
  very_active: 1.725,   // active_job or 5-6 training days
  extra_active: 1.9,    // active_job + 6-7 training days
};

const GOAL_CALORIE_ADJUSTMENTS = {
  fat_loss: -400,       // range: -300 to -500
  cutting: -400,
  muscle_gain: 300,     // range: +200 to +400
  hypertrophy: 300,
  recomp: -100,
  strength: 200,
  endurance: 100,
  maintenance: 0,
  general: 0,
};

const PROTEIN_PER_KG = {
  fat_loss: 2.0,    // range: 1.8-2.4
  cutting: 2.0,
  muscle_gain: 1.8, // range: 1.6-2.2
  hypertrophy: 1.8,
  recomp: 1.8,
  strength: 2.0,
  endurance: 1.4,
  maintenance: 1.4,
  general: 1.5,     // range: 1.2-1.8
};

class ScientificEngine {

  /**
   * BMR — Mifflin-St Jeor equation
   * Male:   10 × weight(kg) + 6.25 × height(cm) - 5 × age - (-5 → +5)
   * Female: 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161
   */
  calculateBMR({ weight, height, age, gender }) {
    if (!weight || !height || !age) return null;
    const base = 10 * weight + 6.25 * height - 5 * age;
    return Math.round(gender === 'female' ? base - 161 : base + 5);
  }

  /**
   * TDEE — Total Daily Energy Expenditure
   * BMR × activity multiplier (derived from lifestyle + trainingDays)
   */
  calculateTDEE(bmr, { trainingDays = 4, lifestyle = 'desk_job' } = {}) {
    if (!bmr) return null;
    const multiplier = this._getActivityMultiplier(trainingDays, lifestyle);
    return Math.round(bmr * multiplier);
  }

  /**
   * Goal-adjusted target calories
   */
  calculateTargetCalories(tdee, goal = 'general') {
    if (!tdee) return null;
    const adjustment = GOAL_CALORIE_ADJUSTMENTS[goal] ?? 0;
    const target = tdee + adjustment;
    // Safety: never below 1200 (women) or 1500 (men) — use 1200 as absolute floor
    return Math.max(1200, Math.round(target));
  }

  /**
   * Macronutrient breakdown
   * Protein: goal-specific g/kg
   * Fat: 0.8 g/kg
   * Carbs: remaining calories / 4
   */
  calculateMacros(targetCalories, weight, goal = 'general') {
    if (!targetCalories || !weight) return null;

    const proteinPerKg = PROTEIN_PER_KG[goal] ?? 1.5;
    const fatPerKg = 0.8;

    const protein = Math.round(proteinPerKg * weight);
    const fats = Math.round(fatPerKg * weight);

    // Calories from protein (4 cal/g) and fat (9 cal/g)
    const proteinCals = protein * 4;
    const fatCals = fats * 9;
    const remainingCals = Math.max(0, targetCalories - proteinCals - fatCals);
    const carbs = Math.round(remainingCals / 4);

    return { protein, carbs, fats };
  }

  /**
   * Daily water target in liters
   * Base: weight × 0.035 L
   * +0.5L for each training day above 3
   */
  calculateWaterTarget(weight, trainingDays = 4) {
    if (!weight) return 3.0;
    const base = weight * 0.035;
    const trainingBonus = Math.max(0, trainingDays - 3) * 0.5;
    return Math.round((base + trainingBonus) * 10) / 10; // 1 decimal
  }

  /**
   * Sleep target in hours
   * Base: 7.5h
   * +0.5 for muscle_gain/hypertrophy goals
   * +0.5 for >5 training days
   */
  calculateSleepTarget(trainingDays = 4, goal = 'general') {
    let base = 7.5;
    if (['muscle_gain', 'hypertrophy', 'strength'].includes(goal)) base += 0.5;
    if (trainingDays > 5) base += 0.5;
    return Math.min(9, base);
  }

  /**
   * Full profile computation — runs all calculations
   * Returns complete target set for AI plan generation
   */
  computeFullTargets(profile) {
    const { weight, height, age, gender, trainingDays, lifestyle, goal } = profile;

    const bmr = this.calculateBMR({ weight, height, age, gender }) || 1600; // Safe default
    const tdee = this.calculateTDEE(bmr, { trainingDays, lifestyle }) || 2000;
    const targetCalories = this.calculateTargetCalories(tdee, goal) || 2000;
    const macros = this.calculateMacros(targetCalories, weight || 70, goal); // Default weight 70kg for macros
    const waterTarget = this.calculateWaterTarget(weight || 70, trainingDays);
    const sleepTarget = this.calculateSleepTarget(trainingDays, goal);

    return {
      bmr,
      tdee,
      targetCalories,
      protein: macros?.protein ?? 150,
      carbs: macros?.carbs ?? 200,
      fats: macros?.fats ?? 60,
      waterTarget,
      sleepTarget,
      deficit: tdee ? targetCalories - tdee : 0,
      activityLevel: this._getActivityLevel(trainingDays, lifestyle),
    };
  }

  // ── Private helpers ──

  _getActivityMultiplier(trainingDays, lifestyle) {
    if (lifestyle === 'active_job' && trainingDays >= 6) return ACTIVITY_MULTIPLIERS.extra_active;
    if (lifestyle === 'active_job' || trainingDays >= 6) return ACTIVITY_MULTIPLIERS.very_active;
    if (trainingDays >= 4) return ACTIVITY_MULTIPLIERS.moderately_active;
    if (trainingDays >= 2) return ACTIVITY_MULTIPLIERS.lightly_active;
    return ACTIVITY_MULTIPLIERS.sedentary;
  }

  _getActivityLevel(trainingDays, lifestyle) {
    if (lifestyle === 'active_job' && trainingDays >= 6) return 'extra_active';
    if (lifestyle === 'active_job' || trainingDays >= 6) return 'very_active';
    if (trainingDays >= 4) return 'moderately_active';
    if (trainingDays >= 2) return 'lightly_active';
    return 'sedentary';
  }
}

export const scientificEngine = new ScientificEngine();
