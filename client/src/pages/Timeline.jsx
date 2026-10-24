import React, { useState, useEffect } from 'react';
import { DashboardNavbar } from '../components/DashboardNavbar';
import { Footer } from '../components/Footer';
import { PillBadge } from '../components/PillBadge';
import { BiomarkerTrajectoryDashboard } from '../components/BiomarkerTrajectoryDashboard';
import { DocumentProvenanceViewer } from '../components/DocumentProvenanceViewer';
import { Search, Check, AlertTriangle, Stethoscope } from 'lucide-react';
import { documentService } from '../services/api';

export const Timeline = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [provenanceOpen, setProvenanceOpen] = useState(false);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const data = await documentService.getAll();
      const sorted = (data || []).sort(
        (a, b) => new Date(b.documentDate || b.uploadDate) - new Date(a.documentDate || a.uploadDate)
      );
      setDocuments(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const biomarkerMilestones = [
    {
      date: 'March 12, 2026',
      title: 'Lipid & Metabolic Profile Check',
      doctor: 'Dr. Evelyn Reed, MD',
      hospital: 'St. Jude Health & Research Center',
      status: 'Stable',
      badgeVariant: 'sage',
      readings: [
        { label: 'Total Cholesterol', val: '215 mg/dL', alert: 'Mild Elevation' },
        { label: 'LDL Cholesterol', val: '138 mg/dL', alert: 'Initiated Statin' },
        { label: 'HbA1c', val: '5.8%', alert: 'Borderline Pre-diabetes' },
      ],
      notes: 'Advised daily soluble fiber protocols, Zone-2 steady state cardiovascular conditioning, and 10mg Atorvastatin.',
    },
    {
      date: 'February 18, 2026',
      title: 'Cardiology Screening & 2D Echo',
      doctor: 'Dr. Aris Vance, FACC',
      hospital: 'Greenhouse Botanical Cardiology Clinic',
      status: 'Controlled',
      badgeVariant: 'keylime',
      readings: [
        { label: 'Resting Blood Pressure', val: '128/82 mmHg', alert: 'Controlled Stage-1' },
        { label: 'Resting Heart Rate', val: '68 bpm', alert: 'Normal Sinus' },
        { label: 'LVEF', val: '62%', alert: 'Normal Ejection' },
      ],
      notes: 'Left ventricular function preserved. Telmisartan 20mg morning dose maintained with good tolerance.',
    },
    {
      date: 'January 08, 2026',
      title: 'Chest Radiograph (PA View)',
      doctor: 'Dr. Marcus Sterling, Radiologist',
      hospital: 'Apex Diagnostics & Imaging',
      status: 'Clear',
      badgeVariant: 'slate',
      readings: [
        { label: 'Lung Parenchyma', val: 'Clear Bilateral', alert: 'No Effusion' },
        { label: 'Cardiothoracic Ratio', val: '< 0.50', alert: 'Normal' },
      ],
      notes: 'No focal consolidation, pneumothorax, or cardiomegaly detected on radiologic evaluation.',
    },
    {
      date: 'November 25, 2025',
      title: 'Post-Op Surgical Discharge & Recovery',
      doctor: 'Dr. Clara Thorne, MS',
      hospital: 'Mercy Botanical Hospital',
      status: 'Resolved',
      badgeVariant: 'mint',
      readings: [
        { label: 'Surgical Incision', val: 'Fully Epithelialized', alert: 'Clean' },
        { label: 'Hepatic Enzymes', val: 'Normal LFT Range', alert: 'Optimal' },
      ],
      notes: 'Uncomplicated recovery following elective laparoscopic cholecystectomy. Transitioned to standard low-fat botanical diet.',
    },
  ];

  return (
    <div style={{ backgroundColor: 'var(--color-cream-paper)', minHeight: '100vh' }}>
      <DashboardNavbar />

      <main className="container" style={{ paddingTop: '42px', paddingBottom: '70px', maxWidth: '1240px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '35px' }}>
          <div>
            <span className="eyebrow-label">LONGITUDINAL HEALTH RECORD</span>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '44px',
                fontWeight: 300,
                color: 'var(--color-forest-ink)',
                margin: 0,
              }}
            >
              Clinical Timeline &amp; Biomarkers
            </h1>
            <p style={{ fontSize: '15px', color: '#555', marginTop: '6px' }}>
              A unified chronological history of clinical episodes, lab measurements, and medication milestones.
            </p>
          </div>

          <button
            onClick={() => setProvenanceOpen(true)}
            style={{
              backgroundColor: '#0f3e17',
              color: '#ffffff',
              border: 'none',
              padding: '11px 21px',
              borderRadius: 'var(--radius-badges)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(15, 62, 23, 0.18)',
            }}
          >
            <Search size={14} />
            <span>View Document Provenance</span>
          </button>
        </div>

        {/* LONGITUDINAL BIOMARKER TRAJECTORY & VELOCITY FORECASTER */}
        <BiomarkerTrajectoryDashboard />

        {/* SPLIT-SCREEN PROVENANCE VIEWER MODAL */}
        <DocumentProvenanceViewer
          isOpen={provenanceOpen}
          onClose={() => setProvenanceOpen(false)}
        />

        {/* VITALS OVERVIEW TILES */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '18px',
            marginBottom: '42px',
          }}
        >
          <div
            className="card-rounded"
            style={{
              backgroundColor: 'var(--color-keylime-wash)',
              borderRadius: 'var(--radius-cards)',
              padding: '24px',
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--color-forest-ink)', fontWeight: 600, textTransform: 'uppercase' }}>
              RESTING BLOOD PRESSURE
            </span>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 300, color: 'var(--color-forest-ink)', marginTop: '4px' }}>
              128/82 mmHg
            </div>
            <span style={{ fontSize: '12px', color: '#0f3e17', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Check size={12} strokeWidth={2.5} />
              <span>Controlled on Telmisartan 20mg</span>
            </span>
          </div>

          <div
            className="card-rounded"
            style={{
              backgroundColor: 'var(--color-mint-veil)',
              borderRadius: 'var(--radius-cards)',
              padding: '24px',
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--color-forest-ink)', fontWeight: 600, textTransform: 'uppercase' }}>
              FASTING GLYCEMIC (HbA1c)
            </span>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 300, color: 'var(--color-forest-ink)', marginTop: '4px' }}>
              5.8%
            </div>
            <span style={{ fontSize: '12px', color: '#b7791f', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={12} />
              <span>Pre-metabolic boundary (Review in 90d)</span>
            </span>
          </div>

          <div
            className="card-rounded"
            style={{
              backgroundColor: 'var(--color-slate-hush)',
              borderRadius: 'var(--radius-cards)',
              padding: '24px',
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--color-forest-ink)', fontWeight: 600, textTransform: 'uppercase' }}>
              KIDNEY FILTRATION (eGFR)
            </span>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 300, color: 'var(--color-forest-ink)', marginTop: '4px' }}>
              &gt; 90 mL/min
            </div>
            <span style={{ fontSize: '12px', color: '#0f3e17', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Check size={12} strokeWidth={2.5} />
              <span>Optimal renal capacity</span>
            </span>
          </div>
        </div>

        {/* TIMELINE LIST */}
        <div style={{ position: 'relative', paddingLeft: '28px' }}>
          {/* Vertical botanical stem line */}
          <div
            style={{
              position: 'absolute',
              left: '7px',
              top: '14px',
              bottom: '14px',
              width: '2px',
              backgroundColor: 'var(--color-sage-mist)',
            }}
          ></div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
            {biomarkerMilestones.map((item, index) => (
              <div key={index} style={{ position: 'relative' }}>
                {/* Stem Node Point */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-28px',
                    top: '8px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-forest-ink)',
                    border: '3px solid var(--color-cream-paper)',
                  }}
                ></div>

                {/* Event Card */}
                <div
                  className="card-rounded"
                  style={{
                    backgroundColor: 'var(--color-cream-paper)',
                    border: '1px solid var(--color-border-mist)',
                    borderRadius: 'var(--radius-cards)',
                    padding: '28px 35px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>
                        {item.date}
                      </span>
                      <PillBadge variant={item.badgeVariant} className="pill-badge-sm">
                        {item.status}
                      </PillBadge>
                    </div>

                    <span style={{ fontSize: '12px', color: 'var(--color-forest-ink)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Stethoscope size={13} color="var(--color-forest-ink)" />
                      <span>{item.doctor}</span>
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '26px',
                      fontWeight: 300,
                      color: 'var(--color-forest-ink)',
                      marginBottom: '4px',
                    }}
                  >
                    {item.title}
                  </h3>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '18px' }}>
                    {item.hospital}
                  </div>

                  {/* Biomarker Readings Pill Box */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${item.readings.length}, 1fr)`,
                      gap: '11px',
                      backgroundColor: 'var(--color-keylime-wash)',
                      padding: '14px',
                      borderRadius: '10px',
                      marginBottom: '14px',
                    }}
                  >
                    {item.readings.map((r, ri) => (
                      <div key={ri}>
                        <span style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>
                          {r.label}
                        </span>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-forest-ink)' }}>
                          {r.val}
                        </div>
                        <span style={{ fontSize: '10px', color: '#444' }}>
                          {r.alert}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#444', margin: 0 }}>
                    <strong>Clinical Note:</strong> {item.notes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
