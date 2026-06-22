import { dsaRepository } from './dsa.repository.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { awardXp } from '../../shared/utils/xp.js';
import { prisma } from '../../config/database.js';

const XP_MAP = { Easy: 10, Medium: 25, Hard: 50, Unknown: 10 };
const REVISION_XP = 8;
const REVISION_INTERVALS = [1, 3, 7, 14, 30]; // days

class DsaService {
  // ── Dashboard ──
  async getDashboard(userId) {
    const [solvedCount, streak, paths, pathProgress, patternMastery, revisionQueue, activePath, topicMastery, difficultyBreakdown] =
      await Promise.all([
        dsaRepository.getUserSolvedCount(userId),
        dsaRepository.getStreak(userId),
        dsaRepository.getPaths(),
        dsaRepository.getPathProgressForUser(userId),
        dsaRepository.getPatternMastery(userId),
        dsaRepository.getRevisionQueue(userId, 5),
        dsaRepository.getActivePath(userId),
        dsaRepository.getWeakTopics(userId, 5),
        dsaRepository.getUserSolvedByDifficulty(userId),
      ]);

    const totalProblems = paths.reduce((s, p) => s + p.totalProblems, 0);
    const patternsUnlocked = patternMastery.filter(p => p.masteryPct >= 50).length;
    const readinessPct = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

    return {
      totalSolved: solvedCount,
      easySolved: difficultyBreakdown.Easy || 0,
      mediumSolved: difficultyBreakdown.Medium || 0,
      hardSolved: difficultyBreakdown.Hard || 0,
      pathCount: paths.filter(p => p.tier === 1).length,
      streak: streak.current,
      bestStreak: streak.best,
      readinessPct: Math.min(readinessPct, 100),
      revisionDue: revisionQueue.length,
      patternsUnlocked,
      totalPatterns: patternMastery.length || 0,
      activePath: activePath ? { id: activePath.id, name: activePath.name, slug: activePath.slug } : null,
      weakTopics: topicMastery,
      revisionQueue: revisionQueue.map(r => ({
        id: r.problem.id,
        title: r.problem.title,
        difficulty: r.problem.difficulty,
        topic: r.problem.pathProblems[0]?.topic || '',
        path: r.problem.pathProblems[0]?.path?.name || '',
        dueDate: r.revisionDue,
      })),
    };
  }

  // ── Paths ──
  async getPaths(userId) {
    const [paths, pathProgress, unlockedPaths] = await Promise.all([
      dsaRepository.getPaths(),
      dsaRepository.getPathProgressForUser(userId),
      dsaRepository.getUnlockedPaths(userId),
    ]);

    const progressMap = {};
    pathProgress.forEach(p => { progressMap[p.pathId] = p; });
    const unlockedSet = new Set(unlockedPaths.map(u => u.pathId));

    return paths.map(path => {
      const progress = progressMap[path.id] || { solvedCount: 0, xpEarned: 0, completionPct: 0 };
      const isVisible = path.tier === 1 || unlockedSet.has(path.id);
      return {
        ...path,
        solvedCount: progress.solvedCount,
        xpEarned: progress.xpEarned,
        completionPct: progress.completionPct,
        isVisible,
        isUnlocked: path.tier === 1 || unlockedSet.has(path.id),
      };
    });
  }

  // ── Path Detail ──
  async getPathDetail(userId, slug) {
    const path = await dsaRepository.getPathBySlug(slug);
    if (!path) throw new NotFoundError('Path');

    const [topics, pathProgress] = await Promise.all([
      dsaRepository.getPathTopics(path.id),
      dsaRepository.getPathProgressForUser(userId),
    ]);

    const progress = pathProgress.find(p => p.pathId === path.id) || { solvedCount: 0, xpEarned: 0, completionPct: 0 };

    // Get per-topic solved counts
    const topicDetails = await Promise.all(
      topics.map(async t => {
        const topicProblems = await this._getTopicProblemIds(path.id, t.topic);
        const solved = await this._countSolvedFromIds(userId, topicProblems);
        return {
          topic: t.topic,
          total: t.count,
          solved,
          completionPct: t.count > 0 ? Math.round((solved / t.count) * 100) : 0,
        };
      })
    );

    return {
      ...path,
      solvedCount: progress.solvedCount,
      xpEarned: progress.xpEarned,
      completionPct: progress.completionPct,
      topics: topicDetails,
    };
  }

  async _getTopicProblemIds(pathId, topic) {
    const rows = await prisma.dsaPathProblem.findMany({
      where: { pathId, topic },
      select: { problemId: true },
    });
    return rows.map(r => r.problemId);
  }

  async _countSolvedFromIds(userId, problemIds) {
    if (!problemIds.length) return 0;
    return prisma.dsaUserProgress.count({
      where: { userId, problemId: { in: problemIds }, status: 'SOLVED' },
    });
  }

  // ── Path Problems ──
  async getPathProblems(userId, slug, filters) {
    const path = await dsaRepository.getPathBySlug(slug);
    if (!path) throw new NotFoundError('Path');
    const result = await dsaRepository.getPathProblems(path.id, userId, filters);
    return {
      data: result.rows.map(r => ({
        id: r.problem.id,
        title: r.problem.title,
        slug: r.problem.slug,
        difficulty: r.problem.difficulty,
        url: r.problem.url,
        topic: r.topic,
        subtopic: r.subtopic,
        tags: r.problem.tags,
        estimatedTime: r.problem.estimatedTime,
        platform: r.problem.platform,
        leetcodeUrl: r.problem.leetcodeUrl,
        paths: r.problem.pathProblems ? r.problem.pathProblems.map(pp => pp.path.name) : [],
        orderIndex: r.orderIndex,
        status: r.problem.userProgress[0]?.status || 'TODO',
        confidence: r.problem.userProgress[0]?.confidence || 0,
        xpEarned: r.problem.userProgress[0]?.xpEarned || 0,
        solvedAt: r.problem.userProgress[0]?.solvedAt || null,
        notes: r.problem.userProgress[0]?.notes || '',
      })),
      pagination: { page: result.page, limit: result.limit, total: result.total },
    };
  }

  // ── Problem Detail ──
  async getProblemDetail(userId, id) {
    const problem = await dsaRepository.getProblemById(id);
    if (!problem) throw new NotFoundError('Problem');
    const progress = await dsaRepository.getUserProgress(userId, id);
    const revisionLogs = await dsaRepository.getRevisionLogs(userId, id);

    return {
      ...problem,
      userProgress: progress || { status: 'TODO', attemptCount: 0, confidence: 0, notes: '' },
      revisionHistory: revisionLogs,
      paths: problem.pathProblems.map(pp => ({
        pathName: pp.path.name,
        pathSlug: pp.path.slug,
        topic: pp.topic,
        subtopic: pp.subtopic,
      })),
    };
  }

  // ── Solve Problem (with Overlap Engine) ──
  async solveProblem(userId, problemId, data = {}) {
    const problem = await dsaRepository.getProblemById(problemId);
    if (!problem) throw new NotFoundError('Problem');

    // 1. Get all overlapping problem IDs
    const overlappingIds = await dsaRepository.getOverlappingProblemIds(problemId);
    const allIds = [...new Set([problemId, ...overlappingIds])];

    // 2. Calculate XP
    const xp = XP_MAP[problem.difficulty] || 10;
    const revisionDue = new Date();
    revisionDue.setDate(revisionDue.getDate() + REVISION_INTERVALS[0]);

    // 3. Batch upsert progress for all overlapping problems
    const progressData = {
      status: 'SOLVED',
      solvedAt: new Date(),
      confidence: data.confidence || 70,
      xpEarned: xp,
      attemptCount: { increment: 1 },
      revisionDue,
    };

    // For batch, we can't use increment, so handle individually
    for (const pid of allIds) {
      const existing = await dsaRepository.getUserProgress(userId, pid);
      await dsaRepository.upsertUserProgress(userId, pid, {
        status: 'SOLVED',
        solvedAt: new Date(),
        confidence: data.confidence || 70,
        xpEarned: xp,
        attemptCount: (existing?.attemptCount || 0) + 1,
        revisionDue,
      });
    }

    // 4. Award XP to user
    await awardXp(userId, xp);

    // 5. Update path progress for all affected paths
    const affectedPathIds = new Set();
    for (const pid of allIds) {
      const prob = await dsaRepository.getProblemById(pid);
      if (prob?.pathProblems) {
        prob.pathProblems.forEach(pp => affectedPathIds.add(pp.pathId));
      }
    }

    for (const pathId of affectedPathIds) {
      const solvedCount = await dsaRepository.getPathSolvedCount(userId, pathId);
      const path = await prisma.dsaPath.findUnique({ where: { id: pathId } });
      const totalProblems = path?.totalProblems || 1;
      const currentProgress = await prisma.dsaPathProgress.findUnique({
        where: { userId_pathId: { userId, pathId } }
      });
      const newXpEarned = (currentProgress?.xpEarned || 0) + xp;
      
      await dsaRepository.upsertPathProgress(userId, pathId, {
        solvedCount,
        completionPct: Math.round((solvedCount / totalProblems) * 100),
        xpEarned: newXpEarned,
      });
    }

    // 6. Update topic mastery
    for (const pid of [problemId]) {
      const prob = await dsaRepository.getProblemById(pid);
      if (prob?.pathProblems) {
        for (const pp of prob.pathProblems) {
          await this._updateTopicMastery(userId, pp.topic);
        }
      }
    }

    // 7. Update pattern mastery
    if (problem.patterns?.length) {
      for (const pattern of problem.patterns) {
        await this._updatePatternMastery(userId, pattern);
      }
    }

    // 8. Update heatmap
    await dsaRepository.upsertHeatmapEntry(userId, new Date(), { countIncrement: 1, xpIncrement: xp });

    return { solved: allIds.length, xpAwarded: xp, overlaps: allIds.length - 1 };
  }

  async _updateTopicMastery(userId, topic) {
    const total = await prisma.dsaPathProblem.count({ where: { topic } });
    const problemIds = (await prisma.dsaPathProblem.findMany({
      where: { topic }, select: { problemId: true }, distinct: ['problemId'],
    })).map(r => r.problemId);
    const solved = await prisma.dsaUserProgress.count({
      where: { userId, problemId: { in: problemIds }, status: 'SOLVED' },
    });
    const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
    await dsaRepository.upsertTopicMastery(userId, topic, {
      solvedCount: solved, totalCount: total, masteryPct: pct, weakScore: 100 - pct,
    });
  }

  async _updatePatternMastery(userId, pattern) {
    const total = await prisma.dsaProblem.count({ where: { patterns: { has: pattern } } });
    const allWithPattern = (await prisma.dsaProblem.findMany({
      where: { patterns: { has: pattern } }, select: { id: true },
    })).map(r => r.id);
    const solved = await prisma.dsaUserProgress.count({
      where: { userId, problemId: { in: allWithPattern }, status: 'SOLVED' },
    });
    const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
    await dsaRepository.upsertPatternMastery(userId, pattern, {
      solvedCount: solved, totalCount: total, masteryPct: pct,
    });
  }

  // ── Update Status ──
  async updateProblemStatus(userId, problemId, status) {
    const problem = await dsaRepository.getProblemById(problemId);
    if (!problem) throw new NotFoundError('Problem');
    return dsaRepository.upsertUserProgress(userId, problemId, { status });
  }

  // ── Update Notes ──
  async updateProblemNotes(userId, problemId, notes) {
    return dsaRepository.upsertUserProgress(userId, problemId, { notes });
  }

  // ── Revise Problem ──
  async reviseProblem(userId, problemId, performance) {
    const problem = await dsaRepository.getProblemById(problemId);
    if (!problem) throw new NotFoundError('Problem');

    const progress = await dsaRepository.getUserProgress(userId, problemId);
    const revisionCount = (progress?.attemptCount || 1);

    // Calculate next interval based on performance
    let intervalIndex;
    if (performance === 'good') {
      intervalIndex = Math.min(revisionCount, REVISION_INTERVALS.length - 1);
    } else if (performance === 'ok') {
      intervalIndex = Math.max(0, revisionCount - 1);
    } else {
      intervalIndex = 0; // bad → reset
    }

    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + REVISION_INTERVALS[intervalIndex]);

    // Update progress
    await dsaRepository.upsertUserProgress(userId, problemId, {
      status: 'REVISING',
      revisionDue: nextDue,
      confidence: performance === 'good' ? Math.min((progress?.confidence || 50) + 10, 100) :
                  performance === 'bad' ? Math.max((progress?.confidence || 50) - 20, 0) :
                  progress?.confidence || 50,
    });

    // Log revision
    await dsaRepository.createRevisionLog({
      userId, problemId, revisionCount, performance,
    });

    // Award XP
    await awardXp(userId, REVISION_XP);
    await dsaRepository.upsertHeatmapEntry(userId, new Date(), { countIncrement: 1, xpIncrement: REVISION_XP });

    return { nextDue, xpAwarded: REVISION_XP, performance };
  }

  // ── Revision Queue ──
  async getRevisionQueue(userId) {
    const queue = await dsaRepository.getRevisionQueue(userId, 20);
    return queue.map(r => ({
      id: r.problem.id,
      title: r.problem.title,
      difficulty: r.problem.difficulty,
      topic: r.problem.pathProblems[0]?.topic || '',
      path: r.problem.pathProblems[0]?.path?.name || '',
      dueDate: r.revisionDue,
      confidence: r.confidence,
    }));
  }

  // ── Weakness ──
  async getWeakness(userId) {
    const [weakTopics, patterns] = await Promise.all([
      dsaRepository.getWeakTopics(userId, 5),
      dsaRepository.getPatternMastery(userId),
    ]);

    const weakPatterns = patterns.filter(p => p.masteryPct < 50).slice(0, 5);

    return {
      topics: weakTopics.map(t => ({
        topic: t.topic, masteryPct: t.masteryPct, solvedCount: t.solvedCount, totalCount: t.totalCount,
      })),
      patterns: weakPatterns.map(p => ({
        pattern: p.pattern, masteryPct: p.masteryPct, solvedCount: p.solvedCount, totalCount: p.totalCount,
      })),
    };
  }

  // ── Recommendations ──
  async getRecommendations(userId) {
    const [weakTopics, revisionQueue, activePath] = await Promise.all([
      dsaRepository.getWeakTopics(userId, 5),
      dsaRepository.getRevisionQueue(userId, 4),
      dsaRepository.getActivePath(userId),
    ]);

    const tasks = [];
    const weakTopicNames = weakTopics.map(t => t.topic);

    // Add revision tasks
    revisionQueue.forEach(r => {
      tasks.push({
        type: 'revision',
        text: `Revise: ${r.problem.title}`,
        xp: REVISION_XP,
        problemId: r.problem.id,
      });
    });

    // Add weak topic tasks
    if (weakTopicNames.length > 0) {
      const weakProblems = await dsaRepository.getUnsolvedByTopicAndTags(userId, weakTopicNames, [], 5);
      weakProblems.forEach(p => {
        tasks.push({
          type: 'solve',
          text: `Solve: ${p.title}`,
          xp: XP_MAP[p.difficulty] || 10,
          problemId: p.id,
          difficulty: p.difficulty,
        });
      });
    }

    // Daily XP goal
    const todayEntry = await dsaRepository.getHeatmap(userId, new Date(new Date().setHours(0, 0, 0, 0)), new Date());
    const todayXp = todayEntry[0]?.xpEarned || 0;
    const dailyGoal = 180;

    return {
      tasks: tasks.slice(0, 8),
      dailyProgress: Math.min(Math.round((todayXp / dailyGoal) * 100), 100),
      xpCurrent: todayXp,
      xpGoal: dailyGoal,
    };
  }

  // ── Company Mode ──
  async getCompanyMode(userId) {
    const activeJobs = await dsaRepository.getActiveJobApplications(userId);
    if (!activeJobs.length) return { active: false, companies: [] };

    const companies = [];
    for (const job of activeJobs.slice(0, 3)) {
      const maps = await dsaRepository.getCompanyMaps(job.company);
      if (maps.length) {
        const topicProgress = [];
        for (const topic of maps[0].topics.slice(0, 4)) {
          const total = await prisma.dsaPathProblem.count({ where: { topic: { contains: topic, mode: 'insensitive' } } });
          const problemIds = (await prisma.dsaPathProblem.findMany({
            where: { topic: { contains: topic, mode: 'insensitive' } },
            select: { problemId: true }, distinct: ['problemId'], take: 100,
          })).map(r => r.problemId);
          const solved = problemIds.length ? await prisma.dsaUserProgress.count({
            where: { userId, problemId: { in: problemIds }, status: 'SOLVED' },
          }) : 0;
          topicProgress.push({ topic, solved, total: Math.min(total, 25) });
        }
        companies.push({ company: job.company, role: job.role, topics: topicProgress });
      }
    }

    return { active: companies.length > 0, companies };
  }

  // ── Pattern Mastery ──
  async getPatternMastery(userId) {
    return dsaRepository.getPatternMastery(userId);
  }

  // ── Heatmap ──
  async getHeatmap(userId) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    return dsaRepository.getHeatmap(userId, startDate, endDate);
  }

  // ── Search ──
  async searchProblems(userId, query) {
    const results = await dsaRepository.searchProblems(query, 20);
    return results.map(p => ({
      id: p.id, title: p.title, difficulty: p.difficulty, platform: p.platform,
      tags: p.tags, paths: p.pathProblems.map(pp => pp.path.name),
    }));
  }

  // ── Set Active Path ──
  async setActivePath(userId, pathSlug) {
    const path = await dsaRepository.getPathBySlug(pathSlug);
    if (!path) throw new NotFoundError('Path');
    await dsaRepository.updateActivePath(userId, path.id);
    return { pathId: path.id, pathName: path.name };
  }

  // ── Quick Resume ──
  async getQuickResume(userId) {
    const activePath = await dsaRepository.getActivePath(userId);
    if (!activePath) return null;

    const lastSolved = await dsaRepository.getLastSolvedInPath(userId, activePath.id);
    const lastOrder = lastSolved?.problem?.pathProblems?.[0]?.orderIndex ?? -1;
    const nextUnsolved = await dsaRepository.getNextUnsolvedInPath(userId, activePath.id, lastOrder);

    if (!nextUnsolved) return null;

    return {
      pathName: activePath.name,
      pathSlug: activePath.slug,
      topic: nextUnsolved.topic,
      nextProblem: { id: nextUnsolved.problem.id, title: nextUnsolved.problem.title },
      eta: nextUnsolved.problem.estimatedTime,
    };
  }
}

export const dsaService = new DsaService();
