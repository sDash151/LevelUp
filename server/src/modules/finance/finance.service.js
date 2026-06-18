import { financeRepository } from './finance.repository.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { UnauthorizedError } from '../../shared/errors/AuthError.js';

class FinanceService {
  async list(userId, filters, page, limit) { return financeRepository.findAllByUser(userId, filters, page, limit); }

  async get(userId, id) {
    const t = await financeRepository.findById(id);
    if (!t) throw new NotFoundError('Transaction');
    if (t.userId !== userId) throw new UnauthorizedError('Not your transaction');
    return t;
  }

  async create(userId, data) { return financeRepository.create(userId, data); }

  async update(userId, id, data) {
    const t = await financeRepository.findById(id);
    if (!t) throw new NotFoundError('Transaction');
    if (t.userId !== userId) throw new UnauthorizedError('Not your transaction');
    return financeRepository.update(id, data);
  }

  async delete(userId, id) {
    const t = await financeRepository.findById(id);
    if (!t) throw new NotFoundError('Transaction');
    if (t.userId !== userId) throw new UnauthorizedError('Not your transaction');
    return financeRepository.delete(id);
  }

  async summary(userId) { return financeRepository.getSummary(userId); }
}

export const financeService = new FinanceService();
