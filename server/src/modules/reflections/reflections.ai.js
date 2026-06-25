import { GoogleGenAI } from '@google/genai';

class ReflectionsAI {
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
