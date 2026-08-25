'use strict';

const bcrypt = require('bcryptjs');
const { loadConfig } = require('../src/config');
const { createPool } = require('../src/db');

function argument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function createAdmin() {
  const email = (argument('email') || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = argument('password') || process.env.ADMIN_PASSWORD || '';
  const displayName = argument('name') || 'AppAshif Admin';
  if (!email.includes('@')) throw new Error('Provide a valid --email or ADMIN_EMAIL');
  if (password.length < 12) throw new Error('Admin password must contain at least 12 characters');

  const config = loadConfig();
  const pool = createPool(config.database);
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await pool.execute(
      `INSERT INTO admins (email, password_hash, display_name)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash),
         display_name=VALUES(display_name), is_active=TRUE`,
      [email, passwordHash, displayName]
    );
    console.log(`Admin ${email} is ready`);
  } finally {
    await pool.end();
  }
}

createAdmin().catch((error) => {
  console.error('Create admin failed:', error.message);
  process.exit(1);
});
