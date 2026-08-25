'use strict';

const mysql = require('mysql2/promise');

function createPool(config) {
  return mysql.createPool({
    ...config,
    waitForConnections: true,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    decimalNumbers: true,
    charset: 'utf8mb4',
    timezone: 'Z'
  });
}

module.exports = { createPool };
