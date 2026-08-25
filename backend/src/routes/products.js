'use strict';

const express = require('express');
const { validate } = require('../validation');
const { productFields, productBody, productPatch } = require('../schemas');
const { asyncHandler, requireAdmin } = require('../middleware');
const repository = require('../product-repository');

function productRoutes({ pool, config }) {
  const router = express.Router();
  const admin = requireAdmin(config);

  router.get('/', asyncHandler(async (req, res) => {
    res.json(await repository.listProducts(pool, req.query));
  }));

  router.get('/:id', asyncHandler(async (req, res) => {
    const includeInactive = req.query.includeInactive === 'true' || req.query.active === 'all';
    res.json({ data: await repository.getProduct(pool, req.params.id, includeInactive) });
  }));

  router.post('/', admin, validate(productBody), asyncHandler(async (req, res) => {
    const product = await repository.createProduct(pool, req.body);
    res.status(201).location(`${req.baseUrl}/${product.id}`).json({ data: product });
  }));

  router.patch('/:id', admin, validate(productPatch), asyncHandler(async (req, res) => {
    res.json({ data: await repository.updateProduct(pool, req.params.id, req.body) });
  }));

  router.put('/:id', admin, validate(productFields.omit({ id: true })), asyncHandler(async (req, res) => {
    res.json({ data: await repository.updateProduct(pool, req.params.id, req.body) });
  }));

  router.delete('/:id', admin, asyncHandler(async (req, res) => {
    const permanent = req.query.permanent === 'true';
    await repository.deleteProduct(pool, req.params.id, { permanent });
    res.status(204).end();
  }));

  return router;
}

module.exports = { productRoutes };
