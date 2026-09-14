import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Activity, Pill, Eye, LayoutGrid, List, 
  Search, ShieldCheck, Download, Trash2, ArrowRight, Sparkles, ChevronRight, Stethoscope
} from 'lucide-react';
import { DashboardNavbar } from '../components/DashboardNavbar';
import { Footer } from '../components/Footer';
import { PillBadge, PrimaryButton } from '../components/PillBadge';
import { EmergencyModal } from '../components/EmergencyModal';
import { DocumentProvenanceViewer } from '../components/DocumentProvenanceViewer';
import { FhirPassportModal } from '../components/FhirPassportModal';
import { ProfileSwitcher } from '../components/ProfileSwitcher';
import { ClinicalSurveillanceReminders } from '../components/ClinicalSurveillanceReminders';
import { documentService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showProvenanceModal, setShowProvenanceModal] = useState(false);
  const [showPassportModal, setShowPassportModal] = useState(false);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [activeDocDetail, setActiveDocDetail] = useState(null);

  const filterTabs = [
    { id: 'all', label: 'All Records' },
    { id: 'prescription', label: 'Prescriptions' },
    { id: 'lab-report', label: 'Lab Reports' },
    { id: 'scan', label: 'Radiology Scans' },
    { id: 'discharge-summary', label: 'Discharge Summaries' },
  ];

  useEffect(() => {
    loadDocs();
  }, [selectedType, searchQuery]);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const data = await documentService.getAll({
        type: selectedType,
        search: searchQuery,
      });
      setDocuments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Remove this document from your botanical vault?')) {
      await documentService.delete(id);
      loadDocs();
      if (activeDocDetail?._id === id) setActiveDocDetail(null);
    }
  };

  // Stats calculation
  const totalDocs = documents.length;
  const rxCount = documents.filter((d) => d.documentType === 'prescription').length;
  const labCount = documents.filter((d) => d.documentType === 'lab-report').length;
  const scanCount = documents.filter((d) => d.documentType === 'scan').length;

  return (
    <div style={{ backgroundColor: 'var(--color-cream-paper)', minHeight: '100vh' }}>
      <DashboardNavbar 
        onOpenEmergencyModal={() => setShowEmergencyModal(true)} 
        onOpenPassportModal={() => setShowPassportModal(true)} 
      />

      <main className="container" style={{ paddingTop: '35px', paddingBottom: '70px' }}>
        {/* Welcome Greeting & Quick Summary */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '21px',
            marginBottom: '35px',
          }}
        >
          <div>
            <div style={{ marginBottom: '7px' }}>
              <span className="eyebrow-label">CLINICAL VAULT REPOSITORY</span>
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '44px',
                fontWeight: 300,
                color: 'var(--color-forest-ink)',
                margin: 0,
                lineHeight: 1.15,
              }}
            >
              Welcome, {user?.name || 'Eleanor'}
            </h1>
            <p style={{ fontSize: '15px', color: '#555', marginTop: '6px' }}>
              Here is your consolidated medical record archive, biomarker trends, and AI care summaries.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <PrimaryButton as={Link} href="/upload">
              + Deposit Record
            </PrimaryButton>
            <button
              onClick={() => setShowEmergencyModal(true)}
              style={{
                backgroundColor: '#991b1b',
                color: '#ffffff',
                border: 'none',
                padding: '13px 18px',
                borderRadius: 'var(--radius-badges)',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(153, 27, 27, 0.22)',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <span>🚨 1-Click ICE Pass</span>
            </button>
            <button
              onClick={() => setShowPassportModal(true)}
              style={{
                backgroundColor: '#ffffff',
                color: '#0f3e17',
                border: '1.5px solid #0f3e17',
                padding: '13px 18px',
                borderRadius: 'var(--radius-badges)',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(15, 62, 23, 0.08)',
              }}
            >
              <span>📑 Medical Passport (FHIR)</span>
            </button>
            <button
              onClick={() => setShowProvenanceModal(true)}
              style={{
                backgroundColor: '#eaf4ec',
                color: '#0f3e17',
                border: '1px solid #c8decb',
                padding: '13px 18px',
                borderRadius: 'var(--radius-badges)',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>🔍 Provenance Viewer</span>
            </button>
          </div>
        </div>

        {/* STATS TILES — Layered Tinted Surfaces */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '18px',
            marginBottom: '35px',
          }}
        >
          <div
            className="card-rounded"
            style={{
              backgroundColor: 'var(--color-keylime-wash)',
              borderRadius: 'var(--radius-cards)',
              padding: '24px',
              boxShadow: 'none',
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--color-forest-ink)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TOTAL ARCHIVED RECORDS
            </span>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 300, color: 'var(--color-forest-ink)', marginTop: '4px' }}>
              {totalDocs}
            </div>
            <span style={{ fontSize: '12px', color: '#555' }}>Fully indexed & searchable</span>
          </div>

          <div
            className="card-rounded"
            style={{
              backgroundColor: 'var(--color-mint-veil)',
              borderRadius: 'var(--radius-cards)',
              padding: '24px',
              boxShadow: 'none',
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--color-forest-ink)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              PRESCRIPTIONS (Rx)
            </span>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 300, color: 'var(--color-forest-ink)', marginTop: '4px' }}>
              {rxCount}
            </div>
            <span style={{ fontSize: '12px', color: '#555' }}>Active & historical medications</span>
          </div>

          <div
            className="card-rounded"
            style={{
              backgroundColor: 'var(--color-sage-mist)',
              borderRadius: 'var(--radius-cards)',
              padding: '24px',
              boxShadow: 'none',
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--color-forest-ink)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              LAB & BLOOD WORK
            </span>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 300, color: 'var(--color-forest-ink)', marginTop: '4px' }}>
              {labCount}
            </div>
            <span style={{ fontSize: '12px', color: '#555' }}>Metabolic, LFT, CBC, Lipids</span>
          </div>

          <div
            className="card-rounded"
            style={{
              backgroundColor: 'var(--color-slate-hush)',
              borderRadius: 'var(--radius-cards)',
              padding: '24px',
              boxShadow: 'none',
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--color-forest-ink)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              SCANS & IMAGING
            </span>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 300, color: 'var(--color-forest-ink)', marginTop: '4px' }}>
              {scanCount}
            </div>
            <span style={{ fontSize: '12px', color: '#555' }}>X-Ray, Echo, MRI, Ultrasound</span>
          </div>
        </div>

        {/* AUTOMATED PREVENTIVE SURVEILLANCE & RETEST SCHEDULE */}
        <ClinicalSurveillanceReminders />

        {/* SEARCH & FILTER BAR */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            marginBottom: '28px',
            paddingBottom: '21px',
            borderBottom: '1px solid var(--color-border-mist)',
          }}
        >
          {/* Category Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                style={{
                  backgroundColor: selectedType === tab.id ? 'var(--color-forest-ink)' : 'var(--color-keylime-wash)',
                  color: selectedType === tab.id ? 'var(--color-cream-paper)' : 'var(--color-forest-ink)',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-badges)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  fontWeight: selectedType === tab.id ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box & View Mode Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '280px', position: 'relative' }}>
              <Search size={14} color="#666" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search records, doctors, labs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-botanical"
                style={{ padding: '8px 14px 8px 34px', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            {/* View Toggle: Cards vs Registry Table */}
            <div style={{ display: 'flex', backgroundColor: '#eaf4ec', borderRadius: '8px', padding: '3px' }}>
              <button
                onClick={() => setViewMode('grid')}
                title="Visual Card View"
                style={{
                  backgroundColor: viewMode === 'grid' ? '#0f3e17' : 'transparent',
                  color: viewMode === 'grid' ? '#ffffff' : '#0f3e17',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  transition: 'all 0.15s',
                }}
              >
                <LayoutGrid size={13} />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                title="Clinical Registry Table View"
                style={{
                  backgroundColor: viewMode === 'table' ? '#0f3e17' : 'transparent',
                  color: viewMode === 'table' ? '#ffffff' : '#0f3e17',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  transition: 'all 0.15s',
                }}
              >
                <List size={13} />
                <span>Registry</span>
              </button>
            </div>
          </div>
        </div>

        {/* MAIN VAULT GRID & DETAILS SPLIT */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: activeDocDetail ? '1.25fr 1fr' : '1fr',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* Document Content */}
          <div>
            {loading ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#666' }}>
                <span className="eyebrow-label">LOADING CLINICAL VAULT...</span>
              </div>
            ) : documents.length === 0 ? (
              <div
                className="card-rounded"
                style={{
                  backgroundColor: 'var(--color-keylime-wash)',
                  padding: '42px',
                  textAlign: 'center',
                }}
              >
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 300, color: 'var(--color-forest-ink)' }}>
                  No medical records found
                </h3>
                <p style={{ fontSize: '14px', color: '#555', marginTop: '7px', marginBottom: '21px' }}>
                  Upload your first prescription, lab report, or diagnostic imaging file to begin.
                </p>
                <PrimaryButton as={Link} href="/upload">
                  Deposit Record
                </PrimaryButton>
              </div>
            ) : viewMode === 'grid' ? (
              /* ================= 1. VISUAL CARDS GRID (LOW TEXT, HIGH SIGNAL) ================= */
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: activeDocDetail ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))',
                  gap: '16px',
                }}
              >
                {documents.map((doc) => {
                  const isSelected = activeDocDetail?._id === doc._id;
                  const isLab = doc.documentType === 'lab-report';
                  const isRx = doc.documentType === 'prescription';
                  const isScan = doc.documentType === 'scan';

                  return (
                    <div
                      key={doc._id}
                      onClick={() => setActiveDocDetail(doc)}
                      style={{
                        backgroundColor: isSelected ? '#f2f8f4' : '#ffffff',
                        border: isSelected ? '2px solid #0f3e17' : '1px solid #dce8df',
                        borderRadius: '16px',
                        padding: '18px 20px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(15, 62, 23, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.borderColor = '#0f3e17';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.borderColor = '#dce8df';
                      }}
                    >
                      <div>
                        {/* Card Header Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '8px',
                                backgroundColor: isLab ? '#e0f2fe' : isRx ? '#dcfce7' : isScan ? '#f3e8ff' : '#eaf4ec',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {isLab ? <Activity size={15} color="#0369a1" /> : isRx ? <Pill size={15} color="#15803d" /> : isScan ? <Eye size={15} color="#7e22ce" /> : <FileText size={15} color="#0f3e17" />}
                            </div>

                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                color: isLab ? '#0369a1' : isRx ? '#15803d' : isScan ? '#7e22ce' : '#0f3e17',
                                letterSpacing: '0.04em',
                              }}
                            >
                              {doc.documentType.replace('-', ' ')}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11.5px', color: '#777' }}>
                              {new Date(doc.documentDate || doc.uploadDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>

                            <button
                              onClick={(e) => handleDelete(doc._id, e)}
                              title="Delete Record"
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#aaa',
                                fontSize: '14px',
                                cursor: 'pointer',
                                padding: '2px 4px',
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Document Title */}
                        <h4
                          style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#0f3e17',
                            margin: '0 0 6px 0',
                            lineHeight: 1.25,
                          }}
                        >
                          {doc.title}
                        </h4>

                        {/* Clinician line */}
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '14px' }}>
                          🩺 {doc.metadata?.doctor || 'Attending Physician'} • {doc.metadata?.hospital || 'Clinical Diagnostic Center'}
                        </div>

                        {/* VISUAL HIGHLIGHTS: Key Biomarker Pills or Medication Badges (NO WALL OF TEXT!) */}
                        {doc.metadata?.biomarkers && doc.metadata.biomarkers.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                            {doc.metadata.biomarkers.slice(0, 3).map((b, i) => {
                              const isBad = b.status === 'elevated' || b.status === 'borderline' || b.status === 'high';
                              return (
                                <div
                                  key={i}
                                  style={{
                                    backgroundColor: isBad ? '#fef3c7' : '#eaf4ec',
                                    border: isBad ? '1px solid #fde68a' : '1px solid #d5e6d8',
                                    borderRadius: '6px',
                                    padding: '3px 8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontSize: '11px',
                                    color: isBad ? '#92400e' : '#0f3e17',
                                    fontWeight: 600,
                                  }}
                                >
                                  <span>{b.name}:</span>
                                  <strong>{b.value}</strong>
                                  <span style={{ fontSize: '9px', opacity: 0.85 }}>{isBad ? '▲' : '●'}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : doc.metadata?.medications && doc.metadata.medications.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                            {doc.metadata.medications.slice(0, 2).map((m, i) => (
                              <div
                                key={i}
                                style={{
                                  backgroundColor: '#f0fdf4',
                                  border: '1px solid #bbf7d0',
                                  borderRadius: '6px',
                                  padding: '3px 8px',
                                  fontSize: '11.5px',
                                  color: '#166534',
                                  fontWeight: 600,
                                }}
                              >
                                💊 {m}
                              </div>
                            ))}
                          </div>
                        ) : doc.metadata?.diagnosis ? (
                          <div
                            style={{
                              backgroundColor: '#f6faf7',
                              border: '1px solid #dce8df',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '11.5px',
                              color: '#0f3e17',
                              marginBottom: '14px',
                            }}
                          >
                            Dx: {doc.metadata.diagnosis}
                          </div>
                        ) : null}
                      </div>

                      {/* Card Action Footer */}
                      <div
                        style={{
                          borderTop: '1px solid #edf2ee',
                          paddingTop: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowProvenanceModal(true);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0f3e17',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px',
                          }}
                        >
                          <Eye size={13} />
                          <span>Provenance</span>
                        </button>

                        <div
                          style={{
                            fontSize: '12px',
                            color: '#0f3e17',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                          }}
                        >
                          <span>Inspect</span>
                          <ChevronRight size={13} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ================= 2. COMPACT CLINICAL REGISTRY TABLE ================= */
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #dce8df',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(15, 62, 23, 0.04)',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead style={{ backgroundColor: '#f6faf7', borderBottom: '1px solid #dce8df', color: '#0f3e17', textAlign: 'left', fontWeight: 600 }}>
                    <tr>
                      <th style={{ padding: '12px 16px' }}>Category</th>
                      <th style={{ padding: '12px 16px' }}>Record Title &amp; Facility</th>
                      <th style={{ padding: '12px 16px' }}>Date</th>
                      <th style={{ padding: '12px 16px' }}>Clinical Indicators</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => {
                      const isSelected = activeDocDetail?._id === doc._id;
                      const isLab = doc.documentType === 'lab-report';
                      const isRx = doc.documentType === 'prescription';
                      return (
                        <tr
                          key={doc._id}
                          onClick={() => setActiveDocDetail(doc)}
                          style={{
                            borderBottom: '1px solid #eef3ef',
                            backgroundColor: isSelected ? '#f2f8f4' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s',
                          }}
                          onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#fafcfa'; }}
                          onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <td style={{ padding: '12px 16px' }}>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                backgroundColor: isLab ? '#e0f2fe' : isRx ? '#dcfce7' : '#eaf4ec',
                                color: isLab ? '#0369a1' : isRx ? '#15803d' : '#0f3e17',
                              }}
                            >
                              {doc.documentType.replace('-', ' ')}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: 600, color: '#0f3e17' }}>{doc.title}</div>
                            <div style={{ fontSize: '11.5px', color: '#666' }}>{doc.metadata?.hospital || 'Clinical Facility'}</div>
                          </td>
                          <td style={{ padding: '12px 16px', color: '#555' }}>
                            {new Date(doc.documentDate || doc.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {doc.metadata?.biomarkers ? (
                              <span style={{ fontSize: '12px', color: '#0f3e17', fontWeight: 600 }}>
                                {doc.metadata.biomarkers.map(b => `${b.name} ${b.value}`).slice(0, 2).join(' • ')}
                              </span>
                            ) : doc.metadata?.medications ? (
                              <span style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>
                                💊 {doc.metadata.medications.slice(0, 2).join(', ')}
                              </span>
                            ) : (
                              <span style={{ fontSize: '12px', color: '#666' }}>Verified</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowProvenanceModal(true);
                              }}
                              style={{ background: 'none', border: 'none', color: '#0f3e17', fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginRight: '10px' }}
                            >
                              Provenance
                            </button>
                            <button
                              onClick={(e) => handleDelete(doc._id, e)}
                              style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ================= 3. ENHANCED VISUAL DIAGNOSTIC SLIP (PREVIEW DRAWER) ================= */}
          {activeDocDetail && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                border: '1.5px solid #0f3e17',
                boxShadow: '0 8px 30px rgba(15, 62, 23, 0.08)',
                padding: '24px',
                position: 'sticky',
                top: '90px',
              }}
            >
              {/* Slip Header Banner */}
              <div
                style={{
                  borderBottom: '1.5px solid #0f3e17',
                  paddingBottom: '14px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#eaf4ec', padding: '3px 8px', borderRadius: '4px', marginBottom: '4px' }}>
                    <ShieldCheck size={12} color="#0f3e17" />
                    <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#0f3e17', textTransform: 'uppercase' }}>
                      AUTHENTICATED VAULT DOSSIER
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#0f3e17', margin: '2px 0 0 0' }}>
                    {activeDocDetail.title}
                  </h3>
                  <div style={{ fontSize: '11.5px', color: '#666' }}>
                    {activeDocDetail.metadata?.hospital || 'Clinical Diagnostic Center'}
                  </div>
                </div>

                <button
                  onClick={() => setActiveDocDetail(null)}
                  style={{ background: 'none', border: 'none', fontSize: '16px', color: '#666', cursor: 'pointer', padding: '4px' }}
                >
                  ✕
                </button>
              </div>

              {/* Clinician Metadata Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', backgroundColor: '#f6faf7', padding: '12px 14px', borderRadius: '10px', marginBottom: '18px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#777', textTransform: 'uppercase', fontWeight: 600 }}>ATTENDING DOCTOR</span>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f3e17' }}>
                    {activeDocDetail.metadata?.doctor || 'Attending Physician'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#777', textTransform: 'uppercase', fontWeight: 600 }}>DOCUMENT DATE</span>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f3e17' }}>
                    {activeDocDetail.documentDate || 'March 2026'}
                  </div>
                </div>
              </div>

              {/* VISUAL BIOMARKER RANGE METERS (Instead of plain text table!) */}
              {activeDocDetail.metadata?.biomarkers && activeDocDetail.metadata.biomarkers.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#0f3e17', display: 'block', marginBottom: '8px' }}>
                    EXTRACTED BIOMARKER REFERENCE GAUGES
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {activeDocDetail.metadata.biomarkers.map((b, i) => {
                      const isElevated = b.status === 'elevated' || b.status === 'borderline' || b.status === 'high';
                      return (
                        <div
                          key={i}
                          style={{
                            backgroundColor: '#fbfdfb',
                            border: '1px solid #dce8df',
                            borderRadius: '8px',
                            padding: '10px 12px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#333' }}>{b.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ fontSize: '13px', color: isElevated ? '#92400e' : '#166534' }}>{b.value}</strong>
                              <span
                                style={{
                                  fontSize: '9.5px',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  backgroundColor: isElevated ? '#fef3c7' : '#dcfce7',
                                  color: isElevated ? '#92400e' : '#166534',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                }}
                              >
                                {b.status}
                              </span>
                            </div>
                          </div>

                          {/* Visual Gradient Reference Range Bar */}
                          <div style={{ width: '100%', height: '6px', backgroundColor: '#e5e7eb', borderRadius: '999px', position: 'relative', overflow: 'hidden' }}>
                            <div
                              style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: isElevated ? '78%' : '45%',
                                backgroundColor: isElevated ? '#f59e0b' : '#22c55e',
                                borderRadius: '999px',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Medications Tag Cloud */}
              {activeDocDetail.metadata?.medications && activeDocDetail.metadata.medications.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#0f3e17', display: 'block', marginBottom: '6px' }}>
                    ACTIVE REGIMEN
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {activeDocDetail.metadata.medications.map((m, i) => (
                      <span
                        key={i}
                        style={{
                          backgroundColor: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          color: '#166534',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          padding: '4px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        💊 {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                <button
                  onClick={() => setShowProvenanceModal(true)}
                  style={{
                    backgroundColor: '#0f3e17',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Eye size={14} />
                  <span>Inspect Optical Provenance</span>
                </button>

                <Link
                  to="/ai-insights"
                  style={{
                    backgroundColor: '#eaf4ec',
                    color: '#0f3e17',
                    textAlign: 'center',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={14} />
                  <span>AI Trajectory Forecaster</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <EmergencyModal
        user={user}
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
      />

      <DocumentProvenanceViewer
        isOpen={showProvenanceModal}
        onClose={() => setShowProvenanceModal(false)}
      />

      <FhirPassportModal
        user={user}
        isOpen={showPassportModal}
        onClose={() => setShowPassportModal(false)}
      />

      <ProfileSwitcher
        isOpen={showProfileSwitcher}
        onClose={() => setShowProfileSwitcher(false)}
      />

      <Footer />
    </div>
  );
};
