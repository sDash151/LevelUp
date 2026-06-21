import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  try {
    await prisma.aIAnalyticsInsight.deleteMany({ where: { type: 'QUICK_INSIGHTS' }});
    console.log('Deleted QUICK_INSIGHTS cache');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
