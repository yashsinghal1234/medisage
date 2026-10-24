/**
 * AI & Clinical Intelligence Router — /api/ai
 * -------------------------------------------------------------
 * POST /api/ai/analyze-history       — longitudinal synthesis (auth)
 * POST /api/ai/recommend-insurance   — insurance matching (auth)
 * POST /api/ai/chat                  — conversational companion (auth)
 *
 * All routes are now JWT-protected and hydrate REAL patient context
 * (profile + documents). Previously req.userId was never set, so every
 * response silently used hardcoded demo data.
 *
 * OpenAI integration calls the Chat Completions REST API directly via
 * the existing axios dependency (no heavy langchain runtime required);
 * a rule-based botanical fallback engine keeps the product usable
 * without an API key.
 */

const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const Document = require('../models/Document');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { body } = require('express-validator');
const { aiLimiter } = require('../middleware/security');
const config = require('../config/env');
const auditTrail = require('../services/auditTrail');

const router = express.Router();
const mongoReady = () => mongoose.connection.readyState === 1;

const auditRecord = (params) => {
  auditTrail.record(params).catch(() => {});
};

const hasOpenAI = () =>
  Boolean(config.OPENAI_API_KEY) &&
  /^your_/.test(config.OPENAI_API_KEY) === false &&
  config.OPENAI_API_KEY.startsWith('sk-');

/** OpenAI Chat Completions via REST (CJS-friendly — no langchain needed). */
async function openAiChat(messages, temperature = 0.7, model = 'gpt-4o-mini') {
  const res = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    { model, messages, temperature },
    {
      headers: { Authorization: `Bearer ${config.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      timeout: 45000,
    }
  );
  return res.data.choices?.[0]?.message?.content || '';
}

/** Load real patient context (profile + documents) for the authenticated user. */
async function loadPatientContext(req) {
  let user = null;
  let documents = [];
  let fromLocalStore = false;

  if (mongoReady()) {
    try {
      user = await User.findById(req.userId).lean();
      documents = await Document.find({ userId: req.userId }).sort({ documentDate: -1 }).lean();
      if (user) return { user, documents, fromLocalStore: false };
    } catch (err) {
      console.warn('AI context load failed, trying local store:', err.message);
    }
  }

  // Resilient local fallback
  try {
    const path = require('path');
    const fs = require('fs');
    const dataFile = path.join(__dirname, '../data/users.json');
    if (fs.existsSync(dataFile)) {
      const users = JSON.parse(fs.readFileSync(dataFile, 'utf-8') || '[]');
      user = users.find((u) => u._id === req.userId) || null;
      fromLocalStore = true;
    }
  } catch {}

  if (!user) {
    return null; // authenticated token referred to a user that no longer exists
  }
  return { user, documents, fromLocalStore };
}

const patientFacts = (user, documents) => {
  const age = user?.dateOfBirth ? Math.floor((Date.now() - new Date(user.dateOfBirth)) / 31557600000) : null;
  return {
    name: user?.name || 'the patient',
    age,
    bloodGroup: user?.bloodGroup || null,
    allergies: user?.allergies || [],
    chronicConditions: user?.chronicConditions || [],
    documentCount: documents?.length || 0,
    documentTypes: [...new Set((documents || []).map((d) => d.documentType))],
    biomarkers: (documents || [])
      .map((d) => (d.metadata?.extractedEntities || []).map((e) => `${e.name}: ${e.value}`))
      .flat()
      .slice(0, 25),
    medications: (documents || []).map((d) => (d.metadata?.medications || [])).flat().slice(0, 20),
  };
};

// ------------------------------------------------------------------
// 1. Analyze history
// ------------------------------------------------------------------
const chatChecks = [
  body('messages').optional().isArray().withMessage('messages must be an array'),
];

router.post('/analyze-history', authMiddleware, aiLimiter, async (req, res, next) => {
  try {
    const ctx = await loadPatientContext(req);
    if (!ctx) return res.status(404).json({ error: 'User profile not found' });

    const facts = patientFacts(ctx.user, ctx.documents);

    if (hasOpenAI()) {
      try {
        const analysis = await openAiChat([
          {
            role: 'system',
            content:
              'You are MediSage, a careful clinical health-synthesis assistant. Use ONLY the provided patient facts; never invent biomarker values. Structure: 1) Clinical Overview 2) Botanical & Nutritional Guidance 3) Movement & Metabolic Protocol 4) Preventive Care Roadmap. Include a medical disclaimer line at the end.',
          },
          {
            role: 'user',
            content: `Patient facts (JSON):\n${JSON.stringify(facts, null, 2)}\n\nProduce the longitudinal synthesis.`,
          },
        ]);
        return res.json({
          analysis,
          source: 'openai',
          recommendations: buildStaticRecommendations(facts),
        });
      } catch (openAiErr) {
        console.warn('OpenAI analyze-history failed, using heuristic engine:', openAiErr.message);
      }
    }

    auditRecord({ action: 'ai_query', resourceType: 'ai', resourceId: null, req, userId: req.userId, meta: { kind: 'analyze_history', source: hasOpenAI() ? 'openai' : 'heuristic', documents: facts.documentCount } });

    // Deterministic heuristic synthesis (no key configured)
    return res.json({
      analysis: buildHeuristicAnalysis(facts),
      source: 'heuristic',
      recommendations: buildStaticRecommendations(facts),
    });
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------------------------------
// 2. Insurance matching (profile-driven, no longer hardcoded)
// ------------------------------------------------------------------
router.post('/recommend-insurance', authMiddleware, aiLimiter, async (req, res, next) => {
  try {
    const ctx = await loadPatientContext(req);
    if (!ctx) return res.status(404).json({ error: 'User profile not found' });

    const facts = patientFacts(ctx.user, ctx.documents);
    const body_ = req.body || {};
    const chronicConditions = body_.chronicConditions?.length ? body_.chronicConditions : facts.chronicConditions;
    const allergies = body_.allergies?.length ? body_.allergies : facts.allergies;
    const age = body_.age ?? facts.age ?? null;

    const chronicCount = (chronicConditions || []).length;
    const cardioRisk = (chronicConditions || []).some((c) => /hypertension|dyslipid|cardiac|coronary|heart/i.test(c));
    const metabolicRisk = (chronicConditions || []).some((c) => /diabet|metabolic|insulin/i.test(c));

    const plans = [
      {
        id: 'plan-1',
        name: 'CardioMetabolic Shield Plus',
        provider: 'Aethel Health & Wellness Alliance',
        tier: 'Comprehensive Tier 1',
        matchScore: Math.min(99, 80 + chronicCount * 7 + (cardioRisk ? 6 : 0) + (metabolicRisk ? 6 : 0)),
        premium: age != null && age > 55 ? '$210 / month' : '$165 / month',
        deductible: '$450 / year',
        annualCoverage: '$500,000',
        highlights: [
          cardioRisk ? 'Full cardiologist & lipid-clinic coverage with annual ApoB panel' : 'Annual preventive metabolic panel included',
          'Prescription drug rider — chronic medication copays capped',
          'Zero waiting period for declared pre-existing conditions',
          'Unlimited AI health screenings & digital vault storage',
        ],
        recommendedFor: cardioRisk || metabolicRisk
          ? 'Best match: your profile flags chronic cardiometabolic monitoring needs.'
          : 'Strong comprehensive default for preventive-first members.',
      },
      {
        id: 'plan-2',
        name: 'Greenhouse Shield Essential',
        provider: 'Verdant Mutual Healthcare',
        tier: 'Balanced Value',
        matchScore: Math.max(72, 92 - chronicCount * 5),
        premium: '$135 / month',
        deductible: '$950 / year',
        annualCoverage: '$250,000',
        highlights: [
          '80% OPD coverage for routine consultations',
          'Annual complete metabolic & radiology checkup',
          'Zero copay emergency room & hospitalization',
          'Discounted wellness and nutrition memberships',
        ],
        recommendedFor: 'Cost-effective coverage with strong catastrophic protection.',
      },
      {
        id: 'plan-3',
        name: 'Apex Heritage Elite Family',
        provider: 'Apex Sanctuary Health Network',
        tier: 'Executive High-Limit',
        matchScore: 88,
        premium: '$260 / month',
        deductible: '$200 / year',
        annualCoverage: '$1,000,000',
        highlights: [
          'Worldwide hospital network & specialist access',
          'Covers immediate family members under a shared deductible',
          'Comprehensive cancer & genetic screening riders',
          'Dedicated 24/7 physician line',
        ],
        recommendedFor: 'Premium choice for maximal coverage and family protection.',
      },
    ];

    const rankedPlans = plans.sort((a, b) => b.matchScore - a.matchScore);
    auditRecord({ action: 'insurance_query', resourceType: 'ai', resourceId: null, req, userId: req.userId, meta: { planCount: rankedPlans.length } });
    res.json({
      summary: `Based on ${chronicCount} declared condition${chronicCount === 1 ? '' : 's'}${allergies?.length ? `, ${allergies.length} documented allerg${allergies.length === 1 ? 'y' : 'ies'}` : ''} and ${facts.documentCount} vaulted document${facts.documentCount === 1 ? '' : 's'}, these plans match your clinical risk profile.`,
      profileFactors: { chronicConditions, allergies, age, cardioRisk, metabolicRisk },
      plans: rankedPlans,
    });
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------------------------------
// 3. Chat companion
// ------------------------------------------------------------------
router.post('/chat', authMiddleware, aiLimiter, validate(chatChecks), async (req, res, next) => {
  try {
    const messages = Array.isArray(req.body.messages)
      ? req.body.messages
          .filter((m) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'))
          .map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) }))
          .slice(-12) // context window guard
      : [];
    const lastMessage = messages.length ? messages[messages.length - 1].content : '';

    const ctx = await loadPatientContext(req);
    const facts = ctx ? patientFacts(ctx.user, ctx.documents) : null;

    if (hasOpenAI()) {
      try {
        const systemContent =
          'You are MediSage, a calm, evidence-based clinical AI assistant. Use ONLY these verified patient facts; if information is missing, say so instead of guessing. Patient facts (JSON): ' +
          JSON.stringify(facts || {}) +
          ' Always include a short medical disclaimer when giving health guidance.';
        const reply = await openAiChat([{ role: 'system', content: systemContent }, ...messages]);
        auditRecord({ action: 'ai_query', resourceType: 'ai', resourceId: null, req, userId: req.userId, meta: { kind: 'chat', source: 'openai', channels: messages.length } });
        return res.json({ reply, source: 'openai' });
      } catch (err) {
        console.warn('Chat OpenAI failed, using rule engine:', err.message);
      }
    }

    auditRecord({ action: 'ai_query', resourceType: 'ai', resourceId: null, req, userId: req.userId, meta: { kind: 'chat', channels: messages.length } });
    return res.json({ reply: heuristicChat(lastMessage, facts), source: 'heuristic' });
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------------------------------
// Heuristic fallback engines
// ------------------------------------------------------------------

const STATIC_RECOMMENDATIONS = (facts) => ([
  { category: 'Diet & Botanicals', title: 'Soluble Fiber Protocol', desc: 'Aim for 35g dietary fiber daily (oats, legumes, flaxseeds) to assist bile-acid binding.', badge: 'Nutrition' },
  { category: 'Activity', title: 'Zone-2 Steady Cardio', desc: '150 minutes of brisk walking or cycling weekly to support insulin sensitivity.', badge: 'Movement' },
  { category: 'Clinical Follow-up', title: 'Repeat Panel in 90 Days', desc: 'Recheck fasting lipids/metabolic panel and compare against your vault trajectory.', badge: 'Lab Work' },
  { category: 'Rest & Recovery', title: 'Circadian Sync', desc: 'Target 7.5 hours nightly sleep to reduce sympathetic vascular tone.', badge: 'Recovery' },
]);

function buildStaticRecommendations(facts) {
  return STATIC_RECOMMENDATIONS(facts);
}
function buildHeuristicAnalysis(facts) {
  const lines = [];
  lines.push('### MediSage Synthesis (heuristic engine — no OpenAI key configured)');
  lines.push('');
  lines.push(`**1. Clinical Overview** — Vault contains ${facts.documentCount} document(s)`);
  if (facts.documentTypes.length) lines.push(`   Types on file: ${facts.documentTypes.join(', ')}.`);
  if (facts.biomarkers.length) lines.push(`   Most recent biomarkers on record: ${facts.biomarkers.slice(0, 6).join('; ')}.`);
  else lines.push('   No biomarkers extracted yet — upload a lab report to unlock longitudinal analysis.');
  if (facts.chronicConditions.length) lines.push(`   Declared conditions: ${facts.chronicConditions.join(', ')}.`);
  if (facts.allergies.length) lines.push(`   Documented allergies: ${facts.allergies.join(', ')} — always flag these to prescribers.`);
  lines.push('');
  lines.push('**2. Botanical & Nutritional Guidance** — daily soluble fiber (oats, flax, legumes), polyphenol-rich infusions (hibiscus, tulsi), and omega-3 intake via fish or microalgae oil support the lipid and endothelial pathways.');
  lines.push('**3. Movement** — Zone-2 aerobic sessions 4×/week plus 2 resistance sessions to maintain metabolic flexibility.');
  lines.push('**4. Preventive Roadmap** — schedule the next lab panel in 90 days and re-verify drug-interaction status before any new prescription.');
  lines.push('');
  lines.push('> MEDICAL DISCLAIMER: Informational only — never a substitute for professional medical advice.');
  return lines.join('\n');
}

function heuristicChat(lastMessage, facts) {
  const lower = String(lastMessage || '').toLowerCase();

  const biomarkerByName = (re) => {
    if (!facts) return null;
    const hit = facts.biomarkers.find((b) => re.test(b));
    return hit || null;
  };

  if (/cholesterol|lipid|ldl|hdl/.test(lower)) {
    const value = biomarkerByName(/cholesterol|ldl|hdl|lipid/i);
    return value
      ? `From your verified records: ${value}. Gold-standard first steps remain soluble oat fiber, plant sterols, and zone-2 movement — then recheck in 8–12 weeks and compare with the trajectory in your vault.`
      : 'No lipid results are in your vault yet. Upload a lipid panel and I will map each value to its LOINC code and clinical reference range.';
  }
  if (/blood pressure|hypertension|\bbp\b/.test(lower)) {
    const value = biomarkerByName(/blood pressure|systolic|diastolic/i);
    return value
      ? `Verified from your vault: ${value}. Keep sodium moderate, maintain the prescribed regimen, and log home readings twice weekly.`
      : 'No blood-pressure readings stored yet. Upload a cardiology note or add a manual record for trend tracking.';
  }
  if (/hba1c|glucose|diabet/.test(lower)) {
    const value = biomarkerByName(/a1c|glucose|sugar/i);
    return value
      ? `Verified record: ${value}. Post-meal walks and fiber-forward meals meaningfully blunt post-prandial spikes.`
      : 'No glycemic data stored yet — upload your metabolic panel for longitudinal tracking.';
  }
  if (/interaction|drug|safe|combine/.test(lower)) {
    return 'The Pharmacodynamic Safety Guard is available — open the Safety Guard panel or the Sandbox Simulator to evaluate your current prescriptions against CYP450 metabolism, renal function, and your documented allergies.';
  }
  if (/summary|overview|health|report/.test(lower)) {
    return facts && facts.documentCount > 0
      ? `Your vault currently holds ${facts.documentCount} document(s)${facts.chronicConditions.length ? ` and ${facts.chronicConditions.length} declared chronic condition(s)` : ''}. Ask me about any specific biomarker, and visit Insights for the full longitudinal synthesis.`
      : 'Your vault is empty right now — start by uploading a prescription or lab report and I will extract and track every biomarker.';
  }
  return 'I can help you interpret stored biomarkers (HbA1c, lipid panel, eGFR, blood pressure), verify drug-interaction safety, or locate records in your vault. What would you like to review today?';
}

module.exports = router;
