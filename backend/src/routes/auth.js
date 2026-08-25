'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validate } = require('../validation');
const { loginBody } = require('../schemas');
const { asyncHandler } = require('../middleware');
const { AppError } = require('../errors');

function authRoutes({ pool, config }) {
  const router = express.Router();

  router.post('/login', validate(loginBody), asyncHandler(async (req, res) => {
    const [rows] = await pool.execute(
      'SELECT id, email, password_hash, display_name, role, is_active FROM admins WHERE email = ? LIMIT 1',
      [req.body.email]
    );
    const admin = rows[0];
    const valid = admin && admin.is_active && await bcrypt.compare(req.body.password, admin.password_hash);
    if (!valid) throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');

    await pool.execute('UPDATE admins SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [admin.id]);
    const accessToken = jwt.sign(
      { sub: String(admin.id), email: admin.email, role: admin.role },
      config.jwtSecret,
      {
        algorithm: 'HS256',
        expiresIn: config.jwtExpiresIn,
        issuer: 'appashif-api',
        audience: 'appashif-admin'
      }
    );
    res.json({
      data: {
        accessToken,
        tokenType: 'Bearer',
        expiresIn: config.jwtExpiresIn,
        admin: { id: admin.id, email: admin.email, displayName: admin.display_name, role: admin.role }
      }
    });
  }));

  return router;
}

module.exports = { authRoutes };
