import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/database.js';
import { logger } from './shared/utils/logger.js';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';

const gunzip = promisify(zlib.gunzip);

// ── Food Embedding Cache ──────────────────────────────────────
// Stores: { [slug]: { id, name, vector: number[] }, _meta: {...} }
const FOOD_EMBEDDINGS_PATH = path.resolve(
  import.meta.dirname || process.cwd(),
  'data',
  'food_embeddings.json.gz'
);

let _lastMtime = null; // Track last-modified time for stale detection

async function loadFoodEmbeddingStore() {
  if (!fs.existsSync(FOOD_EMBEDDINGS_PATH)) {
    logger.warn('[FoodCache] food_embeddings.json.gz not found. Run generate-food-embeddings.js to build it.');
    global.foodEmbeddingStore = {};
    return;
  }
  try {
    const stat = fs.statSync(FOOD_EMBEDDINGS_PATH);
    const compressed = fs.readFileSync(FOOD_EMBEDDINGS_PATH);
    const decompressed = await gunzip(compressed);
    const parsed = JSON.parse(decompressed.toString('utf8'));
    global.foodEmbeddingStore = parsed;
    _lastMtime = stat.mtimeMs;
    const itemCount = Object.keys(parsed).filter(k => k !== '_meta').length;
    logger.info(`[FoodCache] Loaded ${itemCount} food embeddings into memory (version: ${parsed._meta?.version ?? 'unknown'}).`);
  } catch (err) {
    logger.error('[FoodCache] Failed to load food embeddings:', err.message);
    global.foodEmbeddingStore = {};
  }
}

// Background watcher — checks mtime every 60s. Zero cost unless file changes.
function startFoodEmbeddingWatcher() {
  setInterval(async () => {
    if (!fs.existsSync(FOOD_EMBEDDINGS_PATH)) return;
    try {
      const stat = fs.statSync(FOOD_EMBEDDINGS_PATH);
      if (stat.mtimeMs !== _lastMtime) {
        logger.info('[FoodCache] food_embeddings.json.gz changed. Reloading...');
        await loadFoodEmbeddingStore();
      }
    } catch (err) {
      logger.error('[FoodCache] Watcher error:', err.message);
    }
  }, 60_000);
}

// ── Boot ─────────────────────────────────────────────────────
const server = app.listen(env.PORT, async () => {
  try {
    await prisma.$connect();
    logger.info(`✅ Database connected`);
  } catch (err) {
    logger.error('❌ Database connection failed:', err);
    process.exit(1);
  }

  // Warm up the food embedding in-memory cache
  await loadFoodEmbeddingStore();
  // Start background watcher to auto-reload if file changes
  startFoodEmbeddingWatcher();

  logger.info(`🚀 LevelUp server running on port ${env.PORT} [${env.NODE_ENV}]`);
});

const shutdown = async (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Server closed');
    if (signal === 'SIGUSR2') {
      process.kill(process.pid, 'SIGUSR2');
    } else {
      process.exit(0);
    }
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.once('SIGUSR2', () => shutdown('SIGUSR2'));

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  shutdown('UNHANDLED_REJECTION');
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  shutdown('UNCAUGHT_EXCEPTION');
});
