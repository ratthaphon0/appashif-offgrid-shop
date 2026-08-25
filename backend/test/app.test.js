'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');

function app() {
  const config = {
    apiPrefix: '/api/v1',
    jwtSecret: 'test-secret-that-is-longer-than-thirty-two-characters',
    jwtExpiresIn: '1h',
    corsOrigins: ['http://localhost:8081'],
    corsAllowAll: false,
    rateLimitWindowMs: 60000,
    rateLimitMax: 100,
    logLevel: 'silent'
  };
  const pool = {
    query: async (sql) => {
      if (sql === 'SELECT 1') return [[{ 1: 1 }]];
      throw new Error(`Unexpected query: ${sql}`);
    }
  };
  return createApp({ config, pool });
}

test('live and ready health endpoints use the response contract', async () => {
  const compatibility = await request(app()).get('/api').expect(200);
  assert.equal(compatibility.body.data.status, 'running');
  assert.equal(compatibility.body.data.deployment.owner, 'classroom-student');
  const live = await request(app()).get('/api/v1/health/live').expect(200);
  assert.equal(live.body.data.status, 'ok');
  const ready = await request(app()).get('/api/v1/health/ready').expect(200);
  assert.equal(ready.body.data.database, 'connected');
});

test('unknown routes return a consistent error and request id', async () => {
  const response = await request(app()).get('/api/v1/unknown').expect(404);
  assert.equal(response.body.error.code, 'ROUTE_NOT_FOUND');
  assert.ok(response.body.error.requestId);
  assert.equal(response.headers['x-request-id'], response.body.error.requestId);
  assert.equal(response.headers['x-appashif-source'], 'classroom-mysql');
  assert.equal(response.headers['x-appashif-owner'], 'classroom-student');
});

test('CORS preflight accepts configured Expo web origin', async () => {
  const response = await request(app())
    .options('/api/v1/products')
    .set('Origin', 'http://localhost:8081')
    .set('Access-Control-Request-Method', 'GET')
    .expect(204);
  assert.equal(response.headers['access-control-allow-origin'], 'http://localhost:8081');
});

test('mutations require a bearer token before database access', async () => {
  const response = await request(app())
    .delete('/api/v1/products/acid-grid-tee')
    .expect(401);
  assert.equal(response.body.error.code, 'AUTH_REQUIRED');
});
