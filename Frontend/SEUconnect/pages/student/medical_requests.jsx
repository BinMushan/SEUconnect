import { useState, useEffect, useCallback } from 'react';
import api from '../../src/services/api.js';
import './medical_requests.css';

const ABSENCE_TYPES = {
  lecture: { label: 'Absent from lectures / practicals (Subject Medical)', type: 'subject_medical', to: 'Department MA' },
  exam: { label: 'Absent from an examination or CA (Examination Medical)', type: 'exam_medical', to: 'Faculty MA' },
};

// "ICT3113 - Software Engineering" per line (or comma separated codes) -> [{ code, title }]
const parseSubjects = (text) =>
  text
    .split(/\n|,/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [code, ...rest] = line.split(/\s+-\s+|\s{2,}/);
      return { code: code.trim(), title: rest.join(' ').trim() };
    });

const toRow = (p) => ({
  id: p.trackingNumber,
  leaveFrom: p.formData?.medical?.fromDate || p.details?.absenceDate,
  leaveTo: p.formData?.medical?.toDate || p.details?.endDate,
  reason: p.formData?.medical?.reason || p.details?.reason,
  medicalCenter: p.formData?.medical?.hospital || p.details?.hospitalClinic || '-',
  submittedOn: new Date(p.createdAt).toLocaleDateString('en-GB'),
  status: p.status,
  remarks:
    p.status === 'Returned for Correction'
      ? p.returnDetails?.reason
      : p.status === 'Declined'
        ? p.declineDetails?.reason
        : p.status === 'Approved'
          ? 'Approved'
          : `With ${p.currentAssignedRole === 'dept_ma' ? 'Department MA' : p.currentAssignedRole === 'fma' ? 'Faculty MA' : p.currentAssignedRole}`,
});

export default function MedicalRequests({ user }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submissions, setSubmissions] = useState([]);
  const [absenceType, setAbsenceType] = useState('lecture');
  const [subjectsText, setSubjectsText] = useState('');
  const [submitError, setSubmitError] = useState('');

  const loadSubmissions = useCallback(async () => {
    try {
      const res = await api.getProcesses();
      setSubmissions((res.data || []).filter((p) => p.type === 'subject_medical' || p.type === 'exam_medical').map(toRow));
    } catch (err) {
      setSubmitError(err.message);
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);
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
    if (endDate < startDate) {
      alert('The leave end date cannot be before the start date.');
      return;
    }
    if (reason.trim().length < 10) {
      alert('Please describe the medical reason in at least 10 characters.');
      return;
    }
    if (parseSubjects(subjectsText).length === 0) {
      alert('List at least one affected subject (for example: ICT3113 - Software Engineering).');
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

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    const route = ABSENCE_TYPES[absenceType];
    try {
      const res = await api.createProcess({
        type: route.type,
        semester: user?.semester,
        subjects: parseSubjects(subjectsText),
        medical: {
          reason: reason.trim(),
          fromDate: startDate,
          toDate: endDate,
          doctorName: physicianName,
          hospital: institution,
          certificateNo: serialNumber,
          documentName: attachedFile ? attachedFile.name : '',
        },
      });
      await loadSubmissions();
      setSuccessMessage(`${res.data.trackingNumber} submitted to the ${route.to}. You will be notified at every step.`);

      setStartDate('');
      setEndDate('');
      setReason('');
      setSubjectsText('');
      setSerialNumber('');
      setPhysicianName('');
      setAttachedFile(null);
      setCurrentStep(1);
      setTimeout(() => setSuccessMessage(''), 6000);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
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

            <div className="form-group">
              <label className="form-label" htmlFor="med-type">
                What did you miss? *
              </label>
              <select id="med-type" className="form-select" value={absenceType} onChange={(e) => setAbsenceType(e.target.value)}>
                {Object.entries(ABSENCE_TYPES).map(([key, t]) => (
                  <option key={key} value={key}>
                    {t.label}
                  </option>
                ))}
              </select>
              <span className="date-selected-hint">Goes to the {ABSENCE_TYPES[absenceType].to}.</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="med-subjects">
                Affected subjects * (one per line, e.g. ICT3113 - Software Engineering)
              </label>
              <textarea id="med-subjects" className="form-textarea" rows="3" value={subjectsText} onChange={(e) => setSubjectsText(e.target.value)} />
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
                <strong>Subjects:</strong> {parseSubjects(subjectsText).map((x) => x.code).join(', ')} ({ABSENCE_TYPES[absenceType].label})
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

            {submitError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.6rem 0.9rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '0.8rem' }}>
                {submitError}
              </div>
            )}

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
                {isSubmitting ? 'Submitting...' : `Confirm & Submit to ${ABSENCE_TYPES[absenceType].to}`}
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
                      <div className="medical-id-cell">{sub.id}</div>
                    </td>
                    <td>
                      <div className="medical-period-cell">
                        <div>{sub.leaveFrom} –</div>
                        <div>{sub.leaveTo}</div>
                      </div>
                    </td>
                    <td>{sub.reason}</td>
                    <td>{sub.medicalCenter}</td>
                    <td>{sub.submittedOn}</td>
                    <td>
                      <span className={sub.status === 'Approved' ? 'badge-approved' : sub.status === 'Declined' || sub.status === 'Returned for Correction' ? 'badge-rejected' : 'badge-submitted'}>
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
