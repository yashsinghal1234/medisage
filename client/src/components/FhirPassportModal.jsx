import React, { useState } from 'react';
import { 
  FileCode, Download, Printer, CheckCircle2, ShieldCheck, 
  X, Copy, Check, Hospital, User, Calendar, ExternalLink, QrCode, FileText
} from 'lucide-react';

export const FhirPassportModal = ({ user, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('passport'); // 'passport' | 'fhir-json'
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const patientName = user?.name || 'Eleanor Vance';
  const bloodGroup = user?.bloodGroup || 'O+ Positive';
  const dob = user?.dateOfBirth || '1988-06-14';

  // Construct official HL7 FHIR R4 Bundle
  const fhirBundle = {
    resourceType: 'Bundle',
    id: 'medisage-patient-vault-bundle-ms984210',
    type: 'document',
    timestamp: new Date().toISOString(),
    meta: {
      profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient'],
      lastUpdated: new Date().toISOString(),
    },
    identifier: {
      system: 'urn:ietf:rfc:3986',
      value: 'urn:uuid:f0418a3d-6609-4eb0-9933-9d309840ceb4',
    },
    entry: [
      {
        resource: {
          resourceType: 'Patient',
          id: 'patient-ms984210',
          identifier: [
            { system: 'https://medisage.health/patients', value: 'MS-984210' }
          ],
          name: [{ use: 'official', family: 'Vance', given: ['Eleanor'] }],
          gender: 'female',
          birthDate: dob,
          extension: [
            {
              url: 'https://medisage.health/fhir/StructureDefinition/blood-group',
              valueString: bloodGroup
            }
          ],
          contact: [
            {
              relationship: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0131', code: 'C', display: 'Emergency Contact' }] }],
              name: { family: 'Vance', given: ['Julian'] },
              telecom: [{ system: 'phone', value: '+1-555-438-9921', use: 'mobile' }]
            }
          ]
        }
      },
      {
        resource: {
          resourceType: 'Observation',
          id: 'obs-loinc-2093-3',
          status: 'final',
          category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'laboratory' }] }],
          code: { coding: [{ system: 'http://loinc.org', code: '2093-3', display: 'Cholesterol, Total' }] },
          valueQuantity: { value: 194, unit: 'mg/dL', system: 'http://unitsofmeasure.org', code: 'mg/dL' },
          referenceRange: [{ high: { value: 200, unit: 'mg/dL' } }],
          interpretation: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation', code: 'N', display: 'Normal' }] }]
        }
      },
      {
        resource: {
          resourceType: 'Observation',
          id: 'obs-loinc-18262-6',
          status: 'final',
          code: { coding: [{ system: 'http://loinc.org', code: '18262-6', display: 'LDL Cholesterol (Calculated)' }] },
          valueQuantity: { value: 118, unit: 'mg/dL', system: 'http://unitsofmeasure.org', code: 'mg/dL' },
          referenceRange: [{ high: { value: 100, unit: 'mg/dL' } }],
          interpretation: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation', code: 'H', display: 'Borderline High' }] }]
        }
      },
      {
        resource: {
          resourceType: 'Observation',
          id: 'obs-loinc-17856-6',
          status: 'final',
          code: { coding: [{ system: 'http://loinc.org', code: '17856-6', display: 'Hemoglobin A1c (HbA1c)' }] },
          valueQuantity: { value: 5.8, unit: '%', system: 'http://unitsofmeasure.org', code: '%' },
          referenceRange: [{ high: { value: 5.7, unit: '%' } }],
          interpretation: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation', code: 'H', display: 'Pre-diabetic' }] }]
        }
      },
      {
        resource: {
          resourceType: 'MedicationStatement',
          id: 'med-rxnorm-316152',
          status: 'active',
          medicationCodeableConcept: {
            coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '316152', display: 'Telmisartan 20mg Oral Tablet' }]
          },
          dosage: [{ text: '1 tablet once daily in the morning', timing: { repeat: { frequency: 1, period: 1, periodUnit: 'd' } } }]
        }
      },
      {
        resource: {
          resourceType: 'MedicationStatement',
          id: 'med-rxnorm-617314',
          status: 'active',
          medicationCodeableConcept: {
            coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '617314', display: 'Atorvastatin 10mg Oral Tablet' }]
          },
          dosage: [{ text: '1 tablet at bedtime', timing: { repeat: { frequency: 1, period: 1, periodUnit: 'd' } } }]
        }
      },
      {
        resource: {
          resourceType: 'AllergyIntolerance',
          id: 'allergy-penicillin',
          clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical', code: 'active' }] },
          verificationStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification', code: 'confirmed' }] },
          type: 'allergy',
          criticality: 'high',
          code: { coding: [{ system: 'http://snomed.info/sct', code: '764146007', display: 'Penicillin allergy' }] },
          reaction: [{ manifestation: [{ coding: [{ system: 'http://snomed.info/sct', code: '39579001', display: 'Anaphylaxis' }] }], severity: 'severe' }]
        }
      }
    ]
  };

  const handleDownloadFhirJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fhirBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `medisage_fhir_bundle_${patientName.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(fhirBundle, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 35, 16, 0.72)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          maxWidth: '860px',
          width: '100%',
          maxHeight: '92vh',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--color-border-mist)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            backgroundColor: '#0f3e17',
            color: '#ffffff',
            padding: '18px 26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileCode size={20} color="#a3d1ac" />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a3d1ac' }}>
                HL7 FHIR R4 &amp; MEDICAL PASSPORT
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>
                Interoperable Hospital Health Passport
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Tab switch */}
            <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.1)', padding: '3px', borderRadius: '8px' }}>
              <button
                onClick={() => setActiveTab('passport')}
                style={{
                  border: 'none',
                  backgroundColor: activeTab === 'passport' ? '#ffffff' : 'transparent',
                  color: activeTab === 'passport' ? '#0f3e17' : '#ffffff',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                Official Passport
              </button>
              <button
                onClick={() => setActiveTab('fhir-json')}
                style={{
                  border: 'none',
                  backgroundColor: activeTab === 'fhir-json' ? '#ffffff' : 'transparent',
                  color: activeTab === 'fhir-json' ? '#0f3e17' : '#ffffff',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                SMART FHIR (JSON)
              </button>
            </div>

            <button
              onClick={onClose}
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '26px 30px', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'passport' ? (
            <div>
              {/* Official Medical Passport Header */}
              <div
                style={{
                  border: '2px solid #0f3e17',
                  borderRadius: '16px',
                  padding: '24px',
                  backgroundColor: '#fbfdfb',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                  marginBottom: '20px',
                  position: 'relative',
                }}
              >
                {/* Hospital Seal Watermark */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1.5px solid #0f3e17', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.08em', color: '#0f3e17', textTransform: 'uppercase' }}>
                      MEDISAGE CLINICAL HEALTHCARE ALLIANCE
                    </span>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', color: '#0f3e17', margin: '2px 0 0 0' }}>
                      Official Patient Medical Passport
                    </h2>
                    <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>
                      Conforming to ONC Cures Act &amp; HL7 FHIR US-Core Implementation Guide
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#eaf4ec', padding: '4px 10px', borderRadius: '6px' }}>
                      <ShieldCheck size={14} color="#0f3e17" />
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f3e17' }}>VAULT CERTIFIED</span>
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#666', marginTop: '4px' }}>
                      Passport ID: <strong>MS-USA-984210</strong>
                    </div>
                  </div>
                </div>

                {/* Patient Summary Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '10.5px', color: '#666', textTransform: 'uppercase', fontWeight: 600 }}>FULL LEGAL NAME</span>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f3e17' }}>{patientName}</div>
                    <div style={{ fontSize: '12px', color: '#555' }}>DOB: {dob} (Age 37) • Female</div>
                  </div>

                  <div>
                    <span style={{ fontSize: '10.5px', color: '#666', textTransform: 'uppercase', fontWeight: 600 }}>BLOOD TYPE &amp; RESUSCITATION</span>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#b91c1c' }}>{bloodGroup}</div>
                    <div style={{ fontSize: '12px', color: '#555' }}>Full Code • Registered Organ Donor</div>
                  </div>

                  <div>
                    <span style={{ fontSize: '10.5px', color: '#666', textTransform: 'uppercase', fontWeight: 600 }}>ATTENDING CARDIOLOGIST</span>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f3e17' }}>Dr. Evelyn Reed, MD</div>
                    <div style={{ fontSize: '12px', color: '#555' }}>St. Jude Research Center</div>
                  </div>
                </div>

                {/* Clinical Observations Summary Table */}
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#0f3e17', display: 'block', marginBottom: '8px' }}>
                    Active Diagnostic Observations (LOINC Verified)
                  </span>
                  <div style={{ border: '1px solid #d5e6d8', borderRadius: '10px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                      <thead style={{ backgroundColor: '#eaf4ec', color: '#0f3e17', textAlign: 'left', fontWeight: 600 }}>
                        <tr>
                          <th style={{ padding: '8px 12px' }}>LOINC Code</th>
                          <th style={{ padding: '8px 12px' }}>Clinical Biomarker</th>
                          <th style={{ padding: '8px 12px' }}>Latest Value</th>
                          <th style={{ padding: '8px 12px' }}>Reference Standard</th>
                          <th style={{ padding: '8px 12px' }}>Interpretation</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #eef3ef' }}>
                          <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 600 }}>2093-3</td>
                          <td style={{ padding: '8px 12px' }}>Total Cholesterol</td>
                          <td style={{ padding: '8px 12px', fontWeight: 700 }}>194 mg/dL</td>
                          <td style={{ padding: '8px 12px', color: '#666' }}>&lt; 200 mg/dL</td>
                          <td style={{ padding: '8px 12px', color: '#16a34a', fontWeight: 600 }}>Optimal</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #eef3ef' }}>
                          <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 600 }}>18262-6</td>
                          <td style={{ padding: '8px 12px' }}>LDL Cholesterol (Calculated)</td>
                          <td style={{ padding: '8px 12px', fontWeight: 700 }}>118 mg/dL</td>
                          <td style={{ padding: '8px 12px', color: '#666' }}>&lt; 100 mg/dL</td>
                          <td style={{ padding: '8px 12px', color: '#b45309', fontWeight: 600 }}>Borderline</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #eef3ef' }}>
                          <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 600 }}>17856-6</td>
                          <td style={{ padding: '8px 12px' }}>Hemoglobin A1c (HbA1c)</td>
                          <td style={{ padding: '8px 12px', fontWeight: 700 }}>5.8 %</td>
                          <td style={{ padding: '8px 12px', color: '#666' }}>&lt; 5.7 %</td>
                          <td style={{ padding: '8px 12px', color: '#b45309', fontWeight: 600 }}>Borderline</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 600 }}>85354-9</td>
                          <td style={{ padding: '8px 12px' }}>Blood Pressure Panel</td>
                          <td style={{ padding: '8px 12px', fontWeight: 700 }}>128 / 82 mmHg</td>
                          <td style={{ padding: '8px 12px', color: '#666' }}>&lt; 120/80 mmHg</td>
                          <td style={{ padding: '8px 12px', color: '#16a34a', fontWeight: 600 }}>Controlled</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Active Regimen & Allergy Safeguard */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #d5e6d8', padding: '12px 14px', borderRadius: '10px' }}>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: '#0f3e17', display: 'block', marginBottom: '4px' }}>
                      ACTIVE PHARMACOTHERAPY (RxNorm)
                    </span>
                    <div style={{ fontSize: '12px', color: '#333' }}>• Telmisartan 20mg Tablet — 1 Tab Daily (Morning)</div>
                    <div style={{ fontSize: '12px', color: '#333' }}>• Atorvastatin 10mg Tablet — 1 Tab Bedtime</div>
                  </div>

                  <div style={{ backgroundColor: '#fee2e2', border: '1px solid #f87171', padding: '12px 14px', borderRadius: '10px' }}>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: '#991b1b', display: 'block', marginBottom: '4px' }}>
                      ALLERGY &amp; CONTRAINDICATION
                    </span>
                    <div style={{ fontSize: '12px', color: '#7f1d1d', fontWeight: 600 }}>⚠️ Penicillin (Severe Anaphylaxis)</div>
                    <div style={{ fontSize: '12px', color: '#7f1d1d' }}>⚠️ Sulfonamide Derivatives</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* FHIR JSON View */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', color: '#555' }}>
                  HL7 FHIR Release 4 (JSON Document Bundle):
                </span>
                <button
                  onClick={handleCopyJson}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #d0ded3',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: '#0f3e17',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {copied ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied!' : 'Copy FHIR JSON'}</span>
                </button>
              </div>

              <pre
                style={{
                  backgroundColor: '#0f1f14',
                  color: '#a3d1ac',
                  padding: '18px',
                  borderRadius: '12px',
                  fontSize: '11.5px',
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                  maxHeight: '440px',
                  lineHeight: 1.45,
                }}
              >
                {JSON.stringify(fhirBundle, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Action Bar */}
        <div
          style={{
            backgroundColor: '#f5f7f4',
            borderTop: '1px solid #e2ece4',
            padding: '14px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleDownloadFhirJson}
              style={{
                backgroundColor: '#0f3e17',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(15, 62, 23, 0.2)',
              }}
            >
              <Download size={14} />
              <span>Download FHIR R4 Bundle (.json)</span>
            </button>

            <button
              onClick={handlePrint}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d0ded3',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#0f3e17',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Printer size={14} />
              <span>Print Medical Passport</span>
            </button>
          </div>

          <span style={{ fontSize: '11.5px', color: '#666' }}>
            HL7® and FHIR® are registered trademarks of Health Level Seven International.
          </span>
        </div>
      </div>
    </div>
  );
};
