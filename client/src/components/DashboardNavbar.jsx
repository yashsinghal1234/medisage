import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FileText, Upload, Activity, TrendingUp, ShieldAlert, 
  Shield, QrCode, FileCode, Users, User, LogOut, HeartPulse, Check,
  Folder, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProfileSwitcher } from './ProfileSwitcher';
import { FhirPassportModal } from './FhirPassportModal';
import { Logo } from './Logo';

export const DashboardNavbar = ({ onOpenEmergencyModal, onOpenPassportModal }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Dropdown states with hover grace period (matching landing page Navbar.jsx)
  const [activeDropdown, setActiveDropdown] = useState(null); // 'records' | 'ai' | 'emergency' | 'profile' | null
  const closeTimeoutRef = useRef(null);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showInternalPassport, setShowInternalPassport] = useState(false);

  const handleOpenDropdown = (menu) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setActiveDropdown(menu);
  };

  const handleMouseLeaveNav = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const closeDropdownImmediately = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setActiveDropdown(null);
  };

  const handlePassportClick = () => {
    closeDropdownImmediately();
    if (onOpenPassportModal) {
      onOpenPassportModal();
    } else {
      setShowInternalPassport(true);
    }
  };

  const handleEmergencyClick = () => {
    closeDropdownImmediately();
    if (onOpenEmergencyModal) {
      onOpenEmergencyModal();
    }
  };

  return (
    <header
      onMouseLeave={handleMouseLeaveNav}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #efeeeb',
        paddingTop: '12px',
        paddingBottom: '12px',
        width: '100%',
        boxShadow: '0 2px 14px rgba(15, 62, 23, 0.04)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          paddingLeft: '32px',
          paddingRight: '32px',
          boxSizing: 'border-box',
        }}
      >
        {/* ================= LEFT: ONLY MEDICLE MD LOGO & STATUS ================= */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div onMouseEnter={closeDropdownImmediately} style={{ display: 'flex', alignItems: 'center' }}>
            <Logo size={25} fontSize="22px" color="#000000" to="/dashboard" />
          </div>

          {/* Minimal live vault active pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#eaf4ec',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#0f3e17',
              border: '1px solid #d5e7d9',
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
            <span>Vault Active</span>
          </div>
        </div>

        {/* ================= RIGHT: ALL DROPDOWNS + CTA + PROFILE ================= */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          {/* Grouped Nav Items */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* 1. Records & Vault Dropdown Trigger */}
            <div
              onMouseEnter={() => handleOpenDropdown('records')}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#0f3e17',
                cursor: 'pointer',
                padding: '8px 14px',
                borderRadius: '7.04px',
                backgroundColor: activeDropdown === 'records' ? '#9fbcc4' : 'transparent',
                transition: 'background-color 0.2s ease',
              }}
            >
              <span>Records &amp; Vault</span>
              <svg
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
                stroke="#0f3e17"
                strokeWidth="1.8"
                style={{
                  transform: activeDropdown === 'records' ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s ease',
                }}
              >
                <path d="M1 1L5 5L9 1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* 2. Clinical Intelligence Dropdown Trigger */}
            <div
              onMouseEnter={() => handleOpenDropdown('ai')}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#0f3e17',
                cursor: 'pointer',
                padding: '8px 14px',
                borderRadius: '7.04px',
                backgroundColor: activeDropdown === 'ai' ? '#9fbcc4' : 'transparent',
                transition: 'background-color 0.2s ease',
              }}
            >
              <span>Clinical Intelligence</span>
              <svg
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
                stroke="#0f3e17"
                strokeWidth="1.8"
                style={{
                  transform: activeDropdown === 'ai' ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s ease',
                }}
              >
                <path d="M1 1L5 5L9 1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* 3. Emergency & Passport Dropdown Trigger */}
            <div
              onMouseEnter={() => handleOpenDropdown('emergency')}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#0f3e17',
                cursor: 'pointer',
                padding: '8px 14px',
                borderRadius: '7.04px',
                backgroundColor: activeDropdown === 'emergency' ? '#9fbcc4' : 'transparent',
                transition: 'background-color 0.2s ease',
              }}
            >
              <span>Emergency &amp; Passport</span>
              <svg
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
                stroke="#0f3e17"
                strokeWidth="1.8"
                style={{
                  transform: activeDropdown === 'emergency' ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s ease',
                }}
              >
                <path d="M1 1L5 5L9 1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </nav>

          {/* Quick Primary Deposit Button */}
          <Link
            to="/upload"
            onMouseEnter={closeDropdownImmediately}
            style={{
              backgroundColor: '#0f3e17',
              color: '#fffefc',
              fontFamily: 'var(--font-suisse-intl)',
              fontSize: '13.5px',
              fontWeight: 500,
              padding: '9px 18px',
              borderRadius: '999px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(15, 62, 23, 0.16)',
            }}
          >
            <Upload size={13} />
            <span>+ Deposit Record</span>
          </Link>

          {/* Profile & Family Vault Trigger */}
          <div
            onMouseEnter={() => handleOpenDropdown('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: activeDropdown === 'profile' ? '#9fbcc4' : '#f5f7f4',
              border: '1px solid #dce8df',
              padding: '6px 14px',
              borderRadius: '999px',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#0f3e17',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              {user?.name ? user.name.charAt(0) : 'E'}
            </div>
            <span style={{ fontSize: '13.5px', color: '#0f3e17', fontWeight: 600 }}>
              {user?.name ? user.name.split(' ')[0] : 'Eleanor'}
            </span>
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              stroke="#0f3e17"
              strokeWidth="1.8"
              style={{
                transform: activeDropdown === 'profile' ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.25s ease',
              }}
            >
              <path d="M1 1L5 5L9 1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* ================= LANDING-PAGE STYLE FLOATING DROPDOWN CARD ================= */}
      <div
        onMouseEnter={() => {
          if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        }}
        onMouseLeave={handleMouseLeaveNav}
        style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          right: activeDropdown === 'profile' ? '32px' : '40px',
          transform: activeDropdown ? 'translateY(0)' : 'translateY(-10px)',
          opacity: activeDropdown ? 1 : 0,
          visibility: activeDropdown ? 'visible' : 'hidden',
          pointerEvents: activeDropdown ? 'auto' : 'none',
          transition: 'opacity 0.24s cubic-bezier(0.16, 1, 0.3, 1), transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.24s',
          width: activeDropdown === 'profile' ? '300px' : activeDropdown === 'emergency' ? '560px' : '780px',
          backgroundColor: '#fffefc',
          border: '1px solid #efeeeb',
          boxShadow: '0 16px 40px rgba(15, 62, 23, 0.08)',
          borderRadius: '16px',
          padding: '20px 24px',
          zIndex: 1000,
        }}
      >
        {/* DROPDOWN 1: RECORDS & VAULT */}
        {activeDropdown === 'records' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', width: '100%' }}>
            <Link
              to="/scans"
              onClick={closeDropdownImmediately}
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '10px 12px',
                borderRadius: '10px',
                backgroundColor: '#f4fbf5',
                border: '1px solid #dcf2e1',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eaf7ed')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f4fbf5')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Folder size={16} color="#16a34a" />
                <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#16a34a' }}>My Scans</span>
              </div>
              <span style={{ fontSize: '12px', color: '#555555', lineHeight: 1.35 }}>
                Visual 3D glowing folders for instant scan &amp; lab review.
              </span>
            </Link>

            <Link
              to="/dashboard"
              onClick={closeDropdownImmediately}
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '10px 12px',
                borderRadius: '10px',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7faf6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color="#0f3e17" />
                <span style={{ fontSize: '14.5px', fontWeight: 600, color: '#0f3e17' }}>Vault Overview</span>
              </div>
              <span style={{ fontSize: '12px', color: '#666666', lineHeight: 1.35 }}>
                Full archive of lab reports, prescriptions &amp; radiology scans.
              </span>
            </Link>

            <Link
              to="/upload"
              onClick={closeDropdownImmediately}
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '10px 12px',
                borderRadius: '10px',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7faf6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={16} color="#0f3e17" />
                <span style={{ fontSize: '14.5px', fontWeight: 600, color: '#0f3e17' }}>Deposit Record</span>
              </div>
              <span style={{ fontSize: '12px', color: '#666666', lineHeight: 1.35 }}>
                Multimodal upload with OCR and coordinate extraction.
              </span>
            </Link>

            <Link
              to="/timeline"
              onClick={closeDropdownImmediately}
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '10px 12px',
                borderRadius: '10px',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7faf6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} color="#0f3e17" />
                <span style={{ fontSize: '14.5px', fontWeight: 600, color: '#0f3e17' }}>Timeline &amp; Vitals</span>
              </div>
              <span style={{ fontSize: '12px', color: '#666666', lineHeight: 1.35 }}>
                Chronological health diary of vitals and physician encounters.
              </span>
            </Link>
          </div>
        )}

        {/* DROPDOWN 2: CLINICAL INTELLIGENCE */}
        {activeDropdown === 'ai' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', width: '100%' }}>
            <Link
              to="/ai-insights"
              onClick={closeDropdownImmediately}
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '10px 12px',
                borderRadius: '10px',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7faf6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={16} color="#0f3e17" />
                <span style={{ fontSize: '14.5px', fontWeight: 600, color: '#0f3e17' }}>Biomarker Forecaster</span>
              </div>
              <span style={{ fontSize: '12.5px', color: '#666666', lineHeight: 1.4 }}>
                Longitudinal velocity drift simulator projecting outcomes through 2027.
              </span>
            </Link>

            <Link
              to="/ai-insights"
              onClick={closeDropdownImmediately}
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '10px 12px',
                borderRadius: '10px',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7faf6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={16} color="#0f3e17" />
                <span style={{ fontSize: '14.5px', fontWeight: 600, color: '#0f3e17' }}>Drug Safety Guard</span>
              </div>
              <span style={{ fontSize: '12.5px', color: '#666666', lineHeight: 1.4 }}>
                Pharmacovigilance engine cross-checking CYP3A4 enzymes and allergy risks.
              </span>
            </Link>

            <Link
              to="/insurance"
              onClick={closeDropdownImmediately}
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '10px 12px',
                borderRadius: '10px',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7faf6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={16} color="#0f3e17" />
                <span style={{ fontSize: '14.5px', fontWeight: 600, color: '#0f3e17' }}>Insurance Match</span>
              </div>
              <span style={{ fontSize: '12.5px', color: '#666666', lineHeight: 1.4 }}>
                Clinical risk-matched health plans with $0 copay medication riders.
              </span>
            </Link>
          </div>
        )}

        {/* DROPDOWN 3: EMERGENCY & PASSPORT */}
        {activeDropdown === 'emergency' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', width: '100%' }}>
            <button
              onClick={handleEmergencyClick}
              style={{
                textAlign: 'left',
                background: 'none',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '10px 12px',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={16} color="#991b1b" />
                <span style={{ fontSize: '14.5px', fontWeight: 600, color: '#991b1b' }}>1-Click Emergency ICE Pass</span>
              </div>
              <span style={{ fontSize: '12.5px', color: '#666666', lineHeight: 1.4 }}>
                Offline scannable triage QR code, blood group compatibility &amp; 1-click dialer.
              </span>
            </button>

            <button
              onClick={handlePassportClick}
              style={{
                textAlign: 'left',
                background: 'none',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '10px 12px',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7faf6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCode size={16} color="#0f3e17" />
                <span style={{ fontSize: '14.5px', fontWeight: 600, color: '#0f3e17' }}>SMART on FHIR Passport</span>
              </div>
              <span style={{ fontSize: '12.5px', color: '#666666', lineHeight: 1.4 }}>
                Interoperable HL7 FHIR Release 4 document Bundle (JSON) &amp; official printable passport.
              </span>
            </button>
          </div>
        )}

        {/* DROPDOWN 4: USER & FAMILY PROFILE */}
        {activeDropdown === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
            {/* Active profile card */}
            <div style={{ padding: '8px 10px', backgroundColor: '#f6faf7', borderRadius: '10px', marginBottom: '6px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f3e17' }}>
                {user?.name || 'Eleanor Vance'}
              </div>
              <div style={{ fontSize: '11.5px', color: '#555', marginTop: '2px' }}>
                {user?.bloodGroup || 'O+ Positive'} • Primary Account
              </div>
            </div>

            <button
              onClick={() => {
                closeDropdownImmediately();
                setShowFamilyModal(true);
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                padding: '9px 10px',
                borderRadius: '8px',
                fontSize: '13.5px',
                color: '#0f3e17',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7faf6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Users size={15} color="#0f3e17" />
              <span>Switch Family Member...</span>
            </button>

            <Link
              to="/profile"
              onClick={closeDropdownImmediately}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 10px',
                borderRadius: '8px',
                fontSize: '13.5px',
                color: '#333',
                textDecoration: 'none',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7faf6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <User size={15} color="#666" />
              <span>Health Profile Settings</span>
            </Link>

            <Link
              to="/admin"
              onClick={closeDropdownImmediately}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 10px',
                borderRadius: '8px',
                fontSize: '13.5px',
                color: '#0f3e17',
                fontWeight: 600,
                textDecoration: 'none',
                backgroundColor: '#f6faf7',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eaf7ed')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f6faf7')}
            >
              <ShieldCheck size={15} color="#16a34a" />
              <span>Compliance &amp; Admin</span>
            </Link>

            <div style={{ borderTop: '1px solid #efeeeb', margin: '4px 0' }} />

            <button
              onClick={() => {
                closeDropdownImmediately();
                logout();
                navigate('/');
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                padding: '9px 10px',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#c0392b',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fee2e2')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <LogOut size={14} color="#c0392b" />
              <span>Sign Out of Vault</span>
            </button>
          </div>
        )}
      </div>

      {/* Global Modals */}
      <ProfileSwitcher
        isOpen={showFamilyModal}
        onClose={() => setShowFamilyModal(false)}
      />

      <FhirPassportModal
        user={user}
        isOpen={showInternalPassport}
        onClose={() => setShowInternalPassport(false)}
      />
    </header>
  );
};
