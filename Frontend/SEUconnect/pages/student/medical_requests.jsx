import React, { useState } from 'react';
import './medical_requests.css';

// Default medical submissions matching the live portal exactly
const INITIAL_SUBMISSIONS = [
  {
    id: 'MED-2026-0003',
    leaveFrom: '10/29/2026',
    leaveTo: '10/20/2026',
    reason: 'i have sevice haedache',
    medicalCenter: 'University Medical Center - SEUSL',
    submittedOn: '10/18/2026',
    status: 'Submitted',
    remarks: 'Under administrative review by Faculty Committee'
  },
  {
    id: 'MED-2026-0042',
    leaveFrom: '9/8/2026',
    leaveTo: '9/10/2026',
    reason: 'Severe migraine and dehydration requiring clinical rest',
    medicalCenter: 'District General Hospital, Kalmunai',
    submittedOn: '9/22/2026',
    status: 'Approved',
    remarks: 'Approved by Faculty Board'
  },
  {
    id: 'MED-2026-0012',
    leaveFrom: '8/15/2026',
    leaveTo: '8/18/2026',
    reason: 'Acute viral bronchitis under medical supervision',
    medicalCenter: 'University Medical Center - SEUSL',
    submittedOn: '9/22/2026',
    status: 'Approved',
    remarks: 'Valid UMC endorsement confirmed. Attendance credited as Excused_Medical.'
  }
];

export default function MedicalRequests() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
  const [successMessage, setSuccessMessage] = useState('');

  // Form Fields
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [institution, setInstitution] = useState('University Medical Center - SEUSL');
  const [serialNumber, setSerialNumber] = useState('');
  const [physicianName, setPhysicianName] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNextFromStep1 = (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      alert('Please fill in the medical leave dates and diagnosis/reason.');
      return;
    }
    setCurrentStep(2);
  };

  const handleNextFromStep2 = (e) => {
    e.preventDefault();
    if (!institution) {
      alert('Please select an issuing health institution.');
      return;
    }
    setCurrentStep(3);
  };

  const handleNextFromStep3 = (e) => {
    e.preventDefault();
    setCurrentStep(4);
  };

  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const newId = `MED-2026-00${String(submissions.length + 1).padStart(2, '0')}`;
      const now = new Date();
      const submittedDate = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;

      const newSubmission = {
        id: newId,
        leaveFrom: startDate,
        leaveTo: endDate,
        reason: reason,
        medicalCenter: institution,
        submittedOn: submittedDate,
        status: 'Submitted',
        remarks: 'Under administrative review by Faculty Committee'
      };

      setSubmissions([newSubmission, ...submissions]);
      setIsSubmitting(false);
      setSuccessMessage('Medical request submitted successfully for Faculty Committee & Dean endorsement.');

      // Reset form
      setStartDate('');
      setEndDate('');
      setReason('');
      setSerialNumber('');
      setPhysicianName('');
      setAttachedFile(null);
      setCurrentStep(1);

      // Dismiss message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    }, 400);
  };

  return (
    <div className="medical-container">
      {/* 1. Page Header */}
      <div className="page-header">
        <h1>Medical Absence Requests</h1>
        <p>Submit and track medical certificates for missed lectures, practical laboratories, or continuous assessments.</p>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="medical-success-banner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {/* 2. New Medical Certificate Submission Card */}
      <section className="medical-card">
        <h3 className="card-title">New Medical Certificate Submission</h3>

        {/* 4-Step Numbered Stepper (Matching Screenshot 1 exactly) */}
        <div className="stepper-container">
          {[1, 2, 3, 4].map((num) => {
            const isCompleted = currentStep > num;
            const isCurrent = currentStep === num;

            return (
              <div
                key={num}
                className={`step-circle ${isCurrent ? 'active' : isCompleted ? 'completed' : 'inactive'}`}
                onClick={() => isCompleted && setCurrentStep(num)}
                style={{ cursor: isCompleted ? 'pointer' : 'default' }}
                title={`Step ${num}`}
              >
                {isCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  num
                )}
              </div>
            );
          })}
        </div>

        {/* STEP 1: Leave Period & Reason */}
        {currentStep === 1 && (
          <form onSubmit={handleNextFromStep1} className="medical-step-form">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="med-start-date">
                  Medical Leave Start Date *
                </label>
                <div className="date-picker-input-wrapper">
                  <input
                    id="med-start-date"
                    type="date"
                    className="form-input date-input-field"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    onClick={(e) => {
                      try {
                        if (e.target.showPicker) e.target.showPicker();
                      } catch (_) {}
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="calendar-icon-btn"
                    onClick={() => {
                      const el = document.getElementById('med-start-date');
                      if (el && el.showPicker) el.showPicker();
                      else if (el) el.focus();
                    }}
                    title="Choose Date from Calendar"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </button>
                </div>
                {startDate && (
                  <span className="date-selected-hint">
                    Selected: {new Date(startDate + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="med-end-date">
                  Medical Leave End Date *
                </label>
                <div className="date-picker-input-wrapper">
                  <input
                    id="med-end-date"
                    type="date"
                    className="form-input date-input-field"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(e) => setEndDate(e.target.value)}
                    onClick={(e) => {
                      try {
                        if (e.target.showPicker) e.target.showPicker();
                      } catch (_) {}
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="calendar-icon-btn"
                    onClick={() => {
                      const el = document.getElementById('med-end-date');
                      if (el && el.showPicker) el.showPicker();
                      else if (el) el.focus();
                    }}
                    title="Choose Date from Calendar"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </button>
                </div>
                {endDate && (
                  <span className="date-selected-hint">
                    Selected: {new Date(endDate + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="med-reason">
                Diagnosis / Reason for Absence *
              </label>
              <textarea
                id="med-reason"
                className="form-textarea"
                rows="3"
                placeholder="Describe clinical reason (e.g. Acute viral fever with physician ordered bed rest)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            <div className="medical-form-actions-right">
              <button type="submit" className="btn-primary">
                Next Step
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Medical Authority Details */}
        {currentStep === 2 && (
          <form onSubmit={handleNextFromStep2} className="medical-step-form">
            <div className="form-group">
              <label className="form-label" htmlFor="med-institution">
                Issuing Health Institution *
              </label>
              <select
                id="med-institution"
                className="form-select"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                required
              >
                <option value="University Medical Center - SEUSL">University Medical Center - SEUSL</option>
                <option value="District General Hospital, Kalmunai">District General Hospital, Kalmunai</option>
                <option value="Teaching Hospital, Batticaloa">Teaching Hospital, Batticaloa</option>
                <option value="Base Hospital, Sammanthurai">Base Hospital, Sammanthurai</option>
                <option value="Other Registered Government Hospital">Other Registered Government Hospital</option>
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="med-serial">
                  Certificate Serial Number
                </label>
                <input
                  id="med-serial"
                  type="text"
                  className="form-input"
                  placeholder="e.g. MC/UMC/2026/894"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="med-physician">
                  Medical Officer / Physician Name
                </label>
                <input
                  id="med-physician"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Dr. S.M. Farook (CMO)"
                  value={physicianName}
                  onChange={(e) => setPhysicianName(e.target.value)}
                />
              </div>
            </div>

            <div className="medical-form-actions-between">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setCurrentStep(1)}
              >
                Back
              </button>
              <button type="submit" className="btn-primary">
                Next Step
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Certificate Attachment */}
        {currentStep === 3 && (
          <form onSubmit={handleNextFromStep3} className="medical-step-form">
            <div className="form-group">
              <label className="form-label" htmlFor="med-file-upload">
                Upload Scanned Medical Certificate (PDF, JPG, PNG)
              </label>
              <input
                id="med-file-upload"
                type="file"
                className="form-input"
                accept=".pdf,image/*"
                onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
              />
              <div className="medical-help-text">
                Ensure official hospital seal and doctor's SLMC registration number are legible.
              </div>
            </div>

            <div className="medical-form-actions-between">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setCurrentStep(2)}
              >
                Back
              </button>
              <button type="submit" className="btn-primary">
                Review Summary
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: Review & Confirm */}
        {currentStep === 4 && (
          <div className="medical-step-form">
            <div className="medical-review-box">
              <div className="review-row">
                <strong>Period:</strong> {startDate || 'N/A'} to {endDate || 'N/A'}
              </div>
              <div className="review-row">
                <strong>Reason:</strong> {reason || 'N/A'}
              </div>
              <div className="review-row">
                <strong>Medical Facility:</strong> {institution}
              </div>
              <div className="review-row">
                <strong>Physician / Certificate:</strong> {physicianName || 'Not specified'} ({serialNumber || 'N/A'})
              </div>
              <div className="review-row">
                <strong>Attached File:</strong> {attachedFile ? attachedFile.name : 'Physical copy to be produced to Head of Dept'}
              </div>
            </div>

            <div className="medical-form-actions-between">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setCurrentStep(3)}
              >
                Back
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Confirm & Submit to Faculty Board'}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 3. Previous Medical Submissions Table Card */}
      <section className="medical-card">
        <h3 className="card-title">Previous Medical Submissions ({submissions.length})</h3>

        <div className="table-responsive">
          <table className="medical-table">
            <thead>
              <tr>
                <th>REQUEST ID</th>
                <th>LEAVE PERIOD</th>
                <th>REASON</th>
                <th>MEDICAL CENTER</th>
                <th>SUBMITTED ON</th>
                <th>CURRENT STATUS</th>
                <th>OFFICIAL REMARKS</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No medical requests on record.
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <div className="medical-id-cell">
                        <div>MED-2026-</div>
                        <div>{sub.id.replace('MED-2026-', '')}</div>
                      </div>
                    </td>
                    <td>
                      <div className="medical-period-cell">
                        <div>
                          {sub.leaveFrom || (sub.leavePeriod ? sub.leavePeriod.split('–')[0].trim() : (sub.id === 'MED-2026-0003' ? '10/29/2026' : sub.id === 'MED-2026-0042' ? '9/8/2026' : '8/15/2026'))} –
                        </div>
                        <div>
                          {sub.leaveTo || (sub.leavePeriod ? sub.leavePeriod.split('–')[1]?.trim() : (sub.id === 'MED-2026-0003' ? '10/20/2026' : sub.id === 'MED-2026-0042' ? '9/10/2026' : '8/18/2026'))}
                        </div>
                      </div>
                    </td>
                    <td>{sub.reason}</td>
                    <td>{sub.medicalCenter}</td>
                    <td>{sub.submittedOn}</td>
                    <td>
                      <span className={sub.status === 'Approved' ? 'badge-approved' : 'badge-submitted'}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="medical-remarks-cell">
                      {sub.remarks}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
