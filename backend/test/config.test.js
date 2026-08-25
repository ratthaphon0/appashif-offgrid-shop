'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadConfig } = require('../src/config');
const { productBody } = require('../src/schemas');
const { slugify, parsePositiveInt } = require('../src/utils');

test('loads explicit production-safe configuration', () => {
  const config = loadConfig({
    NODE_ENV: 'production',
    PORT: '3067',
    DB_PASSWORD: 'secret',
    JWT_SECRET: 'a-secure-secret-that-is-at-least-32-characters',
    CORS_ALLOW_ALL: 'false',
    CORS_ORIGINS: 'https://example.com, http://localhost:8081'
  });
  assert.equal(config.port, 3067);
  assert.deepEqual(config.corsOrigins, ['https://example.com', 'http://localhost:8081']);
  assert.equal(config.database.database, 'appashif_demo');
});

test('rejects development JWT secret in production', () => {
  assert.throws(() => loadConfig({
    NODE_ENV: 'production',
    JWT_SECRET: 'development-only-secret-change-me-123456'
  }), /JWT_SECRET/);
});

test('requires a database password in production', () => {
  assert.throws(() => loadConfig({
    NODE_ENV: 'production',
    JWT_SECRET: 'a-secure-secret-that-is-at-least-32-characters',
    DB_PASSWORD: ''
  }), /DB_PASSWORD/);
});

test('rejects an original product price below the sale price', () => {
  const result = productBody.safeParse({
    name: 'Test Product',
    categorySlug: 'test-category',
    description: 'Test description',
    price: 200,
    originalPrice: 100,
    stock: 1
  });
  assert.equal(result.success, false);
});

test('slug and pagination helpers enforce stable identifiers', () => {
  assert.equal(slugify('Heavyweight Hoodie'), 'heavyweight-hoodie');
  assert.equal(parsePositiveInt('20', 1, 100), 20);
  assert.equal(parsePositiveInt('0', 1, 100), null);
});
