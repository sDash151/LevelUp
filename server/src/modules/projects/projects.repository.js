import { prisma } from '../../config/database.js';

class ProjectsRepository {
  // ==================== PROJECTS CRUD ====================

  async findAllByUser(userId, filters = {}, page = 1, limit = 20) {
    const where = { userId };
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.search) {
      where.title = { contains: filters.search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          _count: { select: { tasks: true, learnings: true } },
          metrics: true,
          tasks: { orderBy: { createdAt: 'desc' }, take: 3 },
          learnings: true,
          intelligence: true,
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        tasks: { orderBy: { createdAt: 'desc' } },
        learnings: { orderBy: { createdAt: 'desc' } },
        metrics: true,
        intelligence: true,
        jobMatches: true,
      },
    });
  }

  async create(userId, data) {
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Math.random().toString(36).substring(2, 6);

    const processed = {
      title: data.title,
      slug,
      userId,
      description: data.description,
      status: data.status,
      priority: data.priority,
      stack: data.stack || [],
      repoUrl: data.repoUrl || null,
      liveUrl: data.liveUrl || null,
      githubRepoId: data.githubRepoId || null,
      deadline: data.deadline ? new Date(data.deadline) : null,
    };

    return prisma.project.create({
      data: processed,
      include: {
        _count: { select: { tasks: true, learnings: true } },
        metrics: true,
      },
    });
  }

  async update(id, data) {
    const processed = { ...data };
    if (data.deadline) processed.deadline = new Date(data.deadline);
    if (data.deadline === null) processed.deadline = null;
    return prisma.project.update({
      where: { id },
      data: processed,
      include: {
        _count: { select: { tasks: true, learnings: true } },
        metrics: true,
      },
    });
  }

  async delete(id) {
    return prisma.project.delete({ where: { id } });
  }

  // ==================== STATS & PIPELINE ====================

  async getStats(userId) {
    const [byStatus, total, tasksDone, totalLearnings] = await Promise.all([
      prisma.project.groupBy({
        by: ['status'],
        where: { userId },
        _count: { id: true },
      }),
      prisma.project.count({ where: { userId } }),
      prisma.projectTask.count({
        where: { project: { userId }, status: 'done' },
      }),
      prisma.projectLearning.count({
        where: { project: { userId } },
      }),
    ]);

    return { total, byStatus, tasksDone, totalLearnings };
  }

  async getPipeline(userId) {
    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        tasks: { orderBy: { createdAt: 'desc' }, take: 5 },
        metrics: true,
        intelligence: true,
        _count: { select: { tasks: true, learnings: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Group by status
    const statuses = ['IDEA', 'PLANNING', 'BUILDING', 'TESTING', 'SHIPPED', 'ARCHIVED'];
    const pipeline = {};
    for (const status of statuses) {
      pipeline[status] = projects.filter((p) => p.status === status);
    }

    return pipeline;
  }

  async moveProject(id, newStatus) {
    return prisma.project.update({
      where: { id },
      data: { status: newStatus },
      include: {
        _count: { select: { tasks: true, learnings: true } },
        metrics: true,
      },
    });
  }

  // ==================== METRICS ====================

  async getProjectMetrics(projectId) {
    return prisma.projectMetrics.findUnique({ where: { projectId } });
  }

  async upsertMetrics(projectId, data) {
    return prisma.projectMetrics.upsert({
      where: { projectId },
      create: { projectId, ...data },
      update: data,
    });
  }

  // ==================== TASKS ====================

  async findTasks(projectId, status) {
    const where = { projectId };
    if (status) where.status = status;
    return prisma.projectTask.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findTaskById(taskId) {
    return prisma.projectTask.findUnique({
      where: { id: taskId },
      include: { project: true },
    });
  }

  async createTask(projectId, data) {
    return prisma.projectTask.create({
      data: {
        projectId,
        title: data.title,
        description: data.description || null,
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        xpReward: data.xpReward ?? 10,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });
  }

  async updateTask(taskId, data) {
    const processed = { ...data };
    if (data.dueDate) processed.dueDate = new Date(data.dueDate);
    if (data.dueDate === null) processed.dueDate = null;
    if (data.status === 'done') processed.completedAt = new Date();
    return prisma.projectTask.update({ where: { id: taskId }, data: processed });
  }

  // ==================== LEARNINGS ====================

  async findLearnings(projectId, filters = {}) {
    const where = { projectId };
    if (filters.type) where.type = filters.type;

    const page = filters.page || 1;
    const limit = filters.limit || 20;

    const [data, total] = await Promise.all([
      prisma.projectLearning.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.projectLearning.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async createLearning(projectId, data) {
    return prisma.projectLearning.create({
      data: {
        projectId,
        title: data.title,
        description: data.description || null,
        type: data.type || 'learning',
        tags: data.tags || [],
        impactScore: data.impactScore ?? 5,
        source: data.source || 'manual',
      },
    });
  }

  // ==================== INTELLIGENCE ====================

  async getIntelligence(userId) {
    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        metrics: true,
        tasks: { where: { status: { not: 'done' } }, take: 3 },
        learnings: true,
        intelligence: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Compute aggregates
    const totalProjects = projects.length;
    const withIntelligence = projects.filter((p) => p.intelligence);
    const avgArchitecture = withIntelligence.length
      ? withIntelligence.reduce((s, p) => s + p.intelligence.architectureScore, 0) / withIntelligence.length
      : 0;
    const avgResume = withIntelligence.length
      ? withIntelligence.reduce((s, p) => s + p.intelligence.resumeScore, 0) / withIntelligence.length
      : 0;
    const avgInterview = withIntelligence.length
      ? withIntelligence.reduce((s, p) => s + p.intelligence.interviewScore, 0) / withIntelligence.length
      : 0;

    return {
      projects,
      aggregates: {
        totalProjects,
        analyzedCount: withIntelligence.length,
        avgArchitecture: Math.round(avgArchitecture * 10) / 10,
        avgResume: Math.round(avgResume * 10) / 10,
        avgInterview: Math.round(avgInterview * 10) / 10,
      },
    };
  }

  async upsertIntelligence(projectId, data) {
    return prisma.projectIntelligence.upsert({
      where: { projectId },
      create: { projectId, ...data },
      update: data,
    });
  }

  // ==================== JOB MATCHES ====================

  async findJobMatches(userId) {
    return prisma.jobProjectMatch.findMany({
      where: { project: { userId } },
      include: { project: { select: { id: true, title: true, slug: true, stack: true } } },
      orderBy: { matchScore: 'desc' },
    });
  }

  async upsertJobMatch(data) {
    return prisma.jobProjectMatch.upsert({
      where: { jobId_projectId: { jobId: data.jobId, projectId: data.projectId } },
      create: data,
      update: {
        matchScore: data.matchScore,
        missingSkills: data.missingSkills,
        recommendedImprovements: data.recommendedImprovements,
      },
    });
  }

  // ==================== GITHUB CONNECTION ====================

  async findGithubConnection(userId) {
    return prisma.githubConnection.findUnique({ where: { userId } });
  }

  async upsertGithubConnection(userId, data) {
    return prisma.githubConnection.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  async deleteGithubConnection(userId) {
    return prisma.githubConnection.delete({ where: { userId } });
  }
}

export const projectsRepository = new ProjectsRepository();
