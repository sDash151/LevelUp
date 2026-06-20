import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'souravdilu78090@gmail.com';
  
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.log('User not found!');
    process.exit(1);
  }

  console.log(`Found user ${user.name} (${user.id}). Deleting all projects...`);

  const deleted = await prisma.project.deleteMany({
    where: { userId: user.id }
  });

  console.log(`Deleted ${deleted.count} projects and all associated data.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
