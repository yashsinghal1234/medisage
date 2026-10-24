/**
 * Admin Bootstrap Service
 * -------------------------------------------------------------
 * Auditing endpoints (/api/audit/verify, /recent) and the admin
 * console are role-gated, but public registration always creates
 * 'patient' accounts. This seeds the FIRST administrator:
 *
 *  - If ADMIN_SEED_EMAIL + ADMIN_SEED_PASSWORD are configured, that
 *    account is created (or promoted) as admin.
 *  - Otherwise, in DEVELOPMENT ONLY, an admin is seeded with a
 *    cryptographically random one-time password printed to the server
 *    console. Production refuses silent seeding.
 *
 * Idempotent: does nothing once any admin exists.
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const config = require('../config/env');

const auditTrail = require('./auditTrail');
const User = require('../models/User');

let seeded = false;

async function seedAdmin() {
  if (seeded) return;
  if (mongoose.connection.readyState !== 1) return;
  seeded = true;

  try {
    const existingAdmins = await User.countDocuments({ role: 'admin' });
    if (existingAdmins > 0) return; // an admin already exists — nothing to do

    const email = config.ADMIN_SEED_EMAIL.toLowerCase();
    const password = config.ADMIN_SEED_PASSWORD;

    if (email && password) {
      const existing = await User.findOne({ email });
      if (existing) {
        existing.role = 'admin';
        // Only set the password when the account is brand new or broken
        // (e.g. a previous failed seed persisted plaintext); never silently
        // overwrite a working account's credential.
        const looksHashed = /^\$2[aby]\$/.test(existing.password || '');
        if (!looksHashed) {
          existing.password = await bcrypt.hash(password, 10);
          await existing.save();
        } else {
          await existing.save();
        }
        console.log(`[ADMIN] Existing account promoted to admin: ${email}`);
        auditTrail.record({
          userId: existing._id,
          action: 'admin_seeded',
          resourceType: 'user',
          resourceId: existing._id,
          meta: { method: 'env-promotion' },
        }).catch(() => {});
        return;
      }
      await User.create({
        name: 'Compliance Administrator',
        email,
        password: await bcrypt.hash(password, 10), // hashed explicitly (no model pre-save hook)
        role: 'admin',
        onboarded: true,
        bloodGroup: 'O+ Positive',
      });
      console.log(`[ADMIN] Seeded admin account from ADMIN_SEED_EMAIL: ${email}`);
      auditTrail.record({
        action: 'admin_seeded',
        resourceType: 'user',
        resourceId: email,
        meta: { method: 'env-seed' },
      }).catch(() => {});
      return;
    }

    if (config.isProd) {
      console.warn(
        '[ADMIN WARN] No admin exists and ADMIN_SEED_EMAIL/ADMIN_SEED_PASSWORD are not set. ' +
        'Audit verification endpoints will be unusable until one account is promoted manually.'
      );
      seeded = false; // allow retry if env is fixed at runtime
      return;
    }

    // DEVELOPMENT ONLY: random one-time credentials
    const tempPassword = crypto.randomBytes(12).toString('base64url');
    const devEmail = email || 'admin@medisage.health';
    const devName = email ? 'Compliance Administrator' : 'Dev Compliance Administrator';
    await User.create({
      name: devName,
      email: devEmail,
      password: await bcrypt.hash(tempPassword, 10), // hashed explicitly (no model pre-save hook)
      role: 'admin',
      onboarded: true,
      bloodGroup: 'O+ Positive',
    });
    console.log('\n[ADMIN] Development admin account seeded (used for audit review & compliance console):');
    console.log(`   email: ${devEmail}`);
    console.log(`   temporary password (this boot only): ${tempPassword}\n`);
    auditTrail.record({
      action: 'admin_seeded',
      resourceType: 'user',
      resourceId: devEmail,
      meta: { method: 'dev-seed' },
    }).catch(() => {});
  } catch (err) {
    console.error('[ADMIN] Seeding failed:', err.message);
    seeded = false; // retry on next boot
  }
}

module.exports = seedAdmin;
