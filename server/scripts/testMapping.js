import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const exercises = await prisma.exerciseCatalog.findMany({
    where: {
      images: {
        isEmpty: false
      }
    },
    take: 3,
    select: {
      name: true,
      slug: true,
      images: true
    }
  });
  console.log(JSON.stringify(exercises, null, 2));
  await prisma.$disconnect();
}

run();
