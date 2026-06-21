import { GoogleGenAI } from '@google/genai';

class FitnessAI {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.client = apiKey ? new GoogleGenAI({ apiKey }) : null;
    this.model = 'gemini-2.5-flash';
  }

  async _generate(prompt) {
    if (!this.client) return null;
    const response = await this.client.models.generateContent({
      model: this.model,
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature: 0.3 },
    });
    return JSON.parse(response.text);
  }

  // ── Smart Workout Parsing ──
  async parseWorkout(text, exerciseCatalog = []) {
    if (!this.client) return null;
    try {
      const catalogNames = exerciseCatalog.map(e => e.name).join(', ');
      const prompt = `You are a fitness tracking AI assistant. Parse this natural language workout description into structured data.

User Input: "${text}"

Available exercises in our catalog: ${catalogNames || 'Use standard exercise names'}

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
    if (!this.client) return null;
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
    if (!this.client) return null;
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
    if (!this.client) return null;
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
    if (!this.client) return null;
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
    if (!this.client) return null;
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
    if (!this.client) return null;
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
}

export const fitnessAI = new FitnessAI();
