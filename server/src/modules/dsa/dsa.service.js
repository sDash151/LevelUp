import { dsaRepository } from './dsa.repository.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { UnauthorizedError } from '../../shared/errors/AuthError.js';

class DsaService {
  async getProblems(userId, filters, page, limit) {
    return dsaRepository.findAllByUser(userId, filters, page, limit);
  }

  async getProblem(userId, id) {
    const p = await dsaRepository.findById(id);
    if (!p) throw new NotFoundError('Problem');
    if (p.userId !== userId) throw new UnauthorizedError('Not your problem');
    return p;
  }

  async createProblem(userId, data) {
    return dsaRepository.create(userId, data);
  }

  async updateProblem(userId, id, data) {
    const p = await dsaRepository.findById(id);
    if (!p) throw new NotFoundError('Problem');
    if (p.userId !== userId) throw new UnauthorizedError('Not your problem');
    return dsaRepository.update(id, data);
  }

  async deleteProblem(userId, id) {
    const p = await dsaRepository.findById(id);
    if (!p) throw new NotFoundError('Problem');
    if (p.userId !== userId) throw new UnauthorizedError('Not your problem');
    return dsaRepository.delete(id);
  }

  async getStats(userId) {
    return dsaRepository.getStats(userId);
  }
}

export const dsaService = new DsaService();
