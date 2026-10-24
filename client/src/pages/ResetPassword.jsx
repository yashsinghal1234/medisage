import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

/**
 * Reset Password — completes the forgot-password flow.
 * Reads the one-time token from /reset-password?token=... (emailed link)
 * and swaps it for a new password via POST /api/auth/reset-password.
 */
export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('form'); // form | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Za-z]/.test(password)) return 'Password must contain a letter.';
    if (!/\d/.test(password)) return 'Password must contain a digit.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setErrorMsg(problem);
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'This reset link is invalid or has expired.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Could not reach the MediSage server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1px solid #c8d8cc',
    fontSize: '14px',
    backgroundColor: '#ffffff',
  };

  return (
    <div
      style={{
        backgroundColor: '#faf8f5',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        boxSizing: 'border-box',
        color: '#1a3320',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e5efe7',
          boxShadow: '0 12px 36px rgba(15, 62, 23, 0.08)',
          padding: '34px',
          width: '100%',
          maxWidth: '420px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              margin: '0 auto 12px',
              borderRadius: '50%',
              backgroundColor: '#eaf4ec',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {status === 'success' ? <CheckCircle2 size={26} color="#0f3e17" /> : <Lock size={24} color="#0f3e17" />}
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', margin: 0, color: '#0f3e17' }}>
            Choose a New Password
          </h1>
          <p style={{ fontSize: '13px', color: '#5b6d5e', marginTop: '6px' }}>
            Your one-time reset link expires 60 minutes after it was requested.
          </p>
        </div>

        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                backgroundColor: '#f2f8f4',
                border: '1px solid #cfe4d5',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '18px',
                fontSize: '13.5px',
              }}
            >
              <b>Done.</b> Every previous session was signed out — sign in with your new password.
            </div>
            <button
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                backgroundColor: '#0f3e17',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Sign In
            </button>
          </div>
        ) : status === 'error' ? (
          <div>
            <div
              style={{
                backgroundColor: '#fdeeee',
                border: '1px solid #f3caca',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
                fontSize: '13.5px',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}
            >
              <AlertTriangle size={18} color="#b91c1c" style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{errorMsg}</span>
            </div>
            <Link
              to="/login"
              style={{
                display: 'block',
                textAlign: 'center',
                backgroundColor: '#0f3e17',
                color: '#ffffff',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Back to Sign In
            </Link>
          </div>
        ) : !token ? (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                backgroundColor: '#fdeeee',
                border: '1px solid #f3caca',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
                fontSize: '13.5px',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                textAlign: 'left',
              }}
            >
              <AlertTriangle size={18} color="#b91c1c" style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                This link is missing its security token. Open the newest reset email we sent you, or start again from
                the sign-in page.
              </span>
            </div>
            <Link
              to="/login"
              style={{
                display: 'block',
                textAlign: 'center',
                backgroundColor: '#0f3e17',
                color: '#ffffff',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '5px' }}>
                New password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8+ characters, a letter and a digit"
                style={fieldStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '5px' }}>
                Confirm new password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={fieldStyle}
              />
            </div>

            {errorMsg && (
              <div style={{ fontSize: '12.5px', color: '#b91c1c', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <AlertTriangle size={14} color="#b91c1c" />
                {errorMsg}
              </div>
            )}

            <div
              style={{
                fontSize: '11.5px',
                color: '#5b6d5e',
                display: 'flex',
                gap: '6px',
                alignItems: 'center',
                marginTop: '2px',
              }}
            >
              <ShieldCheck size={13} color="#0f3e17" />
              Changing this password signs out every device on your account.
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: '6px',
                backgroundColor: '#0f3e17',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: submitting ? 'wait' : 'pointer',
                opacity: submitting ? 0.75 : 1,
              }}
            >
              {submitting ? 'Updating…' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
