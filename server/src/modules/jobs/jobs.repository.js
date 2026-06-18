import { prisma } from '../../config/database.js';

class JobsRepository {
  async findAllByUser(userId, filters = {}, page = 1, limit = 20) {
    const where = { userId };
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;

    const [data, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where, orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit, take: limit,
      }),
      prisma.jobApplication.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findById(id) {
    return prisma.jobApplication.findUnique({ where: { id } });
  }

  async create(userId, data) {
    const processedData = { ...data, userId };
    if (data.appliedDate) processedData.appliedDate = new Date(data.appliedDate);
    if (data.deadline) processedData.deadline = new Date(data.deadline);
    return prisma.jobApplication.create({ data: processedData });
  }

  async update(id, data) {
    const processedData = { ...data };
    if (data.appliedDate) processedData.appliedDate = new Date(data.appliedDate);
    if (data.deadline) processedData.deadline = new Date(data.deadline);
    if (data.appliedDate === null) processedData.appliedDate = null;
    if (data.deadline === null) processedData.deadline = null;
    return prisma.jobApplication.update({ where: { id }, data: processedData });
  }

  async delete(id) {
    return prisma.jobApplication.delete({ where: { id } });
  }

  async findAllGroupedByStatus(userId) {
    const jobs = await prisma.jobApplication.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    const grouped = {};
    for (const job of jobs) {
      if (!grouped[job.status]) grouped[job.status] = [];
      grouped[job.status].push(job);
    }
    return grouped;
  }

  async getStats(userId) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const monthAgo = new Date(now.getTime() - 30 * 86400000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 86400000);

    const [
      total,
      thisWeek,
      thisMonth,
      byStatus,
      lastMonthTotal,
    ] = await Promise.all([
      prisma.jobApplication.count({ where: { userId } }),
      prisma.jobApplication.count({
        where: { userId, createdAt: { gte: weekAgo } },
      }),
      prisma.jobApplication.count({
        where: { userId, createdAt: { gte: monthAgo } },
      }),
      prisma.jobApplication.groupBy({
        by: ['status'],
        where: { userId },
        _count: { id: true },
      }),
      prisma.jobApplication.count({
        where: {
          userId,
          createdAt: { gte: twoMonthsAgo, lt: monthAgo },
        },
      }),
    ]);

    // Extract counts by status
    const statusCount = (status) => {
      const entry = byStatus.find((s) => s.status === status);
      return entry ? entry._count.id : 0;
    };

    const interviews = statusCount('INTERVIEW');
    const offers = statusCount('OFFER');
    const rejections = statusCount('REJECTED');
    const saved = statusCount('SAVED');

    // Response rate: % of non-SAVED that reached INTERVIEW or beyond
    const nonSaved = total - saved;
    const responded = interviews + offers + statusCount('PHONE_SCREEN');
    const responseRate = nonSaved > 0 ? Math.round((responded / nonSaved) * 100) : 0;

    // Previous month response rate for comparison
    const prevNonSaved = lastMonthTotal > 0 ? lastMonthTotal : 1;
    const prevResponseRate = 0; // Simplified: no historical tracking

    const monthlyChange = {
      applications: thisMonth - lastMonthTotal,
      responseRate: responseRate - prevResponseRate,
    };

    return {
      total,
      thisWeek,
      thisMonth,
      responseRate,
      interviews,
      offers,
      rejections,
      byStatus,
      monthlyChange,
    };
  }
}

export const jobsRepository = new JobsRepository();
