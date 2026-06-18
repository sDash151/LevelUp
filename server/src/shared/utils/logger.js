import winston from 'winston';
import { env } from '../../config/env.js';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp: ts, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${ts} ${level}: ${stack || message}${metaStr}`;
  })
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  winston.format.json()
);

const transports = [new winston.transports.Console()];

if (env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  );
}

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: env.NODE_ENV === 'development' ? devFormat : prodFormat,
  transports,
  exitOnError: false,
});
