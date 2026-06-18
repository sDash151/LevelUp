import { fitnessRepository } from './fitness.repository.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { UnauthorizedError } from '../../shared/errors/AuthError.js';

class FitnessService {
  async listWorkouts(userId, filters, page, limit) { return fitnessRepository.findWorkouts(userId, filters, page, limit); }

  async getWorkout(userId, id) {
    const w = await fitnessRepository.findWorkoutById(id);
    if (!w) throw new NotFoundError('Workout');
    if (w.userId !== userId) throw new UnauthorizedError('Not your workout');
    return w;
  }

  async createWorkout(userId, data) { return fitnessRepository.createWorkout(userId, data); }

  async updateWorkout(userId, id, data) {
    const w = await fitnessRepository.findWorkoutById(id);
    if (!w) throw new NotFoundError('Workout');
    if (w.userId !== userId) throw new UnauthorizedError('Not your workout');
    return fitnessRepository.updateWorkout(id, data);
  }

  async deleteWorkout(userId, id) {
    const w = await fitnessRepository.findWorkoutById(id);
    if (!w) throw new NotFoundError('Workout');
    if (w.userId !== userId) throw new UnauthorizedError('Not your workout');
    return fitnessRepository.deleteWorkout(id);
  }

  async logDaily(userId, data) { return fitnessRepository.upsertLog(userId, data); }
  async getLogHistory(userId, days) { return fitnessRepository.getLogHistory(userId, days); }
  async stats(userId) { return fitnessRepository.getStats(userId); }
}

export const fitnessService = new FitnessService();
