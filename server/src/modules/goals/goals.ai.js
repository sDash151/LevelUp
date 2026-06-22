import { GoogleGenAI } from '@google/genai';

class GoalsAI {
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
      console.error('GoalsAI generation failed:', error.message);
      return null;
    }
  }

  async generateGoalDetails({ title, description, category, timeframe }) {
    const prompt = `You are an expert productivity and goal-setting coach. 
A user wants to achieve the following goal:
Title: ${title}
${description ? `Description: ${description}` : ''}
${category ? `Category Hint: ${category}` : ''}
Timeframe: ${timeframe || '1 month'}

Based on the Title, generate a compelling, actionable Description (1-2 sentences), infer the best Category, and create exactly 4 to 5 chronological milestones.

The Category MUST be exactly one of: "HEALTH", "FITNESS", "LEARNING", "CAREER", "PERSONAL".

Return EXACTLY a JSON object with this schema:
{
  "description": "A generated inspiring description.",
  "category": "CAREER",
  "milestones": [
    "Research and select a tech stack",
    "Build the foundational database schema",
    "Develop the core frontend UI",
    "Integrate authentication and launch beta"
  ]
}

Return ONLY the JSON object, with no markdown formatting.`;

    return await this._generate(prompt);
  }
  async generateInsight(goals) {
    if (!goals || goals.length === 0) return null;

    const activeGoals = goals.filter(g => g.status !== 'COMPLETED');
    if (activeGoals.length === 0) return null;

    const prompt = `You are an expert strategic project manager.
Analyze the user's current active goals:

${JSON.stringify(activeGoals.map(g => ({
  title: g.title,
  category: g.category,
  progress: g.progress,
  status: g.status,
  daysLeft: Math.max(0, Math.ceil((new Date(g.endDate) - new Date()) / 86400000))
})))}

Generate a strategic execution insight. Identify what is going well and what needs attention (e.g. goals with low progress but few days left).
Return EXACTLY a JSON object with the following schema:
{
  "summary": "A strategic 2-sentence summary of their goal execution momentum.",
  "topTheme": "A 2-4 word focus theme (e.g. 'Sprint Execution', 'Momentum Building')",
  "recommendations": [
    "Actionable strategy 1 to unblock a specific stuck goal or maintain momentum",
    "Actionable strategy 2",
    "Actionable strategy 3"
  ]
}

Return ONLY the JSON object, with no markdown formatting.`;

    return await this._generate(prompt);
  }
}

export const goalsAI = new GoalsAI();
