import React, { useState } from 'react';
import { 
  X, AlertOctagon, PhoneCall, Heart, ShieldAlert, 
  Download, Printer, QrCode, CheckCircle2, Copy, Check, 
  ExternalLink, User, Calendar, Droplets, Pill, Stethoscope, Smartphone
} from 'lucide-react';

// Crisp SVG QR Code generator for emergency triage scanning
const EmergencyQRCode = ({ value, size = 140 }) => {
  // 21x21 standard QR grid simulation with finder patterns and clinical payload data
  const finderPattern = (startX, startY) => (
    <g>
      <rect x={startX} y={startY} width="7" height="7" fill="#000" />
      <rect x={startX + 1} y={startY + 1} width="5" height="5" fill="#fff" />
      <rect x={startX + 2} y={startY + 2} width="3" height="3" fill="#000" />
    </g>
  );

  return (
    <svg width={size} height={size} viewBox="0 0 25 25" style={{ display: 'block' }}>
      <rect width="25" height="25" fill="#ffffff" rx="2" />
      {finderPattern(2, 2)}
      {finderPattern(16, 2)}
      {finderPattern(2, 16)}

      {/* Timing and alignment patterns */}
      <line x1="9" y1="5" x2="15" y2="5" stroke="#000" strokeWidth="1" strokeDasharray="1 1" />
      <line x1="5" y1="9" x2="5" y2="15" stroke="#000" strokeWidth="1" strokeDasharray="1 1" />

      {/* Deterministic QR Data Bits */}
      <rect x="10" y="2" width="1" height="1" fill="#000" />
      <rect x="12" y="3" width="1" height="1" fill="#000" />
      <rect x="14" y="2" width="1" height="1" fill="#000" />
      <rect x="10" y="7" width="2" height="1" fill="#000" />
      <rect x="13" y="7" width="1" height="2" fill="#000" />

      <rect x="9" y="10" width="1" height="2" fill="#000" />
      <rect x="11" y="11" width="2" height="1" fill="#000" />
      <rect x="14" y="10" width="1" height="1" fill="#000" />
      <rect x="16" y="11" width="2" height="1" fill="#000" />
      <rect x="19" y="10" width="1" height="2" fill="#000" />

      <rect x="10" y="13" width="2" height="1" fill="#000" />
      <rect x="13" y="14" width="1" height="1" fill="#000" />
      <rect x="15" y="13" width="2" height="1" fill="#000" />

      <rect x="10" y="16" width="1" height="1" fill="#000" />
      <rect x="12" y="17" width="2" height="1" fill="#000" />
      <rect x="15" y="16" width="1" height="2" fill="#000" />
      <rect x="17" y="17" width="2" height="1" fill="#000" />
      <rect x="20" y="16" width="1" height="2" fill="#000" />

      <rect x="10" y="19" width="2" height="1" fill="#000" />
      <rect x="13" y="20" width="1" height="1" fill="#000" />
      <rect x="15" y="19" width="2" height="1" fill="#000" />
      <rect x="18" y="20" width="1" height="2" fill="#000" />

      {/* Center Medical Emblem */}
      <circle cx="12.5" cy="12.5" r="2.2" fill="#b91c1c" />
      <line x1="12.5" y1="11.2" x2="12.5" y2="13.8" stroke="#fff" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="11.2" y1="12.5" x2="13.8" y2="12.5" stroke="#fff" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
};

export const EmergencyModal = ({ user, isOpen, onClose }) => {
  const [activeView, setActiveView] = useState('pass'); // 'pass' | 'wallet'
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const patientName = user?.name || 'Eleanor Vance';
  const bloodGroup = user?.bloodGroup || 'O+ Positive';
  const dob = user?.dateOfBirth || 'June 14, 1988';
  const age = 37;
  const allergies = user?.allergies && user.allergies.length > 0 ? user.allergies : ['Penicillin (Severe Anaphylaxis)', 'Sulfonamides'];
  const chronicConditions = user?.chronicConditions && user.chronicConditions.length > 0 ? user.chronicConditions : ['Stage-1 Hypertension (Controlled)', 'Mild Dyslipidemia'];
  const medications = ['Telmisartan 20mg (Morning)', 'Atorvastatin 10mg (Bedtime)', 'Omega-3 1000mg'];
  const emergencyContact = user?.emergencyContact || {
    name: 'Julian Vance',
    relationship: 'Spouse',
    phone: '+1 (555) 438-9921',
  };
  const primaryPhysician = {
    name: 'Dr. Evelyn Reed, MD',
    specialty: 'Internal Medicine & Preventive Cardiology',
    facility: 'St. Jude Health & Research Center',
    phone: '+1 (555) 902-1144',
  };

  const handleCopyTriageLink = () => {
    navigator.clipboard.writeText(`https://medisage.health/ice/patient-ms984210`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 35, 16, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
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
          maxWidth: activeView === 'wallet' ? '640px' : '820px',
          width: '100%',
          maxHeight: '92vh',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
          border: '1.5px solid rgba(220, 38, 38, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transition: 'all 0.25s ease',
        }}
      >
        {/* ================= HIGH-VISIBILITY CLINICAL EMERGENCY BAR ================= */}
        <div
          style={{
            backgroundColor: '#991b1b', // Emergency Red
            color: '#ffffff',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                color: '#991b1b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              +
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fecaca' }}>
                UNIVERSAL MEDICAL EMERGENCY PASS (I.C.E.)
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
                First Responder &amp; Emergency Triage Protocol
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* View Switcher: [ Full Pass ] [ Wallet Card ] */}
            <div style={{ display: 'flex', backgroundColor: 'rgba(0,0,0,0.2)', padding: '3px', borderRadius: '8px' }}>
              <button
                onClick={() => setActiveView('pass')}
                style={{
                  border: 'none',
                  backgroundColor: activeView === 'pass' ? '#ffffff' : 'transparent',
                  color: activeView === 'pass' ? '#991b1b' : '#ffffff',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                Full Dossier
              </button>
              <button
                onClick={() => setActiveView('wallet')}
                style={{
                  border: 'none',
                  backgroundColor: activeView === 'wallet' ? '#ffffff' : 'transparent',
                  color: activeView === 'wallet' ? '#991b1b' : '#ffffff',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                Wallet Card
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

        {/* Offline Badge & Verification Header */}
        <div
          style={{
            backgroundColor: '#fffbeb',
            borderBottom: '1px solid #fde68a',
            padding: '8px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#92400e',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} color="#16a34a" />
            <span><strong>Offline Cached:</strong> Available without cellular or network connection.</span>
          </div>
          <span style={{ fontSize: '11px', color: '#b45309' }}>
            Last Synced: <strong>March 12, 2026</strong> • Vault ID: MS-984210
          </span>
        </div>

        {/* ================= MODAL BODY: VIEW 1 - FULL DOSSIER ================= */}
        {activeView === 'pass' ? (
          <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
            {/* Top Identity & Scannable QR Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 140px',
                gap: '20px',
                paddingBottom: '20px',
                borderBottom: '1px solid #f0ece1',
                marginBottom: '20px',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                  PATIENT FULL LEGAL NAME
                </span>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '28px',
                    fontWeight: 400,
                    color: '#0f3e17',
                    margin: '2px 0 10px 0',
                  }}
                >
                  {patientName}
                </h2>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '13px', color: '#444' }}>
                  <div>DOB: <strong>{dob}</strong> ({age} yrs)</div>
                  <div>Sex: <strong>Female</strong></div>
                  <div>Organ Donor: <strong>Yes (Registered)</strong></div>
                </div>

                {/* Blood Group Mega Badge */}
                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      backgroundColor: '#fee2e2',
                      border: '2px solid #ef4444',
                      borderRadius: '12px',
                      padding: '8px 16px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Droplets size={20} color="#b91c1c" />
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#991b1b', letterSpacing: '0.04em' }}>
                        BLOOD GROUP TYPE
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#991b1b', lineHeight: 1.1 }}>
                        {bloodGroup}
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: '11.5px', color: '#666', maxWidth: '180px', lineHeight: 1.3 }}>
                    Compatible with O+, O- Packed Red Blood Cells.
                  </span>
                </div>
              </div>

              {/* Triage Scannable QR Code */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '8px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    display: 'inline-block',
                  }}
                >
                  <EmergencyQRCode size={120} />
                </div>
                <div style={{ fontSize: '10px', color: '#666', marginTop: '6px', fontWeight: 600 }}>
                  SCAN FOR FULL EHR
                </div>
              </div>
            </div>

            {/* CRITICAL DRUG ALLERGIES (Crimson Warning Box) */}
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1.5px solid #f87171',
                borderRadius: '14px',
                padding: '16px 20px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <AlertOctagon size={18} color="#b91c1c" />
                <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#991b1b', letterSpacing: '0.04em' }}>
                  CRITICAL DRUG ALLERGIES &amp; CONTRAINDICATIONS
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {allergies.map((allergy, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: '#b91c1c',
                      color: '#ffffff',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>⚠️</span>
                    <span>{allergy}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '11px', color: '#7f1d1d', marginTop: '8px' }}>
                * Do NOT administer Beta-Lactam antibiotics or Sulfonamide derivatives without desensitization.
              </div>
            </div>

            {/* ACTIVE MEDICATIONS & CHRONIC CONDITIONS (2-COL) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              {/* Active Medications */}
              <div
                style={{
                  backgroundColor: '#f6faf6',
                  borderRadius: '14px',
                  padding: '16px 18px',
                  border: '1px solid #d2e7d7',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <Pill size={16} color="#0f3e17" />
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f3e17', textTransform: 'uppercase' }}>
                    Active Daily Regimen
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {medications.map((med, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: '12.5px',
                        color: '#1a3d22',
                        backgroundColor: '#ffffff',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #e1efe4',
                        fontWeight: 500,
                      }}
                    >
                      💊 {med}
                    </div>
                  ))}
                </div>
              </div>

              {/* Chronic Conditions */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '14px',
                  padding: '16px 18px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <Stethoscope size={16} color="#1e3a8a" />
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase' }}>
                    Active Problem List
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {chronicConditions.map((cond, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: '12.5px',
                        color: '#1e293b',
                        backgroundColor: '#ffffff',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontWeight: 500,
                      }}
                    >
                      🩺 {cond}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* IN CASE OF EMERGENCY (I.C.E.) CONTACT WITH 1-CLICK CALL */}
            <div
              style={{
                backgroundColor: '#f5f7f4',
                borderRadius: '14px',
                padding: '16px 20px',
                border: '1px solid #dce5dc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: '#444', letterSpacing: '0.04em' }}>
                  PRIMARY EMERGENCY CONTACT (I.C.E.)
                </span>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f3e17', marginTop: '2px' }}>
                  {emergencyContact.name} ({emergencyContact.relationship})
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {emergencyContact.phone}
                </div>
              </div>

              <a
                href={`tel:${emergencyContact.phone}`}
                style={{
                  backgroundColor: '#0f3e17',
                  color: '#ffffff',
                  textDecoration: 'none',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(15, 62, 23, 0.2)',
                }}
              >
                <PhoneCall size={16} />
                <span>Call Emergency Contact</span>
              </a>
            </div>
          </div>
        ) : (
          /* ================= MODAL BODY: VIEW 2 - PRINTABLE WALLET CARD ================= */
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
              Standard ISO/IEC 7810 ID-1 Physical Wallet Card (3.375" × 2.125"):
            </div>

            {/* Simulated Plastic Wallet Card */}
            <div
              id="emergency-wallet-card"
              style={{
                width: '100%',
                maxWidth: '480px',
                aspectRatio: '1.586 / 1',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)',
                color: '#ffffff',
                padding: '24px',
                boxSizing: 'border-box',
                boxShadow: '0 16px 36px rgba(0,0,0,0.25)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '18px', height: '18px', backgroundColor: '#ffffff', color: '#991b1b', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' }}>
                      +
                    </div>
                    <span style={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      MEDISAGE MEDICAL EMERGENCY ID
                    </span>
                  </div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 600, marginTop: '6px' }}>
                    {patientName}
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.85 }}>
                    DOB: {dob} • Vault ID: MS-984210
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '4px', borderRadius: '6px' }}>
                  <EmergencyQRCode size={64} />
                </div>
              </div>

              {/* Card Critical Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '12px', marginTop: '10px' }}>
                <div>
                  <span style={{ fontSize: '9px', textTransform: 'uppercase', opacity: 0.75, display: 'block' }}>
                    BLOOD GROUP
                  </span>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#fef08a' }}>
                    {bloodGroup}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '9px', textTransform: 'uppercase', opacity: 0.75, display: 'block' }}>
                    ALLERGIES
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#fee2e2' }}>
                    ⚠️ {allergies[0]}
                  </span>
                </div>
              </div>

              {/* Card Footer ICE Contact */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10.5px' }}>
                <span>ICE Contact: <strong>{emergencyContact.name} ({emergencyContact.relationship})</strong></span>
                <span>{emergencyContact.phone}</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL FOOTER ACTION TOOLBAR ================= */}
        <div
          style={{
            backgroundColor: '#f5f7f4',
            borderTop: '1px solid #e2ece4',
            padding: '14px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handlePrint}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d0ded3',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#0f3e17',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Printer size={15} />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={handleCopyTriageLink}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d0ded3',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#0f3e17',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {copiedLink ? <Check size={15} color="#16a34a" /> : <Copy size={15} />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Emergency URL'}</span>
            </button>
          </div>

          <div style={{ fontSize: '11.5px', color: '#666' }}>
            Protected under HIPAA § 164.510(b) for Emergency Treatment
          </div>
        </div>
      </div>
    </div>
  );
};
