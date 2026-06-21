import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  try {
    const u = await prisma.user.findFirst();
    const todayStr = new Date().toISOString().split('T')[0];
    const prev = await prisma.analyticsSnapshot.findFirst({
      where: { userId: u.id, snapshotDate: { lt: todayStr } },
      orderBy: { snapshotDate: 'desc' }
    });
    console.log('PREV:', prev);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
