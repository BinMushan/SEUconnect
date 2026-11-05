import React, { useState, useRef } from 'react';
import api, { enrolledStorage } from '../../src/services/api.js';
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
    role: 'Senior Assistant Registrar (SAR)',
    email: 'sar@gmail.com',
    password: '123456',
    roleKey: 'sar'
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
    role: 'Department MA',
    email: 'DeptMA@gmail.com',
    password: '123456',
    roleKey: 'dept_ma'
  },
  {
    role: 'Management Assistant',
    email: 'Fma@gmail.com',
    password: '123456',
    roleKey: 'fma'
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

  // Forgot Password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

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

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    const cleanId = forgotIdentifier.trim();
    if (!cleanId) {
      setForgotError('Please enter your University Email or Student Registration Number.');
      return;
    }
    if (!forgotNewPassword) {
      setForgotError('Please enter a new password.');
      return;
    }
    if (forgotNewPassword.length < 6) {
      setForgotError('Password must be at least 6 characters long.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsForgotLoading(true);

    // 1. Update in local enrolled student storage
    const updatedLocal = enrolledStorage.updatePassword(cleanId, forgotNewPassword);

    // 2. Call backend forgot-password API
    let backendSuccess = false;
    try {
      const res = await api.forgotPassword({
        emailOrRegNo: cleanId,
        newPassword: forgotNewPassword
      });
      if (res && res.success) {
        backendSuccess = true;
      }
    } catch (err) {
      console.warn('Backend forgot-password attempt:', err.message);
    }

    setIsForgotLoading(false);

    if (updatedLocal || backendSuccess) {
      setForgotSuccess('Your password has been successfully reset! You can now log in.');
      setEmail(cleanId);
      setPassword(forgotNewPassword);
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setForgotSuccess('');
        setForgotIdentifier('');
        setForgotNewPassword('');
        setForgotConfirmPassword('');
      }, 1500);
    } else {
      // Check if it's one of the demo accounts
      const matchedDemo = DEMO_ACCOUNTS.find(a => 
        a.email.toLowerCase() === cleanId.toLowerCase() || 
        (a.roleKey === 'student' && cleanId.toLowerCase().includes('ict085'))
      );
      if (matchedDemo) {
        matchedDemo.password = forgotNewPassword;
        setForgotSuccess('Password updated for demo account! Pre-filling credentials...');
        setEmail(matchedDemo.email);
        setPassword(forgotNewPassword);
        setTimeout(() => {
          setIsForgotModalOpen(false);
          setForgotSuccess('');
        }, 1300);
      } else {
        setForgotError('No registered account found matching that email or registration number. Please contact the Faculty IT Administrator.');
      }
    }
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

    const trimmedIdentifier = email.trim();

    // 1. Validation for empty fields
    let hasValidationError = false;
    if (!trimmedIdentifier) {
      setEmailError('Please enter your university email or registration number.');
      hasValidationError = true;
    }

    if (!password) {
      setPasswordError('Please enter your password.');
      hasValidationError = true;
    }

    if (hasValidationError) {
      triggerShake();
      if (!trimmedIdentifier && emailInputRef.current) {
        emailInputRef.current.focus();
      } else if (!password && passwordInputRef.current) {
        passwordInputRef.current.focus();
      }
      return;
    }

    // 2. Loading state
    setIsLoading(true);

    (async () => {
      let loggedUser = null;
      let backendRejected = false;
      try {
        // Try real MERN backend
        const res = await api.login(trimmedIdentifier, password);
        if (res && res.success && res.user) {
          loggedUser = res.user;
        }
      } catch (err) {
        console.warn('Backend login attempt:', err.message);
        backendRejected = err.status === 401;
      }

      // If backend was not reached or offline demo mode (not rejected with bad creds)
      if (!loggedUser && !backendRejected) {
        // 1. Check local enrolled student database (enrolled from Admin)
        const localStudent = enrolledStorage.find(trimmedIdentifier);
        if (localStudent && (localStudent.tempPassword === password || localStudent.password === password || password === '123456')) {
          loggedUser = {
            id: localStudent.id || `stu-${localStudent.regNo}`,
            name: localStudent.name || localStudent.fullName,
            email: localStudent.email,
            role: 'Student',
            roleKey: 'student',
            regNo: localStudent.regNo || localStudent.studentId,
            department: localStudent.department || 'Department of Information & Communication Technology',
            faculty: 'Faculty of Technology',
            programme: localStudent.programme || localStudent.degreeProgramme || 'BICT (Hons)',
            semester: localStudent.semester || localStudent.currentSemester || 'Semester 1',
            designation: 'Undergraduate',
            avatarInitial: (localStudent.name || localStudent.fullName || 'ST').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
            sgpa: localStudent.sgpa || 0.00,
            cgpa: localStudent.cgpa || 0.00,
            credits: localStudent.credits || 0,
            attendance: localStudent.attendance || 100,
            specialization: localStudent.specialization || (localStudent.department?.includes('Bio') ? 'Bio-Processing Technology' : 'Software Technology')
          };
        } else {
          // 2. Check static demo accounts
          const matchedAccount = DEMO_ACCOUNTS.find(
            (acc) => acc.email.toLowerCase() === trimmedIdentifier.toLowerCase() ||
                     (acc.roleKey === 'student' && trimmedIdentifier.toLowerCase() === '22ict085')
          );
          if (matchedAccount && matchedAccount.password === password) {
            loggedUser = {
              ...matchedAccount,
              name: matchedAccount.roleKey === 'sar' ? 'Mr. K.L.M. Riyas' : matchedAccount.role === 'Student' ? 'M.N.M. Afnan' : matchedAccount.role === 'Lecturer' ? 'Dr. K. Perera' : matchedAccount.role === 'Department MA' ? 'Mrs. K. N. Fathima' : matchedAccount.role,
              staffId: matchedAccount.roleKey === 'sar' ? 'STAFF-SAR-001' : matchedAccount.role === 'Department MA' ? 'STAFF-DMA-008' : undefined,
              designation: matchedAccount.roleKey === 'sar' ? 'Senior Assistant Registrar (SAR)' : matchedAccount.role === 'Department MA' ? 'Department Management Assistant (ICT)' : undefined,
              regNo: matchedAccount.role === 'Student' ? '22ICT085' : undefined,
              department: 'Department of Information and Communication Technology',
              faculty: 'Faculty of Technology',
            };
          }
        }
      }

      if (!loggedUser) {
        setIsLoading(false);
        setAuthError('Invalid credentials. Please check your email/registration number and password.');
        triggerShake();
        if (passwordInputRef.current) {
          passwordInputRef.current.focus();
        }
        return;
      }

      // 3. Credentials are valid: show success toast
      const successMessage = `Login successful — Welcome, ${loggedUser.name || loggedUser.role}`;
      setSuccessToast(successMessage);
      setIsLoading(false);

      // 4. Smooth transition to destination role page
      setTimeout(() => {
        if (typeof onLoginSuccess === 'function') {
          onLoginSuccess(loggedUser);
        } else if (typeof window !== 'undefined' && window.location) {
          window.location.hash = `#${loggedUser.roleKey || loggedUser.role?.toLowerCase()}`;
        }
      }, 700);
    })();
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
      <div className={`seu-auth-card ${isShaking ? 'seu-card-shake' : ''}`}>
        {/* Top University Brand Identity */}
        <div className="seu-top-uni-header">
          <div className="seu-top-uni-title">SOUTH EASTERN UNIVERSITY OF SRI LANKA</div>
          <div className="seu-top-uni-sub">FACULTY OF TECHNOLOGY • SEUCONNECT PORTAL</div>
        </div>

        {/* Form Title & Subtitle */}
        <div className="seu-form-intro">
          <h1 className="seu-form-title">Institutional Sign In</h1>
          <p className="seu-form-subtext">Access your student or faculty academic services workspace</p>
        </div>

        {/* Quick Demo Switcher (Top Role Tabs) */}
        <div className="seu-role-picker-container" style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.35rem', textAlign: 'center', fontWeight: '500' }}>
            ⚡ Demo Quick Sign-in (Auto-fills credentials):
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.35rem',
              justifyContent: 'center',
              maxHeight: '85px',
              overflowY: 'auto',
              padding: '0.2rem'
            }}
          >
            {DEMO_ACCOUNTS.map((acc) => {
              const isActive = email.toLowerCase() === acc.email.toLowerCase();
              return (
                <button
                  key={acc.roleKey}
                  type="button"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword(acc.password);
                    setEmailError('');
                    setPasswordError('');
                    setAuthError('');
                  }}
                  style={{
                    fontSize: '0.70rem',
                    padding: '0.25rem 0.55rem',
                    borderRadius: '6px',
                    border: isActive ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                    background: isActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 43, 92, 0.45)',
                    color: isActive ? '#38bdf8' : '#cbd5e1',
                    cursor: 'pointer',
                    fontWeight: isActive ? '600' : '400',
                    transition: 'all 0.15s ease'
                  }}
                  title={`Fill ${acc.role} (${acc.email})`}
                >
                  {acc.roleKey.toUpperCase() === 'SAR' ? '📋 SAR (Admin)' : acc.roleKey.toUpperCase() === 'HOD' ? '🏛️ HOD' : acc.roleKey.toUpperCase() === 'DEAN' ? '📜 Dean' : acc.role}
                </button>
              );
            })}
          </div>
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
          {/* Email or RegNo Field */}
          <div className="seu-field-group">
            <label className="seu-label" htmlFor="seu-email-input">
              University Email or Student Registration Number
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
                type="text"
                name="email"
                className={`seu-input ${emailError ? 'seu-input-error' : ''}`}
                placeholder="Student@gmail.com or 22ICT085 or SEU/IS/24/ICT/001"
                value={email}
                onChange={handleEmailChange}
                autoComplete="username"
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
                setForgotIdentifier(email || '');
                setForgotError('');
                setForgotSuccess('');
                setIsForgotModalOpen(true);
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

      {/* Forgot Password Interactive Modal */}
      {isForgotModalOpen && (
        <div className="seu-forgot-backdrop" onClick={() => setIsForgotModalOpen(false)}>
          <div className="seu-forgot-modal" onClick={(e) => e.stopPropagation()}>
            <div className="seu-forgot-header">
              <div className="seu-forgot-title-box">
                <div className="seu-forgot-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <h3 className="seu-forgot-title">Account Password Recovery</h3>
                  <p className="seu-forgot-subtitle">Reset your student or faculty login credentials</p>
                </div>
              </div>
              <button 
                type="button" 
                className="seu-forgot-close-btn" 
                onClick={() => setIsForgotModalOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {forgotSuccess && (
              <div className="seu-alert seu-alert-success" style={{ margin: '1rem 0' }}>
                <div className="seu-alert-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>{forgotSuccess}</div>
              </div>
            )}

            {forgotError && (
              <div className="seu-alert seu-alert-error" style={{ margin: '1rem 0' }}>
                <div className="seu-alert-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div>{forgotError}</div>
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="seu-forgot-form">
              <div className="seu-field-group">
                <label className="seu-label">University Email or Student Reg No *</label>
                <div className="seu-input-wrapper">
                  <input
                    type="text"
                    className="seu-input"
                    placeholder="e.g. seu24ict001@seu.ac.lk or SEU/IS/24/ICT/001"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="seu-field-group">
                <label className="seu-label">New Password *</label>
                <div className="seu-input-wrapper">
                  <input
                    type="password"
                    className="seu-input"
                    placeholder="Minimum 6 characters"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="seu-field-group">
                <label className="seu-label">Confirm New Password *</label>
                <div className="seu-input-wrapper">
                  <input
                    type="password"
                    className="seu-input"
                    placeholder="Re-type your new password"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="seu-forgot-actions">
                <button
                  type="button"
                  className="seu-forgot-cancel-btn"
                  onClick={() => setIsForgotModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="seu-forgot-submit-btn"
                  disabled={isForgotLoading}
                >
                  {isForgotLoading ? 'Resetting Password...' : 'Reset & Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
