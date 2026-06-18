import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for Sourav Dash...');

  // 1. Find or create the user
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'souravdilu78090@gmail.com' },
        { name: 'Sourav Dash' }
      ]
    }
  });

  if (!user) {
    console.log('Creating new user Sourav Dash...');
    const passwordHash = await bcrypt.hash('password123', 12);
    user = await prisma.user.create({
      data: {
        name: 'Sourav Dash',
        email: 'souravdilu78090@gmail.com',
        passwordHash,
        totalXp: 1250,
        level: 4,
      }
    });
  } else {
    console.log(`Found existing user: ${user.name} (${user.email})`);
    // Update XP and level to match dashboard screenshot
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        totalXp: 1250,
        level: 4,
      }
    });
  }

  const userId = user.id;

  // 2. Clear old data to prevent conflicts/duplicates and start fresh
  console.log('Cleaning existing data for this user...');
  await prisma.habitLog.deleteMany({ where: { userId } });
  await prisma.habit.deleteMany({ where: { userId } });
  await prisma.focusSession.deleteMany({ where: { userId } });
  await prisma.reflection.deleteMany({ where: { userId } });
  await prisma.goal.deleteMany({ where: { userId } });
  await prisma.dsaProblem.deleteMany({ where: { userId } });
  await prisma.project.deleteMany({ where: { userId } });
  await prisma.transaction.deleteMany({ where: { userId } });
  await prisma.workout.deleteMany({ where: { userId } });
  await prisma.fitnessLog.deleteMany({ where: { userId } });

  // 3. Create habits
  console.log('Creating habits...');
  const habitsData = [
    { name: 'Morning Workout', icon: 'dumbbell', color: '#10b981', category: 'fitness', frequency: 'DAILY' },
    { name: 'Code DSA', icon: 'code', color: '#6366f1', category: 'career', frequency: 'DAILY' },
    { name: 'Read 20 Pages', icon: 'book-open', color: '#f59e0b', category: 'learning', frequency: 'DAILY' },
    { name: 'No Sugar', icon: 'apple', color: '#8b5cf6', category: 'health', frequency: 'DAILY' },
    { name: 'Meditate', icon: 'brain', color: '#a855f7', category: 'mindfulness', frequency: 'DAILY' },
  ];

  const habits = [];
  for (const h of habitsData) {
    const habit = await prisma.habit.create({ data: { ...h, userId } });
    habits.push(habit);
  }

  // 4. Create Habit Logs for the past 30 days
  // Let's create realistic log patterns:
  // - Current streak: 12 days (completed all/almost all habits for the last 12 days)
  // - Morning Workout: completed 18 times (90% success rate if we look at active days, let's complete it 27 out of 30 days)
  // - Code DSA: completed 24 times
  // - Read 20 Pages: completed 15 times
  // - No Sugar: completed 28 times
  // - Meditate: completed 12 times (40% success rate)
  console.log('Creating habit logs for past 30 days...');
  const today = new Date();
  
  // Custom completion profile for each habit
  const completionProfile = {
    'Morning Workout': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 20, 21, 22, 24, 25, 27, 28, 29], // 26 logs (approx 90% active days)
    'Code DSA': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 18, 19, 21, 22, 25, 26, 28, 29], // 24 logs
    'Read 20 Pages': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15, 20, 25], // 15 logs (missed today to match screenshot)
    'No Sugar': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 25, 26, 27, 28, 29], // 29 logs
    'Meditate': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 20], // 12 logs (40% success rate, missed today to match screenshot)
  };

  for (const h of habits) {
    const profile = completionProfile[h.name] || [];
    for (const dayOffset of profile) {
      const logDate = new Date(today);
      logDate.setDate(today.getDate() - dayOffset);
      logDate.setHours(0, 0, 0, 0);

      await prisma.habitLog.create({
        data: {
          habitId: h.id,
          userId,
          completedAt: logDate,
        }
      });
    }
  }

  // 5. Create Focus Sessions
  console.log('Creating focus sessions...');
  // For today (3h 20m = 200 minutes)
  await prisma.focusSession.create({
    data: {
      userId,
      duration: 120,
      actualMins: 120,
      label: 'DSA coding practice',
      createdAt: today,
    }
  });
  await prisma.focusSession.create({
    data: {
      userId,
      duration: 80,
      actualMins: 80,
      label: 'Reading & notes',
      createdAt: today,
    }
  });

  // Previous days
  for (let i = 1; i <= 10; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    await prisma.focusSession.create({
      data: {
        userId,
        duration: 90,
        actualMins: Math.floor(Math.random() * 30) + 70,
        label: 'Deep Work Session',
        createdAt: d,
      }
    });
  }

  // 6. Create Reflections (Mood Score)
  console.log('Creating reflections...');
  // Today's mood: Great (score 4)
  await prisma.reflection.create({
    data: {
      userId,
      type: 'DAILY',
      content: 'Productive day, completed core habits and exercises.',
      mood: 4, // Great
      date: new Date(today.toISOString().split('T')[0]),
    }
  });

  // Past days reflections
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    await prisma.reflection.create({
      data: {
        userId,
        type: 'DAILY',
        content: 'Reflecting on the progress today.',
        mood: Math.floor(Math.random() * 2) + 3, // 3 (Good) or 4 (Great)
        date: new Date(d.toISOString().split('T')[0]),
      }
    });
  }

  // 7. Create Goals
  console.log('Creating goals...');
  await prisma.goal.create({
    data: {
      title: 'Complete 30 DSA Problems',
      type: 'MONTHLY',
      status: 'IN_PROGRESS',
      progress: 75,
      startDate: new Date(today.getTime() - 15 * 86400000),
      endDate: new Date(today.getTime() + 15 * 86400000),
      userId,
      milestones: {
        create: [
          { title: 'Solve 10 Array Problems', isCompleted: true, completedAt: today },
          { title: 'Solve 10 String Problems', isCompleted: true, completedAt: today },
          { title: 'Solve 10 Graph Problems', isCompleted: false },
        ]
      }
    }
  });

  await prisma.goal.create({
    data: {
      title: 'Maintain 5-day active workout streak',
      type: 'WEEKLY',
      status: 'COMPLETED',
      progress: 100,
      startDate: new Date(today.getTime() - 6 * 86400000),
      endDate: new Date(today.getTime() - 1 * 86400000),
      userId,
      milestones: {
        create: [
          { title: 'Log 5 workouts', isCompleted: true, completedAt: today },
        ]
      }
    }
  });

  // 8. Create Projects
  console.log('Creating projects...');
  await prisma.project.create({
    data: {
      userId,
      name: 'LevelUP Productivity App',
      description: 'A premium habit tracker and personal growth dashboard.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      techStack: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Prisma'],
      startDate: new Date(today.getTime() - 30 * 86400000),
    }
  });

  // 9. Create DSA Problems
  console.log('Creating DSA problems...');
  const topics = ['Arrays', 'Strings', 'Dynamic Programming', 'Trees'];
  for (let i = 1; i <= 15; i++) {
    await prisma.dsaProblem.create({
      data: {
        userId,
        title: `Problem ${i} Title`,
        difficulty: i % 3 === 0 ? 'HARD' : i % 2 === 0 ? 'MEDIUM' : 'EASY',
        topic: topics[i % topics.length],
        status: i % 3 === 0 ? 'TODO' : 'SOLVED',
      }
    });
  }

  // 10. Create Workouts & Fitness Logs
  console.log('Creating workouts and fitness logs...');
  for (let i = 0; i < 15; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i * 2);
    await prisma.fitnessLog.create({
      data: {
        userId,
        date: d,
        weight: 72.5 - (i * 0.1),
        steps: Math.floor(Math.random() * 4000) + 8000,
        water: 3.0,
        sleep: 7.5,
      }
    }).catch(() => {});
  }

  console.log('🎉 Seeding successfully completed for Sourav Dash!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
