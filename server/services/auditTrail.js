/**
 * Audit Trail Service
 * -------------------------------------------------------------
 * Records every security-relevant / PHI-touching event:
 *   - who (userId, role), what (action, resource), when, where (ip, UA)
 *   - Linked hash chain (sha256(prevHash + entry)) so silent tampering
 *     or deletion of past log rows is detectable via /api/audit/verify.
 *
 * Design rules:
 *  - Fire-and-forget on hot paths: audit failures NEVER break user
 *    requests; they are reported loudly on the server console instead.
 *  - No sensitive values: audit entries never contain passwords,
 *    tokens, or encrypted payloads (only references).
 */

const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const config = require('../config/env');

const mongoReady = () => mongoose.connection.readyState === 1;

let AuditLog = null;
function getModel() {
  if (!AuditLog) AuditLog = require('../models/AuditLog');
  return AuditLog;
}

// ---------- local JSONL fallback (resilient mode) --------------------

const localAuditFile = () => path.join(__dirname, '../data/audit.jsonl');

const readLocalAudit = () => {
  try {
    if (!fs.existsSync(localAuditFile())) return [];
    return fs.readFileSync(localAuditFile(), 'utf-8')
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch {
    return [];
  }
};

const appendLocalAudit = (entry) => {
  try {
    const file = localAuditFile();
    if (!fs.existsSync(path.dirname(file))) fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.appendFileSync(file, JSON.stringify(entry) + '\n');
  } catch (err) {
    console.error('[AUDIT] local append failed:', err.message);
  }
};

// ---------- hash chain ----------------------------------------------

const canonicalize = ({ seq, userId, actorRole, action, resourceType, resourceId, ip, outcome, createdAt }) =>
  JSON.stringify({
    seq,
    userId,
    actorRole,
    action,
    resourceType,
    resourceId,
    ip,
    outcome,
    createdAt: createdAt instanceof Date ? createdAt.toISOString() : createdAt,
  });

const computeHash = (entry, prevHash) =>
  crypto.createHash('sha256').update(`${prevHash || 'GENESIS'}|${canonicalize(entry)}`).digest('hex');

// ---------- write API ------------------------------------------------

/**
 * Record one audit event (fire-and-forget safe).
 * @param {Object} params
 * @param {string} params.userId        Actor id (may be null for unauthenticated events)
 * @param {string} params.action        e.g. 'login', 'document_downloaded'
 * @param {string} params.resourceType  user|document|document_file|family|fhir|ai|clinical|auth|system
 * @param {string} params.resourceId
 * @param {Object} params.req           Express request (ip/UA capture)
 * @param {'success'|'failure'} params.outcome
 * @param {Object} params.meta          Non-sensitive supplemental data
 * @returns {Promise<void>}
 */
async function record({ userId = null, action, resourceType = 'system', resourceId = null, req = null, outcome = 'success', meta = {} } = {}) {
  try {
    const entry = {
      userId: userId == null ? null : String(userId),
      actorRole: meta.actorRole || null,
      action,
      resourceType,
      resourceId: resourceId == null ? null : String(resourceId),
      ip: req ? (req.ip || req.socket?.remoteAddress || null) : null,
      userAgent: req ? (req.get?.('user-agent') || null) : null,
      outcome,
      meta: sanitizeMeta(meta),
      createdAt: new Date(),
    };

    if (mongoReady()) {
      // Fetch last hash for the chain
      const last = await getModel().findOne({}).sort({ seq: -1 }).select('seq hash').lean();
      entry.seq = (last?.seq || 0) + 1;
      entry.prevHash = last?.hash || null;
      entry.hash = computeHash(entry, entry.prevHash);
      await getModel().create(entry);
    } else {
      const rows = readLocalAudit();
      const last = rows[rows.length - 1];
      entry.seq = (last?.seq || 0) + 1;
      entry.prevHash = last?.hash || null;
      entry.hash = computeHash(entry, entry.prevHash);
      appendLocalAudit(entry);
    }
  } catch (err) {
    // Audit must never crash a user request — loud log instead
    console.error(`[AUDIT] FAILED to record "${action}" for user ${userId}:`, err.message);
  }
}

const FORBIDDEN_META_KEYS = ['password', 'newPassword', 'currentPassword', 'token', 'refreshToken', 'credential'];

function sanitizeMeta(meta) {
  const clean = {};
  for (const [k, v] of Object.entries(meta || {})) {
    if (FORBIDDEN_META_KEYS.some((f) => k.toLowerCase().includes(f.toLowerCase()))) continue;
    if (v !== undefined && (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')) {
      clean[k] = String(v).slice(0, 200);
    } else if (Array.isArray(v)) {
      clean[k] = v.slice(0, 20).map((x) => String(x).slice(0, 80));
    } else if (v && typeof v === 'object') {
      clean[k] = sanitizeMeta(v);
    }
  }
  return clean;
}

// ---------- read + verification APIs ---------------------------------

/**
 * Verify the hash chain of the stored audit log.
 * @returns {{ valid: boolean, entriesChecked: number, firstBroken: number|null }}
 */
async function verifyChain({ limit = 5000 } = {}) {
  let entries = [];
  if (mongoReady()) {
    entries = await getModel().find({}).sort({ seq: 1 }).limit(limit).lean();
  } else {
    entries = readLocalAudit();
  }

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const expected = computeHash(e, e.prevHash);
    const prevOk = i === 0 ? true : entries[i - 1].hash === e.prevHash;
    if (e.hash !== expected || !prevOk) {
      return { valid: false, entriesChecked: entries.length, firstBroken: e.seq ?? i + 1 };
    }
  }
  return { valid: true, entriesChecked: entries.length, firstBroken: null };
}

/**
 * Paged audit entries (self-audit; admins see everything via filter).
 */
async function readEntries({ userId = null, action = null, page = 1, limit = 50 } = {}) {
  if (mongoReady()) {
    const query = {};
    if (userId) query.userId = String(userId);
    if (action) query.action = action;
    return getModel().find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();
  }
  let rows = readLocalAudit();
  if (userId) rows = rows.filter((r) => r.userId === String(userId));
  if (action) rows = rows.filter((r) => r.action === action);
  const safeLimit = Math.min(500, Math.max(1, limit));
  return rows.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice((page - 1) * safeLimit, page * safeLimit);
}

module.exports = { record, verifyChain, readEntries };
