import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { success, paginated } from '../../shared/utils/response.js';
import { dsaService } from './dsa.service.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const data = await dsaService.getDashboard(req.user.id);
  success(res, data);
});

export const getPaths = asyncHandler(async (req, res) => {
  const data = await dsaService.getPaths(req.user.id);
  success(res, data);
});

export const getPathDetail = asyncHandler(async (req, res) => {
  const data = await dsaService.getPathDetail(req.user.id, req.params.slug);
  success(res, data);
});

export const getPathProblems = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, topic, difficulty, status, search } = req.query;
  const result = await dsaService.getPathProblems(req.user.id, req.params.slug, {
    page: parseInt(page), limit: parseInt(limit), topic, difficulty, status, search,
  });
  paginated(res, result.data, { page: result.pagination.page, limit: result.pagination.limit, total: result.pagination.total });
});

export const getProblemDetail = asyncHandler(async (req, res) => {
  const data = await dsaService.getProblemDetail(req.user.id, req.params.id);
  success(res, data);
});

export const solveProblem = asyncHandler(async (req, res) => {
  const data = await dsaService.solveProblem(req.user.id, req.params.id, req.body);
  success(res, data, 'Problem solved!');
});

export const updateStatus = asyncHandler(async (req, res) => {
  const data = await dsaService.updateProblemStatus(req.user.id, req.params.id, req.body.status);
  success(res, data);
});

export const updateNotes = asyncHandler(async (req, res) => {
  const data = await dsaService.updateProblemNotes(req.user.id, req.params.id, req.body.notes);
  success(res, data);
});

export const reviseProblem = asyncHandler(async (req, res) => {
  const data = await dsaService.reviseProblem(req.user.id, req.params.id, req.body.performance);
  success(res, data);
});

export const getRevision = asyncHandler(async (req, res) => {
  const data = await dsaService.getRevisionQueue(req.user.id);
  success(res, data);
});

export const getWeakness = asyncHandler(async (req, res) => {
  const data = await dsaService.getWeakness(req.user.id);
  success(res, data);
});

export const getRecommendations = asyncHandler(async (req, res) => {
  const data = await dsaService.getRecommendations(req.user.id);
  success(res, data);
});

export const getCompanyMode = asyncHandler(async (req, res) => {
  const data = await dsaService.getCompanyMode(req.user.id);
  success(res, data);
});

export const getPatterns = asyncHandler(async (req, res) => {
  const data = await dsaService.getPatternMastery(req.user.id);
  success(res, data);
});

export const getHeatmap = asyncHandler(async (req, res) => {
  const data = await dsaService.getHeatmap(req.user.id);
  success(res, data);
});

export const searchProblems = asyncHandler(async (req, res) => {
  const data = await dsaService.searchProblems(req.user.id, req.query.q || '');
  success(res, data);
});

export const setActivePath = asyncHandler(async (req, res) => {
  const data = await dsaService.setActivePath(req.user.id, req.body.pathSlug);
  success(res, data);
});

export const getQuickResume = asyncHandler(async (req, res) => {
  const data = await dsaService.getQuickResume(req.user.id);
  success(res, data);
});
