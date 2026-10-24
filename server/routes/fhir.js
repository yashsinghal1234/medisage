/**
 * HL7 FHIR Router — /api/fhir
 * -------------------------------------------------------------
 * GET /api/fhir/bundle         — full US-Core-flavored patient bundle (JSON export)
 * GET /api/fhir/bundle?member=… — bundle for a specific family member
 *
 * The bundle synthesizes the user's documents + profile into
 * Patient / Observation / MedicationStatement / AllergyIntolerance
 * resources per HL7 R4.
 */

const express = require('express');
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Document = require('../models/Document');
const FamilyMember = require('../models/FamilyMember');
const { buildPatientBundle } = require('../services/fhirSerializer');
const auditTrail = require('../services/auditTrail');

const router = express.Router();

const auditRecord = (params) => {
  auditTrail.record(params).catch(() => {});
};

const requireDatabase = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      error: 'The FHIR export requires the clinical database, which is briefly unreachable.',
      database: 'offline',
    });
    return false;
  }
  return true;
};

router.get('/bundle', authMiddleware, async (req, res, next) => {
  if (!requireDatabase(res)) return;
  // Local-format ids (registered while the DB was down) can't be cast into
  // Mongo queries — treat like an offline session rather than erroring.
  if (!/^[0-9a-fA-F]{24}$/.test(String(req.userId || ''))) {
    return res.status(503).json({
      error: 'FHIR export requires a database-backed session. Please sign in again.',
      database: 'offline',
    });
  }
  try {
    const { member } = req.query;

    let familyMember = null;
    if (member) {
      familyMember = await FamilyMember.findOne({
        _id: member,
        ownerUserId: req.userId,
      }).lean();
      if (!familyMember) return res.status(404).json({ error: 'Family member not found' });
    }

    const user = await User.findById(req.userId).select('-password -resetPasswordToken').lean();
    if (!user) return res.status(404).json({ error: 'User profile not found' });

    let documents = [];
    try {
      documents = await Document.find({ userId: req.userId })
        .sort({ documentDate: -1 })
        .lean();
    } catch (mongoErr) {
      // Offline/local mode: build from whatever authentic data we still have
    }

    const bundle = buildPatientBundle({ user, documents, familyMember });

    auditRecord({ action: 'fhir_exported', resourceType: 'fhir', resourceId: req.userId, req, userId: req.userId, meta: { member: familyMember?._id ? String(familyMember._id) : null, documentCount: documents.length } });
    res.setHeader('Content-Type', 'application/fhir+json');
    res.setHeader('Content-Disposition', `inline; filename="medisage-passport-${new Date().toISOString().slice(0, 10)}.json"`);
    res.json(bundle);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
