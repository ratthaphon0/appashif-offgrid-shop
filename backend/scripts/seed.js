'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { loadConfig } = require('../src/config');
const { createPool } = require('../src/db');
const { slugify } = require('../src/utils');

async function seed() {
  const config = loadConfig();
  const pool = createPool(config.database);
  const connection = await pool.getConnection();
  try {
    const products = JSON.parse(await fs.readFile(
      path.join(__dirname, '..', 'database', 'seed-products.json'),
      'utf8'
    ));
    await connection.beginTransaction();
    for (const [sortOrder, name] of [...new Set(products.map((item) => item.category))].entries()) {
      await connection.execute(
        `INSERT INTO categories (slug, name, sort_order) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), sort_order=VALUES(sort_order)`,
        [slugify(name), name, sortOrder]
      );
    }
    for (const product of products) {
      const [[category]] = await connection.execute('SELECT id FROM categories WHERE slug = ?', [slugify(product.category)]);
      await connection.execute(
        `INSERT INTO products
         (id, category_id, name, description, price, original_price, stock, badge,
          badge_color, image_color, accent_color, edition, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
         ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), name=VALUES(name),
          description=VALUES(description), price=VALUES(price), original_price=VALUES(original_price),
          stock=VALUES(stock), badge=VALUES(badge), badge_color=VALUES(badge_color),
          image_color=VALUES(image_color), accent_color=VALUES(accent_color), edition=VALUES(edition)`,
        [
          product.id, category.id, product.name, product.description, product.price,
          product.originalPrice ?? null, product.stock, product.badge ?? null,
          product.badgeColor ?? null, product.imageColor ?? null, product.accentColor ?? null,
          product.edition ?? null
        ]
      );
      await connection.execute('DELETE FROM product_images WHERE product_id = ?', [product.id]);
      for (const [index, image] of product.images.entries()) {
        await connection.execute(
          'INSERT INTO product_images (product_id, label, uri, sort_order) VALUES (?, ?, ?, ?)',
          [product.id, image.label, image.uri, index]
        );
      }
    }
    await connection.commit();
    console.log(`Seeded ${products.length} products`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

seed().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
