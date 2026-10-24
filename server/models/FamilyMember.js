const mongoose = require('mongoose');

/**
 * FamilyMember — dependent profiles managed inside a household vault.
 * Owned by the primary account holder (userId).
 */
const familyMemberSchema = new mongoose.Schema({
  ownerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  relationship: {
    type: String,
    required: true,
    enum: ['spouse', 'child', 'parent', 'sibling', 'other'],
    default: 'child',
  },
  dateOfBirth: {
    type: Date,
  },
  bloodGroup: {
    type: String,
    default: 'O+ Positive',
  },
  allergies: [{
    type: String,
  }],
  chronicConditions: [{
    type: String,
  }],
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
  },
  avatarSeed: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('FamilyMember', familyMemberSchema);
