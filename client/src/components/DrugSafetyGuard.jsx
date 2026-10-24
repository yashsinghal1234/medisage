import React, { useState } from 'react';
import { 
  ShieldAlert, AlertTriangle, CheckCircle2, Info, Plus, Trash2, 
  Search, Pill, Droplet, ArrowRight, ExternalLink, RefreshCw, Zap
} from 'lucide-react';

// Clinical Interaction & Allergy Database
const CLINICAL_KNOWLEDGE_BASE = {
  activeMeds: [
    { id: 'telmisartan', name: 'Telmisartan', dose: '20mg Daily', class: 'ARB (Angiotensin II Receptor Blocker)', target: 'Hypertension' },
    { id: 'atorvastatin', name: 'Atorvastatin', dose: '10mg Bedtime', class: 'HMG-CoA Reductase Inhibitor', target: 'Dyslipidemia' },
    { id: 'omega3', name: 'Omega-3 Fatty Acids', dose: '1000mg Daily', class: 'Lipid Regulating Agent', target: 'Triglycerides' },
  ],
  knownAllergies: [
    { allergen: 'Penicillin', severity: 'Severe Anaphylaxis', crossReactive: ['Amoxicillin', 'Ampicillin', 'Piperacillin'] },
    { allergen: 'Sulfonamides', severity: 'Moderate Rash & Bronchospasm', crossReactive: ['Sulfamethoxazole', 'Trimethoprim-Sulfamethoxazole', 'Sulfasalazine'] }
  ],
  interactionRules: [
    {
      drugA: 'atorvastatin',
      drugB: 'grapefruit',
      severity: 'MAJOR',
      title: 'CYP3A4 Inhibition — Statin Toxicity Risk',
      mechanism: 'Grapefruit and its juice inhibit intestinal CYP3A4, substantially increasing bioavailability and plasma AUC of Atorvastatin by up to 250%.',
      clinicalImpact: 'Significantly elevated risk of rhabdomyolysis, severe myopathy, and acute hepatic enzyme elevation (ALT/AST).',
      recommendation: 'Avoid consumption of grapefruit or grapefruit juice. Consider Rosuvastatin or Pravastatin if citrus consumption is vital.',
      evidenceScore: 'Class I (Strong Evidence)',
    },
    {
      drugA: 'telmisartan',
      drugB: 'ibuprofen',
      severity: 'MODERATE',
      title: 'Renal Hemodynamic Antagonism & Hyperkalemia',
      mechanism: 'NSAIDs inhibit renal vasodilatory prostaglandins, blunting the afferent arteriolar blood flow while Telmisartan dilates efferent arterioles.',
      clinicalImpact: 'Acute reduction in glomerular filtration rate (eGFR drop), fluid retention, and blunted blood pressure reduction.',
      recommendation: 'Use Acetaminophen (Paracetamol) for analgesia. If NSAIDs are strictly required, monitor serum potassium and creatinine within 7 days.',
      evidenceScore: 'Class IIa (Moderate Evidence)',
    },
    {
      drugA: 'telmisartan',
      drugB: 'potassium',
      severity: 'MODERATE',
      title: 'Synergistic Hyperkalemia Risk',
      mechanism: 'Telmisartan decreases aldosterone secretion, reducing urinary potassium excretion. Supplemental potassium compounds this effect.',
      clinicalImpact: 'Serum K+ > 5.5 mEq/L leading to cardiac arrhythmias and muscle weakness.',
      recommendation: 'Check baseline serum electrolytes. Do not initiate potassium supplements without laboratory monitoring.',
      evidenceScore: 'Class IIa',
    },
    {
      drugA: 'atorvastatin',
      drugB: 'telmisartan',
      severity: 'BENIGN',
      title: 'Synergistic Cardiovascular Risk Reduction',
      mechanism: 'Independent complementary pathways: ARB reduces vascular wall tension while Statin stabilizes atheromatous plaques.',
      clinicalImpact: 'Optimal combination therapy for ASCVD risk reduction with favorable metabolic profile.',
      recommendation: 'Continue standard once-daily dosing regimen.',
      evidenceScore: 'Guideline Directed Medical Therapy (ACC/AHA)',
    }
  ],
  sandboxCandidates: [
    { id: 'ibuprofen', name: 'Ibuprofen', dose: '400mg PRN', class: 'NSAID' },
    { id: 'grapefruit', name: 'Grapefruit Extract / Juice', dose: 'Dietary', class: 'CYP3A4 Inhibitor' },
    { id: 'amoxicillin', name: 'Amoxicillin', dose: '500mg TID', class: 'Beta-Lactam Antibiotic' },
    { id: 'potassium', name: 'Potassium Citrate', dose: '20 mEq Daily', class: 'Electrolyte Supplement' },
    { id: 'metformin', name: 'Metformin', dose: '500mg BID', class: 'Biguanide' },
    { id: 'aspirin', name: 'Aspirin (Baby)', dose: '81mg Daily', class: 'Antiplatelet' },
  ]
};

export const DrugSafetyGuard = () => {
  const [currentMeds, setCurrentMeds] = useState(CLINICAL_KNOWLEDGE_BASE.activeMeds);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'major' | 'moderate'

  // Analyze active interactions
  const analyzeInteractions = () => {
    const medIds = currentMeds.map(m => m.id.toLowerCase());
    const detectedInteractions = [];

    CLINICAL_KNOWLEDGE_BASE.interactionRules.forEach(rule => {
      const matchA = medIds.includes(rule.drugA);
      const matchB = medIds.includes(rule.drugB);
      if (matchA && matchB) {
        detectedInteractions.push(rule);
      }
    });

    // Check allergy conflicts
    const allergyAlerts = [];
    currentMeds.forEach(med => {
      CLINICAL_KNOWLEDGE_BASE.knownAllergies.forEach(allergy => {
        if (allergy.crossReactive.some(sub => med.name.toLowerCase().includes(sub.toLowerCase())) || 
            med.name.toLowerCase().includes(allergy.allergen.toLowerCase())) {
          allergyAlerts.push({
            med: med.name,
            allergen: allergy.allergen,
            severity: allergy.severity,
            warning: `Contraindicated: Patient has documented severe sensitivity to ${allergy.allergen}. Cross-reactivity likely.`
          });
        }
      });
    });

    return { detectedInteractions, allergyAlerts };
  };

  const { detectedInteractions, allergyAlerts } = analyzeInteractions();

  const handleAddMed = (candidateId) => {
    if (!candidateId) return;
    const candidate = CLINICAL_KNOWLEDGE_BASE.sandboxCandidates.find(c => c.id === candidateId);
    if (candidate && !currentMeds.some(m => m.id === candidate.id)) {
      setCurrentMeds([...currentMeds, { ...candidate, target: 'Simulated Regimen' }]);
      setSelectedCandidate('');
    }
  };

  const handleRemoveMed = (medId) => {
    setCurrentMeds(currentMeds.filter(m => m.id !== medId));
  };

  const handleResetToBaseline = () => {
    setCurrentMeds(CLINICAL_KNOWLEDGE_BASE.activeMeds);
  };

  // Severity color maps
  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'MAJOR':
        return { bg: '#fee2e2', text: '#991b1b', border: '#f87171', label: 'CRITICAL HAZARD' };
      case 'MODERATE':
        return { bg: '#fef3c7', text: '#92400e', border: '#fcd34d', label: 'MODERATE CAUTION' };
      case 'BENIGN':
      default:
        return { bg: '#dcfce7', text: '#166534', border: '#86efac', label: 'CLINICALLY SAFE' };
    }
  };

  const filteredInteractions = detectedInteractions.filter(item => {
    if (activeFilter === 'major') return item.severity === 'MAJOR';
    if (activeFilter === 'moderate') return item.severity === 'MODERATE';
    return true;
  });

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 8px 32px rgba(15, 62, 23, 0.06)',
        border: '1px solid var(--color-border-mist)',
        marginBottom: '40px',
      }}
    >
      {/* Header Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#eaf4ec', padding: '4px 12px', borderRadius: '6px', marginBottom: '10px' }}>
            <ShieldAlert size={15} color="#0f3e17" />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f3e17', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              RxNorm &amp; SIDER Pharmacology Engine
            </span>
          </div>
          <h3
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '26px',
              fontWeight: 400,
              color: '#0f3e17',
              margin: '0 0 6px 0',
            }}
          >
            Drug-Drug &amp; Allergy Interaction Safety Guard
          </h3>
          <p style={{ fontSize: '14px', color: '#555', margin: 0, maxWidth: '680px' }}>
            Automated cross-referencing between active pharmacotherapy, enzyme pathways (CYP450), and patient allergy records.
          </p>
        </div>

        <button
          onClick={handleResetToBaseline}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#f5f7f4',
            border: '1px solid #dce5dc',
            padding: '8px 14px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#1a3d22',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          <RefreshCw size={13} />
          <span>Reset to Patient Baseline</span>
        </button>
      </div>

      {/* ================= ALLERGY CONTRAINDICATION ALERT BANNER (IF ANY) ================= */}
      {allergyAlerts.length > 0 && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            border: '2px solid #ef4444',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '24px',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.12)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b', fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>
            <AlertTriangle size={18} />
            <span>CRITICAL ALLERGY CONTRAINDICATION DETECTED</span>
          </div>
          {allergyAlerts.map((alert, idx) => (
            <div key={idx} style={{ fontSize: '13px', color: '#7f1d1d', lineHeight: 1.45, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={14} color="#b91c1c" style={{ flexShrink: 0 }} />
              <span>Drug <strong>{alert.med}</strong> is directly contraindicated due to documented <strong>{alert.allergen}</strong> ({alert.severity}). Desensitization or alternative class required immediately.</span>
            </div>
          ))}
        </div>
      )}

      {/* ================= ACTIVE REGIMEN & SANDBOX SIMULATOR BAR ================= */}
      <div
        style={{
          backgroundColor: '#f6faf6',
          borderRadius: '16px',
          padding: '20px 24px',
          border: '1px solid #d5e6d8',
          marginBottom: '28px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginBottom: '14px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f3e17', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Patient Regimen ({currentMeds.length} Items Evaluated)
            </span>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Add potential new prescriptions, OTC drugs, or supplements to simulate interaction risks before taking them.
            </div>
          </div>

          {/* Add Candidate Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              value={selectedCandidate}
              onChange={(e) => setSelectedCandidate(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #c5d8c8',
                backgroundColor: '#ffffff',
                fontSize: '13px',
                color: '#1a3d22',
                outline: 'none',
              }}
            >
              <option value="">+ Test New Medication / Food...</option>
              {CLINICAL_KNOWLEDGE_BASE.sandboxCandidates
                .filter(cand => !currentMeds.some(m => m.id === cand.id))
                .map(cand => (
                  <option key={cand.id} value={cand.id}>
                    {cand.name} ({cand.dose}) — {cand.class}
                  </option>
                ))}
            </select>
            <button
              onClick={() => handleAddMed(selectedCandidate)}
              disabled={!selectedCandidate}
              style={{
                backgroundColor: selectedCandidate ? '#0f3e17' : '#c5d8c8',
                color: '#ffffff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: selectedCandidate ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Plus size={14} />
              <span>Simulate</span>
            </button>
          </div>
        </div>

        {/* Current Meds Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {currentMeds.map((med) => {
            const isBaseline = CLINICAL_KNOWLEDGE_BASE.activeMeds.some(m => m.id === med.id);
            return (
              <div
                key={med.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: isBaseline ? '1px solid #b8d9bf' : '1.5px dashed #0f3e17',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 2px 6px rgba(15, 62, 23, 0.04)',
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isBaseline ? '#16a34a' : '#f59e0b' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f3e17' }}>
                    {med.name} <span style={{ fontSize: '11px', fontWeight: 400, color: '#666' }}>({med.dose})</span>
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#57715c' }}>
                    {med.class} {!isBaseline && '• [Simulated]'}
                  </div>
                </div>

                {!isBaseline && (
                  <button
                    onClick={() => handleRemoveMed(med.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#991b1b',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Remove from simulation"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= INTERACTION ANALYSIS SECTION ================= */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h4 style={{ margin: 0, fontSize: '17px', color: '#0f3e17', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Pharmacodynamic &amp; Pharmacokinetic Findings</span>
            <span style={{ fontSize: '12px', fontWeight: 500, backgroundColor: '#eaf4ec', color: '#0f3e17', padding: '2px 8px', borderRadius: '12px' }}>
              {detectedInteractions.length} Pairs Detected
            </span>
          </h4>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setActiveFilter('all')}
              style={{
                backgroundColor: activeFilter === 'all' ? '#0f3e17' : '#f3f4f6',
                color: activeFilter === 'all' ? '#ffffff' : '#4b5563',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('major')}
              style={{
                backgroundColor: activeFilter === 'major' ? '#991b1b' : '#fee2e2',
                color: activeFilter === 'major' ? '#ffffff' : '#991b1b',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Major Only
            </button>
            <button
              onClick={() => setActiveFilter('moderate')}
              style={{
                backgroundColor: activeFilter === 'moderate' ? '#92400e' : '#fef3c7',
                color: activeFilter === 'moderate' ? '#ffffff' : '#92400e',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Moderate Only
            </button>
          </div>
        </div>

        {/* Interaction Cards Grid */}
        {filteredInteractions.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', backgroundColor: '#fcfdfc', borderRadius: '14px', border: '1px dashed #d5e6d8' }}>
            <CheckCircle2 size={32} color="#16a34a" style={{ margin: '0 auto 10px auto' }} />
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f3e17' }}>No Adverse Interactions in Filtered View</div>
            <div style={{ fontSize: '12.5px', color: '#666', marginTop: '4px' }}>
              Your current simulated regimen shows zero high-severity cross-reactions under this filter.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredInteractions.map((rule, idx) => {
              const badge = getSeverityBadge(rule.severity);
              const drugAObj = currentMeds.find(m => m.id === rule.drugA);
              const drugBObj = currentMeds.find(m => m.id === rule.drugB);

              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: `1.5px solid ${badge.border}`,
                    padding: '20px 24px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
                    {/* Pair title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          backgroundColor: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`,
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: '6px',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {badge.label}
                      </span>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f3e17' }}>
                        {drugAObj?.name || rule.drugA} + {drugBObj?.name || rule.drugB}
                      </span>
                    </div>

                    <span style={{ fontSize: '11.5px', color: '#666', fontStyle: 'italic' }}>
                      Evidence Level: <strong>{rule.evidenceScore}</strong>
                    </span>
                  </div>

                  {/* Summary & Mechanism */}
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a3d22', marginBottom: '6px' }}>
                    {rule.title}
                  </div>
                  <div style={{ fontSize: '13px', color: '#444', lineHeight: 1.5, marginBottom: '12px' }}>
                    {rule.mechanism}
                  </div>

                  {/* Clinical Impact & Actionable Rec (2-Col Tinted) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ backgroundColor: '#fafbf9', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e5ece6' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: '#991b1b', display: 'block', marginBottom: '4px' }}>
                        CLINICAL IMPACT
                      </span>
                      <span style={{ fontSize: '12.5px', color: '#333', lineHeight: 1.4 }}>
                        {rule.clinicalImpact}
                      </span>
                    </div>

                    <div style={{ backgroundColor: '#f2f8f4', padding: '12px 14px', borderRadius: '10px', border: '1px solid #c8e1cf' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: '#0f3e17', display: 'block', marginBottom: '4px' }}>
                        PHYSICIAN RECOMMENDATION
                      </span>
                      <span style={{ fontSize: '12.5px', color: '#0f3e17', lineHeight: 1.4, fontWeight: 500 }}>
                        {rule.recommendation}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
