'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const pinoHttp = require('pino-http');
const { asyncHandler, requestId, notFound, errorHandler } = require('./middleware');
const { AppError } = require('./errors');
const { productRoutes } = require('./routes/products');
const { categoryRoutes } = require('./routes/categories');
const { authRoutes } = require('./routes/auth');
const { healthRoutes } = require('./routes/health');
const productRepository = require('./product-repository');

function createApp({ config, pool }) {
  const app = express();
  const deployment = config.deployment || {
    source: 'classroom-mysql',
    owner: 'classroom-student',
    label: 'CLASSROOM • MYSQL • PORT 3000'
  };
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use((_req, res, next) => {
    res.set('X-AppAshif-Source', deployment.source);
    res.set('X-AppAshif-Owner', deployment.owner);
    next();
  });
  app.use(requestId);
  app.use(pinoHttp({
    level: config.logLevel,
    genReqId: (req) => req.id,
    redact: ['req.headers.authorization', 'req.headers.cookie', 'req.body.password']
  }));
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({
    origin(origin, callback) {
      if (!origin || config.corsAllowAll || config.corsOrigins.includes(origin)) return callback(null, true);
      return callback(new AppError(403, 'CORS_ORIGIN_DENIED', 'This browser origin is not allowed'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
    maxAge: 86400
  }));
  app.use(rateLimit({
    windowMs: config.rateLimitWindowMs,
    limit: config.rateLimitMax,
    standardHeaders: 'draft-8',
    legacyHeaders: false
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '32kb' }));

  app.get('/', (_req, res) => res.json({
    data: {
      service: 'AppAshif API',
      version: '1.0.0',
      api: config.apiPrefix,
      deployment
    }
  }));
  app.get('/api', (_req, res) => res.json({
    data: {
      status: 'running',
      service: 'AppAshif API',
      canonicalApi: config.apiPrefix,
      deployment
    }
  }));
  app.get('/api/products', asyncHandler(async (req, res) => {
    res.json(await productRepository.listProducts(pool, req.query));
  }));
  app.use(`${config.apiPrefix}/health`, healthRoutes({ pool, deployment }));
  app.use(`${config.apiPrefix}/auth`, authRoutes({ pool, config }));
  app.use(`${config.apiPrefix}/products`, productRoutes({ pool, config }));
  app.use(`${config.apiPrefix}/categories`, categoryRoutes({ pool, config }));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
