'use strict';

const { loadConfig } = require('./src/config');
const { createPool } = require('./src/db');
const { createApp } = require('./src/app');

async function main() {
  const config = loadConfig();
  const pool = createPool(config.database);
  const app = createApp({ config, pool });

  const server = app.listen(config.port, config.host, () => {
    console.log(`AppAshif API listening on http://${config.host}:${config.port}${config.apiPrefix}`);
  });

  let shuttingDown = false;
  async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received; shutting down`);
    server.close(async (error) => {
      await pool.end();
      if (error) {
        console.error(error);
        process.exitCode = 1;
      }
      process.exit();
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((error) => {
  console.error('Failed to start API:', error);
  process.exit(1);
});
