import React, { useState } from 'react';
import './academic_profile.css';

export default function AcademicProfile({ user, onProfileUpdate }) {
  // Pre-fill profile details from user prop or standard SEU student records
  const name = user?.name || 'M.N.M. Afnan';
  const email = user?.email || '22ict085@seu.ac.lk';
  const registrationNumber = user?.regNo || user?.registrationNumber || '22ICT085';
  const indexNumber = user?.indexNo || user?.indexNumber || 'ICT22085';
  const degreeProgramme = user?.degreeProgramme || user?.programme || 'BICT';
  const faculty = user?.faculty || 'Faculty of Technology';
  const department = user?.department || 'Department of Information and Communication Technology';
  const semester = user?.semester || user?.currentSemester || 5;

  // Editable Form Fields
  const [phone, setPhone] = useState(user?.phone || '+94 77 1234567');
  const [specialization, setSpecialization] = useState(user?.specialization || 'Software Systems');
  const [address, setAddress] = useState(
    user?.address || 'Technology Hostel, Faculty of Technology, SEUSL'
  );
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);

  // Status flags
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Initial avatar letter (e.g. 'M')
  const avatarInitial = user?.avatarInitial || (name ? name.charAt(0).toUpperCase() : 'M');

  // Handle uploading a local picture
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target.result);
        setIsUploading(false);
      };
      reader.onerror = () => {
        alert('Failed to read image file.');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle removing the photo
  const handleRemovePhoto = () => {
    if (window.confirm('Are you sure you want to remove your profile picture?')) {
      setProfileImage(null);
    }
  };

  // Handle saving the updated contact & academic info
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    // Simulate network save
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);

      const updatedData = {
        ...user,
        phone,
        specialization,
        address,
        profileImage
      };

      if (typeof onProfileUpdate === 'function') {
        onProfileUpdate(updatedData);
      }

      // Hide success notification after 4 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 4000);
    }, 450);
  };

  return (
    <div className="academic-profile-container">
      {/* 1. Page Header */}
      <div className="page-header">
        <h1>Student Academic Profile</h1>
        <p>Institutional identity, contact records, and degree programme enrollment.</p>
      </div>

      {/* 2. Success Alert Message */}
      {saveSuccess && (
        <div className="profile-alert-success" role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>Profile updated successfully!</span>
        </div>
      )}

      {/* 3. Student Identity Card */}
      <div className="seu-card profile-id-card">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar-circle">
            {profileImage ? (
              <img src={profileImage} alt={name} className="profile-avatar-img" />
            ) : (
              avatarInitial
            )}
          </div>
        </div>

        <div className="profile-identity-details">
          <h2 className="profile-name">{name}</h2>
          <div className="profile-email">{email}</div>
          <div className="profile-badges-row">
            <span className="badge badge-info">Reg No: {registrationNumber}</span>
            <span className="badge badge-neutral">Index: {indexNumber}</span>
            <span className="badge badge-success">{degreeProgramme} (Hons)</span>
          </div>
        </div>

        <div className="profile-avatar-actions">
          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {isUploading ? 'Uploading...' : 'Change Photo'}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
              disabled={isUploading}
            />
          </label>

          {profileImage && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="btn btn-sm btn-remove-photo"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Remove Photo
            </button>
          )}
        </div>
      </div>

      {/* 4. Edit Contact & Academic Information Card */}
      <div className="seu-card">
        <div className="seu-card-header">
          <h3 className="seu-card-title">Edit Contact & Academic Information</h3>
        </div>

        <form onSubmit={handleSaveProfile} className="profile-form">
          {/* Row 1: Full Name & University Email */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input form-input-readonly"
                value={name}
                disabled
                readOnly
              />
            </div>
            <div className="form-group">
              <label className="form-label">University Email</label>
              <input
                type="email"
                className="form-input form-input-readonly"
                value={email}
                disabled
                readOnly
              />
            </div>
          </div>

          {/* Row 2: Faculty, Department, Degree Programme */}
          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Faculty</label>
              <input
                type="text"
                className="form-input form-input-readonly"
                value={faculty}
                disabled
                readOnly
              />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                className="form-input form-input-readonly"
                value={department}
                disabled
                readOnly
              />
            </div>
            <div className="form-group">
              <label className="form-label">Degree Programme</label>
              <input
                type="text"
                className="form-input form-input-readonly"
                value={`${degreeProgramme} (Semester ${semester})`}
                disabled
                readOnly
              />
            </div>
          </div>

          {/* Row 3: Contact Mobile & Field of Specialization */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Contact Mobile Number</label>
              <input
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="077xxxxxxx"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Field of Specialization</label>
              <select
                className="form-select"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
              >
                <option value="Software Systems">Software Systems</option>
                <option value="Network & Cloud Infrastructure">Network & Cloud Infrastructure</option>
                <option value="Multimedia & Web Technologies">Multimedia & Web Technologies</option>
                <option value="Data Engineering">Data Engineering</option>
              </select>
            </div>
          </div>

          {/* Row 4: Permanent / Residential Address */}
          <div className="form-group">
            <label className="form-label">Permanent / Residential Address</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your postal address"
            />
          </div>

          {/* Form Actions */}
          <div className="profile-form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
