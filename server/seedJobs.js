import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find the first user to seed jobs for
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('No user found. Please register a user first.');
    process.exit(1);
  }

  console.log(`Seeding jobs for user: ${user.name} (${user.id})`);

  // Clear existing job applications for this user
  await prisma.jobApplication.deleteMany({ where: { userId: user.id } });

  const now = new Date();
  const daysAgo = (d) => new Date(now.getTime() - d * 86400000);

  // Full AI Prep data for Google
  const googleAiPrepData = {
    skillBreakdown: [
      { name: 'Data Structures & Algorithms', pct: 30 },
      { name: 'System Design', pct: 25 },
      { name: 'React & Frontend', pct: 15 },
      { name: 'Node.js & Backend', pct: 15 },
      { name: 'SQL & Databases', pct: 10 },
      { name: 'Behavioral', pct: 5 },
    ],
    roadmap: [
      { day: 1, date: 'Day 1', topics: [{ name: 'Arrays & Hashing', completed: true }, { name: 'Two Pointers', completed: true }] },
      { day: 2, date: 'Day 2', topics: [{ name: 'Sliding Window', completed: true }, { name: 'Stack & Queue', completed: true }] },
      { day: 3, date: 'Day 3', topics: [{ name: 'Binary Search', completed: true }, { name: 'Linked Lists', completed: false }] },
      { day: 4, date: 'Day 4', topics: [{ name: 'Trees & BFS/DFS', completed: false }, { name: 'Tries', completed: false }] },
      { day: 5, date: 'Day 5', topics: [{ name: 'Dynamic Programming', completed: false }, { name: 'Graphs', completed: false }] },
      { day: 6, date: 'Day 6', topics: [{ name: 'System Design - URL Shortener', completed: false }, { name: 'System Design - Chat System', completed: false }, { name: 'API Design Patterns', completed: false }] },
      { day: 7, date: 'Day 7', topics: [{ name: 'Mock Interview Practice', completed: false }, { name: 'Behavioral STAR Method', completed: false }] },
    ],
    dsaTopics: [
      { name: 'Arrays & Hashing', difficulty: 'Easy', questions: 8, completed: 5 },
      { name: 'Two Pointers', difficulty: 'Medium', questions: 6, completed: 3 },
      { name: 'Binary Search', difficulty: 'Medium', questions: 5, completed: 2 },
      { name: 'Trees', difficulty: 'Medium', questions: 7, completed: 0 },
      { name: 'Dynamic Programming', difficulty: 'Hard', questions: 6, completed: 0 },
      { name: 'Graphs', difficulty: 'Hard', questions: 5, completed: 0 },
    ],
    questions: [
      { id: 'q1', question: 'Design a LRU Cache with O(1) operations', category: 'DSA', difficulty: 'Medium', practiced: true },
      { id: 'q2', question: 'Implement a rate limiter for Google APIs', category: 'System Design', difficulty: 'Hard', practiced: false },
      { id: 'q3', question: 'Two Sum with optimal space complexity', category: 'DSA', difficulty: 'Easy', practiced: true },
      { id: 'q4', question: 'Design Google Drive file storage system', category: 'System Design', difficulty: 'Hard', practiced: false },
      { id: 'q5', question: 'Build a React component with virtual scrolling', category: 'Backend', difficulty: 'Medium', practiced: false },
      { id: 'q6', question: 'Describe a time you handled a production incident', category: 'Behavioral', difficulty: 'Medium', practiced: true },
      { id: 'q7', question: 'Longest Substring Without Repeating Characters', category: 'DSA', difficulty: 'Medium', practiced: true },
      { id: 'q8', question: 'Design a notification system at Google scale', category: 'System Design', difficulty: 'Hard', practiced: false },
      { id: 'q9', question: 'Build REST API with pagination, filtering, sorting', category: 'Backend', difficulty: 'Medium', practiced: true },
      { id: 'q10', question: 'Merge K Sorted Lists', category: 'DSA', difficulty: 'Hard', practiced: false },
      { id: 'q11', question: 'How do you handle disagreements in a team?', category: 'Behavioral', difficulty: 'Easy', practiced: false },
      { id: 'q12', question: 'Implement Trie with autocomplete', category: 'DSA', difficulty: 'Medium', practiced: false },
      { id: 'q13', question: 'Design YouTube video streaming architecture', category: 'System Design', difficulty: 'Hard', practiced: false },
      { id: 'q14', question: 'Optimize N+1 queries in Node.js with Prisma', category: 'Backend', difficulty: 'Medium', practiced: true },
      { id: 'q15', question: 'Tell me about a project you are most proud of', category: 'Behavioral', difficulty: 'Easy', practiced: false },
    ],
    focusTasks: [
      { id: 't1', text: 'Complete 5 LeetCode Medium problems daily', completed: true },
      { id: 't2', text: 'Review Google engineering blog posts', completed: true },
      { id: 't3', text: 'Practice system design with mock partner', completed: false },
      { id: 't4', text: 'Revise React hooks and performance optimization', completed: false },
      { id: 't5', text: 'Prepare 3 STAR method behavioral stories', completed: false },
    ],
  };

  const jobs = [
    // 1. Google — INTERVIEW stage (fully prepped)
    {
      userId: user.id,
      company: 'Google',
      role: 'Software Engineer L3',
      location: 'Bangalore, India',
      type: 'FULL_TIME',
      status: 'INTERVIEW',
      url: 'https://careers.google.com/jobs/results/',
      salary: '₹35 LPA',
      notes: 'Referral from college senior. DSA-heavy rounds expected.',
      appliedDate: daysAgo(14),
      contactName: 'Priya Sharma',
      contactEmail: 'priya@google.com',
      source: 'Referral',
      requiredSkills: ['React', 'Node.js', 'System Design', 'DSA', 'SQL', 'Python', 'REST APIs', 'AWS'],
      experience: '0-2 Years',
      workMode: 'On-site',
      description: 'Build and maintain large-scale distributed systems powering Google Search infrastructure.',
      companyInfo: 'Google LLC is a global technology leader specializing in search, cloud computing, and AI.',
      interviewRounds: [
        { round: 1, type: 'Phone Screen', status: 'Cleared', date: daysAgo(10).toISOString().split('T')[0] },
        { round: 2, type: 'DSA Round 1', status: 'Cleared', date: daysAgo(7).toISOString().split('T')[0] },
        { round: 3, type: 'DSA Round 2', status: 'Scheduled', date: daysAgo(-2).toISOString().split('T')[0] },
        { round: 4, type: 'System Design', status: 'Pending', date: null },
        { round: 5, type: 'Behavioral (Googleyness)', status: 'Pending', date: null },
      ],
      matchScore: 82,
      interviewNotes: 'Round 1 went well. Solved 2/2 problems. Round 2 solved 1 optimally, 1 brute force.',
      companyResearch: 'Google Bangalore focuses on Search, Ads, and Cloud. Engineering culture is very collaborative.',
      checklist: [
        { id: 'c1', type: 'resume', text: 'Tailor Resume for this role', completed: true },
        { id: 'c2', type: 'research', text: 'Research company culture & values', completed: true },
        { id: 'c3', type: 'dsa', text: 'Review key DSA topics', completed: true },
        { id: 'c4', type: 'system_design', text: 'System Design preparation', completed: false },
        { id: 'c5', type: 'behavioral', text: 'Prepare Behavioral Questions', completed: false },
        { id: 'c6', type: 'mock_interview', text: 'Schedule mock interview', completed: true },
      ],
      personalNotes: 'Dream company. Need to nail system design round. Revise Grokking SD.',
      aiPrepData: googleAiPrepData,
      aiPrepStatus: 'completed',
      aiPrepLastGeneratedAt: daysAgo(3),
      prepStarted: true,
      prepStartedAt: daysAgo(3),
      prepProgress: 42,
      prepConfidence: 78,
      prepDaysTotal: 7,
      stageHistory: [
        { stage: 'SAVED', date: daysAgo(18).toISOString().split('T')[0] },
        { stage: 'APPLIED', date: daysAgo(14).toISOString().split('T')[0] },
        { stage: 'PHONE_SCREEN', date: daysAgo(10).toISOString().split('T')[0] },
        { stage: 'INTERVIEW', date: daysAgo(7).toISOString().split('T')[0] },
      ],
      createdAt: daysAgo(18),
    },

    // 2. Razorpay — APPLIED
    {
      userId: user.id,
      company: 'Razorpay',
      role: 'Backend Engineer',
      location: 'Bangalore, India',
      type: 'FULL_TIME',
      status: 'APPLIED',
      url: 'https://razorpay.com/careers/',
      salary: '₹18 LPA',
      appliedDate: daysAgo(5),
      source: 'LinkedIn',
      requiredSkills: ['Go', 'Node.js', 'PostgreSQL', 'Redis', 'Microservices'],
      experience: '0-2 Years',
      workMode: 'Hybrid',
      description: 'Build payment infrastructure serving millions of merchants across India.',
      stageHistory: [
        { stage: 'SAVED', date: daysAgo(8).toISOString().split('T')[0] },
        { stage: 'APPLIED', date: daysAgo(5).toISOString().split('T')[0] },
      ],
      createdAt: daysAgo(8),
    },

    // 3. Amazon — APPLIED
    {
      userId: user.id,
      company: 'Amazon',
      role: 'SDE Intern',
      location: 'Hyderabad, India',
      type: 'INTERNSHIP',
      status: 'APPLIED',
      url: 'https://www.amazon.jobs/',
      salary: '₹21 LPA (Full-time conversion)',
      appliedDate: daysAgo(10),
      source: 'Company Website',
      requiredSkills: ['Java', 'DSA', 'System Design', 'AWS', 'OOP'],
      experience: '0-1 Years',
      workMode: 'On-site',
      description: 'Work on scalable distributed systems as part of the retail engineering team.',
      stageHistory: [
        { stage: 'SAVED', date: daysAgo(12).toISOString().split('T')[0] },
        { stage: 'APPLIED', date: daysAgo(10).toISOString().split('T')[0] },
      ],
      createdAt: daysAgo(12),
    },

    // 4. Adobe — INTERVIEW (Round 2)
    {
      userId: user.id,
      company: 'Adobe',
      role: 'Backend Engineer',
      location: 'Noida, India',
      type: 'FULL_TIME',
      status: 'INTERVIEW',
      url: 'https://adobe.wd5.myworkdayjobs.com/',
      salary: '₹24 LPA',
      appliedDate: daysAgo(20),
      source: 'Campus Placement',
      requiredSkills: ['Java', 'Spring Boot', 'Microservices', 'MongoDB', 'Docker'],
      experience: '0-2 Years',
      workMode: 'Hybrid',
      description: 'Build backend services for Adobe Creative Cloud platform.',
      interviewRounds: [
        { round: 1, type: 'Online Assessment', status: 'Cleared', date: daysAgo(15).toISOString().split('T')[0] },
        { round: 2, type: 'Technical Round', status: 'Scheduled', date: daysAgo(-1).toISOString().split('T')[0] },
        { round: 3, type: 'Hiring Manager', status: 'Pending', date: null },
      ],
      interviewNotes: 'OA was easy. 3/3 solved. Technical round focusing on Java and system design.',
      checklist: [
        { id: 'c1', type: 'resume', text: 'Tailor Resume for this role', completed: true },
        { id: 'c2', type: 'research', text: 'Research company culture & values', completed: true },
        { id: 'c3', type: 'dsa', text: 'Review key DSA topics', completed: false },
        { id: 'c4', type: 'system_design', text: 'System Design preparation', completed: false },
        { id: 'c5', type: 'behavioral', text: 'Prepare Behavioral Questions', completed: false },
        { id: 'c6', type: 'mock_interview', text: 'Schedule mock interview', completed: false },
      ],
      stageHistory: [
        { stage: 'SAVED', date: daysAgo(22).toISOString().split('T')[0] },
        { stage: 'APPLIED', date: daysAgo(20).toISOString().split('T')[0] },
        { stage: 'INTERVIEW', date: daysAgo(15).toISOString().split('T')[0] },
      ],
      createdAt: daysAgo(22),
    },

    // 5. JPMorgan Chase — OFFER
    {
      userId: user.id,
      company: 'JPMorgan Chase',
      role: 'Software Engineer',
      location: 'Mumbai, India',
      type: 'FULL_TIME',
      status: 'OFFER',
      url: 'https://jpmorgan.tal.net/',
      salary: '₹32 LPA',
      appliedDate: daysAgo(30),
      source: 'Campus Placement',
      requiredSkills: ['Java', 'Spring Boot', 'SQL', 'React', 'Agile'],
      experience: '0-2 Years',
      workMode: 'Hybrid',
      description: 'Build trading platforms and risk management systems for global markets.',
      interviewRounds: [
        { round: 1, type: 'Online Coding', status: 'Cleared', date: daysAgo(25).toISOString().split('T')[0] },
        { round: 2, type: 'Technical Interview', status: 'Cleared', date: daysAgo(20).toISOString().split('T')[0] },
        { round: 3, type: 'Superday', status: 'Cleared', date: daysAgo(12).toISOString().split('T')[0] },
      ],
      matchScore: 75,
      personalNotes: 'Great offer but waiting on Google result before deciding.',
      stageHistory: [
        { stage: 'SAVED', date: daysAgo(32).toISOString().split('T')[0] },
        { stage: 'APPLIED', date: daysAgo(30).toISOString().split('T')[0] },
        { stage: 'INTERVIEW', date: daysAgo(25).toISOString().split('T')[0] },
        { stage: 'OFFER', date: daysAgo(8).toISOString().split('T')[0] },
      ],
      createdAt: daysAgo(32),
    },

    // 6. Atlassian — SAVED
    {
      userId: user.id,
      company: 'Atlassian',
      role: 'Backend Engineer',
      location: 'Bangalore, India',
      type: 'FULL_TIME',
      status: 'SAVED',
      url: 'https://www.atlassian.com/company/careers',
      salary: '₹28 LPA',
      source: 'LinkedIn',
      requiredSkills: ['Java', 'Kotlin', 'AWS', 'Microservices', 'GraphQL'],
      experience: '1-3 Years',
      workMode: 'Remote',
      description: 'Build collaboration tools used by millions of teams worldwide.',
      stageHistory: [
        { stage: 'SAVED', date: daysAgo(2).toISOString().split('T')[0] },
      ],
      createdAt: daysAgo(2),
    },

    // 7. Paytm — SAVED
    {
      userId: user.id,
      company: 'Paytm',
      role: 'Software Engineer',
      location: 'Noida, India',
      type: 'FULL_TIME',
      status: 'SAVED',
      salary: '₹14 LPA',
      source: 'Naukri',
      requiredSkills: ['Java', 'Spring', 'MySQL', 'Redis', 'Kafka'],
      experience: '0-2 Years',
      workMode: 'On-site',
      stageHistory: [
        { stage: 'SAVED', date: daysAgo(1).toISOString().split('T')[0] },
      ],
      createdAt: daysAgo(1),
    },

    // 8. Swiggy — SAVED
    {
      userId: user.id,
      company: 'Swiggy',
      role: 'Backend Engineer',
      location: 'Bangalore, India',
      type: 'FULL_TIME',
      status: 'SAVED',
      salary: '₹16 LPA',
      source: 'LinkedIn',
      requiredSkills: ['Go', 'Python', 'PostgreSQL', 'gRPC', 'Kubernetes'],
      experience: '0-2 Years',
      workMode: 'Hybrid',
      stageHistory: [
        { stage: 'SAVED', date: daysAgo(3).toISOString().split('T')[0] },
      ],
      createdAt: daysAgo(3),
    },

    // 9. Meesho — SAVED
    {
      userId: user.id,
      company: 'Meesho',
      role: 'Software Engineer',
      location: 'Bangalore, India',
      type: 'FULL_TIME',
      status: 'SAVED',
      salary: '₹15 LPA',
      source: 'AngelList',
      requiredSkills: ['Node.js', 'React', 'MongoDB', 'Docker'],
      experience: '0-1 Years',
      workMode: 'Hybrid',
      stageHistory: [
        { stage: 'SAVED', date: daysAgo(1).toISOString().split('T')[0] },
      ],
      createdAt: daysAgo(1),
    },

    // 10. Microsoft — APPLIED
    {
      userId: user.id,
      company: 'Microsoft',
      role: 'Software Engineer',
      location: 'Hyderabad, India',
      type: 'FULL_TIME',
      status: 'APPLIED',
      url: 'https://careers.microsoft.com/',
      salary: '₹28 LPA',
      appliedDate: daysAgo(7),
      source: 'Company Website',
      requiredSkills: ['C#', '.NET', 'Azure', 'System Design', 'DSA'],
      experience: '0-3 Years',
      workMode: 'Hybrid',
      description: 'Build Azure cloud platform features and developer tools.',
      stageHistory: [
        { stage: 'SAVED', date: daysAgo(10).toISOString().split('T')[0] },
        { stage: 'APPLIED', date: daysAgo(7).toISOString().split('T')[0] },
      ],
      createdAt: daysAgo(10),
    },

    // 11. Flipkart — APPLIED
    {
      userId: user.id,
      company: 'Flipkart',
      role: 'SDE-1',
      location: 'Bangalore, India',
      type: 'FULL_TIME',
      status: 'APPLIED',
      url: 'https://www.flipkartcareers.com/',
      salary: '₹20 LPA',
      appliedDate: daysAgo(6),
      source: 'Referral',
      requiredSkills: ['Java', 'Spring Boot', 'MySQL', 'Redis', 'Kafka', 'DSA'],
      experience: '0-2 Years',
      workMode: 'On-site',
      description: 'Work on Flipkart supply chain and logistics platform.',
      stageHistory: [
        { stage: 'SAVED', date: daysAgo(9).toISOString().split('T')[0] },
        { stage: 'APPLIED', date: daysAgo(6).toISOString().split('T')[0] },
      ],
      createdAt: daysAgo(9),
    },

    // 12. Zepto — INTERVIEW (QA Cleared)
    {
      userId: user.id,
      company: 'Zepto',
      role: 'SDE Intern',
      location: 'Mumbai, India',
      type: 'INTERNSHIP',
      status: 'INTERVIEW',
      url: 'https://www.zeptonow.com/careers',
      salary: '₹15 LPA (on conversion)',
      appliedDate: daysAgo(12),
      source: 'LinkedIn',
      requiredSkills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'Redis'],
      experience: '0-1 Years',
      workMode: 'On-site',
      description: 'Build backend for quick commerce delivery optimization.',
      interviewRounds: [
        { round: 1, type: 'Online Assessment', status: 'Cleared', date: daysAgo(8).toISOString().split('T')[0] },
        { round: 2, type: 'Technical Round', status: 'Scheduled', date: daysAgo(-3).toISOString().split('T')[0] },
      ],
      interviewNotes: 'QA cleared with 4/4 test cases. Expecting DSA + system design in technical round.',
      stageHistory: [
        { stage: 'SAVED', date: daysAgo(15).toISOString().split('T')[0] },
        { stage: 'APPLIED', date: daysAgo(12).toISOString().split('T')[0] },
        { stage: 'INTERVIEW', date: daysAgo(8).toISOString().split('T')[0] },
      ],
      createdAt: daysAgo(15),
    },

    // 13. CRED — REJECTED
    {
      userId: user.id,
      company: 'CRED',
      role: 'Backend Engineer',
      location: 'Bangalore, India',
      type: 'FULL_TIME',
      status: 'REJECTED',
      salary: '₹22 LPA',
      appliedDate: daysAgo(25),
      source: 'LinkedIn',
      requiredSkills: ['Kotlin', 'Spring Boot', 'PostgreSQL', 'Kafka'],
      experience: '1-3 Years',
      workMode: 'On-site',
      notes: 'Rejected after OA. Need to improve competitive programming speed.',
      stageHistory: [
        { stage: 'SAVED', date: daysAgo(28).toISOString().split('T')[0] },
        { stage: 'APPLIED', date: daysAgo(25).toISOString().split('T')[0] },
        { stage: 'REJECTED', date: daysAgo(18).toISOString().split('T')[0] },
      ],
      createdAt: daysAgo(28),
    },

    // 14. PhonePe — REJECTED
    {
      userId: user.id,
      company: 'PhonePe',
      role: 'Software Engineer',
      location: 'Bangalore, India',
      type: 'FULL_TIME',
      status: 'REJECTED',
      salary: '₹19 LPA',
      appliedDate: daysAgo(22),
      source: 'Referral',
      requiredSkills: ['Java', 'Microservices', 'MySQL', 'Docker'],
      experience: '0-2 Years',
      workMode: 'Hybrid',
      notes: 'Made it to round 2 but stumbled on system design question.',
      stageHistory: [
        { stage: 'SAVED', date: daysAgo(24).toISOString().split('T')[0] },
        { stage: 'APPLIED', date: daysAgo(22).toISOString().split('T')[0] },
        { stage: 'INTERVIEW', date: daysAgo(16).toISOString().split('T')[0] },
        { stage: 'REJECTED', date: daysAgo(13).toISOString().split('T')[0] },
      ],
      createdAt: daysAgo(24),
    },

    // 15. Walmart — REJECTED
    {
      userId: user.id,
      company: 'Walmart Global Tech',
      role: 'Software Engineer III',
      location: 'Bangalore, India',
      type: 'FULL_TIME',
      status: 'REJECTED',
      salary: '₹24 LPA',
      appliedDate: daysAgo(28),
      source: 'Company Website',
      requiredSkills: ['Java', 'React', 'Node.js', 'Cloud', 'CI/CD'],
      experience: '2-4 Years',
      workMode: 'Hybrid',
      notes: 'Position required more experience than I have currently.',
      stageHistory: [
        { stage: 'APPLIED', date: daysAgo(28).toISOString().split('T')[0] },
        { stage: 'REJECTED', date: daysAgo(21).toISOString().split('T')[0] },
      ],
      createdAt: daysAgo(28),
    },

    // 16. Zoho — OFFER
    {
      userId: user.id,
      company: 'Zoho',
      role: 'Member Technical Staff',
      location: 'Chennai, India',
      type: 'FULL_TIME',
      status: 'OFFER',
      url: 'https://www.zoho.com/careers/',
      salary: '₹16 LPA',
      appliedDate: daysAgo(35),
      source: 'Campus Placement',
      requiredSkills: ['Java', 'C++', 'DSA', 'DBMS', 'Networking'],
      experience: '0-1 Years',
      workMode: 'On-site',
      description: 'Build enterprise SaaS products for Zoho One suite.',
      interviewRounds: [
        { round: 1, type: 'Written Test', status: 'Cleared', date: daysAgo(30).toISOString().split('T')[0] },
        { round: 2, type: 'Programming Round', status: 'Cleared', date: daysAgo(25).toISOString().split('T')[0] },
        { round: 3, type: 'Advanced Programming', status: 'Cleared', date: daysAgo(20).toISOString().split('T')[0] },
        { round: 4, type: 'HR Round', status: 'Cleared', date: daysAgo(15).toISOString().split('T')[0] },
      ],
      matchScore: 70,
      personalNotes: 'Good backup option. Chennai location is a concern.',
      stageHistory: [
        { stage: 'APPLIED', date: daysAgo(35).toISOString().split('T')[0] },
        { stage: 'INTERVIEW', date: daysAgo(30).toISOString().split('T')[0] },
        { stage: 'OFFER', date: daysAgo(10).toISOString().split('T')[0] },
      ],
      createdAt: daysAgo(35),
    },
  ];

  console.log(`Creating ${jobs.length} job applications...`);

  for (const job of jobs) {
    await prisma.jobApplication.create({ data: job });
    console.log(`  ✓ ${job.company} — ${job.status}`);
  }

  console.log(`\n✅ Successfully seeded ${jobs.length} job applications!`);
  console.log('\nBreakdown:');
  console.log('  SAVED: 4 (Atlassian, Paytm, Swiggy, Meesho)');
  console.log('  APPLIED: 4 (Razorpay, Amazon, Microsoft, Flipkart)');
  console.log('  INTERVIEW: 3 (Google, Adobe, Zepto)');
  console.log('  OFFER: 2 (JPMorgan Chase, Zoho)');
  console.log('  REJECTED: 3 (CRED, PhonePe, Walmart)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
