'use strict';

const path = require('node:path');
const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const booleanString = z
  .enum(['true', 'false'])
  .default('false')
  .transform((value) => value === 'true');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().min(1024).max(65535).default(3000),
  API_PREFIX: z.string().regex(/^\/[a-zA-Z0-9/_-]+$/).default('/api/v1'),
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().min(1).default('appashif_user'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().regex(/^[a-zA-Z0-9_]+$/).default('appashif_demo'),
  DB_CONNECTION_LIMIT: z.coerce.number().int().min(1).max(50).default(10),
  JWT_SECRET: z.string().min(32).default('development-only-secret-change-me-123456'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  CORS_ORIGINS: z.string().default('http://localhost:8081,http://127.0.0.1:8081'),
  CORS_ALLOW_ALL: booleanString,
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  LOG_LEVEL: z.string().default('info'),
  DEPLOYMENT_SOURCE: z.string().min(1).default('classroom-mysql'),
  DEPLOYMENT_OWNER: z.string().min(1).default('classroom-student'),
  DEPLOYMENT_LABEL: z.string().min(1).default('CLASSROOM • MYSQL • PORT 3000')
});

function loadConfig(env = process.env) {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${message}`);
  }

  const value = parsed.data;
  if (value.NODE_ENV === 'production' && value.JWT_SECRET.startsWith('development-only')) {
    throw new Error('JWT_SECRET must be changed in production');
  }
  if (value.NODE_ENV === 'production' && !value.DB_PASSWORD) {
    throw new Error('DB_PASSWORD is required in production');
  }

  return {
    nodeEnv: value.NODE_ENV,
    host: value.HOST,
    port: value.PORT,
    apiPrefix: value.API_PREFIX.replace(/\/$/, ''),
    jwtSecret: value.JWT_SECRET,
    jwtExpiresIn: value.JWT_EXPIRES_IN,
    corsOrigins: value.CORS_ORIGINS.split(',').map((item) => item.trim()).filter(Boolean),
    corsAllowAll: value.CORS_ALLOW_ALL,
    rateLimitWindowMs: value.RATE_LIMIT_WINDOW_MS,
    rateLimitMax: value.RATE_LIMIT_MAX,
    logLevel: value.LOG_LEVEL,
    deployment: {
      source: value.DEPLOYMENT_SOURCE,
      owner: value.DEPLOYMENT_OWNER,
      label: value.DEPLOYMENT_LABEL
    },
    database: {
      host: value.DB_HOST,
      port: value.DB_PORT,
      user: value.DB_USER,
      password: value.DB_PASSWORD,
      database: value.DB_NAME,
      connectionLimit: value.DB_CONNECTION_LIMIT
    }
  };
}

module.exports = { loadConfig };
