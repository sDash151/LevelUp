import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) { console.log('No user found'); return; }
  console.log(`Found user: ${user.name} (${user.id})`);

  // Clean existing reflections
  await prisma.reflection.deleteMany({ where: { userId: user.id } });
  console.log('Cleaned existing reflections');

  const reflections = [
    {
      title: 'A productive and fulfilling day',
      content: 'Completed all my priorities and had a great workout session. Feeling energized and focused.',
      type: 'DAILY', mood: 5, tags: ['Productivity', 'Health'],
      gratitude: 'Grateful for the energy and clarity I had today.',
      improvements: 'Could have spent less time on social media.',
      date: daysAgo(0),
    },
    {
      title: 'Grateful for the little things',
      content: 'Today reminded me how important family and small moments of joy are.',
      type: 'DAILY', mood: 4, tags: ['Gratitude', 'Family'],
      gratitude: 'My family and quiet mornings.',
      improvements: 'Be more present during conversations.',
      date: daysAgo(1),
    },
    {
      title: 'Could have been better',
      content: 'Struggled with focus in the afternoon but ended the day with a good read.',
      type: 'DAILY', mood: 3, tags: ['Learning', 'Self Improvement'],
      gratitude: 'The book I started reading.',
      improvements: 'Better afternoon routine needed.',
      date: daysAgo(2),
    },
    {
      title: 'Feeling overwhelmed',
      content: 'Too many things on my plate. Need to simplify and focus on what matters.',
      type: 'DAILY', mood: 2, tags: ['Mental Health', 'Work'],
      gratitude: 'At least I recognized the overwhelm early.',
      improvements: 'Learn to say no more often.',
      date: daysAgo(3),
    },
    {
      title: 'Great workout and coding session',
      content: 'Hit a new PR at the gym and solved 3 DSA problems. Best day this week.',
      type: 'DAILY', mood: 5, tags: ['Health', 'Productivity'],
      gratitude: 'Physical and mental strength.',
      improvements: 'Need more sleep though.',
      date: daysAgo(4),
    },
    {
      title: 'Quiet day of learning',
      content: 'Spent most of the day reading about system design. Felt calm and focused.',
      type: 'DAILY', mood: 4, tags: ['Learning', 'Productivity'],
      gratitude: 'Access to great learning resources.',
      improvements: 'Take more breaks between study sessions.',
      date: daysAgo(5),
    },
    {
      title: 'Family time',
      content: 'Had a wonderful dinner with family. Reconnected and laughed a lot.',
      type: 'DAILY', mood: 5, tags: ['Family', 'Gratitude'],
      gratitude: 'My supportive family.',
      date: daysAgo(6),
    },
    {
      title: 'Struggled with motivation',
      content: 'Hard to get started today. Eventually pushed through and got some work done.',
      type: 'DAILY', mood: 3, tags: ['Mental Health', 'Work'],
      improvements: 'Create a better morning routine.',
      date: daysAgo(7),
    },
    {
      title: 'Meditation breakthrough',
      content: 'Had the most peaceful 20-minute meditation session. Felt truly present.',
      type: 'DAILY', mood: 5, tags: ['Health', 'Mental Health'],
      gratitude: 'The stillness of the morning.',
      date: daysAgo(8),
    },
    {
      title: 'Code review and mentoring',
      content: 'Helped a junior developer with their PR. Teaching is the best way to learn.',
      type: 'DAILY', mood: 4, tags: ['Productivity', 'Learning'],
      gratitude: 'The opportunity to mentor others.',
      improvements: 'Need to document the patterns I teach.',
      date: daysAgo(9),
    },
    {
      title: 'Rest day well spent',
      content: 'Took a complete rest day. Read, napped, and recharged.',
      type: 'DAILY', mood: 4, tags: ['Health', 'Gratitude'],
      gratitude: 'The luxury of a free day.',
      date: daysAgo(10),
    },
    {
      title: 'Anxious about upcoming deadline',
      content: 'Project deadline is close. Feeling the pressure but trying to stay calm.',
      type: 'DAILY', mood: 2, tags: ['Work', 'Mental Health'],
      improvements: 'Better project planning next time.',
      date: daysAgo(11),
    },
    {
      title: 'Pushed through the wall',
      content: 'After a rough morning, found my flow and shipped the feature. Proud of myself.',
      type: 'DAILY', mood: 4, tags: ['Productivity', 'Self Improvement'],
      gratitude: 'My resilience and determination.',
      date: daysAgo(12),
    },
    {
      title: 'Weekend reflection',
      content: 'Looking back at the week — made good progress on goals. Need to improve sleep.',
      type: 'DAILY', mood: 4, tags: ['Gratitude', 'Health'],
      gratitude: 'Consistent effort pays off.',
      improvements: 'Sleep before midnight every night.',
      date: daysAgo(13),
    },
    {
      title: 'Early morning run',
      content: 'Ran 5k before sunrise. The city was peaceful and beautiful.',
      type: 'DAILY', mood: 5, tags: ['Health', 'Gratitude'],
      gratitude: 'My body that lets me run.',
      date: daysAgo(14),
    },
    {
      title: 'Tough conversation at work',
      content: 'Had a difficult feedback session. It stung but I know it will help me grow.',
      type: 'DAILY', mood: 3, tags: ['Work', 'Self Improvement'],
      improvements: 'Take feedback less personally.',
      date: daysAgo(15),
    },
    {
      title: 'Creative day',
      content: 'Designed the new UI mockups. Creative work is so fulfilling when it flows.',
      type: 'DAILY', mood: 5, tags: ['Productivity', 'Learning'],
      gratitude: 'Creative inspiration.',
      date: daysAgo(16),
    },
  ];

  for (const r of reflections) {
    await prisma.reflection.create({
      data: { ...r, userId: user.id },
    });
  }

  console.log(`Seeded ${reflections.length} reflections for ${user.name}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
