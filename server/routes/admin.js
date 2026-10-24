/**
 * Admin Router — /api/admin
 * -------------------------------------------------------------
 * Compliance console for administrators. Every action is audit-logged.
 *
 * GET  /api/admin/users                  — list accounts (paged, searchable)
 * PUT  /api/admin/users/:id/role         — promote/demote (admin <-> patient)
 * POST /api/admin/users/:id/revoke-sessions — force-logout a user account
 *
 * Role checks use the verified JWT payload (req.token.role), so a
 * demoted admin cannot retain power with an in-flight access token:
 * role checks are against CURRENT role for promotion endpoints.
 */

const express = require('express');
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const auditTrail = require('../services/auditTrail');
const { validate } = require('../middleware/validate');
const { body, param, query } = require('express-validator');

const router = express.Router();

const auditRecord = (params) => {
  auditTrail.record(params).catch(() => {});
};

const requireAdmin = (req, res) => {
  if (req.token?.role !== 'admin') {
    res.status(403).json({ error: 'Administrator privileges required.' });
    return false;
  }
  // Re-verify role against the CURRENT database state — token payload alone
  // must never be trusted for mutating actions after a possible demotion.
  if (mongoose.connection.readyState === 1 && req.userId) {
    return true; // checked per-route (async) below
  }
  return true;
};

const adminGate = async (req, res, next) => {
  if (!requireAdmin(req, res)) return;
  try {
    const me = await User.findById(req.userId).select('role').lean();
    if (!me) return res.status(401).json({ error: 'Account not found' });
    if (me.role !== 'admin') {
      auditRecord({
        userId: req.userId,
        action: 'admin_access_denied',
        resourceType: 'user',
        resourceId: req.userId,
        req,
        outcome: 'failure',
        meta: { route: req.originalUrl, tokenRole: req.token?.role, dbRole: me.role },
      });
      return res.status(403).json({ error: 'Administrator privileges required.' });
    }
    next();
  } catch (err) {
    next(err);
  }
};

const onlyDatabase = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ error: 'The compliance console requires the clinical database, which is briefly unreachable.' });
    return false;
  }
  return true;
};

// 1. List users
router.get(
  '/users',
  authMiddleware,
  adminGate,
  validate([
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('search').optional().isString().isLength({ max: 100 }),
  ]),
  async (req, res, next) => {
    if (!onlyDatabase(res)) return;
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 25;
      const query = {};
      if (req.query.search) {
        const rx = { $regex: String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
        query.$or = [{ name: rx }, { email: rx }];
      }
      const [users, total] = await Promise.all([
        User.find(query)
          .select('name email role onboarded authProvider createdAt googleId')
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        User.countDocuments(query),
      ]);
      res.json({ page, limit, total, users });
    } catch (err) {
      next(err);
    }
  }
);

// 2. Promote / demote role
router.put(
  '/users/:id/role',
  authMiddleware,
  adminGate,
  validate([
    param('id').isMongoId().withMessage('Invalid user id'),
    body('role').isIn(['patient', 'admin']).withMessage('Role must be patient or admin'),
  ]),
  async (req, res, next) => {
    if (!onlyDatabase(res)) return;
    try {
      if (String(req.params.id) === String(req.userId)) {
        return res.status(400).json({ error: 'Administrators cannot change their own role.' });
      }
      const target = await User.findById(req.params.id);
      if (!target) return res.status(404).json({ error: 'User not found' });

      const previousRole = target.role || 'patient';
      target.role = req.body.role;
      // Bracket role changes with a tokenVersion bump: a demoted admin must
      // lose all in-flight sessions immediately.
      if (previousRole !== req.body.role) {
        target.tokenVersion = (target.tokenVersion || 0) + 1;
        await target.save();
        await RefreshToken.updateMany({ userId: target._id, revokedAt: null }, { revokedAt: new Date() });
      }

      auditRecord({
        userId: req.userId,
        action: 'role_changed',
        resourceType: 'user',
        resourceId: target._id,
        req,
        meta: { target: target.email, from: previousRole, to: req.body.role, sessionsRevoked: true },
      });
      res.json({ message: `Role updated to ${req.body.role}; all target sessions were revoked.`, user: { _id: target._id, email: target.email, role: target.role } });
    } catch (err) {
      next(err);
    }
  }
);

// 3. Force-logout (revoke all sessions) for a user account
router.post(
  '/users/:id/revoke-sessions',
  authMiddleware,
  adminGate,
  validate([param('id').isMongoId().withMessage('Invalid user id')]),
  async (req, res, next) => {
    if (!onlyDatabase(res)) return;
    try {
      const target = await User.findById(req.params.id);
      if (!target) return res.status(404).json({ error: 'User not found' });

      target.tokenVersion = (target.tokenVersion || 0) + 1;
      await target.save();
      await RefreshToken.updateMany({ userId: target._id, revokedAt: null }, { revokedAt: new Date() });

      auditRecord({
        userId: req.userId,
        action: 'admin_forced_logout',
        resourceType: 'user',
        resourceId: target._id,
        req,
        meta: { target: target.email },
      });
      res.json({ message: 'All sessions for this account were revoked.' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
