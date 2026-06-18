import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { success, created } from '../../shared/utils/response.js';
import { habitsService } from './habits.service.js';

export const getAll = asyncHandler(async (req, res) => {
  const habits = await habitsService.getHabits(req.user.id);
  success(res, { habits });
});

export const getOne = asyncHandler(async (req, res) => {
  const habit = await habitsService.getHabit(req.user.id, req.params.id);
  success(res, { habit });
});

export const create = asyncHandler(async (req, res) => {
  const habit = await habitsService.createHabit(req.user.id, req.body);
  created(res, { habit });
});

export const update = asyncHandler(async (req, res) => {
  const habit = await habitsService.updateHabit(req.user.id, req.params.id, req.body);
  success(res, { habit }, 'Habit updated');
});

export const remove = asyncHandler(async (req, res) => {
  await habitsService.deleteHabit(req.user.id, req.params.id);
  success(res, null, 'Habit deleted');
});

export const toggleComplete = asyncHandler(async (req, res) => {
  const result = await habitsService.toggleComplete(req.user.id, req.params.id, req.body.date);
  success(res, result, result.completed ? 'Habit completed!' : 'Completion removed');
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await habitsService.getStats(req.user.id);
  success(res, { stats });
});

export const getRichStats = asyncHandler(async (req, res) => {
  const stats = await habitsService.getRichStats(req.user.id);
  success(res, stats);
});

export const getCalendarStats = asyncHandler(async (req, res) => {
  const now  = new Date();
  const year  = req.query.year  || now.getFullYear();
  const month = req.query.month || now.getMonth() + 1;
  const selectedDate = req.query.selectedDate || now.toISOString().split('T')[0];
  const stats = await habitsService.getCalendarStats(req.user.id, year, month, selectedDate);
  success(res, stats);
});
