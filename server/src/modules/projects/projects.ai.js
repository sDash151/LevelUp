import { GoogleGenAI } from '@google/genai';

class ProjectsAI {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.client = apiKey ? new GoogleGenAI({ apiKey }) : null;
    this.model = 'gemini-2.5-flash';
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  /**
   * Send a prompt to Gemini and parse the JSON response.
   * @param {string} prompt
   * @returns {Promise<any|null>}
   */
  async _generate(prompt) {
    if (!this.client) return null;
    const response = await this.client.models.generateContent({
      model: this.model,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    return JSON.parse(response.text);
  }

  // ── Public Methods ───────────────────────────────────────────────────────────

  /**
   * Analyze a project's architecture, scalability and resume readiness.
   * @param {object} project - { name, stack, description, metrics, tasks, learnings }
   * @returns {Promise<object|null>} Scores and qualitative feedback
   */
  async analyzeProject(project) {
    if (!this.client) return null;
    try {
      const prompt = `You are a senior software engineering mentor and technical recruiter.
Analyze this project and return a JSON object with EXACTLY these keys:

- architectureScore (0-10): How well-architected is this project?
- scalabilityScore (0-10): How scalable is the design and implementation?
- resumeScore (0-10): How impressive would this look on a resume?
- interviewScore (0-10): How useful is this for interview talking points?
- recruiterScore (0-10): How likely would a recruiter find this impressive?
- missingSkills (string[]): Skills this project should add
- strengths (string[]): Top strengths of the project
- weaknesses (string[]): Areas for improvement

Project Details:
- Name: ${project.name}
- Tech Stack: ${JSON.stringify(project.techStack || project.stack || [])}
- Description: ${project.description || 'No description'}
- Metrics: ${JSON.stringify(project.metrics || {})}
- Tasks: ${JSON.stringify((project.tasks || []).slice(0, 20))}
- Learnings: ${JSON.stringify((project.learnings || []).slice(0, 20))}

Return ONLY the JSON object, no markdown.`;

      return await this._generate(prompt);
    } catch (error) {
      console.error('ProjectsAI.analyzeProject failed:', error.message);
      return null;
    }
  }

  /**
   * Extract learnings from commit messages.
   * @param {Array<{message: string, sha: string, date: string}>} commits
   * @returns {Promise<Array<{title: string, description: string, type: string, tags: string[], impactScore: number}>|[]>}
   */
  async extractLearnings(commits) {
    if (!this.client) return [];
    try {
      const prompt = `You are a senior developer reviewing git commit history.
Analyze these commits and extract meaningful learnings.

Commits:
${JSON.stringify(commits.slice(0, 50))}

Return a JSON array where each element has:
- title (string): Short, descriptive title of the learning
- description (string): Detailed explanation of what was learned
- type (string): One of "BUG_FIX", "ARCHITECTURE", "PATTERN", "OPTIMIZATION", "FEATURE", "REFACTOR"
- tags (string[]): Relevant technology/concept tags
- impactScore (number 1-10): How impactful this learning is for career growth

Focus on:
1. Bugs found and how they were fixed
2. Architecture decisions made
3. Design patterns used
4. Performance optimisations
5. New technologies or techniques applied

Return ONLY the JSON array, no markdown.`;

      return (await this._generate(prompt)) || [];
    } catch (error) {
      console.error('ProjectsAI.extractLearnings failed:', error.message);
      return [];
    }
  }

  /**
   * Match projects against a job description.
   * @param {Array<{id: string, name: string, techStack: string[], description: string}>} projects
   * @param {string} jobDescription
   * @returns {Promise<Array<{projectId: string, matchScore: number, missingSkills: string[], recommendedImprovements: string[]}>|[]>}
   */
  async matchProjectsToJob(projects, jobDescription) {
    if (!this.client) return [];
    try {
      const projectSummaries = projects.map((p) => ({
        id: p.id,
        name: p.name,
        techStack: p.techStack || [],
        description: p.description || '',
      }));

      const prompt = `You are a technical recruiter evaluating project portfolios against a job posting.

Job Description:
${jobDescription}

Projects:
${JSON.stringify(projectSummaries)}

For each project, return a JSON array with objects containing:
- projectId (string): The project's id
- matchScore (number 0-100): How well the project matches the job requirements
- missingSkills (string[]): Skills required by the job that this project doesn't demonstrate
- recommendedImprovements (string[]): Specific things to add to make the project more relevant

Return ONLY the JSON array, no markdown.`;

      return (await this._generate(prompt)) || [];
    } catch (error) {
      console.error('ProjectsAI.matchProjectsToJob failed:', error.message);
      return [];
    }
  }

  /**
   * Review the entire project portfolio.
   * @param {Array<object>} projects - All user projects with metrics/intelligence
   * @returns {Promise<object|null>} Portfolio-level scores and insights
   */
  async getPortfolioReview(projects) {
    if (!this.client) return null;
    try {
      const summaries = projects.map((p) => ({
        name: p.name,
        techStack: p.techStack || [],
        description: p.description || '',
        status: p.status,
        metrics: p.metrics || {},
        intelligence: p.intelligence || {},
      }));

      const prompt = `You are a senior engineering manager reviewing a developer's complete project portfolio.

Projects:
${JSON.stringify(summaries)}

Return a JSON object with EXACTLY these keys:
- overallScore (number 0-100): Overall portfolio quality
- resumeScore (number 0-100): How resume-ready the portfolio is
- recruiterScore (number 0-100): How attractive to recruiters
- scalabilityScore (number 0-100): Average scalability across projects
- demoScore (number 0-100): How well projects can be demoed in interviews
- jobSyncScore (number 0-100): How well projects align with current market demands
- strongestProject (string): Name of the strongest project and why
- weakestProject (string): Name of the weakest project and what to improve

Return ONLY the JSON object, no markdown.`;

      return await this._generate(prompt);
    } catch (error) {
      console.error('ProjectsAI.getPortfolioReview failed:', error.message);
      return null;
    }
  }

  /**
   * Get AI builder suggestions for a specific project.
   * @param {object} project - Project with full context
   * @returns {Promise<Array<{title: string, description: string, priority: string}>|[]>}
   */
  async getBuildSuggestions(project) {
    if (!this.client) return [];
    try {
      const prompt = `You are an expert software architect advising a developer on their project.

Project:
- Name: ${project.name}
- Tech Stack: ${JSON.stringify(project.techStack || [])}
- Description: ${project.description || 'No description'}
- Status: ${project.status}
- Tasks: ${JSON.stringify((project.tasks || []).slice(0, 20))}
- Learnings: ${JSON.stringify((project.learnings || []).slice(0, 20))}
- Metrics: ${JSON.stringify(project.metrics || {})}

Return a JSON array of actionable suggestions. Each element must have:
- title (string): Short suggestion title
- description (string): Detailed explanation of what to build and why
- priority (string): One of "HIGH", "MEDIUM", "LOW"

Focus on:
1. Features that would impress recruiters
2. Architecture improvements for scalability
3. Testing and DevOps enhancements
4. Performance optimisations
5. Missing best practices

Return ONLY the JSON array, no markdown.`;

      return (await this._generate(prompt)) || [];
    } catch (error) {
      console.error('ProjectsAI.getBuildSuggestions failed:', error.message);
      return [];
    }
  }

  /**
   * Analyze skill/technology gaps across all projects.
   * @param {Array<object>} projects
   * @returns {Promise<Array<{area: string, currentPct: number, recommendations: string[]}>|[]>}
   */
  async getGrowthGaps(projects) {
    if (!this.client) return [];
    try {
      const summaries = projects.map((p) => ({
        name: p.name,
        techStack: p.techStack || [],
        description: p.description || '',
        status: p.status,
      }));

      const prompt = `You are a career mentor analysing a developer's project portfolio for skill gaps.

Projects:
${JSON.stringify(summaries)}

Evaluate the following areas and return a JSON array where each element has:
- area (string): The skill/technology area (e.g. "Backend APIs", "DevOps", "Testing", "System Design", "Frontend", "Databases", "Security", "Cloud")
- currentPct (number 0-100): How well covered this area is across their projects
- recommendations (string[]): Specific actions to fill the gap

Consider current industry demands for full-stack and backend roles.

Return ONLY the JSON array, no markdown.`;

      return (await this._generate(prompt)) || [];
    } catch (error) {
      console.error('ProjectsAI.getGrowthGaps failed:', error.message);
      return [];
    }
  }
}

export const projectsAI = new ProjectsAI();
