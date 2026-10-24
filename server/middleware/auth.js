const jwt = require('jsonwebtoken');
const config = require('../config/env');
const mongoose = require('mongoose');

/**
 * JWT Bearer authentication middleware.
 *  - Validates signature against the single configured JWT_SECRET.
 *  - When a `tv` (tokenVersion) claim is present and Mongo is reachable,
 *    rejects tokens stale relative to the user's current tokenVersion
 *    (password change / session revocation). DB outages fail open to
 *    signature-only checking so resilient local mode keeps working.
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Accept either the Authorization header (API/mobile clients) or the
    // httpOnly session cookie (browser-first, XSS-resistant channel).
    const headerToken = req.header('Authorization')?.replace('Bearer ', '');
    const cookieToken = req.cookies?.medisage_token;
    const token = headerToken || cookieToken;

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.userId = decoded.userId;
    req.token = decoded;

    // Session-invalidation check (only when token carries tv and DB is online)
    if (decoded.tv !== undefined && mongoose.connection.readyState === 1) {
      try {
        const User = require('../models/User');
        const user = await User.findById(decoded.userId).select('tokenVersion').lean();
        if (user && (user.tokenVersion || 0) !== decoded.tv) {
          return res.status(401).json({ error: 'Session expired by a password change. Please sign in again.' });
        }
      } catch (dbErr) {
        // fail open when DB is unreachable (signature still authoritative)
      }
    }

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = authMiddleware;
