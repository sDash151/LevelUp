import { projectsRepository } from './projects.repository.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { UnauthorizedError } from '../../shared/errors/AuthError.js';

class ProjectsService {
  async list(userId, filters, page, limit) { return projectsRepository.findAllByUser(userId, filters, page, limit); }

  async get(userId, id) {
    const p = await projectsRepository.findById(id);
    if (!p) throw new NotFoundError('Project');
    if (p.userId !== userId) throw new UnauthorizedError('Not your project');
    return p;
  }

  async create(userId, data) { return projectsRepository.create(userId, data); }

  async update(userId, id, data) {
    const p = await projectsRepository.findById(id);
    if (!p) throw new NotFoundError('Project');
    if (p.userId !== userId) throw new UnauthorizedError('Not your project');
    return projectsRepository.update(id, data);
  }

  async delete(userId, id) {
    const p = await projectsRepository.findById(id);
    if (!p) throw new NotFoundError('Project');
    if (p.userId !== userId) throw new UnauthorizedError('Not your project');
    return projectsRepository.delete(id);
  }

  async stats(userId) { return projectsRepository.getStats(userId); }
}

export const projectsService = new ProjectsService();
