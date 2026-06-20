import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get all projects in the database
  const projects = await prisma.project.findMany({
    include: {
      learnings: true,
      intelligence: true,
    }
  });

  if (projects.length === 0) {
    console.log("No projects found in the database to seed learnings for.");
    return;
  }

  console.log(`Found ${projects.length} projects. Seeding learnings and intelligence...`);

  for (const project of projects) {
    // 1. Seed ProjectLearnings if empty
    if (project.learnings.length === 0) {
      const learningsToCreate = [
        {
          title: `Optimized ${project.title} Database Queries`,
          description: `Identified an N+1 query issue in the ${project.title} API and resolved it using Prisma's include and join features, reducing latency by 40%.`,
          type: 'architecture',
          tags: ['Performance', 'Prisma', 'Database'],
          impactScore: 8,
          source: 'manual',
          projectId: project.id
        },
        {
          title: `Implemented Custom Auth in ${project.title}`,
          description: `Built a secure JWT-based authentication system from scratch instead of relying on NextAuth to better understand the underlying mechanisms of access and refresh token rotation.`,
          type: 'pattern',
          tags: ['Security', 'JWT', 'Authentication'],
          impactScore: 9,
          source: 'manual',
          projectId: project.id
        },
        {
          title: `Resolved CORS issues in ${project.title}`,
          description: `Debugged and fixed persistent CORS errors between the frontend and backend by correctly configuring the Express CORS middleware options.`,
          type: 'bug',
          tags: ['Networking', 'Express', 'CORS'],
          impactScore: 6,
          source: 'manual',
          projectId: project.id
        }
      ];

      await prisma.projectLearning.createMany({
        data: learningsToCreate
      });
      console.log(`✅ Created 3 learnings for project: ${project.title}`);
    } else {
      console.log(`ℹ️ Project ${project.title} already has learnings.`);
    }

    // 2. Seed ProjectIntelligence if empty
    if (!project.intelligence) {
      await prisma.projectIntelligence.create({
        data: {
          projectId: project.id,
          architectureScore: 8.5,
          scalabilityScore: 7.2,
          resumeScore: 9.0,
          interviewScore: 8.8,
          recruiterScore: 8.5,
          missingSkills: ['Redis Caching', 'Docker Containerization', 'CI/CD Pipelines'],
          strengths: ['Clean REST API Design', 'Database Modeling', 'Component Reusability'],
          weaknesses: ['Lack of Integration Tests', 'Basic Error Handling'],
        }
      });
      console.log(`✅ Created AI Intelligence for project: ${project.title}`);
    } else {
      console.log(`ℹ️ Project ${project.title} already has intelligence.`);
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
