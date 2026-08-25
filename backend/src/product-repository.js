'use strict';

const { AppError } = require('./errors');
const { slugify, parsePositiveInt } = require('./utils');

const PRODUCT_SELECT = `
  SELECT p.id, p.name, c.name AS category, c.slug AS category_slug,
    p.description, p.price, p.original_price, p.stock, p.badge,
    p.badge_color, p.image_color, p.accent_color, p.edition,
    p.is_active, p.created_at, p.updated_at
  FROM products p
  JOIN categories c ON c.id = p.category_id`;

function mapProduct(row, images = []) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    categorySlug: row.category_slug,
    description: row.description,
    price: Number(row.price),
    originalPrice: row.original_price === null ? null : Number(row.original_price),
    stock: row.stock,
    badge: row.badge,
    badgeColor: row.badge_color,
    imageColor: row.image_color,
    accentColor: row.accent_color,
    edition: row.edition,
    isActive: Boolean(row.is_active),
    images,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function attachImages(connection, rows) {
  if (!rows.length) return [];
  const [imageRows] = await connection.query(
    `SELECT product_id, label, uri, sort_order
     FROM product_images WHERE product_id IN (?) ORDER BY product_id, sort_order, id`,
    [rows.map((row) => row.id)]
  );
  const byProduct = new Map();
  for (const image of imageRows) {
    const images = byProduct.get(image.product_id) || [];
    images.push({ label: image.label, uri: image.uri, sortOrder: image.sort_order });
    byProduct.set(image.product_id, images);
  }
  return rows.map((row) => mapProduct(row, byProduct.get(row.id) || []));
}

async function listProducts(pool, query) {
  const page = parsePositiveInt(query.page, 1, 100000);
  const limit = parsePositiveInt(query.limit, 20, 100);
  if (page === null || limit === null) {
    throw new AppError(422, 'VALIDATION_ERROR', 'page and limit must be positive integers; limit cannot exceed 100');
  }

  const where = [];
  const params = [];
  if (query.search) {
    where.push('(p.name LIKE ? OR p.description LIKE ? OR p.id LIKE ?)');
    const term = `%${query.search.toString().trim()}%`;
    params.push(term, term, term);
  }
  const category = query.categorySlug || query.category;
  if (category) {
    where.push('c.slug = ?');
    params.push(category);
  }
  if (query.minPrice !== undefined) {
    where.push('p.price >= ?');
    params.push(Number(query.minPrice));
  }
  if (query.maxPrice !== undefined) {
    where.push('p.price <= ?');
    params.push(Number(query.maxPrice));
  }
  if ([query.minPrice, query.maxPrice].some((value) => value !== undefined && (!Number.isFinite(Number(value)) || Number(value) < 0))) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Price filters must be non-negative numbers');
  }
  if (
    query.minPrice !== undefined &&
    query.maxPrice !== undefined &&
    Number(query.minPrice) > Number(query.maxPrice)
  ) {
    throw new AppError(422, 'VALIDATION_ERROR', 'minPrice cannot be greater than maxPrice');
  }
  if (query.inStock === 'true') where.push('p.stock > 0');
  if (query.inStock === 'false') where.push('p.stock = 0');
  if (query.onSale === 'true') where.push('p.original_price > p.price');
  if (query.badge) {
    where.push('p.badge = ?');
    params.push(query.badge);
  }
  if (query.active !== 'all') where.push('p.is_active = 1');

  const sorts = {
    newest: 'p.created_at DESC',
    updated: 'p.updated_at DESC',
    'price-asc': 'p.price ASC',
    price_asc: 'p.price ASC',
    'price-desc': 'p.price DESC',
    price_desc: 'p.price DESC',
    'name-asc': 'p.name ASC',
    name_asc: 'p.name ASC',
    'name-desc': 'p.name DESC',
    name_desc: 'p.name DESC',
    'stock-asc': 'p.stock ASC',
    'stock-desc': 'p.stock DESC'
  };
  const orderBy = sorts[query.sort || 'updated'];
  if (!orderBy) throw new AppError(422, 'VALIDATION_ERROR', 'Unsupported sort value');
  const whereSql = where.length ? ` WHERE ${where.join(' AND ')}` : '';

  const [[countRow]] = await pool.query(
    `SELECT COUNT(*) AS total FROM products p JOIN categories c ON c.id = p.category_id${whereSql}`,
    params
  );
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `${PRODUCT_SELECT}${whereSql} ORDER BY ${orderBy}, p.id ASC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return {
    data: await attachImages(pool, rows),
    meta: {
      page,
      limit,
      total: countRow.total,
      totalPages: Math.ceil(countRow.total / limit)
    }
  };
}

async function getProduct(pool, id, includeInactive = false) {
  const [rows] = await pool.query(
    `${PRODUCT_SELECT} WHERE p.id = ?${includeInactive ? '' : ' AND p.is_active = 1'} LIMIT 1`,
    [id]
  );
  if (!rows.length) throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product was not found');
  return (await attachImages(pool, rows))[0];
}

async function findCategoryId(connection, slug) {
  const [[category]] = await connection.query('SELECT id FROM categories WHERE slug = ? LIMIT 1', [slug]);
  if (!category) throw new AppError(422, 'INVALID_CATEGORY', `Category '${slug}' does not exist`);
  return category.id;
}

async function replaceImages(connection, productId, images = []) {
  await connection.query('DELETE FROM product_images WHERE product_id = ?', [productId]);
  for (const [index, image] of images.entries()) {
    await connection.execute(
      'INSERT INTO product_images (product_id, label, uri, sort_order) VALUES (?, ?, ?, ?)',
      [productId, image.label, image.uri, image.sortOrder ?? index]
    );
  }
}

async function createProduct(pool, input) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const id = input.id || slugify(input.name);
    if (!id) throw new AppError(422, 'VALIDATION_ERROR', 'Product name cannot produce a valid id');
    const categoryId = await findCategoryId(connection, input.categorySlug);
    await connection.execute(
      `INSERT INTO products
       (id, category_id, name, description, price, original_price, stock, badge,
        badge_color, image_color, accent_color, edition, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, categoryId, input.name, input.description, input.price, input.originalPrice ?? null,
        input.stock, input.badge ?? null, input.badgeColor ?? null, input.imageColor ?? null,
        input.accentColor ?? null, input.edition ?? null, input.isActive ?? true
      ]
    );
    await replaceImages(connection, id, input.images || []);
    await connection.commit();
    return getProduct(pool, id, true);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateProduct(pool, id, input) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[existing]] = await connection.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [id]);
    if (!existing) throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product was not found');
    const categoryId = input.categorySlug
      ? await findCategoryId(connection, input.categorySlug)
      : existing.category_id;
    const nextPrice = input.price ?? Number(existing.price);
    const nextOriginalPrice =
      input.originalPrice === undefined
        ? existing.original_price === null
          ? null
          : Number(existing.original_price)
        : input.originalPrice;
    if (nextOriginalPrice !== null && nextOriginalPrice < nextPrice) {
      throw new AppError(
        422,
        'VALIDATION_ERROR',
        'originalPrice must be greater than or equal to price'
      );
    }
    await connection.execute(
      `UPDATE products SET category_id=?, name=?, description=?, price=?, original_price=?,
       stock=?, badge=?, badge_color=?, image_color=?, accent_color=?, edition=?, is_active=?
       WHERE id=?`,
      [
        categoryId, input.name ?? existing.name, input.description ?? existing.description,
        nextPrice, nextOriginalPrice,
        input.stock ?? existing.stock, input.badge === undefined ? existing.badge : input.badge,
        input.badgeColor === undefined ? existing.badge_color : input.badgeColor,
        input.imageColor === undefined ? existing.image_color : input.imageColor,
        input.accentColor === undefined ? existing.accent_color : input.accentColor,
        input.edition === undefined ? existing.edition : input.edition,
        input.isActive ?? Boolean(existing.is_active), id
      ]
    );
    if (input.images) await replaceImages(connection, id, input.images);
    await connection.commit();
    return getProduct(pool, id, true);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function deleteProduct(pool, id, { permanent = false } = {}) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    if (permanent) {
      await connection.execute('DELETE FROM product_images WHERE product_id = ?', [id]);
      const [result] = await connection.execute('DELETE FROM products WHERE id = ?', [id]);
      if (!result.affectedRows) {
        throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product was not found');
      }
    } else {
      const [result] = await connection.execute('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
      if (!result.affectedRows) {
        throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product was not found');
      }
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
