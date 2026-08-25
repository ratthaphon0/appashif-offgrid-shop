'use strict';

const express = require('express');
const { validate } = require('../validation');
const { categoryBody, categoryPatch } = require('../schemas');
const { asyncHandler, requireAdmin } = require('../middleware');
const repository = require('../category-repository');

function categoryRoutes({ pool, config }) {
  const router = express.Router();
  const admin = requireAdmin(config);

  router.get('/', asyncHandler(async (req, res) => {
    const includeInactive = req.query.active === 'all';
    res.json({ data: await repository.listCategories(pool, includeInactive) });
  }));

  router.get('/:slug', asyncHandler(async (req, res) => {
    res.json({ data: await repository.getCategory(pool, req.params.slug) });
  }));

  router.post('/', admin, validate(categoryBody), asyncHandler(async (req, res) => {
    const category = await repository.createCategory(pool, req.body);
    res.status(201).location(`${req.baseUrl}/${category.slug}`).json({ data: category });
  }));

  router.patch('/:slug', admin, validate(categoryPatch), asyncHandler(async (req, res) => {
    res.json({ data: await repository.updateCategory(pool, req.params.slug, req.body) });
  }));

  router.put('/:slug', admin, validate(categoryBody), asyncHandler(async (req, res) => {
    res.json({ data: await repository.updateCategory(pool, req.params.slug, req.body) });
  }));

  router.delete('/:slug', admin, asyncHandler(async (req, res) => {
    await repository.deleteCategory(pool, req.params.slug);
    res.status(204).end();
  }));

  return router;
}

module.exports = { categoryRoutes };
