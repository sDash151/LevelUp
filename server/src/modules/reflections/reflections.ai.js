import { GoogleGenAI } from '@google/genai';

class ReflectionsAI {
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
      console.error('ReflectionsAI generation failed:', error.message);
      return null;
    }
  }

  async generateInsight(reflections) {
    if (!reflections || reflections.length === 0) return null;

    const prompt = `You are an empathetic, insightful life coach and therapist.
Analyze the following recent journal entries/reflections from the user:

${JSON.stringify(reflections.map(r => ({
  date: r.date,
  mood: r.mood, // 1 to 5 scale (1=Rough, 5=Amazing)
  content: r.content,
  gratitude: r.gratitude,
  improvements: r.improvements,
  tags: r.tags
})))}

Generate a personalized weekly emotional insight based on this data.
Return EXACTLY a JSON object with the following schema:
{
  "summary": "A 2-3 sentence empathetic summary of their emotional week.",
  "topTheme": "A 2-4 word theme of the week (e.g. 'Overcoming Burnout', 'Consistent Growth')",
  "recommendations": [
    "Actionable tip 1",
    "Actionable tip 2",
    "Actionable tip 3"
  ]
}

Return ONLY the JSON object, with no markdown formatting.`;

    return await this._generate(prompt);
  }
}

export const reflectionsAI = new ReflectionsAI();
