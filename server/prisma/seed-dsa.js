import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding DSA Specifically (90 Days) with MASSIVE DATA...');

  const user = await prisma.user.findUnique({
    where: { email: 'souravdilu78090@gmail.com' }
  });

  if (!user) {
    console.error('User not found. Please run the main seed script first.');
    return;
  }

  console.log('🧹 Clearing old DSA data...');
  await prisma.dsaUserProgress.deleteMany({ where: { userId: user.id } });
  await prisma.dsaHeatmap.deleteMany({ where: { userId: user.id } });
  await prisma.dsaPatternMastery.deleteMany({ where: { userId: user.id } });
  await prisma.dsaTopicMastery.deleteMany({ where: { userId: user.id } });
  await prisma.dsaPathProgress.deleteMany({ where: { userId: user.id } });
  await prisma.dsaRevisionLog.deleteMany({ where: { userId: user.id } });
  await prisma.dsaUnlockedPath.deleteMany({ where: { userId: user.id } });

  let problems = await prisma.dsaProblem.findMany();
  problems = problems.sort(() => 0.5 - Math.random());
  
  if (problems.length === 0) {
    console.error('No DSA Problems found in database. Run the DSA problem seed first.');
    return;
  }

  const dsaPath = await prisma.dsaPath.findFirst();

  const now = new Date();
  let totalDsaXp = 0;
  let dsaIndex = 0;
  let solvedProblems = [];
  
  const topicStats = {};
  const patternStats = {};

  console.log('⏳ Simulating 90 days of intense DSA grinding...');

  for (let d = 90; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    date.setHours(12, Math.floor(Math.random() * 60), 0, 0); 
    const dateOnly = new Date(date.toISOString().split('T')[0]);

    let dayCount = 0;
    let dayXp = 0;

    // Daily Solves
    if (Math.random() > 0.2 && dsaIndex < problems.length) { // 80% chance to do DSA on a day
      const probsToday = Math.floor(Math.random() * 5) + 1; // 1 to 5 problems
      
      for (let p = 0; p < probsToday && dsaIndex < problems.length; p++) {
        const prob = problems[dsaIndex++];
        const difficultyXp = prob.difficulty === 'Easy' ? 10 : prob.difficulty === 'Medium' ? 20 : 35;
        
        const progress = await prisma.dsaUserProgress.create({
          data: {
            userId: user.id,
            problemId: prob.id,
            status: 'SOLVED',
            attemptCount: Math.floor(Math.random() * 3) + 1,
            solvedAt: date,
            confidence: Math.floor(Math.random() * 30) + 70, // 70 to 100
            timeSpent: Math.floor(Math.random() * 45) + 15, // 15 to 60 mins
            xpEarned: difficultyXp,
            revisionDue: new Date(date.getTime() + (Math.floor(Math.random() * 10) + 3) * 86400000),
            notes: Math.random() > 0.7 ? `Tricky edge cases around index bounds. Used ${prob.patterns?.[0] || 'Brute force'} initially before optimizing.` : null,
            createdAt: new Date(date.getTime() - 86400000), // Created a day before solved
            updatedAt: date
          }
        });
        
        solvedProblems.push(progress);
        dayCount++;
        dayXp += difficultyXp;
        totalDsaXp += difficultyXp;

        // Tally Stats
        if (prob.tags && prob.tags.length > 0) {
          prob.tags.forEach(t => {
            const capitalized = t.charAt(0).toUpperCase() + t.slice(1);
            topicStats[capitalized] = (topicStats[capitalized] || 0) + 1;
          });
        } else {
          topicStats['Arrays'] = (topicStats['Arrays'] || 0) + 1;
        }

        if (prob.patterns && prob.patterns.length > 0) {
          prob.patterns.forEach(pt => patternStats[pt] = (patternStats[pt] || 0) + 1);
        } else {
          patternStats['Two Pointers'] = (patternStats['Two Pointers'] || 0) + 1;
        }
      }
    }

    // Daily Revisions
    if (solvedProblems.length > 10 && Math.random() > 0.4) {
      const revCount = Math.floor(Math.random() * 3) + 1;
      for (let r = 0; r < revCount; r++) {
        const randomSolved = solvedProblems[Math.floor(Math.random() * solvedProblems.length)];
        
        await prisma.dsaRevisionLog.create({
          data: {
            userId: user.id,
            problemId: randomSolved.problemId,
            revisionDate: date,
            revisionCount: Math.floor(Math.random() * 3) + 1,
            performance: ['excellent', 'good', 'struggled'][Math.floor(Math.random() * 3)],
            createdAt: date
          }
        });
        
        // Push the revision due date out
        await prisma.dsaUserProgress.update({
          where: { id: randomSolved.id },
          data: { revisionDue: new Date(date.getTime() + 14 * 86400000) }
        });
        
        dayCount++; // Count revisions towards daily activity heatmap
        dayXp += 5; // Small XP for revision
        totalDsaXp += 5;
      }
    }

    if (dayCount > 0) {
      await prisma.dsaHeatmap.create({
        data: {
          userId: user.id,
          date: dateOnly,
          count: dayCount,
          xpEarned: dayXp
        }
      });
    }
  }

  console.log("⏳ Generating explicit TODOs for Today's Focus...");
  for (let i = 0; i < 6; i++) {
    const prob = problems[dsaIndex++];
    await prisma.dsaUserProgress.create({
      data: {
        userId: user.id, problemId: prob.id, status: 'TODO',
        attemptCount: 0, createdAt: now, updatedAt: now,
        revisionDue: new Date(now.toISOString().split('T')[0]) // Due today
      }
    });
  }

  console.log('⏳ Calculating and seeding Masteries...');

  // Topic Masteries
  const topicEntries = Object.entries(topicStats);
  for (const [topic, count] of topicEntries) {
    await prisma.dsaTopicMastery.create({
      data: {
        userId: user.id,
        topic,
        solvedCount: count,
        totalCount: count + Math.floor(Math.random() * 10) + 2, // Dummy total available
        masteryPct: Math.min(100, Math.floor((count / (count + 2)) * 100)),
        weakScore: Math.random() > 0.2 ? Math.floor(Math.random() * 80) + 20 : 0
      }
    });
  }

  // Pattern Masteries
  const patternEntries = Object.entries(patternStats);
  for (const [pattern, count] of patternEntries) {
    await prisma.dsaPatternMastery.create({
      data: {
        userId: user.id,
        pattern,
        solvedCount: count,
        totalCount: count + Math.floor(Math.random() * 5) + 1,
        masteryPct: Math.min(100, Math.floor((count / (count + 2)) * 100))
      }
    });
  }

  const allPaths = await prisma.dsaPath.findMany({ take: 4 });
  let activePathId = null;

  for (const path of allPaths) {
    if (!activePathId) activePathId = path.id;
    await prisma.dsaUnlockedPath.upsert({
      where: { userId_pathId: { userId: user.id, pathId: path.id } },
      update: {},
      create: { userId: user.id, pathId: path.id, unlockedAt: new Date(now.getTime() - 90 * 86400000) }
    });

    await prisma.dsaPathProgress.create({
      data: {
        userId: user.id, pathId: path.id, solvedCount: Math.floor(solvedProblems.length / allPaths.length),
        xpEarned: Math.floor(totalDsaXp / allPaths.length), completionPct: Math.floor(Math.random() * 40) + 10
      }
    });
  }

  // Update user active path
  if (activePathId) {
    await prisma.user.update({
      where: { id: user.id },
      data: { activeDsaPathId: activePathId }
    });
  }

  console.log(`🎉 DSA Seeding complete! Processed 90 days. Solved: ${solvedProblems.length}. Total DSA XP: ${totalDsaXp}.`);
}

main()
  .catch(e => { console.error('❌ DSA Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
