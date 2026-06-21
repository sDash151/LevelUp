import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  try {
    const i = await prisma.aIAnalyticsInsight.findFirst({
      where: { type: 'QUICK_INSIGHTS' },
      orderBy: { createdAt: 'desc' }
    });
    console.log(JSON.stringify(i, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
