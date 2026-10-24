/**
 * MediSage Clinical Knowledge Base
 * -------------------------------------------------------------
 * Rule sets powering the Pharmacodynamic Safety Guard:
 *   1. Drug–Drug interactions   (CYP450 metabolism, hemodynamic antagonism)
 *   2. Drug–Condition rules     (renal dosing, metabolic caution)
 *   3. Allergy cross-reactivity (beta-lactam, sulfonamide, NSAID, cephalosporin)
 *
 * Seeded with reference-grade pairs (SIDER / FDA labeling / EHRA summaries).
 * Values here are informational, matching the README disclaimer.
 */

const DRUG_CLASSES = {
  statin: ['atorvastatin', 'simvastatin', 'lovastatin', 'rosuvastatin', 'pravastatin'],
  cyp3a4_inhibitor: ['clarithromycin', 'erythromycin', 'ketoconazole', 'itraconazole', 'ritonavir', 'grapefruit', 'grapefruit juice', 'verapamil', 'diltiazem'],
  arb: ['telmisartan', 'losartan', 'valsartan', 'olmesartan', 'candesartan', 'irbesartan'],
  acei: ['lisinopril', 'enalapril', 'ramipril', 'captopril', 'perindopril'],
  nsaid: ['ibuprofen', 'diclofenac', 'naproxen', 'ketorolac', 'aspirin', 'celecoxib', 'etoricoxib'],
  anticoagulant: ['warfarin', 'acitrom', 'phenprocoumon'],
  cyp2c9_inhibitor: ['fluconazole', 'metronidazole', 'amiodarone', 'cotrimoxazole', 'sulfamethoxazole'],
  beta_lactam_penicillin: ['penicillin', 'amoxicillin', 'augmentin', 'amoxicillin-clavulanate', 'cloxacillin', 'ampicillin'],
  cephalosporin: ['cefalexin', 'cefaclor', 'cefuroxime', 'cefixime', 'ceftriaxone', 'ceftazidime'],
  sulfonamide: ['sulfamethoxazole', 'bactrim', 'cotrimoxazole', 'sulfasalazine', 'sulfadiazine'],
  sulfonylurea: ['glimepiride', 'glibenclamide', 'gliclazide', 'glipizide'],
  metformin: ['metformin', 'glucophage', 'istamet', 'galvumet'],
  insulin: ['insulin', 'lantus', 'humalog', 'novomix'],
  ssri: ['sertraline', 'fluoxetine', 'paroxetine', 'citalopram', 'escitalopram'],
  beta_blocker: ['metoprolol', 'atenolol', 'propranolol', 'bisoprolol', 'carvedilol'],
  non_dhp_ccb: ['verapamil', 'diltiazem'],
  digoxin: ['digoxin'],
  levothyroxine: ['levothyroxine', 'thyronorm', 'eltroxin'],
  lithium: ['lithium'],
};

/**
 * Synonym expansion so trade names & genitals match class lists above.
 */
const SYNONYMS = {
  augmentin: ['amoxicillin-clavulanate'],
  cotrimoxazole: ['sulfamethoxazole'],
  bactrim: ['sulfamethoxazole'],
  'amoxicillin-clavulanate': ['amoxicillin'],
  atorva: ['atorvastatin'],
  telma: ['telmisartan'],
  telma40: ['telmisartan'],
  thyronorm: ['levothyroxine'],
  istamet: ['metformin'],
};

/**
 * DRUG_INTERACTIONS — matched ANY pair of classes co-present.
 */
const DRUG_INTERACTIONS = [
  {
    id: 'INT-001',
    classes: ['statin', 'cyp3a4_inhibitor'],
    severity: 'critical',
    mechanism: 'CYP3A4 inhibition (simvastatin/lovastatin/atorvastatin)',
    title: 'Statin toxicity risk via CYP3A4 blockade',
    effect: 'Strongly elevated statin plasma levels — myopathy & rhabdomyolysis risk.',
    advice: 'Query the prescriber: temporarily hold or switch the statin (rosuvastatin/pravastatin are CYP450-orthogonal). Monitor CK (CPK) and inquire about muscle pain or dark urine.',
  },
  {
    id: 'INT-002',
    classes: ['nsaid', 'arb'],
    severity: 'critical',
    mechanism: 'Renal prostaglandin blockade + efferent arteriole vasoconstriction ("triple whammy")',
    title: 'NSAID + ARB renal antagonism',
    effect: 'Acute kidney injury risk with sudden eGFR fall; hyperkalemia; resistant hypertension.',
    advice: 'Avoid this combination, especially with dehydration. Prefer paracetamol for analgesia and confirm renal function (eGFR, K+) within 1–2 weeks if NSAIDs were unavoidable.',
  },
  {
    id: 'INT-003',
    classes: ['nsaid', 'acei'],
    severity: 'critical',
    mechanism: 'Renal prostaglandin suppression (same pathway as ARB)',
    title: 'NSAID + ACE-inhibitor renal antagonism',
    effect: 'Acute kidney injury risk; blunted antihypertensive efficacy; hyperkalemia.',
    advice: 'Substitute NSAIDs with paracetamol; recheck creatinine/eGFR after joint dosing.',
  },
  {
    id: 'INT-004',
    classes: ['nsaid', 'anticoagulant'],
    severity: 'critical',
    mechanism: 'Antiplatelet gastric effect + INR displacement, CYP2C9 competition',
    title: 'NSAID + warfarin bleeding risk',
    effect: 'Marked GI bleeding & intracranial hemorrhage risk.',
    advice: 'Strictly avoid OTC NSAIDs on warfarin. Paracetamol (<=2g/day) is safer.',
  },
  {
    id: 'INT-005',
    classes: ['anticoagulant', 'cyp2c9_inhibitor'],
    severity: 'high',
    mechanism: 'CYP2C9 inhibition of warfarin metabolism (S-warfarin)',
    title: 'Warfarin level elevation (CYP2C9 blocker)',
    effect: 'Supratherapeutic INR, bruising and bleeding.',
    advice: 'Check INR within 3–5 days of starting the interacting drug.',
  },
  {
    id: 'INT-006',
    classes: ['arb', 'acei'],
    severity: 'critical',
    mechanism: 'Dual RAAS blockade',
    title: 'Both ARB and ACE-inhibitor active simultaneously',
    effect: 'Hypotension, hyperkalemia, and renal impairment — contraindicated combination.',
    advice: 'Confirm with the physician — one RAAS agent should generally be stopped.',
  },
  {
    id: 'INT-007',
    classes: ['beta_blocker', 'non_dhp_ccb'],
    severity: 'high',
    mechanism: 'Additive SA/AV nodal depression',
    title: 'Beta-blocker + verapamil/diltiazem bradycardia risk',
    effect: 'Heart block, bradycardia, hypotension.',
    advice: 'Monitor heart rate/BP; ask about dizziness or syncope.',
  },
  {
    id: 'INT-008',
    classes: ['digoxin', 'non_dhp_ccb'],
    severity: 'moderate',
    mechanism: 'P-glycoprotein inhibition increasing digoxin levels',
    title: 'Digoxin concentration rise (verapamil/diltiazem)',
    effect: 'Nausea, visual halos, arrhythmia risk.',
    advice: 'Check digoxin level and dose-reduce if co-prescribed.',
  },
  {
    id: 'INT-009',
    classes: ['ssri', 'nsaid'],
    severity: 'moderate',
    mechanism: 'Serergic platelet inhibition + gastric mucosal injury',
    title: 'SSRI + NSAID upper-GI bleeding risk',
    effect: 'Co-prescription multiplies peptic-ulcer bleeding risk (2–4× baseline).',
    advice: 'Add gastroprotection (PPI) or replace NSAID with paracetamol.',
  },
  {
    id: 'INT-010',
    classes: ['insulin', 'sulfonylurea'],
    severity: 'moderate',
    mechanism: 'Additive hypoglycemic effect',
    title: 'Insulin + sulfonylurea hypoglycemia',
    effect: 'Nocturnal hypoglycemia (palpitations, cold sweat, confusion).',
    advice: 'Reinforce SMBG, especially at night; ask about dose re-titration.',
  },
  {
    id: 'INT-011',
    classes: ['lithium', 'nsaid'],
    severity: 'high',
    mechanism: 'Renal lithium clearance reduction',
    title: 'NSAID-induced lithium accumulation',
    effect: 'Tremor, confusion, lithium toxicity.',
    advice: 'Avoid NSAIDs; monitor lithium levels after co-administration.',
  },
  {
    id: 'INT-012',
    classes: ['levothyroxine', 'metformin'],
    severity: 'low',
    mechanism: 'Minor absorption timing overlap',
    title: 'Levothyroxine timing separation',
    effect: 'Reduced absorption when swallowed simultaneously.',
    advice: 'Take levothyroxine fasting, 30–60 min before breakfast; separate from metformin.',
  },
];

/**
 * CONDITION_RULES — drug vs patient-condition/renal/physiologic checks.
 */
const CONDITION_RULES = [
  {
    id: 'COND-001',
    drugClasses: ['metformin'],
    condition: (ctx) => ctx.egfr != null && ctx.egfr < 30,
    severity: 'critical',
    title: 'Metformin contraindicated at eGFR < 30',
    advice: 'FDA labeling contraindicates metformin with eGFR below 30 mL/min/1.73m² — ask the nephrologist about switching.',
  },
  {
    id: 'COND-002',
    drugClasses: ['metformin'],
    condition: (ctx) => ctx.egfr != null && ctx.egfr >= 30 && ctx.egfr < 45,
    severity: 'high',
    title: 'Metformin dose restriction (eGFR 30–44)',
    advice: 'Max ~1000 mg/day recommended at this renal function; monitor B12.',
  },
  {
    id: 'COND-003',
    drugClasses: ['nsaid'],
    condition: (ctx) => ctx.egfr != null && ctx.egfr < 60,
    severity: 'high',
    title: 'NSAID caution in reduced kidney function',
    advice: 'NSAIDs can precipitate further eGFR decline below 60 mL/min/1.73m² — prefer paracetamol.',
  },
  {
    id: 'COND-004',
    drugClasses: ['statin'],
    condition: (ctx) => (ctx.age || 0) >= 75,
    severity: 'low',
    title: 'Statin intensity review in advanced age',
    advice: 'Discuss risk/benefit of moderate-intensity dosing beyond age 75.',
  },
];

/**
 * ALLERGY_CROSS_REACTIVITY — explicit allergen → contraindicated drug classes.
 */
const ALLERGY_RULES = [
  {
    id: 'ALR-001',
    allergenPattern: /penicillin|amoxicillin/i,
    excludeClasses: ['beta_lactam_penicillin'],
    severity: 'critical',
    title: 'Penicillin allergy — β-lactam (penicillin family) contraindication',
    crossNote: 'Cephalosporin carry ~1–2% cross-reactivity; safest alternatives are macrolides (azithromycin/clarithromycin) after physician review.',
  },
  {
    id: 'ALR-002',
    allergenPattern: /sulfonamide|sulfa|sulfamethoxazole/i,
    excludeClasses: ['sulfonamide', 'sulfonylurea'],
    severity: 'critical',
    title: 'Sulfonamide allergy — sulfa-family contraindication',
    crossNote: 'Sulfonylureas share the sulfonamide scaffold — caution warranted despite low cross-reactivity.',
  },
  {
    id: 'ALR-003',
    allergenPattern: /nsaid|ibuprofen|aspirin|diclofenac/i,
    excludeClasses: ['nsaid'],
    severity: 'high',
    title: 'NSAID hypersensitivity — avoid all NSAID-family agents',
    crossNote: 'Cross-intolerance spans the COX-1 pathway — paracetamol or COX-2 selective agents are usually tolerated.',
  },
  {
    id: 'ALR-004',
    allergenPattern: /cephalosporin|cefa|cefix|ceftriax/i,
    excludeClasses: ['cephalosporin'],
    severity: 'high',
    title: 'Cephalosporin allergy — cephalosporin contraindication',
    crossNote: 'Evaluate penicillin cross-reactivity with allergy history before β-lactam use.',
  },
];

module.exports = { DRUG_CLASSES, SYNONYMS, DRUG_INTERACTIONS, CONDITION_RULES, ALLERGY_RULES };
