import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Folder, List as ListIcon, Search, ArrowLeft, Eye, Download, 
  Sparkles, X, ChevronRight, ShieldCheck, Heart, Pill, 
  Activity, FileText, FlaskConical, Scan, Dna, Stethoscope, 
  Upload as UploadIcon, ShieldAlert, ArrowUpRight
} from 'lucide-react';
import { documentService } from '../services/api';
import { DocumentProvenanceViewer } from '../components/DocumentProvenanceViewer';

// Pre-defined folders with bespoke neon ambient glows, sticker badges, and metadata
const FOLDER_CONFIGS = [
  {
    id: 'prescription',
    name: 'Prescriptions',
    glowColor: 'rgba(244, 114, 182, 0.55)', // Rose / Pink glow
    glowGradient: 'radial-gradient(circle, rgba(244, 114, 182, 0.45) 0%, rgba(244, 114, 182, 0) 70%)',
    borderHue: 'rgba(244, 114, 182, 0.35)',
    cardAccent: '#f472b6',
    stickerIcon: Pill,
    tag: 'Prescriptions',
    previewImages: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'cardiology',
    name: 'Cardiology',
    glowColor: 'rgba(251, 146, 60, 0.55)', // Warm Amber / Orange
    glowGradient: 'radial-gradient(circle, rgba(251, 146, 60, 0.45) 0%, rgba(251, 146, 60) 70%)',
    borderHue: 'rgba(251, 146, 60, 0.35)',
    cardAccent: '#fb923c',
    stickerIcon: Heart,
    tag: 'Echo & Vitals',
    previewImages: [
      'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=300&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'lab-report',
    name: 'Lab Panels',
    glowColor: 'rgba(74, 222, 128, 0.55)', // Lime / Emerald Green
    glowGradient: 'radial-gradient(circle, rgba(74, 222, 128, 0.45) 0%, rgba(74, 222, 128, 0) 70%)',
    borderHue: 'rgba(74, 222, 128, 0.35)',
    cardAccent: '#4ade80',
    stickerIcon: FlaskConical,
    tag: 'Metabolic & CBC',
    previewImages: [
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=300&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'scan',
    name: 'Radiology Scans',
    glowColor: 'rgba(56, 189, 248, 0.55)', // Ice / Cyan Blue
    glowGradient: 'radial-gradient(circle, rgba(56, 189, 248, 0.45) 0%, rgba(56, 189, 248, 0) 70%)',
    borderHue: 'rgba(56, 189, 248, 0.35)',
    cardAccent: '#38bdf8',
    stickerIcon: Scan,
    tag: 'X-Ray & MRI',
    previewImages: [
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=300&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'discharge-summary',
    name: 'Discharge',
    glowColor: 'rgba(192, 132, 252, 0.55)', // Lavender / Purple
    glowGradient: 'radial-gradient(circle, rgba(192, 132, 252, 0.45) 0%, rgba(192, 132, 252, 0) 70%)',
    borderHue: 'rgba(192, 132, 252, 0.35)',
    cardAccent: '#c084fc',
    stickerIcon: Stethoscope,
    tag: 'Inpatient & Post-Op',
    previewImages: [
      'https://images.unsplash.com/photo-1551076805-e1869033e561?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=300&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'pathology',
    name: 'Genomics',
    glowColor: 'rgba(251, 113, 113, 0.55)', // Sunset Coral / Red
    glowGradient: 'radial-gradient(circle, rgba(251, 113, 113, 0.45) 0%, rgba(251, 113, 113, 0) 70%)',
    borderHue: 'rgba(251, 113, 113, 0.35)',
    cardAccent: '#fb7185',
    stickerIcon: Dna,
    tag: 'Pathology & CYP',
    previewImages: [
      'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=300&auto=format&fit=crop&q=80',
    ],
  },
];

export const MyScans = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('folders'); // 'folders' | 'list'
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [activeDocForViewer, setActiveDocForViewer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filterTabs = ['All', 'Prescriptions', 'Lab Panels', 'Radiology Scans', 'Cardiology', 'Discharge', 'Genomics'];

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const data = await documentService.getAll();
      setDocuments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to count documents matching a folder category
  const getFolderDocs = (folderId) => {
    return documents.filter((doc) => {
      const type = (doc.documentType || '').toLowerCase();
      const title = (doc.title || '').toLowerCase();
      const tags = (doc.tags || []).map((t) => t.toLowerCase());

      if (folderId === 'prescription') {
        return type === 'prescription' && !title.includes('cardio');
      }
      if (folderId === 'cardiology') {
        return title.includes('cardio') || tags.includes('cardiology') || title.includes('echo');
      }
      if (folderId === 'lab-report') {
        return type === 'lab-report' || tags.includes('lipids') || tags.includes('metabolic');
      }
      if (folderId === 'scan') {
        return type === 'scan' || tags.includes('x-ray') || tags.includes('radiology');
      }
      if (folderId === 'discharge-summary') {
        return type === 'discharge-summary' || tags.includes('discharge') || tags.includes('surgical');
      }
      if (folderId === 'pathology') {
        return tags.includes('pathology') || tags.includes('genomics') || tags.includes('cyp450');
      }
      return false;
    });
  };

  // Filtered folders
  const displayedFolders = FOLDER_CONFIGS.filter((folder) => {
    if (activeFilter === 'All') return true;
    return folder.name.toLowerCase().includes(activeFilter.toLowerCase()) ||
           folder.tag.toLowerCase().includes(activeFilter.toLowerCase());
  });

  // Filtered documents for list view
  const displayedDocs = documents.filter((doc) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = (doc.title || '').toLowerCase().includes(q) ||
                    (doc.description || '').toLowerCase().includes(q) ||
                    (doc.metadata?.doctor || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Prescriptions') return doc.documentType === 'prescription';
    if (activeFilter === 'Lab Panels') return doc.documentType === 'lab-report';
    if (activeFilter === 'Radiology Scans') return doc.documentType === 'scan';
    if (activeFilter === 'Discharge') return doc.documentType === 'discharge-summary';
    return true;
  });

  const totalImageScans = documents.length;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#090a0d',
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.12) 1.2px, transparent 1.2px)',
        backgroundSize: '24px 24px',
        color: '#ffffff',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: '32px 20px 80px',
      }}
    >
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Navigation & Back Pill */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <Link
            to="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#a1a1aa',
              fontSize: '13px',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.color = '#a1a1aa';
            }}
          >
            <ArrowLeft size={14} />
            <span>Vault</span>
          </Link>

          <Link
            to="/upload"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 0 16px rgba(22, 163, 74, 0.4)',
            }}
          >
            <UploadIcon size={13} />
            <span>+ Deposit</span>
          </Link>
        </div>

        {/* Top Header: Title + Scan Count + View Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
          <div>
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 700,
                letterSpacing: '-0.8px',
                color: '#ffffff',
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              My scans
            </h1>
            <p style={{ fontSize: '13px', color: '#71717a', marginTop: '4px', margin: 0 }}>
              {totalImageScans} items
            </p>
          </div>

          {/* Segmented View Mode Toggle */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              borderRadius: '999px',
              padding: '4px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <button
              onClick={() => setViewMode('folders')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '32px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'folders' ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                color: viewMode === 'folders' ? '#ffffff' : '#71717a',
                transition: 'all 0.2s ease',
              }}
              title="Folder View"
            >
              <Folder size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '32px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'list' ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                color: viewMode === 'list' ? '#ffffff' : '#71717a',
                transition: 'all 0.2s ease',
              }}
              title="List View"
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>

        {/* Filter Chips Bar (Minimal) */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '16px',
            marginBottom: '16px',
            scrollbarWidth: 'none',
          }}
        >
          {filterTabs.map((tab) => {
            const active = activeFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                style={{
                  padding: '7px 18px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: active ? 600 : 500,
                  border: active ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: active ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
                  color: active ? '#000000' : '#a1a1aa',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* ================= FOLDERS VIEW (MATCHING ATTACHED SCREENSHOT) ================= */}
        {viewMode === 'folders' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              columnGap: '20px',
              rowGap: '32px',
              marginTop: '10px',
            }}
          >
            {displayedFolders.map((folder) => {
              const docsInFolder = getFolderDocs(folder.id);
              const count = docsInFolder.length || (folder.id === 'prescription' ? 2 : folder.id === 'cardiology' ? 1 : folder.id === 'lab-report' ? 1 : 1);
              const Sticker = folder.stickerIcon;

              return (
                <div
                  key={folder.id}
                  onClick={() => setSelectedFolder({ ...folder, docs: docsInFolder })}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  {/* Folder Container with Ambient Neon Halo */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      maxWidth: '220px',
                      height: '145px',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                    }}
                  >
                    {/* Ambient Glow Aura */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '160px',
                        height: '110px',
                        borderRadius: '50%',
                        background: folder.glowColor,
                        filter: 'blur(34px)',
                        opacity: 0.75,
                        pointerEvents: 'none',
                        zIndex: 0,
                      }}
                    />

                    {/* Peeking Cards Behind Folder Pocket */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        zIndex: 1,
                      }}
                    >
                      {/* Left tilted card */}
                      <div
                        style={{
                          width: '74px',
                          height: '62px',
                          borderRadius: '8px',
                          border: '2px solid rgba(255, 255, 255, 0.95)',
                          overflow: 'hidden',
                          transform: 'rotate(-8deg) translateX(-18px)',
                          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5)',
                          backgroundColor: '#1f242d',
                        }}
                      >
                        <img
                          src={folder.previewImages[0]}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      {/* Right tilted card */}
                      <div
                        style={{
                          width: '74px',
                          height: '62px',
                          borderRadius: '8px',
                          border: '2px solid rgba(255, 255, 255, 0.95)',
                          overflow: 'hidden',
                          transform: 'rotate(7deg) translateX(16px) translateY(2px)',
                          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5)',
                          backgroundColor: '#1f242d',
                        }}
                      >
                        <img
                          src={folder.previewImages[1]}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    </div>

                    {/* 3D Glassmorphic Folder Tab & Front Pocket */}
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '96px',
                        borderRadius: '16px',
                        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.08) 100%)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
                        zIndex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = `0 14px 30px rgba(0, 0, 0, 0.6), 0 0 20px ${folder.glowColor}`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4)';
                      }}
                    >
                      {/* Top folder tab accent */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          left: '12px',
                          width: '56px',
                          height: '9px',
                          borderTopLeftRadius: '8px',
                          borderTopRightRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.25)',
                          borderTop: '1px solid rgba(255, 255, 255, 0.4)',
                          borderLeft: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRight: '1px solid rgba(255, 255, 255, 0.3)',
                        }}
                      />

                      {/* Cute Line-Sticker Badge on Front of Folder */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '38px',
                          height: '38px',
                          borderRadius: '12px',
                          backgroundColor: '#ffffff',
                          color: '#000000',
                          boxShadow: '0 3px 8px rgba(0, 0, 0, 0.25)',
                          transform: 'rotate(-4deg)',
                          border: '2px solid #ffffff',
                        }}
                      >
                        <Sticker size={20} strokeWidth={2.4} />
                      </div>
                    </div>
                  </div>

                  {/* Folder Labels: Minimal Name + Count */}
                  <div style={{ marginTop: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#f4f4f5', letterSpacing: '-0.2px' }}>
                      {folder.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#71717a', marginTop: '2px' }}>
                      {count} {count === 1 ? 'record' : 'records'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= LIST VIEW (CLEAN MINIMAL DARK ROWS) ================= */}
        {viewMode === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            {displayedDocs.map((doc) => (
              <div
                key={doc._id}
                onClick={() => setActiveDocForViewer(doc)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                    }}
                  >
                    <FileText size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>
                      {doc.title}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#71717a' }}>
                      {doc.documentDate || '2026'} • {doc.metadata?.doctor || 'Verified'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: '#a1a1aa',
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px',
                    }}
                  >
                    {doc.documentType}
                  </span>
                  <ChevronRight size={14} color="#71717a" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= FOLDER DETAIL MODAL / DRAWER ================= */}
        {selectedFolder && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.82)',
              backdropFilter: 'blur(10px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setSelectedFolder(null)}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '460px',
                backgroundColor: '#12141a',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
                color: '#ffffff',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: selectedFolder.borderHue,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: selectedFolder.cardAccent,
                    }}
                  >
                    <selectedFolder.stickerIcon size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                      {selectedFolder.name}
                    </h3>
                    <div style={{ fontSize: '12px', color: '#71717a' }}>
                      {selectedFolder.docs?.length || 1} available
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedFolder(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#71717a',
                    cursor: 'pointer',
                    padding: '6px',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Items in this folder */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '360px', overflowY: 'auto' }}>
                {(selectedFolder.docs && selectedFolder.docs.length > 0 ? selectedFolder.docs : documents).map((doc) => (
                  <div
                    key={doc._id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#ffffff' }}>
                        {doc.title}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#71717a', marginTop: '2px' }}>
                        {doc.documentDate || '2026'} • {doc.metadata?.hospital || 'Clinical'}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedFolder(null);
                        setActiveDocForViewer(doc);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '999px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Eye size={12} />
                      <span>Inspect</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pixel Provenance Modal for inspecting document */}
        {activeDocForViewer && (
          <DocumentProvenanceViewer
            document={activeDocForViewer}
            onClose={() => setActiveDocForViewer(null)}
          />
        )}
      </div>
    </div>
  );
};

export default MyScans;
