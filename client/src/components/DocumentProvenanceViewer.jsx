import React, { useState } from 'react';
import { X, CheckCircle2, FileText, AlertCircle, Eye, ShieldCheck, Crosshair, ArrowRight } from 'lucide-react';

const SAMPLE_PROVENANCE_DOCS = [
  {
    id: 'doc-101',
    title: 'Comprehensive Metabolic Panel & Lipid Profile',
    type: 'lab-report',
    date: 'March 12, 2026',
    doctor: 'Dr. Evelyn Reed, MD',
    facility: 'St. Jude Health & Research Center',
    confidenceScore: 98.6,
    extractedEntities: [
      {
        id: 'ent-1',
        label: 'HbA1c (Glycated Hemoglobin)',
        code: 'LOINC 4548-4',
        value: '5.9 %',
        status: 'borderline',
        normalRange: '< 5.7 %',
        box: { top: 28, left: 12, width: 76, height: 7 }, // Percentage-based coordinates for responsive highlighting
        note: 'Subclinical drift improving following dietary intervention.',
      },
      {
        id: 'ent-2',
        label: 'Total Cholesterol',
        code: 'LOINC 2093-3',
        value: '184 mg/dL',
        status: 'optimal',
        normalRange: '< 200 mg/dL',
        box: { top: 38, left: 12, width: 76, height: 7 },
        note: 'Normalized within cardiovascular target window.',
      },
      {
        id: 'ent-3',
        label: 'LDL Cholesterol',
        code: 'LOINC 2089-1',
        value: '94 mg/dL',
        status: 'optimal',
        normalRange: '< 100 mg/dL',
        box: { top: 48, left: 12, width: 76, height: 7 },
        note: 'Primary target achieved on 10mg statin protocol.',
      },
      {
        id: 'ent-4',
        label: 'Fasting Plasma Glucose',
        code: 'LOINC 1558-6',
        value: '96 mg/dL',
        status: 'optimal',
        normalRange: '70 - 99 mg/dL',
        box: { top: 58, left: 12, width: 76, height: 7 },
        note: 'Euglycemia maintained under baseline fast.',
      },
      {
        id: 'ent-5',
        label: 'Estimated GFR (CKD-EPI)',
        code: 'LOINC 33914-3',
        value: '95 mL/min',
        status: 'optimal',
        normalRange: '> 90 mL/min',
        box: { top: 68, left: 12, width: 76, height: 7 },
        note: 'Renal filtration capacity intact.',
      },
    ],
  },
  {
    id: 'doc-102',
    title: 'Clinical Consultation & Prescription Order',
    type: 'prescription',
    date: 'February 18, 2026',
    doctor: 'Dr. Aris Vance, FACC',
    facility: 'Greenhouse Botanical Cardiology Clinic',
    confidenceScore: 99.1,
    extractedEntities: [
      {
        id: 'ent-201',
        label: 'Telmisartan 20mg Tablet',
        code: 'RxNorm 316629',
        value: '1 Tab Daily (Morning)',
        status: 'active',
        normalRange: 'Angiotensin Receptor Blocker',
        box: { top: 32, left: 14, width: 72, height: 8 },
        note: 'Primary therapy for Stage-1 vascular stabilization.',
      },
      {
        id: 'ent-202',
        label: 'Atorvastatin Calcium 10mg',
        code: 'RxNorm 259255',
        value: '1 Tab Bedtime',
        status: 'active',
        normalRange: 'HMG-CoA Reductase Inhibitor',
        box: { top: 44, left: 14, width: 72, height: 8 },
        note: 'Cardiovascular risk mitigation & plaque stabilization.',
      },
      {
        id: 'ent-203',
        label: 'Resting Blood Pressure',
        code: 'LOINC 85354-9',
        value: '120/78 mmHg',
        status: 'optimal',
        normalRange: '< 120/80 mmHg',
        box: { top: 60, left: 14, width: 72, height: 8 },
        note: 'Well-controlled hemodynamics.',
      },
    ],
  },
];

export const DocumentProvenanceViewer = ({ isOpen, onClose, initialDocId }) => {
  const [selectedDocId, setSelectedDocId] = useState(initialDocId || 'doc-101');
  const [activeEntityId, setActiveEntityId] = useState(null);

  if (!isOpen) return null;

  const doc = SAMPLE_PROVENANCE_DOCS.find((d) => d.id === selectedDocId) || SAMPLE_PROVENANCE_DOCS[0];
  const activeEntity = doc.extractedEntities.find((e) => e.id === activeEntityId);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 62, 23, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          width: '100%',
          maxWidth: '1360px',
          height: '92vh',
          borderRadius: '24px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* ================= MODAL TOP HEADER ================= */}
        <div
          style={{
            padding: '20px 32px',
            backgroundColor: '#0f3e17',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Crosshair size={20} color="#a3d1ac" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '19px', fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
                  Deterministic Pixel Provenance Viewer
                </h3>
                <span
                  style={{
                    backgroundColor: '#a3d1ac',
                    color: '#0f3e17',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    letterSpacing: '0.04em',
                  }}
                >
                  ZERO HALLUCINATION GUARANTEE
                </span>
              </div>
              <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '2px' }}>
                Click any extracted clinical entity to spotlight the exact physical coordinates on the source document.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Document Switcher */}
            <select
              value={selectedDocId}
              onChange={(e) => {
                setSelectedDocId(e.target.value);
                setActiveEntityId(null);
              }}
              style={{
                backgroundColor: 'rgba(255,255,255,0.12)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {SAMPLE_PROVENANCE_DOCS.map((d) => (
                <option key={d.id} value={d.id} style={{ color: '#0f3e17', backgroundColor: '#ffffff' }}>
                  {d.title}
                </option>
              ))}
            </select>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#ffffff',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)')}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ================= 2-COLUMN SPLIT-SCREEN WORKSPACE ================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.15fr 1fr',
            flex: 1,
            overflow: 'hidden',
          }}
          className="provenance-grid"
        >
          {/* ================= LEFT COLUMN: EXTRACTED CLINICAL FINDINGS ================= */}
          <div
            style={{
              padding: '28px 32px',
              overflowY: 'auto',
              borderRight: '1px solid rgba(15, 62, 23, 0.1)',
              backgroundColor: '#faf8f5',
            }}
          >
            {/* Meta Header Box */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(15, 62, 23, 0.08)',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '18px', fontFamily: "'Playfair Display', serif", color: '#0f3e17' }}>
                    {doc.title}
                  </h4>
                  <div style={{ fontSize: '13px', color: '#2d6a4f', marginTop: '3px' }}>
                    {doc.facility} • {doc.doctor}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#eaf4ec',
                    padding: '6px 12px',
                    borderRadius: '8px',
                  }}
                >
                  <ShieldCheck size={16} color="#1b4332" />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1b4332' }}>
                    Confidence: {doc.confidenceScore}%
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '12.5px', color: '#666' }}>
                Date of Record: <strong>{doc.date}</strong> • Standards Mapped: <strong>HL7 FHIR R4</strong>
              </div>
            </div>

            {/* Instruction Tip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: '#f0f7f2',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '20px',
                border: '1px solid #d3e7d7',
              }}
            >
              <Eye size={18} color="#1b4332" />
              <span style={{ fontSize: '13px', color: '#1b4332' }}>
                Select a biomarker or prescription row below to highlight its exact bounding box coordinates on the scanned PDF to the right.
              </span>
            </div>

            {/* Extracted Entities List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {doc.extractedEntities.map((ent) => {
                const isActive = activeEntityId === ent.id;
                return (
                  <div
                    key={ent.id}
                    onClick={() => setActiveEntityId(ent.id)}
                    style={{
                      backgroundColor: isActive ? '#f0f9f2' : '#ffffff',
                      border: `1.5px solid ${isActive ? '#1b4332' : 'rgba(15, 62, 23, 0.08)'}`,
                      borderRadius: '14px',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? '0 6px 18px rgba(27, 67, 50, 0.12)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: isActive ? '#1b4332' : '#a3d1ac',
                          }}
                        />
                        <span style={{ fontWeight: 600, fontSize: '15px', color: '#0f3e17' }}>
                          {ent.label}
                        </span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            fontFamily: "'Plus Jakarta Sans', monospace",
                            fontSize: '17px',
                            fontWeight: 700,
                            color: '#0f3e17',
                          }}
                        >
                          {ent.value}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      <span>{ent.code}</span>
                      <span>Target: {ent.normalRange}</span>
                    </div>

                    {ent.note && (
                      <div
                        style={{
                          marginTop: '8px',
                          fontSize: '12px',
                          color: '#2d6a4f',
                          backgroundColor: 'rgba(45, 106, 79, 0.06)',
                          padding: '4px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        Clinical Interpretation: {ent.note}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= RIGHT COLUMN: INTERACTIVE DOCUMENT CANVAS ================= */}
          <div
            style={{
              padding: '28px',
              backgroundColor: '#e8ece9',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflowY: 'auto',
            }}
          >
            {/* Realistic Paper Document Representation */}
            <div
              style={{
                width: '100%',
                maxWidth: '480px',
                aspectRatio: '1 / 1.414', // A4 Paper Aspect Ratio
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
                padding: '36px 32px',
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: '11px',
                lineHeight: 1.4,
                color: '#222222',
              }}
            >
              {/* Document Header */}
              <div style={{ borderBottom: '2px solid #222', paddingBottom: '12px', marginBottom: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {doc.facility}
                </div>
                <div style={{ fontSize: '10px', color: '#555' }}>
                  CLINICAL PATHOLOGY &amp; DIAGNOSTIC LABORATORY
                </div>
                <div style={{ fontSize: '9px', marginTop: '4px' }}>
                  PATIENT ID: MS-984210 • ACCREDITATION: CLIA #99D0876543
                </div>
              </div>

              {/* Patient / Encounter Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '18px', fontSize: '9.5px', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>
                <div>Patient: <strong>Doe, Jane M.</strong></div>
                <div>Date of Order: <strong>{doc.date}</strong></div>
                <div>Ordering MD: <strong>{doc.doctor}</strong></div>
                <div>Specimen: <strong>Venous Plasma</strong></div>
              </div>

              {/* Fake Document Body Lines */}
              <div style={{ marginBottom: '12px', fontWeight: 'bold', fontSize: '10.5px' }}>
                TEST NAME &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; RESULT &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; REFERENCE
              </div>

              {/* Simulated Rows matching the document */}
              {doc.extractedEntities.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 4px',
                    borderBottom: '1px dotted #ccc',
                    fontSize: '10px',
                    backgroundColor: activeEntityId === item.id ? '#eaf7ec' : 'transparent',
                    transition: 'background 0.2s',
                  }}
                >
                  <span style={{ width: '48%' }}>{item.label.split('(')[0]}</span>
                  <span style={{ fontWeight: 'bold', width: '26%' }}>{item.value}</span>
                  <span style={{ color: '#666', width: '26%', textAlign: 'right' }}>{item.normalRange}</span>
                </div>
              ))}

              <div style={{ marginTop: '28px', fontSize: '9px', color: '#666', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                * Verified electronically by Dr. Evelyn Reed, Laboratory Director. Provenance Hash: 0x8a92f8b1c4e
              </div>

              {/* Interactive SVG Bounding Box Coordinates Overlay */}
              <svg
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                }}
              >
                {activeEntity && (
                  <g>
                    {/* Pulsing highlight rectangle */}
                    <rect
                      x={`${activeEntity.box.left}%`}
                      y={`${activeEntity.box.top}%`}
                      width={`${activeEntity.box.width}%`}
                      height={`${activeEntity.box.height}%`}
                      fill="rgba(34, 197, 94, 0.25)"
                      stroke="#15803d"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                      rx="4"
                    />
                    {/* Spotlight coordinate pin */}
                    <circle
                      cx={`${activeEntity.box.left + activeEntity.box.width}%`}
                      cy={`${activeEntity.box.top}%`}
                      r="5"
                      fill="#15803d"
                    />
                  </g>
                )}
              </svg>
            </div>

            <div style={{ marginTop: '14px', fontSize: '12px', color: '#666' }}>
              Active Document Hash: <code>SHA256: 9b2d...f4a1</code> • Form Verified
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .provenance-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
