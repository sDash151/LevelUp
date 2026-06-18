import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('No user found in DB. Please create an account first.');
    return;
  }

  console.log(`Found user: ${user.name} (${user.id})`);
  console.log('Cleaning up existing goals...');
  await prisma.goal.deleteMany({ where: { userId: user.id } });

  console.log('Seeding new goals...');

  const now = new Date();
  const nextSunday = new Date();
  nextSunday.setDate(now.getDate() + (7 - now.getDay())); // Set to next Sunday
  
  // Helper to generate past dates
  const daysAgo = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  };

  const goals = [
    {
      title: 'Workout 5x this week',
      description: 'Build consistency',
      type: 'WEEKLY',
      category: 'FITNESS',
      progress: 80,
      startDate: daysAgo(7),
      endDate: nextSunday,
      milestones: {
        create: [
          { title: 'Workout 1', isCompleted: true, completedAt: daysAgo(7) },
          { title: 'Workout 2', isCompleted: true, completedAt: daysAgo(6) },
          { title: 'Workout 3', isCompleted: true, completedAt: daysAgo(5) },
          { title: 'Workout 4', isCompleted: true, completedAt: daysAgo(4) },
          { title: 'Workout 5', isCompleted: true, completedAt: daysAgo(3) },
          { title: 'Workout 6', isCompleted: true, completedAt: daysAgo(2) },
          { title: 'Workout 7', isCompleted: true, completedAt: daysAgo(1) },
        ]
      }
    },
    {
      title: 'Solve 10 DSA Problems',
      description: 'Enhance problem solving',
      type: 'WEEKLY',
      category: 'LEARNING',
      progress: 60,
      startDate: daysAgo(7),
      endDate: nextSunday,
      milestones: {
        create: Array.from({ length: 10 }).map((_, i) => ({
          title: `Problem ${i + 1}`,
          isCompleted: i < 6,
          completedAt: i < 6 ? daysAgo(4) : null,
        }))
      }
    },
    {
      title: 'Read 20 Pages Daily',
      description: 'Grow knowledge',
      type: 'WEEKLY',
      category: 'PERSONAL',
      progress: 40,
      startDate: daysAgo(7),
      endDate: nextSunday,
      milestones: {
        create: [
          { title: 'Read Day 1', isCompleted: true, completedAt: daysAgo(2) },
          { title: 'Read Day 2', isCompleted: true, completedAt: daysAgo(1) },
          { title: 'Read Day 3', isCompleted: false },
          { title: 'Read Day 4', isCompleted: false },
          { title: 'Read Day 5', isCompleted: false },
        ]
      }
    },
    {
      title: 'Meditate 10 Minutes',
      description: 'Improve mindfulness',
      type: 'WEEKLY',
      category: 'HEALTH',
      progress: 0,
      startDate: daysAgo(7),
      endDate: nextSunday,
      milestones: {
        create: [
          { title: 'Session 1', isCompleted: false },
          { title: 'Session 2', isCompleted: false },
        ]
      }
    },
    {
      title: 'Drink 3L Water Daily',
      description: 'Stay hydrated',
      type: 'WEEKLY',
      category: 'HEALTH',
      progress: 100,
      status: 'COMPLETED',
      startDate: daysAgo(14),
      endDate: nextSunday,
      milestones: {
        create: Array.from({ length: 10 }).map((_, i) => ({
          title: `Day ${i + 1}`,
          isCompleted: true,
          completedAt: daysAgo(10 - i),
        }))
      }
    }
  ];

  for (const g of goals) {
    await prisma.goal.create({
      data: {
        ...g,
        userId: user.id,
      }
    });
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  const monthEnd = new Date();
  monthEnd.setMonth(monthEnd.getMonth() + 1, 0);

  const monthlyGoals = [
    {
      title: 'Workout 5x this week',
      description: 'Build consistency',
      type: 'MONTHLY',
      category: 'FITNESS',
      progress: 80,
      startDate: monthStart,
      endDate: monthEnd,
      milestones: {
        create: Array.from({ length: 20 }).map((_, i) => ({
          title: `Workout ${i + 1}`,
          isCompleted: i < 16,
          completedAt: i < 16 ? daysAgo(16 - i) : null,
        }))
      }
    },
    {
      title: 'Solve 10 DSA Problems',
      description: 'Enhance problem solving',
      type: 'MONTHLY',
      category: 'LEARNING',
      progress: 60,
      startDate: monthStart,
      endDate: monthEnd,
      milestones: {
        create: Array.from({ length: 10 }).map((_, i) => ({
          title: `Problem ${i + 1}`,
          isCompleted: i < 6,
          completedAt: i < 6 ? daysAgo(10 - i) : null,
        }))
      }
    },
    {
      title: 'Read 20 Pages Daily',
      description: 'Grow knowledge',
      type: 'MONTHLY',
      category: 'PERSONAL',
      progress: 40,
      startDate: monthStart,
      endDate: monthEnd,
      milestones: {
        create: Array.from({ length: 12 }).map((_, i) => ({
          title: `Read Day ${i + 1}`,
          isCompleted: i < 5,
          completedAt: i < 5 ? daysAgo(8 - i) : null,
        }))
      }
    },
    {
      title: 'Meditate 10 Minutes',
      description: 'Improve mindfulness',
      type: 'MONTHLY',
      category: 'HEALTH',
      progress: 20,
      startDate: monthStart,
      endDate: monthEnd,
      milestones: {
        create: Array.from({ length: 5 }).map((_, i) => ({
          title: `Session ${i + 1}`,
          isCompleted: i < 1,
          completedAt: i < 1 ? daysAgo(5) : null,
        }))
      }
    },
    {
      title: 'Drink 3L Water Daily',
      description: 'Stay hydrated',
      type: 'MONTHLY',
      category: 'HEALTH',
      progress: 100,
      status: 'COMPLETED',
      startDate: monthStart,
      endDate: monthEnd,
      milestones: {
        create: Array.from({ length: 15 }).map((_, i) => ({
          title: `Day ${i + 1}`,
          isCompleted: true,
          completedAt: daysAgo(15 - i),
        }))
      }
    },
    {
      title: 'Save $200 This Month',
      description: 'Financial discipline',
      type: 'MONTHLY',
      category: 'CAREER',
      progress: 70,
      startDate: monthStart,
      endDate: monthEnd,
      milestones: {
        create: Array.from({ length: 4 }).map((_, i) => ({
          title: `Week ${i + 1} savings`,
          isCompleted: i < 3,
          completedAt: i < 3 ? daysAgo(7 * (3 - i)) : null,
        }))
      }
    },
  ];

  for (const g of monthlyGoals) {
    await prisma.goal.create({ data: { ...g, userId: user.id } });
  }

  console.log('Seed complete! Weekly + Monthly goals created.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
