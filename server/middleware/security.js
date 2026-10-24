/**
 * Security Middleware Suite
 * -------------------------------------------------------------
 * Rate limiters, CORS policy factory and a global error handler.
 */

const rateLimit = require('express-rate-limit');

/** Global limiter — generous baseline to absorb bursts, block floods. */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this address. Please slow down and try again shortly.' },
});

/** Strict limiter for credential endpoints (brute-force protection). */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: { error: 'Too many authentication attempts. Please wait 15 minutes and try again.' },
});

/** Upload/extract endpoints cost disk + CPU — cap harder. */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  message: { error: 'Upload limit reached for this hour. Please try again later.' },
});

/** AI endpoints proxy paid/stationary resources. */
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { error: 'Too many AI requests. Please wait a few minutes before trying again.' },
});

/**
 * CORS policy — only whitelisted origins (CORS_ORIGINS in .env).
 * Echoes the requesting origin when whitelisted, so dev ports work,
 * and sets credentials:true so the httpOnly session cookies travel.
 */
function corsOptionsDelegate(corsOriginList) {
  const dynamicDefault = { origin: false, credentials: false }; // deny cross-origin by default
  return (req, callback) => {
    const origin = req.header('Origin');
    if (!origin || !corsOriginList.length) {
      return callback(null, dynamicDefault);
    }
    if (corsOriginList.includes(origin)) {
      return callback(null, { origin: true, credentials: true });
    }
    return callback(null, false);
  };
}

/** Global error handler — centralizes stack exposure only in dev. */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Clean, professional errors when the database is temporarily offline
  if (err.name === 'MongooseServerSelectionError' || err.name === 'MongoNotConnectedError' || err.name === 'MongoServerSelectionError') {
    return res.status(503).json({
      error: 'The clinical database is briefly unreachable. Please try again in a moment.',
      database: 'offline',
    });
  }
  const status = err.status || (err.name === 'ValidationError' ? 400 : 500);
  // Log full error server-side; never leak internals to the client in prod.
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${status}:`, err);

  res.status(status).json({
    error:
      status >= 500 && process.env.NODE_ENV === 'production'
        ? 'Internal server error. Please try again later.'
        : err.message || 'Internal server error.',
  });
}

module.exports = {
  globalLimiter,
  authLimiter,
  uploadLimiter,
  aiLimiter,
  corsOptionsDelegate,
  errorHandler,
};
