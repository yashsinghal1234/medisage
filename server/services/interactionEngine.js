/**
 * Pharmacodynamic Interaction Engine
 * -------------------------------------------------------------
 * Evaluates a patient's active medication list (+ allergies, eGFR,
 * age) against the clinical knowledge base and produces severity-ranked
 * safety alerts for the client's Safety Guard & Sandbox Simulator.
 *
 * Design goals:
 *  - Deterministic: same input -> same output (validatable, no LLM).
 *  - Explainable:   every alert cites its mechanism & reference class codes.
 *  - Fail-safe:     unknown drugs are reported as "unclassified", never ignored.
 */

const { DRUG_CLASSES, SYNONYMS, DRUG_INTERACTIONS, CONDITION_RULES, ALLERGY_RULES } = require('../config/interactions');

// ---------- helpers -------------------------------------------------

const normalize = (s) => String(s || '').toLowerCase().trim();

/** Expand a drug label to a de-duplicated set of candidate names. */
const expandName = (raw) => {
  const n = normalize(raw);
  return new Set([n, ...(SYNONYMS[n] || [])]);
};

/** Map each input medication to the ontology classes it belongs to. */
function classifyMedications(medications = []) {
  const classified = [];

  medications.filter(Boolean).forEach((med) => {
    const names = expandName(med);
    const classes = [];
    for (const [className, members] of Object.entries(DRUG_CLASSES)) {
      for (const member of members) {
        if (names.has(member) || normalize(med).includes(member)) {
          if (!classes.includes(className)) classes.push(className);
          break;
        }
      }
    }
    classified.push({
      input: med,
      normalizedName: [...names][0],
      classes,
      unclassified: classes.length === 0,
    });
  });

  return classified;
}

/** Match allergy strings against cross-reactivity rules. */
function evaluateAllergies(allergies = []) {
  const alerts = [];
  (allergies || []).filter(Boolean).forEach((allergy) => {
    const n = normalize(allergy);
    for (const rule of ALLERGY_RULES) {
      if (rule.allergenPattern.test(n)) {
        alerts.push({
          type: 'allergy',
          id: rule.id,
          severity: rule.severity,
          title: rule.title,
          allergy,
          excludeClasses: rule.excludeClasses,
          crossNote: rule.crossNote,
        });
      }
    }
  });
  return alerts;
}

/** Check whether ANY input drug appears in the excluded classes. */
const hitsExcludedClass = (classified, excludeClasses) =>
  classified.some((c) => c.classes.some((cls) => excludeClasses.includes(cls)));

// ---------- main evaluation -----------------------------------------

/**
 * @param {Object} input
 * @param {string[]} input.medications  Active medication names
 * @param {string[]} input.allergies    Known drug allergies
 * @param {number|null} input.egfr      eGFR mL/min/1.73m² (optional)
 * @param {number|null} input.age       Age in years (optional)
 * @returns {{ summary: object, alerts: object[] }}
 */
function evaluateInteractionProfile({ medications = [], allergies = [], egfr = null, age = null } = {}) {
  const classified = classifyMedications(medications);
  const alerts = [];

  // 1. Drug–Drug interactions (each unique unordered class-pair across meds)
  const activeClassPairs = new Set();
  for (let i = 0; i < classified.length; i++) {
    for (let j = i + 1; j < classified.length; j++) {
      for (const clsA of classified[i].classes) {
        for (const clsB of classified[j].classes) {
          if (clsA === clsB) continue;
          // canonical unordered key
          activeClassPairs.add(clsA < clsB ? `${clsA}|${clsB}` : `${clsB}|${clsA}`);
        }
      }
    }
  }

  for (const rule of DRUG_INTERACTIONS) {
    const [a, b] = rule.classes;
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (!activeClassPairs.has(key)) continue;

    const involvedDrugs = [];
    classified.forEach((c) => {
      if (c.classes.includes(a) || c.classes.includes(b)) {
        if (!involvedDrugs.includes(c.input)) involvedDrugs.push(c.input);
      }
    });

    alerts.push({
      type: 'drug-drug',
      id: rule.id,
      severity: rule.severity,
      title: rule.title,
      drugs: involvedDrugs,
      mechanism: rule.mechanism,
      effect: rule.effect,
      advice: rule.advice,
    });
  }

  // 2. Cross-reactivity: allergies vs present medications
  const allergyAlerts = evaluateAllergies(allergies);
  allergyAlerts.forEach((alert) => {
    if (hitsExcludedClass(classified, alert.excludeClasses)) {
      const involvedDrugs = classified
        .filter((c) => c.classes.some((cls) => alert.excludeClasses.includes(cls)))
        .map((c) => c.input);
      alerts.push({ ...alert, drugs: involvedDrugs });
    }
  });

  // 3. Condition / renal rules
  const ctx = { egfr, age };
  for (const rule of CONDITION_RULES) {
    if (!rule.condition(ctx)) continue;
    const involvedDrugs = classified
      .filter((c) => c.classes.some((cls) => rule.drugClasses.includes(cls)))
      .map((c) => c.input);
    if (involvedDrugs.length === 0) continue;
    alerts.push({
      type: 'condition',
      id: rule.id,
      severity: rule.severity,
      title: rule.title,
      drugs: involvedDrugs,
      advice: rule.advice,
    });
  }

  // 4. Duplicate/unknown reporting
  const unknown = classified.filter((c) => c.unclassified).map((c) => c.input);
  const duplicateSet = new Set();
  classified.forEach((c) => {
    const key = c.normalizedName;
    if (duplicateSet.has(key)) {
      alerts.push({
        type: 'duplicate',
        id: 'DUP-' + key,
        severity: 'low',
        title: `Likely duplicate: "${c.input}" appears more than once`,
        drugs: [key],
        advice: 'Verify against the prescription — duplicated antihypertensives or statins can cause dosing errors.',
      });
    }
    duplicateSet.add(key);
  });

  // Summarize by severity
  const severityRank = { critical: 0, high: 1, moderate: 2, low: 3 };
  alerts.sort((x, y) => (severityRank[x.severity] ?? 9) - (severityRank[y.severity] ?? 9));

  const summary = {
    totalMedications: classified.length,
    unclassified: unknown,
    allergyCount: allergies.length,
    critical: alerts.filter((a) => a.severity === 'critical').length,
    high: alerts.filter((a) => a.severity === 'high').length,
    moderate: alerts.filter((a) => a.severity === 'moderate').length,
    low: alerts.filter((a) => a.severity === 'low').length,
    overallRisk: alerts.some((a) => a.severity === 'critical') ? 'HIGH RISK — review before combining'
      : alerts.some((a) => a.severity === 'high') ? 'CAUTION — review recommended'
      : alerts.length > 0 ? 'LOW — monitor'
      : 'NO KNOWN INTERACTIONS in current knowledge base',
  };

  return { summary, alerts, classified };
}

module.exports = { evaluateInteractionProfile, classifyMedications };
