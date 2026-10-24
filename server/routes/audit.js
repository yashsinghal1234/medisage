/**
 * Audit Router — /api/audit
 * -------------------------------------------------------------
 * GET /api/audit/me       — the authenticated user's own activity log
 * GET /api/audit/verify   — hash-chain integrity attestation (admin)
 * GET /api/audit/recent   — full audit search (admin)
 */

const express = require('express');
const authMiddleware = require('../middleware/auth');
const { query } = require('express-validator');
const { validate } = require('../middleware/validate');
const auditTrail = require('../services/auditTrail');

const router = express.Router();

const isAdmin = (req) => req.token?.role === 'admin';

// 1. Self-audit log
router.get(
  '/me',
  authMiddleware,
  validate([
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
  ]),
  async (req, res, next) => {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 50;
      const entries = await auditTrail.readEntries({ userId: req.userId, page, limit });
      res.json({ page, limit, entries });
    } catch (err) {
      next(err);
    }
  }
);

// 2. Chain integrity attestation (admin only)
router.get('/verify', authMiddleware, async (req, res, next) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Chain verification is restricted to administrators.' });
    }
    const result = await auditTrail.verifyChain();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// 3. Full audit search (admin only)
router.get(
  '/recent',
  authMiddleware,
  validate([
    query('action').optional().isString().isLength({ max: 60 }),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
  ]),
  async (req, res, next) => {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({ error: 'Audit review is restricted to administrators.' });
      }
      const page = req.query.page || 1;
      const limit = req.query.limit || 50;
      const entries = await auditTrail.readEntries({ action: req.query.action || null, page, limit });
      res.json({ page, limit, entries });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
