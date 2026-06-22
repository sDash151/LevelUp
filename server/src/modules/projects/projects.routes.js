import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import {
  createProjectSchema,
  updateProjectSchema,
  listProjectsSchema,
  moveProjectSchema,
  aiAnalyzeSchema,
  createLearningSchema,
  createTaskSchema,
  updateTaskSchema,
} from './projects.validation.js';
import * as c from './projects.controller.js';

const router = Router();

// ── Named routes (MUST come before /:id to avoid param capture) ──────────────
router.get('/', validate(listProjectsSchema), c.getAll);
router.get('/stats', c.getStats);
router.get('/pipeline', c.getPipeline);
router.patch('/pipeline/move', validate(moveProjectSchema), c.movePipeline);
router.get('/intelligence', c.getIntelligence);
router.get('/github/login', c.githubLogin);
router.post('/github/connect', c.connectGithub);
router.get('/github/repos', c.getGithubRepos);
router.delete('/github/disconnect', c.disconnectGithub);
router.post('/github/sync', c.syncGithub);
router.get('/github/languages', c.getGithubLanguages);
router.get('/github/activity-graph', c.getGithubActivityGraph);
router.post('/ai/analyze', validate(aiAnalyzeSchema), c.aiAnalyze);
router.post('/ai/chat', c.askAi);
router.post('/job-sync', c.jobSync);
router.post('/learnings/extract', c.extractLearnings);

// ── Task routes (non-parameterised project id) ──────────────────────────────
router.patch('/tasks/:taskId', validate(updateTaskSchema), c.updateTask);
router.delete('/tasks/:taskId', c.deleteTask);

// ── Parameterised project routes ─────────────────────────────────────────────
router.get('/:id', c.getOne);
router.patch('/:id', validate(updateProjectSchema), c.update);
router.delete('/:id', c.remove);
router.get('/:id/metrics', c.getProjectMetrics);
router.get('/:id/learnings', c.getLearnings);
router.post('/:id/learnings', validate(createLearningSchema), c.createLearning);
router.post('/:id/tasks', validate(createTaskSchema), c.createTask);
router.get('/:id/intelligence/builder', c.getBuildSuggestions);

// ── Create project (LAST to avoid catching named routes) ─────────────────────
router.post('/', validate(createProjectSchema), c.create);

export default router;
