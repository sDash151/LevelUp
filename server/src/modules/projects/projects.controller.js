import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { success, created, paginated } from '../../shared/utils/response.js';
import { projectsService } from './projects.service.js';
import { env } from '../../config/env.js';

// ==================== PROJECTS CRUD ====================

export const getAll = asyncHandler(async (req, res) => {
  const { status, priority, search, page, limit } = req.query;
  const result = await projectsService.list(req.user.id, { status, priority, search }, page, limit);
  paginated(res, result.data, { page: result.page, limit: result.limit, total: result.total });
});

export const getOne = asyncHandler(async (req, res) => {
  const project = await projectsService.get(req.user.id, req.params.id);
  success(res, { project });
});

export const create = asyncHandler(async (req, res) => {
  const project = await projectsService.create(req.user.id, req.body);
  created(res, { project });
});

export const update = asyncHandler(async (req, res) => {
  const project = await projectsService.update(req.user.id, req.params.id, req.body);
  success(res, { project }, 'Project updated');
});

export const remove = asyncHandler(async (req, res) => {
  await projectsService.delete(req.user.id, req.params.id);
  success(res, null, 'Project deleted');
});

// ==================== STATS & PIPELINE ====================

export const getStats = asyncHandler(async (req, res) => {
  const stats = await projectsService.stats(req.user.id);
  success(res, { stats });
});

export const getPipeline = asyncHandler(async (req, res) => {
  const pipeline = await projectsService.pipeline(req.user.id);
  success(res, { pipeline });
});

export const movePipeline = asyncHandler(async (req, res) => {
  const { projectId, newStatus } = req.body;
  const project = await projectsService.moveProject(req.user.id, projectId, newStatus);
  success(res, { project }, 'Project moved');
});

// ==================== METRICS ====================

export const getProjectMetrics = asyncHandler(async (req, res) => {
  const metrics = await projectsService.getMetrics(req.user.id, req.params.id);
  success(res, { metrics });
});

// ==================== TASKS ====================

export const createTask = asyncHandler(async (req, res) => {
  const task = await projectsService.createTask(req.user.id, req.params.id, req.body);
  created(res, { task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await projectsService.updateTask(req.user.id, req.params.taskId, req.body);
  success(res, { task }, 'Task updated');
});

// ==================== LEARNINGS ====================

export const getLearnings = asyncHandler(async (req, res) => {
  const { type, page, limit } = req.query;
  const result = await projectsService.getLearnings(req.user.id, req.params.id, { type, page, limit });
  paginated(res, result.data, { page: result.page, limit: result.limit, total: result.total });
});

export const createLearning = asyncHandler(async (req, res) => {
  const learning = await projectsService.createLearning(req.user.id, req.params.id, req.body);
  created(res, { learning });
});

// ==================== INTELLIGENCE ====================

export const getIntelligence = asyncHandler(async (req, res) => {
  const intelligence = await projectsService.getIntelligence(req.user.id);
  success(res, { intelligence });
});



// ==================== AI ENDPOINTS ====================

export const aiAnalyze = asyncHandler(async (req, res) => {
  const { projectId } = req.body;
  const project = await projectsService.get(req.user.id, projectId);
  const githubContext = await projectsService.getGithubContextForAi(req.user.id, project.repoUrl);
  
  const { projectsAI } = await import('./projects.ai.js');
  const analysis = await projectsAI.analyzeProject({
    name: project.title,
    stack: project.stack,
    description: project.description,
    metrics: project.metrics,
    tasks: project.tasks,
    learnings: project.learnings,
    githubContext,
  });

  if (analysis) {
    // Persist intelligence scores
    const { projectsRepository } = await import('./projects.repository.js');
    await projectsRepository.upsertIntelligence(projectId, {
      architectureScore: analysis.architectureScore || 0,
      scalabilityScore: analysis.scalabilityScore || 0,
      resumeScore: analysis.resumeScore || 0,
      interviewScore: analysis.interviewScore || 0,
      recruiterScore: analysis.recruiterScore || 0,
      missingSkills: analysis.missingSkills || [],
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
    });
  }

  success(res, { projectId: project.id, analysis }, 'Analysis complete');
});

export const jobSync = asyncHandler(async (req, res) => {
  const projects = await projectsService.list(req.user.id, {}, 1, 50);
  const { projectsAI } = await import('./projects.ai.js');
  const { projectsRepository } = await import('./projects.repository.js');
  let matches = await projectsAI.matchProjectsToJob(
    projects.data.map(p => ({ id: p.id, title: p.title, stack: p.stack, description: p.description })),
    req.body.jobDescription || 'General full-stack developer role'
  );

  // Robustly handle cases where AI returns {"matches": [...]} instead of an array
  if (matches && !Array.isArray(matches)) {
    matches = matches.matches || matches.projects || Object.values(matches)[0] || [];
  }
  if (!Array.isArray(matches)) {
    matches = [];
  }

  // Save matches to DB
  for (const match of matches) {
    if (match.projectId) {
      await projectsRepository.upsertJobMatch({
        jobId: 'custom-job', // Since it's arbitrary text now
        projectId: match.projectId,
        matchScore: match.matchScore || 0,
        missingSkills: match.missingSkills || [],
        recommendedImprovements: match.recommendedImprovements || [],
      });
    }
  }

  success(res, { matches }, 'Job sync complete');
});

export const extractLearnings = asyncHandler(async (req, res) => {
  const { projectId, commits } = req.body;
  if (projectId) await projectsService.get(req.user.id, projectId);
  const { projectsAI } = await import('./projects.ai.js');
  const learnings = await projectsAI.extractLearnings(commits || []);
  success(res, { learnings: learnings || [] }, 'Learnings extracted');
});

export const askAi = asyncHandler(async (req, res) => {
  const { question } = req.body;
  if (!question) throw new AppError('Question is required', 400);

  const projects = await projectsService.list(req.user.id, {}, 1, 50);
  const { projectsAI } = await import('./projects.ai.js');
  
  const answer = await projectsAI.askPortfolio(
    projects.data.map(p => ({
      name: p.title,
      techStack: p.stack,
      description: p.description,
      status: p.status,
      metrics: p.metrics,
      intelligence: p.intelligence
    })),
    question
  );

  success(res, { answer }, 'AI response generated');
});

export const getBuildSuggestions = asyncHandler(async (req, res) => {
  const project = await projectsService.get(req.user.id, req.params.id);
  const force = req.query.force === 'true';

  if (!force && project.intelligence?.buildSuggestions) {
    return success(res, { suggestions: project.intelligence.buildSuggestions }, 'Cached AI build suggestions retrieved');
  }

  const githubContext = await projectsService.getGithubContextForAi(req.user.id, project.repoUrl);
  const { projectsAI } = await import('./projects.ai.js');
  
  // Need to format project slightly to match what AI expects
  const projectForAi = {
    name: project.title,
    techStack: project.stack,
    description: project.description,
    status: project.status,
    metrics: project.metrics,
    tasks: project.tasks,
    learnings: project.learnings,
    githubContext,
  };
  
  const suggestions = await projectsAI.getBuildSuggestions(projectForAi);

  // Save the suggestions to the database for future use
  await import('./projects.repository.js').then(m => m.projectsRepository.upsertIntelligence(project.id, {
    buildSuggestions: suggestions
  }));

  success(res, { suggestions }, 'AI build suggestions generated');
});

// ==================== GITHUB INTEGRATION ====================

export const githubLogin = asyncHandler(async (req, res) => {
  const { state } = req.query;
  const url = await projectsService.getGithubAuthUrl(state);
  success(res, { url });
});

export const connectGithub = asyncHandler(async (req, res) => {
  const { code } = req.body;
  await projectsService.connectGithub(req.user.id, code);
  success(res, null, 'GitHub connected successfully');
});

export const getGithubRepos = asyncHandler(async (req, res) => {
  const repos = await projectsService.getGithubRepos(req.user.id);
  success(res, repos, 'GitHub repos retrieved');
});

export const disconnectGithub = asyncHandler(async (req, res) => {
  await projectsService.disconnectGithub(req.user.id);
  success(res, null, 'GitHub disconnected');
});

export const syncGithub = asyncHandler(async (req, res) => {
  const result = await projectsService.syncGithubActivity(req.user.id);
  success(res, result, 'GitHub activity synced successfully');
});

export const getGithubLanguages = asyncHandler(async (req, res) => {
  const result = await projectsService.getGithubLanguages(req.user.id);
  success(res, result, 'GitHub languages retrieved');
});

export const getGithubActivityGraph = asyncHandler(async (req, res) => {
  const result = await projectsService.getGithubActivityGraph(req.user.id);
  success(res, result, 'GitHub activity graph retrieved');
});
