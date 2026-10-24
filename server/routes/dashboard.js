/**
 * Dashboard Router — /api/dashboard
 * -------------------------------------------------------------
 * GET /api/dashboard/stats    — vault overview (counts, latest biomarkers, recents)
 * GET /api/dashboard/trends   — longitudinal biomarker trajectories for charting
 *
 * Aggregates live server-side so the client stays thin and consistent.
 */

const express = require('express');
const authMiddleware = require('../middleware/auth');
const Document = require('../models/Document');

const router = express.Router();

// ---------- helpers -------------------------------------------------

function collectBiomarkerSeries(documents) {
  /**
   * Build one time series per biomarker name across all documents, ordered
   * chronologically. Works from both extractedEntities and metadata.biomarkers.
   */
  const series = new Map();

  const pushPoint = (name, value, ref, status, date, loinc) => {
    if (!name || value == null || value === '') return;
    const numeric = parseFloat(String(value).replace(/[^0-9.\-+]/g, ''));
    if (!Number.isFinite(numeric)) return; // skip non-numeric ("Trivial", ranges)
    if (!series.has(name)) {
      series.set(name, { name, loinc: loinc || null, ref: ref || null, points: [] });
    }
    const s = series.get(name);
    if (ref && !s.ref) s.ref = ref;
    if (loinc && !s.loinc) s.loinc = loinc;
    s.points.push({ date: date ? date.toISOString() : null, value: numeric, status: status || null });
  };

  documents.forEach((doc) => {
    const date = doc.documentDate || doc.uploadDate || new Date(doc.createdAt || Date.now());
    (doc.metadata?.extractedEntities || []).forEach((e) => {
      const codeMatch = e.code ? (String(e.code).match(/(\d{3,4}-\d)/) || [])[1] : null;
      pushPoint(e.name, e.value, e.ref, e.status, date, codeMatch);
    });
    (doc.metadata?.biomarkers || []).forEach((b) => {
      pushPoint(b.name, b.value, null, b.status, date, null);
    });
  });

  // sort each series oldest -> newest
  for (const s of series.values()) {
    s.points.sort((a, b) => new Date(a.date) - new Date(b.date));
    const first = s.points[0], last = s.points[s.points.length - 1];
    s.first = first ? first.value : null;
    s.latest = last ? last.value : null;
    s.deltaPercent = first && s.first !== 0 && s.points.length > 1
      ? Math.round(((last.value - first.value) / Math.abs(s.first)) * 1000) / 10
      : null;
  }

  return [...series.values()];
}

// ---------- routes --------------------------------------------------

router.get('/stats', authMiddleware, async (req, res, next) => {
  try {
    let documents = [];
    try {
      documents = await Document.find({ userId: req.userId })
        .sort({ documentDate: -1, uploadDate: -1 })
        .lean();
    } catch (mongoErr) {
      // Mongo offline — degrade gracefully to empty stats
    }

    const byType = {};
    documents.forEach((d) => {
      byType[d.documentType] = (byType[d.documentType] || 0) + 1;
    });

    const series = collectBiomarkerSeries(documents);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    res.json({
      totals: {
        documents: documents.length,
        byType,
        uploadedLast30Days: documents.filter((d) => new Date(d.uploadDate || d.createdAt) >= monthAgo).length,
        biomarkersTracked: series.length,
      },
      latestBiomarkers: series
        .filter((s) => s.latest != null)
        .map((s) => ({ name: s.name, value: s.latest, ref: s.ref, loinc: s.loinc })),
      recentDocuments: documents.slice(0, 5).map((d) => ({
        id: d._id,
        title: d.title,
        documentType: d.documentType,
        documentDate: d.documentDate,
        doctor: d.metadata?.doctor || null,
        hospital: d.metadata?.hospital || null,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/trends', authMiddleware, async (req, res, next) => {
  try {
    const { range } = req.query; // '1m' | '6m' | '1y' | 'all'
    let documents = [];
    try {
      documents = await Document.find({ userId: req.userId })
        .sort({ documentDate: -1 })
        .lean();
    } catch (mongoErr) {}

    if (range && range !== 'all') {
      const months = { '1m': 1, '6m': 6, '1y': 12 }[range] || null;
      if (months) {
        const cutoff = new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000);
        documents = documents.filter((d) => new Date(d.documentDate || d.uploadDate) >= cutoff);
      }
    }

    const series = collectBiomarkerSeries(documents);
    res.json({ range: range || 'all', series });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
