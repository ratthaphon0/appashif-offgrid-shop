'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
require('dotenv').config();

const baseUrl = (process.env.API_BASE_URL || 'http://127.0.0.1:3000/api/v1').replace(/\/$/, '');
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const requireFull = process.argv.includes('--full');

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      accept: 'application/json',
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...options.headers
    }
  });
  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${path} returned ${response.status}: ${JSON.stringify(body)}`);
  }
  return { response, body };
}

async function check() {
  const live = await request('/health/live');
  assert.equal(live.body.data.status, 'ok');
  const ready = await request('/health/ready');
  assert.equal(ready.body.data.database, 'connected');

  const products = await request('/products?limit=100&sort=price-asc');
  assert.ok(Array.isArray(products.body.data), 'Expected the product endpoint to return an array');
  for (let index = 1; index < products.body.data.length; index += 1) {
    assert.ok(
      products.body.data[index - 1].price <= products.body.data[index].price,
      'Expected price-asc ordering'
    );
  }
  if (products.body.data.length) {
    const categorySlug = products.body.data[0].categorySlug;
    const filtered = await request(`/products?categorySlug=${encodeURIComponent(categorySlug)}`);
    assert.ok(filtered.body.data.every((product) => product.categorySlug === categorySlug));
  }
  console.log(`PASS health, database, product list and sort checks (${products.body.data.length} products)`);

  if (!email || !password) {
    if (requireFull) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required with --full');
    console.log('SKIP mutation round-trip (set ADMIN_EMAIL and ADMIN_PASSWORD, then add --full)');
    return;
  }

  const login = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  const auth = { authorization: `Bearer ${login.body.data.accessToken}` };
  const suffix = crypto.randomBytes(4).toString('hex');
  const categorySlug = `api-check-${suffix}`;
  const productId = `api-check-product-${suffix}`;
  let categoryCreated = false;
  let productCreated = false;
  try {
    await request('/categories', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ slug: categorySlug, name: `API Check ${suffix}` })
    });
    categoryCreated = true;
    await request('/products', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({
        id: productId,
        name: `API Check Product ${suffix}`,
        categorySlug,
        description: 'Temporary product created by the API checker',
        price: 100,
        stock: 1,
        images: [{ label: 'TEST', uri: 'https://example.com/product.jpg' }]
      })
    });
    productCreated = true;
    const updated = await request(`/products/${productId}`, {
      method: 'PATCH',
      headers: auth,
      body: JSON.stringify({ price: 125, stock: 2 })
    });
    assert.equal(updated.body.data.price, 125);
    assert.equal(updated.body.data.stock, 2);
    const search = await request(`/products?search=${productId}&active=all`);
    assert.equal(search.body.data[0].id, productId);
    console.log('PASS admin login and product/category CRUD round-trip');
  } finally {
    if (productCreated) await request(`/products/${productId}`, { method: 'DELETE', headers: auth });
    if (categoryCreated) await request(`/categories/${categorySlug}`, { method: 'DELETE', headers: auth });
  }
}

check().catch((error) => {
  console.error('API CHECK FAILED:', error.message);
  process.exit(1);
});
