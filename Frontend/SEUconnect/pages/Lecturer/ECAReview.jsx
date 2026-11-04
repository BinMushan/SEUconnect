import React, { useState, useEffect } from 'react';

/**
 * ECAReview Component
 * Dedicated Assigned ECA Applications Review Interface for Course Lecturers.
 * Implements Step 6 of the Faculty of Technology ECA Approval Workflow:
 * (1) Student Submission -> (2) SAR Verification -> (3) Exam Branch Clearance ->
 * (4) Assigned Course Lecturer Review & Verification -> (5) HOD Final Approval
 *
 * NOTE: As per Faculty Examination By-Law Section 4.2, the assigned lecturer
 * verifies academic eligibility and marks the application as "Checked" to forward
 * to the HOD. Lecturers do NOT have final approval authority.
 */
export default function ECAReview({
  applications = [],
  onUpdateApplication,
  onShowToast,
  onNavigateBack,
}) {
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Inspection modal states
  const [selectedApp, setSelectedApp] = useState(null);
  const [lecturerRemarks, setLecturerRemarks] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Quick stats
  const pendingCount = applications.filter((a) => a.status === 'Pending Lecturer Review').length;
  const forwardedCount = applications.filter(
    (a) => a.status === 'Forwarded to HOD' || a.status === 'Checked by Lecturer'
  ).length;
  const approvedCount = applications.filter((a) => a.status === 'Finally Approved by HOD').length;
  const returnedCount = applications.filter((a) => a.status === 'Returned for Correction').length;

  // Filtered applications
  const filteredApps = applications.filter((app) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      app.trackingNumber?.toLowerCase().includes(q) ||
      app.student?.name?.toLowerCase().includes(q) ||
      app.student?.regNo?.toLowerCase().includes(q) ||
      app.details?.subjectCode?.toLowerCase().includes(q) ||
      app.details?.subjectName?.toLowerCase().includes(q);

    const matchesSubject = selectedSubject === 'All' || app.details?.subjectCode === selectedSubject;
    const matchesBatch = selectedBatch === 'All' || app.details?.academicBatch === selectedBatch;
    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'Forwarded to HOD'
        ? app.status === 'Forwarded to HOD' || app.status === 'Checked by Lecturer'
        : app.status === selectedStatus);

    return matchesSearch && matchesSubject && matchesBatch && matchesStatus;
  });

  // Open inspection modal
  const handleOpenInspect = (app) => {
    setSelectedApp(app);
    // Pre-populate existing lecturer remarks if any
    const existingLecturerAudit = app.auditLog?.find(
      (log) => log.action === 'CHECKED_BY_LECTURER' || log.actorRole === 'Course Lecturer'
    );
    setLecturerRemarks(existingLecturerAudit?.comment || 'All coursework and lab sessions verified. Student is eligible for the Continuous Assessment evaluation resit.');
    setReturnReason('');
    setIsReturnModalOpen(false);
  };

  // Close inspection modal
  const handleCloseInspect = () => {
    setSelectedApp(null);
    setLecturerRemarks('');
    setReturnReason('');
    setIsReturnModalOpen(false);
  };

  // Mark as Checked & Forward to HOD
  const handleMarkCheckedAndForward = () => {
    if (!selectedApp) return;

    if (!lecturerRemarks.trim()) {
      if (onShowToast) onShowToast('Please provide verification remarks before forwarding to HOD', 'warning');
      return;
    }

    const updatedApp = {
      ...selectedApp,
      status: 'Forwarded to HOD',
      currentAssignedRole: 'hod',
      currentStageIndex: 4,
      stages: (selectedApp.stages || []).map((stg) => {
        if (stg.stageKey === 'lecturer_check') {
          return {
            ...stg,
            status: 'COMPLETED',
            actionTakenBy: 'Dr. K. Perera (Assigned Lecturer)',
            actionDate: new Date().toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            remarks: lecturerRemarks.trim(),
          };
        }
        if (stg.stageKey === 'hod_final_approval') {
          return {
            ...stg,
            status: 'CURRENT',
          };
        }
        return stg;
      }),
      auditLog: [
        ...(selectedApp.auditLog || []),
        {
          action: 'CHECKED_BY_LECTURER',
          actorName: 'Dr. K. Perera',
          actorRole: 'Course Lecturer',
          timestamp: new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          comment: lecturerRemarks.trim(),
        },
      ],
    };

    if (onUpdateApplication) {
      onUpdateApplication(updatedApp);
    }

    setSelectedApp(updatedApp);

    if (onShowToast) {
      onShowToast(
        `Application ${selectedApp.trackingNumber} verified and forwarded to Head of Department (HOD) for final approval.`,
        'success'
      );
    }
  };

  // Return for Correction
  const handleConfirmReturn = () => {
    if (!selectedApp) return;

    if (!returnReason.trim()) {
      if (onShowToast) onShowToast('Please specify the reason for returning the application', 'warning');
      return;
    }

    const updatedApp = {
      ...selectedApp,
      status: 'Returned for Correction',
      currentAssignedRole: 'student',
      stages: (selectedApp.stages || []).map((stg) => {
        if (stg.stageKey === 'lecturer_check') {
          return {
            ...stg,
            status: 'RETURNED',
            actionTakenBy: 'Dr. K. Perera (Assigned Lecturer)',
            actionDate: new Date().toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            remarks: `Returned: ${returnReason.trim()}`,
          };
        }
        return stg;
      }),
      auditLog: [
        ...(selectedApp.auditLog || []),
        {
          action: 'RETURNED_BY_LECTURER',
          actorName: 'Dr. K. Perera',
          actorRole: 'Course Lecturer',
          timestamp: new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          comment: `Returned for correction: ${returnReason.trim()}`,
        },
      ],
    };

    if (onUpdateApplication) {
      onUpdateApplication(updatedApp);
    }

    setSelectedApp(updatedApp);
    setIsReturnModalOpen(false);

    if (onShowToast) {
      onShowToast(
        `Application ${selectedApp.trackingNumber} returned for student correction.`,
        'warning'
      );
    }
  };

  // Helper for status badge styling
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending Lecturer Review':
        return 'lec-status-pending';
      case 'Under Lecturer Review':
        return 'lec-status-review';
      case 'Forwarded to HOD':
      case 'Checked by Lecturer':
        return 'lec-status-forwarded';
      case 'Finally Approved by HOD':
        return 'lec-status-approved';
      case 'Returned for Correction':
        return 'lec-status-returned';
      default:
        return 'lec-status-default';
    }
  };

  return (
    <div className="lec-eca-review-container">
      {/* 1. Header Banner */}
      <div className="lec-module-header-card">
        <div className="lec-header-left">
          <div className="lec-badge-group">
            <span className="lec-tag-accent">EXAMINATION BRANCH WORKFLOW</span>
            <span className="lec-tag-sub">STEP 4: COURSE LECTURER VERIFICATION</span>
          </div>
          <h2 className="lec-module-title">Assigned ECA Applications Review</h2>
          <p className="lec-module-sub">
            Review and verify Continuous Assessment (ECA) repeat applications forwarded by the Examination Branch for your assigned course modules. Mark verified applications as <strong>Checked</strong> to forward them to the Head of Department (HOD) for official sign-off.
          </p>
        </div>
        {onNavigateBack && (
          <button type="button" className="lec-btn-secondary" onClick={onNavigateBack}>
            Back to Dashboard
          </button>
        )}
      </div>

      {/* 2. Official Workflow Notice Banner */}
      <div className="lec-workflow-notice-box">
        <div className="lec-workflow-notice-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div className="lec-workflow-notice-text">
          <strong>Official Faculty Regulation (Section 4.2):</strong> As Course Lecturer, your responsibility is to check student coursework attendance, verify medical concessions and payment vouchers, and endorse assessment eligibility. <strong>Final approval authority rests exclusively with the Head of Department (HOD).</strong>
        </div>
      </div>

      {/* 3. Stats Strip */}
      <div className="lec-eca-stats-strip">
        <div
          className={`lec-eca-stat-card ${selectedStatus === 'Pending Lecturer Review' ? 'active' : ''}`}
          onClick={() => setSelectedStatus(selectedStatus === 'Pending Lecturer Review' ? 'All' : 'Pending Lecturer Review')}
        >
          <div className="lec-stat-indicator indicator-amber"></div>
          <div>
            <div className="lec-stat-num">{pendingCount}</div>
            <div className="lec-stat-label">Pending Lecturer Review</div>
          </div>
        </div>

        <div
          className={`lec-eca-stat-card ${selectedStatus === 'Forwarded to HOD' ? 'active' : ''}`}
          onClick={() => setSelectedStatus(selectedStatus === 'Forwarded to HOD' ? 'All' : 'Forwarded to HOD')}
        >
          <div className="lec-stat-indicator indicator-indigo"></div>
          <div>
            <div className="lec-stat-num">{forwardedCount}</div>
            <div className="lec-stat-label">Forwarded to HOD</div>
          </div>
        </div>

        <div
          className={`lec-eca-stat-card ${selectedStatus === 'Finally Approved by HOD' ? 'active' : ''}`}
          onClick={() => setSelectedStatus(selectedStatus === 'Finally Approved by HOD' ? 'All' : 'Finally Approved by HOD')}
        >
          <div className="lec-stat-indicator indicator-emerald"></div>
          <div>
            <div className="lec-stat-num">{approvedCount}</div>
            <div className="lec-stat-label">Finally Approved by HOD</div>
          </div>
        </div>

        <div
          className={`lec-eca-stat-card ${selectedStatus === 'Returned for Correction' ? 'active' : ''}`}
          onClick={() => setSelectedStatus(selectedStatus === 'Returned for Correction' ? 'All' : 'Returned for Correction')}
        >
          <div className="lec-stat-indicator indicator-rose"></div>
          <div>
            <div className="lec-stat-num">{returnedCount}</div>
            <div className="lec-stat-label">Returned for Correction</div>
          </div>
        </div>
      </div>

      {/* 4. Filter Toolbar */}
      <div className="lec-eca-filter-bar">
        <div className="lec-search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by student name, reg no, tracking number, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="lec-clear-search-btn" onClick={() => setSearchQuery('')}>
              ×
            </button>
          )}
        </div>

        <div className="lec-filter-dropdowns">
          <div className="lec-filter-group">
            <label>Subject:</label>
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
              <option value="All">All Assigned Subjects</option>
              <option value="SWT21032">SWT21032 — Web App Development</option>
              <option value="SWT22022">SWT22022 — Software Engineering</option>
              <option value="SWT21022">SWT21022 — Data Structures</option>
            </select>
          </div>

          <div className="lec-filter-group">
            <label>Batch:</label>
            <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
              <option value="All">All Batches</option>
              <option value="2022/2023">2022/2023</option>
              <option value="2021/2022">2021/2022</option>
            </select>
          </div>

          <div className="lec-filter-group">
            <label>Status:</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Pending Lecturer Review">Pending Lecturer Review</option>
              <option value="Forwarded to HOD">Forwarded to HOD</option>
              <option value="Finally Approved by HOD">Finally Approved by HOD</option>
              <option value="Returned for Correction">Returned for Correction</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. ECA Applications Table */}
      <div className="lec-eca-table-card">
        <div className="lec-table-header-info">
          <span>Showing <strong>{filteredApps.length}</strong> of <strong>{applications.length}</strong> Assigned Applications</span>
          {(searchQuery || selectedSubject !== 'All' || selectedBatch !== 'All' || selectedStatus !== 'All') && (
            <button
              type="button"
              className="lec-reset-filters-link"
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('All');
                setSelectedBatch('All');
                setSelectedStatus('All');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="lec-table-responsive">
          <table className="lec-eca-table">
            <thead>
              <tr>
                <th>Tracking No & Date</th>
                <th>Student Details</th>
                <th>Subject & Missed Evaluation</th>
                <th>Resit Assessment Context</th>
                <th>Bank Voucher</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan="7" className="lec-no-data-cell">
                    <div className="lec-empty-state">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <h4>No ECA applications found</h4>
                      <p>No applications match the current search or filter criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const isPending = app.status === 'Pending Lecturer Review';
                  return (
                    <tr key={app.id} className={isPending ? 'lec-row-highlight' : ''}>
                      <td>
                        <div className="lec-cell-tracking">{app.trackingNumber}</div>
                        <div className="lec-cell-sub">Submitted: {app.submissionDate}</div>
                      </td>
                      <td>
                        <div className="lec-cell-student-name">{app.student?.name}</div>
                        <div className="lec-cell-sub">
                          <strong>{app.student?.regNo}</strong> • Batch {app.details?.academicBatch || app.student?.batch}
                        </div>
                      </td>
                      <td>
                        <div className="lec-cell-subject">
                          <span className="lec-subject-pill">{app.details?.subjectCode}</span>
                          <span className="lec-subject-title">{app.details?.subjectName}</span>
                        </div>
                        <div className="lec-cell-missed-desc">{app.details?.missedSessions}</div>
                      </td>
                      <td>
                        <div className="lec-cell-resit-info">{app.details?.examDetails}</div>
                      </td>
                      <td>
                        <div className="lec-voucher-cell">
                          <span className="lec-voucher-no">{app.paymentReceipt?.voucherNo}</span>
                          <div className="lec-voucher-sub">
                            Rs. {app.paymentReceipt?.amount} • <span className="lec-sar-tag">SAR Verified</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`lec-status-badge ${getStatusBadgeClass(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className={isPending ? 'lec-btn-inspect-primary' : 'lec-btn-inspect-secondary'}
                          onClick={() => handleOpenInspect(app)}
                        >
                          {isPending ? 'Inspect & Review' : 'View Details'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Inspection & Verification Modal */}
      {selectedApp && (
        <div className="lec-modal-overlay" onClick={handleCloseInspect}>
          <div className="lec-inspect-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="lec-modal-header">
              <div className="lec-modal-title-box">
                <span className="lec-modal-tag">CONTINUOUS ASSESSMENT (ECA) REVIEW</span>
                <h3 className="lec-modal-title">
                  Verification Desk: {selectedApp.trackingNumber}
                </h3>
              </div>
              <div className="lec-modal-header-actions">
                <span className={`lec-status-badge ${getStatusBadgeClass(selectedApp.status)}`}>
                  {selectedApp.status}
                </span>
                <button type="button" className="lec-modal-close-btn" onClick={handleCloseInspect}>
                  ✕
                </button>
              </div>
            </div>

            {/* Workflow Notice Banner inside Modal */}
            <div className="lec-modal-notice-banner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>
                <strong>Lecturer Scope of Authority:</strong> You are verifying that the student has valid coursework standing and that the submitted medical/resit claim conforms to faculty regulations. Marking as <strong>Checked</strong> forwards the application to the Head of Department for final approval.
              </span>
            </div>

            {/* 5-Step Workflow Stepper */}
            <div className="lec-stepper-box">
              <div className="lec-stepper-item completed">
                <div className="lec-step-circle">✓</div>
                <div className="lec-step-info">
                  <div className="lec-step-name">1. Student Application</div>
                  <div className="lec-step-desc">Submitted with Receipt</div>
                </div>
              </div>
              <div className="lec-step-divider completed"></div>

              <div className="lec-stepper-item completed">
                <div className="lec-step-circle">✓</div>
                <div className="lec-step-info">
                  <div className="lec-step-name">2. SAR Clearance</div>
                  <div className="lec-step-desc">Payment Verified</div>
                </div>
              </div>
              <div className="lec-step-divider completed"></div>

              <div className="lec-stepper-item completed">
                <div className="lec-step-circle">✓</div>
                <div className="lec-step-info">
                  <div className="lec-step-name">3. Exam Branch</div>
                  <div className="lec-step-desc">Assigned to Lecturer</div>
                </div>
              </div>
              <div className="lec-step-divider completed"></div>

              <div className={`lec-stepper-item ${selectedApp.status === 'Forwarded to HOD' || selectedApp.status === 'Finally Approved by HOD' ? 'completed' : 'current'}`}>
                <div className="lec-step-circle">
                  {selectedApp.status === 'Forwarded to HOD' || selectedApp.status === 'Finally Approved by HOD' ? '✓' : '4'}
                </div>
                <div className="lec-step-info">
                  <div className="lec-step-name">4. Course Lecturer</div>
                  <div className="lec-step-desc">Academic Verification</div>
                </div>
              </div>
              <div className="lec-step-divider"></div>

              <div className={`lec-stepper-item ${selectedApp.status === 'Finally Approved by HOD' ? 'completed' : ''}`}>
                <div className="lec-step-circle">
                  {selectedApp.status === 'Finally Approved by HOD' ? '✓' : '5'}
                </div>
                <div className="lec-step-info">
                  <div className="lec-step-name">5. HOD Approval</div>
                  <div className="lec-step-desc">Final Endorsement</div>
                </div>
              </div>
            </div>

            {/* Modal Body: 2-Column Layout */}
            <div className="lec-modal-body-grid">
              {/* Left Column: Academic & Document Details */}
              <div className="lec-modal-col-left">
                {/* 1. Student Details Card */}
                <div className="lec-info-card">
                  <h4 className="lec-card-title">Student & Academic Profile</h4>
                  <div className="lec-card-grid-2">
                    <div className="lec-field">
                      <span className="lec-field-label">Student Full Name:</span>
                      <span className="lec-field-val strong">{selectedApp.student?.name}</span>
                    </div>
                    <div className="lec-field">
                      <span className="lec-field-label">Registration Number:</span>
                      <span className="lec-field-val strong">{selectedApp.student?.regNo}</span>
                    </div>
                    <div className="lec-field">
                      <span className="lec-field-label">Degree Programme:</span>
                      <span className="lec-field-val">{selectedApp.student?.programme || 'BICT (Hons)'}</span>
                    </div>
                    <div className="lec-field">
                      <span className="lec-field-label">Department:</span>
                      <span className="lec-field-val">{selectedApp.student?.department || 'Department of ICT'}</span>
                    </div>
                    <div className="lec-field">
                      <span className="lec-field-label">Academic Batch:</span>
                      <span className="lec-field-val">{selectedApp.details?.academicBatch || selectedApp.student?.batch}</span>
                    </div>
                    <div className="lec-field">
                      <span className="lec-field-label">Current Semester:</span>
                      <span className="lec-field-val">{selectedApp.student?.semester || 'Semester 03'}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Assessment & Missed Sitting Details */}
                <div className="lec-info-card">
                  <h4 className="lec-card-title">Course Module & Examination Details</h4>
                  <div className="lec-card-grid-1">
                    <div className="lec-field">
                      <span className="lec-field-label">Subject Code & Name:</span>
                      <span className="lec-field-val strong">
                        {selectedApp.details?.subjectCode} — {selectedApp.details?.subjectName}
                      </span>
                    </div>
                    <div className="lec-field">
                      <span className="lec-field-label">Missed Continuous Assessment Session:</span>
                      <span className="lec-field-val">{selectedApp.details?.missedSessions}</span>
                    </div>
                    <div className="lec-field">
                      <span className="lec-field-label">Evaluation Resit Context:</span>
                      <span className="lec-field-val">{selectedApp.details?.examDetails}</span>
                    </div>
                    <div className="lec-field">
                      <span className="lec-field-label">Stated Cause / Absence Reason:</span>
                      <span className="lec-field-val italic">"{selectedApp.details?.reason}"</span>
                    </div>
                  </div>
                </div>

                {/* 3. Supporting Medical / Document Record */}
                <div className="lec-info-card">
                  <h4 className="lec-card-title">Supporting Documents & Medical Records</h4>
                  <div className="lec-card-grid-2">
                    <div className="lec-field">
                      <span className="lec-field-label">Medical Certificate Ref:</span>
                      <span className="lec-field-val strong">{selectedApp.details?.medicalCertNo}</span>
                    </div>
                    <div className="lec-field">
                      <span className="lec-field-label">Attending Physician:</span>
                      <span className="lec-field-val">{selectedApp.details?.doctorName}</span>
                    </div>
                    <div className="lec-field" style={{ gridColumn: 'span 2' }}>
                      <span className="lec-field-label">Medical Facility / Hospital:</span>
                      <span className="lec-field-val">{selectedApp.details?.hospitalClinic}</span>
                    </div>
                  </div>

                  <div className="lec-doc-attachment-box">
                    <div className="lec-doc-file-info">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <div>
                        <div className="lec-doc-filename">{selectedApp.details?.attachedDocumentName || 'medical_certificate.pdf'}</div>
                        <div className="lec-doc-meta">{selectedApp.details?.documentSize || '1.8 MB'} • Official Hospital Certified</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="lec-btn-preview-doc"
                      onClick={() =>
                        setPreviewDoc({
                          title: 'Supporting Medical Certificate',
                          ref: selectedApp.details?.medicalCertNo,
                          doctor: selectedApp.details?.doctorName,
                          hospital: selectedApp.details?.hospitalClinic,
                          date: selectedApp.details?.issueDate,
                          filename: selectedApp.details?.attachedDocumentName,
                        })
                      }
                    >
                      Preview Certificate
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Payment, Lecturer Remarks, Audit Trail */}
              <div className="lec-modal-col-right">
                {/* 1. Payment Clearance (SAR Verified) */}
                <div className="lec-info-card">
                  <div className="lec-card-title-row">
                    <h4 className="lec-card-title">Fee Clearance (SAR Verified)</h4>
                    <span className="lec-sar-verified-badge">✓ Verified by SAR</span>
                  </div>
                  <div className="lec-card-grid-2">
                    <div className="lec-field">
                      <span className="lec-field-label">Voucher Number:</span>
                      <span className="lec-field-val strong">{selectedApp.paymentReceipt?.voucherNo}</span>
                    </div>
                    <div className="lec-field">
                      <span className="lec-field-label">Amount Paid:</span>
                      <span className="lec-field-val strong">Rs. {selectedApp.paymentReceipt?.amount}.00</span>
                    </div>
                    <div className="lec-field">
                      <span className="lec-field-label">Bank Branch:</span>
                      <span className="lec-field-val">{selectedApp.paymentReceipt?.bankBranch}</span>
                    </div>
                    <div className="lec-field">
                      <span className="lec-field-label">Payment Date:</span>
                      <span className="lec-field-val">{selectedApp.paymentReceipt?.date}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="lec-btn-view-voucher"
                    onClick={() =>
                      setPreviewDoc({
                        title: "People's Bank Payment Receipt",
                        voucherNo: selectedApp.paymentReceipt?.voucherNo,
                        amount: selectedApp.paymentReceipt?.amount,
                        bankBranch: selectedApp.paymentReceipt?.bankBranch,
                        date: selectedApp.paymentReceipt?.date,
                        sarVerified: true,
                        sarOfficer: selectedApp.paymentReceipt?.sarVerifiedBy || 'Mr. K.L.M. Riyas (SAR / Examinations)',
                      })
                    }
                  >
                    View Bank Voucher
                  </button>
                </div>

                {/* 2. Lecturer Remarks & Recommendation Section */}
                <div className="lec-info-card lec-remarks-card">
                  <h4 className="lec-card-title">Lecturer Verification & Remarks</h4>
                  <p className="lec-remarks-desc">
                    Enter your academic verification notes for this student's continuous assessment repeat sitting. These remarks will be forwarded to the Head of Department.
                  </p>

                  {selectedApp.status === 'Pending Lecturer Review' || selectedApp.status === 'Under Lecturer Review' ? (
                    <>
                      <div className="lec-quick-chips">
                        <span className="lec-chip-label">Quick Suggestions:</span>
                        <button
                          type="button"
                          className="lec-chip-btn"
                          onClick={() => setLecturerRemarks('Coursework attendance and lab sessions verified. Student is eligible for the continuous assessment repeat evaluation.')}
                        >
                          Coursework & Lab Verified
                        </button>
                        <button
                          type="button"
                          className="lec-chip-btn"
                          onClick={() => setLecturerRemarks('Approved medical concession on file. Student recommended for resit during the scheduled evaluation window.')}
                        >
                          Medical Concession Confirmed
                        </button>
                      </div>

                      <textarea
                        className="lec-remarks-textarea"
                        rows="4"
                        placeholder="Enter your verification observations, lab attendance details, and recommendation for HOD approval..."
                        value={lecturerRemarks}
                        onChange={(e) => setLecturerRemarks(e.target.value)}
                      ></textarea>
                    </>
                  ) : (
                    <div className="lec-readonly-remarks-box">
                      <div className="lec-field-label">Lecturer Remarks Recorded:</div>
                      <div className="lec-readonly-text">
                        {selectedApp.auditLog?.find((l) => l.action === 'CHECKED_BY_LECTURER')?.comment ||
                          lecturerRemarks ||
                          'Verified and forwarded to Head of Department for final approval.'}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Audit Trail History */}
                <div className="lec-info-card">
                  <h4 className="lec-card-title">Workflow Audit Trail</h4>
                  <div className="lec-audit-timeline">
                    {selectedApp.auditLog && selectedApp.auditLog.length > 0 ? (
                      selectedApp.auditLog.map((log, idx) => (
                        <div key={idx} className="lec-audit-item">
                          <div className="lec-audit-dot"></div>
                          <div className="lec-audit-content">
                            <div className="lec-audit-header">
                              <span className="lec-audit-actor">{log.actorName} ({log.actorRole})</span>
                              <span className="lec-audit-time">{log.timestamp}</span>
                            </div>
                            <div className="lec-audit-comment">{log.comment}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="lec-no-audit">No audit entries available.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="lec-modal-footer">
              <div className="lec-footer-left">
                <span className="lec-footer-notice">
                  Reviewer: <strong>Dr. K. Perera</strong> (Course Lecturer — LEC/ICT/024)
                </span>
              </div>

              <div className="lec-footer-right">
                <button type="button" className="lec-btn-secondary" onClick={handleCloseInspect}>
                  Close
                </button>

                {(selectedApp.status === 'Pending Lecturer Review' || selectedApp.status === 'Under Lecturer Review') && (
                  <>
                    <button
                      type="button"
                      className="lec-btn-return-correction"
                      onClick={() => setIsReturnModalOpen(true)}
                    >
                      Return for Correction
                    </button>

                    <button
                      type="button"
                      className="lec-btn-mark-checked"
                      onClick={handleMarkCheckedAndForward}
                    >
                      Mark as Checked & Forward to HOD
                    </button>
                  </>
                )}

                {selectedApp.status === 'Forwarded to HOD' && (
                  <div className="lec-forwarded-pill">
                    ✓ Forwarded to Head of Department (HOD) — Awaiting Final Sign-off
                  </div>
                )}

                {selectedApp.status === 'Finally Approved by HOD' && (
                  <div className="lec-approved-pill">
                    ✓ Officially Approved by Head of Department
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Return for Correction Submodal */}
      {isReturnModalOpen && (
        <div className="lec-modal-overlay" style={{ zIndex: 1100 }}>
          <div className="lec-return-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="lec-modal-header">
              <h4 className="lec-modal-title">Return Application for Correction</h4>
              <button type="button" className="lec-modal-close-btn" onClick={() => setIsReturnModalOpen(false)}>
                ✕
              </button>
            </div>
            <div className="lec-return-modal-body">
              <p>
                Specify the exact reason why this application is being returned to student <strong>{selectedApp?.student?.name} ({selectedApp?.student?.regNo})</strong>:
              </p>
              <textarea
                className="lec-return-textarea"
                rows="4"
                placeholder="e.g., Medical certificate date does not cover the scheduled evaluation session, or bank voucher details require clarification..."
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
              ></textarea>
            </div>
            <div className="lec-modal-footer">
              <button type="button" className="lec-btn-secondary" onClick={() => setIsReturnModalOpen(false)}>
                Cancel
              </button>
              <button type="button" className="lec-btn-return-correction" onClick={handleConfirmReturn}>
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Document & Voucher Preview Submodal */}
      {previewDoc && (
        <div className="lec-modal-overlay" style={{ zIndex: 1200 }} onClick={() => setPreviewDoc(null)}>
          <div className="lec-preview-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="lec-modal-header">
              <h4 className="lec-modal-title">{previewDoc.title}</h4>
              <button type="button" className="lec-modal-close-btn" onClick={() => setPreviewDoc(null)}>
                ✕
              </button>
            </div>
            <div className="lec-preview-modal-body">
              {previewDoc.voucherNo ? (
                /* Bank Voucher Preview */
                <div className="lec-voucher-sheet">
                  <div className="lec-voucher-header">
                    <div className="lec-bank-logo">PEOPLE'S BANK • SRI LANKA</div>
                    <div className="lec-voucher-type">UNIVERSITY REVENUE DEPOSIT VOUCHER</div>
                  </div>
                  <div className="lec-voucher-body">
                    <div className="lec-voucher-row">
                      <span>Voucher Ref No:</span>
                      <strong>{previewDoc.voucherNo}</strong>
                    </div>
                    <div className="lec-voucher-row">
                      <span>Account Credited:</span>
                      <span>Faculty of Technology, SEUSL (A/C: 084-1-001-2-0004567)</span>
                    </div>
                    <div className="lec-voucher-row">
                      <span>Bank Branch:</span>
                      <span>{previewDoc.bankBranch}</span>
                    </div>
                    <div className="lec-voucher-row">
                      <span>Payment Date:</span>
                      <span>{previewDoc.date}</span>
                    </div>
                    <div className="lec-voucher-row highlight">
                      <span>Amount Paid:</span>
                      <strong>Rs. {previewDoc.amount}.00 (Two Hundred Fifty Rupees Only)</strong>
                    </div>
                    <div className="lec-voucher-row">
                      <span>Purpose:</span>
                      <span>Continuous Assessment (ECA) Repeat Examination Fee</span>
                    </div>
                  </div>
                  <div className="lec-voucher-stamp">
                    <div className="lec-stamp-box">
                      <div className="lec-stamp-title">SAR EXAMINATION CLEARANCE</div>
                      <div className="lec-stamp-text">OFFICIALLY VERIFIED & ACCOUNTED</div>
                      <div className="lec-stamp-officer">{previewDoc.sarOfficer}</div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Medical Certificate Preview */
                <div className="lec-med-sheet">
                  <div className="lec-med-header">
                    <h3>MEDICAL REPORT / EXCUSE CERTIFICATE</h3>
                    <p>{previewDoc.hospital}</p>
                  </div>
                  <div className="lec-med-body">
                    <div className="lec-med-row">
                      <span>Certificate Reference:</span>
                      <strong>{previewDoc.ref}</strong>
                    </div>
                    <div className="lec-med-row">
                      <span>Attending Physician:</span>
                      <strong>{previewDoc.doctor}</strong>
                    </div>
                    <div className="lec-med-row">
                      <span>Date of Examination:</span>
                      <span>{previewDoc.date}</span>
                    </div>
                    <div className="lec-med-row">
                      <span>Document File:</span>
                      <span>{previewDoc.filename}</span>
                    </div>
                    <div className="lec-med-endorsement">
                      <p>
                        "This certifies that the candidate was medically examined and found to be unfit for academic evaluation due to illness on the dates specified above. Recommended for medical concession."
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="lec-modal-footer">
              <button type="button" className="lec-btn-secondary" onClick={() => setPreviewDoc(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

