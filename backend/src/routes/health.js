'use strict';

const express = require('express');
const { asyncHandler } = require('../middleware');

function healthRoutes({ pool, deployment }) {
  const router = express.Router();

  router.get('/live', (_req, res) => {
    res.json({
      data: {
        status: 'ok',
        service: 'appashif-api',
        deployment,
        timestamp: new Date().toISOString()
      }
    });
  });

  router.get('/ready', asyncHandler(async (_req, res) => {
    await pool.query('SELECT 1');
    res.json({
      data: {
        status: 'ready',
        database: 'connected',
        deployment,
        timestamp: new Date().toISOString()
      }
    });
  }));

  return router;
}

module.exports = { healthRoutes };
