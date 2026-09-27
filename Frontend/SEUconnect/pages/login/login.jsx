import React, { useState, useRef } from 'react';
import './login.css';

/**
 * Temporary hardcoded accounts for SEUConnect.
 * Case-insensitive email matching, case-sensitive password matching.
 */
const DEMO_ACCOUNTS = [
  {
    role: 'Student',
    email: 'Student@gmail.com',
    password: '123456',
    roleKey: 'student'
  },
  {
    role: 'Lecturer',
    email: 'Lecturer@gmail.com',
    password: '123456',
    roleKey: 'lecturer'
  },
  {
    role: 'HOD',
    email: 'HOD@gmail.com',
    password: '123456',
    roleKey: 'hod'
  },
  {
    role: 'Dean',
    email: 'Dean@gmail.com',
    password: '123456',
    roleKey: 'dean'
  },
  {
    role: 'Admin',
    email: 'Admin@gmail.com',
    password: '123456',
    roleKey: 'admin'
  },
  {
    role: 'Examination Officer',
    email: 'Examination@gmail.com',
    password: '123456',
    roleKey: 'examination'
  },
  {
    role: 'Super Admin',
    email: 'SuperAdmin@gmail.com',
    password: '123456',
    roleKey: 'superadmin'
  }
];

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Validation & status states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authError, setAuthError] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
    if (authError) setAuthError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError('');
    if (authError) setAuthError('');
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
    }, 550);
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (isLoading) return;

    setEmailError('');
    setPasswordError('');
    setAuthError('');
    setSuccessToast('');

    const trimmedEmail = email.trim();

    // 1. Validation for empty fields
    let hasValidationError = false;
    if (!trimmedEmail) {
      setEmailError('Please enter your email address.');
      hasValidationError = true;
    }

    if (!password) {
      setPasswordError('Please enter your password.');
      hasValidationError = true;
    }

    if (hasValidationError) {
      triggerShake();
      if (!trimmedEmail && emailInputRef.current) {
        emailInputRef.current.focus();
      } else if (!password && passwordInputRef.current) {
        passwordInputRef.current.focus();
      }
      return;
    }

    // 2. Loading state
    setIsLoading(true);

    setTimeout(() => {
      // Find matching hardcoded account (Case-insensitive email, case-sensitive password)
      const matchedAccount = DEMO_ACCOUNTS.find(
        (acc) => acc.email.toLowerCase() === trimmedEmail.toLowerCase()
      );

      // Verify credentials
      if (!matchedAccount || matchedAccount.password !== password) {
        setIsLoading(false);
        setAuthError('Invalid email or password.');
        triggerShake();
        if (passwordInputRef.current) {
          passwordInputRef.current.focus();
        }
        return;
      }

      // 3. Credentials are valid: show success toast
      const successMessage = `Login successful — Welcome, ${matchedAccount.role}`;
      setSuccessToast(successMessage);
      setIsLoading(false);

      // 4. Smooth transition to destination role page
      setTimeout(() => {
        if (typeof onLoginSuccess === 'function') {
          onLoginSuccess(matchedAccount);
        } else if (typeof window !== 'undefined' && window.location) {
          window.location.hash = `#${matchedAccount.roleKey}`;
        }
      }, 950);
    }, 600);
  };

  return (
    <div className="seu-login-root">
      {/* SEUSL Left Bottom Brand (SEU Connect Environment) */}
      <div className="seu-left-bottom-brand" aria-label="SEUSL SEU Connect Environment">
        <div className="seu-vle-vertical-group">
          <span className="seu-vle-subtext">SEU Connect Environment</span>
          <span className="seu-vle-acronym">SEUSL</span>
        </div>
        <div className="seu-vle-seal-wrapper">
          <img src="/seusl_logo.png" alt="SEUSL Official Seal" className="seu-vle-seal-img" />
        </div>
      </div>

      {/* Centered Single Authentication Card */}
      <div className={`seu-auth-card ${isShaking ? 'seu-shake-active' : ''}`}>
        
        {/* University Crest & Name Header (Top of the Card) */}
        <div className="seu-top-logo-header">
          <div className="seu-top-crest-badge" title="South Eastern University of Sri Lanka">
            <img src="/seusl_logo.png" alt="SEUSL Official Logo" className="seu-official-logo-img" />
          </div>

          <div className="seu-top-meta">
            <span className="seu-top-uni-title">SOUTH EASTERN UNIVERSITY</span>
            <span className="seu-top-uni-sub">
              OF SRI LANKA <span className="seu-oluvil-highlight">• OLUVIL</span>
            </span>
          </div>
        </div>

        {/* Card Header (Institutional Single Sign-On removed) */}
        <div className="seu-form-header">
          <h1 className="seu-form-title">Sign In to SEUConnect</h1>
          <p className="seu-form-subtitle">
            Enter your registered university email and password to access your role dashboard.
          </p>
        </div>

        {/* Success Alert Banner */}
        {successToast && (
          <div className="seu-alert seu-alert-success" role="status" aria-live="polite">
            <div className="seu-alert-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>{successToast}</div>
          </div>
        )}

        {/* Error Alert Banner */}
        {authError && (
          <div className="seu-alert seu-alert-error" role="alert" aria-live="assertive">
            <div className="seu-alert-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>{authError}</div>
          </div>
        )}

        {/* Login Form */}
        <form className="seu-login-form" onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
          <div className="seu-field-group">
            <label className="seu-label" htmlFor="seu-email-input">
              University Email Address
            </label>

            <div className="seu-input-wrapper">
              <span className="seu-input-icon-left">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>

              <input
                id="seu-email-input"
                ref={emailInputRef}
                type="email"
                name="email"
                className={`seu-input ${emailError ? 'seu-input-error' : ''}`}
                placeholder="Student@gmail.com"
                value={email}
                onChange={handleEmailChange}
                autoComplete="email"
                disabled={isLoading}
                required
              />
            </div>

            {emailError && (
              <div className="seu-inline-error">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {emailError}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="seu-field-group">
            <label className="seu-label" htmlFor="seu-password-input">
              Password
            </label>

            <div className="seu-input-wrapper">
              <span className="seu-input-icon-left">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>

              <input
                id="seu-password-input"
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                name="password"
                className={`seu-input seu-input-has-toggle ${passwordError ? 'seu-input-error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                autoComplete="current-password"
                disabled={isLoading}
                required
              />

              <button
                type="button"
                className="seu-toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {passwordError && (
              <div className="seu-inline-error">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {passwordError}
              </div>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="seu-form-options">
            <label className="seu-remember-label">
              <input
                type="checkbox"
                className="seu-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <span>Remember this device</span>
            </label>

            <button
              type="button"
              className="seu-forgot-link"
              onClick={() => {
                alert('Password Recovery: Please contact Faculty IT Administrator at it-support@seu.ac.lk');
              }}
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="seu-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="seu-spinner" aria-hidden="true" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Security Footer */}
        <div className="seu-security-footer">
          <svg className="seu-security-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>Authorized Faculty & Student Access Only • 256-bit Encryption</span>
        </div>
      </div>
    </div>
  );
}
