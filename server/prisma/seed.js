import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database comprehensively (180 Days) with REALISTIC & MASSIVE DATA...');

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
  await prisma.githubConnection.deleteMany({ where: { userId: user.id } });
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
    { name: 'System Design', icon: 'layers', color: '#8b5cf6', category: 'career', frequency: 'DAILY' },
    { name: 'LeetCode', icon: 'code-2', color: '#f59e0b', category: 'career', frequency: 'DAILY' },
  ];
  const habits = [];
  for (const h of habitsData) {
    habits.push(await prisma.habit.create({ data: { ...h, userId: user.id } }));
  }

  // ── 3. Generate 180 Days Sequence ──
  console.log('⏳ Generating 180 days of daily logs (Habits, Reflections, Fitness, Focus, DSA, Finance)...');
  const dsaProblems = await prisma.dsaProblem.findMany({ take: 500 });
  let dsaIndex = 0;
  
  const dsaPath = await prisma.dsaPath.findFirst();
  let currentWeight = 78.0; 
  const topicStats = {};
  const patternStats = {};
  let dsaSolvedCount = 0;

  for (let d = 180; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    date.setHours(12, 0, 0, 0); 

    const dateOnly = new Date(date.toISOString().split('T')[0]);
    let dayXp = 0;
    let dsaCountToday = 0;

    // --- Habits ---
    for (const habit of habits) {
      if (Math.random() > 0.3) { 
        await prisma.habitLog.create({
          data: { habitId: habit.id, userId: user.id, completedAt: dateOnly }
        });
        totalXp += 5;
      }
    }

    // --- Reflection ---
    if (Math.random() > 0.4) {
      const mood = Math.floor(Math.random() * 4) + 6; 
      await prisma.reflection.create({
        data: {
          userId: user.id,
          type: 'DAILY',
          title: `Reflection - Day ${180 - d}`,
          content: `Focused heavily on system design and scaling microservices today. Debugging took longer than expected but resolving it felt great.`,
          mood,
          tags: ['focus', 'learning', 'career', 'coding'].sort(() => 0.5 - Math.random()).slice(0, 3),
          gratitude: 'Smooth deployments and resolving a critical bug.',
          improvements: 'Need to write more unit tests before pushing to staging.',
          date: dateOnly,
        }
      });
    }

    // --- Fitness & Workouts ---
    currentWeight += (Math.random() * 0.4 - 0.2);
    await prisma.fitnessLog.create({
      data: {
        userId: user.id, date: dateOnly, weight: parseFloat(currentWeight.toFixed(1)),
        steps: Math.floor(Math.random() * 6000) + 4000, water: parseFloat((Math.random() * 2 + 1.5).toFixed(1)),
        sleep: parseFloat((Math.random() * 3 + 5.0).toFixed(1)),
      }
    });

    if (Math.random() > 0.5) {
      await prisma.workout.create({
        data: {
          userId: user.id, date: dateOnly, type: 'Strength',
          name: ['Push Day', 'Pull Day', 'Leg Day', 'Core & Cardio'][Math.floor(Math.random()*4)],
          duration: Math.floor(Math.random() * 40) + 40,
          caloriesBurned: Math.floor(Math.random() * 300) + 200,
          exercises: [{ name: 'Squats', sets: 4, reps: 8, weight: 85 }],
        }
      });
    }

    // --- Focus Sessions ---
    const focusCount = Math.floor(Math.random() * 3) + 1;
    for (let f = 0; f < focusCount; f++) {
      const mins = [25, 50, 90][Math.floor(Math.random()*3)];
      await prisma.focusSession.create({
        data: {
          userId: user.id, duration: mins, actualMins: mins,
          label: ['Coding', 'System Design', 'Debugging'][Math.floor(Math.random()*3)],
          completedAt: new Date(date.getTime() + f * 3600000), createdAt: date,
        }
      });
      totalXp += Math.floor(mins / 5);
    }

    // --- DSA ---
    if (Math.random() > 0.3 && dsaIndex < dsaProblems.length) { 
      const probsToday = Math.floor(Math.random() * 3) + 1;
      for (let p = 0; p < probsToday && dsaIndex < dsaProblems.length; p++) {
        const prob = dsaProblems[dsaIndex++];
        const difficultyXp = prob.difficulty === 'Easy' ? 10 : prob.difficulty === 'Medium' ? 20 : 30;
        
        await prisma.dsaUserProgress.create({
          data: {
            userId: user.id, problemId: prob.id, status: 'SOLVED', solvedAt: date, createdAt: date, updatedAt: date,
            xpEarned: difficultyXp, attemptCount: Math.floor(Math.random() * 3) + 1, timeSpent: Math.floor(Math.random() * 40) + 10,
          }
        });
        dsaCountToday++;
        dayXp += difficultyXp;
        totalXp += difficultyXp;
        dsaSolvedCount++;

        if (prob.tags && prob.tags.length > 0) { prob.tags.forEach(t => { topicStats[t] = (topicStats[t] || 0) + 1; }); } 
        else { topicStats['Arrays'] = (topicStats['Arrays'] || 0) + 1; }
        if (prob.patterns && prob.patterns.length > 0) { prob.patterns.forEach(pt => { patternStats[pt] = (patternStats[pt] || 0) + 1; }); } 
        else { patternStats['Two Pointers'] = (patternStats['Two Pointers'] || 0) + 1; }
      }
    }

    if (dsaCountToday > 0) {
      await prisma.dsaHeatmap.create({ data: { userId: user.id, date: dateOnly, count: dsaCountToday, xpEarned: dayXp } });
    }

    // --- Transactions ---
    if (Math.random() > 0.4) {
      await prisma.transaction.create({
        data: {
          userId: user.id, type: 'EXPENSE', amount: Math.floor(Math.random() * 1500) + 50,
          category: ['Food', 'Transport', 'Shopping', 'Utilities'][Math.floor(Math.random()*4)], date: dateOnly
        }
      });
    }
  }

  // Monthly income
  for (let m = 0; m < 6; m++) {
    const monthDate = new Date(now.getTime() - m * 30 * 86400000);
    await prisma.transaction.create({ data: { userId: user.id, type: 'INCOME', amount: 95000, category: 'Salary', date: monthDate } });
  }

  // ── 4. DSA Masteries ──
  for (const topic of Object.keys(topicStats)) {
    await prisma.dsaTopicMastery.create({ data: { userId: user.id, topic, solvedCount: topicStats[topic], totalCount: topicStats[topic] + 5, masteryPct: 80 } });
  }
  for (const pt of Object.keys(patternStats)) {
    await prisma.dsaPatternMastery.create({ data: { userId: user.id, pattern: pt, solvedCount: patternStats[pt], totalCount: patternStats[pt] + 5, masteryPct: 80 } });
  }
  if (dsaPath) {
    await prisma.dsaPathProgress.create({ data: { userId: user.id, pathId: dsaPath.id, solvedCount: dsaSolvedCount, xpEarned: dsaSolvedCount * 15, completionPct: 60 } });
    await prisma.dsaUnlockedPath.upsert({ where: { userId_pathId: { userId: user.id, pathId: dsaPath.id } }, update: {}, create: { userId: user.id, pathId: dsaPath.id } });
  }

  // ── 5. Goals ──
  console.log('⏳ Generating Real Goals...');
  for (let g = 0; g < 12; g++) { 
    const start = new Date(now.getTime() - Math.floor(Math.random() * 120 + 20) * 86400000);
    const end = new Date(start.getTime() + 14 * 86400000);
    await prisma.goal.create({
      data: {
        userId: user.id, title: `Complete System Design Architecture Level ${g+1}`, type: 'MONTHLY', status: 'COMPLETED', progress: 100, startDate: start, endDate: end, category: 'LEARNING',
        milestones: { create: [{ title: 'Research distributed systems', isCompleted: true, completedAt: start }, { title: 'Implement sharding', isCompleted: true, completedAt: end }]}
      }
    });
  }

  // ── 6. Jobs ──
  console.log('⏳ Generating Realistic Job Applications...');
  const companies = ['Google', 'Meta', 'Amazon', 'Netflix', 'Uber', 'Stripe', 'Airbnb', 'Spotify', 'Databricks', 'Snowflake', 'Robinhood'];
  const roles = ['Senior Software Engineer', 'Full Stack Developer', 'Backend Systems Engineer', 'Staff Engineer', 'Cloud Architect'];
  const jobApplications = [];
  
  for (let j = 0; j < 35; j++) {
    const comp = companies[j % companies.length];
    const role = roles[Math.floor(Math.random() * roles.length)];
    const status = ['APPLIED', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER', 'REJECTED'][Math.floor(Math.random()*5)];
    const appliedDate = new Date(now.getTime() - Math.floor(Math.random() * 120 + 5) * 86400000);
    
    const job = await prisma.jobApplication.create({
      data: {
        userId: user.id, company: comp, role, type: 'FULL_TIME', status, salary: `₹${Math.floor(Math.random()*40)+30} LPA`, location: 'Remote',
        appliedDate, source: 'LinkedIn', requiredSkills: ['React', 'Node.js', 'System Design', 'PostgreSQL', 'Redis', 'Kafka', 'AWS', 'Go', 'Docker'].sort(()=>0.5-Math.random()).slice(0,5), 
        workMode: 'Remote', description: `Seeking a highly experienced 10x engineer for ${role} to scale microservices.`, companyInfo: `${comp} is a global tech leader.`, matchScore: Math.floor(Math.random() * 20) + 80,
        checklist: [{ id: 'c1', type: 'resume', text: 'Tailor Resume', completed: true }],
        aiPrepData: { skillBreakdown: [{ name: "DSA", pct: 30 }, { name: "System Design", pct: 40 }, { name: "React", pct: 30 }] }, 
        aiPrepStatus: 'completed', prepStarted: true, prepProgress: 80, prepConfidence: 85,
      }
    });
    jobApplications.push(job);
  }

  // ── 7. Projects System V2 (Rich, Real Data) ──
  console.log('⏳ Generating 20 Highly Realistic Projects...');
  await prisma.githubConnection.create({
    data: { userId: user.id, githubId: '12345678', username: 'souravdash08', avatar: 'https://avatars.githubusercontent.com/u/12345678?v=4', email: 'sourav@level.up', accessToken: 'encrypted_dummy', connectedAt: new Date(now.getTime() - 150 * 86400000), lastSyncedAt: now }
  });

  const projectBlueprints = [
    { title: 'LevelUp Life OS', status: 'BUILDING', priority: 'CRITICAL', stack: ['React', 'Node.js', 'PostgreSQL', 'Prisma', 'Tailwind'], desc: 'A premium lifestyle operating system integrating habits, goals, DSA tracking, and job pipelines into a single beautiful interface. Built with Vite and Express.' },
    { title: 'Aura Flow AI', status: 'SHIPPED', priority: 'HIGH', stack: ['Next.js', 'TypeScript', 'OpenAI', 'Redis'], desc: 'AI-powered workflow automation tool that summarizes emails, manages calendars, and drafts responses using LLMs.' },
    { title: 'Nexus Trading Bot', status: 'TESTING', priority: 'MEDIUM', stack: ['Python', 'FastAPI', 'Pandas', 'Binance API'], desc: 'Algorithmic trading engine leveraging mean-reversion and momentum strategies to execute high-frequency crypto trades.' },
    { title: 'CloudSync CLI', status: 'SHIPPED', priority: 'MEDIUM', stack: ['Go', 'Cobra', 'AWS S3'], desc: 'A blazing fast command-line tool for bi-directional folder syncing with AWS S3, utilizing concurrent goroutines for optimal throughput.' },
    { title: 'Graph CMS', status: 'PLANNING', priority: 'HIGH', stack: ['React', 'GraphQL', 'Apollo', 'MongoDB'], desc: 'Headless content management system allowing marketing teams to define schema dynamically and query via a robust GraphQL API.' },
    { title: 'Microservices Auth Template', status: 'SHIPPED', priority: 'LOW', stack: ['Node.js', 'Express', 'JWT', 'Redis'], desc: 'Open-source authentication microservice template featuring role-based access control, refresh tokens, and rate limiting.' },
    { title: 'Web3 NFT Marketplace', status: 'ARCHIVED', priority: 'LOW', stack: ['Solidity', 'React', 'Ethers.js', 'IPFS'], desc: 'Decentralized application for minting, buying, and selling ERC-721 tokens with zero-knowledge proof integrations.' },
    { title: 'Real-time Chat Engine', status: 'SHIPPED', priority: 'HIGH', stack: ['React', 'Socket.io', 'Redis', 'PostgreSQL'], desc: 'Highly scalable chat infrastructure supporting thousands of concurrent connections using Redis Pub/Sub.' },
    { title: 'Algorithm Visualizer', status: 'SHIPPED', priority: 'MEDIUM', stack: ['React', 'Framer Motion', 'Zustand'], desc: 'Interactive educational platform to visualize sorting, pathfinding, and graph algorithms step-by-step.' },
    { title: 'Serverless Image Processor', status: 'SHIPPED', priority: 'LOW', stack: ['AWS Lambda', 'S3', 'Node.js', 'Sharp'], desc: 'Event-driven architecture that automatically resizes, compresses, and converts uploaded images to WebP.' },
    { title: 'DevOps Dashboard V2', status: 'BUILDING', priority: 'HIGH', stack: ['Vue.js', 'Go', 'Docker', 'Kubernetes API'], desc: 'Internal developer portal aggregating metrics from Kubernetes clusters, CI/CD pipelines, and server health.' },
    { title: 'React Native E-commerce', status: 'IDEA', priority: 'MEDIUM', stack: ['React Native', 'Expo', 'Stripe', 'Firebase'], desc: 'Cross-platform mobile application for boutique fashion brands with AR try-on features.' },
    { title: 'Rust Game Engine', status: 'IDEA', priority: 'LOW', stack: ['Rust', 'WGPU', 'ECS'], desc: 'Experimenting with memory-safe game development using an Entity Component System and modern graphics APIs.' },
    { title: 'Finance Tracker', status: 'SHIPPED', priority: 'HIGH', stack: ['SvelteKit', 'Supabase', 'Tailwind'], desc: 'Personal finance application connecting to bank APIs via Plaid to categorize expenses and generate monthly reports.' },
    { title: 'Machine Learning API', status: 'TESTING', priority: 'HIGH', stack: ['Python', 'TensorFlow', 'Flask', 'Docker'], desc: 'Containerized inference API serving a custom computer vision model capable of detecting manufacturing defects.' },
    { title: 'Distributed Key-Value Store', status: 'IDEA', priority: 'HIGH', stack: ['C++', 'gRPC', 'Raft'], desc: 'A custom distributed key-value database implementing the Raft consensus algorithm for leader election and log replication.' },
    { title: 'Smart Home IoT Controller', status: 'SHIPPED', priority: 'MEDIUM', stack: ['Python', 'Raspberry Pi', 'MQTT', 'React'], desc: 'Local network dashboard to control Philips Hue lights, smart plugs, and temperature sensors via MQTT protocols.' },
    { title: 'Code Review AI Agent', status: 'TESTING', priority: 'CRITICAL', stack: ['TypeScript', 'GitHub Actions', 'Anthropic API'], desc: 'Automated CI bot that analyzes pull requests, flags anti-patterns, and leaves inline code review comments using AI.' },
    { title: 'Streaming Data Pipeline', status: 'BUILDING', priority: 'HIGH', stack: ['Scala', 'Apache Kafka', 'Spark Streaming'], desc: 'Data engineering pipeline capable of ingesting and transforming millions of telemetry events per minute in real-time.' },
    { title: 'Open Source UI Library', status: 'SHIPPED', priority: 'MEDIUM', stack: ['React', 'Framer Motion', 'Radix UI', 'Storybook'], desc: 'A fully accessible, beautifully animated collection of React components published on NPM and used by 1,000+ developers.' }
  ];

  for (let i = 0; i < projectBlueprints.length; i++) {
    const bp = projectBlueprints[i];
    const createdAt = new Date(now.getTime() - Math.floor(Math.random() * 120 + 10) * 86400000);
    
    const project = await prisma.project.create({
      data: {
        userId: user.id, title: bp.title, slug: bp.title.toLowerCase().replace(/\s+/g, '-'), description: bp.desc,
        status: bp.status, priority: bp.priority, repoUrl: `https://github.com/souravdash08/${bp.title.replace(/\s+/g, '')}`,
        githubRepoId: `${Math.floor(Math.random() * 90000000)}`, liveUrl: `https://${bp.title.replace(/\s+/g, '').toLowerCase()}.app`,
        stack: bp.stack, deadline: ['BUILDING', 'PLANNING'].includes(bp.status) ? new Date(now.getTime() + 30 * 86400000) : null,
        createdAt, updatedAt: now
      }
    });

    // 6-10 Realistic Tasks
    const taskCount = Math.floor(Math.random() * 5) + 6;
    for (let t = 0; t < taskCount; t++) {
      await prisma.projectTask.create({
        data: {
          projectId: project.id,
          title: `Implement ${bp.stack[Math.floor(Math.random() * bp.stack.length)]} integration for ${['authentication', 'caching', 'routing', 'database schema', 'UI components', 'API endpoints', 'CI/CD deployment', 'unit testing'][Math.floor(Math.random()*8)]}`,
          description: `Requires setting up the provider, establishing connection pools, and ensuring strict type safety.`,
          status: ['todo', 'in_progress', 'done'][Math.floor(Math.random() * 3)],
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          xpReward: Math.floor(Math.random() * 20) + 10,
        }
      });
    }

    // 5-8 Realistic Learnings
    const learningCount = Math.floor(Math.random() * 4) + 5;
    for (let l = 0; l < learningCount; l++) {
      const type = ['learning', 'bug', 'architecture', 'pattern'][Math.floor(Math.random() * 4)];
      await prisma.projectLearning.create({
        data: {
          projectId: project.id,
          title: `${type === 'bug' ? 'Fixed memory leak in' : 'Optimized'} ${bp.stack[0]} implementation`,
          description: `Discovered that the previous approach caused excessive re-renders/connections. Refactored using advanced patterns to improve performance by 40%.`,
          type, tags: [bp.stack[0], type === 'bug' ? 'debugging' : 'optimization'], impactScore: Math.floor(Math.random() * 5) + 5,
        }
      });
    }

    // Metrics
    await prisma.projectMetrics.create({
      data: {
        projectId: project.id, commitCount: Math.floor(Math.random() * 250) + 20, prCount: Math.floor(Math.random() * 40) + 2,
        issueCount: Math.floor(Math.random() * 30) + 1, buildStreak: Math.floor(Math.random() * 21) + 1, lastCommitAt: new Date(now.getTime() - Math.floor(Math.random() * 5) * 86400000),
        velocityScore: Math.random() * 3 + 7, qualityScore: Math.random() * 3 + 7, portfolioScore: Math.random() * 3 + 7,
      }
    });

    // Intelligence
    await prisma.projectIntelligence.create({
      data: {
        projectId: project.id, architectureScore: Math.random() * 3 + 7, scalabilityScore: Math.random() * 3 + 7, resumeScore: Math.random() * 2 + 8,
        interviewScore: Math.random() * 3 + 7, recruiterScore: Math.random() * 3 + 7,
        missingSkills: ['E2E Testing', 'CI/CD Pipeline', 'Monitoring'].sort(()=>0.5-Math.random()).slice(0, 1),
        strengths: ['Clean Architecture', 'Modern Stack', 'Scalable Patterns', 'High Performance'],
        weaknesses: ['Documentation', 'Test Coverage'],
      }
    });

    // Sync with a Job Application
    if (['SHIPPED', 'TESTING'].includes(bp.status)) {
      const job = jobApplications[Math.floor(Math.random() * jobApplications.length)];
      await prisma.jobProjectMatch.create({
        data: {
          jobId: job.id, projectId: project.id, matchScore: Math.random() * 20 + 80,
          missingSkills: ['System Design', 'Scalability'],
          recommendedImprovements: ['Add more metrics', 'Enhance tests']
        }
      });
    }
  }

  await prisma.user.update({ where: { id: user.id }, data: { totalXp, level: Math.floor(totalXp / 500) + 1, activeDsaPathId: dsaPath?.id } });
  console.log(`🎉 Seeding complete! Generated 180 days of incredibly rich data. Total XP: ${totalXp}`);
}

main().catch(e => { console.error('❌ Seed error:', e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
