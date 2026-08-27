-- AppAshif Cloud MySQL export (sanitized for repository use)
--
-- This file contains application catalogue data only. The real admin row and
-- password hash are intentionally omitted. Create an administrator with:
--   npm run admin:create
--
-- The production Cloud database is owned by the assigned student account.
-- Review this file before importing it into any environment.

CREATE DATABASE IF NOT EXISTS ip_std6730202734
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ip_std6730202734;

CREATE TABLE IF NOT EXISTS categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(64) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(1000) NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_slug (slug),
  KEY idx_categories_active_sort (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(64) NOT NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) UNSIGNED NOT NULL,
  original_price DECIMAL(10,2) UNSIGNED NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  badge VARCHAR(60) NULL,
  badge_color CHAR(7) NULL,
  image_color CHAR(7) NULL,
  accent_color CHAR(7) NULL,
  edition VARCHAR(80) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_products_category (category_id),
  KEY idx_products_active_updated (is_active, updated_at),
  KEY idx_products_price (price),
  KEY idx_products_stock (stock),
  CONSTRAINT chk_products_original_price
    CHECK (original_price IS NULL OR original_price >= price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_images (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id VARCHAR(64) NOT NULL,
  label VARCHAR(50) NOT NULL,
  uri VARCHAR(2048) NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_product_images_order (product_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admins (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  role ENUM('admin') NOT NULL DEFAULT 'admin',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admins_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS schema_migrations (
  filename VARCHAR(255) NOT NULL PRIMARY KEY,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO categories (id, slug, name, description, sort_order, is_active)
VALUES
  (1, 'oversized-t-shirt', 'Oversized T-shirt', NULL, 0, 1),
  (2, 'utility-pants', 'Utility Pants', NULL, 1, 1),
  (3, 'heavyweight-hoodie', 'Heavyweight Hoodie', NULL, 2, 1),
  (4, 'unisex-sneakers', 'Unisex Sneakers', NULL, 3, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name), sort_order = VALUES(sort_order), is_active = VALUES(is_active);

INSERT INTO products (id, category_id, name, description, price, original_price, stock, badge, badge_color, image_color, accent_color, edition, is_active)
VALUES
  ('acid-grid-tee', 1, 'Acid Grid Tee', 'Acid-wash cotton tee with a relaxed streetwear fit.', 890.00, 1190.00, 18, 'SALE -25%', '#FF4FA3', '#D9FF74', '#8B5CF6', 'DROP 01', 1),
  ('pixel-rush-hoodie', 3, 'Pixel Rush Hoodie', 'Warm heavyweight hoodie with an oversized silhouette.', 1890.00, 2290.00, 9, 'HOT DROP', '#C8FF35', '#B8A0FF', '#FF4FA3', 'NEW', 1),
  ('signal-cargo', 2, 'Signal Cargo', 'Multi-pocket cargo pants built for everyday movement.', 1590.00, NULL, 42, 'LIMITED', '#FF6B2C', '#FF9D73', '#C8FF35', '42 LEFT', 1),
  ('static-runner', 4, 'Switch Move Runner', 'Lightweight everyday runners for a fast city pace.', 2190.00, NULL, 14, 'EXCLUSIVE', '#8B5CF6', '#8DE4FF', '#FF6B2C', 'WEB ONLY', 1),
  ('test', 1, 'Test1', 'test', 1000.00, 1222.00, 10, 'NEW', '#C8FF35', '#E8DCFF', '#8B5CF6', 'NEW', 0)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id), name = VALUES(name), description = VALUES(description),
  price = VALUES(price), original_price = VALUES(original_price), stock = VALUES(stock),
  badge = VALUES(badge), badge_color = VALUES(badge_color), image_color = VALUES(image_color),
  accent_color = VALUES(accent_color), edition = VALUES(edition), is_active = VALUES(is_active);

INSERT INTO product_images (id, product_id, label, uri, sort_order)
VALUES
  (1, 'acid-grid-tee', 'BACK', 'https://www.jnorss.in/cdn/shop/files/alice_in_chains_GREEN_ACId_WASH_BACK_DR_SLEVESS_copy_3_8b286dcf-306d-4bfd-86db-3f63e55a36d3.jpg?v=1782756090&width=3840', 0),
  (2, 'acid-grid-tee', 'FRONT', 'https://www.jnorss.in/cdn/shop/files/alice_in_chains_front_green_acid_wash_dr._sleeves_tees_copy_5f1c7429-427b-407f-b67e-542b55ede982.jpg?v=1782756091&width=3840', 1),
  (3, 'signal-cargo', 'FRONT', 'https://underarmour.scene7.com/is/image/Underarmour/PS1366201-001_HF?rp=standard-0pad|pdpfull&qlt=85&bgc=f0f0f0&wid=1200&hei=1500&op_usm=1.75,0.3,2,0', 0),
  (4, 'signal-cargo', 'BACK', 'https://underarmour.scene7.com/is/image/Underarmour/PS1366201-001_HB?rp=standard-0pad|pdpfull&qlt=85&bgc=f0f0f0&wid=1200&hei=1500&op_usm=1.75,0.3,2,0', 1),
  (5, 'pixel-rush-hoodie', 'FRONT', 'https://media.lotsthailand.com/media/catalog/product/cache/115fac86e6b61ded262cffd864631a46/8/b/8by8jk3-b_1_1.jpg', 0),
  (6, 'pixel-rush-hoodie', 'BACK', 'https://media.lotsthailand.com/media/catalog/product/cache/115fac86e6b61ded262cffd864631a46/8/b/8by8jk3-a_2_1.jpg', 1),
  (7, 'static-runner', 'ANGLE 1', 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/94188f555c1e4e7bb7de858a1b41e769_9366/Switch_Move_Running_Shoes_White_IG1761_01_standard.jpg', 0),
  (8, 'static-runner', 'ANGLE 2', 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/16bbbca344344786a2e8c514f2056b5b_9366/Switch_Move_Running_Shoes_White_IG1761_02_standard_hover.jpg', 1),
  (9, 'static-runner', 'ANGLE 3', 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/8544a026f55840669aeed1bc042516eb_9366/Switch_Move_Running_Shoes_White_IG1761_04_standard.jpg', 2),
  (15, 'test', 'FRONT', 'https://genesis17.com/cdn/shop/files/Fear_Of_God_Essentials_Hoodie_Jet_Black_FW23_1.jpg?v=1749889808&width=1200', 0)
ON DUPLICATE KEY UPDATE label = VALUES(label), uri = VALUES(uri), sort_order = VALUES(sort_order);

INSERT INTO schema_migrations (filename)
VALUES ('001_initial_schema.sql')
ON DUPLICATE KEY UPDATE filename = VALUES(filename);

-- Admin credentials are intentionally not exported. Run npm run admin:create.
