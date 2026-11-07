import React, { useState, useMemo, useEffect } from 'react';

export default function DeptMAMedicalApplications({
  medicalApplications,
  lecturerMedicals = [],
  deptInfo,
  onUpdateMedicalApplication,
  onUpdateLecturerMedical,
  onShowToast,
  selectedAppFromParent,
  onClearSelectedApp,
}) {
  // Top-level Desk Workspace Switcher
  const [currentDesk, setCurrentDesk] = useState('STUDENTS'); // 'STUDENTS' | 'LECTURERS'

  // Lecturer Medical Handling State
  const [selectedLecturerMed, setSelectedLecturerMed] = useState(null);
  const [lecSearchQuery, setLecSearchQuery] = useState('');
  const [lecFilterStatus, setLecFilterStatus] = useState('ALL');
  const [lecCertAuthentic, setLecCertAuthentic] = useState(true);
  const [lecLeaveFormComplete, setLecLeaveFormComplete] = useState(true);
  const [lecCoverageConfirmed, setLecCoverageConfirmed] = useState(true);
  const [lecDepartmentNotes, setLecDepartmentNotes] = useState('');
  const [lecTargetAuthority, setLecTargetAuthority] = useState('Head of Department (M.J Ahamed Sabani)');

  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedApp, setInspectedApp] = useState(selectedAppFromParent || null);

  // Decision Modals State
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveRemarks, setApproveRemarks] = useState('');

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectCode, setRejectCode] = useState('EXCEEDED_DEADLINE');
  const [rejectReason, setRejectReason] = useState('');

  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateRemarks, setEscalateRemarks] = useState('');

  // Keep inspectedApp updated if parent passed one
  React.useEffect(() => {
    if (selectedAppFromParent) {
      setInspectedApp(selectedAppFromParent);
    }
  }, [selectedAppFromParent]);

  // Tab Counts
  const counts = useMemo(() => {
    return {
      all: medicalApplications.length,
      pending: medicalApplications.filter((m) => m.status === 'Pending Verification' || m.status === 'Submitted').length,
      review: medicalApplications.filter((m) => m.status === 'Under Review').length,
      approved: medicalApplications.filter((m) => m.status === 'Approved').length,
      rejected: medicalApplications.filter((m) => m.status === 'Rejected').length,
      escalated: medicalApplications.filter((m) => m.status === 'Escalated').length,
    };
  }, [medicalApplications]);

  // Lecturer Medical Counts
  const lecCounts = useMemo(() => {
    return {
      all: lecturerMedicals.length,
      pending: lecturerMedicals.filter((m) => m.status === 'Pending Verification').length,
      forwardedHOD: lecturerMedicals.filter((m) => m.status === 'Verified & Forwarded to HOD').length,
      forwardedDean: lecturerMedicals.filter((m) => m.status === 'Forwarded to Dean / AR').length,
    };
  }, [lecturerMedicals]);

  // Filtered Lecturer Medicals
  const filteredLecturerMedicals = useMemo(() => {
    const q = lecSearchQuery.trim().toLowerCase();
    return lecturerMedicals.filter((m) => {
      if (q) {
        const matches =
          m.trackingNumber.toLowerCase().includes(q) ||
          m.lecturer.name.toLowerCase().includes(q) ||
          m.lecturer.staffId.toLowerCase().includes(q) ||
          m.medicalCertNo.toLowerCase().includes(q) ||
          m.medicalInstitution.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (lecFilterStatus !== 'ALL' && m.status !== lecFilterStatus) return false;
      return true;
    });
  }, [lecturerMedicals, lecSearchQuery, lecFilterStatus]);

  const handleOpenLecturerInspect = (med) => {
    setSelectedLecturerMed(med);
    setLecCertAuthentic(med.verificationChecks?.medicalCertAuthentic ?? true);
    setLecLeaveFormComplete(med.verificationChecks?.leaveFormComplete ?? true);
    setLecCoverageConfirmed(med.verificationChecks?.substituteCoverageVerified ?? true);
    setLecDepartmentNotes(med.departmentNotes || '');
    setLecTargetAuthority('Head of Department (M.J Ahamed Sabani)');
  };

  const handleForwardLecturerMedical = (e) => {
    e.preventDefault();
    if (!selectedLecturerMed) return;

    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newStatus = lecTargetAuthority.includes('HOD')
      ? 'Verified & Forwarded to HOD'
      : 'Forwarded to Dean / AR';

    const newHistory = [
      ...(selectedLecturerMed.forwardingHistory || []),
      {
        stage: `Forwarded to ${lecTargetAuthority}`,
        actor: `${deptInfo.assignedMA.name} (Dept MA)`,
        timestamp,
        remarks: lecDepartmentNotes || `Completeness verified and forwarded to ${lecTargetAuthority}.`,
      },
    ];

    const updated = {
      ...selectedLecturerMed,
      status: newStatus,
      verificationChecks: {
        medicalCertAuthentic: lecCertAuthentic,
        leaveFormComplete: lecLeaveFormComplete,
        substituteCoverageVerified: lecCoverageConfirmed,
      },
      departmentNotes: lecDepartmentNotes || 'Completeness verified by Department MA.',
      forwardingHistory: newHistory,
    };

    if (typeof onUpdateLecturerMedical === 'function') {
      onUpdateLecturerMedical(updated);
    }
    setSelectedLecturerMed(null);
    onShowToast(`Lecturer medical request ${updated.trackingNumber} for ${updated.lecturer.name} forwarded to ${lecTargetAuthority}.`, 'success');
  };

  const handleDownloadLecturerDoc = (docName) => {
    try {
      const blob = new Blob(
        [
          `SOUTH EASTERN UNIVERSITY OF SRI LANKA\nFACULTY OF TECHNOLOGY - DEPARTMENT OF ICT\n\nOFFICIAL ACADEMIC STAFF MEDICAL LEAVE RECORD\nFile: ${docName}\nLecturer: ${selectedLecturerMed?.lecturer.name} (${selectedLecturerMed?.lecturer.staffId})\nLeave Period: ${selectedLecturerMed?.absenceStartDate} to ${selectedLecturerMed?.absenceEndDate} (${selectedLecturerMed?.totalDays} days)\nHospital: ${selectedLecturerMed?.medicalInstitution} - Medical Cert No: ${selectedLecturerMed?.medicalCertNo}\n\nVerified authentic by Department Management Assistant on ${new Date().toISOString().split('T')[0]}.`
        ],
        { type: 'text/plain;charset=utf-8;' }
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', docName.replace('.pdf', '') + '.txt');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onShowToast(`Downloaded lecturer medical document: ${docName}`, 'success');
    } catch {
      onShowToast(`Failed to download ${docName}`, 'error');
    }
  };

  // Filtered applications
  const filteredApps = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return medicalApplications.filter((app) => {
      // Search
      if (q) {
        const matches =
          app.trackingNumber.toLowerCase().includes(q) ||
          app.student.name.toLowerCase().includes(q) ||
          app.student.regNo.toLowerCase().includes(q) ||
          app.subject.code.toLowerCase().includes(q) ||
          app.subject.name.toLowerCase().includes(q) ||
          app.medical.clinic.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Tab filter
      if (activeTab === 'PENDING') {
        return app.status === 'Pending Verification' || app.status === 'Submitted';
      }
      if (activeTab === 'REVIEW') {
        return app.status === 'Under Review';
      }
      if (activeTab === 'APPROVED') {
        return app.status === 'Approved';
      }
      if (activeTab === 'REJECTED') {
        return app.status === 'Rejected';
      }
      if (activeTab === 'ESCALATED') {
        return app.status === 'Escalated';
      }
      return true;
    });
  }, [medicalApplications, searchQuery, activeTab]);

  // Handle Mark Under Review
  const handleMarkUnderReview = () => {
    if (!inspectedApp) return;

    const newHistory = [
      ...inspectedApp.history,
      {
        stage: 'Under Review',
        action: 'Verified by Department MA',
        actor: `${deptInfo.assignedMA.name} (Dept MA)`,
        timestamp: new Date().toISOString(),
        remarks: 'Medical slip verified against 14-day regulation. Moved to Under Review status.',
      },
    ];

    const updated = {
      ...inspectedApp,
      status: 'Under Review',
      history: newHistory,
    };

    onUpdateMedicalApplication(updated);
    setInspectedApp(updated);
    onShowToast(`Application ${updated.trackingNumber} status updated to Under Review.`, 'info');
  };

  // Handle Approve Application (Final MA Authority)
  const handleConfirmApproval = () => {
    if (!inspectedApp) return;

    const stampCode = `SEU-FOT-ICT-MA-APP#${new Date().getFullYear()}-${inspectedApp.trackingNumber.split('-').pop()}`;
    const timestamp = new Date().toISOString();

    const decision = {
      status: 'Approved',
      approvedBy: `${deptInfo.assignedMA.name} (Dept MA)`,
      approvedRole: 'Department Management Assistant',
      approvedDate: timestamp,
      digitalStamp: stampCode,
      remarks: approveRemarks || 'Medical certificate verified against clinic registry. Approved for attendance recalculation.',
    };

    const newHistory = [
      ...inspectedApp.history,
      {
        stage: 'Approved',
        action: 'Final Approval Granted',
        actor: `${deptInfo.assignedMA.name} (Dept MA)`,
        timestamp,
        remarks: decision.remarks,
        stamp: stampCode,
      },
    ];

    const updated = {
      ...inspectedApp,
      status: 'Approved',
      decision,
      history: newHistory,
    };

    onUpdateMedicalApplication(updated);
    setInspectedApp(updated);
    setShowApproveModal(false);
    setApproveRemarks('');
    onShowToast(`Medical application ${updated.trackingNumber} approved. Student notified.`, 'success');
  };

  // Handle Reject Application
  const handleConfirmRejection = () => {
    if (!inspectedApp) return;

    const timestamp = new Date().toISOString();
    const standardReasons = {
      EXCEEDED_DEADLINE: 'Submitted past the statutory 14-day university regulation window.',
      UNACCREDITED_CERTIFICATE: 'Medical slip from private dispensary lacks Chief Medical Officer endorsement.',
      SESSION_MISMATCH: 'Stated date of absence does not correlate with scheduled teaching session.',
      INCOMPLETE_DOCUMENTATION: 'Illegible diagnosis or missing doctor SLMC registration number.',
      OTHER: rejectReason || 'Did not meet Faculty of Technology medical excuse by-laws.',
    };

    const finalReason = rejectReason || standardReasons[rejectCode];

    const decision = {
      status: 'Rejected',
      rejectedBy: `${deptInfo.assignedMA.name} (Dept MA)`,
      rejectedRole: 'Department Management Assistant',
      rejectedDate: timestamp,
      rejectionCode: rejectCode,
      rejectionReason: finalReason,
    };

    const newHistory = [
      ...inspectedApp.history,
      {
        stage: 'Rejected',
        action: 'Application Rejected',
        actor: `${deptInfo.assignedMA.name} (Dept MA)`,
        timestamp,
        remarks: `Rejected: ${finalReason}`,
      },
    ];

    const updated = {
      ...inspectedApp,
      status: 'Rejected',
      decision,
      history: newHistory,
    };

    onUpdateMedicalApplication(updated);
    setInspectedApp(updated);
    setShowRejectModal(false);
    setRejectReason('');
    onShowToast(`Medical application ${updated.trackingNumber} rejected. Formal notice sent to student.`, 'info');
  };

  // Handle Escalate to HOD / Senior Medical Officer
  const handleConfirmEscalation = () => {
    if (!inspectedApp) return;

    const timestamp = new Date().toISOString();
    const newHistory = [
      ...inspectedApp.history,
      {
        stage: 'Escalated',
        action: 'Escalated to HOD / Faculty Dean',
        actor: `${deptInfo.assignedMA.name} (Dept MA)`,
        timestamp,
        remarks: escalateRemarks || 'Escalated for extended leave concession (> 14 days) per institutional workflow.',
      },
    ];

    const updated = {
      ...inspectedApp,
      status: 'Escalated',
      history: newHistory,
    };

    onUpdateMedicalApplication(updated);
    setInspectedApp(updated);
    setShowEscalateModal(false);
    setEscalateRemarks('');
    onShowToast(`Application ${updated.trackingNumber} routed to Head of Department (HOD) for board review.`, 'success');
  };

  const handleCloseInspector = () => {
    setInspectedApp(null);
    if (onClearSelectedApp) {
      onClearSelectedApp();
    }
  };

  return (
    <div className="dept-ma-medical-applications-section">
      {/* Top Workspace Desk Switcher */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1.25rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          className={`dept-ma-btn-action ${currentDesk === 'STUDENTS' ? 'primary' : 'secondary'}`}
          style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}
          onClick={() => setCurrentDesk('STUDENTS')}
        >
          Student Subject Medical Desk ({counts.pending} Pending)
        </button>
        <button
          type="button"
          className={`dept-ma-btn-action ${currentDesk === 'LECTURERS' ? 'primary' : 'secondary'}`}
          style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}
          onClick={() => setCurrentDesk('LECTURERS')}
        >
          Lecturer Medical Handling Desk ({lecCounts.pending} Pending)
        </button>
      </div>

      {currentDesk === 'STUDENTS' ? (
        <>
      {/* 1. Workflow Pipeline Header */}
      <div className="dept-ma-med-workflow-bar">
        <div className="dept-ma-workflow-step completed">
          <div className="dept-ma-step-circle">1</div>
          <div className="dept-ma-step-label">
            <span className="dept-ma-step-name">Submitted</span>
            <span className="dept-ma-step-sub">By Undergraduate</span>
          </div>
        </div>

        <div className="dept-ma-step-divider" />

        <div className="dept-ma-workflow-step active">
          <div className="dept-ma-step-circle">2</div>
          <div className="dept-ma-step-label">
            <span className="dept-ma-step-name">Pending Verification</span>
            <span className="dept-ma-step-sub">Dept MA 14-Day Audit</span>
          </div>
        </div>

        <div className="dept-ma-step-divider" />

        <div className="dept-ma-workflow-step">
          <div className="dept-ma-step-circle">3</div>
          <div className="dept-ma-step-label">
            <span className="dept-ma-step-name">Under Review</span>
            <span className="dept-ma-step-sub">Registry & Session Check</span>
          </div>
        </div>

        <div className="dept-ma-step-divider" />

        <div className="dept-ma-workflow-step">
          <div className="dept-ma-step-circle">4</div>
          <div className="dept-ma-step-label">
            <span className="dept-ma-step-name">Approved / Rejected</span>
            <span className="dept-ma-step-sub">Final Decision & Stamp</span>
          </div>
        </div>
      </div>

      {/* 2. Filter Tabs Toolbar */}
      <div className="dept-ma-toolbar">
        <div className="dept-ma-toolbar-left">
          <div className="dept-ma-search-input-wrap">
            <span className="dept-ma-search-icon">🔍</span>
            <input
              type="text"
              className="dept-ma-search-input"
              placeholder="Search by Tracking No, Student, Subject, or Hospital..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`dept-ma-btn-action ${activeTab === 'ALL' ? 'primary' : 'secondary'}`}
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.8rem' }}
              onClick={() => setActiveTab('ALL')}
            >
              All ({counts.all})
            </button>
            <button
              type="button"
              className={`dept-ma-btn-action ${activeTab === 'PENDING' ? 'primary' : 'secondary'}`}
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.8rem' }}
              onClick={() => setActiveTab('PENDING')}
            >
              Pending Verification ({counts.pending})
            </button>
            <button
              type="button"
              className={`dept-ma-btn-action ${activeTab === 'REVIEW' ? 'primary' : 'secondary'}`}
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.8rem' }}
              onClick={() => setActiveTab('REVIEW')}
            >
              Under Review ({counts.review})
            </button>
            <button
              type="button"
              className={`dept-ma-btn-action ${activeTab === 'APPROVED' ? 'primary' : 'secondary'}`}
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.8rem', color: activeTab === 'APPROVED' ? '#ffffff' : '#059669' }}
              onClick={() => setActiveTab('APPROVED')}
            >
              Approved ({counts.approved})
            </button>
            <button
              type="button"
              className={`dept-ma-btn-action ${activeTab === 'REJECTED' ? 'primary' : 'secondary'}`}
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.8rem', color: activeTab === 'REJECTED' ? '#ffffff' : '#dc2626' }}
              onClick={() => setActiveTab('REJECTED')}
            >
              Rejected ({counts.rejected})
            </button>
          </div>
        </div>

        <div className="dept-ma-toolbar-right">
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Showing <strong>{filteredApps.length}</strong> applications
          </span>
        </div>
      </div>

      {/* 3. Medical Queue Cards Grid */}
      <div className="dept-ma-med-queue-grid">
        {filteredApps.length > 0 ? (
          filteredApps.map((app) => (
            <div key={app.trackingNumber} className="dept-ma-med-card">
              <div>
                <div className="dept-ma-med-card-top">
                  <span className="dept-ma-tracking-pill">{app.trackingNumber}</span>
                  <span
                    className={`dept-ma-status-badge ${app.status.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {app.status}
                  </span>
                </div>

                <div className="dept-ma-med-student-info">
                  <h4 className="dept-ma-med-student-name">{app.student.name}</h4>
                  <div className="dept-ma-med-student-meta">
                    <span>{app.student.regNo}</span>
                    <span>•</span>
                    <span>{app.student.batch}</span>
                  </div>
                </div>

                <div className="dept-ma-med-subject-box">
                  <div className="dept-ma-med-subject-code">
                    <span>{app.subject.code}</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{app.subject.sessionType}</span>
                  </div>
                  <div className="dept-ma-med-subject-name">{app.subject.name}</div>
                  <div className="dept-ma-med-missed-dates">
                    <span>📅 Missed: {app.subject.missedDate}</span>
                    <span>({app.subject.daysCount} day{app.subject.daysCount > 1 ? 's' : ''})</span>
                  </div>
                </div>

                <div className="dept-ma-med-details-box">
                  <div>
                    <strong>Hospital / Clinic:</strong> {app.medical.clinic}
                  </div>
                  <div>
                    <strong>Doctor:</strong> {app.medical.doctor}
                  </div>
                  <div>
                    <strong>Diagnosis:</strong> {app.medical.diagnosis}
                  </div>
                  <div style={{ marginTop: '0.35rem' }}>
                    {app.checklist.submittedWithin14Days ? (
                      <span style={{ color: '#059669', fontWeight: '700', fontSize: '0.76rem' }}>
                        ✓ Within 14-day regulation ({app.checklist.daysElapsed} day elapsed)
                      </span>
                    ) : (
                      <span style={{ color: '#dc2626', fontWeight: '700', fontSize: '0.76rem' }}>
                        ⚠️ Exceeded 14-day limit ({app.checklist.daysElapsed} days elapsed)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="dept-ma-med-actions-footer">
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                  Submitted: {app.submissionDate.split('T')[0]}
                </span>
                <button
                  type="button"
                  className="dept-ma-btn-action primary"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                  onClick={() => setInspectedApp(app)}
                >
                  Inspect & Verify
                </button>
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              gridColumn: '1 / -1',
              background: '#ffffff',
              padding: '3rem 2rem',
              textAlign: 'center',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              color: '#64748b',
            }}
          >
            No medical applications match the selected filter.
          </div>
        )}
      </div>

      {/* 4. Inspection & Verification Modal (Main Feature Core Interface) */}
      {inspectedApp && (
        <div className="dept-ma-modal-backdrop" onClick={handleCloseInspector}>
          <div
            className="dept-ma-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '840px' }}
          >
            {/* Modal Header */}
            <div className="dept-ma-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                  <span className="dept-ma-tracking-pill" style={{ fontSize: '0.85rem', fontWeight: '800' }}>
                    {inspectedApp.trackingNumber}
                  </span>
                  <span
                    className={`dept-ma-status-badge ${inspectedApp.status.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {inspectedApp.status}
                  </span>
                  {inspectedApp.requiresEscalation && (
                    <span className="dept-ma-status-badge escalated">Special Board Review</span>
                  )}
                </div>
                <h3 className="dept-ma-modal-title">Subject Medical Application Verification Desk</h3>
                <p className="dept-ma-modal-subtitle">
                  Applicant: <strong>{inspectedApp.student.name}</strong> ({inspectedApp.student.regNo}) • {deptInfo.departmentName}
                </p>
              </div>

              <button type="button" className="dept-ma-modal-close" onClick={handleCloseInspector}>
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="dept-ma-modal-body">
              {/* Section A: Subject & Missed Session Information */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0369a1', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                  Subject & Session Corroboration
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.84rem' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.74rem', display: 'block' }}>SUBJECT CODE & TITLE</span>
                    <strong>{inspectedApp.subject.code}</strong> — {inspectedApp.subject.name}
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.74rem', display: 'block' }}>COURSE LECTURER</span>
                    <strong>{inspectedApp.subject.lecturer}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.74rem', display: 'block' }}>MISSED DATE & TIMESLOT</span>
                    <strong>{inspectedApp.subject.missedDate}</strong> ({inspectedApp.subject.timeslot})
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.74rem', display: 'block' }}>SESSION TYPE & VENUE</span>
                    <strong>{inspectedApp.subject.sessionType}</strong> ({inspectedApp.subject.venue})
                  </div>
                </div>
              </div>

              {/* Section B: Simulated Official Medical Certificate Document Viewer */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#0f172a' }}>
                    📄 Uploaded Medical Certificate & Supporting Evidence
                  </div>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                    File: <strong>{inspectedApp.medical.fileName}</strong> ({inspectedApp.medical.fileSize})
                  </span>
                </div>

                <div className="dept-ma-cert-paper">
                  <div className="dept-ma-cert-watermark">SEUSL OFFICIAL</div>

                  <div className="dept-ma-cert-header">
                    <div className="dept-ma-cert-hospital">{inspectedApp.medical.clinic}</div>
                    <div className="dept-ma-cert-doc-type">Medical Certificate of Illness / Excusal Slip</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Certificate Serial No: <strong>{inspectedApp.medical.certNo}</strong> • Issue Date: {inspectedApp.medical.issueDate}
                    </div>
                  </div>

                  <div className="dept-ma-cert-grid">
                    <div className="dept-ma-cert-field">
                      <label>Patient / Student Full Name</label>
                      <span>{inspectedApp.student.name}</span>
                    </div>
                    <div className="dept-ma-cert-field">
                      <label>University Registration No</label>
                      <span>{inspectedApp.student.regNo}</span>
                    </div>
                    <div className="dept-ma-cert-field">
                      <label>Recommended Period of Absence</label>
                      <span>
                        From: {inspectedApp.medical.absenceFrom} To: {inspectedApp.medical.absenceTo} ({inspectedApp.subject.daysCount} day{inspectedApp.subject.daysCount > 1 ? 's' : ''})
                      </span>
                    </div>
                    <div className="dept-ma-cert-field">
                      <label>Clinical Diagnosis / Nature of Illness</label>
                      <span style={{ color: '#0f172a' }}>{inspectedApp.medical.diagnosis}</span>
                    </div>
                  </div>

                  <div className="dept-ma-cert-stamp-box">
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#0f172a' }}>
                        Attending Medical Officer: {inspectedApp.medical.doctor}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        Sri Lanka Medical Council (SLMC) Registration No: <strong>{inspectedApp.medical.slmcRegNo}</strong>
                      </div>
                    </div>

                    <div className="dept-ma-doctor-seal">
                      <span>GOVERNMENT HOSPITAL</span>
                      <span>SEAL & SIGNATURE</span>
                      <span>VERIFIED</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section C: University Compliance Verification Checklist */}
              <div className="dept-ma-checklist-card">
                <div className="dept-ma-checklist-title">
                  <span>📋</span>
                  <span>SEUSL Faculty of Technology Compliance Audit Checklist</span>
                </div>

                <div className="dept-ma-checklist-item">
                  <div className={`dept-ma-check-icon ${inspectedApp.checklist.submittedWithin14Days ? 'valid' : 'invalid'}`}>
                    {inspectedApp.checklist.submittedWithin14Days ? '✓' : '✕'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong>Statutory 14-Day Submission Window:</strong> Application was submitted within{' '}
                    <strong>{inspectedApp.checklist.daysElapsed} day(s)</strong> of the absence. (Regulation: Max 14 calendar days).
                  </div>
                </div>

                <div className="dept-ma-checklist-item">
                  <div className={`dept-ma-check-icon ${inspectedApp.checklist.accreditedHospital ? 'valid' : 'invalid'}`}>
                    {inspectedApp.checklist.accreditedHospital ? '✓' : '✕'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong>Hospital / Clinic Accreditation:</strong> Issued by University Health Centre or Recognized Government Hospital.
                  </div>
                </div>

                <div className="dept-ma-checklist-item">
                  <div className={`dept-ma-check-icon ${inspectedApp.checklist.matchesTimetableSchedule ? 'valid' : 'invalid'}`}>
                    {inspectedApp.checklist.matchesTimetableSchedule ? '✓' : '✕'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong>Teaching Schedule Corroboration:</strong> Confirmed subject session was held on stated absence date.
                  </div>
                </div>

                <div className="dept-ma-checklist-item">
                  <div className={`dept-ma-check-icon ${inspectedApp.checklist.hasDoctorSeal ? 'valid' : 'invalid'}`}>
                    {inspectedApp.checklist.hasDoctorSeal ? '✓' : '✕'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong>Medical Officer Registration:</strong> Valid SLMC registration seal and stamp present.
                  </div>
                </div>
              </div>

              {/* Section D: Current Decision or Digital Stamp (if already approved/rejected) */}
              {inspectedApp.decision && (
                <div
                  style={{
                    background: inspectedApp.decision.status === 'Approved' ? '#ecfdf5' : '#fef2f2',
                    border: `1px solid ${inspectedApp.decision.status === 'Approved' ? '#a7f3d0' : '#fecaca'}`,
                    borderRadius: '12px',
                    padding: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>
                      {inspectedApp.decision.status === 'Approved' ? '✅' : '❌'}
                    </span>
                    <div>
                      <strong style={{ color: inspectedApp.decision.status === 'Approved' ? '#065f46' : '#991b1b' }}>
                        Official Decision: {inspectedApp.decision.status}
                      </strong>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        By {inspectedApp.decision.approvedBy || inspectedApp.decision.rejectedBy} on{' '}
                        {inspectedApp.decision.approvedDate || inspectedApp.decision.rejectedDate}
                      </div>
                    </div>
                  </div>

                  {inspectedApp.decision.digitalStamp && (
                    <div className="dept-ma-approval-stamp-block" style={{ marginTop: '0.75rem' }}>
                      <div className="dept-ma-stamp-icon">🛡️</div>
                      <div className="dept-ma-stamp-text">
                        <strong>OFFICIALLY VERIFIED & APPROVED — DEPARTMENT MA</strong>
                        <div className="dept-ma-stamp-ref">Stamp: {inspectedApp.decision.digitalStamp}</div>
                      </div>
                    </div>
                  )}

                  <div style={{ fontSize: '0.84rem', marginTop: '0.75rem', color: '#1e293b' }}>
                    <strong>Remarks / Reasons:</strong> {inspectedApp.decision.remarks || inspectedApp.decision.rejectionReason}
                  </div>
                </div>
              )}

              {/* Section E: Complete Audit & Workflow History */}
              <div>
                <h4 style={{ fontSize: '0.9rem', color: '#0f172a', marginBottom: '0.6rem' }}>
                  📜 Workflow Audit Trail & Decision History
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {inspectedApp.history.map((h, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.65rem 0.85rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <strong>{h.action}</strong>
                        <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{h.timestamp}</span>
                      </div>
                      <div style={{ color: '#64748b' }}>
                        Actor: <strong>{h.actor}</strong> • Stage: {h.stage}
                      </div>
                      {h.remarks && (
                        <div style={{ marginTop: '0.25rem', color: '#334155', fontStyle: 'italic' }}>
                          "{h.remarks}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer with Actions */}
            <div className="dept-ma-modal-footer">
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Authority: {deptInfo.assignedMA.name} ({deptInfo.assignedMA.staffId})
              </span>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {inspectedApp.status === 'Submitted' && (
                  <button
                    type="button"
                    className="dept-ma-btn-action secondary"
                    onClick={handleMarkUnderReview}
                  >
                    🔍 Mark Under Review
                  </button>
                )}

                {inspectedApp.status !== 'Approved' && inspectedApp.status !== 'Rejected' && (
                  <>
                    <button
                      type="button"
                      className="dept-ma-btn-action secondary"
                      style={{ color: '#dc2626' }}
                      onClick={() => setShowRejectModal(true)}
                    >
                      ✕ Reject Application
                    </button>

                    {inspectedApp.subject.daysCount > 14 || inspectedApp.requiresEscalation ? (
                      <button
                        type="button"
                        className="dept-ma-btn-action primary"
                        style={{ background: '#7e22ce' }}
                        onClick={() => setShowEscalateModal(true)}
                      >
                        ⚡ Route to HOD / Dean
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="dept-ma-btn-action emerald"
                        onClick={() => setShowApproveModal(true)}
                      >
                        ✓ Grant Final Approval
                      </button>
                    )}
                  </>
                )}

                <button
                  type="button"
                  className="dept-ma-btn-action secondary"
                  onClick={handleCloseInspector}
                >
                  Close Desk
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Approval Confirmation Modal */}
      {showApproveModal && (
        <div className="dept-ma-modal-backdrop" onClick={() => setShowApproveModal(false)}>
          <div
            className="dept-ma-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '540px' }}
          >
            <div className="dept-ma-modal-header">
              <h3 className="dept-ma-modal-title">Confirm Final Medical Approval</h3>
              <button type="button" className="dept-ma-modal-close" onClick={() => setShowApproveModal(false)}>
                ✕
              </button>
            </div>

            <div className="dept-ma-modal-body">
              <p style={{ fontSize: '0.86rem', color: '#334155', margin: 0 }}>
                You are granting <strong>Official Department MA Approval</strong> for{' '}
                <strong>{inspectedApp?.student.name}</strong> ({inspectedApp?.student.regNo}) for{' '}
                <strong>{inspectedApp?.subject.code}</strong>.
              </p>

              <div
                style={{
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '10px',
                  padding: '0.9rem',
                  fontSize: '0.82rem',
                  color: '#065f46',
                }}
              >
                ✓ Generates Department Verification Stamp<br />
                ✓ Automatically updates student attendance concession records<br />
                ✓ Sends instant notification to student
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                  Approval Remarks / Reference Note (Optional)
                </label>
                <textarea
                  rows="3"
                  className="dept-ma-search-input"
                  style={{ paddingLeft: '0.85rem', height: 'auto' }}
                  placeholder="e.g. Verified against University Health Centre daily registry. Approved for attendance recalculation."
                  value={approveRemarks}
                  onChange={(e) => setApproveRemarks(e.target.value)}
                />
              </div>
            </div>

            <div className="dept-ma-modal-footer">
              <button
                type="button"
                className="dept-ma-btn-action secondary"
                onClick={() => setShowApproveModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="dept-ma-btn-action emerald"
                onClick={handleConfirmApproval}
              >
                Confirm & Apply Digital Stamp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Rejection Modal with Standardized Reasons */}
      {showRejectModal && (
        <div className="dept-ma-modal-backdrop" onClick={() => setShowRejectModal(false)}>
          <div
            className="dept-ma-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '540px' }}
          >
            <div className="dept-ma-modal-header">
              <h3 className="dept-ma-modal-title" style={{ color: '#b91c1c' }}>
                Reject Subject Medical Application
              </h3>
              <button type="button" className="dept-ma-modal-close" onClick={() => setShowRejectModal(false)}>
                ✕
              </button>
            </div>

            <div className="dept-ma-modal-body">
              <p style={{ fontSize: '0.86rem', color: '#334155', margin: 0 }}>
                Please specify the official regulatory ground for rejecting application{' '}
                <strong>{inspectedApp?.trackingNumber}</strong>. This reason will be logged in the permanent audit ledger and sent to the student.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                  Standard University Regulation Rejection Code *
                </label>
                <select
                  className="dept-ma-filter-select"
                  style={{ width: '100%' }}
                  value={rejectCode}
                  onChange={(e) => setRejectCode(e.target.value)}
                >
                  <option value="EXCEEDED_DEADLINE">
                    Exceeded Statutory 14-Day Submission Window
                  </option>
                  <option value="UNACCREDITED_CERTIFICATE">
                    Private Clinic Slip Lacks Chief Medical Officer Endorsement
                  </option>
                  <option value="SESSION_MISMATCH">
                    Subject Session Not Scheduled on Stated Medical Absence Date
                  </option>
                  <option value="INCOMPLETE_DOCUMENTATION">
                    Incomplete / Illegible Medical Certificate or Missing SLMC Seal
                  </option>
                  <option value="OTHER">Other Faculty Regulation Ground</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                  Detailed Official Explanation for Student *
                </label>
                <textarea
                  rows="3"
                  className="dept-ma-search-input"
                  style={{ paddingLeft: '0.85rem', height: 'auto' }}
                  placeholder="Provide precise details citing university by-laws..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="dept-ma-modal-footer">
              <button
                type="button"
                className="dept-ma-btn-action secondary"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="dept-ma-btn-action primary"
                style={{ background: '#dc2626' }}
                onClick={handleConfirmRejection}
              >
                Reject & Send Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Escalation Modal for HOD / Senate Concession */}
      {showEscalateModal && (
        <div className="dept-ma-modal-backdrop" onClick={() => setShowEscalateModal(false)}>
          <div
            className="dept-ma-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '540px' }}
          >
            <div className="dept-ma-modal-header">
              <h3 className="dept-ma-modal-title">Escalate to Head of Department (HOD)</h3>
              <button type="button" className="dept-ma-modal-close" onClick={() => setShowEscalateModal(false)}>
                ✕
              </button>
            </div>

            <div className="dept-ma-modal-body">
              <p style={{ fontSize: '0.86rem', color: '#334155', margin: 0 }}>
                This application requires institutional review beyond Department MA delegated limits (e.g. prolonged absence &gt; 14 consecutive days or surgical admission).
              </p>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                  Department MA Escalation Brief
                </label>
                <textarea
                  rows="3"
                  className="dept-ma-search-input"
                  style={{ paddingLeft: '0.85rem', height: 'auto' }}
                  placeholder="Forwarding hospital surgical admission records for HOD / Faculty Dean board consideration."
                  value={escalateRemarks}
                  onChange={(e) => setEscalateRemarks(e.target.value)}
                />
              </div>
            </div>

            <div className="dept-ma-modal-footer">
              <button
                type="button"
                className="dept-ma-btn-action secondary"
                onClick={() => setShowEscalateModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="dept-ma-btn-action primary"
                style={{ background: '#7e22ce' }}
                onClick={handleConfirmEscalation}
              >
                Forward to HOD Desk
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      ) : (
        /* LECTURER MEDICAL HANDLING DESK (Responsibility 1) */
        <div className="dept-ma-lecturer-med-desk">
          {/* Header Notice Banner */}
          <div className="dept-ma-panel-card" style={{ marginBottom: '1.5rem', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span className="dept-ma-badge-pill dept-code">RESPONSIBILITY 1</span>
                  <span className="dept-ma-badge-pill">ACADEMIC STAFF MEDICAL DESK</span>
                </div>
                <h2 style={{ margin: '0 0 0.35rem 0', fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
                  Lecturer Medical Handling Desk
                </h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  Receive, review, track, and process lecturer-related medical certificates and leave requests according to authorized departmental procedure. Verify document completeness and forward to HOD & Dean / AR.
                </p>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.6rem 1rem',
                  fontSize: '0.8rem',
                  color: '#334155',
                }}
              >
                🏛️ <strong>Institutional Authority:</strong> Verification & routing only. Final leave approval authority rests with HOD & Dean.
              </div>
            </div>
          </div>

          {/* KPI Statistics */}
          <div className="dept-ma-stats-grid" style={{ marginBottom: '1.75rem' }}>
            <div className="dept-ma-stat-card">
              <div className="dept-ma-stat-top">
                <span className="dept-ma-stat-label">Total Lecturer Requests</span>
                <div className="dept-ma-stat-icon-wrap blue">👨‍🏫</div>
              </div>
              <div className="dept-ma-stat-value">{lecCounts.all}</div>
              <div className="dept-ma-stat-sub">Academic staff medical submissions</div>
            </div>

            <div className="dept-ma-stat-card">
              <div className="dept-ma-stat-top">
                <span className="dept-ma-stat-label">Pending Verification</span>
                <div className="dept-ma-stat-icon-wrap amber">⏳</div>
              </div>
              <div className="dept-ma-stat-value" style={{ color: '#b45309' }}>
                {lecCounts.pending}
              </div>
              <div className="dept-ma-stat-sub">Awaiting completeness audit</div>
            </div>

            <div className="dept-ma-stat-card">
              <div className="dept-ma-stat-top">
                <span className="dept-ma-stat-label">Forwarded to HOD</span>
                <div className="dept-ma-stat-icon-wrap indigo">🏛️</div>
              </div>
              <div className="dept-ma-stat-value" style={{ color: '#4338ca' }}>
                {lecCounts.forwardedHOD}
              </div>
              <div className="dept-ma-stat-sub">Handover endorsed & routed to Head</div>
            </div>

            <div className="dept-ma-stat-card">
              <div className="dept-ma-stat-top">
                <span className="dept-ma-stat-label">Forwarded to Dean / AR</span>
                <div className="dept-ma-stat-icon-wrap emerald">📋</div>
              </div>
              <div className="dept-ma-stat-value" style={{ color: '#047857' }}>
                {lecCounts.forwardedDean}
              </div>
              <div className="dept-ma-stat-sub">Academic establishment leave ledger</div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="dept-ma-toolbar">
            <div className="dept-ma-toolbar-left">
              <div className="dept-ma-search-input-wrap">
                <span className="dept-ma-search-icon">🔍</span>
                <input
                  type="text"
                  className="dept-ma-search-input"
                  placeholder="Search by lecturer name, staff ID, cert no, or hospital..."
                  value={lecSearchQuery}
                  onChange={(e) => setLecSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="dept-ma-filter-select"
                value={lecFilterStatus}
                onChange={(e) => setLecFilterStatus(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="Pending Verification">Pending Verification</option>
                <option value="Verified & Forwarded to HOD">Verified & Forwarded to HOD</option>
                <option value="Forwarded to Dean / AR">Forwarded to Dean / AR</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="dept-ma-table-container">
            <div className="dept-ma-table-wrapper">
              <table className="dept-ma-table">
                <thead>
                  <tr>
                    <th>Tracking No & Date</th>
                    <th>Lecturer Details</th>
                    <th>Leave Period & Total Days</th>
                    <th>Medical Institution & Doctor</th>
                    <th>Lecture Handover Coverage</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLecturerMedicals.length > 0 ? (
                    filteredLecturerMedicals.map((med) => (
                      <tr key={med.id}>
                        <td>
                          <span className="dept-ma-tracking-pill">{med.trackingNumber}</span>
                          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.2rem' }}>
                            {med.absenceStartDate}
                          </div>
                        </td>
                        <td>
                          <strong>{med.lecturer.name}</strong>
                          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                            {med.lecturer.staffId} • {med.lecturer.designation}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: '700', color: '#0f172a' }}>
                            {med.totalDays} day(s)
                          </span>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            {med.absenceStartDate} to {med.absenceEndDate}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#0284c7' }}>
                            {med.leaveType}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#0f172a' }}>
                            {med.medicalInstitution}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            {med.doctorName}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#059669', fontFamily: 'monospace' }}>
                            Cert: {med.medicalCertNo}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#334155' }}>
                            Substitute: {med.handoverPlan.substituteLecturer.split('(')[0]}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            {med.handoverPlan.coveredModules}
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '600' }}>
                            ✓ {med.handoverPlan.status}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`dept-ma-status-badge ${
                              med.status.includes('Forwarded')
                                ? 'active'
                                : med.status === 'Pending Verification'
                                ? 'pending'
                                : 'confirmed'
                            }`}
                          >
                            {med.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="dept-ma-btn-action primary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.76rem', whiteSpace: 'nowrap' }}
                            onClick={() => handleOpenLecturerInspect(med)}
                          >
                            Inspect & Verify
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No lecturer medical applications found matching current filter options.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal */}
          {selectedLecturerMed && (
            <div className="dept-ma-modal-backdrop" onClick={() => setSelectedLecturerMed(null)}>
              <div
                className="dept-ma-modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '820px' }}
              >
                {/* Header */}
                <div className="dept-ma-modal-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="dept-ma-tracking-pill">{selectedLecturerMed.trackingNumber}</span>
                      <span className="dept-ma-badge-pill">{selectedLecturerMed.leaveType}</span>
                    </div>
                    <h3 className="dept-ma-modal-title">
                      Academic Staff Medical Leave: {selectedLecturerMed.lecturer.name}
                    </h3>
                    <p className="dept-ma-modal-subtitle">
                      {selectedLecturerMed.lecturer.designation} • Staff ID: {selectedLecturerMed.lecturer.staffId} • {selectedLecturerMed.lecturer.department}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="dept-ma-modal-close"
                    onClick={() => setSelectedLecturerMed(null)}
                  >
                    ✕
                  </button>
                </div>

                {/* Body */}
                <div className="dept-ma-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Medical Details Card */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '0.75rem',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '1rem',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>LEAVE DURATION</span>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>
                        {selectedLecturerMed.totalDays} Calendar Days
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {selectedLecturerMed.absenceStartDate} to {selectedLecturerMed.absenceEndDate}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>HOSPITAL / CLINIC</span>
                      <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                        {selectedLecturerMed.medicalInstitution}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Doctor: {selectedLecturerMed.doctorName}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>MEDICAL CERTIFICATE NO</span>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0284c7', fontFamily: 'monospace' }}>
                        {selectedLecturerMed.medicalCertNo}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>SUBSTITUTE LECTURER</span>
                      <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0f172a' }}>
                        {selectedLecturerMed.handoverPlan.substituteLecturer}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '600' }}>
                        ✓ {selectedLecturerMed.handoverPlan.status}
                      </div>
                    </div>
                  </div>

                  {/* Handover Details */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '700' }}>LECTURE COVERAGE & HANDOVER PLAN</span>
                    <p style={{ margin: '0.35rem 0 0.2rem 0', fontSize: '0.86rem', fontWeight: '600', color: '#0f172a' }}>
                      Covered Modules: {selectedLecturerMed.handoverPlan.coveredModules}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>
                      Notes: {selectedLecturerMed.handoverPlan.handoverNotes}
                    </p>
                  </div>

                  {/* Attached Documents */}
                  <div>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '0.4rem' }}>
                      ATTACHED OFFICIAL DOCUMENTS ({selectedLecturerMed.documents?.length || 0})
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {selectedLecturerMed.documents?.map((doc, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '0.6rem 0.9rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>📄</span>
                            <span style={{ fontSize: '0.84rem', fontWeight: '600', color: '#0f172a' }}>{doc.name}</span>
                            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>({doc.fileSize} • {doc.type})</span>
                          </div>
                          <button
                            type="button"
                            className="dept-ma-btn-action secondary"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.74rem' }}
                            onClick={() => handleDownloadLecturerDoc(doc.name)}
                          >
                            Download Document
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Verification & Forwarding Form */}
                  <form onSubmit={handleForwardLecturerMedical} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div
                      style={{
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '10px',
                        padding: '1rem',
                      }}
                    >
                      <strong style={{ display: 'block', fontSize: '0.86rem', color: '#1e40af', marginBottom: '0.75rem' }}>
                        Department MA Completeness Verification Checklist
                      </strong>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: '#1e3a8a', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={lecCertAuthentic}
                            onChange={(e) => setLecCertAuthentic(e.target.checked)}
                          />
                          Official Medical Certificate verified (Doctor registration & institution seal checked)
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: '#1e3a8a', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={lecLeaveFormComplete}
                            onChange={(e) => setLecLeaveFormComplete(e.target.checked)}
                          />
                          Academic Staff Leave Application Form completed and signed
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: '#1e3a8a', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={lecCoverageConfirmed}
                            onChange={(e) => setLecCoverageConfirmed(e.target.checked)}
                          />
                          Lecture / practical substitute arrangement confirmed by designated substitute lecturer
                        </label>
                      </div>

                      <div style={{ marginTop: '0.85rem' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#1e40af', marginBottom: '0.3rem' }}>
                          FORWARDING DESTINATION
                        </label>
                        <select
                          className="dept-ma-filter-select"
                          style={{ width: '100%', background: '#ffffff' }}
                          value={lecTargetAuthority}
                          onChange={(e) => setLecTargetAuthority(e.target.value)}
                        >
                          <option value="Head of Department (M.J Ahamed Sabani)">
                            Head of Department (M.J Ahamed Sabani) — Department Recommendation
                          </option>
                          <option value="Senior Assistant Registrar (Academic Establishment) & Dean">
                            Senior Assistant Registrar (Academic Establishment) & Dean — Faculty Board
                          </option>
                          <option value="University Health Centre (Chief Medical Officer)">
                            University Health Centre (Chief Medical Officer) — Medical Endorsement
                          </option>
                        </select>
                      </div>

                      <div style={{ marginTop: '0.75rem' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#1e40af', marginBottom: '0.3rem' }}>
                          DEPARTMENT MA ADMINISTRATIVE NOTES
                        </label>
                        <textarea
                          rows="2"
                          style={{
                            width: '100%',
                            borderRadius: '6px',
                            border: '1px solid #bfdbfe',
                            padding: '0.5rem',
                            fontSize: '0.84rem',
                            fontFamily: 'inherit',
                          }}
                          placeholder="Add administrative notes regarding leave period, substitute coverage, or medical certificate..."
                          value={lecDepartmentNotes}
                          onChange={(e) => setLecDepartmentNotes(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Forwarding History */}
                    {selectedLecturerMed.forwardingHistory?.length > 0 && (
                      <div>
                        <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '0.35rem' }}>
                          PROCESSING & FORWARDING HISTORY
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {selectedLecturerMed.forwardingHistory.map((h, i) => (
                            <div
                              key={i}
                              style={{
                                fontSize: '0.78rem',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                padding: '0.5rem 0.75rem',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', color: '#0f172a' }}>
                                <span>{h.stage}</span>
                                <span style={{ color: '#64748b', fontWeight: '400' }}>{h.timestamp}</span>
                              </div>
                              <div style={{ color: '#475569', marginTop: '0.15rem' }}>
                                {h.actor}: {h.remarks}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="dept-ma-modal-footer">
                      <button
                        type="button"
                        className="dept-ma-btn-action secondary"
                        onClick={() => setSelectedLecturerMed(null)}
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        className="dept-ma-btn-action primary"
                      >
                        Verify Completeness & Forward
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

