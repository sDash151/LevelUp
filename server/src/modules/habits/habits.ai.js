import { GoogleGenAI } from '@google/genai';

class HabitsAI {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.client = apiKey ? new GoogleGenAI({ apiKey }) : null;
    this.model = 'gemini-2.5-flash';
  }

  async _generate(prompt) {
    if (!this.client) return null;
    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      return JSON.parse(response.text);
    } catch (error) {
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
}

export const habitsAI = new HabitsAI();
