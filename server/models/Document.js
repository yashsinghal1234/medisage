const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  documentType: {
    type: String,
    enum: ['prescription', 'lab-report', 'scan', 'discharge-summary', 'other'],
    required: true,
  },
  description: {
    type: String,
  },
  fileName: {
    type: String,
    required: true,
  },
  // Relative storage location inside the encrypted vault; optional because
  // documents may exist as metadata-only records (no physical file attached)
  filePath: {
    type: String,
  },
  fileSize: {
    type: Number,
  },
  fileKey: {
    type: String,
    default: '',
  },
  familyMemberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyMember',
    default: null,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  documentDate: {
    type: Date,
  },
  tags: [{
    type: String,
  }],
  metadata: {
    doctor: String,
    hospital: String,
    diagnosis: String,
    medications: [String],
    biomarkers: [{
      name: String,
      value: String,
      status: String, // 'normal' | 'elevated' | 'optimal' | 'borderline'
    }],
    extractedEntities: [{
      id: String,
      code: String,
      name: String,
      value: String,
      ref: String,
      status: String,
      page: Number,
      confidence: Number,
      bbox: {
        top: String,
        left: String,
        width: String,
        height: String,
      },
    }],
    extractedText: String,
    // ExtractedEntities provenance — how the entities were obtained:
    // client-text (typed by user) | client-input (entity payload from the UI)
    // file-text | pdf-text | image-ocr (machine extraction)
    // demo-heuristic (DEV ONLY filename fallback) | 'none'/''
    extractionSource: String,
  },
});

module.exports = mongoose.model('Document', documentSchema);
