'use strict';

const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const { AppError } = require('./errors');

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function requestId(req, res, next) {
  req.id = req.get('x-request-id') || crypto.randomUUID();
  res.set('x-request-id', req.id);
  next();
}

function requireAdmin(config) {
  return (req, _res, next) => {
    const authorization = req.get('authorization') || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    if (!token) return next(new AppError(401, 'AUTH_REQUIRED', 'Admin authentication is required'));
    try {
      const payload = jwt.verify(token, config.jwtSecret, {
        algorithms: ['HS256'],
        issuer: 'appashif-api',
        audience: 'appashif-admin'
      });
      if (payload.role !== 'admin') throw new Error('Invalid role');
      req.admin = payload;
      return next();
    } catch {
      return next(new AppError(401, 'INVALID_TOKEN', 'The access token is invalid or expired'));
    }
  };
}

function notFound(req, _res, next) {
  next(new AppError(404, 'ROUTE_NOT_FOUND', `Route ${req.method} ${req.originalUrl} was not found`));
}

function errorHandler(error, req, res, _next) {
  if (error?.code === 'ER_DUP_ENTRY') {
    error = new AppError(409, 'DUPLICATE_RESOURCE', 'A resource with this identifier already exists');
  }
  if (error?.code === 'ER_ROW_IS_REFERENCED_2') {
    error = new AppError(409, 'RESOURCE_IN_USE', 'This resource is still referenced by another resource');
  }
  if (error?.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
    error = new AppError(422, 'VALIDATION_ERROR', 'The submitted values violate a data constraint');
  }

  const status = error instanceof AppError ? error.status : 500;
  if (status >= 500) req.log?.error({ err: error }, 'request failed');

  const body = {
    error: {
      code: error instanceof AppError ? error.code : 'INTERNAL_ERROR',
      message: error instanceof AppError ? error.message : 'An unexpected error occurred',
      requestId: req.id
    }
  };
  if (error instanceof AppError && error.details !== undefined) {
    body.error.details = error.details;
  }
  res.status(status).json(body);
}

module.exports = { asyncHandler, requestId, requireAdmin, notFound, errorHandler };
