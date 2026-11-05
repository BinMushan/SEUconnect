import React, { useState, useMemo } from 'react';

export default function DeptMARegistrations({
  registrations,
  subjects,
  arPackages = [],
  caApplications = [],
  deptInfo,
  onUpdateRegistration,
  onUpdateARPackage,
  onUpdateCAApplication,
  onShowToast,
}) {
  // Top Workspace Tab Switcher
  const [activeWorkspace, setActiveWorkspace] = useState('AR_PACKAGES'); // 'AR_PACKAGES' | 'CA_SIGNING' | 'STUDENT_SLIPS'

  // Student Slips Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterBatch, setFilterBatch] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // CA Signing Filter State
  const [caSearchQuery, setCaSearchQuery] = useState('');
  const [caFilterStatus, setCaFilterStatus] = useState('ALL');
  const [selectedCA, setSelectedCA] = useState(null);
  const [caVoucherChecked, setCaVoucherChecked] = useState(true);
  const [caAttendanceChecked, setCaAttendanceChecked] = useState(true);
  const [caPrereqChecked, setCaPrereqChecked] = useState(true);
  const [caMaNotes, setCaMaNotes] = useState('');

  // AR Package Inspection State
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Filter options for student slips
  const subjectCodes = useMemo(() => ['ALL', ...subjects.map((s) => s.subjectCode)], [subjects]);
  const batches = useMemo(() => ['ALL', ...deptInfo.activeBatches], [deptInfo]);
  const statuses = ['ALL', 'Confirmed', 'Pending Verification', 'Incomplete Documents', 'Duplicate Registration'];

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return registrations.filter((r) => {
      if (q) {
        const matches =
          r.regNo.toLowerCase().includes(q) ||
          r.studentName.toLowerCase().includes(q) ||
          r.subjectCode.toLowerCase().includes(q) ||
          r.subjectName.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (filterSubject !== 'ALL' && r.subjectCode !== filterSubject) return false;
      if (filterBatch !== 'ALL' && r.batch !== filterBatch) return false;
      if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
      return true;
    });
  }, [registrations, searchQuery, filterSubject, filterBatch, filterStatus]);

  // Counts of student slips issues
  const duplicateCount = registrations.filter((r) => r.status === 'Duplicate Registration').length;
  const incompleteCount = registrations.filter((r) => r.status === 'Incomplete Documents').length;
  const pendingCount = registrations.filter((r) => r.status === 'Pending Verification').length;

  // CA Signing Filtered
  const filteredCAApplications = useMemo(() => {
    const q = caSearchQuery.trim().toLowerCase();
    return caApplications.filter((ca) => {
      if (q) {
        const matches =
          ca.trackingNumber.toLowerCase().includes(q) ||
          ca.student.name.toLowerCase().includes(q) ||
          ca.student.regNo.toLowerCase().includes(q) ||
          ca.subject.code.toLowerCase().includes(q) ||
          ca.subject.name.toLowerCase().includes(q) ||
          ca.subject.subjectInCharge.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (caFilterStatus !== 'ALL' && ca.status !== caFilterStatus) return false;
      return true;
    });
  }, [caApplications, caSearchQuery, caFilterStatus]);

  // CA counts
  const caPendingCount = caApplications.filter((c) => c.status === 'Pending MA Verification').length;
  const caForwardedCount = caApplications.filter((c) => c.status === 'Forwarded to Subject In-Charge').length;
  const caSignedCount = caApplications.filter((c) => c.status === 'Signed by Subject In-Charge').length;

  // AR packages counts
  const arCompletedCount = arPackages.filter((p) => p.status === 'Completed & Dispatched').length;
  const arPendingCount = arPackages.filter((p) => p.status.includes('Pending')).length;

  // Handlers for Student Slips
  const handleVerify = (reg) => {
    const updated = {
      ...reg,
      status: 'Confirmed',
      verifiedBy: `${deptInfo.assignedMA.name} (Dept MA)`,
      notes: 'Registration slip verified and prerequisites confirmed by Department MA.',
    };
    onUpdateRegistration(updated);
    onShowToast(`Registration for ${reg.studentName} (${reg.subjectCode}) confirmed.`, 'success');
  };

  const handleResolveDuplicate = (reg) => {
    const updated = {
      ...reg,
      status: 'Confirmed',
      verifiedBy: `${deptInfo.assignedMA.name} (Dept MA)`,
      notes: 'Duplicate registration resolved; single primary enrollment retained.',
    };
    onUpdateRegistration(updated);
    onShowToast(`Duplicate registration resolved for ${reg.regNo} in ${reg.subjectCode}.`, 'info');
  };

  const handleExportCSV = () => {
    try {
      const headers = ['Registration ID', 'Reg No', 'Student Name', 'Batch', 'Semester', 'Subject Code', 'Subject Name', 'Credits', 'Status', 'Verified By'];
      const rows = filteredRegistrations.map((r) => [
        `"${r.id}"`,
        `"${r.regNo}"`,
        `"${r.studentName}"`,
        `"${r.batch}"`,
        `"${r.semester}"`,
        `"${r.subjectCode}"`,
        `"${r.subjectName}"`,
        `"${r.credits}"`,
        `"${r.status}"`,
        `"${r.verifiedBy || 'Unverified'}"`,
      ]);
      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `SEUConnect_Registrations_${deptInfo.departmentCode}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onShowToast('Course registration roster exported successfully as CSV.', 'success');
    } catch {
      onShowToast('Failed to export registration records.', 'error');
    }
  };

  // Handlers for CA Signing
  const handleOpenCAInspect = (ca) => {
    setSelectedCA(ca);
    setCaVoucherChecked(ca.administrativeCheck?.voucherVerified ?? true);
    setCaAttendanceChecked(ca.administrativeCheck?.attendanceEligibilityVerified ?? true);
    setCaPrereqChecked(ca.administrativeCheck?.prerequisitesSatisfied ?? true);
    setCaMaNotes(ca.administrativeCheck?.notes || '');
  };

  const handleForwardToSubjectInCharge = (e) => {
    e.preventDefault();
    if (!selectedCA) return;

    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const updated = {
      ...selectedCA,
      status: 'Forwarded to Subject In-Charge',
      administrativeCheck: {
        verifiedBy: `${deptInfo.assignedMA.name} (Dept MA)`,
        verifiedAt: timestamp,
        voucherVerified: caVoucherChecked,
        attendanceEligibilityVerified: caAttendanceChecked,
        prerequisitesSatisfied: caPrereqChecked,
        notes: caMaNotes || `Administrative details and bank payment verified. Forwarded to ${selectedCA.subject.subjectInCharge} for academic signature.`,
      },
    };

    if (typeof onUpdateCAApplication === 'function') {
      onUpdateCAApplication(updated);
    }
    setSelectedCA(null);
    onShowToast(`CA application ${updated.trackingNumber} forwarded to Subject In-Charge (${selectedCA.subject.subjectInCharge}) for signing.`, 'success');
  };

  // Handler for AR Package Dispatch
  const handleDispatchARPackage = (pkg) => {
    const updated = {
      ...pkg,
      workflowStage: 'Dispatched to AR Office',
      status: 'Completed & Dispatched',
      notes: `Verified by Department MA (${deptInfo.assignedMA.name}), fully signed by advisors & HOD, and dispatched to AR Office.`,
    };
    if (typeof onUpdateARPackage === 'function') {
      onUpdateARPackage(updated);
    }
    setSelectedPackage(null);
    onShowToast(`Semester registration package ${pkg.id} dispatched to AR Office.`, 'success');
  };

  return (
    <div className="dept-ma-registrations-section">
      {/* Top Workspace Tab Switcher */}
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
          className={`dept-ma-btn-action ${activeWorkspace === 'AR_PACKAGES' ? 'primary' : 'secondary'}`}
          style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}
          onClick={() => setActiveWorkspace('AR_PACKAGES')}
        >
          AR Office Semester Registrations ({arPendingCount} Pending)
        </button>

        <button
          type="button"
          className={`dept-ma-btn-action ${activeWorkspace === 'CA_SIGNING' ? 'primary' : 'secondary'}`}
          style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}
          onClick={() => setActiveWorkspace('CA_SIGNING')}
        >
          CA Application Signing Desk ({caPendingCount} Pending)
        </button>

        <button
          type="button"
          className={`dept-ma-btn-action ${activeWorkspace === 'STUDENT_SLIPS' ? 'primary' : 'secondary'}`}
          style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}
          onClick={() => setActiveWorkspace('STUDENT_SLIPS')}
        >
          Student Registration Slips ({pendingCount} Slips)
        </button>
      </div>

      {/* WORKSPACE 1: AR OFFICE SEMESTER REGISTRATION PACKAGES (Responsibility 3) */}
      {activeWorkspace === 'AR_PACKAGES' && (
        <div>
          {/* Header */}
          <div className="dept-ma-panel-card" style={{ marginBottom: '1.5rem', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span className="dept-ma-badge-pill dept-code">RESPONSIBILITY 3</span>
                  <span className="dept-ma-badge-pill">AR OFFICE WORKFLOW</span>
                </div>
                <h2 style={{ margin: '0 0 0.35rem 0', fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
                  Subject Registration Signing and Forwarding (AR Office)
                </h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  Receive semester subject registration dossiers prepared by the AR Office, audit completeness (credit thresholds & prerequisites), forward for authorized Academic Advisor and HOD signatures, and track return dispatch to the AR Office.
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
                🏛️ <strong>AR Office Responsibility Preserved:</strong> The AR Office prepares the original registration documents. Department MA verifies completeness and coordinates academic signing.
              </div>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="dept-ma-stats-grid" style={{ marginBottom: '1.75rem' }}>
            <div className="dept-ma-stat-card">
              <div className="dept-ma-stat-top">
                <span className="dept-ma-stat-label">Total AR Packages</span>
                <div className="dept-ma-stat-icon-wrap blue">📦</div>
              </div>
              <div className="dept-ma-stat-value">{arPackages.length}</div>
              <div className="dept-ma-stat-sub">Semester registration rosters</div>
            </div>

            <div className="dept-ma-stat-card">
              <div className="dept-ma-stat-top">
                <span className="dept-ma-stat-label">Pending Verification & Signatures</span>
                <div className="dept-ma-stat-icon-wrap amber">⏳</div>
              </div>
              <div className="dept-ma-stat-value" style={{ color: '#b45309' }}>
                {arPendingCount}
              </div>
              <div className="dept-ma-stat-sub">Under completeness check / advisor routing</div>
            </div>

            <div className="dept-ma-stat-card">
              <div className="dept-ma-stat-top">
                <span className="dept-ma-stat-label">Completed & Dispatched</span>
                <div className="dept-ma-stat-icon-wrap emerald">✅</div>
              </div>
              <div className="dept-ma-stat-value" style={{ color: '#047857' }}>
                {arCompletedCount}
              </div>
              <div className="dept-ma-stat-sub">Fully signed & returned to AR Office</div>
            </div>
          </div>

          {/* AR Packages Grid / Table */}
          <div className="dept-ma-table-container">
            <div className="dept-ma-table-wrapper">
              <table className="dept-ma-table">
                <thead>
                  <tr>
                    <th>Package ID & Origin</th>
                    <th>Batch & Semester</th>
                    <th>Students & Modules</th>
                    <th>MA Completeness Audit</th>
                    <th>Signatories Status</th>
                    <th>Workflow Stage</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {arPackages.map((pkg) => (
                    <tr key={pkg.id}>
                      <td>
                        <span className="dept-ma-tracking-pill">{pkg.id}</span>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.2rem' }}>
                          Prepared by: {pkg.preparedBy}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#0284c7' }}>
                          Date: {pkg.dispatchDate}
                        </div>
                      </td>
                      <td>
                        <strong>Batch {pkg.batch}</strong>
                        <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                          {pkg.semester} • {pkg.academicYear}
                        </div>
                      </td>
                      <td>
                        <strong>{pkg.totalStudents}</strong> Students
                        <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                          {pkg.totalModules} Registered Modules ({pkg.modulesList?.join(', ')})
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.76rem' }}>
                          {pkg.verificationChecklist.minCreditsSatisfied ? (
                            <span style={{ color: '#059669', fontWeight: '600' }}>✓ 15-20 Credits Met</span>
                          ) : (
                            <span style={{ color: '#dc2626', fontWeight: '600' }}>✕ Credit Discrepancy</span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.76rem' }}>
                          {pkg.verificationChecklist.prerequisitesAudited ? (
                            <span style={{ color: '#059669', fontWeight: '600' }}>✓ Prereqs Satisfied</span>
                          ) : (
                            <span style={{ color: '#b45309', fontWeight: '600' }}>⚠️ 2 Prereqs Under Review</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {pkg.signatoriesStatus?.map((sig, i) => (
                          <div key={i} style={{ fontSize: '0.74rem', color: '#334155' }}>
                            <strong>{sig.role}:</strong>{' '}
                            <span style={{ color: sig.status === 'Signed' ? '#059669' : '#b45309', fontWeight: '600' }}>
                              {sig.status} {sig.date ? `(${sig.date})` : ''}
                            </span>
                          </div>
                        ))}
                      </td>
                      <td>
                        <span
                          className={`dept-ma-status-badge ${
                            pkg.status === 'Completed & Dispatched' ? 'confirmed' : 'pending'
                          }`}
                        >
                          {pkg.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="dept-ma-btn-action primary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.76rem', whiteSpace: 'nowrap' }}
                          onClick={() => setSelectedPackage(pkg)}
                        >
                          Inspect Package
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AR Package Inspection Modal */}
          {selectedPackage && (
            <div className="dept-ma-modal-backdrop" onClick={() => setSelectedPackage(null)}>
              <div
                className="dept-ma-modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '780px' }}
              >
                <div className="dept-ma-modal-header">
                  <div>
                    <span className="dept-ma-tracking-pill">{selectedPackage.id}</span>
                    <h3 className="dept-ma-modal-title" style={{ marginTop: '0.2rem' }}>
                      AR Registration Dossier: Batch {selectedPackage.batch} ({selectedPackage.semester})
                    </h3>
                    <p className="dept-ma-modal-subtitle">
                      {selectedPackage.originOffice} • Dispatched {selectedPackage.dispatchDate}
                    </p>
                  </div>
                  <button type="button" className="dept-ma-modal-close" onClick={() => setSelectedPackage(null)}>
                    ✕
                  </button>
                </div>

                <div className="dept-ma-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
                      Package Enrolment Overview
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', fontSize: '0.82rem' }}>
                      <div>Total Students: <strong>{selectedPackage.totalStudents}</strong></div>
                      <div>Curriculum Modules: <strong>{selectedPackage.totalModules}</strong></div>
                      <div>Academic Year: <strong>{selectedPackage.academicYear}</strong></div>
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#475569' }}>
                      Modules: {selectedPackage.modulesList?.join(', ')}
                    </div>
                  </div>

                  <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#1e40af', marginBottom: '0.5rem' }}>
                      Signatories Tracking
                    </div>
                    {selectedPackage.signatoriesStatus?.map((sig, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.25rem 0' }}>
                        <span><strong>{sig.role}</strong> ({sig.name})</span>
                        <span style={{ color: sig.status === 'Signed' ? '#059669' : '#b45309', fontWeight: '700' }}>
                          {sig.status} {sig.date ? `• ${sig.date}` : ''}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                    <strong>Administrative Notes:</strong> {selectedPackage.notes}
                  </div>
                </div>

                <div className="dept-ma-modal-footer">
                  <button
                    type="button"
                    className="dept-ma-btn-action secondary"
                    onClick={() => setSelectedPackage(null)}
                  >
                    Close
                  </button>
                  {selectedPackage.status !== 'Completed & Dispatched' && (
                    <button
                      type="button"
                      className="dept-ma-btn-action primary"
                      onClick={() => handleDispatchARPackage(selectedPackage)}
                    >
                      Certify & Dispatch to AR Office
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* WORKSPACE 2: CA APPLICATION SIGNING DESK AS SUBJECT IN-CHARGE (Responsibility 2) */}
      {activeWorkspace === 'CA_SIGNING' && (
        <div>
          {/* Header */}
          <div className="dept-ma-panel-card" style={{ marginBottom: '1.5rem', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span className="dept-ma-badge-pill dept-code">RESPONSIBILITY 2</span>
                  <span className="dept-ma-badge-pill">CA SIGNING DESK</span>
                </div>
                <h2 style={{ margin: '0 0 0.35rem 0', fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
                  CA Application Signing as Subject In-Charge
                </h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  Receive and process Continuous Assessment (CA) repeat applications requiring the signature of the Subject In-Charge. Verify administrative fee vouchers (Rs. 250) and coursework attendance records, and forward to the designated Subject In-Charge for signing.
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
                🏛️ <strong>Signing Authority Protection:</strong> Department MA verifies administrative eligibility. Signing authority rests strictly with the designated Subject In-Charge.
              </div>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="dept-ma-stats-grid" style={{ marginBottom: '1.75rem' }}>
            <div className="dept-ma-stat-card">
              <div className="dept-ma-stat-top">
                <span className="dept-ma-stat-label">Total CA Applications</span>
                <div className="dept-ma-stat-icon-wrap blue">📝</div>
              </div>
              <div className="dept-ma-stat-value">{caApplications.length}</div>
              <div className="dept-ma-stat-sub">Continuous Assessment repeat requests</div>
            </div>

            <div className="dept-ma-stat-card">
              <div className="dept-ma-stat-top">
                <span className="dept-ma-stat-label">Pending MA Verification</span>
                <div className="dept-ma-stat-icon-wrap amber">⏳</div>
              </div>
              <div className="dept-ma-stat-value" style={{ color: '#b45309' }}>
                {caPendingCount}
              </div>
              <div className="dept-ma-stat-sub">Requires voucher & attendance check</div>
            </div>

            <div className="dept-ma-stat-card">
              <div className="dept-ma-stat-top">
                <span className="dept-ma-stat-label">Forwarded for In-Charge Signing</span>
                <div className="dept-ma-stat-icon-wrap indigo">🖋️</div>
              </div>
              <div className="dept-ma-stat-value" style={{ color: '#4338ca' }}>
                {caForwardedCount}
              </div>
              <div className="dept-ma-stat-sub">Awaiting Course Lecturer endorsement</div>
            </div>

            <div className="dept-ma-stat-card">
              <div className="dept-ma-stat-top">
                <span className="dept-ma-stat-label">Signed by Subject In-Charge</span>
                <div className="dept-ma-stat-icon-wrap emerald">✅</div>
              </div>
              <div className="dept-ma-stat-value" style={{ color: '#047857' }}>
                {caSignedCount}
              </div>
              <div className="dept-ma-stat-sub">Completed with digital signature seal</div>
            </div>
          </div>

          {/* CA Toolbar */}
          <div className="dept-ma-toolbar">
            <div className="dept-ma-toolbar-left">
              <div className="dept-ma-search-input-wrap">
                <span className="dept-ma-search-icon">🔍</span>
                <input
                  type="text"
                  className="dept-ma-search-input"
                  placeholder="Search by student, reg no, subject, or Subject In-Charge..."
                  value={caSearchQuery}
                  onChange={(e) => setCaSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="dept-ma-filter-select"
                value={caFilterStatus}
                onChange={(e) => setCaFilterStatus(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="Pending MA Verification">Pending MA Verification</option>
                <option value="Forwarded to Subject In-Charge">Forwarded to Subject In-Charge</option>
                <option value="Signed by Subject In-Charge">Signed by Subject In-Charge</option>
              </select>
            </div>
          </div>

          {/* CA Applications Table */}
          <div className="dept-ma-table-container">
            <div className="dept-ma-table-wrapper">
              <table className="dept-ma-table">
                <thead>
                  <tr>
                    <th>Tracking ID & Date</th>
                    <th>Student Details</th>
                    <th>Subject Code & Title</th>
                    <th>Subject In-Charge</th>
                    <th>Assessment & Reason</th>
                    <th>Bank Voucher</th>
                    <th>Signing Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCAApplications.length > 0 ? (
                    filteredCAApplications.map((ca) => (
                      <tr key={ca.id}>
                        <td>
                          <span className="dept-ma-tracking-pill">{ca.trackingNumber}</span>
                          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.2rem' }}>
                            {ca.bankVoucher.paymentDate}
                          </div>
                        </td>
                        <td>
                          <strong>{ca.student.name}</strong>
                          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                            {ca.student.regNo} • {ca.student.batch}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: '700', color: '#0369a1' }}>{ca.subject.code}</span>
                          <div style={{ fontSize: '0.8rem', color: '#334155' }}>{ca.subject.name}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.84rem', fontWeight: '600', color: '#0f172a' }}>
                            {ca.subject.subjectInCharge}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {ca.subject.subjectInChargeDesignation}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0f172a' }}>
                            {ca.assessment.component}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#475569', maxWidth: '240px' }}>
                            {ca.assessment.reason}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0f172a' }}>
                            {ca.bankVoucher.voucherNo}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '700' }}>
                            Rs. {ca.bankVoucher.amount} • {ca.bankVoucher.status}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`dept-ma-status-badge ${
                              ca.status === 'Signed by Subject In-Charge'
                                ? 'confirmed'
                                : ca.status === 'Forwarded to Subject In-Charge'
                                ? 'active'
                                : 'pending'
                            }`}
                          >
                            {ca.status}
                          </span>
                          {ca.signingStatus.signed && (
                            <div style={{ fontSize: '0.7rem', color: '#059669', marginTop: '0.2rem' }}>
                              Signed: {ca.signingStatus.signedDate}
                            </div>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="dept-ma-btn-action primary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.76rem', whiteSpace: 'nowrap' }}
                            onClick={() => handleOpenCAInspect(ca)}
                          >
                            Inspect & Process
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No CA applications found matching current filter options.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* CA Inspection & Processing Modal */}
          {selectedCA && (
            <div className="dept-ma-modal-backdrop" onClick={() => setSelectedCA(null)}>
              <div
                className="dept-ma-modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '800px' }}
              >
                <div className="dept-ma-modal-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="dept-ma-tracking-pill">{selectedCA.trackingNumber}</span>
                      <span className="dept-ma-badge-pill">{selectedCA.subject.code}</span>
                    </div>
                    <h3 className="dept-ma-modal-title">
                      CA Application Verification: {selectedCA.student.name}
                    </h3>
                    <p className="dept-ma-modal-subtitle">
                      Subject In-Charge: {selectedCA.subject.subjectInCharge} ({selectedCA.subject.name})
                    </p>
                  </div>
                  <button type="button" className="dept-ma-modal-close" onClick={() => setSelectedCA(null)}>
                    ✕
                  </button>
                </div>

                <div className="dept-ma-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Assessment & Fee Details */}
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
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>STUDENT</span>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
                        {selectedCA.student.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {selectedCA.student.regNo} • {selectedCA.student.batch}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>ASSESSMENT</span>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
                        {selectedCA.assessment.component}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#475569' }}>
                        Original Date: {selectedCA.assessment.originalDate}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>PAYMENT VOUCHER</span>
                      <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#059669' }}>
                        Rs. {selectedCA.bankVoucher.amount} Paid
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        {selectedCA.bankVoucher.voucherNo} • {selectedCA.bankVoucher.bankName}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>SUBJECT IN-CHARGE</span>
                      <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0284c7' }}>
                        {selectedCA.subject.subjectInCharge}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        Course Lecturer
                      </div>
                    </div>
                  </div>

                  {/* Reason & Supporting Medical */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '700' }}>JUSTIFICATION FOR RESIT</span>
                    <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.86rem', color: '#1e293b' }}>
                      {selectedCA.assessment.reason}
                    </p>
                    {selectedCA.supportingMedical && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#0284c7' }}>
                        📎 Linked Medical Application: <strong>{selectedCA.supportingMedical.trackingNo}</strong> ({selectedCA.supportingMedical.status} • {selectedCA.supportingMedical.clinic})
                      </div>
                    )}
                  </div>

                  {/* Digital Signature Display (If Signed) */}
                  {selectedCA.signingStatus.signed && (
                    <div
                      style={{
                        background: '#f0fdf4',
                        border: '2px dashed #059669',
                        borderRadius: '10px',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#065f46' }}>
                          ✓ Signed by Subject In-Charge
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#047857' }}>
                          Signatory: {selectedCA.signingStatus.signedBy} on {selectedCA.signingStatus.signedDate}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#475569', marginTop: '0.2rem' }}>
                          Remarks: {selectedCA.signingStatus.lecturerRemarks}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.72rem', color: '#059669' }}>
                        {selectedCA.signingStatus.digitalStamp}
                      </div>
                    </div>
                  )}

                  {/* MA Administrative Verification Form */}
                  {!selectedCA.signingStatus.signed && (
                    <form onSubmit={handleForwardToSubjectInCharge} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '1rem' }}>
                        <strong style={{ display: 'block', fontSize: '0.86rem', color: '#1e40af', marginBottom: '0.75rem' }}>
                          Department MA Administrative Verification Checklist
                        </strong>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: '#1e3a8a', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={caVoucherChecked}
                              onChange={(e) => setCaVoucherChecked(e.target.checked)}
                            />
                            Examination fee voucher verified (PB Voucher: {selectedCA.bankVoucher.voucherNo} - Rs. 250 cleared)
                          </label>

                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: '#1e3a8a', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={caAttendanceChecked}
                              onChange={(e) => setCaAttendanceChecked(e.target.checked)}
                            />
                            Coursework attendance records audited & confirmed eligible for continuous assessment resit
                          </label>

                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: '#1e3a8a', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={caPrereqChecked}
                              onChange={(e) => setCaPrereqChecked(e.target.checked)}
                            />
                            Course enrollment prerequisites and department registration confirmed
                          </label>
                        </div>

                        <div style={{ marginTop: '0.85rem' }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#1e40af', marginBottom: '0.3rem' }}>
                            DEPARTMENT MA ADMINISTRATIVE NOTES / ENDORSEMENT
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
                            placeholder="Add administrative verification notes for the Subject In-Charge..."
                            value={caMaNotes}
                            onChange={(e) => setCaMaNotes(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="dept-ma-modal-footer">
                        <button
                          type="button"
                          className="dept-ma-btn-action secondary"
                          onClick={() => setSelectedCA(null)}
                        >
                          Close
                        </button>
                        <button
                          type="submit"
                          className="dept-ma-btn-action primary"
                        >
                          Forward to Subject In-Charge for Signing
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* WORKSPACE 3: INDIVIDUAL STUDENT REGISTRATION SLIPS (Existing Table) */}
      {activeWorkspace === 'STUDENT_SLIPS' && (
        <div>
          {/* Discrepancy Alerts */}
          {(duplicateCount > 0 || incompleteCount > 0 || pendingCount > 0) && (
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                <div>
                  <strong style={{ color: '#92400e', fontSize: '0.94rem' }}>
                    Department Registration Discrepancy Alert
                  </strong>
                  <div style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '0.15rem' }}>
                    Detected {pendingCount} pending slips, {incompleteCount} incomplete prerequisites, and {duplicateCount} duplicate registrations requiring Department MA resolution.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {duplicateCount > 0 && (
                  <button
                    type="button"
                    className="dept-ma-btn-action secondary"
                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                    onClick={() => setFilterStatus('Duplicate Registration')}
                  >
                    View Duplicates ({duplicateCount})
                  </button>
                )}
                {incompleteCount > 0 && (
                  <button
                    type="button"
                    className="dept-ma-btn-action secondary"
                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                    onClick={() => setFilterStatus('Incomplete Documents')}
                  >
                    View Incomplete ({incompleteCount})
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Filter Toolbar */}
          <div className="dept-ma-toolbar">
            <div className="dept-ma-toolbar-left">
              <div className="dept-ma-search-input-wrap">
                <span className="dept-ma-search-icon">🔍</span>
                <input
                  type="text"
                  className="dept-ma-search-input"
                  placeholder="Search by student, reg no, or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="dept-ma-filter-select"
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
              >
                {subjectCodes.map((s) => (
                  <option key={s} value={s}>
                    {s === 'ALL' ? 'All Subjects' : s}
                  </option>
                ))}
              </select>

              <select
                className="dept-ma-filter-select"
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
              >
                {batches.map((b) => (
                  <option key={b} value={b}>
                    {b === 'ALL' ? 'All Batches' : `Batch: ${b}`}
                  </option>
                ))}
              </select>

              <select
                className="dept-ma-filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    {st === 'ALL' ? 'All Statuses' : st}
                  </option>
                ))}
              </select>
            </div>

            <div className="dept-ma-toolbar-right">
              <button
                type="button"
                className="dept-ma-btn-action secondary"
                onClick={handleExportCSV}
              >
                Export Roster (CSV)
              </button>
            </div>
          </div>

          {/* Registrations Table */}
          <div className="dept-ma-table-container">
            <div className="dept-ma-table-wrapper">
              <table className="dept-ma-table">
                <thead>
                  <tr>
                    <th>Registration ID</th>
                    <th>Student Details</th>
                    <th>Subject Code & Title</th>
                    <th>Credits</th>
                    <th>Prerequisites</th>
                    <th>Registration Date</th>
                    <th>Status</th>
                    <th>Verification Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.length > 0 ? (
                    filteredRegistrations.map((reg) => (
                      <tr key={reg.id}>
                        <td>
                          <span className="dept-ma-tracking-pill">{reg.id}</span>
                        </td>
                        <td>
                          <strong>{reg.studentName}</strong>
                          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                            {reg.regNo} • {reg.batch}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: '700', color: '#0369a1' }}>{reg.subjectCode}</span>
                          <div style={{ fontSize: '0.8rem', color: '#334155' }}>{reg.subjectName}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{reg.semester}</div>
                        </td>
                        <td>
                          <strong>{reg.credits}</strong> cr
                        </td>
                        <td>
                          {reg.prerequisiteMet ? (
                            <span style={{ color: '#059669', fontSize: '0.8rem', fontWeight: '700' }}>
                              ✓ Satisfied
                            </span>
                          ) : (
                            <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: '700' }}>
                              ✕ Missing Prereq
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>{reg.registrationDate}</td>
                        <td>
                          <span
                            className={`dept-ma-status-badge ${
                              reg.status === 'Confirmed'
                                ? 'confirmed'
                                : reg.status === 'Pending Verification'
                                ? 'pending'
                                : reg.status === 'Duplicate Registration'
                                ? 'duplicate'
                                : 'incomplete'
                            }`}
                          >
                            {reg.status}
                          </span>
                        </td>
                        <td>
                          {reg.status === 'Pending Verification' && (
                            <button
                              type="button"
                              className="dept-ma-btn-action primary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.76rem' }}
                              onClick={() => handleVerify(reg)}
                            >
                              Verify Slip
                            </button>
                          )}
                          {reg.status === 'Duplicate Registration' && (
                            <button
                              type="button"
                              className="dept-ma-btn-action secondary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.76rem', color: '#7e22ce' }}
                              onClick={() => handleResolveDuplicate(reg)}
                            >
                              Resolve Duplicate
                            </button>
                          )}
                          {reg.status === 'Incomplete Documents' && (
                            <button
                              type="button"
                              className="dept-ma-btn-action secondary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.76rem', color: '#dc2626' }}
                              onClick={() => onShowToast(`Notification sent to ${reg.regNo} to submit missing advisor form.`, 'info')}
                            >
                              Notify Student
                            </button>
                          )}
                          {reg.status === 'Confirmed' && (
                            <span style={{ fontSize: '0.74rem', color: '#059669' }}>
                              ✓ {reg.verifiedBy?.split('(')[0] || 'Verified'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No subject registrations found matching current filter options.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
