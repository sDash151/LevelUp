import { GoogleGenAI } from '@google/genai';

class HabitsAI {
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
      const isRateLimited = error.status === 429 || 
                            error.message?.includes('"code":429') || 
                            error.message?.includes('RESOURCE_EXHAUSTED') || 
                            error.message?.includes('Quota exceeded');
                            
      const isUnavailable = error.status === 503 ||
                            error.message?.includes('"code":503') ||
                            error.message?.includes('UNAVAILABLE') ||
                            error.message?.includes('experiencing high demand');

      if (isRateLimited && retries > 1) {
        console.warn(`API Key ${this.currentClientIndex + 1} rate limited. Rotating to next key...`);
        this.currentClientIndex = (this.currentClientIndex + 1) % this.clients.length;
        return this._generate(prompt, retries - 1);
      }
      
      if (isUnavailable && retries > 1) {
        console.warn(`Google Gemini API 503 Unavailable (High Demand). Retrying in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        return this._generate(prompt, retries - 1);
      }
      
      console.error('HabitsAI generation failed:', error.message);
      return null;
    }
  }

  async generateInsight(habits) {
    if (!habits || habits.length === 0) return null;

    const prompt = `You are an expert behavioral psychologist and productivity coach.
Analyze the user's current habits:

${JSON.stringify(habits.map(h => ({
  name: h.name,
  category: h.category,
  currentStreak: h.currentStreak,
  bestStreak: h.bestStreak,
  consistencyPct: h.consistencyPct
})))}

Generate a personalized insight about their habit building.
Return EXACTLY a JSON object with the following schema:
{
  "summary": "A short, encouraging 2-sentence summary of their habit consistency.",
  "topTheme": "A 2-4 word theme (e.g. 'Fitness Struggling', 'Consistent Learner')",
  "recommendations": [
    "Actionable tip 1 (e.g. Suggest habit stacking)",
    "Actionable tip 2 (e.g. Suggest a micro-habit to save a failing streak)",
    "Actionable tip 3"
  ]
}

Return ONLY the JSON object, with no markdown formatting.`;

    return await this._generate(prompt);
  }
  async generateHabitPlan(goal) {
    if (!goal) return null;

    const prompt = `You are an expert behavioral psychologist and productivity coach.
The user wants to achieve this major goal: "${goal}"

Suggest 3 to 5 highly effective, specific, and actionable habits that will help them reach this goal.
Return EXACTLY a JSON object with the following schema:
{
  "habits": [
    {
      "name": "Actionable Habit Name (max 40 chars)",
      "description": "Short explanation of why this helps (max 60 chars)",
      "category": "Must be exactly one of: general, mindfulness, fitness, learning, career, health",
      "color": "Must be exactly one of: #6366f1, #8b5cf6, #06b6d4, #10b981, #f59e0b, #ef4444, #ec4899, #f97316",
      "frequency": "Must be exactly one of: DAILY, WEEKLY, MONTHLY",
      "icon": "A lucide-react icon name in lowercase (e.g. book, dumbbell, brain, target, code, pen-tool)"
    }
  ]
}

Return ONLY the JSON object, with no markdown formatting. Ensure you provide diverse categories and colors if applicable.`;

    const res = await this._generate(prompt);
    return res?.habits || [];
  }
}

export const habitsAI = new HabitsAI();
