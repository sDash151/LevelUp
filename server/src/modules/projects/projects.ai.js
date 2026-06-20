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
    console.log('RAW AI RESPONSE TEXT:', response.text);
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

${project.githubContext ? `GitHub Repository Context:
- Actual Languages Used: ${JSON.stringify(project.githubContext.languages)}
- README Excerpt:
${project.githubContext.readme}
` : ''}
IMPORTANT RULES:
1. If the Tech Stack is empty, DO NOT suggest generic technologies (e.g., "Add Frontend Framework", "Add Database", "Add React"). Assume the user already has a stack but hasn't documented it yet.
2. Focus strictly on architectural concepts, system design, scalable patterns (e.g. caching, CI/CD, containerization), and domain-specific logic.
3. missingSkills should contain specific architectural, operational, or advanced software engineering concepts, NOT basic frameworks.
4. If GitHub Repository Context is provided, use it as the primary source of truth for the project's actual architecture, domain, and purpose.

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
        name: p.title || p.name,
        techStack: p.stack || p.techStack || [],
        description: p.description || '',
      }));

      const prompt = `You are a technical recruiter evaluating a candidate's project portfolio against a job posting.

Job Description:
${jobDescription}

Candidate's Projects:
${JSON.stringify(projectSummaries)}

Task: Identify the TOP 3 best matching projects from the candidate's portfolio for this job.
You MUST return EXACTLY 3 projects (or all projects if they have fewer than 3), even if they are very poor matches (e.g., 5% match score).

Return a JSON array containing ONLY these top matches. Each object must exactly have these keys:
- projectId (string): The project's id
- matchScore (number 0-100): How well this project matches the job requirements
- missingSkills (string[]): Up to 3 skills required by the job that this project lacks
- recommendedImprovements (string[]): 1-2 specific things to add to make the project more relevant

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

${project.githubContext ? `GitHub Repository Context:
- Actual Languages Used: ${JSON.stringify(project.githubContext.languages)}
- README Excerpt:
${project.githubContext.readme}
` : ''}
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

IMPORTANT RULES:
1. Do NOT suggest generic boilerplate tasks like "Implement User Authentication", "Add a Database", "Create a Testing Suite", or "Set up CI/CD" unless specifically relevant.
2. Assume the project already has basic frontend/backend infrastructure. Focus on domain-specific features related to the project's Name and Description.
3. Be highly specific and creative. Avoid repetitive templates.
4. If GitHub Repository Context is provided, use it as the primary source of truth for the project's actual architecture and gaps.

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

  /**
   * Ask AI a general question about the portfolio.
   * @param {Array<object>} projects
   * @param {string} question
   * @returns {Promise<{answer: string}>}
   */
  async askPortfolio(projects, question) {
    if (!this.client) return { answer: 'AI is currently offline.' };
    try {
      const summaries = projects.map((p) => ({
        name: p.title || p.name,
        techStack: p.stack || p.techStack || [],
        description: p.description || '',
        status: p.status,
        metrics: p.metrics || {},
        intelligence: p.intelligence || {},
      }));

      const prompt = `You are an expert technical career mentor and AI assistant.
A software engineer is asking you a question about their project portfolio.

Portfolio Summary:
${JSON.stringify(summaries)}

User's Question: "${question}"

Provide a highly helpful, concise, and encouraging answer based ONLY on the portfolio data provided.
Return a JSON object with EXACTLY this key:
- answer (string): Your detailed response to the user.

Return ONLY the JSON object, no markdown.`;

      const response = await this._generate(prompt);
      return response || { answer: 'I could not process your request at this time.' };
    } catch (error) {
      console.error('ProjectsAI.askPortfolio failed:', error.message);
      return { answer: 'An error occurred while analyzing your portfolio.' };
    }
  }
}

export const projectsAI = new ProjectsAI();
