import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { logger } from './shared/utils/logger.js';
import { defaultLimiter } from './shared/middlewares/rateLimiter.middleware.js';
import { errorHandler } from './shared/middlewares/errorHandler.middleware.js';
import { NotFoundError } from './shared/errors/NotFoundError.js';
import routes from './routes/index.js';
import { initAnalyticsCron } from './modules/analytics/analytics.snapshot.cron.js';

const app = express();

// ── Security ──────────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

// ── Parsing ───────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Rate limiting ─────────────────────────────
app.use(defaultLimiter);

// ── Request logging ───────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// ── Routes ────────────────────────────────────
app.use('/api/v1', routes);

// ── 404 handler ───────────────────────────────
app.use((_req, _res, next) => {
  next(new NotFoundError('Route'));
});

// ── Global error handler (must be last) ───────
app.use(errorHandler);

// ── Initialize Cron Jobs ──────────────────────
initAnalyticsCron();

export default app;
