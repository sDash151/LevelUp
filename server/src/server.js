import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/database.js';
import { logger } from './shared/utils/logger.js';

const server = app.listen(env.PORT, async () => {
  try {
    await prisma.$connect();
    logger.info(`✅ Database connected`);
  } catch (err) {
    logger.error('❌ Database connection failed:', err);
    process.exit(1);
  }
  logger.info(`🚀 LevelUp server running on port ${env.PORT} [${env.NODE_ENV}]`);
});

// ── Graceful shutdown ─────────────────────────
const shutdown = async (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Server closed');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  shutdown('UNHANDLED_REJECTION');
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  shutdown('UNCAUGHT_EXCEPTION');
});
