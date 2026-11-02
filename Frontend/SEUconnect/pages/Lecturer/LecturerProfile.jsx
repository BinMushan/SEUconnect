import React, { useState } from 'react';
import { INITIAL_LECTURER_INFO } from './lecturerMockData.js';

/**
 * LecturerProfile component
 * Implements lecturer identity details, contact info in-place editing,
 * validation, password policy change form, and university security banner.
 */
export default function LecturerProfile({ onShowToast }) {
  const [profile, setProfile] = useState(INITIAL_LECTURER_INFO);
  const [isEditingContact, setIsEditingContact] = useState(false);

  // Form states for contact edit
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Password management states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Contact Info Save Handler
  const handleSaveContact = (e) => {
    e.preventDefault();
    setEmailError('');
    setPhoneError('');

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(editEmail.trim())) {
      setEmailError('Please enter a valid academic email address (e.g. lecturer@seu.ac.lk).');
      return;
    }

    if (!editPhone.trim() || editPhone.trim().length < 9) {
      setPhoneError('Please enter a valid contact phone number with country code.');
      return;
    }

    setProfile((prev) => ({
      ...prev,
      email: editEmail.trim(),
      phone: editPhone.trim(),
    }));
    setIsEditingContact(false);

    if (onShowToast) {
      onShowToast('Profile updated', 'success');
    }
  };

  const handleCancelContactEdit = () => {
    setEditEmail(profile.email);
    setEditPhone(profile.phone);
    setEmailError('');
    setPhoneError('');
    setIsEditingContact(false);
  };

  // Password Change Handler
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Please provide your current account password.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must contain at least 8 characters according to university policy.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation password do not match.');
      return;
    }

    // Success simulation
    setPasswordSuccess('Password successfully updated and encrypted.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    if (onShowToast) {
      onShowToast('Password updated successfully.', 'success');
    }
  };

  return (
    <div className="lec-profile-page-container">
      {/* 1. Header Profile Banner Card */}
      <div className="lec-profile-hero-card">
        <div className="lec-avatar-large">
          <span>{profile.avatarInitial}</span>
        </div>
        <div className="lec-profile-hero-info">
          <div className="lec-profile-hero-title-row">
            <h2 className="lec-profile-hero-name">{profile.fullName}</h2>
            <span className="lec-verified-pill">SEUSL Verified Academic Staff</span>
          </div>
          <p className="lec-profile-hero-subtitle">
            {profile.designation} • {profile.department}
          </p>
          <div className="lec-profile-tag-badges">
            <span className="lec-profile-tag">
              Lecturer ID: <strong>{profile.lecturerId}</strong>
            </span>
            <span className="lec-profile-tag">
              Faculty: <strong>{profile.faculty}</strong>
            </span>
            <span className="lec-profile-tag tag-gold">
              Assigned Modules: <strong>{profile.assignedSubjectsCount} Subjects</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="lec-profile-grid-two-col">
        {/* Left Column: Lecturer Information Attributes & In-place Contact Edit */}
        <div className="lec-profile-card">
          <div className="lec-card-header-bar">
            <div>
              <h3 className="lec-card-heading">Lecturer Identity & Contact Information</h3>
              <p className="lec-card-subheading">Official institutional records and verified direct contact details</p>
            </div>
            {!isEditingContact && (
              <button
                type="button"
                className="lec-btn-edit-contact"
                onClick={() => setIsEditingContact(true)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit Contact Details
              </button>
            )}
          </div>

          {!isEditingContact ? (
            <div className="lec-profile-meta-list">
              <div className="lec-meta-field">
                <span className="meta-label">Full Name:</span>
                <span className="meta-value font-bold">{profile.fullName}</span>
              </div>
              <div className="lec-meta-field">
                <span className="meta-label">Lecturer ID:</span>
                <span className="meta-value highlight-badge">{profile.lecturerId}</span>
              </div>
              <div className="lec-meta-field">
                <span className="meta-label">Department:</span>
                <span className="meta-value">{profile.department}</span>
              </div>
              <div className="lec-meta-field">
                <span className="meta-label">Faculty:</span>
                <span className="meta-value">{profile.faculty}</span>
              </div>
              <div className="lec-meta-field">
                <span className="meta-label">Official University Email:</span>
                <span className="meta-value text-blue">{profile.email}</span>
              </div>
              <div className="lec-meta-field">
                <span className="meta-label">Login Account Email:</span>
                <span className="meta-value">{profile.loginEmail}</span>
              </div>
              <div className="lec-meta-field">
                <span className="meta-label">Contact Phone:</span>
                <span className="meta-value">{profile.phone}</span>
              </div>
              <div className="lec-meta-field">
                <span className="meta-label">Assigned Subjects Count:</span>
                <span className="meta-value badge-count">{profile.assignedSubjectsCount} subjects</span>
              </div>
              <div className="lec-meta-field">
                <span className="meta-label">Faculty Office:</span>
                <span className="meta-value">{profile.office}</span>
              </div>
              <div className="lec-meta-field">
                <span className="meta-label">Specialization:</span>
                <span className="meta-value">{profile.specialization}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveContact} className="lec-contact-edit-form">
              <div className="lec-form-group">
                <label className="lec-form-label">Official Academic Email Address</label>
                <input
                  type="email"
                  className={`lec-input ${emailError ? 'input-error' : ''}`}
                  value={editEmail}
                  onChange={(e) => {
                    setEditEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  placeholder="e.g. lecturer@seu.ac.lk"
                />
                {emailError && <span className="lec-field-error">{emailError}</span>}
                <span className="lec-field-hint">Used for receiving official faculty circulars and notifications.</span>
              </div>

              <div className="lec-form-group">
                <label className="lec-form-label">Official Contact Phone Number</label>
                <input
                  type="text"
                  className={`lec-input ${phoneError ? 'input-error' : ''}`}
                  value={editPhone}
                  onChange={(e) => {
                    setEditPhone(e.target.value);
                    if (phoneError) setPhoneError('');
                  }}
                  placeholder="+94 77 123 4567"
                />
                {phoneError && <span className="lec-field-error">{phoneError}</span>}
                <span className="lec-field-hint">Must include country code (+94).</span>
              </div>

              <div className="lec-form-actions-row">
                <button type="submit" className="lec-btn-save-primary">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="lec-btn-cancel-secondary"
                  onClick={handleCancelContactEdit}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Password Management & Policy Notification */}
        <div className="lec-profile-card">
          <div className="lec-card-header-bar">
            <div>
              <h3 className="lec-card-heading">Password Management & Security</h3>
              <p className="lec-card-subheading">Update your portal authentication passphrase</p>
            </div>
          </div>

          {/* Faculty Security Policy Enforcement Notification */}
          <div className="lec-security-policy-alert">
            <div className="alert-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="alert-content">
              <h4 className="alert-title">Faculty Security Policy Enforcement</h4>
              <p className="alert-text">
                Password changes must be at least 8 characters long and cannot be identical to previous passwords.
                If you have forgotten your primary master credentials or require administrative unlocking, please contact the SEUSL IT Support Helpdesk directly at{' '}
                <a href="mailto:it-support@seu.ac.lk" className="alert-link">
                  it-support@seu.ac.lk
                </a>.
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="lec-password-form">
            {passwordError && (
              <div className="lec-form-alert error-alert">
                <span>{passwordError}</span>
              </div>
            )}
            {passwordSuccess && (
              <div className="lec-form-alert success-alert">
                <span>{passwordSuccess}</span>
              </div>
            )}

            <div className="lec-form-group">
              <label className="lec-form-label">Current Password</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                className="lec-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password (demo: 123456)"
              />
            </div>

            <div className="lec-form-group">
              <label className="lec-form-label">New Password</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                className="lec-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>

            <div className="lec-form-group">
              <label className="lec-form-label">Confirm New Password</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                className="lec-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
              />
            </div>

            <div className="lec-checkbox-wrap">
              <label className="lec-checkbox-label">
                <input
                  type="checkbox"
                  checked={showPasswords}
                  onChange={(e) => setShowPasswords(e.target.checked)}
                />
                <span>Show passwords</span>
              </label>
            </div>

            <div className="lec-form-actions-row">
              <button type="submit" className="lec-btn-save-primary">
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

