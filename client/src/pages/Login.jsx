import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, ShieldCheck, ArrowRight, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  // Mode: 'signin' | 'signup'
  const isRegisterRoute = location.pathname === '/register';
  const [activeTab, setActiveTab] = useState(isRegisterRoute ? 'signup' : 'signin');

  useEffect(() => {
    if (location.pathname === '/register') {
      setActiveTab('signup');
    } else if (location.pathname === '/login') {
      setActiveTab('signin');
    }
  }, [location.pathname]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setErrorMessage('');
    window.history.replaceState(null, '', tab === 'signup' ? '/register' : '/login');
  };

  // Sign In States
  const [signInEmail, setSignInEmail] = useState('eleanor.vance@medisage.health');
  const [signInPassword, setSignInPassword] = useState('clinical2026');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up States
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient', // 'patient' | 'clinician'
    bloodGroup: 'O+ Positive',
    agreeTerms: true,
  });
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // General States
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password strength helper
  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };
  const passStrength = getPasswordStrength(signUpData.password);

  // Handle Sign In Submit
  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);
    try {
      await login(signInEmail, signInPassword);
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage('Invalid credentials or authentication error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Sign Up Submit
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!signUpData.agreeTerms) {
      setErrorMessage('Please accept the HIPAA terms of service to initialize your health vault.');
      return;
    }
    setErrorMessage('');
    setSubmitting(true);
    try {
      await register({
        name: signUpData.name,
        email: signUpData.email,
        password: signUpData.password,
        role: signUpData.role,
        bloodGroup: signUpData.bloodGroup,
      });
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage('Registration error. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Instant Demo Login
  const handleDemoAccess = async () => {
    setSubmitting(true);
    try {
      await login('eleanor.vance@medisage.health', 'demo');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-cream-paper, #faf8f5)',
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
      }}
    >
      {/* ================= COMPACT TOP BRAND BAR ================= */}
      <header
        style={{
          padding: '14px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          boxSizing: 'border-box',
          maxWidth: '1160px',
          margin: '0 auto',
          flexShrink: 0,
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '7px',
              backgroundColor: '#0f3e17',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontFamily: "'Playfair Display', serif",
              fontSize: '15px',
              fontWeight: 'bold',
            }}
          >
            M
          </div>
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '21px',
              fontWeight: 400,
              color: '#0f3e17',
              letterSpacing: '-0.02em',
            }}
          >
            medisage
          </span>
        </Link>

        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            color: '#1b4332',
            textDecoration: 'none',
            fontSize: '12.5px',
            fontWeight: 500,
            padding: '6px 14px',
            borderRadius: '999px',
            backgroundColor: '#eaf4ec',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dbeee0')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#eaf4ec')}
        >
          <span>←</span>
          <span>Back to Home</span>
        </Link>
      </header>

      {/* ================= CENTER AUTH WORKSPACE (FITS 100% IN SCREEN VIEW) ================= */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px 24px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            maxWidth: '1080px',
            width: '100%',
            height: '100%',
            maxHeight: '570px',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 16px 44px rgba(15, 62, 23, 0.08)',
            border: '1px solid rgba(15, 62, 23, 0.1)',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: '1fr 1.22fr',
            boxSizing: 'border-box',
          }}
          className="auth-container-grid"
        >
          {/* ================= LEFT COLUMN: CLEAN EDITORIAL ARTWORK & STORY ================= */}
          <div
            style={{
              backgroundImage: "url('/auth_hero.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
              padding: '36px 36px 28px 36px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top Typography directly on sage polka dot paper texture */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#0f3e17',
                  color: '#ffffff',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  marginBottom: '16px',
                  boxShadow: '0 2px 8px rgba(15, 62, 23, 0.16)',
                }}
              >
                <ShieldCheck size={13} color="#a3d1ac" />
                <span style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  256-Bit Encrypted Vault
                </span>
              </div>

              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '28px',
                  fontWeight: 400,
                  lineHeight: 1.18,
                  color: '#0a2e12',
                  letterSpacing: '-0.02em',
                  margin: '0 0 10px 0',
                  maxWidth: '350px',
                }}
              >
                Your complete health history, unified in serene clarity.
              </h2>

              <p
                style={{
                  fontSize: '13px',
                  lineHeight: 1.5,
                  color: '#13391b',
                  margin: 0,
                  maxWidth: '330px',
                  fontWeight: 500,
                }}
              >
                Decoupled personal health records with automated lab parsing, deterministic provenance, and predictive biomarker modeling.
              </p>
            </div>

            {/* Bottom Subtle Security Pill (clinician is 100% visible & unblocked) */}
            <div
              style={{
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(8px)',
                padding: '6px 14px',
                borderRadius: '999px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.7)',
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#0f3e17', letterSpacing: '0.02em' }}>
                HIPAA Certified • Provenance Traceable
              </span>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: REDESIGNED AUTH EXPERIENCE ================= */}
          <div
            style={{
              padding: '28px 36px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflowY: 'auto',
              boxSizing: 'border-box',
            }}
          >
            {/* Header with Segmented Pill Switcher */}
            <div style={{ marginBottom: '14px' }}>
              <div
                style={{
                  display: 'flex',
                  backgroundColor: '#f1f5f2',
                  padding: '3px',
                  borderRadius: '12px',
                  border: '1px solid #e1ebe3',
                  marginBottom: '16px',
                }}
              >
                <button
                  type="button"
                  onClick={() => switchTab('signin')}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    borderRadius: '9px',
                    border: 'none',
                    backgroundColor: activeTab === 'signin' ? '#ffffff' : 'transparent',
                    color: activeTab === 'signin' ? '#0f3e17' : '#57715c',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '13.5px',
                    fontWeight: activeTab === 'signin' ? 600 : 500,
                    boxShadow: activeTab === 'signin' ? '0 2px 6px rgba(15, 62, 23, 0.08)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Sign In to Vault
                </button>

                <button
                  type="button"
                  onClick={() => switchTab('signup')}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    borderRadius: '9px',
                    border: 'none',
                    backgroundColor: activeTab === 'signup' ? '#ffffff' : 'transparent',
                    color: activeTab === 'signup' ? '#0f3e17' : '#57715c',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '13.5px',
                    fontWeight: activeTab === 'signup' ? 600 : 500,
                    boxShadow: activeTab === 'signup' ? '0 2px 6px rgba(15, 62, 23, 0.08)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Create Account
                </button>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '22px',
                    fontWeight: 400,
                    color: '#0f3e17',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {activeTab === 'signin' ? 'Welcome back to your vault' : 'Create your personal vault'}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#556d58', lineHeight: 1.4 }}>
                  {activeTab === 'signin'
                    ? 'Enter your clinical credentials to access your records and AI insights.'
                    : 'Initialize patient-owned health records with 256-bit encryption.'}
                </p>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #f87171',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#991b1b',
                  fontSize: '12px',
                  marginBottom: '12px',
                  lineHeight: 1.3,
                }}
              >
                {errorMessage}
              </div>
            )}

            {/* ================= FORM 1: SIGN IN ================= */}
            {activeTab === 'signin' ? (
              <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Email Address */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#1a4325', display: 'block', marginBottom: '5px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Mail size={16} color="#355e3e" style={{ position: 'absolute', left: '13px' }} />
                    <input
                      type="email"
                      required
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="you@domain.com"
                      style={{
                        width: '100%',
                        padding: '11px 14px 11px 40px',
                        borderRadius: '11px',
                        border: '1.5px solid #d5e3da',
                        backgroundColor: '#fbfdfb',
                        fontSize: '13.5px',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        color: '#0f3e17',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'all 0.15s ease',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0f3e17';
                        e.target.style.backgroundColor = '#ffffff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(15, 62, 23, 0.08)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d5e3da';
                        e.target.style.backgroundColor = '#fbfdfb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#1a4325', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      Password
                    </label>
                    <a href="#forgot" style={{ fontSize: '12px', color: '#164d23', textDecoration: 'none', fontWeight: 600 }}>
                      Forgot?
                    </a>
                  </div>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Lock size={16} color="#355e3e" style={{ position: 'absolute', left: '13px' }} />
                    <input
                      type={showSignInPassword ? 'text' : 'password'}
                      required
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="••••••••••••"
                      style={{
                        width: '100%',
                        padding: '11px 40px 11px 40px',
                        borderRadius: '11px',
                        border: '1.5px solid #d5e3da',
                        backgroundColor: '#fbfdfb',
                        fontSize: '13.5px',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        color: '#0f3e17',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'all 0.15s ease',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0f3e17';
                        e.target.style.backgroundColor = '#ffffff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(15, 62, 23, 0.08)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d5e3da';
                        e.target.style.backgroundColor = '#fbfdfb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      style={{
                        position: 'absolute',
                        right: '11px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#556d58',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {showSignInPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#0f3e17', cursor: 'pointer', width: '15px', height: '15px' }}
                  />
                  <label htmlFor="remember" style={{ fontSize: '12.5px', color: '#3d5c44', cursor: 'pointer' }}>
                    Remember this clinical workstation for 30 days
                  </label>
                </div>

                {/* Primary Submit CTA */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    backgroundColor: '#0f3e17',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '13px 20px',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '14.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(15, 62, 23, 0.2)',
                    transition: 'all 0.15s ease',
                    marginTop: '2px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#164d23';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#0f3e17';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span>{submitting ? 'Authenticating...' : 'Sign In to Health Vault'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              /* ================= FORM 2: SIGN UP ================= */
              <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                {/* Full Name & Email Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#1a4325', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Full Legal Name *
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <User size={15} color="#355e3e" style={{ position: 'absolute', left: '10px' }} />
                      <input
                        type="text"
                        required
                        placeholder="Jane Doe"
                        value={signUpData.name}
                        onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '9px 10px 9px 32px',
                          borderRadius: '10px',
                          border: '1.5px solid #d5e3da',
                          backgroundColor: '#fbfdfb',
                          fontSize: '13px',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          color: '#0f3e17',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#0f3e17')}
                        onBlur={(e) => (e.target.style.borderColor = '#d5e3da')}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#1a4325', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Email Address *
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Mail size={15} color="#355e3e" style={{ position: 'absolute', left: '10px' }} />
                      <input
                        type="email"
                        required
                        placeholder="you@domain.com"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '9px 10px 9px 32px',
                          borderRadius: '10px',
                          border: '1.5px solid #d5e3da',
                          backgroundColor: '#fbfdfb',
                          fontSize: '13px',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          color: '#0f3e17',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#0f3e17')}
                        onBlur={(e) => (e.target.style.borderColor = '#d5e3da')}
                      />
                    </div>
                  </div>
                </div>

                {/* Account Role Selector Cards */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#1a4325', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Account Role
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setSignUpData({ ...signUpData, role: 'patient' })}
                      style={{
                        padding: '7px 10px',
                        borderRadius: '9px',
                        border: `1.5px solid ${signUpData.role === 'patient' ? '#0f3e17' : '#d5e3da'}`,
                        backgroundColor: signUpData.role === 'patient' ? '#edf6ee' : '#ffffff',
                        color: signUpData.role === 'patient' ? '#0f3e17' : '#556d58',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: '12.5px',
                        fontWeight: signUpData.role === 'patient' ? 600 : 500,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      Patient / Individual
                    </button>

                    <button
                      type="button"
                      onClick={() => setSignUpData({ ...signUpData, role: 'clinician' })}
                      style={{
                        padding: '7px 10px',
                        borderRadius: '9px',
                        border: `1.5px solid ${signUpData.role === 'clinician' ? '#0f3e17' : '#d5e3da'}`,
                        backgroundColor: signUpData.role === 'clinician' ? '#edf6ee' : '#ffffff',
                        color: signUpData.role === 'clinician' ? '#0f3e17' : '#556d58',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: '12.5px',
                        fontWeight: signUpData.role === 'clinician' ? 600 : 500,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      Clinician / Physician
                    </button>
                  </div>
                </div>

                {/* Blood Group & Password Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#1a4325', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Blood Group
                    </label>
                    <select
                      value={signUpData.bloodGroup}
                      onChange={(e) => setSignUpData({ ...signUpData, bloodGroup: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        border: '1.5px solid #d5e3da',
                        backgroundColor: '#fbfdfb',
                        fontSize: '12.5px',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        color: '#0f3e17',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="O+ Positive">O+ Positive</option>
                      <option value="O- Negative">O- Negative</option>
                      <option value="A+ Positive">A+ Positive</option>
                      <option value="A- Negative">A- Negative</option>
                      <option value="B+ Positive">B+ Positive</option>
                      <option value="B- Negative">B- Negative</option>
                      <option value="AB+ Positive">AB+ Positive</option>
                      <option value="AB- Negative">AB- Negative</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#1a4325', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Master Password *
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Lock size={15} color="#355e3e" style={{ position: 'absolute', left: '10px' }} />
                      <input
                        type={showSignUpPassword ? 'text' : 'password'}
                        required
                        placeholder="Min. 8 chars"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 32px 8px 30px',
                          borderRadius: '10px',
                          border: '1.5px solid #d5e3da',
                          backgroundColor: '#fbfdfb',
                          fontSize: '12.5px',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          color: '#0f3e17',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#0f3e17')}
                        onBlur={(e) => (e.target.style.borderColor = '#d5e3da')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#556d58',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {showSignUpPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Strength Meter */}
                {signUpData.password && (
                  <div style={{ marginTop: '-2px' }}>
                    <div style={{ display: 'flex', gap: '4px', height: '3px', width: '100%' }}>
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          style={{
                            flex: 1,
                            borderRadius: '2px',
                            backgroundColor:
                              passStrength >= step
                                ? passStrength <= 2
                                  ? '#eab308'
                                  : '#22c55e'
                                : '#e5e7eb',
                            transition: 'background 0.2s',
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#556d58', marginTop: '2px' }}>
                      Strength: {passStrength <= 1 ? 'Weak' : passStrength <= 3 ? 'Good' : 'Strong'}
                    </div>
                  </div>
                )}

                {/* Terms Consent */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '2px' }}>
                  <input
                    type="checkbox"
                    id="terms"
                    checked={signUpData.agreeTerms}
                    onChange={(e) => setSignUpData({ ...signUpData, agreeTerms: e.target.checked })}
                    style={{ accentColor: '#0f3e17', cursor: 'pointer', marginTop: '2px' }}
                  />
                  <label htmlFor="terms" style={{ fontSize: '11px', color: '#47634d', cursor: 'pointer', lineHeight: 1.3 }}>
                    I agree to MediSage's <strong>Clinical Privacy Charter</strong> and HIPAA encrypted custody.
                  </label>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    backgroundColor: '#0f3e17',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 20px',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(15, 62, 23, 0.2)',
                    transition: 'all 0.15s ease',
                    marginTop: '2px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#164d23';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#0f3e17';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span>{submitting ? 'Initializing Vault...' : 'Initialize Health Vault'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}

            {/* Subtle Switcher Link at Bottom */}
            <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '12.5px', color: '#556d58' }}>
              {activeTab === 'signin' ? (
                <>
                  New to MediSage?{' '}
                  <button
                    type="button"
                    onClick={() => switchTab('signup')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0f3e17',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    Create personal vault →
                  </button>
                </>
              ) : (
                <>
                  Already have a vault?{' '}
                  <button
                    type="button"
                    onClick={() => switchTab('signin')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0f3e17',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    Sign in to vault →
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ================= COMPACT SUB-FOOTER ================= */}
      <footer
        style={{
          padding: '10px 24px 14px 24px',
          textAlign: 'center',
          fontSize: '11.5px',
          color: '#718576',
          flexShrink: 0,
        }}
      >
        <span>MediSage Health Vault • End-to-End HIPAA Compliant Architecture • </span>
        <Link to="/" style={{ color: '#0f3e17', textDecoration: 'none', fontWeight: 600 }}>
          Privacy Charter
        </Link>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .auth-container-grid {
            grid-template-columns: 1fr !important;
            height: auto !important;
            max-height: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export const Register = () => {
  return <Login />;
};
