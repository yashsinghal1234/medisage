/**
 * HL7® FHIR® R4 Hospital Passport Serializer
 * -------------------------------------------------------------
 * Builds a US-Core-flavored `Bundle` from the user's vault:
 *   - Patient resource (demographics + blood-group extension)
 *   - Observation resources mapped to LOINC codes (from extracted biomarkers)
 *   - MedicationStatement resources (RxNorm-style normalization)
 *   - AllergyIntolerance resources (SNOMED CT approximations)
 *
 * Reference: HL7 FHIR Release 4 (4.0.1) — https://hl7.org/fhir/
 */

const LOINC_MAP = {
  'Cholesterol, Total': '2093-3',
  'LDL Cholesterol (Calculated)': '18262-6',
  'HDL Cholesterol': '2085-9',
  'Triglycerides': '2571-8',
  'Hemoglobin A1c (HbA1c)': '4548-4',
  'Fasting Blood Glucose': '1558-6',
  'Serum Creatinine': '2160-0',
  'Glomerular Filtration Rate (eGFR)': '33914-3',
  'Systolic Blood Pressure': '8480-6',
  'Diastolic Blood Pressure': '8462-4',
};

// Common medication ingredient → RxNorm concept approximations
const RXNORM_MAP = {
  telmisartan: '316152',
  telmisartan20: '316152',
  atorvastatin: '246527',
  atorvastatin10: '246527',
  lovastatin: '61832',
  pravastatin: '6470',
  metformin: '6809',
  ibuprofen: '5640',
  paracetamol: '32223', // == acetaminophen
  lisinopril: '29046',
  levothyroxine: '10582',
  metoprolol: '11166',
  sertraline: '82136',
  aspirin: '1191',
  atenolol: '1223',
  omeprazole: '7646',
  amlodipine: '17767',
};

const DISPLAY_MAP = {
  '2093-3': 'Cholesterol [Mass/volume] in Serum or Plasma',
  '18262-6': 'Cholesterol in LDL [Mass/volume] by calculation',
  '2085-9': 'Cholesterol in HDL [Mass/volume] in Serum or Plasma',
  '2571-8': 'Triglyceride [Mass/volume] in Serum or Plasma',
  '4548-4': 'Hemoglobin A1c/Hemoglobin.total in Blood',
  '1558-6': 'Fasting glucose [Mass/volume] in Serum or Plasma',
  '2160-0': 'Creatinine [Mass/volume] in Serum or Plasma',
  '33914-3': 'Glomerular filtration rate/1.7320 sq.m.predicted',
};

const bloodGroupToAboRh = (bloodGroup = '') => {
  const g = String(bloodGroup).toUpperCase().replace('POSITIVE', '+').replace('NEGATIVE', '-').trim();
  const m = g.match(/^([ABO]+|[ABO]*\+)\s*([+-])?$/);
  if (m && (m[2] || g.includes('+') || g.includes('-'))) {
    const abo = g.replace(/[+-].*$/, '').trim();
    const rh = g.includes('-') ? 0 : +1;
    return { abo, rh };
  }
  return null;
};

function buildPatientResource(user) {
  const blood = bloodGroupToAboRh(user.bloodGroup);
  const identifier = String(user._id);
  const resource = {
    resourceType: 'Patient',
    id: 'patient-' + identifier,
    meta: { profile: ['http://hl7.org/fhir/StructureDefinition/Patient'] },
    identifier: [{ system: 'urn:medisage:vault', value: identifier }],
    active: true,
    name: [{ text: user.name }],
    telecom: [{ system: 'email', value: user.email }],
    gender: user.gender || 'unknown',
  };
  if (user.dateOfBirth) resource.birthDate = new Date(user.dateOfBirth).toISOString().split('T')[0];

  if (blood) {
    resource.extension = [
      {
        url: 'https://medisage.health/StructureDefinition/blood-group',
        valueCodeableConcept: {
          coding: [
            { code: blood.abo, display: `ABO ${blood.abo}` },
            { code: blood.rh > 0 ? 'positive' : 'negative', display: `Rh ${blood.rh > 0 ? '+' : '-'}` },
          ],
          text: user.bloodGroup,
        },
      },
    ];
  }
  return resource;
}

function buildAllergyResources(user, familyMember = null) {
  const allergies = (familyMember ? familyMember.allergies : user.allergies) || [];
  return allergies.map((allergy, index) => ({
    resourceType: 'AllergyIntolerance',
    id: `allergy-${index + 1}`,
    meta: { profile: ['http://hl7.org/fhir/StructureDefinition/AllergyIntolerance'] },
    clinicalStatus: {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical', code: 'active' }],
    },
    criticality: 'high',
    patient: null,
    code: {
      coding: [{ system: 'http://snomed.info/sct', code: null, display: allergy }],
      text: allergy,
    },
  }));
}

function buildObservationResources(documents) {
  const observations = [];
  documents.forEach((doc, docIndex) => {
    const entities = (doc.metadata && doc.metadata.extractedEntities) || [];
    const biomarkers = (doc.metadata && doc.metadata.biomarkers) || [];

    const candidates = [
      ...entities.map((e) => ({
        name: e.name, value: e.value, ref: e.ref, status: e.status,
        loinc: e.code ? (e.code.match(/(\d{3,4}-\d)/) || [])[1] : null, page: e.page,
      })),
      ...biomarkers.map((b) => ({ name: b.name, value: b.value, status: b.status, loinc: LOINC_MAP[b.name] || null })),
    ];

    candidates.forEach((c, i) => {
      if (!c.loinc || (c.value == null || c.value === '')) return;
      observations.push({
        resourceType: 'Observation',
        id: `obs-${docIndex + 1}-${i + 1}`,
        meta: { profile: ['http://hl7.org/fhir/StructureDefinition/Observation'] },
        status: 'final',
        category: [
          {
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'laboratory',
            }],
          },
        ],
        code: {
          coding: [{ system: 'http://loinc.org', code: c.loinc, display: DISPLAY_MAP[c.loinc] || c.name }],
          text: c.name,
        },
        effectiveDateTime: (doc.documentDate || doc.uploadDate || new Date()).toISOString(),
        valueString: String(c.value),
        referenceRange: c.ref ? [{ text: c.ref }] : undefined,
      });
    });
  });
  return observations;
}

function buildMedicationStatements(documents, medications = []) {
  const seen = new Set();
  const statements = [];

  const fromDocs = documents
    .map((doc) => (doc.metadata && doc.metadata.medications) || [])
    .flat();
  const allMeds = [...new Set([...medications, ...fromDocs])].filter(Boolean);

  allMeds.forEach((med) => {
    const key = String(med).toLowerCase().trim();
    if (seen.has(key)) return;
    seen.add(key);
    let rxnorm = null;
    for (const [ingredient, code] of Object.entries(RXNORM_MAP)) {
      if (key.includes(ingredient)) { rxnorm = code; break; }
    }
    const entry = {
      resourceType: 'MedicationStatement',
      id: `med-${statements.length + 1}`,
      meta: { profile: ['http://hl7.org/fhir/StructureDefinition/MedicationStatement'] },
      status: 'active',
      medicationCodeableConcept: {
        coding: rxnorm
          ? [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: rxnorm }]
          : [],
        text: med,
      },
    };
    if (!rxnorm) delete entry.medicationCodeableConcept.coding;
    statements.push(entry);
  });

  return statements;
}

/**
 * Build the full FHIR Bundle for a patient.
 * @param {Object} params
 * @param {Object} params.user             Mongo user (or local-shaped user object)
 * @param {Object[]} params.documents      User's documents
 * @param {Object} params.familyMember     Optional dependent context
 * @returns FHIR R4 Bundle object
 */
function buildPatientBundle({ user, documents = [], familyMember = null, activeMedications = [] }) {
  const patient = buildPatientResource(familyMember ? { ...user, name: familyMember.name, dateOfBirth: familyMember.dateOfBirth, bloodGroup: familyMember.bloodGroup } : user);

  const resources = [
    patient,
    ...buildAllergyResources(user, familyMember),
    ...buildObservationResources(documents),
    ...buildMedicationStatements(documents, activeMedications),
  ];

  resources.forEach((r) => {
    if (r.resourceType === 'Patient') return;
    if (r.resourceType === 'AllergyIntolerance') {
      if (!r.patient || !r.patient.reference) r.patient = { reference: `Patient/${patient.id}` };
    } else if (!r.subject) {
      r.subject = { reference: `Patient/${patient.id}` };
    }
  });

  return {
    resourceType: 'Bundle',
    id: `medisage-passport-${(user._id || 'local')}-${Date.now()}`,
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/Bundle'],
      lastUpdated: new Date().toISOString(),
    },
    type: 'document',
    timestamp: new Date().toISOString(),
    entry: resources.map((resource, index) => ({
      fullUrl: `urn:uuid:${resource.id || index}`,
      resource,
    })),
  };
}

module.exports = { buildPatientBundle };
