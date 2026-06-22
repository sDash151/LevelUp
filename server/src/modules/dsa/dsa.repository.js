import { prisma } from '../../config/database.js';

class DsaRepository {
  // ── Paths ──
  async getPaths() {
    return prisma.dsaPath.findMany({ orderBy: [{ tier: 'asc' }, { name: 'asc' }] });
  }

  async getPathBySlug(slug) {
    return prisma.dsaPath.findUnique({ where: { slug } });
  }

  async getPathTopics(pathId) {
    const raw = await prisma.dsaPathProblem.groupBy({
      by: ['topic'],
      where: { pathId },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });
    return raw.map(r => ({ topic: r.topic, count: r._count.id }));
  }

  async getPathProblems(pathId, userId, { topic, difficulty, status, search, page = 1, limit = 20 }) {
    const where = { pathId };
    if (topic) where.topic = topic;

    const problemWhere = {};
    if (difficulty) problemWhere.difficulty = difficulty;
    if (search) problemWhere.title = { contains: search, mode: 'insensitive' };

    const total = await prisma.dsaPathProblem.count({
      where: { ...where, problem: Object.keys(problemWhere).length ? problemWhere : undefined },
    });

    const rows = await prisma.dsaPathProblem.findMany({
      where: { ...where, problem: Object.keys(problemWhere).length ? problemWhere : undefined },
      include: {
        problem: {
          include: { 
            userProgress: { where: { userId }, take: 1 },
            pathProblems: { include: { path: true } }
          },
        },
      },
      orderBy: { orderIndex: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Filter by status if needed (post-query since status is on userProgress)
    let filtered = rows;
    if (status) {
      filtered = rows.filter(r => {
        const up = r.problem.userProgress[0];
        if (status === 'TODO') return !up || up.status === 'TODO';
        return up?.status === status;
      });
    }

    return { rows: filtered, total, page, limit };
  }

  // ── Problems ──
  async getProblemById(id) {
    return prisma.dsaProblem.findUnique({
      where: { id },
      include: {
        pathProblems: { include: { path: true } },
      },
    });
  }

  async getOverlappingProblemIds(problemId) {
    const problem = await prisma.dsaProblem.findUnique({ where: { id: problemId } });
    if (!problem) return [];

    const conditions = [{ canonicalProblemId: problem.canonicalProblemId }];
    if (problem.leetcodeUrl && problem.leetcodeUrl.trim() !== '') {
      conditions.push({ leetcodeUrl: problem.leetcodeUrl });
    }

    const overlapping = await prisma.dsaProblem.findMany({
      where: { OR: conditions },
      select: { id: true },
    });

    return overlapping.map(p => p.id);
  }

  // ── User Progress ──
  async getUserProgress(userId, problemId) {
    return prisma.dsaUserProgress.findUnique({
      where: { userId_problemId: { userId, problemId } },
    });
  }

  async upsertUserProgress(userId, problemId, data) {
    return prisma.dsaUserProgress.upsert({
      where: { userId_problemId: { userId, problemId } },
      update: data,
      create: { userId, problemId, ...data },
    });
  }

  async batchUpsertProgress(userId, problemIds, data) {
    const ops = problemIds.map(problemId =>
      prisma.dsaUserProgress.upsert({
        where: { userId_problemId: { userId, problemId } },
        update: data,
        create: { userId, problemId, ...data },
      })
    );
    return prisma.$transaction(ops);
  }

  async getUserSolvedCount(userId) {
    return prisma.dsaUserProgress.count({ where: { userId, status: 'SOLVED' } });
  }

  async getUserSolvedByDifficulty(userId) {
    const solved = await prisma.dsaUserProgress.findMany({
      where: { userId, status: 'SOLVED' },
      include: { problem: { select: { difficulty: true } } },
    });
    const counts = { Easy: 0, Medium: 0, Hard: 0 };
    for (const s of solved) {
      if (s.problem && s.problem.difficulty) counts[s.problem.difficulty]++;
    }
    return counts;
  }

  // ── Path Progress ──
  async getPathProgressForUser(userId) {
    return prisma.dsaPathProgress.findMany({
      where: { userId },
      include: { path: true },
    });
  }

  async upsertPathProgress(userId, pathId, data) {
    return prisma.dsaPathProgress.upsert({
      where: { userId_pathId: { userId, pathId } },
      update: data,
      create: { userId, pathId, ...data },
    });
  }

  // ── Revision ──
  async getRevisionQueue(userId, limit = 10) {
    return prisma.dsaUserProgress.findMany({
      where: { userId, revisionDue: { lte: new Date() }, status: { in: ['SOLVED', 'REVISING'] } },
      include: {
        problem: { include: { pathProblems: { include: { path: true }, take: 1 } } },
      },
      orderBy: { revisionDue: 'asc' },
      take: limit,
    });
  }

  async createRevisionLog(data) {
    return prisma.dsaRevisionLog.create({ data });
  }

  async getRevisionLogs(userId, problemId) {
    return prisma.dsaRevisionLog.findMany({
      where: { userId, problemId },
      orderBy: { revisionDate: 'desc' },
      take: 10,
    });
  }

  // ── Pattern Mastery ──
  async getPatternMastery(userId) {
    return prisma.dsaPatternMastery.findMany({ where: { userId }, orderBy: { masteryPct: 'desc' } });
  }

  async upsertPatternMastery(userId, pattern, data) {
    return prisma.dsaPatternMastery.upsert({
      where: { userId_pattern: { userId, pattern } },
      update: data,
      create: { userId, pattern, ...data },
    });
  }

  // ── Topic Mastery ──
  async getTopicMastery(userId) {
    return prisma.dsaTopicMastery.findMany({ where: { userId }, orderBy: { weakScore: 'desc' } });
  }

  async upsertTopicMastery(userId, topic, data) {
    return prisma.dsaTopicMastery.upsert({
      where: { userId_topic: { userId, topic } },
      update: data,
      create: { userId, topic, ...data },
    });
  }

  // ── Heatmap ──
  async getHeatmap(userId, startDate, endDate) {
    return prisma.dsaHeatmap.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'asc' },
    });
  }

  async upsertHeatmapEntry(userId, date, data) {
    const dateOnly = new Date(date.toISOString().split('T')[0]);
    return prisma.dsaHeatmap.upsert({
      where: { userId_date: { userId, date: dateOnly } },
      update: { count: { increment: data.countIncrement || 1 }, xpEarned: { increment: data.xpIncrement || 0 } },
      create: { userId, date: dateOnly, count: 1, xpEarned: data.xpIncrement || 0 },
    });
  }

  // ── Weakness ──
  async getWeakTopics(userId, limit = 5) {
    return prisma.dsaTopicMastery.findMany({
      where: { userId, totalCount: { gt: 0 } },
      orderBy: { masteryPct: 'asc' },
      take: limit,
    });
  }

  // ── Streak ──
  async getStreak(userId) {
    const entries = await prisma.dsaHeatmap.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 365,
      select: { date: true, count: true },
    });
    if (!entries.length) return { current: 0, best: 0 };

    let current = 0;
    let best = 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < entries.length; i++) {
      const entryDate = new Date(entries[i].date);
      entryDate.setHours(0, 0, 0, 0);
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      if (entryDate.getTime() === expectedDate.getTime() && entries[i].count > 0) {
        streak++;
        if (i < entries.length) current = streak;
      } else {
        best = Math.max(best, streak);
        if (i === 0 && entryDate.getTime() !== today.getTime()) current = 0;
        break;
      }
    }
    best = Math.max(best, streak);
    return { current, best };
  }

  // ── Unlocks ──
  async getUnlockedPaths(userId) {
    return prisma.dsaUnlockedPath.findMany({ where: { userId }, include: { path: true } });
  }

  async unlockPath(userId, pathId) {
    return prisma.dsaUnlockedPath.upsert({
      where: { userId_pathId: { userId, pathId } },
      update: {},
      create: { userId, pathId },
    });
  }

  // ── Company ──
  async getCompanyMaps(company) {
    return prisma.companyDsaMap.findMany({
      where: { company: { contains: company, mode: 'insensitive' } },
      orderBy: { priority: 'asc' },
    });
  }

  async getAllCompanyMaps() {
    return prisma.companyDsaMap.findMany({ orderBy: { priority: 'asc' } });
  }

  // ── Search ──
  async searchProblems(query, limit = 20) {
    return prisma.dsaProblem.findMany({
      where: { title: { contains: query, mode: 'insensitive' } },
      include: { pathProblems: { include: { path: true }, take: 3 } },
      take: limit,
    });
  }

  // ── Active Path ──
  async updateActivePath(userId, pathId) {
    return prisma.user.update({ where: { id: userId }, data: { activeDsaPathId: pathId } });
  }

  async getActivePath(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { activeDsaPathId: true } });
    if (!user?.activeDsaPathId) return null;
    return prisma.dsaPath.findUnique({ where: { id: user.activeDsaPathId } });
  }

  // ── Quick Resume ──
  async getLastSolvedInPath(userId, pathId) {
    const progress = await prisma.dsaUserProgress.findFirst({
      where: {
        userId,
        status: 'SOLVED',
        problem: { pathProblems: { some: { pathId } } },
      },
      orderBy: { solvedAt: 'desc' },
      include: {
        problem: { include: { pathProblems: { where: { pathId }, take: 1 } } },
      },
    });
    return progress;
  }

  async getNextUnsolvedInPath(userId, pathId, afterOrder = -1) {
    return prisma.dsaPathProblem.findFirst({
      where: {
        pathId,
        orderIndex: { gt: afterOrder },
        problem: {
          userProgress: { none: { userId, status: 'SOLVED' } },
        },
      },
      include: { problem: true },
      orderBy: { orderIndex: 'asc' },
    });
  }

  // ── Stats for path ──
  async getPathSolvedCount(userId, pathId) {
    return prisma.dsaPathProblem.count({
      where: {
        pathId,
        problem: { userProgress: { some: { userId, status: 'SOLVED' } } },
      },
    });
  }

  // ── Job Applications (for company mode) ──
  async getActiveJobApplications(userId) {
    return prisma.jobApplication.findMany({
      where: {
        userId,
        status: { in: ['APPLIED', 'PHONE_SCREEN', 'INTERVIEW'] },
      },
      select: { id: true, company: true, role: true, status: true },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });
  }

  // ── Problems by topic/tags for recommendations ──
  async getUnsolvedByTopicAndTags(userId, topics, tags, limit = 5) {
    return prisma.dsaProblem.findMany({
      where: {
        OR: [
          { pathProblems: { some: { topic: { in: topics } } } },
          { tags: { hasSome: tags } },
        ],
        userProgress: { none: { userId, status: 'SOLVED' } },
      },
      include: { pathProblems: { include: { path: true }, take: 1 } },
      take: limit,
    });
  }
}

export const dsaRepository = new DsaRepository();
