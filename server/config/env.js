/**
 * Environment Configuration Loader
 * -------------------------------------------------------------
 * Validates required environment variables on boot so the server
 * never starts half-configured. Also derives safe defaults for dev.
 */

const required = (name, { warnOnly = false } = {}) => {
  const value = process.env[name];
  if (!value || /^your_/.test(value)) {
    if (warnOnly) {
      console.warn(`[ENV WARNING] ${name} is not set — related features will be disabled.`);
      return '';
    }
    throw new Error(`ENV: ${name} is required. Set it in .env and restart the server.`);
  }
  return value;
};

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

// In dev we allow a fallback; in production a weak/missing JWT secret is fatal.
let JWT_SECRET = process.env.JWT_SECRET || '';
if (!JWT_SECRET) {
  if (isProd) {
    throw new Error('ENV: JWT_SECRET is required in production. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
  }
  JWT_SECRET = 'medisage_vault_jwt_secret_key_2026';
  console.warn('[ENV WARNING] Using development JWT_SECRET fallback. Set JWT_SECRET in .env for anything real.');
}

const config = {
  NODE_ENV,
  isProd,
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/medisage',
  JWT_SECRET,
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || '7d',
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || '30d',
  GOOGLE_CLIENT_ID: (() => {
    const raw = process.env.GOOGLE_CLIENT_ID || '';
    return /^your_/.test(raw) ? '' : raw.trim();
  })(),
  FILE_ENCRYPTION_KEY: process.env.FILE_ENCRYPTION_KEY || '',
  // First-admin bootstrap for the audit/compliance console.
  // Set both explicitly in production; in dev a random admin is auto-seeded.
  ADMIN_SEED_EMAIL: (process.env.ADMIN_SEED_EMAIL || '').trim(),
  ADMIN_SEED_PASSWORD: (process.env.ADMIN_SEED_PASSWORD || '').trim(),
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  // Comma-separated whitelist. Dev defaults keep both common Vite ports working.
  CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  // SMTP delivery for password resets. Unconfigured = dev console fallback.
  SMTP_HOST: (process.env.SMTP_HOST || '').trim(),
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true', // true for 465, false for 587/STARTTLS
  SMTP_USER: (process.env.SMTP_USER || '').trim(),
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: (process.env.SMTP_FROM || 'MediSage <no-reply@medisage.health>').trim(),
  // Base URL used inside reset links (client route lives at /reset-password?token=...)
  APP_PUBLIC_URL: (process.env.APP_PUBLIC_URL || '').trim(),
  // Dev/test-only: disables ALL rate limiters (refuses to apply in production).
  RATE_LIMITS_DISABLED: (process.env.RATE_LIMITS_DISABLED || '') === 'true',
  // Extra local-only collectibles (password reset tokens are logged when no SMTP)
  DEV_DEBUG: NODE_ENV !== 'production',
};

module.exports = config;
