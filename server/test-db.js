import { prisma } from './src/config/database.js';

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, isOnboarded: true, onboardingStep: true }
  });
  console.log(users);
}

main().finally(() => prisma.$disconnect());
