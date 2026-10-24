/**
 * MediSage File Vault — AES-256-GCM Envelope Encryption
 * -------------------------------------------------------------
 * Every uploaded clinical document is encrypted at rest (HIPAA
 * §164.312(a)(2)(iv) aligned):
 *   - Per-file random 96-bit IV + 128-bit auth tag (GCM)
 *   - 256-bit master key from FILE_ENCRYPTION_KEY (hex)
 *   - On-disk format (binary):
 *       [ MAGIC 'MSV1' ][ keyVersion u8 ][ IV 12B ][ TAG 16B ][ ciphertext ]
 *   - Legacy plaintext files (uploaded before this feature) remain
 *     readable and are transparently re-encrypted on next save.
 *
 * Key handling guidance (production): keep FILE_ENCRYPTION_KEY in a
 * secret manager (AWS KMS/Secrets Manager, Vault) — never in git. For
 * key rotation, store `keyVersion` and fetch historical keys at decrypt.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const config = require('../config/env');

const MAGIC = Buffer.from('MSV1', 'ascii');
const VERSION = 1;

function resolveMasterKey() {
  const raw = (config.FILE_ENCRYPTION_KEY || '').trim();
  if (raw && /^[0-9a-fA-F]{64}$/.test(raw)) {
    return { key: Buffer.from(raw, 'hex'), keyVersion: 1, explicit: true };
  }
  if (raw) {
    console.error('[FILE VAULT] FILE_ENCRYPTION_KEY set but not 64 hex chars (32 bytes). Falling back to derived dev key.');
  }
  // Dev-safe fallback: derive a stable key from JWT_SECRET so encrypted
  // files remain decryptable across restarts. PRODUCTION REJECTS WEAK SECRETS.
  if (config.isProd) {
    throw new Error('ENV: FILE_ENCRYPTION_KEY is required in production (64 hex chars).');
  }
  const derived = crypto.createHash('sha256').update(`${config.JWT_SECRET}|medisage-file-vault|v${VERSION}`).digest();
  return { key: derived, keyVersion: 0, explicit: false };
}

function encryptBuffer(plaintext) {
  const { key, keyVersion } = resolveMasterKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([MAGIC, Buffer.from([keyVersion]), iv, tag, encrypted]);
}

function isEnvelope(buffer) {
  return (
    Buffer.isBuffer(buffer) &&
    buffer.length > MAGIC.length + 1 + 12 + 16 + 1 &&
    buffer.subarray(0, 4).equals(MAGIC)
  );
}

function decryptBuffer(buffer, { strict = false } = {}) {
  // Legacy plaintext passthrough (transparent compatibility)
  if (!isEnvelope(buffer)) {
    if (strict) {
      const err = new Error('Document is not encrypted with the current vault envelope');
      err.status = 500;
      throw err;
    }
    return { plaintext: buffer, legacyPlaintext: true, keyVersion: null };
  }

  const offset = MAGIC.length;
  const envelopeVersion = buffer.readUInt8(offset);
  const iv = buffer.subarray(offset + 1, offset + 13);
  const tag = buffer.subarray(offset + 13, offset + 29);
  const ciphertext = buffer.subarray(offset + 29);

  const { key } = resolveMasterKey();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  try {
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return { plaintext, legacyPlaintext: false, keyVersion: envelopeVersion };
  } catch (err) {
    // Auth-tag mismatch = tampering or wrong key — do not serve content
    const tagged = new Error('Encrypted document integrity check failed (key mismatch or tamper detected)');
    tagged.status = 500;
    throw tagged;
  }
}

/** Encrypt + persist. Returns { storedName, bytes }. */
function saveEncrypted(buffer, { originalExtension = '.pdf', uploadsDir } = {}) {
  const envelope = encryptBuffer(buffer);
  const storedName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${originalExtension.toLowerCase()}`;
  const target = path.join(uploadsDir, storedName);
  fs.writeFileSync(target, envelope);
  return { storedName, bytes: envelope.length };
}

/** Read a stored file and decrypt. */
function readStored(filePath) {
  const raw = fs.readFileSync(filePath);
  return decryptBuffer(raw);
}

/** Delete a stored file regardless of envelope state. */
function deleteStored(filePath) {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return true;
  } catch (err) {
    console.warn('[FILE VAULT] Could not delete stored file:', err.message);
    return false;
  }
}

/** Re-encrypt a legacy plaintext file in place (used opportunistically on read). */
function rewriteEncrypted(filePath) {
  try {
    const raw = fs.readFileSync(filePath);
    if (isEnvelope(raw)) return false; // already enveloped
    fs.writeFileSync(filePath, encryptBuffer(raw));
    return true;
  } catch (err) {
    console.warn('[FILE VAULT] Legacy re-encryption skipped:', err.message);
    return false;
  }
}

module.exports = {
  encryptBuffer,
  decryptBuffer,
  isEnvelope,
  saveEncrypted,
  readStored,
  deleteStored,
  rewriteEncrypted,
  MAGIC,
};
