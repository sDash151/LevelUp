import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import * as controller from './dsa.controller.js';
import { updateStatusSchema, updateNotesSchema, reviseSchema, activePathSchema, listProblemsSchema } from './dsa.validation.js';

const router = Router();

// Dashboard
router.get('/', controller.getDashboard);

// Paths
router.get('/paths', controller.getPaths);
router.get('/paths/:slug', controller.getPathDetail);
router.get('/paths/:slug/problems', validate(listProblemsSchema), controller.getPathProblems);

// Problems
router.get('/problems/:id', controller.getProblemDetail);
router.patch('/problems/:id/solve', controller.solveProblem);
router.patch('/problems/:id/status', validate(updateStatusSchema), controller.updateStatus);
router.patch('/problems/:id/notes', validate(updateNotesSchema), controller.updateNotes);
router.post('/problems/:id/revise', validate(reviseSchema), controller.reviseProblem);

// Engines
router.get('/revision', controller.getRevision);
router.get('/weakness', controller.getWeakness);
router.get('/recommendations', controller.getRecommendations);
router.get('/company-mode', controller.getCompanyMode);
router.get('/patterns', controller.getPatterns);
router.get('/heatmap', controller.getHeatmap);

// Search & Active Path
router.get('/search', controller.searchProblems);
router.patch('/active-path', validate(activePathSchema), controller.setActivePath);
router.get('/quick-resume', controller.getQuickResume);

export default router;
