import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database comprehensively (90 Days)...');

  const passwordHash = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'souravdilu78090@gmail.com' },
    update: {},
    create: { name: 'Sourav Dash', email: 'souravdilu78090@gmail.com', passwordHash },
  });
  console.log(`✅ User: ${user.email}`);

  // 1. Clear old data
  console.log('🧹 Clearing old user data...');
  await prisma.habit.deleteMany({ where: { userId: user.id } });
  await prisma.goal.deleteMany({ where: { userId: user.id } });
  await prisma.reflection.deleteMany({ where: { userId: user.id } });
  await prisma.jobApplication.deleteMany({ where: { userId: user.id } });
  await prisma.project.deleteMany({ where: { userId: user.id } });
  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.workout.deleteMany({ where: { userId: user.id } });
  await prisma.fitnessLog.deleteMany({ where: { userId: user.id } });
  await prisma.focusSession.deleteMany({ where: { userId: user.id } });
  
  await prisma.dsaUserProgress.deleteMany({ where: { userId: user.id } });
  await prisma.dsaHeatmap.deleteMany({ where: { userId: user.id } });
  await prisma.dsaPatternMastery.deleteMany({ where: { userId: user.id } });
  await prisma.dsaTopicMastery.deleteMany({ where: { userId: user.id } });
  await prisma.dsaPathProgress.deleteMany({ where: { userId: user.id } });
  await prisma.dsaRevisionLog.deleteMany({ where: { userId: user.id } });

  const now = new Date();
  let totalXp = 0;

  // ── 2. Habits ──
  const habitsData = [
    { name: 'Morning Meditation', icon: 'brain', color: '#8b5cf6', category: 'mindfulness', frequency: 'DAILY' },
    { name: 'Exercise', icon: 'dumbbell', color: '#10b981', category: 'fitness', frequency: 'DAILY' },
    { name: 'Read 30 mins', icon: 'book-open', color: '#f59e0b', category: 'learning', frequency: 'DAILY' },
    { name: 'Drink 3L Water', icon: 'droplets', color: '#06b6d4', category: 'health', frequency: 'DAILY' },
    { name: 'Code 2 hours', icon: 'code', color: '#6366f1', category: 'career', frequency: 'DAILY' },
    { name: 'Journal', icon: 'pen-line', color: '#ec4899', category: 'mindfulness', frequency: 'DAILY' },
  ];
  const habits = [];
  for (const h of habitsData) {
    habits.push(await prisma.habit.create({ data: { ...h, userId: user.id } }));
  }

  // ── 3. Generate 90 Days Sequence ──
  console.log('⏳ Generating 90 days of daily logs (Habits, Reflections, Fitness, Focus, DSA)...');
  const dsaProblems = await prisma.dsaProblem.findMany({ take: 300 });
  let dsaIndex = 0;
  
  const dsaPath = await prisma.dsaPath.findFirst();

  let currentWeight = 75.0; // Start weight

  const heatmapMap = new Map();
  const topicStats = {};
  const patternStats = {};
  let dsaSolvedCount = 0;

  for (let d = 90; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    date.setHours(12, 0, 0, 0); // Noon

    const dateOnly = new Date(date.toISOString().split('T')[0]);
    let dayXp = 0;
    let dsaCountToday = 0;

    // --- Habits ---
    for (const habit of habits) {
      if (Math.random() > 0.3) { // 70% completion rate
        await prisma.habitLog.create({
          data: { habitId: habit.id, userId: user.id, completedAt: dateOnly }
        });
        totalXp += 5; // 5 XP per habit
      }
    }

    // --- Reflection ---
    const mood = Math.floor(Math.random() * 4) + 6; // 6 to 9
    await prisma.reflection.create({
      data: {
        userId: user.id,
        type: 'DAILY',
        title: `Daily Reflection`,
        content: `Today went well. Just putting my thoughts down to clear my mind.`,
        mood,
        tags: ['focus', 'learning', 'workout'].sort(() => 0.5 - Math.random()).slice(0, 2),
        gratitude: 'Coffee and good code.',
        improvements: 'Sleep earlier.',
        date: dateOnly,
      }
    });

    // --- Fitness ---
    currentWeight += (Math.random() * 0.4 - 0.2); // Fluctuate weight
    await prisma.fitnessLog.create({
      data: {
        userId: user.id,
        date: dateOnly,
        weight: parseFloat(currentWeight.toFixed(1)),
        steps: Math.floor(Math.random() * 6000) + 4000,
        water: parseFloat((Math.random() * 2 + 1.5).toFixed(1)),
        sleep: parseFloat((Math.random() * 3 + 5.5).toFixed(1)),
      }
    });

    // --- Workout ---
    if (Math.random() > 0.5) { // 50% chance to workout
      await prisma.workout.create({
        data: {
          userId: user.id,
          date: dateOnly,
          type: 'Strength',
          name: ['Push Day', 'Pull Day', 'Leg Day', 'Full Body'][Math.floor(Math.random()*4)],
          duration: Math.floor(Math.random() * 30) + 45,
          caloriesBurned: Math.floor(Math.random() * 200) + 300,
          exercises: [{ name: 'Bench Press', sets: 3, reps: 10, weight: 60 }, { name: 'Squats', sets: 4, reps: 8, weight: 80 }],
        }
      });
    }

    // --- Focus Sessions ---
    const focusCount = Math.floor(Math.random() * 3) + 1;
    for (let f = 0; f < focusCount; f++) {
      const mins = [25, 50, 90][Math.floor(Math.random()*3)];
      await prisma.focusSession.create({
        data: {
          userId: user.id,
          duration: mins,
          actualMins: mins,
          label: ['Coding', 'Reading', 'System Design'][Math.floor(Math.random()*3)],
          completedAt: new Date(date.getTime() + f * 3600000),
          createdAt: date,
        }
      });
      totalXp += Math.floor(mins / 5); // 1 XP per 5 mins
    }

    // --- DSA ---
    if (Math.random() > 0.4 && dsaIndex < dsaProblems.length) { // 60% chance to solve problems
      const probsToday = Math.floor(Math.random() * 3) + 1;
      for (let p = 0; p < probsToday && dsaIndex < dsaProblems.length; p++) {
        const prob = dsaProblems[dsaIndex++];
        
        const isRevising = Math.random() > 0.85; // 15% due for revision
        const difficultyXp = prob.difficulty === 'Easy' ? 10 : prob.difficulty === 'Medium' ? 20 : 30;
        
        await prisma.dsaUserProgress.create({
          data: {
            userId: user.id,
            problemId: prob.id,
            status: isRevising ? 'REVISING' : 'SOLVED',
            solvedAt: date,
            createdAt: date,
            updatedAt: date,
            revisionDue: isRevising ? new Date(now.getTime() - Math.floor(Math.random() * 10) * 86400000) : null,
            xpEarned: difficultyXp,
            attemptCount: Math.floor(Math.random() * 3) + 1,
            timeSpent: Math.floor(Math.random() * 30) + 10,
          }
        });

        if (isRevising) {
          await prisma.dsaRevisionLog.create({
            data: { userId: user.id, problemId: prob.id, revisionDate: date, revisionCount: 1, performance: 'good' }
          });
        }

        dsaCountToday++;
        dayXp += difficultyXp;
        totalXp += difficultyXp;
        dsaSolvedCount++;

        // Track topics/patterns locally for masteries later
        if (prob.tags && prob.tags.length > 0) {
          prob.tags.forEach(t => {
            if (!topicStats[t]) topicStats[t] = 0;
            topicStats[t]++;
          });
        } else {
            if (!topicStats['Arrays']) topicStats['Arrays'] = 0;
            topicStats['Arrays']++;
        }
        
        if (prob.patterns && prob.patterns.length > 0) {
          prob.patterns.forEach(pt => {
            if (!patternStats[pt]) patternStats[pt] = 0;
            patternStats[pt]++;
          });
        } else {
            if (!patternStats['Two Pointers']) patternStats['Two Pointers'] = 0;
            patternStats['Two Pointers']++;
        }
      }
    }

    // Heatmap update
    if (dsaCountToday > 0) {
      await prisma.dsaHeatmap.create({
        data: { userId: user.id, date: dateOnly, count: dsaCountToday, xpEarned: dayXp }
      });
    }
  }

  console.log(`✅ 90 days generated! DSA Solved: ${dsaSolvedCount}`);

  // ── 4. DSA Masteries & Paths ──
  for (const topic of Object.keys(topicStats)) {
    await prisma.dsaTopicMastery.create({
      data: { userId: user.id, topic, solvedCount: topicStats[topic], totalCount: Math.max(20, topicStats[topic] + 5), masteryPct: Math.min(100, topicStats[topic] * 10) }
    });
  }
  for (const pt of Object.keys(patternStats)) {
    await prisma.dsaPatternMastery.create({
      data: { userId: user.id, pattern: pt, solvedCount: patternStats[pt], totalCount: Math.max(15, patternStats[pt] + 5), masteryPct: Math.min(100, patternStats[pt] * 15) }
    });
  }

  if (dsaPath) {
    await prisma.dsaPathProgress.create({
      data: { userId: user.id, pathId: dsaPath.id, solvedCount: dsaSolvedCount, xpEarned: dsaSolvedCount * 15, completionPct: Math.min(100, Math.floor((dsaSolvedCount / 450)*100)) }
    });
    await prisma.dsaUnlockedPath.upsert({ where: { userId_pathId: { userId: user.id, pathId: dsaPath.id } }, update: {}, create: { userId: user.id, pathId: dsaPath.id } });
  }

  // ── 5. Goals ──
  console.log('⏳ Generating Goals...');
  for (let g = 0; g < 5; g++) { // Past goals
    const start = new Date(now.getTime() - Math.floor(Math.random() * 30 + 40) * 86400000);
    const end = new Date(start.getTime() + 7 * 86400000);
    await prisma.goal.create({
      data: {
        userId: user.id, title: `Past Goal ${g+1}`, type: 'WEEKLY', status: 'COMPLETED', progress: 100, startDate: start, endDate: end,
        milestones: { create: [{ title: 'Milestone 1', isCompleted: true, completedAt: end }, { title: 'Milestone 2', isCompleted: true, completedAt: end }] }
      }
    });
  }
  for (let g = 0; g < 3; g++) { // Active goals
    const start = new Date(now.getTime() - Math.floor(Math.random() * 10) * 86400000);
    const end = new Date(start.getTime() + 15 * 86400000);
    await prisma.goal.create({
      data: {
        userId: user.id, title: `Current Goal ${g+1}`, type: 'MONTHLY', status: 'IN_PROGRESS', progress: 50, startDate: start, endDate: end,
        milestones: { create: [{ title: 'Milestone 1', isCompleted: true, completedAt: now }, { title: 'Milestone 2', isCompleted: false }] }
      }
    });
  }

  // ── 6. Jobs ──
  console.log('⏳ Generating Job Applications...');
  const companies = ['Google', 'Amazon', 'Microsoft', 'Atlassian', 'Meta', 'Netflix', 'Apple', 'Uber', 'Stripe', 'Airbnb', 'Spotify', 'Twitter'];
  const statuses = ['SAVED', 'APPLIED', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER', 'REJECTED'];
  for (let j = 0; j < 15; j++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const comp = companies[Math.floor(Math.random() * companies.length)];
    const appliedDate = new Date(now.getTime() - Math.floor(Math.random() * 80 + 10) * 86400000);
    
    const stageHistory = [
      { stage: 'SAVED', date: new Date(appliedDate.getTime() - 86400000).toISOString().split('T')[0] },
      { stage: 'APPLIED', date: appliedDate.toISOString().split('T')[0] },
    ];
    if (['PHONE_SCREEN', 'INTERVIEW', 'OFFER', 'REJECTED'].includes(status)) {
      stageHistory.push({ stage: 'PHONE_SCREEN', date: new Date(appliedDate.getTime() + 86400000 * 5).toISOString().split('T')[0] });
    }
    if (['INTERVIEW', 'OFFER', 'REJECTED'].includes(status)) {
      stageHistory.push({ stage: 'INTERVIEW', date: new Date(appliedDate.getTime() + 86400000 * 15).toISOString().split('T')[0] });
    }
    if (['OFFER', 'REJECTED'].includes(status)) {
      stageHistory.push({ stage: status, date: new Date(appliedDate.getTime() + 86400000 * 25).toISOString().split('T')[0] });
    }

    const aiPrepData = status !== 'SAVED' ? {
      skillBreakdown: [{ name: "DSA", pct: 40 }, { name: "System Design", pct: 30 }, { name: "React", pct: 30 }],
      roadmap: [{ day: 1, date: "Day 1", topics: [{ name: "Review Arrays", completed: true }] }],
      dsaTopics: [{ name: "Graphs", difficulty: "Medium", questions: 5, completed: 2 }],
      questions: [{ id: "q1", question: "Explain caching?", category: "System Design", difficulty: "Hard", practiced: false }],
      focusTasks: [{ id: "t1", text: "Mock Interview", completed: false }]
    } : null;

    await prisma.jobApplication.create({
      data: {
        userId: user.id, company: comp, role: 'Software Engineer', type: 'FULL_TIME', status, salary: '₹35 LPA', location: 'Bangalore',
        appliedDate, source: 'LinkedIn', requiredSkills: ['React', 'Node.js', 'System Design'], workMode: 'Hybrid',
        description: `Looking for a strong SWE at ${comp}.`, companyInfo: `${comp} is a leading tech company.`,
        matchScore: Math.floor(Math.random() * 30) + 70,
        checklist: [{ id: 'c1', type: 'resume', text: 'Tailor Resume', completed: true }],
        stageHistory, aiPrepData, aiPrepStatus: status !== 'SAVED' ? 'completed' : 'idle', prepStarted: status !== 'SAVED',
        prepProgress: Math.floor(Math.random() * 100), prepConfidence: Math.floor(Math.random() * 40) + 50,
      }
    });
  }

  // ── 7. Projects ──
  console.log('⏳ Generating Projects...');
  for (let p = 0; p < 4; p++) {
    await prisma.project.create({
      data: {
        userId: user.id, name: `Project ${p+1}`, description: `A cool side project ${p+1}`, status: p < 2 ? 'COMPLETED' : 'IN_PROGRESS', priority: 'MEDIUM',
        techStack: ['React', 'Node', 'PostgreSQL'], githubUrl: 'https://github.com/sourav/proj',
        startDate: new Date(now.getTime() - Math.floor(Math.random() * 60 + 20) * 86400000),
        endDate: p < 2 ? new Date(now.getTime() - 10 * 86400000) : null,
      }
    });
  }

  // ── 8. Transactions ──
  console.log('⏳ Generating Transactions...');
  for (let m = 0; m < 3; m++) { // 3 months
    const monthDate = new Date(now.getTime() - m * 30 * 86400000);
    await prisma.transaction.create({ data: { userId: user.id, type: 'INCOME', amount: 85000, category: 'Salary', date: monthDate } });
    for (let t = 0; t < 15; t++) { // 15 expenses per month
      await prisma.transaction.create({
        data: {
          userId: user.id, type: 'EXPENSE', amount: Math.floor(Math.random() * 2000) + 100,
          category: ['Food', 'Transport', 'Entertainment', 'Shopping'][Math.floor(Math.random()*4)],
          date: new Date(monthDate.getTime() - Math.floor(Math.random() * 28) * 86400000)
        }
      });
    }
  }

  // ── 9. Finalize User Stats ──
  await prisma.user.update({
    where: { id: user.id },
    data: { totalXp, level: Math.floor(totalXp / 500) + 1, activeDsaPathId: dsaPath?.id }
  });

  console.log(`🎉 Seeding complete! Generated 90 days of massive, consistent data. Total XP: ${totalXp}`);
}

main().catch(e => { console.error('❌ Seed error:', e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
