import { prisma } from '../../config/database.js';

class ProjectsRepository {
  async findAllByUser(userId, filters = {}, page = 1, limit = 20) {
    const where = { userId };
    if (filters.status) where.status = filters.status;
    const [data, total] = await Promise.all([
      prisma.project.findMany({ where, orderBy: { updatedAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.project.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findById(id) { return prisma.project.findUnique({ where: { id } }); }

  async create(userId, data) {
    const processed = { ...data, userId };
    if (data.startDate) processed.startDate = new Date(data.startDate);
    if (data.endDate) processed.endDate = new Date(data.endDate);
    return prisma.project.create({ data: processed });
  }

  async update(id, data) {
    const processed = { ...data };
    if (data.startDate) processed.startDate = new Date(data.startDate);
    if (data.endDate) processed.endDate = new Date(data.endDate);
    if (data.startDate === null) processed.startDate = null;
    if (data.endDate === null) processed.endDate = null;
    return prisma.project.update({ where: { id }, data: processed });
  }

  async delete(id) { return prisma.project.delete({ where: { id } }); }

  async getStats(userId) {
    const byStatus = await prisma.project.groupBy({ by: ['status'], where: { userId }, _count: { id: true } });
    const total = await prisma.project.count({ where: { userId } });
    return { total, byStatus };
  }
}

export const projectsRepository = new ProjectsRepository();
