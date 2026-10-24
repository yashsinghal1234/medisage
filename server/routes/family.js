/**
 * Family Vault Router — /api/family
 * -------------------------------------------------------------
 * CRUD for dependent profiles (household vault switcher).
 * All routes are JWT-protected — a member can only ever touch
 * family rows belonging to their own ownerUserId.
 */

const express = require('express');
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/auth');
const FamilyMember = require('../models/FamilyMember');
const { validate } = require('../middleware/validate');
const { body, param } = require('express-validator');
const auditTrail = require('../services/auditTrail');

const router = express.Router();

const auditRecord = (params) => {
  auditTrail.record(params).catch(() => {});
};

const requireDatabase = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      error: 'The family vault requires the clinical database, which is briefly unreachable.',
      database: 'offline',
    });
    return false;
  }
  return true;
};

const MEMBER_CHECKS = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('A valid name (2–80 chars) is required'),
  body('relationship').isIn(['spouse', 'child', 'parent', 'sibling', 'other']).withMessage('Relationship must be one of: spouse, child, parent, sibling, other'),
  body('dateOfBirth').optional().isString(),
  body('bloodGroup').optional().isString().isLength({ max: 20 }).withMessage('Blood group must be 20 characters or fewer'),
  body('allergies').optional().isArray(),
  body('chronicConditions').optional().isArray(),
  body('emergencyContact').optional().isObject(),
  body('avatarSeed').optional().isString(),
];

// 1. List members
router.get('/', authMiddleware, async (req, res, next) => {
  if (!requireDatabase(res)) return;
  try {
    const members = await FamilyMember.find({ ownerUserId: req.userId })
      .sort({ createdAt: 1 })
      .lean();
    res.json(members);
  } catch (err) {
    next(err);
  }
});

// 2. Create member
router.post('/', authMiddleware, validate(MEMBER_CHECKS), async (req, res, next) => {
  if (!requireDatabase(res)) return;
  try {
    const member = new FamilyMember({ ...req.body, ownerUserId: req.userId });
    await member.save();
    auditRecord({ action: 'family_created', resourceType: 'family', resourceId: member._id, req, userId: req.userId });
    res.status(201).json({ message: 'Family member added to the household vault', member });
  } catch (err) {
    next(err);
  }
});

// 3. Update member
router.put(
  '/:id',
  authMiddleware,
  validate([
    param('id').isMongoId().withMessage('Invalid family member id'),
    ...MEMBER_CHECKS.map((check) => check.optional({ nullable: true })), // partial update allowed
  ]),
  async (req, res, next) => {
    if (!requireDatabase(res)) return;
    try {
      const member = await FamilyMember.findOneAndUpdate(
        { _id: req.params.id, ownerUserId: req.userId },
        { ...req.body, ownerUserId: req.userId },
        { new: true, runValidators: true, omitUndefined: true }
      ).lean();
      if (!member) return res.status(404).json({ error: 'Family member not found' });
      auditRecord({ action: 'family_updated', resourceType: 'family', resourceId: member._id, req, userId: req.userId });
      res.json({ message: 'Family member updated', member });
    } catch (err) {
      next(err);
    }
  }
);

// 4. Delete member
router.delete(
  '/:id',
  authMiddleware,
  validate([param('id').isMongoId().withMessage('Invalid family member id')]),
  async (req, res, next) => {
    if (!requireDatabase(res)) return;
    try {
      const member = await FamilyMember.findOneAndDelete({
        _id: req.params.id,
        ownerUserId: req.userId,
      });
      if (!member) return res.status(404).json({ error: 'Family member not found' });
      auditRecord({ action: 'family_deleted', resourceType: 'family', resourceId: member._id, req, userId: req.userId });
      res.json({ message: 'Family member removed from the vault' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
