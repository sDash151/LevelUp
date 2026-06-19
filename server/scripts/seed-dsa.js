// ============================================
// LevelUp — DSA Seed Script
// Reads all JSON files from /server/output/
// Normalizes, deduplicates, and seeds the database
// ============================================

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// ==================== PATH CONFIGURATION ====================

const PATH_CONFIG = {
  'tuf-a2z.json':        { name: 'Striver A2Z',      icon: 'route',        difficulty: 'Mixed',  tier: 1 },
  'tuf-blind75.json':    { name: 'Blind 75',          icon: 'target',       difficulty: 'Mixed',  tier: 1 },
  'tuf-sde.json':        { name: 'Striver SDE',       icon: 'code-2',       difficulty: 'Mixed',  tier: 1 },
  'tuf-striver79.json':  { name: 'Striver 79',        icon: 'zap',          difficulty: 'Mixed',  tier: 1 },
  'neetcode150.json':    { name: 'NeetCode 150',      icon: 'trophy',       difficulty: 'Mixed',  tier: 1 },
  'neetcode250.json':    { name: 'NeetCode 250',      icon: 'award',        difficulty: 'Mixed',  tier: 1 },
  'lovebabbar.json':     { name: 'Love Babbar',       icon: 'heart',        difficulty: 'Mixed',  tier: 1 },
  'dp-mastery.json':     { name: 'DP Mastery',         icon: 'brain',        difficulty: 'Hard',   tier: 1 },
  'algomaster300.json':  { name: 'AlgoMaster 300',    icon: 'crown',        difficulty: 'Mixed',  tier: 2 },
  'code-army.json':      { name: 'Code Army',         icon: 'shield',       difficulty: 'Mixed',  tier: 2 },
  'cses.json':           { name: 'CSES',              icon: 'terminal',     difficulty: 'Hard',   tier: 2 },
  'fraz-dsa.json':       { name: 'Fraz DSA',          icon: 'flame',        difficulty: 'Mixed',  tier: 2 },
  'shradha-aman.json':   { name: 'Shradha & Aman',   icon: 'users',        difficulty: 'Mixed',  tier: 2 },
  'top150.json':         { name: 'Top 150',           icon: 'trending-up',  difficulty: 'Mixed',  tier: 2 },
};

// ==================== HELPERS ====================

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function generateCanonicalId(title) {
  return slugify(title.toLowerCase());
}

function generatePathSlug(name) {
  return slugify(name);
}

function normalizeLeetcodeUrl(url) {
  if (!url || typeof url !== 'string' || url.trim() === '') return '';
  // Remove utm params and trailing slashes for consistent matching
  let cleaned = url.split('?')[0].replace(/\/+$/, '');
  // Normalize to lowercase
  return cleaned.toLowerCase();
}

function derivePatterns(tags, topic) {
  const patternMap = {
    'array': 'Arrays',
    'hashing': 'Hash Map',
    'hash table': 'Hash Map',
    'hash-table': 'Hash Map',
    'two pointers': 'Two Pointer',
    'two-pointers': 'Two Pointer',
    'sliding window': 'Sliding Window',
    'sliding-window': 'Sliding Window',
    'binary search': 'Binary Search',
    'binary-search': 'Binary Search',
    'linked list': 'Linked List',
    'linked-list': 'Linked List',
    'stack': 'Stack',
    'queue': 'Queue',
    'tree': 'Trees',
    'trees': 'Trees',
    'binary tree': 'Trees',
    'binary-tree': 'Trees',
    'bst': 'Trees',
    'binary search tree': 'Trees',
    'graph': 'Graphs',
    'graphs': 'Graphs',
    'bfs': 'Graphs',
    'dfs': 'Graphs',
    'dp': 'Dynamic Programming',
    'dynamic programming': 'Dynamic Programming',
    'dynamic-programming': 'Dynamic Programming',
    'greedy': 'Greedy',
    'backtracking': 'Backtracking',
    'recursion': 'Recursion',
    'sorting': 'Sorting',
    'bit manipulation': 'Bit Manipulation',
    'bit-manipulation': 'Bit Manipulation',
    'math': 'Math',
    'string': 'Strings',
    'strings': 'Strings',
    'trie': 'Trie',
    'tries': 'Trie',
    'heap': 'Heap',
    'priority queue': 'Heap',
    'priority-queue': 'Heap',
    'matrix': 'Matrix',
    'intervals': 'Intervals',
    'divide and conquer': 'Divide & Conquer',
    'design': 'Design',
    'monotonic stack': 'Stack',
    'monotonic-stack': 'Stack',
  };

  const patterns = new Set();

  // Derive from tags
  for (const tag of (tags || [])) {
    const key = tag.toLowerCase().trim();
    if (patternMap[key]) {
      patterns.add(patternMap[key]);
    }
  }

  // Derive from topic name
  const topicLower = (topic || '').toLowerCase();
  for (const [key, value] of Object.entries(patternMap)) {
    if (topicLower.includes(key)) {
      patterns.add(value);
    }
  }

  return [...patterns];
}

// ==================== MAIN SEED FUNCTION ====================

async function seed() {
  console.log('\n🚀 Starting DSA Tracker V2 Seed...\n');

  const outputDir = path.join(__dirname, '..', 'output');
  const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.json'));

  console.log(`📁 Found ${files.length} JSON files in /server/output/\n`);

  // ---- Step 1: Clean existing DSA data ----
  console.log('🧹 Cleaning existing DSA data...');
  await prisma.$transaction([
    prisma.dsaHeatmap.deleteMany(),
    prisma.dsaUnlockedPath.deleteMany(),
    prisma.dsaPathProgress.deleteMany(),
    prisma.dsaTopicMastery.deleteMany(),
    prisma.dsaPatternMastery.deleteMany(),
    prisma.dsaRevisionLog.deleteMany(),
    prisma.dsaUserProgress.deleteMany(),
    prisma.dsaPathProblem.deleteMany(),
    prisma.dsaProblem.deleteMany(),
    prisma.dsaPath.deleteMany(),
    prisma.companyDsaMap.deleteMany(),
  ]);
  console.log('✅ Cleaned.\n');

  // ---- Step 2: Parse all files and collect problems ----
  const allRawProblems = []; // { ...problem, _fileName, _topic, _subtopic, _order }
  const pathDataMap = {};    // fileName -> { totalProblems, source, topics }

  for (const fileName of files) {
    const config = PATH_CONFIG[fileName];
    if (!config) {
      console.log(`⚠️  Skipping unknown file: ${fileName}`);
      continue;
    }

    const filePath = path.join(outputDir, fileName);
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    let fileProblems = 0;
    let source = '';

    for (const topic of (raw.topics || [])) {
      for (const subtopic of (topic.subtopics || [])) {
        for (const problem of (subtopic.problems || [])) {
          source = source || problem.source || '';
          const normalizedSubtopic = subtopic.name === topic.name ? null : subtopic.name;

          allRawProblems.push({
            ...problem,
            _fileName: fileName,
            _topic: topic.name,
            _subtopic: normalizedSubtopic,
            _order: problem.order || fileProblems,
          });
          fileProblems++;
        }
      }
    }

    pathDataMap[fileName] = {
      totalProblems: fileProblems,
      source: source,
    };

    console.log(`📄 ${fileName}: ${fileProblems} problems (source: ${source})`);
  }

  console.log(`\n📊 Total raw problems across all files: ${allRawProblems.length}\n`);

  // ---- Step 3: Deduplicate problems ----
  // Key: normalized leetcodeUrl OR canonicalProblemId+platform
  const problemMap = new Map();      // dedup key -> problem data
  const canonicalToDbId = new Map(); // canonicalProblemId -> cuid
  const leetcodeToDbId = new Map();  // normalized leetcodeUrl -> cuid

  let duplicatesFound = 0;

  for (const raw of allRawProblems) {
    const canonicalId = generateCanonicalId(raw.title);
    const normalizedLeetcode = normalizeLeetcodeUrl(raw.leetcodeUrl);
    const platform = raw.platform || 'LeetCode';

    // Check for existing by leetcodeUrl first
    let existingKey = null;
    if (normalizedLeetcode) {
      existingKey = leetcodeToDbId.get(normalizedLeetcode);
    }
    // Then by canonical+platform
    if (!existingKey) {
      const cpKey = `${canonicalId}::${platform}`;
      existingKey = problemMap.get(cpKey)?.id;
    }

    if (existingKey) {
      duplicatesFound++;
      // Still need to record the mapping for path-problem links
      raw._resolvedProblemKey = existingKey;
      continue;
    }

    // New unique problem
    const id = `prob_${problemMap.size + 1}`; // temp ID
    const patterns = derivePatterns(raw.tags, raw._topic);

    const problemData = {
      id,
      externalId: raw.id || '',
      title: raw.title,
      slug: raw.slug || slugify(raw.title),
      difficulty: raw.difficulty || 'Unknown',
      url: raw.url || '',
      canonicalProblemId: canonicalId,
      platform,
      source: raw.source || '',
      estimatedTime: raw.estimatedTime || 20,
      revisionWeight: raw.revisionWeight || 1,
      companies: raw.companies || [],
      tags: raw.tags || [],
      patterns,
      prerequisites: raw.prerequisites || [],
      leetcodeUrl: raw.leetcodeUrl || '',
      isPremium: raw.isPremium || false,
    };

    const cpKey = `${canonicalId}::${platform}`;
    problemMap.set(cpKey, problemData);

    if (normalizedLeetcode) {
      leetcodeToDbId.set(normalizedLeetcode, id);
    }
    canonicalToDbId.set(canonicalId, id);
    raw._resolvedProblemKey = id;
  }

  // For duplicates, we also need to resolve their keys
  for (const raw of allRawProblems) {
    if (raw._resolvedProblemKey) continue;
    const canonicalId = generateCanonicalId(raw.title);
    const normalizedLeetcode = normalizeLeetcodeUrl(raw.leetcodeUrl);
    const platform = raw.platform || 'LeetCode';

    if (normalizedLeetcode && leetcodeToDbId.has(normalizedLeetcode)) {
      raw._resolvedProblemKey = leetcodeToDbId.get(normalizedLeetcode);
    } else {
      const cpKey = `${canonicalId}::${platform}`;
      if (problemMap.has(cpKey)) {
        raw._resolvedProblemKey = problemMap.get(cpKey).id;
      }
    }
  }

  const uniqueProblems = [...problemMap.values()];
  console.log(`🔍 Unique problems after dedup: ${uniqueProblems.length}`);
  console.log(`🔗 Duplicates merged: ${duplicatesFound}\n`);

  // ---- Step 4: Insert paths ----
  console.log('📂 Creating paths...');
  const createdPaths = {};

  for (const fileName of Object.keys(PATH_CONFIG)) {
    const config = PATH_CONFIG[fileName];
    const pathData = pathDataMap[fileName];
    if (!pathData) continue;

    const dbPath = await prisma.dsaPath.create({
      data: {
        name: config.name,
        slug: generatePathSlug(config.name),
        fileName,
        source: pathData.source,
        icon: config.icon,
        difficulty: config.difficulty,
        totalProblems: pathData.totalProblems,
        tier: config.tier,
      },
    });

    createdPaths[fileName] = dbPath;
    console.log(`  ✅ ${config.name} (${pathData.totalProblems} problems, tier ${config.tier})`);
  }

  // ---- Step 5: Insert problems in batches ----
  console.log('\n💾 Inserting problems...');
  const BATCH_SIZE = 200;
  const tempIdToDbId = new Map();

  for (let i = 0; i < uniqueProblems.length; i += BATCH_SIZE) {
    const batch = uniqueProblems.slice(i, i + BATCH_SIZE);
    const created = await prisma.$transaction(
      batch.map(p => prisma.dsaProblem.create({
        data: {
          externalId: p.externalId,
          title: p.title,
          slug: p.slug,
          difficulty: p.difficulty,
          url: p.url,
          canonicalProblemId: p.canonicalProblemId,
          platform: p.platform,
          source: p.source,
          estimatedTime: p.estimatedTime,
          revisionWeight: p.revisionWeight,
          companies: p.companies,
          tags: p.tags,
          patterns: p.patterns,
          prerequisites: p.prerequisites,
          leetcodeUrl: p.leetcodeUrl,
          isPremium: p.isPremium,
        },
      }))
    );

    // Map temp IDs to real DB IDs
    for (let j = 0; j < batch.length; j++) {
      tempIdToDbId.set(batch[j].id, created[j].id);
    }

    process.stdout.write(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(uniqueProblems.length / BATCH_SIZE)} (${Math.min(i + BATCH_SIZE, uniqueProblems.length)}/${uniqueProblems.length})\r`);
  }
  console.log(`\n✅ Inserted ${uniqueProblems.length} unique problems.\n`);

  // ---- Step 6: Insert path-problem links ----
  console.log('🔗 Creating path-problem links...');
  let linksCreated = 0;
  const seenLinks = new Set();

  for (const fileName of Object.keys(PATH_CONFIG)) {
    const pathRecord = createdPaths[fileName];
    if (!pathRecord) continue;

    const fileProblems = allRawProblems.filter(p => p._fileName === fileName);
    const linkBatch = [];

    for (const raw of fileProblems) {
      const realProblemId = tempIdToDbId.get(raw._resolvedProblemKey);
      if (!realProblemId) continue;

      const linkKey = `${pathRecord.id}::${realProblemId}`;
      if (seenLinks.has(linkKey)) continue;
      seenLinks.add(linkKey);

      linkBatch.push({
        pathId: pathRecord.id,
        problemId: realProblemId,
        topic: raw._topic,
        subtopic: raw._subtopic,
        orderIndex: raw._order,
      });
    }

    // Insert in batches
    for (let i = 0; i < linkBatch.length; i += BATCH_SIZE) {
      const batch = linkBatch.slice(i, i + BATCH_SIZE);
      await prisma.dsaPathProblem.createMany({ data: batch, skipDuplicates: true });
    }

    linksCreated += linkBatch.length;
    console.log(`  ✅ ${PATH_CONFIG[fileName].name}: ${linkBatch.length} links`);
  }

  // ---- Step 7: Seed Company DSA Maps ----
  console.log('\n🏢 Seeding company DSA maps...');
  const companyMaps = [
    { company: 'Google',    topics: ['Arrays', 'Graphs', 'Trees', 'Dynamic Programming', 'System Design', 'Strings'], patterns: ['Two Pointer', 'Binary Search', 'Graphs', 'Dynamic Programming', 'Trees'], priority: 1 },
    { company: 'Amazon',    topics: ['Arrays', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting & Searching'], patterns: ['Arrays', 'Trees', 'Binary Search', 'Greedy', 'Dynamic Programming'], priority: 1 },
    { company: 'Meta',      topics: ['Arrays', 'Strings', 'Trees', 'Graphs', 'Dynamic Programming'], patterns: ['Two Pointer', 'Sliding Window', 'Trees', 'Graphs', 'Dynamic Programming'], priority: 1 },
    { company: 'Microsoft', topics: ['Arrays', 'Trees', 'Linked List', 'Dynamic Programming', 'Graphs'], patterns: ['Arrays', 'Trees', 'Linked List', 'Binary Search', 'Dynamic Programming'], priority: 1 },
    { company: 'Apple',     topics: ['Arrays', 'Strings', 'Trees', 'Sorting', 'Linked List'], patterns: ['Arrays', 'Strings', 'Trees', 'Sorting', 'Two Pointer'], priority: 2 },
    { company: 'Netflix',   topics: ['Dynamic Programming', 'System Design', 'Graphs', 'Trees'], patterns: ['Dynamic Programming', 'Graphs', 'Trees', 'Design'], priority: 2 },
    { company: 'Adobe',     topics: ['Arrays', 'Trees', 'Graphs', 'Backtracking', 'Dynamic Programming'], patterns: ['Arrays', 'Trees', 'Backtracking', 'Dynamic Programming'], priority: 2 },
    { company: 'Uber',      topics: ['Arrays', 'Graphs', 'Trees', 'Design', 'Dynamic Programming'], patterns: ['Arrays', 'Graphs', 'Design', 'Dynamic Programming', 'Heap'], priority: 2 },
  ];

  await prisma.companyDsaMap.createMany({ data: companyMaps });
  console.log(`✅ Seeded ${companyMaps.length} company mappings.\n`);

  // ---- Summary ----
  console.log('═══════════════════════════════════════');
  console.log('          SEED COMPLETE SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log(`  Paths created:        ${Object.keys(createdPaths).length}`);
  console.log(`  Tier 1 (visible):     ${Object.values(PATH_CONFIG).filter(c => c.tier === 1).length}`);
  console.log(`  Tier 2 (unlockable):  ${Object.values(PATH_CONFIG).filter(c => c.tier === 2).length}`);
  console.log(`  Unique problems:      ${uniqueProblems.length}`);
  console.log(`  Path-problem links:   ${linksCreated}`);
  console.log(`  Duplicates merged:    ${duplicatesFound}`);
  console.log(`  Company maps:         ${companyMaps.length}`);
  console.log('═══════════════════════════════════════\n');
}

seed()
  .then(() => {
    console.log('🎉 DSA Seed completed successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
