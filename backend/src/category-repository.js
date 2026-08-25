'use strict';

const { AppError } = require('./errors');
const { slugify } = require('./utils');

const SELECT = `SELECT c.slug, c.name, c.description, c.sort_order, c.is_active,
  COUNT(p.id) AS product_count, c.created_at, c.updated_at
  FROM categories c LEFT JOIN products p ON p.category_id = c.id`;

function mapCategory(row) {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    sortOrder: row.sort_order,
    isActive: Boolean(row.is_active),
    productCount: Number(row.product_count),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function listCategories(pool, includeInactive = false) {
  const [rows] = await pool.query(
    `${SELECT}${includeInactive ? '' : ' WHERE c.is_active = 1'} GROUP BY c.id ORDER BY c.sort_order, c.name`
  );
  return rows.map(mapCategory);
}

async function getCategory(pool, slug) {
  const [rows] = await pool.query(`${SELECT} WHERE c.slug = ? GROUP BY c.id LIMIT 1`, [slug]);
  if (!rows.length) throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Category was not found');
  return mapCategory(rows[0]);
}

async function createCategory(pool, input) {
  const slug = input.slug || slugify(input.name);
  if (!slug) throw new AppError(422, 'VALIDATION_ERROR', 'Category name cannot produce a valid slug');
  await pool.execute(
    `INSERT INTO categories (slug, name, description, sort_order, is_active)
     VALUES (?, ?, ?, ?, ?)`,
    [slug, input.name, input.description ?? null, input.sortOrder ?? 0, input.isActive ?? true]
  );
  return getCategory(pool, slug);
}

async function updateCategory(pool, currentSlug, input) {
  const category = await getCategory(pool, currentSlug);
  const slug = input.slug || currentSlug;
  const [result] = await pool.execute(
    `UPDATE categories SET slug=?, name=?, description=?, sort_order=?, is_active=?
     WHERE slug=?`,
    [
      slug, input.name ?? category.name,
      input.description === undefined ? category.description : input.description,
      input.sortOrder ?? category.sortOrder, input.isActive ?? category.isActive, currentSlug
    ]
  );
  if (!result.affectedRows) throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Category was not found');
  return getCategory(pool, slug);
}

async function deleteCategory(pool, slug) {
  const category = await getCategory(pool, slug);
  if (category.productCount > 0) {
    throw new AppError(409, 'CATEGORY_NOT_EMPTY', 'Move or delete products in this category first');
  }
  await pool.execute('DELETE FROM categories WHERE slug = ?', [slug]);
}

module.exports = { listCategories, getCategory, createCategory, updateCategory, deleteCategory };
