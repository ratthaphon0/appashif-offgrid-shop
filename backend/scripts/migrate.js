'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const mysql = require('mysql2/promise');
const { loadConfig } = require('../src/config');

async function migrate() {
  const config = loadConfig();
  const connection = await mysql.createConnection({
    ...config.database,
    multipleStatements: true,
    charset: 'utf8mb4'
  });
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename VARCHAR(255) NOT NULL PRIMARY KEY,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    const migrationDir = path.join(__dirname, '..', 'database', 'migrations');
    const files = (await fs.readdir(migrationDir)).filter((file) => file.endsWith('.sql')).sort();
    for (const filename of files) {
      const [[applied]] = await connection.execute(
        'SELECT filename FROM schema_migrations WHERE filename = ?',
        [filename]
      );
      if (applied) {
        console.log(`skip ${filename}`);
        continue;
      }
      const sql = await fs.readFile(path.join(migrationDir, filename), 'utf8');
      await connection.beginTransaction();
      try {
        await connection.query(sql);
        await connection.execute('INSERT INTO schema_migrations (filename) VALUES (?)', [filename]);
        await connection.commit();
        console.log(`applied ${filename}`);
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    }
  } finally {
    await connection.end();
  }
}

migrate().catch((error) => {
  console.error('Migration failed:', error.message);
  process.exit(1);
});
