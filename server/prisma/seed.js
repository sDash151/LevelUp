import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.$transaction(async (tx) => {
    // ── Create demo user ────────────────────────
    const passwordHash = await bcrypt.hash('password123', 12);
    const user = await tx.user.upsert({
      where: { email: 'demo@levelup.app' },
      update: {},
      create: {
        name: 'Demo User',
        email: 'demo@levelup.app',
        passwordHash,
      },
    });
    console.log(`✅ User: ${user.email}`);

    // ── Create habits ───────────────────────────
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
      const habit = await tx.habit.create({ data: { ...h, userId: user.id } });
      habits.push(habit);
    }
    console.log(`✅ ${habits.length} habits created`);

    // ── Create habit logs (past 7 days, random completions) ───
    let logCount = 0;
    for (const habit of habits) {
      for (let d = 0; d < 7; d++) {
        if (Math.random() > 0.35) {
          const date = new Date();
          date.setDate(date.getDate() - d);
          date.setHours(0, 0, 0, 0);
          await tx.habitLog.create({
            data: { habitId: habit.id, userId: user.id, completedAt: date },
          });
          logCount++;
        }
      }
    }
    console.log(`✅ ${logCount} habit logs created`);

    // ── Create goals ────────────────────────────
    const now = new Date();
    const goal1 = await tx.goal.create({
      data: {
        title: 'Ship portfolio website',
        type: 'WEEKLY',
        status: 'IN_PROGRESS',
        progress: 66,
        userId: user.id,
        startDate: new Date(now.getTime() - 5 * 86400000),
        endDate: new Date(now.getTime() + 2 * 86400000),
        milestones: {
          create: [
            { title: 'Design mockups', isCompleted: true, completedAt: new Date() },
            { title: 'Build components', isCompleted: true, completedAt: new Date() },
            { title: 'Deploy to Vercel', isCompleted: false },
          ],
        },
      },
    });

    const goal2 = await tx.goal.create({
      data: {
        title: 'Complete React advanced course',
        type: 'MONTHLY',
        status: 'IN_PROGRESS',
        progress: 50,
        userId: user.id,
        startDate: new Date(now.getTime() - 10 * 86400000),
        endDate: new Date(now.getTime() + 20 * 86400000),
        milestones: {
          create: [
            { title: 'Hooks deep dive', isCompleted: true, completedAt: new Date() },
            { title: 'State management patterns', isCompleted: false },
          ],
        },
      },
    });

    const goal3 = await tx.goal.create({
      data: {
        title: 'Read 2 books this month',
        type: 'MONTHLY',
        status: 'IN_PROGRESS',
        progress: 50,
        userId: user.id,
        startDate: new Date(now.getTime() - 15 * 86400000),
        endDate: new Date(now.getTime() + 15 * 86400000),
        milestones: {
          create: [
            { title: 'Atomic Habits', isCompleted: true, completedAt: new Date() },
            { title: 'Deep Work', isCompleted: false },
          ],
        },
      },
    });

    console.log(`✅ 3 goals created with milestones`);
  });

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
