import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Goals specifically (90 Days) with REALISTIC & MASSIVE DATA...');

  const user = await prisma.user.findUnique({
    where: { email: 'souravdilu78090@gmail.com' }
  });

  if (!user) {
    console.error('User not found. Please run the main seed script first.');
    return;
  }

  console.log('🧹 Clearing old goals data...');
  await prisma.goal.deleteMany({ where: { userId: user.id } });

  const now = new Date();
  
  // ── Generates 50 Massive Goals over 90 days ──
  console.log('⏳ Generating Huge Goals Data with deep consistency...');
  
  const goalTemplates = [
    { title: 'Master Distributed Systems Architecture', category: 'LEARNING', type: 'MONTHLY' },
    { title: 'Run a Half Marathon', category: 'FITNESS', type: 'MONTHLY' },
    { title: 'Finish 10 Books on Personal Growth', category: 'PERSONAL', type: 'MONTHLY' },
    { title: 'Learn Advanced Rust Memory Management', category: 'LEARNING', type: 'WEEKLY' },
    { title: 'Deploy a Serverless Analytics Pipeline', category: 'CAREER', type: 'MONTHLY' },
    { title: 'Reduce Body Fat by 5%', category: 'HEALTH', type: 'MONTHLY' },
    { title: 'Complete 100 Hard LeetCode Problems', category: 'CAREER', type: 'MONTHLY' },
    { title: 'Publish 3 Technical Blog Posts', category: 'CAREER', type: 'WEEKLY' },
    { title: 'Meditate for 30 Consecutive Days', category: 'HEALTH', type: 'MONTHLY' },
    { title: 'Learn Web3 and Solidity Basics', category: 'LEARNING', type: 'WEEKLY' },
    { title: 'Build a Custom Mechanical Keyboard', category: 'PERSONAL', type: 'MONTHLY' },
    { title: 'Hit 100kg Bench Press PR', category: 'FITNESS', type: 'MONTHLY' },
    { title: 'Refactor Auth Service to use gRPC', category: 'CAREER', type: 'WEEKLY' },
    { title: 'Master Advanced PostgreSQL Tuning', category: 'LEARNING', type: 'MONTHLY' },
    { title: 'Save $5,000 for Emergency Fund', category: 'PERSONAL', type: 'MONTHLY' }
  ];

  let goalsGenerated = 0;

  for (let i = 0; i < 45; i++) {
    const template = goalTemplates[i % goalTemplates.length];
    const isCompleted = Math.random() > 0.4;
    const status = isCompleted ? 'COMPLETED' : (Math.random() > 0.8 ? 'ABANDONED' : 'IN_PROGRESS');
    const progress = isCompleted ? 100 : Math.floor(Math.random() * 80) + 10;
    
    const startOffset = Math.floor(Math.random() * 90); // Up to 90 days ago
    const start = new Date(now.getTime() - startOffset * 86400000);
    const end = new Date(start.getTime() + (template.type === 'WEEKLY' ? 7 : 30) * 86400000);

    const msCount = Math.floor(Math.random() * 3) + 3; // 3-5 milestones
    const milestones = [];
    
    let msProgress = 0;
    for (let m = 0; m < msCount; m++) {
      const msCompleted = isCompleted || (status === 'IN_PROGRESS' && msProgress < progress / 100 * msCount);
      milestones.push({
        title: `${template.title.split(' ')[0]} Phase ${m + 1}`,
        isCompleted: msCompleted,
        completedAt: msCompleted ? new Date(start.getTime() + (m + 1) * 2 * 86400000) : null
      });
      if (msCompleted) msProgress++;
    }

    await prisma.goal.create({
      data: {
        userId: user.id,
        title: `${template.title} - Set ${Math.floor(i/goalTemplates.length) + 1}`,
        type: template.type,
        category: template.category,
        status: status,
        progress: progress,
        startDate: start,
        endDate: end,
        milestones: {
          create: milestones
        }
      }
    });
    goalsGenerated++;
  }

  console.log(`🎉 Seeding complete! Generated ${goalsGenerated} robust goals consistently across 90 days.`);
}

main()
  .catch(e => { console.error('❌ Goal Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
