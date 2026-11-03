import React, { useState } from 'react';
import { INITIAL_MEDICAL_SUBMISSIONS } from './lecturerMockData.js';

/**
 * MedicalVerification Component
 * Student Medical Verification interface where lecturers review,
 * inspect certificates, and verify/approve or reject student medical submissions.
 */
export default function MedicalVerification({ onShowToast, onNavigateBack }) {
  const [submissions, setSubmissions] = useState(INITIAL_MEDICAL_SUBMISSIONS);
  const [selectedModule, setSelectedModule] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [previewSubmission, setPreviewSubmission] = useState(null);
  const [rejectingSubmission, setRejectingSubmission] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('Exceeded standard 48-hour submission window without prior intimation');

  // Counts
  const pendingCount = submissions.filter((s) => s.status === 'Pending Verification').length;
  const verifiedCount = submissions.filter((s) => s.status === 'Verified & Excused').length;
  const rejectedCount = submissions.filter((s) => s.status === 'Rejected').length;

  // Filtered submissions
  const filteredSubmissions = submissions.filter((s) => {
    const matchesModule = selectedModule === 'All' || s.subjectCode === selectedModule;
    const matchesStatus = selectedStatus === 'All' || s.status === selectedStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.studentName.toLowerCase().includes(q) ||
      s.regNo.toLowerCase().includes(q) ||
      s.mcRefNo.toLowerCase().includes(q) ||
      s.subjectCode.toLowerCase().includes(q);
    return matchesModule && matchesStatus && matchesSearch;
  });

  const handleVerify = (id) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'Verified & Excused' } : s))
    );
    const item = submissions.find((s) => s.id === id);
    if (onShowToast) {
      onShowToast(
        `Medical verified for ${item?.studentName || 'Student'} (${item?.regNo}). Attendance marked as Excused Medical.`,
        'success'
      );
    }
  };

  const handleOpenReject = (submission) => {
    setRejectingSubmission(submission);
    setRejectionReason('Exceeded standard 48-hour submission window without prior intimation');
  };

  const handleConfirmReject = () => {
    if (!rejectingSubmission) return;
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === rejectingSubmission.id
          ? { ...s, status: 'Rejected', rejectionRemarks: rejectionReason }
          : s
      )
    );
    if (onShowToast) {
      onShowToast(
        `Medical submission for ${rejectingSubmission.studentName} rejected. Notice sent to student.`,
        'warning'
      );
    }
    setRejectingSubmission(null);
  };

  const handleVerifyAllPending = () => {
    const toVerify = filteredSubmissions.filter((s) => s.status === 'Pending Verification');
    if (toVerify.length === 0) {
      if (onShowToast) onShowToast('No pending submissions to verify.', 'info');
      return;
    }
    setSubmissions((prev) =>
      prev.map((s) =>
        s.status === 'Pending Verification' ? { ...s, status: 'Verified & Excused' } : s
      )
    );
    if (onShowToast) {
      onShowToast(
        `Successfully verified ${toVerify.length} student medical submissions and forwarded to HOD.`,
        'success'
      );
    }
  };

  const handleForwardToHOD = () => {
    if (onShowToast) {
      onShowToast(
        'All verified medical endorsements submitted to Head of Department (HOD) for Faculty Board ratification.',
        'success'
      );
    }
  };

  return (
    <div className="lec-medical-verification-page">
      {/* 1. Header with Breadcrumb & Back button */}
      <div className="lec-module-header-card">
        <div>
          <div className="lec-med-breadcrumb">
            <button
              type="button"
              className="lec-med-back-btn"
              onClick={onNavigateBack || (() => window.history.back())}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to Notifications
            </button>
            <span className="lec-med-breadcrumb-sep">/</span>
            <span className="lec-med-breadcrumb-current">Student Medical Approval & Verification</span>
          </div>

          <h2 className="lec-module-title">Student Medical Approval and Verification</h2>
          <p className="lec-module-sub">
            Review submitted medical certificates, verify student lecture/lab absences for assigned course modules, and forward endorsements to the HOD.
          </p>
        </div>

        <div className="lec-med-header-actions">
          <button
            type="button"
            className="lec-btn-bulk-verify"
            onClick={handleVerifyAllPending}
            disabled={pendingCount === 0}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Verify All Pending ({pendingCount})
          </button>
          <button
            type="button"
            className="lec-btn-forward-hod"
            onClick={handleForwardToHOD}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            Forward to HOD
          </button>
        </div>
      </div>

      {/* 2. Quick Metrics Tally */}
      <div className="lec-med-stats-grid">
        <div className="lec-med-stat-box total">
          <div className="med-stat-num">{submissions.length}</div>
          <div className="med-stat-label">Total Submissions</div>
        </div>
        <div className="lec-med-stat-box pending">
          <div className="med-stat-num">{pendingCount}</div>
          <div className="med-stat-label">Pending Verification</div>
        </div>
        <div className="lec-med-stat-box verified">
          <div className="med-stat-num">{verifiedCount}</div>
          <div className="med-stat-label">Verified & Excused</div>
        </div>
        <div className="lec-med-stat-box rejected">
          <div className="med-stat-num">{rejectedCount}</div>
          <div className="med-stat-label">Rejected</div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="lec-med-controls-card">
        <div className="lec-med-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by student name, Reg No (e.g. 22ICT085), or MC ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="clear-search-btn" onClick={() => setSearchQuery('')}>
              ×
            </button>
          )}
        </div>

        <div className="lec-med-filter-group">
          <div className="lec-med-select-wrap">
            <label>Module:</label>
            <select value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}>
              <option value="All">All Course Modules</option>
              <option value="SWT22022">SWT22022 - Software Engineering</option>
              <option value="SWT21032">SWT21032 - Web Application Dev</option>
            </select>
          </div>

          <div className="lec-med-select-wrap">
            <label>Status:</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Verified & Excused">Verified & Excused</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Submissions Feed Cards */}
      <div className="lec-med-submissions-list">
        {filteredSubmissions.length === 0 ? (
          <div className="lec-empty-state-card">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <h4>No Medical Submissions Found</h4>
            <p>No records match your active search and filter criteria.</p>
          </div>
        ) : (
          filteredSubmissions.map((sub) => {
            const isPending = sub.status === 'Pending Verification';
            const isVerified = sub.status === 'Verified & Excused';
            const isRejected = sub.status === 'Rejected';

            return (
              <div key={sub.id} className={`lec-med-card ${sub.status.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                {/* Card Top Row */}
                <div className="lec-med-card-top">
                  <div className="lec-med-student-info">
                    <div className="lec-med-avatar">
                      {sub.studentName.split(' ').map((n) => n[0]).filter(Boolean).slice(0, 2).join('')}
                    </div>
                    <div>
                      <div className="lec-med-student-name">
                        {sub.studentName}
                        <span className="lec-med-reg-badge">{sub.regNo}</span>
                      </div>
                      <div className="lec-med-subject-line">
                        <span className="lec-med-code">{sub.subjectCode}</span>
                        <span>{sub.subjectName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="lec-med-status-col">
                    <span
                      className={`lec-med-status-badge ${
                        isVerified ? 'verified' : isRejected ? 'rejected' : 'pending'
                      }`}
                    >
                      {sub.status}
                    </span>
                    <span className="lec-med-submitted-time">Submitted {sub.submittedAt}</span>
                  </div>
                </div>

                {/* Card Middle Details Grid */}
                <div className="lec-med-details-grid">
                  <div className="lec-med-detail-item">
                    <span className="med-detail-label">Missed Session:</span>
                    <span className="med-detail-val font-semibold">{sub.sessionDate} • {sub.sessionType}</span>
                  </div>
                  <div className="lec-med-detail-item">
                    <span className="med-detail-label">MC Reference No:</span>
                    <span className="med-detail-val font-mono text-sky">{sub.mcRefNo}</span>
                  </div>
                  <div className="lec-med-detail-item">
                    <span className="med-detail-label">Hospital / Clinic:</span>
                    <span className="med-detail-val">{sub.medicalFacility}</span>
                  </div>
                  <div className="lec-med-detail-item">
                    <span className="med-detail-label">Attending Physician:</span>
                    <span className="med-detail-val">{sub.physicianName}</span>
                  </div>
                  <div className="lec-med-detail-item full-width">
                    <span className="med-detail-label">Medical Diagnosis & Reason:</span>
                    <span className="med-detail-val text-reason">{sub.diagnosis}</span>
                  </div>
                  {sub.rejectionRemarks && (
                    <div className="lec-med-detail-item full-width rejection-note">
                      <span className="med-detail-label text-danger">Rejection Remarks:</span>
                      <span className="med-detail-val text-danger">{sub.rejectionRemarks}</span>
                    </div>
                  )}
                </div>

                {/* Card Bottom Actions */}
                <div className="lec-med-card-actions">
                  <button
                    type="button"
                    className="lec-btn-preview-cert"
                    onClick={() => setPreviewSubmission(sub)}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    View Medical Certificate
                  </button>

                  <div className="lec-med-action-buttons">
                    {isPending ? (
                      <>
                        <button
                          type="button"
                          className="lec-btn-reject-med"
                          onClick={() => handleOpenReject(sub)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                          Reject
                        </button>
                        <button
                          type="button"
                          className="lec-btn-approve-med"
                          onClick={() => handleVerify(sub.id)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Verify & Excuse Attendance
                        </button>
                      </>
                    ) : isVerified ? (
                      <span className="lec-verified-stamp">
                        ✓ Verified by Lecturer (Forwarded to HOD)
                      </span>
                    ) : (
                      <span className="lec-rejected-stamp">
                        ✕ Rejected Submission
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ====================================================================
          CERTIFICATE PREVIEW MODAL
          ==================================================================== */}
      {previewSubmission && (
        <div className="lec-modal-overlay" onClick={() => setPreviewSubmission(null)}>
          <div className="lec-modal-content cert-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lec-cert-header">
              <div className="cert-top-emblem">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M12 11v6" />
                  <path d="M9 14h6" />
                </svg>
                <span>OFFICIAL MEDICAL CONCESSION DOCUMENT</span>
              </div>
              <button
                type="button"
                className="lec-modal-close"
                onClick={() => setPreviewSubmission(null)}
              >
                ×
              </button>
            </div>

            <div className="lec-cert-body">
              <div className="cert-inst-title">SOUTH EASTERN UNIVERSITY OF SRI LANKA</div>
              <div className="cert-inst-sub">FACULTY OF TECHNOLOGY • MEDICAL CENTER & CLINICAL BOARD</div>
              <div className="cert-divider"></div>

              <div className="cert-info-grid">
                <div>
                  <span className="cert-label">Certificate Ref No:</span>
                  <span className="cert-val font-mono">{previewSubmission.mcRefNo}</span>
                </div>
                <div>
                  <span className="cert-label">Submission Date:</span>
                  <span className="cert-val">{previewSubmission.submittedAt}</span>
                </div>
                <div>
                  <span className="cert-label">Student Name:</span>
                  <span className="cert-val font-bold">{previewSubmission.studentName}</span>
                </div>
                <div>
                  <span className="cert-label">Registration No:</span>
                  <span className="cert-val font-bold">{previewSubmission.regNo}</span>
                </div>
                <div>
                  <span className="cert-label">Course Module:</span>
                  <span className="cert-val">{previewSubmission.subjectCode} - {previewSubmission.subjectName}</span>
                </div>
                <div>
                  <span className="cert-label">Leave Period:</span>
                  <span className="cert-val">{previewSubmission.leaveFrom} to {previewSubmission.leaveTo}</span>
                </div>
              </div>

              <div className="cert-diagnosis-box">
                <div className="cert-box-title">Clinical Findings & Medical Grounds</div>
                <p className="cert-diagnosis-text">{previewSubmission.diagnosis}</p>
                <div className="cert-hospital-line">
                  Issued by: <strong>{previewSubmission.physicianName}</strong> ({previewSubmission.medicalFacility})
                </div>
              </div>

              <div className="cert-endorsement-banner">
                <div className="cert-seal-badge">
                  ✓ UMO VERIFIED
                </div>
                <div className="cert-seal-text">
                  This certificate has been submitted within the 48-hour examination regulation window and authenticated against University Medical Officer registry records.
                </div>
              </div>
            </div>

            <div className="lec-modal-footer">
              <button
                type="button"
                className="lec-btn-cancel-modal"
                onClick={() => setPreviewSubmission(null)}
              >
                Close Preview
              </button>
              {previewSubmission.status === 'Pending Verification' && (
                <button
                  type="button"
                  className="lec-btn-approve-modal"
                  onClick={() => {
                    handleVerify(previewSubmission.id);
                    setPreviewSubmission(null);
                  }}
                >
                  Verify & Approve
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          REJECTION CONFIRMATION MODAL
          ==================================================================== */}
      {rejectingSubmission && (
        <div className="lec-modal-overlay" onClick={() => setRejectingSubmission(null)}>
          <div className="lec-modal-content reject-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lec-modal-header">
              <h3 className="lec-modal-title">Reject Medical Submission</h3>
              <button
                type="button"
                className="lec-modal-close"
                onClick={() => setRejectingSubmission(null)}
              >
                ×
              </button>
            </div>

            <div className="lec-modal-body">
              <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.9rem' }}>
                Rejecting submission for <strong>{rejectingSubmission.studentName} ({rejectingSubmission.regNo})</strong> for module <strong>{rejectingSubmission.subjectCode}</strong>.
              </p>

              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                Select Grounds for Rejection:
              </label>
              <select
                className="lec-select"
                style={{ width: '100%', marginBottom: '1rem' }}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              >
                <option value="Exceeded standard 48-hour submission window without prior intimation">
                  Exceeded standard 48-hour submission window
                </option>
                <option value="Medical certificate from non-accredited private institution lacking UMO endorsement">
                  Missing University Medical Officer (UMO) endorsement
                </option>
                <option value="Incomplete clinical diagnosis or illegible medical stamp">
                  Incomplete clinical diagnosis or illegible stamp
                </option>
                <option value="Absence dates do not correspond with scheduled course assessment dates">
                  Dates do not correspond with scheduled assessment
                </option>
              </select>
            </div>

            <div className="lec-modal-footer">
              <button
                type="button"
                className="lec-btn-cancel-modal"
                onClick={() => setRejectingSubmission(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="lec-btn-confirm-reject"
                onClick={handleConfirmReject}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

