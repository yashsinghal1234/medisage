/**
 * Clinical Pharmacovigilance Router — /api/clinical
 * -------------------------------------------------------------
 * The Safety Guard engine endpoints:
 *   POST /api/clinical/interactions     — evaluate a medication list interactively.
 *   POST /api/clinical/sandbox          — sandbox simulator: prospective meds BEFORE ingestion.
 *   GET  /api/clinical/profile-scan     — scan meds parsed out of the user's uploaded prescriptions.
 */

const express = require('express');
const authMiddleware = require('../middleware/auth');
const Document = require('../models/Document');
const { validate } = require('../middleware/validate');
const { evaluateInteractionProfile } = require('../services/interactionEngine');
const auditTrail = require('../services/auditTrail');

const router = express.Router();

const auditRecord = (params) => {
  auditTrail.record(params).catch(() => {});
};

// body('medications') flexible validation (string[] or JSON string)
const MEDS_CHECKS = [
  require('express-validator').body('medications').customSanitizer((v) => {
    if (typeof v === 'string') {
      try { return JSON.parse(v); } catch { return v.split(','); }
    }
    return v;
  }).isArray().withMessage('medications must be an array'),
  require('express-validator').body('allergies').optional().customSanitizer((v) => {
    if (typeof v === 'string') {
      try { return JSON.parse(v); } catch { return v.split(','); }
    }
    return v;
  }).isArray().withMessage('allergies must be an array'),
  require('express-validator').body('egfr').optional({ nullable: true }).isNumeric().toFloat(),
  require('express-validator').body('age').optional({ nullable: true }).isInt().toInt(),
];

// 1. Interactive evaluation (also used by the Safety Guard panel)
router.post('/interactions', authMiddleware, validate(MEDS_CHECKS), async (req, res, next) => {
  try {
    const { medications = [], allergies = [], egfr = null, age = null } = req.body;

    // Hydrate allergy / demographic context from the authenticated profile
    // unless explicitly provided in the request body.
    const profile = await authUserProfile(req);
    const effectiveAllergies = (allergies && allergies.length) ? allergies : (profile?.allergies || []);

    const result = evaluateInteractionProfile({
      medications,
      allergies: effectiveAllergies,
      egfr: egfr ?? null,
      age: age ?? profile?.age ?? null,
    });

    auditRecord({ action: 'interaction_check', resourceType: 'clinical', resourceId: null, req, userId: req.userId, meta: { medicationCount: medications.length, highRisk: result.summary?.critical || 0 } });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

// 2. Sandbox simulator — explicit alias that never persists anything
router.post('/sandbox', authMiddleware, validate(MEDS_CHECKS), async (req, res, next) => {
  try {
    const { medications = [], allergies = [], egfr = null, age = null } = req.body;
    const profile = await authUserProfile(req);
    const result = evaluateInteractionProfile({
      medications,
      allergies,
      egfr: egfr ?? null,
      age: age ?? profile?.age ?? null,
    });
    auditRecord({ action: 'interaction_check', resourceType: 'clinical', resourceId: null, req, userId: req.userId, meta: { sandbox: true, medicationCount: medications.length } });
    res.json({ success: true, sandbox: true, ...result });
  } catch (err) {
    next(err);
  }
});

// 3. Vault scan — reads medications parsed out of uploaded prescription documents
router.get('/profile-scan', authMiddleware, async (req, res, next) => {
  try {
    let meds = [];
    let allergies = [];
    try {
      const prescriptions = await Document.find({
        userId: req.userId,
        documentType: { $in: ['prescription', 'discharge-summary'] },
      })
        .sort({ documentDate: -1 })
        .lean();
      meds = prescriptions
        .map((d) => (d.metadata && d.metadata.medications) || [])
        .flat()
        .filter(Boolean)
        .slice(0, 20);
    } catch (mongoErr) {
      // Offline mode: no vault medications available
    }
    try {
      const User = require('../models/User');
      const user = await User.findById(req.userId).select('allergies dateOfBirth').lean();
      allergies = (user && user.allergies) || [];
    } catch {}
    const result = evaluateInteractionProfile({ medications: meds, allergies });
    auditRecord({ action: 'profile_scan', resourceType: 'clinical', resourceId: null, req, userId: req.userId, meta: { medicationCount: meds.length, source: 'vault' } });
    res.json({ success: true, source: 'vault', medications: meds, allergies, ...result });
  } catch (err) {
    next(err);
  }
});

/** Hydrate the profile for defaults. Absorb failure: route remains usable. */
async function authUserProfile(req) {
  if (!req.userId) return null;
  try {
    const User = require('../models/User');
    const user = await User.findById(req.userId).select('allergies dateOfBirth chronicConditions').lean();
    if (!user) return null;
    const age = user.dateOfBirth
      ? Math.floor((Date.now() - new Date(user.dateOfBirth)) / 31557600000)
      : null;
    return { allergies: user.allergies || [], age };
  } catch {
    return null;
  }
}

module.exports = router;
