import { GoogleGenAI } from '@google/genai';

class FitnessAI {
  constructor() {
    const keyString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
    this.keys = keyString ? keyString.split(',').map(k => k.trim()).filter(Boolean) : [];
    this.clients = this.keys.map(apiKey => new GoogleGenAI({ apiKey }));
    this.currentClientIndex = 0;
    this.model = 'gemini-2.5-flash';
  }

  async _generate(prompt, retries = this.clients.length) {
    if (this.clients.length === 0) return null;
    
    const client = this.clients[this.currentClientIndex];
    try {
      const response = await client.models.generateContent({
        model: this.model,
        contents: prompt,
        config: { responseMimeType: 'application/json', temperature: 0.3 },
      });
      return JSON.parse(response.text);
    } catch (error) {
      // The @google/genai SDK sometimes throws errors where the status is undefined but the message contains the 429 JSON
      const isRateLimited = error.status === 429 || 
                            error.message?.includes('"code":429') || 
                            error.message?.includes('RESOURCE_EXHAUSTED') || 
                            error.message?.includes('Quota exceeded');
                            
      const isUnavailable = error.status === 503 ||
                            error.message?.includes('"code":503') ||
                            error.message?.includes('UNAVAILABLE') ||
                            error.message?.includes('experiencing high demand');

      // If 429 quota exceeded and we have retries left (meaning we have other keys)
      if (isRateLimited && retries > 1) {
        console.warn(`API Key ${this.currentClientIndex + 1} rate limited. Rotating to next key...`);
        this.currentClientIndex = (this.currentClientIndex + 1) % this.clients.length;
        return this._generate(prompt, retries - 1); // Recursive retry with next key
      }
      
      // If 503 UNAVAILABLE, wait for 5 seconds and retry
      if (isUnavailable && retries > 1) {
        console.warn(`Google Gemini API 503 Unavailable (High Demand). Retrying in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        return this._generate(prompt, retries - 1);
      }
      
      throw error; // Rethrow if not a 429/503 or if we exhausted all keys
    }
  }

  // ── Smart Workout Parsing ──
  async parseWorkout(text, exerciseCatalog = []) {
    if (this.clients.length === 0) return null;
    try {
      const prompt = `You are a fitness tracking AI assistant. Parse this natural language workout description into structured data.

User Input: "${text}"

Use standard exercise names (e.g., "Barbell Bench Press", "Romanian Deadlift", "Triceps Pushdown").

Return a JSON object with EXACTLY this structure:
{
  "name": "string - workout session name (e.g. 'Push Day', 'Upper Body', 'Morning Run')",
  "type": "string - one of: strength, cardio, hiit, yoga, mobility, sports, push, pull, legs, swimming, calisthenics",
  "muscleGroups": ["string array - primary muscle groups: chest, back, legs, shoulders, arms, core, full_body"],
  "duration": "number - estimated total duration in minutes",
  "exercises": [
    {
      "name": "string - exercise name",
      "muscleGroup": "string - primary muscle group",
      "sets": [
        { "setNumber": 1, "reps": 12, "weight": 20, "duration": 0, "distance": 0, "isWarmup": false }
      ]
    }
  ]
}

RULES:
1. Match exercise names to the catalog when possible.
2. For strength exercises, use 'reps' and 'weight'. If weight is not mentioned, use 0 (bodyweight).
3. For cardio/HIIT exercises (running, walking, swimming), OMIT 'reps' and 'weight' and instead provide 'duration' (in minutes) and/or 'distance' (in km).
4. NEVER put minutes or seconds into the 'reps' field! If someone says "10 mins incline walk", that is duration: 10.
5. If sets are not mentioned, default to 1 set for cardio, 3 sets for strength.
6. Infer muscle groups from exercises.

Return ONLY the JSON object.`;

      return await this._generate(prompt);
    } catch (error) {
      console.error('FitnessAI.parseWorkout failed:', error.message);
      return null;
    }
  }

  // ── Smart Food Parsing ──
  async parseFood(text) {
    if (this.clients.length === 0) return null;
    try {
      const prompt = `You are a nutrition tracking AI assistant. Parse this natural language food description into structured data.

User Input: "${text}"

Return a JSON object with EXACTLY this structure:
{
  "items": [
    {
      "name": "string - food item name",
      "quantity": "string - amount (e.g. '200g', '2 pieces', '1 cup')",
      "calories": "number - estimated calories",
      "protein": "number - grams of protein",
      "carbs": "number - grams of carbs",
      "fats": "number - grams of fat"
    }
  ]
}

RULES:
1. Use standard nutritional data for common foods.
2. If quantity isn't specified, assume a standard serving size.
3. For Indian foods: roti ~120 cal (3g P, 20g C, 3g F), dal ~150 cal (9g P, 20g C, 4g F per cup), rice ~200 cal (4g P, 45g C, 0.5g F per cup).
4. For common foods: egg ~78 cal (6g P, 0.6g C, 5g F), chicken breast ~165 cal (31g P, 0g C, 3.6g F per 100g).
5. Be as accurate as possible with macro estimates.
6. Round to whole numbers.

Return ONLY the JSON object.`;

      return await this._generate(prompt);
    } catch (error) {
      console.error('FitnessAI.parseFood failed:', error.message);
      return null;
    }
  }

  // ── Overview Insight ──
  async generateOverviewInsight(data) {
    if (this.clients.length === 0) return null;
    try {
      const prompt = `You are an expert fitness coach AI. Analyze this user's fitness data and provide actionable insights.

Data:
- Workout streak: ${data.streak} days
- Sessions this week: ${data.sessionsThisWeek}/${data.targetSessions}
- Weekly volume: ${data.weeklyVolume} kg
- Weekly calories burned: ${data.weeklyCalories} kcal
- Active minutes: ${data.activeMinutes} mins
- Muscle group distribution: ${JSON.stringify(data.muscleBalance || {})}
- Recent nutrition: Calories ${data.avgCalories || 0}/${data.calorieGoal || 2100}, Protein ${data.avgProtein || 0}g/${data.proteinGoal || 150}g
- Body progress: Weight ${data.currentWeight || 'N/A'}kg, Body Fat ${data.bodyFat || 'N/A'}%

Return a JSON object:
{
  "title": "string - short encouraging title",
  "summary": "string - 2-3 sentence overview of current fitness status",
  "observations": ["string array - 2-3 key observations"],
  "weaknesses": ["string array - 1-2 areas to improve"],
  "recommendations": ["string array - 3-4 actionable recommendations"]
}

Be motivational but honest. Keep recommendations specific and actionable.
Return ONLY the JSON object.`;

      return await this._generate(prompt);
    } catch (error) {
      console.error('FitnessAI.generateOverviewInsight failed:', error.message);
      throw error;
    }
  }

  // ── Nutrition Insight ──
  async generateNutritionInsight(data) {
    if (this.clients.length === 0) return null;
    try {
      const prompt = `You are an expert nutrition coach AI. Analyze this user's nutrition data and provide insights.

Data:
- Today's intake: ${data.calories} cal, ${data.protein}g P, ${data.carbs}g C, ${data.fats}g F
- Goals: ${data.calorieGoal} cal, ${data.proteinGoal}g P, ${data.carbsGoal}g C, ${data.fatsGoal}g F
- Fiber: ${data.fiber || 0}g / 25g goal
- Water: ${data.water || 0}L / ${data.waterGoal || 3}L goal
- Top foods: ${JSON.stringify(data.topFoods || [])}

Return a JSON object:
{
  "summary": "string - 2-3 sentence nutrition analysis",
  "score": "number - nutrition score 0-100",
  "feedback": ["string array - 3-4 specific feedback points with checkmarks or areas to improve"],
  "recommendations": ["string array - 2-3 actionable nutrition tips"]
}

Return ONLY the JSON object.`;

      return await this._generate(prompt);
    } catch (error) {
      console.error('FitnessAI.generateNutritionInsight failed:', error.message);
      return null;
    }
  }

  // ── Progress Insight ──
  async generateProgressInsight(data) {
    if (this.clients.length === 0) return null;
    try {
      const prompt = `You are an expert fitness coach AI. Analyze this user's body transformation progress.

Data:
- Weight: ${data.currentWeight}kg → ${data.previousWeight}kg (${data.weightChange > 0 ? '+' : ''}${data.weightChange}kg over ${data.period})
- Body Fat: ${data.currentBF}% → ${data.previousBF}%
- Muscle Mass: ${data.currentMuscle}kg → ${data.previousMuscle}kg
- Measurements: Chest ${data.chest}cm, Waist ${data.waist}cm, Arms ${data.arms}cm, Thighs ${data.thighs}cm
- Strength progress: ${JSON.stringify(data.strengthProgress || [])}
- Goals: ${JSON.stringify(data.goals || [])}

Return a JSON object:
{
  "summary": "string - 2-3 sentence progress analysis",
  "observations": ["string array - 2-3 key observations"],
  "recommendations": ["string array - 3 actionable recommendations"],
  "nextGoal": {
    "title": "string - suggested next goal",
    "targetDate": "string - estimated target date",
    "description": "string - how to achieve it"
  }
}

Return ONLY the JSON object.`;

      return await this._generate(prompt);
    } catch (error) {
      console.error('FitnessAI.generateProgressInsight failed:', error.message);
      return null;
    }
  }

  // ── Plan Coach Tip ──
  async generatePlanTip(data) {
    if (this.clients.length === 0) return null;
    try {
      const prompt = `You are an expert fitness coach. Give a brief, contextual training tip.

Context:
- Current phase: ${data.phase}
- Week: ${data.weekNumber}/${data.totalWeeks}
- Plan adherence: ${data.adherence}%
- This week completed: ${data.completedSessions}/${data.targetSessions}
- Recent volume trend: ${data.volumeTrend || 'stable'}
- Focus areas: ${data.focusAreas?.join(', ') || 'general'}

Return a JSON object:
{
  "tip": "string - one concise, actionable coaching tip (max 100 chars)",
  "focusArea": "string - area this tip addresses"
}

Return ONLY the JSON object.`;

      return await this._generate(prompt);
    } catch (error) {
      console.error('FitnessAI.generatePlanTip failed:', error.message);
      return null;
    }
  }

  // ── Plan Optimization ──
  async optimizePlan(profile, history) {
    if (this.clients.length === 0) return null;
    try {
      const prompt = `You are an expert strength & conditioning coach. Create an optimized weekly workout plan.

User Profile:
- Goal: ${profile.goal}
- Experience: ${profile.experienceLevel}
- Training days: ${profile.trainingDays}/week
- Preferred split: ${profile.splitType}
- Current weight: ${profile.weight}kg

Recent Performance:
- Average volume/session: ${history.avgVolume}kg
- Top exercises: ${JSON.stringify(history.topExercises || [])}
- Weak muscle groups: ${JSON.stringify(history.weakMuscleGroups || [])}
- Current phase duration: ${history.phaseDuration || 'new'} weeks

Return a JSON object:
{
  "name": "string - plan name (e.g. 'Strength Building Phase')",
  "phase": "string - one of: strength_building, hypertrophy, cutting, recovery",
  "totalWeeks": "number - recommended duration (4-12 weeks)",
  "schedule": [
    {
      "day": "string - monday/tuesday/etc",
      "type": "string - 'Push Day', 'Pull Day', 'Leg Day', 'Upper Body', 'Lower Body', 'Rest Day', 'Active Recovery'",
      "muscleGroups": ["string array"],
      "isRest": false,
      "exercises": [
        {
          "name": "string - exercise name",
          "sets": "number",
          "reps": "string - e.g. '8-12' or '5'",
          "notes": "string - optional coaching notes"
        }
      ],
      "estimatedDuration": "number - minutes",
      "estimatedVolume": "number - kg"
    }
  ]
}

Create exactly 7 entries (Mon-Sun). Rest days should have isRest: true and empty exercises.
Return ONLY the JSON object.`;

      return await this._generate(prompt);
    } catch (error) {
      console.error('FitnessAI.optimizePlan failed:', error.message);
      return null;
    }
  }

  // ══════════════════════════════════════════════════════════════
  // AI MASTER PLANNER METHODS
  // ══════════════════════════════════════════════════════════════

  /**
   * Generate a full workout plan using pre-calculated targets
   * @param {Object} params - { profile, targets, exercises, previousErrors }
   */
  async generateWorkoutPlan({ profile, targets, exercises = [], previousErrors = null }) {
    if (this.clients.length === 0) return null;
    try {
      const exerciseList = exercises.map(e =>
        `${e.name} [${e.muscleGroup}] [${e.equipmentType || 'any'}] [${e.difficulty || 'intermediate'}]${e.injuryContraindications?.length ? ` AVOID IF: ${e.injuryContraindications.join(',')}` : ''}`
      ).join('\n');

      const prompt = `You are an elite fitness coach building a personalized workout plan for an Indian user.

USER PROFILE:
- Weight: ${profile.weight}kg, Height: ${profile.height}cm, Age: ${profile.age}, Gender: ${profile.gender}
- Goal: ${profile.goal}
- Experience: ${profile.experienceLevel || 'intermediate'}
- Training Days: ${profile.trainingDays}/week
- Split: ${profile.splitType || 'push_pull_legs'}
- Equipment: ${(profile.equipmentAvailable || ['full_gym']).join(', ')}
- Injuries: ${(profile.injuryFlags || []).join(', ') || 'None'}
- Sleep: ${profile.sleepHours || 7}h/night

PRE-CALCULATED TARGETS (DO NOT RECALCULATE):
- TDEE: ${targets.tdee} kcal
- Target Calories: ${targets.targetCalories} kcal
- Deficit/Surplus: ${targets.deficit} kcal

AVAILABLE EXERCISES (use ONLY these):
${exerciseList || 'Use standard gym exercises'}

${previousErrors ? `PREVIOUS ATTEMPT FAILED WITH THESE ERRORS — FIX THEM:\n${previousErrors.join('\n')}` : ''}

STRICT RULES:
1. Use ONLY equipment listed above
2. NEVER assign exercises contraindicated for listed injuries
3. Beginner: max 5 exercises/day, max 3 sets, lower weights
4. Rest days: 2 for beginners, 1-2 for intermediate, 1 for advanced
5. Include progressive overload notes
6. If sleep < 6h: reduce volume by 20%
7. Create exactly 7 days (Mon-Sun)

Return JSON:
{
  "name": "plan name",
  "phase": "strength_building|hypertrophy|cutting|recovery|general",
  "totalWeeks": 8,
  "progressionType": "linear|undulating|block",
  "deloadWeek": 4,
  "weeklyOverloadRules": {"compoundIncrement": 2.5, "isolationIncrement": 1.25},
  "schedule": [
    {
      "day": "monday",
      "type": "Push Day",
      "muscleGroups": ["chest", "shoulders", "triceps"],
      "isRest": false,
      "exercises": [
        {"name": "Bench Press", "sets": 4, "reps": 8, "rest": 90, "muscleGroup": "chest", "equipment": "barbell", "notes": "progressive overload note"}
      ],
      "estimatedDuration": 55,
      "estimatedVolume": 8000
    }
  ]
}`;

      return await this._generate(prompt);
    } catch (error) {
      console.error('FitnessAI.generateWorkoutPlan failed:', error.message);
      return null;
    }
  }

  /**
   * Generate a full diet plan using pre-calculated macro targets
   * @param {Object} params - { profile, targets, foodCatalog, previousErrors }
   */
  async generateDietPlan({ profile, targets, foodCatalog = [], previousErrors = null }) {
    if (this.clients.length === 0) return null;
    try {
      const foodList = foodCatalog.map(f =>
        `${f.name} [${f.category}] P:${f.protein}g C:${f.carbs}g F:${f.fats}g Cal:${f.calories} per 100g | ${f.priceTier} | ${f.cookingDifficulty} | ${f.dietType.join(',')}`
      ).join('\n');

      const foodStyleRatio = {
        familiar: '80% Indian staples, 20% fitness foods',
        hybrid: '50% Indian staples, 30% fitness foods, 20% global',
        mixed: '33% Indian, 33% fitness, 34% global',
        bodybuilding: '70% fitness foods, 20% Indian, 10% global',
      };

      const prompt = `You are an elite nutrition strategist building a personalized diet plan for an Indian user.

USER PROFILE:
- Weight: ${profile.weight}kg, Age: ${profile.age}, Gender: ${profile.gender}
- Goal: ${profile.goal}
- Diet Type: ${profile.dietType || 'non_veg'} (STRICT — NEVER violate this)
- Food Style: ${profile.foodStyle || 'hybrid'} → ${foodStyleRatio[profile.foodStyle || 'hybrid']}
- Cooking Ability: ${profile.cookingAbility || 'basic'}
- Budget: ₹${profile.budget || 8000}/month
- Food Dislikes: ${(profile.foodDislikes || []).join(', ') || 'None'} (NEVER include these)
- Supplements: ${(profile.supplements || []).join(', ') || 'None'}
- Accessibility Mode: ${profile.accessibilityMode ? 'YES — prioritize easily available foods' : 'No'}
- Meal Timings: ${(profile.mealTiming || ['morning', 'afternoon', 'evening', 'night']).join(', ')}

PRE-CALCULATED TARGETS (DO NOT RECALCULATE):
- Daily Calories: ${targets.targetCalories} kcal
- Protein: ${targets.protein}g
- Carbs: ${targets.carbs}g
- Fats: ${targets.fats}g

FOOD CATALOG (use ONLY foods from this list):
${foodList || 'Use standard Indian fitness foods'}

${previousErrors ? `PREVIOUS ATTEMPT FAILED — FIX:\n${previousErrors.join('\n')}` : ''}

STRICT RULES AND CRITICAL MATH INSTRUCTIONS (MOST IMPORTANT):
1. [CRITICAL] The TOTAL calories of all meals combined for EACH DAY MUST STRICTLY be between ${Math.round(targets.targetCalories * 0.9)} and ${Math.round(targets.targetCalories * 1.1)} kcal! Do the math!
2. [CRITICAL] The TOTAL protein of all meals combined for EACH DAY MUST STRICTLY be between ${Math.round(targets.protein * 0.85)} and ${Math.round(targets.protein * 1.15)}g!
3. NEVER include foods that violate diet type (${profile.dietType})
4. NEVER include disliked foods
5. If cooking ability is 'cannot_cook': only no-cook or basic prep meals
6. If accessibility mode: prioritize soybean, sprouts, chana, milk, paneer, peanuts, banana, sattu, eggs
7. Create 7 unique days (Monday-Sunday)
8. 4 meals per day: breakfast, lunch, snack, dinner

Return JSON:
{
  "meals": [
    {
      "day": "Monday",
      "meals": [
        {
          "type": "breakfast",
          "name": "Egg Omelette with Toast",
          "foods": [{"name": "Eggs", "quantity": "3 whole", "calories": 210, "protein": 18, "carbs": 2, "fats": 15}],
          "calories": 475,
          "protein": 25,
          "carbs": 57,
          "fats": 17
        }
      ]
    }
  ],
  "grocery": [
    {"name": "Eggs", "weeklyQuantity": "21", "unit": "pieces", "estimatedCost": 168, "category": "protein"}
  ]
}`;

      return await this._generate(prompt);
    } catch (error) {
      console.error('FitnessAI.generateDietPlan failed:', error.message);
      return null;
    }
  }

  /**
   * Generate recovery plan
   */
  async generateRecoveryPlan({ profile, targets, workoutSchedule = [], previousErrors = null }) {
    if (this.clients.length === 0) return null;
    try {
      const workoutDays = workoutSchedule.filter(d => !d.isRest).map(d => d.day).join(', ');
      const restDays = workoutSchedule.filter(d => d.isRest).map(d => d.day).join(', ');

      const prompt = `You are an elite recovery specialist building a personalized recovery plan.

USER PROFILE:
- Weight: ${profile.weight}kg, Age: ${profile.age}
- Goal: ${profile.goal}
- Training Days: ${workoutDays || 'Mon-Fri'}
- Rest Days: ${restDays || 'Sat-Sun'}
- Current Sleep: ${profile.sleepHours || 7}h
- Injuries: ${(profile.injuryFlags || []).join(', ') || 'None'}
- Experience: ${profile.experienceLevel || 'intermediate'}

PRE-CALCULATED TARGETS:
- Sleep Target: ${targets.sleepTarget}h
- Water Target: ${targets.waterTarget}L/day

${previousErrors ? `FIX THESE ERRORS:\n${previousErrors.join('\n')}` : ''}

RULES:
1. Recovery days must NOT overlap workout days
2. Mobility plan MUST target injured areas if any
3. Sleep target must be 5-12h
4. Hydration must be realistic for body weight
5. Include stress management for ${profile.lifestyle || 'desk_job'} lifestyle

Return JSON:
{
  "sleepTarget": 8,
  "hydrationTarget": 3.0,
  "recoveryDays": ["sunday"],
  "mobilityPlan": [
    {"day": "daily", "exercises": [{"name": "Foam Rolling", "duration": 5, "targetArea": "full_body"}]}
  ],
  "stressManagement": {
    "techniques": ["Deep breathing", "Screen-free hour before bed"],
    "dailyMindfulness": 10
  }
}`;

      return await this._generate(prompt);
    } catch (error) {
      console.error('FitnessAI.generateRecoveryPlan failed:', error.message);
      return null;
    }
  }

  /**
   * Generate complete transformation plan (workout + diet + recovery)
   */
  async generateTransformationPlan(params) {
    if (this.clients.length === 0) return null;
    try {
      const [workout, diet, recovery] = await Promise.all([
        this.generateWorkoutPlan(params),
        this.generateDietPlan(params),
        this.generateRecoveryPlan({ ...params, workoutSchedule: [] }),
      ]);
      return { workout, diet, recovery };
    } catch (error) {
      console.error('FitnessAI.generateTransformationPlan failed:', error.message);
      return null;
    }
  }

  /**
   * Parse free-text coach message and extract structured intent
   */
  async parseCoachIntent(text, existingProfile = {}) {
    if (this.clients.length === 0) return null;
    try {
      const knownFields = Object.entries(existingProfile)
        .filter(([_, v]) => v !== null && v !== undefined)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        .join('\n');

      const prompt = `You are an elite fitness coach. A user sent you a message. Extract ALL fitness-related parameters from their message.

USER MESSAGE: "${text}"

ALREADY KNOWN ABOUT USER:
${knownFields || 'Nothing yet'}

Extract what you can from the message. For anything you couldn't extract AND is not already known, list it as missing.

Required fields for plan generation:
- weight (kg), height (cm), age, gender
- goal (fat_loss, muscle_gain, recomp, strength, endurance, general)
- experienceLevel (beginner, intermediate, advanced)
- trainingDays (1-7)
- equipmentAvailable (full_gym, dumbbells, bands, home, bodyweight)
- dietType (veg, eggetarian, non_veg, vegan)
- timeline (4, 8, 12 weeks or flexible)

Optional but helpful:
- budget (monthly INR), injuries, foodDislikes, cookingAbility, lifestyle, supplements, sleepHours

Return JSON:
{
  "extracted": {
    "goal": "fat_loss",
    "weight": 75
  },
  "missing": ["height", "age", "gender", "trainingDays", "equipmentAvailable", "dietType"],
  "coachResponse": "Great! I can see you want to lose fat. To build your perfect plan, I need a few more details...",
  "readyToGenerate": false
}`;

      return await this._generate(prompt);
    } catch (error) {
      console.error('FitnessAI.parseCoachIntent failed:', error.message);
      return null;
    }
  }
}

export const fitnessAI = new FitnessAI();

