/**
 * Clinical Documents Router — /api/documents
 * -------------------------------------------------------------
 * POST   /extract          OCR/entity extraction preview (auth + rate-limited)
 * POST   /upload           Upload & index a document (auth)
 * GET    /                 List with search/type filters + pagination (auth)
 * GET    /:id              Fetch metadata (auth)
 * GET    /:id/file         Authenticated secure download/stream of the file (auth)
 * PATCH  /:id              Update document metadata (auth)
 * DELETE /:id              Delete document + physical file (auth)
 *
 * SECURITY:
 *  - /extract previously ran WITHOUT auth — it allows arbitrary file
 *    writes to disk. It now requires a JWT and the strict upload limiter.
 *  - Files are whitelisted by extension + mime (PDF, images, JSON, HL7, TXT).
 *  - Downloads are individually authorized — the public static /uploads
 *    route has been removed in server.js.
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const config = require('../config/env');
const Document = require('../models/Document');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { uploadLimiter } = require('../middleware/security');
const { param, query } = require('express-validator');
const { extractDocumentData } = require('../services/documentExtractor');
const fileVault = require('../services/fileVault');
const auditTrail = require('../services/auditTrail');

const router = express.Router();

// Fire-and-forget audit helper — audit failures never break requests
const auditRecord = (params) => {
  auditTrail.record(params).catch(() => {});
};

// ---------- upload storage -----------------------------------------

const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.json', '.hl7', '.txt'];
const ALLOWED_MIMES = [
  'application/pdf',
  'image/png', 'image/jpeg', 'image/jpg',
  'application/json',
  'text/plain', 'application/octet-stream', // HL7 v2 files often arrive as octet-stream
];

// ---------- mixed-mode guard -----------------------------------------
// Atlas connections can flap: a user registered during an offline window has
// a local-format id ("user-...") that Mongoose cannot cast. Only route a
// request to MongoDB when BOTH the connection is up AND the user exists in it.
// ---------- mixed-mode guard -----------------------------------------
// Atlas connections can flap: a user registered during an offline window has
// a local-format id ("user-...") that Mongoose cannot cast. Only route a
// request to MongoDB when BOTH the connection is up AND the user exists in it.
const MONGO_ID_RE = /^[0-9a-fA-F]{24}$/;
const useMongoStore = (req) => mongoReady() && MONGO_ID_RE.test(String(req.userId || ''));

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024, files: 3 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.includes(ext) && ALLOWED_MIMES.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new multer.MulterError(403, `File type not allowed (${ext || file.mimetype}). Accepted: PDF, PNG, JPG, JSON, HL7, TXT`));
  },
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const code = err.code === 403 ? 400 : err.code;
    return res.status(Number.isInteger(code) ? code : 400).json({ error: err.message || 'Upload rejected' });
  }
  next(err);
};

/** Build a multer-like handle so the extractor can parse from memory. */
const memoryFileHandle = (file) => ({
  originalname: file.originalname,
  mimetype: file.mimetype,
  size: file.size,
  buffer: file.buffer,
  path: null, // never written to disk
});

const mongoReady = () => mongoose.connection.readyState === 1;

// Accept either Mongo ids or local "doc-<ts>" ids (resilient mode)
const idCheck = param('id').custom((v) =>
  mongoose.Types.ObjectId.isValid(v) || /^doc-\d+$/.test(v)
).withMessage('Invalid document id');

// ---------- local JSON fallback store ------------------------------

const localStoreFile = () => path.join(__dirname, '../data/documents.json');

const readLocalDocuments = () => {
  try {
    const file = localStoreFile();
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf-8') || '[]');
  } catch {
    return [];
  }
};

const writeLocalDocuments = (docs) => {
  try {
    const file = localStoreFile();
    if (!fs.existsSync(path.dirname(file))) fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(docs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write local documents store:', err);
  }
};

const toSafeDoc = (d) => {
  if (!d || typeof d !== 'object') return d;
  const { filePath, ...safe } = d;
  safe.relativeFile = d.fileKey || null;
  return safe;
};

// ---------- search filter builder ----------------------------------

const buildQuery = (userId, { type, search }) => {
  const query = { userId };
  if (type && type !== 'all') query.documentType = type;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'metadata.doctor': { $regex: search, $options: 'i' } },
      { 'metadata.diagnosis': { $regex: search, $options: 'i' } },
      { 'metadata.extractedText': { $regex: search, $options: 'i' } },
    ];
  }
  return query;
};

// ---------- routes ---------------------------------------------------

// 1. OCR extraction preview (auth-gated) — file stays in RAM only
router.post('/extract', authMiddleware, uploadLimiter, upload.any(), handleMulterError, async (req, res, next) => {
  try {
    const rawFile = req.files && req.files.length > 0 ? req.files[0] : null;
    const uploadedFile = rawFile ? memoryFileHandle(rawFile) : null;
    const { textContent } = req.body;
    const extractionResult = await extractDocumentData(uploadedFile, textContent);
    res.json(extractionResult);
  } catch (error) {
    next(error);
  }
});

// 2. Upload + index (file encrypted at rest before it touches disk)
router.post('/upload', authMiddleware, upload.any(), handleMulterError, async (req, res, next) => {
  try {
    const rawFile = req.files && req.files.length > 0 ? req.files[0] : null;
    let storedFile = null;

    if (rawFile) {
      const uploadsDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const ext = path.extname(rawFile.originalname).toLowerCase();
      const saved = fileVault.saveEncrypted(rawFile.buffer, { originalExtension: ext, uploadsDir });
      storedFile = {
        originalName: rawFile.originalname,
        size: rawFile.size,
        fileKey: saved.storedName,
        storedPath: path.join(uploadsDir, saved.storedName),
      };
    }

    const {
      title,
      documentType,
      description,
      documentDate,
      tags,
      doctor,
      hospital,
      diagnosis,
      medications,
      familyMemberId,
    } = req.body;

    const parseArrayField = (field) => {
      if (!field) return [];
      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : field.split(',').map((s) => s.trim());
        } catch {
          return field.split(',').map((s) => s.trim());
        }
      }
      return Array.isArray(field) ? field : [];
    };

    const parsedTags = parseArrayField(tags);
    const parsedMeds = parseArrayField(medications);

    let parsedEntities = [];
    let entitiesFromClient = false;
    if (req.body.extractedEntities) {
      try {
        parsedEntities = typeof req.body.extractedEntities === 'string' ? JSON.parse(req.body.extractedEntities) : req.body.extractedEntities;
        entitiesFromClient = Array.isArray(parsedEntities) && parsedEntities.length > 0;
      } catch {}
    }

    let parsedBiomarkers = [];
    if (req.body.biomarkers) {
      try {
        parsedBiomarkers = typeof req.body.biomarkers === 'string' ? JSON.parse(req.body.biomarkers) : req.body.biomarkers;
      } catch {}
    }

    // Provenance for downstream consumers (AI routes trust only honest
    // extraction paths, never the dev demo filename heuristics).
    let extractionSource = entitiesFromClient ? 'client-input' : '';

    // Autonomous extraction fallback for anything the client did not supply.
    // textContent (typed text or the .txt payload of the file) feeds the parser.
    if ((parsedEntities.length === 0 || parsedBiomarkers.length === 0) && storedFile) {
      try {
        const memHandle = memoryFileHandle(rawFile);
        const autoExtracted = await extractDocumentData(memHandle, req.body.textContent);
        if (parsedEntities.length === 0) parsedEntities = autoExtracted.extractedEntities;
        if (parsedBiomarkers.length === 0) parsedBiomarkers = autoExtracted.biomarkers;
        if (!diagnosis && autoExtracted.diagnosis) req.body.diagnosis = autoExtracted.diagnosis;
        if ((parsedEntities.length > 0 || parsedBiomarkers.length > 0) && autoExtracted.source) {
          extractionSource = autoExtracted.source;
        } else if (!extractionSource) {
          extractionSource = autoExtracted.source || 'none';
        }
      } catch (err) {
        console.warn('Auto-extraction fallback non-fatal error:', err.message);
      }
    }

    const docData = {
      userId: req.userId,
      familyMemberId: familyMemberId && mongoose.Types.ObjectId.isValid(familyMemberId) ? familyMemberId : undefined,
      title: title || (storedFile ? storedFile.originalName : 'Clinical Document'),
      documentType: documentType || 'other',
      description: description || '',
      fileName: storedFile ? storedFile.originalName : 'record_' + Date.now() + '.pdf',
      fileKey: storedFile ? storedFile.fileKey : '',
      // Relative vault path decided at save time (no absolute host binding)
      filePath: storedFile ? path.join('uploads', storedFile.fileKey) : '',
      fileSize: storedFile ? storedFile.size : 0,
      documentDate: documentDate ? new Date(documentDate) : new Date(),
      tags: parsedTags,
      metadata: {
        doctor: doctor || 'Attending Physician',
        hospital: hospital || 'Clinical Facility',
        diagnosis: diagnosis || '',
        medications: parsedMeds,
        biomarkers: parsedBiomarkers,
        extractedEntities: parsedEntities,
        extractionSource,
      },
    };

    if (useMongoStore(req)) {
      const document = new Document({ ...docData, metadata: { ...docData.metadata, extractedText: req.body.textContent || '' } });
      await document.save();
      const saved = document.toObject();
      auditRecord({ action: 'document_uploaded', resourceType: 'document', resourceId: saved._id, req, meta: { title: saved.title, type: saved.documentType, encrypted: true } });
      return res.status(201).json({
        message: 'Document uploaded successfully — encrypted at rest in the botanical vault with extracted clinical entities',
        document: toSafeDoc(saved),
      });
    }

    // Local JSON fallback (offline mode)
    const docs = readLocalDocuments();
    const localDoc = {
      ...docData,
      _id: 'doc-' + Date.now(),
      uploadDate: new Date().toISOString(),
      documentDate: (docData.documentDate || new Date()).toISOString(),
      metadata: { ...docData.metadata, extractedText: req.body.textContent || '' },
    };
    docs.unshift(localDoc);
    writeLocalDocuments(docs);
    auditRecord({ action: 'document_uploaded', resourceType: 'document', resourceId: localDoc._id, req, meta: { title: localDoc.title, type: localDoc.documentType, encrypted: true, mode: 'local' } });
    res.status(201).json({
      message: 'Document uploaded (encrypted at rest, local offline vault — MongoDB unreachable)',
      document: toSafeDoc(localDoc),
    });
  } catch (error) {
    next(error);
  }
});

// 3. List documents (filters + pagination)
router.get(
  '/',
  authMiddleware,
  validate([
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('type').optional().isString(),
    query('search').optional().isString().isLength({ max: 100 }),
    query('member').optional().isMongoId().withMessage('Invalid family member id'),
  ]),
  async (req, res, next) => {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 50;
      const { type, search, member } = req.query;

      if (useMongoStore(req)) {
        const query = buildQuery(req.userId, { type, search });
        if (member) query.familyMemberId = member;
        const [total, documents] = await Promise.all([
          Document.countDocuments(query),
          Document.find(query)
            .sort({ documentDate: -1, uploadDate: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        ]);
        // NOTE: returns a plain array (contract kept for the existing client).
        // Pagination info is exposed via headers.
        res.setHeader('X-Total-Count', String(total));
        res.setHeader('X-Page', String(page));
        res.setHeader('X-Total-Pages', String(Math.max(1, Math.ceil(total / limit))));
        return res.json(documents.map(toSafeDoc).map((d) => ({ ...d, filePath: undefined })));
      }

      // Local fallback with the same filtering semantics (array contract kept)
      let docs = readLocalDocuments().filter((d) => d.userId === req.userId);
      if (type && type !== 'all') docs = docs.filter((d) => d.documentType === type);
      if (member) docs = docs.filter((d) => d.familyMemberId === member);
      if (search) {
        const s = search.toLowerCase();
        docs = docs.filter((d) =>
          [d.title, d.description, d.metadata?.doctor, d.metadata?.diagnosis]
            .some((v) => v && String(v).toLowerCase().includes(s))
        );
      }
      docs.sort((a, b) => new Date(b.documentDate || b.uploadDate) - new Date(a.documentDate || a.uploadDate));
      res.json(docs.slice(0, limit).map(toSafeDoc).map((d) => ({ ...d, filePath: undefined })));
    } catch (error) {
      next(error);
    }
  }
);

// 4. Document metadata
router.get(
  '/:id',
  authMiddleware,
  validate([idCheck]),
  async (req, res, next) => {
    try {
      if (useMongoStore(req)) {
        const document = await Document.findOne({ _id: req.params.id, userId: req.userId }).lean();
        if (document) {
          auditRecord({ action: 'document_viewed', resourceType: 'document', resourceId: document._id, req, actorRole: req.token?.role });
          return res.json(toSafeDoc(document));
        }
        return res.status(404).json({ error: 'Document not found' });
      }
      const local = readLocalDocuments().find((d) => d._id === req.params.id && d.userId === req.userId);
      if (!local) return res.status(404).json({ error: 'Document not found' });
      auditRecord({ action: 'document_viewed', resourceType: 'document', resourceId: local._id, req, actorRole: req.token?.role, meta: { mode: 'local' } });
      res.json(toSafeDoc(local));
    } catch (error) {
      next(error);
    }
  }
);

// 5. Authenticated file stream (replaces public /uploads static route)
router.get(
  '/:id/file',
  authMiddleware,
  validate([idCheck]),
  async (req, res, next) => {
    try {
      let document = null;
      if (useMongoStore(req)) {
        document = await Document.findOne({ _id: req.params.id, userId: req.userId }).lean();
      } else {
        document = readLocalDocuments().find((d) => d._id === req.params.id && d.userId === req.userId);
      }
      if (!document) return res.status(404).json({ error: 'Document not found' });

      const resolveFile = () => {
        if (document.filePath && fs.existsSync(document.filePath)) return document.filePath;
        if (document.fileKey) {
          const candidate = path.join(__dirname, '../uploads', document.fileKey);
          if (fs.existsSync(candidate)) return candidate;
        }
        return null;
      };

      const filePath = resolveFile();
      if (!filePath) {
        return res.status(410).json({ error: 'The stored file for this document is no longer available.' });
      }

      //.decrypt (legacy plaintext files transparently supported + re-encrypted)
      let decrypted;
      try {
        decrypted = fileVault.readStored(filePath);
        if (decrypted.legacyPlaintext) {
          // Upgrade legacy storage to the encrypted envelope for future reads
          fileVault.rewriteEncrypted(filePath);
        }
      } catch (vaultErr) {
        return res.status(500).json({ error: 'Stored clinical document failed an integrity check (key mismatch or tampering). Access denied.' });
      }

      const mimeMap = {
        '.pdf': 'application/pdf',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.json': 'application/json',
        '.hl7': 'application/octet-stream',
        '.txt': 'text/plain',
      };
      const ext = path.extname(filePath).toLowerCase();
      res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
      const isDownload = req.query.download === 'true' || req.query.download === '1';
      res.setHeader(
        'Content-Disposition',
        `${isDownload ? 'attachment' : 'inline'}; filename="${encodeURIComponent(document.fileName || 'document' + ext)}"`
      );
      auditRecord({
        action: isDownload ? 'document_downloaded' : 'document_file_viewed',
        resourceType: 'document_file',
        resourceId: document._id,
        req,
        actorRole: req.token?.role,
        meta: { encrypted: !decrypted.legacyPlaintext, bytes: decrypted.plaintext.length },
      });
      res.send(decrypted.plaintext);
    } catch (error) {
      next(error);
    }
  }
);

// 6. Update metadata (correct extraction errors)
router.patch(
  '/:id',
  authMiddleware,
  validate([
    idCheck,
    require('express-validator').body('title').optional().trim().isLength({ min: 1, max: 200 }),
    require('express-validator').body('documentType').optional().isIn(['prescription', 'lab-report', 'scan', 'discharge-summary', 'other']),
    require('express-validator').body('description').optional().isString(),
    require('express-validator').body('documentDate').optional().isString(),
    require('express-validator').body('tags').optional().isArray(),
    require('express-validator').body('metadata').optional().isObject(),
  ]),
  async (req, res, next) => {
    try {
      const patch = {};
      ['title', 'documentType', 'description', 'tags'].forEach((k) => {
        if (req.body[k] !== undefined) patch[k] = req.body[k];
      });
      if (req.body.documentDate) patch.documentDate = new Date(req.body.documentDate);
      if (req.body.metadata) {
        // Merge metadata selectively (doctor, hospital, diagnosis)
        const allowedMeta = {};
        ['doctor', 'hospital', 'diagnosis', 'medications'].forEach((k) => {
          if (req.body.metadata[k] !== undefined) allowedMeta[k] = req.body.metadata[k];
        });
        for (const [k, v] of Object.entries(allowedMeta)) patch[`metadata.${k}`] = v;
        // Human corrections outrank the extraction origin: provenance flips to
        // client-corrected so downstream consumers know a person reviewed it.
        if (Object.keys(allowedMeta).length) patch['metadata.extractionSource'] = 'client-corrected';
      }

      if (useMongoStore(req)) {
        const document = await Document.findOneAndUpdate(
          { _id: req.params.id, userId: req.userId },
          { $set: patch },
          { new: true, runValidators: true }
        ).lean();
        if (!document) return res.status(404).json({ error: 'Document not found' });
        auditRecord({ action: 'document_updated', resourceType: 'document', resourceId: document._id, req, actorRole: req.token?.role, meta: { fields: Object.keys(patch).join(',') } });
        return res.json({ message: 'Document updated', document: toSafeDoc(document) });
      }
      // Local resilient mode
      const docs = readLocalDocuments();
      const idx = docs.findIndex((d) => d._id === req.params.id && d.userId === req.userId);
      if (idx === -1) return res.status(404).json({ error: 'Document not found' });
      Object.entries(patch).forEach(([k, v]) => {
        if (k.startsWith('metadata.')) {
          const metaKey = k.split('.')[1];
          docs[idx].metadata = docs[idx].metadata || {};
          docs[idx].metadata[metaKey] = v;
        } else {
          docs[idx][k] = v;
        }
      });
      writeLocalDocuments(docs);
      auditRecord({ action: 'document_updated', resourceType: 'document', resourceId: docs[idx]._id, req, actorRole: req.token?.role, meta: { fields: Object.keys(patch).join(','), mode: 'local' } });
      res.json({ message: 'Document updated', document: toSafeDoc(docs[idx]) });
    } catch (error) {
      next(error);
    }
  }
);

// 7. Delete (metadata + file)
router.delete(
  '/:id',
  authMiddleware,
  validate([idCheck]),
  async (req, res, next) => {
    try {
      let document = null;
      if (useMongoStore(req)) {
        document = await Document.findOneAndDelete({ _id: req.params.id, userId: req.userId }).lean();
      } else {
        const docs = readLocalDocuments();
        const idx = docs.findIndex((d) => d._id === req.params.id && d.userId === req.userId);
        if (idx !== -1) {
          document = docs[idx];
          docs.splice(idx, 1);
          writeLocalDocuments(docs);
        }
      }
      if (!document) return res.status(404).json({ error: 'Document not found' });

      const candidates = [document.filePath, document.fileKey ? path.join(__dirname, '../uploads', document.fileKey) : null];
      for (const candidate of candidates) {
        if (candidate) {
          fileVault.deleteStored(candidate);
        }
      }
      auditRecord({ action: 'document_deleted', resourceType: 'document', resourceId: document._id, req, actorRole: req.token?.role });
      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// upload limiter already imported from middleware/security at the top
module.exports = router;
