/**
 * MediSage Server — Express bootstrap
 * -------------------------------------------------------------
 * Security defaults applied at the edge:
 *  - helmet security headers
 *  - origin-whitelisted CORS (CORS_ORIGINS in .env)
 *  - global + endpoint-specific rate limiting
 *  - NO public static /uploads — document files stream only through the
 *    authorized GET /api/documents/:id/file route
 *  - global error handler (stack details suppressed in production)
 *  - graceful shutdown on SIGINT/SIGTERM (＋ close Mongo cleanly)
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

require('dotenv').config();
const config = require('./config/env');
const { globalLimiter, corsOptionsDelegate, errorHandler } = require('./middleware/security');
const helmet = require('helmet');

const app = express();

// Ensure runtime data directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');
for (const dir of [uploadsDir, dataDir]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ------------------------------------------------------------------
// Global middleware
// ------------------------------------------------------------------
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: false, // SPA client controls its own CSP
}));
app.use(globalLimiter);
app.use(cors(corsOptionsDelegate(config.CORS_ORIGINS)));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// ------------------------------------------------------------------
// MongoDB connection (graceful resilient fallback to local JSON stores)
// ------------------------------------------------------------------
mongoose.set('bufferCommands', false);
let isMongoConnected = false;

mongoose
  .connect(config.MONGODB_URI, {
    serverSelectionTimeoutMS: 4000,
  })
  .then(() => {
    isMongoConnected = true;
    console.log('[OK] MongoDB connected successfully to MediSage database');
    // Idempotent first-admin bootstrap (dev: random password printed once)
    require('./services/adminSeed')();
  })
  .catch((err) => {
    isMongoConnected = false;
    console.warn('[WARN] MongoDB connection warning (running in resilient local storage mode):', err.message);
  });

mongoose.connection.on('disconnected', () => {
  isMongoConnected = false;
});

// ------------------------------------------------------------------
// Routes
// ------------------------------------------------------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/clinical', require('./routes/clinical'));
app.use('/api/family', require('./routes/family'));
app.use('/api/fhir', require('./routes/fhir'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/admin', require('./routes/admin'));

// Health check root route
app.get(['/', '/api/health'], (req, res) => {
  res.json({
    name: 'MediSage Clinical API',
    status: 'online',
    version: '3.0.0',
    database: isMongoConnected ? 'mongodb' : 'local-resilient',
    theme: 'MediSage — Clinical Vault & Health Intelligence',
    endpoints: ['/api/auth', '/api/documents', '/api/ai', '/api/clinical', '/api/family', '/api/fhir', '/api/dashboard', '/api/audit', '/api/admin'],
  });
});

// 404 for unknown API routes (before the error handler)
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Unknown API route: ${req.method} ${req.originalUrl}` });
});

// Global error handler (must be last)
app.use(errorHandler);

// ------------------------------------------------------------------
// Start + graceful shutdown
// ------------------------------------------------------------------
// TLS terminates either at a reverse proxy (recommended in production) or
// natively: set SSL_CERT_PATH to a PEM or PFX bundle (SSL_KEY_PATH for the
// separate key file when using plain PEM). PFX bundles may need SSL_KEY path
// omitted and the password baked via SSL_PFX_PASSPHRASE (dev/self-signed only).
const sslCertPath = process.env.SSL_CERT_PATH;
const sslKeyPath = process.env.SSL_KEY_PATH;

let tlsServer = null;
if (sslCertPath) {
  const tlsOptions = {};
  if (/\.pfx$/i.test(sslCertPath)) {
    tlsOptions.pfx = fs.readFileSync(sslCertPath);
    if (process.env.SSL_PFX_PASSPHRASE) tlsOptions.passphrase = process.env.SSL_PFX_PASSPHRASE;
  } else {
    tlsOptions.cert = fs.readFileSync(sslCertPath);
    tlsOptions.key = sslKeyPath ? fs.readFileSync(sslKeyPath) : undefined;
  }
  tlsServer = https.createServer(tlsOptions, app);
  tlsServer.listen(config.PORT, () => {
    console.log(`[START] MediSage v3 Server (TLS) listening on https://localhost:${config.PORT} (${config.NODE_ENV})`);
  });
} else {
  tlsServer = http.createServer(app);
  tlsServer.listen(config.PORT, () => {
    console.log(`[START] MediSage v3 Server listening on http://localhost:${config.PORT} (${config.NODE_ENV})`);
  });
}
tlsServer.on('error', (err) => {
  console.error('[FATAL] Server listen error:', err.message);
  process.exit(1);
});
const server = tlsServer;
if (!config.isProd) {
  console.log('   [DEV] Development mode — resilient local stores & verbose output are enabled.');
}

const shutdown = async (signal) => {
  console.log(`\n${signal} received — shutting down gracefully…`);
  server.close(async () => {
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed. Server stopped.');
      process.exit(0);
    } catch (err) {
      process.exit(0);
    }
  });
  // Force-exit if connections hang
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = app;
