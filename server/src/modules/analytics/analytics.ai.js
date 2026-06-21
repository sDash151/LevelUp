/**
 * Analytics AI — Gemini-powered cross-module intelligence engine.
 * Handles: quick insights across all life areas, and human-friendly
 * explanations for deterministic predictions.
 */
import { GoogleGenAI } from '@google/genai';

class AnalyticsAI {
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
        config: { responseMimeType: 'application/json', temperature: 0.3 },
      });
      return JSON.parse(response.text);
    } catch (error) {
      console.error('AnalyticsAI error:', error.message);
      return null;
    }
  }

  // ══════════════════════════════════════════════
  // QUICK INSIGHTS
  // ══════════════════════════════════════════════

  async generateQuickInsights(analyticsData) {
    const scores = analyticsData.scores || {};
    const changes = analyticsData.changes || {};
    const streaks = analyticsData.streaks || {};
    const activity = analyticsData.recentActivity || {};

    const prompt = `You are a life performance analyst for a personal growth app called LevelUp. Analyze the user's scores across all life areas and generate 4 targeted insights.

MODULE SCORES (each out of 100):
- Mind (DSA/Learning): ${scores.mind ?? 'N/A'}
- Body (Fitness): ${scores.body ?? 'N/A'}
- Career (Jobs/Applications): ${scores.career ?? 'N/A'}
- Money (Finance): ${scores.money ?? 'N/A'}
- Discipline (Habits): ${scores.discipline ?? 'N/A'}
- Reflection (Journaling/Mood): ${scores.reflection ?? 'N/A'}

CHANGES FROM PREVIOUS PERIOD:
- Mind: ${changes.mind ?? 'N/A'}
- Body: ${changes.body ?? 'N/A'}
- Career: ${changes.career ?? 'N/A'}
- Money: ${changes.money ?? 'N/A'}
- Discipline: ${changes.discipline ?? 'N/A'}
- Reflection: ${changes.reflection ?? 'N/A'}

STREAK INFORMATION:
${JSON.stringify(streaks)}

RECENT ACTIVITY PATTERNS:
${JSON.stringify(activity)}

Return JSON with exactly 4 insights:
{
  "bestArea": {
    "area": "<area name>",
    "change": "<change like +22% or +5pts>",
    "detail": "<1 sentence on why this area is strongest and what the user is doing right>"
  },
  "focusArea": {
    "area": "<weakest or most declining area>",
    "change": "<change like -8% or -3pts>",
    "detail": "<1 sentence on why this area needs attention and what dropped>"
  },
  "hiddenPattern": {
    "detail": "<1 sentence revealing a non-obvious correlation or pattern across modules, e.g. timing patterns, consistency links, or cross-module effects>"
  },
  "opportunityZone": {
    "detail": "<1 sentence with a specific, actionable suggestion that references actual numbers, e.g. improving a specific area by X% to reach a target Life Score>"
  }
}

Rules:
- Reference actual scores and changes in your insights
- Be specific with numbers, not vague
- The hidden pattern should be genuinely insightful, not obvious
- The opportunity zone should be achievable and reference a concrete target
- Keep each detail to 1 concise sentence`;

    return this._generate(prompt);
  }

  // ══════════════════════════════════════════════
  // DETAILED ROI REPORT
  // ══════════════════════════════════════════════

  async generateDetailedROIReport(roiData) {
    const prompt = `You are a world-class life coach, financial advisor, and personal growth analyst. Write a highly personalized, deeply insightful, and beautifully formatted markdown report analyzing the user's "Life ROI" (Return on Investment) across their various life domains.

Here is their raw data:
${JSON.stringify(roiData, null, 2)}

Write a compelling, multi-paragraph markdown report that includes:
1.  **Executive Summary**: A punchy 2-sentence summary of their overall life investment efficiency.
2.  **Top Performing Investment**: Highlight the area (Fitness, Career, Finance, or Learning) where they are getting the best ROI. Explain *why* the data shows this. Use numbers.
3.  **Capital Sink / Optimization Opportunity**: Identify where they are spending the most (either time or money) with the lowest proportionate return. Provide a concrete, 1-paragraph strategy on how to pivot or optimize this investment.
4.  **The Hidden Multiplier**: Reveal a hidden synergy between two of their areas (e.g., "Your consistency in learning is clearly bleeding into your career prospects").

Formatting Rules:
- Output raw markdown text (not JSON).
- Do not use markdown code block syntax (like \`\`\`markdown) in your response, just return the raw text.
- Use bolding, bullet points, and headers to make it highly readable and scannable.
- Be direct, slightly analytical, and extremely encouraging.`;

    if (!this.client) return null;
    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
        config: { temperature: 0.4 }, // non-JSON text response
      });
      return response.text;
    } catch (error) {
      console.error('AnalyticsAI ROI Report error:', error.message);
      return null;
    }
  }

  // ══════════════════════════════════════════════
  // PREDICTION EXPLANATIONS
  // ══════════════════════════════════════════════

  async generatePredictionExplanations(predictions) {
    if (!predictions || predictions.length === 0) return null;

    const prompt = `You are a personal growth coach. The app has already calculated deterministic predictions for the user's goals. Your job is to add human-friendly explanations and actionable tips for each prediction.

PRE-CALCULATED PREDICTIONS:
${JSON.stringify(predictions, null, 2)}

For each prediction, add:
1. An "explanation" — a warm, specific 1-2 sentence explanation of what the prediction means in practical terms. Reference timeframes, rates, or milestones where available.
2. A "tip" — a concise, actionable suggestion to accelerate or maintain progress toward this prediction.

Return JSON:
{
  "predictions": [
    {
      "title": "<same title from input>",
      "targetDays": <same targetDays from input>,
      "progress": <same progress from input>,
      "explanation": "<1-2 sentence human-friendly explanation with specific context>",
      "tip": "<1 concise actionable tip>"
    }
  ]
}

Rules:
- Preserve all original fields (title, targetDays, progress) exactly as given
- Explanations should feel personal and encouraging, not robotic
- Tips should be specific and actionable, not generic advice
- Use Indian context where relevant (₹, SIP, etc.)
- Keep each explanation to 1-2 sentences max`;

    return this._generate(prompt);
  }
}

export const analyticsAI = new AnalyticsAI();
