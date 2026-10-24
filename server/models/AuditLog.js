const mongoose = require('mongoose');

/**
 * AuditLog — HIPAA §164.312(b) aligned access audit.
 * Expires after 1 year (typical retention window; extend to your policy —
 * HIPAA requires 6 years for accounting of disclosures; adjust `expires`).
 */
const auditLogSchema = new mongoose.Schema({
  seq: {
    type: Number,
    default: 0,
  },
  userId: {
    type: String,
    default: null,
    index: true,
  },
  actorRole: {
    type: String,
    default: null,
  },
  action: {
    type: String,
    required: true,
    index: true,
  },
  resourceType: {
    type: String,
    enum: ['user', 'document', 'document_file', 'family', 'fhir', 'ai', 'clinical', 'auth', 'system'],
    default: 'system',
    index: true,
  },
  resourceId: {
    type: String,
    default: null,
  },
  ip: {
    type: String,
    default: null,
  },
  userAgent: {
    type: String,
    default: null,
  },
  outcome: {
    type: String,
    enum: ['success', 'failure'],
    default: 'success',
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  // Tamper-evident hash chain: hash = sha256(prevHash + canonical(entry))
  prevHash: {
    type: String,
    default: null,
  },
  hash: {
    type: String,
    default: null,
    select: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '365d',
  },
});

// Compound index for chronological paging
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
// seq must be globally unique: concurrent recorders retry on conflicts so the
// hash chain is never forked by two entries claiming the same position.
auditLogSchema.index({ seq: 1 }, { unique: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
