const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const authMiddleware = require('../middleware/auth');
const { extractDocumentData } = require('../services/documentExtractor');

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
});

// Autonomous OCR & Clinical Entity Extraction (Inspects file & returns bounding boxes)
router.post('/extract', upload.any(), async (req, res) => {
  try {
    const uploadedFile = req.files && req.files.length > 0 ? req.files[0] : null;
    const { textContent } = req.body;

    const extractionResult = await extractDocumentData(uploadedFile, textContent);
    res.json(extractionResult);
  } catch (error) {
    console.error('OCR Extraction error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload document (accepts either 'file' or 'document' field name)
router.post('/upload', authMiddleware, upload.any(), async (req, res) => {
  try {
    const uploadedFile = req.files && req.files.length > 0 ? req.files[0] : null;

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
    } = req.body;

    let parsedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        try {
          parsedTags = JSON.parse(tags);
        } catch {
          parsedTags = tags.split(',').map((t) => t.trim());
        }
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
    }

    let parsedMeds = [];
    if (medications) {
      if (typeof medications === 'string') {
        try {
          parsedMeds = JSON.parse(medications);
        } catch {
          parsedMeds = medications.split(',').map((m) => m.trim());
        }
      } else if (Array.isArray(medications)) {
        parsedMeds = medications;
      }
    }

    let parsedEntities = [];
    if (req.body.extractedEntities) {
      try {
        parsedEntities = typeof req.body.extractedEntities === 'string' ? JSON.parse(req.body.extractedEntities) : req.body.extractedEntities;
      } catch (e) {}
    }

    let parsedBiomarkers = [];
    if (req.body.biomarkers) {
      try {
        parsedBiomarkers = typeof req.body.biomarkers === 'string' ? JSON.parse(req.body.biomarkers) : req.body.biomarkers;
      } catch (e) {}
    }

    // Autonomous extraction fallback if none provided
    if (parsedEntities.length === 0 && uploadedFile) {
      try {
        const autoExtracted = await extractDocumentData(uploadedFile);
        parsedEntities = autoExtracted.extractedEntities;
        parsedBiomarkers = autoExtracted.biomarkers;
        if (!diagnosis && autoExtracted.diagnosis) req.body.diagnosis = autoExtracted.diagnosis;
      } catch (err) {
        console.warn('Auto-extraction fallback non-fatal error:', err.message);
      }
    }

    const document = new Document({
      userId: req.userId,
      title: title || uploadedFile?.originalname || 'Clinical Document',
      documentType: documentType || 'lab-report',
      description: description || '',
      fileName: uploadedFile ? uploadedFile.originalname : 'record_' + Date.now() + '.pdf',
      filePath: uploadedFile ? uploadedFile.path : '',
      fileSize: uploadedFile ? uploadedFile.size : 0,
      documentDate: documentDate ? new Date(documentDate) : new Date(),
      tags: parsedTags,
      metadata: {
        doctor: doctor || 'Attending Physician',
        hospital: hospital || 'Clinical Facility',
        diagnosis: diagnosis || '',
        medications: parsedMeds,
        biomarkers: parsedBiomarkers,
        extractedEntities: parsedEntities,
      },
    });

    await document.save();

    res.status(201).json({
      message: 'Document uploaded successfully to botanical vault with extracted clinical entities',
      document,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all documents for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { type, search } = req.query;
    const query = { userId: req.userId };

    if (type && type !== 'all') {
      query.documentType = type;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'metadata.doctor': { $regex: search, $options: 'i' } },
        { 'metadata.diagnosis': { $regex: search, $options: 'i' } },
      ];
    }

    const documents = await Document.find(query).sort({ documentDate: -1, uploadDate: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get document by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.userId });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete document
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.filePath && fs.existsSync(document.filePath)) {
      try {
        fs.unlinkSync(document.filePath);
      } catch (err) {
        console.warn('Could not delete physical file:', err.message);
      }
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
