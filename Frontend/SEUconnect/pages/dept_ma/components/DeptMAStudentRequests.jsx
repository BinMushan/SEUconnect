import React, { useState, useMemo } from 'react';

export default function DeptMAStudentRequests({
  studentRequests,
  deptInfo,
  onUpdateRequest,
  onShowToast,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterBatch, setFilterBatch] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Forwarding Modal State
  const [targetAuthority, setTargetAuthority] = useState('Head of Department (M.J Ahamed Sabani)');
  const [maRemarks, setMaRemarks] = useState('');
  const [identityVerified, setIdentityVerified] = useState(true);
  const [docsChecked, setDocsChecked] = useState(true);
  const [standingEvaluated, setStandingEvaluated] = useState(true);

  // Filter options
  const requestTypes = [
    'ALL',
    'Leave of Absence',
    'Examination Deferment',
    'Academic Recommendation',
    'Special Concession',
    'Late Add/Drop Request',
    'Hostel / Welfare Endorsement',
  ];
  const statuses = [
    'ALL',
    'Pending MA Review',
    'Forwarded to Lecturer',
    'Forwarded to HOD',
    'Forwarded to SAR',
    'Completed',
    'Declined',
  ];
  const batches = useMemo(() => ['ALL', ...deptInfo.activeBatches], [deptInfo]);

  // Statistics
  const totalCount = studentRequests.length;
  const pendingCount = studentRequests.filter((r) => r.status === 'Pending MA Review').length;
  const forwardedHODCount = studentRequests.filter((r) => r.status === 'Forwarded to HOD').length;
  const forwardedOtherCount = studentRequests.filter(
    (r) => r.status === 'Forwarded to SAR' || r.status === 'Forwarded to Lecturer'
  ).length;

  // Filtered dataset
  const filteredRequests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return studentRequests.filter((req) => {
      if (q) {
        const matches =
          req.id.toLowerCase().includes(q) ||
          req.student.name.toLowerCase().includes(q) ||
          req.student.regNo.toLowerCase().includes(q) ||
          req.subject.toLowerCase().includes(q) ||
          req.requestType.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (filterType !== 'ALL' && req.requestType !== filterType) return false;
      if (filterStatus !== 'ALL' && req.status !== filterStatus) return false;
      if (filterBatch !== 'ALL' && req.student.batch !== filterBatch) return false;
      return true;
    });
  }, [studentRequests, searchQuery, filterType, filterStatus, filterBatch]);

  const handleOpenInspect = (req) => {
    setSelectedRequest(req);
    setTargetAuthority(req.forwardedTo || 'Head of Department (M.J Ahamed Sabani)');
    setMaRemarks(req.maVerification?.maRemarks || '');
    setIdentityVerified(req.maVerification?.studentIdentityVerified ?? true);
    setDocsChecked(req.maVerification?.supportingDocsChecked ?? true);
    setStandingEvaluated(req.maVerification?.attendanceImpactAssessed ?? true);
  };

  const handleForward = (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newStatus = targetAuthority.includes('HOD')
      ? 'Forwarded to HOD'
      : targetAuthority.includes('SAR')
      ? 'Forwarded to SAR'
      : 'Forwarded to Lecturer';

    const newHistory = [
      ...(selectedRequest.forwardingHistory || []),
      {
        stage: `Forwarded to ${targetAuthority}`,
        actor: `${deptInfo.assignedMA.name} (Dept MA)`,
        timestamp,
        remarks: maRemarks || `Verified completeness and forwarded to ${targetAuthority}.`,
      },
    ];

    const updated = {
      ...selectedRequest,
      status: newStatus,
      forwardedTo: targetAuthority,
      forwardedDate: timestamp,
      maVerification: {
        studentIdentityVerified: identityVerified,
        supportingDocsChecked: docsChecked,
        attendanceImpactAssessed: standingEvaluated,
        maRemarks: maRemarks || 'Administrative documents verified complete.',
      },
      forwardingHistory: newHistory,
    };

    onUpdateRequest(updated);
    setSelectedRequest(null);
    onShowToast(`Student request ${updated.id} forwarded to ${targetAuthority}.`, 'success');
  };

  const handleDownloadDoc = (docName) => {
    try {
      const blob = new Blob(
        [
          `SOUTH EASTERN UNIVERSITY OF SRI LANKA\nFACULTY OF TECHNOLOGY - DEPARTMENT OF ICT\n\nOFFICIAL STUDENT REQUEST ATTACHMENT\nDocument: ${docName}\nRequest Reference: ${selectedRequest?.id}\nStudent: ${selectedRequest?.student.name} (${selectedRequest?.student.regNo})\nSubmission Date: ${selectedRequest?.submissionDate}\n\nCertified authentic on record by Department Management Assistant.`
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
      onShowToast(`Downloaded attachment: ${docName}`, 'success');
    } catch {
      onShowToast(`Failed to download ${docName}`, 'error');
    }
  };

  return (
    <div className="dept-ma-requests-section">
      {/* 1. Official Responsibility Header */}
      <div className="dept-ma-panel-card" style={{ marginBottom: '1.5rem', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="dept-ma-badge-pill dept-code">RESPONSIBILITY 5</span>
              <span className="dept-ma-badge-pill">STUDENT AFFAIRS DESK</span>
            </div>
            <h2 style={{ margin: '0 0 0.35rem 0', fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
              Receiving and Forwarding Student Request Letters
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              Receive student request letters, check document completeness, assess academic/attendance standing, and forward to designated lecturers, HOD, Faculty MA, or SAR.
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
            🏛️ <strong>Authorized Departmental Procedure:</strong> Verification & routing desk. Final decisions rest with HOD / Dean / SAR.
          </div>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="dept-ma-stats-grid" style={{ marginBottom: '1.75rem' }}>
        <div className="dept-ma-stat-card">
          <div className="dept-ma-stat-top">
            <span className="dept-ma-stat-label">Total Student Requests</span>
            <div className="dept-ma-stat-icon-wrap blue">📬</div>
          </div>
          <div className="dept-ma-stat-value">{totalCount}</div>
          <div className="dept-ma-stat-sub">Logged in department inquiry book</div>
        </div>

        <div className="dept-ma-stat-card">
          <div className="dept-ma-stat-top">
            <span className="dept-ma-stat-label">Pending MA Review</span>
            <div className="dept-ma-stat-icon-wrap amber">⏳</div>
          </div>
          <div className="dept-ma-stat-value" style={{ color: '#b45309' }}>
            {pendingCount}
          </div>
          <div className="dept-ma-stat-sub">Require completeness audit & routing</div>
        </div>

        <div className="dept-ma-stat-card">
          <div className="dept-ma-stat-top">
            <span className="dept-ma-stat-label">Forwarded to HOD</span>
            <div className="dept-ma-stat-icon-wrap indigo">🏛️</div>
          </div>
          <div className="dept-ma-stat-value" style={{ color: '#4338ca' }}>
            {forwardedHODCount}
          </div>
          <div className="dept-ma-stat-sub">Awaiting departmental head recommendation</div>
        </div>

        <div className="dept-ma-stat-card">
          <div className="dept-ma-stat-top">
            <span className="dept-ma-stat-label">Forwarded to Lecturers / SAR</span>
            <div className="dept-ma-stat-icon-wrap emerald">📋</div>
          </div>
          <div className="dept-ma-stat-value" style={{ color: '#047857' }}>
            {forwardedOtherCount}
          </div>
          <div className="dept-ma-stat-sub">Coursework concessions & exam branch</div>
        </div>
      </div>

      {/* 3. Toolbar */}
      <div className="dept-ma-toolbar">
        <div className="dept-ma-toolbar-left">
          <div className="dept-ma-search-input-wrap">
            <span className="dept-ma-search-icon">🔍</span>
            <input
              type="text"
              className="dept-ma-search-input"
              placeholder="Search by student, reg no, request ID, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="dept-ma-filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            {requestTypes.map((t) => (
              <option key={t} value={t}>
                {t === 'ALL' ? 'All Request Types' : t}
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
        </div>
      </div>

      {/* 4. Requests Table */}
      <div className="dept-ma-table-container">
        <div className="dept-ma-table-wrapper">
          <table className="dept-ma-table">
            <thead>
              <tr>
                <th>Request ID & Date</th>
                <th>Student Details</th>
                <th>Request Type & Category</th>
                <th>Subject / Letter Heading</th>
                <th>Evidence Docs</th>
                <th>Routing Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <span className="dept-ma-tracking-pill">{req.id}</span>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.2rem' }}>
                        {req.submissionDate}
                      </div>
                    </td>
                    <td>
                      <strong>{req.student.name}</strong>
                      <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                        {req.student.regNo} • {req.student.batch}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          color: '#0284c7',
                          background: '#f0f9ff',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          border: '1px solid #bae6fd',
                        }}
                      >
                        {req.requestType}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>
                        {req.category}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.84rem', fontWeight: '600', color: '#0f172a', maxWidth: '280px' }}>
                        {req.subject}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                        📎 {req.attachedDocuments?.length || 0} file(s)
                      </span>
                    </td>
                    <td>
                      <span
                        className={`dept-ma-status-badge ${
                          req.status.includes('Forwarded')
                            ? 'active'
                            : req.status === 'Pending MA Review'
                            ? 'pending'
                            : req.status === 'Completed'
                            ? 'confirmed'
                            : 'rejected'
                        }`}
                      >
                        {req.status}
                      </span>
                      {req.forwardedTo && (
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
                          To: {req.forwardedTo.split('(')[0]}
                        </div>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="dept-ma-btn-action primary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.76rem', whiteSpace: 'nowrap' }}
                        onClick={() => handleOpenInspect(req)}
                      >
                        Inspect & Forward
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No student request letters found matching current filter options.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Inspect & Forwarding Modal */}
      {selectedRequest && (
        <div className="dept-ma-modal-backdrop" onClick={() => setSelectedRequest(null)}>
          <div
            className="dept-ma-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '820px' }}
          >
            {/* Header */}
            <div className="dept-ma-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="dept-ma-tracking-pill">{selectedRequest.id}</span>
                  <span className="dept-ma-badge-pill">{selectedRequest.requestType}</span>
                </div>
                <h3 className="dept-ma-modal-title">{selectedRequest.subject}</h3>
                <p className="dept-ma-modal-subtitle">
                  Submitted on {selectedRequest.submissionDate} by {selectedRequest.student.name} ({selectedRequest.student.regNo})
                </p>
              </div>

              <button
                type="button"
                className="dept-ma-modal-close"
                onClick={() => setSelectedRequest(null)}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="dept-ma-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Student Overview Card */}
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
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>STUDENT NAME</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
                    {selectedRequest.student.name}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>REGISTRATION NO</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0284c7' }}>
                    {selectedRequest.student.regNo}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>BATCH & SEMESTER</span>
                  <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                    {selectedRequest.student.batch} • {selectedRequest.student.semester}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>STUDENT CONTACT</span>
                  <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                    {selectedRequest.student.phone}
                  </div>
                </div>
              </div>

              {/* Request Description */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '700' }}>STUDENT LETTER CONTENT</span>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.88rem', color: '#1e293b', lineHeight: '1.5' }}>
                  {selectedRequest.description}
                </p>
              </div>

              {/* Attached Documents */}
              <div>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '0.4rem' }}>
                  ATTACHED EVIDENCE DOCUMENTS ({selectedRequest.attachedDocuments?.length || 0})
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedRequest.attachedDocuments?.map((doc, idx) => (
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
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>({doc.size} • {doc.type})</span>
                      </div>
                      <button
                        type="button"
                        className="dept-ma-btn-action secondary"
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.74rem' }}
                        onClick={() => handleDownloadDoc(doc.name)}
                      >
                        Download Attachment
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Forwarding Form */}
              <form onSubmit={handleForward} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '10px',
                    padding: '1rem',
                  }}
                >
                  <strong style={{ display: 'block', fontSize: '0.86rem', color: '#1e40af', marginBottom: '0.75rem' }}>
                    Department MA Administrative Completeness Checklist
                  </strong>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: '#1e3a8a', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={identityVerified}
                        onChange={(e) => setIdentityVerified(e.target.checked)}
                      />
                      Student identity, degree registration, and contact details verified
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: '#1e3a8a', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={docsChecked}
                        onChange={(e) => setDocsChecked(e.target.checked)}
                      />
                      All supporting evidence documents inspected and verified authentic
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: '#1e3a8a', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={standingEvaluated}
                        onChange={(e) => setStandingEvaluated(e.target.checked)}
                      />
                      Academic standing & 80% attendance rate audited against faculty by-laws
                    </label>
                  </div>

                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#1e40af', marginBottom: '0.3rem' }}>
                      FORWARD TO AUTHORIZED RECIPIENT
                    </label>
                    <select
                      className="dept-ma-filter-select"
                      style={{ width: '100%', background: '#ffffff' }}
                      value={targetAuthority}
                      onChange={(e) => setTargetAuthority(e.target.value)}
                    >
                      <option value="Head of Department (M.J Ahamed Sabani)">
                        Head of Department (M.J Ahamed Sabani)
                      </option>
                      <option value="Course Lecturer (Dr. S. Kirushanth)">
                        Course Lecturer (Dr. S. Kirushanth) — SWT21022 / SWT22022
                      </option>
                      <option value="Course Lecturer (Dr. K. Perera)">
                        Course Lecturer (Dr. K. Perera) — SWT21032
                      </option>
                      <option value="Senior Assistant Registrar (Examinations) via HOD">
                        Senior Assistant Registrar (Examinations Branch)
                      </option>
                      <option value="Faculty Management Assistant (Office of the Dean)">
                        Faculty Management Assistant (Office of the Dean)
                      </option>
                      <option value="Student Welfare Division (Scholarships & Bursary)">
                        Student Welfare Division (Welfare & Hostels)
                      </option>
                    </select>
                  </div>

                  <div style={{ marginTop: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#1e40af', marginBottom: '0.3rem' }}>
                      DEPARTMENT MA ADMINISTRATIVE REMARKS / ENDORSEMENT
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
                      placeholder="Add administrative verification notes, attendance compliance, or recommendation..."
                      value={maRemarks}
                      onChange={(e) => setMaRemarks(e.target.value)}
                    />
                  </div>
                </div>

                {/* Forwarding History */}
                {selectedRequest.forwardingHistory?.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '0.35rem' }}>
                      PROCESSING & FORWARDING HISTORY
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {selectedRequest.forwardingHistory.map((h, i) => (
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

                {/* Modal Footer */}
                <div className="dept-ma-modal-footer">
                  <button
                    type="button"
                    className="dept-ma-btn-action secondary"
                    onClick={() => setSelectedRequest(null)}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="dept-ma-btn-action primary"
                  >
                    Forward to Selected Authority
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
