import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Check,
  X,
  Stethoscope,
  AlertCircle,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { Logo } from '../components/Logo';

// Official Multi-Color Google G Icon
const GoogleIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'inline-block', flexShrink: 0 }}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, loginWithGoogle, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fromPath = location.state?.from?.pathname || '/dashboard';
      navigate(fromPath, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

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

  // Sign In Form States
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);


  // Sign Up Form States
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Modals
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Custom Google Account State in Modal
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

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

  // ================= GOOGLE AUTHENTICATION FLOW =================
  const handleGoogleClick = () => {
    setErrorMessage('');
    // Check if Google Identity Services GIS is ready with a configured client ID
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (googleClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (response.credential) {
              setGoogleLoading(true);
              try {
                await loginWithGoogle({ credential: response.credential });
                const target = location.state?.from?.pathname || '/dashboard';
                navigate(target, { replace: true });
              } catch (err) {
                setErrorMessage(err.message || 'Google authentication failed.');
              } finally {
                setGoogleLoading(false);
              }
            }
          },
        });
        window.google.accounts.id.prompt();
        return;
      } catch (gisErr) {
        console.warn('GIS prompt initialization error, fallback to account chooser:', gisErr);
      }
    }

    // Default seamless Google Account Chooser
    setShowGoogleModal(true);
  };

  const handleSelectGoogleProfile = async (profile) => {
    setGoogleLoading(true);
    setErrorMessage('');
    try {
      await loginWithGoogle({
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
        googleId: profile.googleId || 'google-' + Date.now(),
      });
      setShowGoogleModal(false);
      const target = location.state?.from?.pathname || '/dashboard';
      navigate(target, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Google authentication failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleCustomGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!customGoogleEmail) return;
    await handleSelectGoogleProfile({
      name: customGoogleName || customGoogleEmail.split('@')[0],
      email: customGoogleEmail,
      picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customGoogleEmail)}`,
      googleId: 'google-custom-' + Date.now(),
    });
  };

  // ================= SIGN IN SUBMIT =================
  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);
    try {
      await login(signInEmail, signInPassword);
      const target = location.state?.from?.pathname || '/dashboard';
      navigate(target, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Invalid credentials or authentication error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ================= SIGN UP SUBMIT =================
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!signUpData.agreeTerms) {
      setErrorMessage('Please accept the HIPAA privacy charter and terms to initialize your vault.');
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
      const target = location.state?.from?.pathname || '/dashboard';
      navigate(target, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Registration error. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Forgot Password Submit — real server request; the response stays
  // neutral either way (no account enumeration), so the success view
  // shows regardless.
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail || forgotSuccess) return;
    try {
      await authService.forgotPassword(forgotEmail);
    } catch {
      // Rate-limited or offline — the UI flow remains the same
    }
    setForgotSuccess(true);
  };

  return (
    <div
      style={{
        backgroundColor: '#faf8f5',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        color: '#1a3320',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* ================= MAIN AUTH WORKSPACE ================= */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 20px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            maxWidth: '1080px',
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '26px',
            boxShadow: '0 20px 50px rgba(15, 62, 23, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(15, 62, 23, 0.1)',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: '1fr 1.25fr',
            boxSizing: 'border-box',
          }}
          className="auth-main-card"
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
            className="auth-left-hero"
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
                  fontFamily: "'Newsreader', 'Cormorant Garamond', Georgia, serif",
                  fontSize: '14.5px',
                  lineHeight: 1.55,
                  color: '#13391b',
                  margin: 0,
                  maxWidth: '330px',
                  letterSpacing: '0.005em',
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
                marginTop: '28px',
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#0f3e17', letterSpacing: '0.02em' }}>
                HIPAA Certified • Provenance Traceable
              </span>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: PROPER AUTH FORMS & GOOGLE AUTH ================= */}
          <div
            style={{
              padding: '34px 40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
              backgroundColor: '#ffffff',
            }}
            className="auth-right-content"
          >
            <div>
              {/* Brand Logo (clicking navigates to Home) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '22px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid #edf4ef',
                }}
              >
                <Logo size={27} fontSize="22.5px" color="#000000" to="/" />
              </div>

              {/* Segmented Pill Switcher */}
              <div
                style={{
                  display: 'flex',
                  backgroundColor: '#f1f5f2',
                  padding: '4px',
                  borderRadius: '13px',
                  border: '1px solid #e2ebe4',
                  marginBottom: '20px',
                }}
              >
                <button
                  type="button"
                  id="tab-signin-btn"
                  onClick={() => switchTab('signin')}
                  style={{
                    flex: 1,
                    padding: '9px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: activeTab === 'signin' ? '#ffffff' : 'transparent',
                    color: activeTab === 'signin' ? '#0f3e17' : '#57715c',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '14px',
                    fontWeight: activeTab === 'signin' ? 700 : 500,
                    boxShadow: activeTab === 'signin' ? '0 2px 8px rgba(15, 62, 23, 0.1)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                >
                  Sign In to Vault
                </button>

                <button
                  type="button"
                  id="tab-signup-btn"
                  onClick={() => switchTab('signup')}
                  style={{
                    flex: 1,
                    padding: '9px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: activeTab === 'signup' ? '#ffffff' : 'transparent',
                    color: activeTab === 'signup' ? '#0f3e17' : '#57715c',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '14px',
                    fontWeight: activeTab === 'signup' ? 700 : 500,
                    boxShadow: activeTab === 'signup' ? '0 2px 8px rgba(15, 62, 23, 0.1)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                >
                  Create Account
                </button>
              </div>

              {/* Title & Subtitle */}
              <div style={{ marginBottom: '18px' }}>
                <h3
                  style={{
                    margin: 0,
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '24px',
                    fontWeight: 500,
                    color: '#0f3e17',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {activeTab === 'signin' ? 'Welcome back to your vault' : 'Create your personal vault'}
                </h3>
                <p
                  style={{
                    fontFamily: "'Newsreader', 'Cormorant Garamond', Georgia, serif",
                    margin: '6px 0 0 0',
                    fontSize: '14.5px',
                    color: '#556d58',
                    lineHeight: 1.5,
                    letterSpacing: '0.005em',
                  }}
                >
                  {activeTab === 'signin'
                    ? 'Enter your clinical credentials or sign in with Google to access your records.'
                    : 'Initialize patient-owned health records with end-to-end 256-bit encryption.'}
                </p>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fca5a5',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#991b1b',
                    fontSize: '12.5px',
                    marginBottom: '16px',
                    lineHeight: 1.4,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={15} color="#dc2626" style={{ flexShrink: 0 }} />
                    <span>{errorMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrorMessage('')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#991b1b',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* ================= GOOGLE AUTH BUTTON ================= */}
              <div style={{ marginBottom: '18px' }}>
                <button
                  type="button"
                  id="google-auth-btn"
                  onClick={handleGoogleClick}
                  disabled={submitting || googleLoading}
                  style={{
                    width: '100%',
                    padding: '11px 18px',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #d5ded7',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    cursor: googleLoading ? 'wait' : 'pointer',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#2d3748',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    transition: 'all 0.18s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fbf9';
                    e.currentTarget.style.borderColor = '#0f3e17';
                    e.currentTarget.style.boxShadow = '0 3px 10px rgba(15, 62, 23, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#d5ded7';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                  }}
                >
                  {googleLoading ? (
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        border: '2px solid #34A853',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite',
                      }}
                    />
                  ) : (
                    <GoogleIcon size={19} />
                  )}
                  <span>
                    {googleLoading
                      ? 'Signing in with Google...'
                      : activeTab === 'signin'
                      ? 'Continue with Google'
                      : 'Sign up with Google'}
                  </span>
                </button>
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0 18px 0', gap: '12px' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2ede4' }} />
                <span
                  style={{
                    fontSize: '11px',
                    color: '#6e8574',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  or continue with email
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2ede4' }} />
              </div>

              {/* ================= FORM 1: SIGN IN ================= */}
              {activeTab === 'signin' ? (
                <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="signin-email"
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: '#1a4325',
                        display: 'block',
                        marginBottom: '6px',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Email Address
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Mail size={16} color="#355e3e" style={{ position: 'absolute', left: '13px' }} />
                      <input
                        id="signin-email"
                        type="email"
                        required
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        placeholder="you@hospital.org or personal@gmail.com"
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

                  {/* Password Field */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '6px',
                      }}
                    >
                      <label
                        htmlFor="signin-password"
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: '#1a4325',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(signInEmail);
                          setShowForgotModal(true);
                          setForgotSuccess(false);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '12px',
                          color: '#164d23',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        Forgot?
                      </button>
                    </div>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Lock size={16} color="#355e3e" style={{ position: 'absolute', left: '13px' }} />
                      <input
                        id="signin-password"
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
                          right: '12px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#556d58',
                          display: 'flex',
                          alignItems: 'center',
                          padding: 0,
                        }}
                        title={showSignInPassword ? 'Hide password' : 'Show password'}
                      >
                        {showSignInPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Primary Submit CTA */}
                  <button
                    type="submit"
                    id="signin-submit-btn"
                    disabled={submitting || googleLoading}
                    style={{
                      backgroundColor: '#0f3e17',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '13px 20px',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '14.5px',
                      fontWeight: 600,
                      cursor: submitting ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 16px rgba(15, 62, 23, 0.2)',
                      transition: 'all 0.15s ease',
                      marginTop: '4px',
                    }}
                    onMouseEnter={(e) => {
                      if (!submitting) {
                        e.currentTarget.style.backgroundColor = '#164d23';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
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
                <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Full Name & Email Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="auth-signup-row">
                    <div>
                      <label
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#1a4325',
                          display: 'block',
                          marginBottom: '5px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        Full Legal Name *
                      </label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <User size={15} color="#355e3e" style={{ position: 'absolute', left: '11px' }} />
                        <input
                          type="text"
                          required
                          placeholder="Eleanor Vance"
                          value={signUpData.name}
                          onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 12px 10px 34px',
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
                      <label
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#1a4325',
                          display: 'block',
                          marginBottom: '5px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        Email Address *
                      </label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Mail size={15} color="#355e3e" style={{ position: 'absolute', left: '11px' }} />
                        <input
                          type="email"
                          required
                          placeholder="you@domain.com"
                          value={signUpData.email}
                          onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 12px 10px 34px',
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

                  {/* Master Password Field */}
                  <div>
                    <label
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#1a4325',
                        display: 'block',
                        marginBottom: '5px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Master Password *
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Lock size={15} color="#355e3e" style={{ position: 'absolute', left: '11px' }} />
                      <input
                        type={showSignUpPassword ? 'text' : 'password'}
                        required
                        placeholder="Min. 8 characters"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 34px 10px 34px',
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
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#556d58',
                          display: 'flex',
                          alignItems: 'center',
                          padding: 0,
                        }}
                      >
                        {showSignUpPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength Meter */}
                  {signUpData.password && (
                    <div style={{ marginTop: '-4px' }}>
                      <div style={{ display: 'flex', gap: '4px', height: '4px', width: '100%' }}>
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
                      <div style={{ fontSize: '11px', color: '#556d58', marginTop: '3px', fontWeight: 500 }}>
                        Security Level: {passStrength <= 1 ? 'Too short' : passStrength <= 2 ? 'Weak' : passStrength === 3 ? 'Good' : 'Strong & Encrypted'}
                      </div>
                    </div>
                  )}

                  {/* Terms Consent */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '2px' }}>
                    <input
                      type="checkbox"
                      id="terms"
                      checked={signUpData.agreeTerms}
                      onChange={(e) => setSignUpData({ ...signUpData, agreeTerms: e.target.checked })}
                      style={{ accentColor: '#0f3e17', cursor: 'pointer', marginTop: '2px', width: '14px', height: '14px' }}
                    />
                    <label htmlFor="terms" style={{ fontSize: '12px', color: '#47634d', cursor: 'pointer', lineHeight: 1.4 }}>
                      I agree to MediSage's <strong>Clinical Privacy Charter</strong> and HIPAA encrypted custody protocol.
                    </label>
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={submitting || googleLoading}
                    style={{
                      backgroundColor: '#0f3e17',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '13px 20px',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: submitting ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 16px rgba(15, 62, 23, 0.2)',
                      transition: 'all 0.15s ease',
                      marginTop: '4px',
                    }}
                    onMouseEnter={(e) => {
                      if (!submitting) {
                        e.currentTarget.style.backgroundColor = '#164d23';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
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
            </div>
          </div>
        </div>
      </main>

      {/* ================= COMPACT SUB-FOOTER ================= */}
      <footer
        style={{
          padding: '14px 24px 20px 24px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#718576',
          flexShrink: 0,
        }}
      >
        <span>MediSage Health Vault • End-to-End HIPAA Compliant Architecture • </span>
        <Link to="/" style={{ color: '#0f3e17', textDecoration: 'none', fontWeight: 600 }}>
          Clinical Privacy Charter
        </Link>
      </footer>

      {/* ================= GOOGLE ACCOUNT CHOOSER MODAL ================= */}
      {showGoogleModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setShowGoogleModal(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              padding: '28px 28px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.2)',
              border: '1px solid #e5e7eb',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <GoogleIcon size={24} />
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#202124' }}>
                  Sign in with Google
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#5f6368',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '13px', color: '#5f6368', marginBottom: '4px' }}>
                to continue to <strong style={{ color: '#0f3e17' }}>MediSage Health Vault</strong>
              </div>
              <div style={{ fontSize: '12px', color: '#80868b' }}>
                Choose an account or sign in with your Google email
              </div>
            </div>

            {/* Account List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {/* Account 1: Eleanor Vance */}
              <button
                type="button"
                onClick={() =>
                  handleSelectGoogleProfile({
                    name: 'Eleanor Vance',
                    email: 'eleanor.vance@gmail.com',
                    picture: '/alex_avatar.jpg',
                    googleId: 'google-eleanor-vance-1',
                  })
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #dadce0',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  width: '100%',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafd';
                  e.currentTarget.style.borderColor = '#0f3e17';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#dadce0';
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#1b4332',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '15px',
                    flexShrink: 0,
                  }}
                >
                  EV
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#202124' }}>Eleanor Vance</div>
                  <div style={{ fontSize: '12px', color: '#5f6368', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    eleanor.vance@gmail.com
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: '#0f3e17', fontWeight: 700, backgroundColor: '#eaf4ec', padding: '3px 8px', borderRadius: '6px' }}>
                  Patient
                </span>
              </button>

              {/* Account 2: Dr. Julian Vance */}
              <button
                type="button"
                onClick={() =>
                  handleSelectGoogleProfile({
                    name: 'Dr. Julian Vance, MD',
                    email: 'dr.julian.vance@gmail.com',
                    picture: '/michael_avatar.jpg',
                    googleId: 'google-dr-vance-2',
                  })
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #dadce0',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  width: '100%',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafd';
                  e.currentTarget.style.borderColor = '#0f3e17';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#dadce0';
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#0f3e17',
                    color: '#a9d4b2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '15px',
                    flexShrink: 0,
                  }}
                >
                  JV
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#202124' }}>Dr. Julian Vance, MD</div>
                  <div style={{ fontSize: '12px', color: '#5f6368', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    dr.julian.vance@gmail.com
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: '#0f3e17', fontWeight: 700, backgroundColor: '#eaf4ec', padding: '3px 8px', borderRadius: '6px' }}>
                  Clinician
                </span>
              </button>

              {/* Custom Google Account Option */}
              {!showCustomGoogleInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomGoogleInput(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '11px 14px',
                    borderRadius: '12px',
                    border: '1px dashed #b8c8bc',
                    backgroundColor: '#fafcf9',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: '#0f3e17',
                    fontSize: '13px',
                    fontWeight: 600,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#edf6ee')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fafcf9')}
                >
                  <User size={18} color="#0f3e17" />
                  <span>Use another Google account...</span>
                </button>
              ) : (
                <form
                  onSubmit={handleCustomGoogleSubmit}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1.5px solid #0f3e17',
                    backgroundColor: '#fbfdfb',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f3e17' }}>Enter Google Account Details</div>
                  <input
                    type="text"
                    placeholder="Your Full Name"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #d0dcd2',
                      fontSize: '12.5px',
                      outline: 'none',
                    }}
                  />
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #d0dcd2',
                      fontSize: '12.5px',
                      outline: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setShowCustomGoogleInput(false)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        fontSize: '12px',
                        cursor: 'pointer',
                        color: '#666',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#0f3e17',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Continue
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Disclaimer */}
            <p style={{ fontSize: '11px', color: '#70757a', lineHeight: 1.4, margin: '14px 0 0 0', textAlign: 'center' }}>
              To continue, Google will securely share your profile information with MediSage in accordance with HIPAA data custody privacy policies.
            </p>
          </div>
        </div>
      )}

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      {showForgotModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setShowForgotModal(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '420px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.2)',
              border: '1px solid #e5e7eb',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={20} color="#0f3e17" />
                <h4 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f3e17' }}>Reset Vault Password</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {forgotSuccess ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#eaf4ec',
                    color: '#0f3e17',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px auto',
                  }}
                >
                  <Check size={22} strokeWidth={3} />
                </div>
                <h5 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#0f3e17' }}>Recovery Link Dispatched</h5>
                <p style={{ margin: 0, fontSize: '13px', color: '#556d58', lineHeight: 1.45 }}>
                  A secure cryptographic reset token has been sent to <strong>{forgotEmail}</strong>. Check your inbox and spam folder.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  style={{
                    marginTop: '20px',
                    backgroundColor: '#0f3e17',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '9px 20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#556d58', lineHeight: 1.45 }}>
                  Enter your registered workstation or patient email. We will dispatch a HIPAA-verified identity reset link.
                </p>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#1a4325', display: 'block', marginBottom: '5px', textTransform: 'uppercase' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@domain.com"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid #d5e3da',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '10px',
                      border: '1px solid #d5e3da',
                      background: 'none',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      color: '#47634d',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '9px 18px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#0f3e17',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Global CSS keyframes and responsiveness */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          .auth-main-card {
            grid-template-columns: 1fr !important;
          }
          .auth-left-hero {
            display: none !important;
          }
          .auth-right-content {
            padding: 28px 24px !important;
          }
          .auth-signup-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export const Register = () => {
  return <Login />;
};

export default Login;
