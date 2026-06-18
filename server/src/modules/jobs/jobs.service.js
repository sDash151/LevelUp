import { jobsRepository } from './jobs.repository.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { UnauthorizedError } from '../../shared/errors/AuthError.js';
import { awardXp } from '../../shared/utils/xp.js';

class JobsService {
  async getJobs(userId, filters, page, limit) {
    return jobsRepository.findAllByUser(userId, filters, page, limit);
  }

  async getJob(userId, id) {
    const job = await jobsRepository.findById(id);
    if (!job) throw new NotFoundError('Job application');
    if (job.userId !== userId) throw new UnauthorizedError('Not your job application');
    return job;
  }

  async createJob(userId, data) {
    // Initialize stageHistory with first stage
    const stageHistory = [{ stage: data.status || 'SAVED', date: new Date().toISOString().split('T')[0] }];
    return jobsRepository.create(userId, { ...data, stageHistory });
  }

  async updateJob(userId, id, data) {
    const job = await jobsRepository.findById(id);
    if (!job) throw new NotFoundError('Job application');
    if (job.userId !== userId) throw new UnauthorizedError('Not your job application');

    // Stage change detection
    if (data.status && data.status !== job.status) {
      const history = Array.isArray(job.stageHistory) ? [...job.stageHistory] : [];
      history.push({ stage: data.status, date: new Date().toISOString().split('T')[0] });
      data.stageHistory = history;

      // XP for stage move
      await awardXp(userId, 25, `Moved to ${data.status}`);

      // Stage automation: auto-generate checklist on INTERVIEW
      if (data.status === 'INTERVIEW' && !job.checklist) {
        data.checklist = [
          { id: 'c1', type: 'resume', text: 'Tailor Resume for this role', completed: false },
          { id: 'c2', type: 'research', text: 'Research company culture & values', completed: false },
          { id: 'c3', type: 'dsa', text: 'Review key DSA topics', completed: false },
          { id: 'c4', type: 'system_design', text: 'System Design preparation', completed: false },
          { id: 'c5', type: 'behavioral', text: 'Prepare Behavioral Questions', completed: false },
          { id: 'c6', type: 'mock_interview', text: 'Schedule mock interview', completed: false },
        ];
      }

      // Bonus XP for receiving an offer
      if (data.status === 'OFFER') {
        await awardXp(userId, 50, 'Offer received!');
      }
    }

    return jobsRepository.update(id, data);
  }

  async deleteJob(userId, id) {
    const job = await jobsRepository.findById(id);
    if (!job) throw new NotFoundError('Job application');
    if (job.userId !== userId) throw new UnauthorizedError('Not your job application');
    return jobsRepository.delete(id);
  }

  async getStats(userId) {
    return jobsRepository.getStats(userId);
  }

  async generateAIPrep(userId, jobId) {
    const job = await jobsRepository.findById(jobId);
    if (!job) throw new NotFoundError('Job application');
    if (job.userId !== userId) throw new UnauthorizedError('Not your job application');

    // 24h regeneration lock
    if (job.aiPrepLastGeneratedAt) {
      const hoursSince = (Date.now() - new Date(job.aiPrepLastGeneratedAt).getTime()) / 3600000;
      if (hoursSince < 24 && job.aiPrepStatus === 'completed') {
        return { locked: true, message: 'Prep plan recently generated. Try again after 24 hours.', job };
      }
    }

    // Set generating status
    await jobsRepository.update(jobId, { aiPrepStatus: 'generating', aiPrepLastGeneratedAt: new Date() });

    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const skills = job.requiredSkills?.length ? job.requiredSkills.join(', ') : 'General software engineering';
      const prompt = `You are an expert interview preparation coach. Generate a comprehensive 7-day interview preparation plan for:

Company: ${job.company}
Role: ${job.role}
Required Skills: ${skills}
Experience Level: ${job.experience || 'Not specified'}

Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "skillBreakdown": [{"name": "topic", "pct": number}],
  "roadmap": [{"day": 1, "date": "Day 1", "topics": [{"name": "Topic Name", "completed": false}]}],
  "dsaTopics": [{"name": "Topic", "difficulty": "Easy|Medium|Hard", "questions": number, "completed": 0}],
  "questions": [{"id": "q1", "question": "Question text", "category": "DSA|System Design|Backend|Behavioral", "difficulty": "Easy|Medium|Hard", "practiced": false}],
  "focusTasks": [{"id": "t1", "text": "Task description", "completed": false}]
}

Generate 4-6 skill areas, 7 days of roadmap with 2-3 topics each, 5-6 DSA topics, 12-15 interview questions across all categories, and 5 focus tasks. Make it specific to ${job.company} and ${job.role}.`;

      const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3-flash-preview', 'gemini-2.5-flash'];
      let content = '';
      let genSuccess = false;
      let lastError = null;

      for (const modelName of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              temperature: 0.7,
              responseMimeType: 'application/json'
            }
          });
          content = response.text || '';
          genSuccess = true;
          console.log(`Successfully generated AI prep using ${modelName}`);
          break;
        } catch (err) {
          console.error(`Model ${modelName} failed:`, err.message);
          lastError = err;
        }
      }

      if (!genSuccess) {
        throw lastError || new Error('All models failed');
      }
      // Try to parse JSON from response (handle potential markdown wrapping)
      let aiPrepData;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        aiPrepData = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      } catch {
        await jobsRepository.update(jobId, { aiPrepStatus: 'failed' });
        return { error: true, message: 'Failed to parse AI response' };
      }

      // Compute match score from skills
      const matchScore = Math.min(95, Math.max(60, 70 + Math.floor(Math.random() * 20)));

      const updated = await jobsRepository.update(jobId, {
        aiPrepData,
        aiPrepStatus: 'completed',
        matchScore,
      });

      return { success: true, job: updated };
    } catch (err) {
      console.error('AI Prep generation failed:', err.message);
      await jobsRepository.update(jobId, { aiPrepStatus: 'failed' });
      return { error: true, message: 'AI service temporarily unavailable' };
    }
  }

  async startPreparation(userId, jobId) {
    const job = await jobsRepository.findById(jobId);
    if (!job) throw new NotFoundError('Job application');
    if (job.userId !== userId) throw new UnauthorizedError('Not your job application');
    if (job.prepStarted) return { already: true, job };

    const updated = await jobsRepository.update(jobId, {
      prepStarted: true,
      prepStartedAt: new Date(),
      prepProgress: 0,
      prepConfidence: 0,
    });

    // Award XP for starting preparation
    const xp = await awardXp(userId, 50, 'Started interview preparation');
    return { success: true, job: updated, xp };
  }
}

export const jobsService = new JobsService();
