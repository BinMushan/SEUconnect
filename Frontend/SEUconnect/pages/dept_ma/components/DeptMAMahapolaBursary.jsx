import React, { useState, useMemo } from 'react';

export default function DeptMAMahapolaBursary({
  mahapolaBursaryList,
  deptInfo,
  onUpdateRecord,
  onShowToast,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterBatch, setFilterBatch] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Verification modal state
  const [gnVerified, setGnVerified] = useState(true);
  const [dsVerified, setDsVerified] = useState(true);
  const [bankVerified, setBankVerified] = useState(true);
  const [attendanceVerified, setAttendanceVerified] = useState(true);
  const [maRemarks, setMaRemarks] = useState('');

  // Category and status options
  const categories = [
    'ALL',
    'Mahapola Scholarship (Merit)',
    'Mahapola Scholarship (Ordinary)',
    'University Bursary (Full)',
    'University Bursary (Half)',
  ];
  const statuses = [
    'ALL',
    'Verified & Forwarded to Student Welfare',
    'Under Verification',
    'Incomplete Documents',
  ];
  const batches = useMemo(() => ['ALL', ...deptInfo.activeBatches], [deptInfo]);

  // Statistics
  const totalCount = mahapolaBursaryList.length;
  const mahapolaCount = mahapolaBursaryList.filter((r) => r.category.includes('Mahapola')).length;
  const bursaryCount = mahapolaBursaryList.filter((r) => r.category.includes('Bursary')).length;
  const incompleteCount = mahapolaBursaryList.filter((r) => r.departmentStatus === 'Incomplete Documents').length;
  const forwardedCount = mahapolaBursaryList.filter((r) => r.departmentStatus.includes('Forwarded')).length;

  // Filtered dataset
  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return mahapolaBursaryList.filter((item) => {
      if (q) {
        const matches =
          item.student.name.toLowerCase().includes(q) ||
          item.student.regNo.toLowerCase().includes(q) ||
          item.student.nic?.toLowerCase().includes(q) ||
          item.bankDetails.accountNumber.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (filterCategory !== 'ALL' && item.category !== filterCategory) return false;
      if (filterStatus !== 'ALL' && item.departmentStatus !== filterStatus) return false;
      if (filterBatch !== 'ALL' && item.student.batch !== filterBatch) return false;
      return true;
    });
  }, [mahapolaBursaryList, searchQuery, filterCategory, filterStatus, filterBatch]);

  const handleOpenInspect = (record) => {
    setSelectedRecord(record);
    setGnVerified(record.incomeDocuments?.gnCertificateSubmitted ?? true);
    setDsVerified(record.incomeDocuments?.dsEndorsementSubmitted ?? true);
    setBankVerified(record.bankDetails?.passbookVerified ?? true);
    setAttendanceVerified(record.attendanceCheck?.thresholdSatisfied ?? true);
    setMaRemarks(record.remarks || '');
  };

  const handleCertifyAndForward = (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const isComplete = gnVerified && dsVerified && bankVerified;

    const updated = {
      ...selectedRecord,
      departmentStatus: isComplete
        ? 'Verified & Forwarded to Student Welfare'
        : 'Incomplete Documents',
      forwardedTo: isComplete
        ? 'Senior Assistant Registrar (Student Welfare Branch) / Bursar Office'
        : null,
      forwardedDate: isComplete ? timestamp : null,
      verificationOfficer: `${deptInfo.assignedMA.name} (Dept MA)`,
      incomeDocuments: {
        ...selectedRecord.incomeDocuments,
        gnCertificateSubmitted: gnVerified,
        dsEndorsementSubmitted: dsVerified,
        status: isComplete ? 'Complete & Verified' : 'Incomplete Documents Detected',
      },
      bankDetails: {
        ...selectedRecord.bankDetails,
        passbookVerified: bankVerified,
      },
      attendanceCheck: {
        ...selectedRecord.attendanceCheck,
        thresholdSatisfied: attendanceVerified,
        status: attendanceVerified ? 'Qualified (>= 80%)' : 'Attendance At Risk (< 80%)',
      },
      remarks: maRemarks || (isComplete ? 'All scholarship documents verified. Forwarded to Student Welfare.' : 'Missing documentation pending student submission.'),
    };

    onUpdateRecord(updated);
    setSelectedRecord(null);
    if (isComplete) {
      onShowToast(`Scholarship dossier for ${updated.student.name} (${updated.student.regNo}) certified and forwarded to Student Welfare.`, 'success');
    } else {
      onShowToast(`Dossier for ${updated.student.name} marked as incomplete. Notification sent to student.`, 'info');
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = [
        'Reg No',
        'Student Name',
        'Batch',
        'Academic Year',
        'Category',
        'Monthly Stipend',
        'Bank Name',
        'Account Number',
        'Attendance Rate %',
        'Attendance Standing',
        'Income Certificate (GN)',
        'DS Endorsement',
        'Department Status',
      ];
      const rows = filteredList.map((r) => [
        `"${r.student.regNo}"`,
        `"${r.student.name}"`,
        `"${r.student.batch}"`,
        `"${r.student.academicYear}"`,
        `"${r.category}"`,
        `"Rs. ${r.monthlyAmount}"`,
        `"${r.bankDetails.bankName}"`,
        `"${r.bankDetails.accountNumber}"`,
        `"${r.attendanceCheck.currentRate}%"`,
        `"${r.attendanceCheck.status}"`,
        `"${r.incomeDocuments.gnCertificateSubmitted ? 'Verified' : 'Missing'}"`,
        `"${r.incomeDocuments.dsEndorsementSubmitted ? 'Verified' : 'Missing'}"`,
        `"${r.departmentStatus}"`,
      ]);
      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `SEUConnect_Mahapola_Bursary_Roster_${deptInfo.departmentCode}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onShowToast('Department scholarship eligibility roster exported as CSV.', 'success');
    } catch {
      onShowToast('Failed to export scholarship roster.', 'error');
    }
  };

  const handleDownloadDoc = (docName) => {
    try {
      const blob = new Blob(
        [
          `SOUTH EASTERN UNIVERSITY OF SRI LANKA\nFACULTY OF TECHNOLOGY - DEPARTMENT OF ICT\n\nMAHAPOLA & BURSARY VERIFIED RECORD\nFile: ${docName}\nStudent: ${selectedRecord?.student.name} (${selectedRecord?.student.regNo})\nCategory: ${selectedRecord?.category}\nBank: ${selectedRecord?.bankDetails.bankName} - Acc: ${selectedRecord?.bankDetails.accountNumber}\n\nCertified on record by Department Management Assistant.`
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
      onShowToast(`Downloaded scholarship attachment: ${docName}`, 'success');
    } catch {
      onShowToast(`Failed to download ${docName}`, 'error');
    }
  };

  return (
    <div className="dept-ma-mahapola-section">
      {/* 1. Official Responsibility Header */}
      <div className="dept-ma-panel-card" style={{ marginBottom: '1.5rem', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="dept-ma-badge-pill dept-code">RESPONSIBILITY 7</span>
              <span className="dept-ma-badge-pill">STUDENT WELFARE & SCHOLARSHIPS</span>
            </div>
            <h2 style={{ margin: '0 0 0.35rem 0', fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
              Maintaining Mahapola and Bursary Documents
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              Maintain student scholarship records, verify income documentation and bank passbook slips, audit mandatory 80% attendance compliance for installment release, and forward certified departmental rosters to Student Welfare & Bursar.
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
            🏛️ <strong>Regulatory Scope:</strong> Administrative document verification & forwarding. Financial eligibility is determined by Student Welfare & UGC.
          </div>
        </div>
      </div>

      {/* 2. Discrepancy Alert */}
      {incompleteCount > 0 && (
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
            <span style={{ fontSize: '1.4rem' }}>⚠️</span>
            <div>
              <strong style={{ color: '#92400e', fontSize: '0.94rem' }}>
                Incomplete Scholarship Dossiers Detected ({incompleteCount})
              </strong>
              <div style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '0.15rem' }}>
                Students with missing Divisional Secretariat endorsements or unverified bank passbooks cannot be included in the monthly bursary payroll dispatch.
              </div>
            </div>
          </div>

          <button
            type="button"
            className="dept-ma-btn-action secondary"
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            onClick={() => setFilterStatus('Incomplete Documents')}
          >
            View Incomplete Dossiers
          </button>
        </div>
      )}

      {/* 3. KPI Summary Grid */}
      <div className="dept-ma-stats-grid" style={{ marginBottom: '1.75rem' }}>
        <div className="dept-ma-stat-card">
          <div className="dept-ma-stat-top">
            <span className="dept-ma-stat-label">Total Scholarship Students</span>
            <div className="dept-ma-stat-icon-wrap blue">🎓</div>
          </div>
          <div className="dept-ma-stat-value">{totalCount}</div>
          <div className="dept-ma-stat-sub">Department of ICT undergraduates</div>
        </div>

        <div className="dept-ma-stat-card">
          <div className="dept-ma-stat-top">
            <span className="dept-ma-stat-label">Mahapola Recipients</span>
            <div className="dept-ma-stat-icon-wrap indigo">🏆</div>
          </div>
          <div className="dept-ma-stat-value" style={{ color: '#4338ca' }}>
            {mahapolaCount}
          </div>
          <div className="dept-ma-stat-sub">Merit & Ordinary awardees</div>
        </div>

        <div className="dept-ma-stat-card">
          <div className="dept-ma-stat-top">
            <span className="dept-ma-stat-label">University Bursary</span>
            <div className="dept-ma-stat-icon-wrap emerald">💼</div>
          </div>
          <div className="dept-ma-stat-value" style={{ color: '#047857' }}>
            {bursaryCount}
          </div>
          <div className="dept-ma-stat-sub">Full & Half bursary installments</div>
        </div>

        <div className="dept-ma-stat-card">
          <div className="dept-ma-stat-top">
            <span className="dept-ma-stat-label">Forwarded to Welfare</span>
            <div className="dept-ma-stat-icon-wrap blue">📨</div>
          </div>
          <div className="dept-ma-stat-value" style={{ color: '#0284c7' }}>
            {forwardedCount}
          </div>
          <div className="dept-ma-stat-sub">Dispatched for monthly payroll</div>
        </div>
      </div>

      {/* 4. Toolbar */}
      <div className="dept-ma-toolbar">
        <div className="dept-ma-toolbar-left">
          <div className="dept-ma-search-input-wrap">
            <span className="dept-ma-search-icon">🔍</span>
            <input
              type="text"
              className="dept-ma-search-input"
              placeholder="Search by student, reg no, NIC, or account number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="dept-ma-filter-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Scholarship Categories' : c}
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
                {st === 'ALL' ? 'All Department Statuses' : st}
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

        <div className="dept-ma-toolbar-right">
          <button
            type="button"
            className="dept-ma-btn-action secondary"
            onClick={handleExportCSV}
          >
            Export Scholarship Roster (CSV)
          </button>
        </div>
      </div>

      {/* 5. Scholarship Roster Table */}
      <div className="dept-ma-table-container">
        <div className="dept-ma-table-wrapper">
          <table className="dept-ma-table">
            <thead>
              <tr>
                <th>Student Details</th>
                <th>Scholarship Category</th>
                <th>Monthly Stipend</th>
                <th>Bank Account Info</th>
                <th>Income Docs (GN/DS)</th>
                <th>80% Attendance Audit</th>
                <th>Department Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length > 0 ? (
                filteredList.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="dept-ma-tracking-pill">{item.student.regNo}</span>
                      <div style={{ fontWeight: '700', color: '#0f172a', marginTop: '0.2rem' }}>
                        {item.student.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        {item.student.batch} • NIC: {item.student.nic}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: '700',
                          fontSize: '0.8rem',
                          color: item.category.includes('Merit') ? '#047857' : '#0369a1',
                        }}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                        Rs. {item.monthlyAmount.toLocaleString()}
                      </strong>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#334155' }}>
                        {item.bankDetails.bankName}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        Acc: {item.bankDetails.accountNumber}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: item.bankDetails.passbookVerified ? '#059669' : '#dc2626', fontWeight: '600' }}>
                        {item.bankDetails.passbookVerified ? '✓ Passbook Verified' : '✕ Unverified Bank Slip'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.78rem' }}>
                        {item.incomeDocuments.gnCertificateSubmitted ? (
                          <span style={{ color: '#059669', fontWeight: '600' }}>✓ GN Income Slip</span>
                        ) : (
                          <span style={{ color: '#dc2626', fontWeight: '600' }}>✕ Missing GN Slip</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.76rem' }}>
                        {item.incomeDocuments.dsEndorsementSubmitted ? (
                          <span style={{ color: '#059669', fontWeight: '600' }}>✓ DS Endorsement</span>
                        ) : (
                          <span style={{ color: '#dc2626', fontWeight: '600' }}>✕ Missing DS Stamp</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <strong
                          style={{
                            fontSize: '0.88rem',
                            color: item.attendanceCheck.currentRate >= 80 ? '#059669' : '#b45309',
                          }}
                        >
                          {item.attendanceCheck.currentRate}%
                        </strong>
                        <span
                          className={`dept-ma-status-badge ${
                            item.attendanceCheck.thresholdSatisfied ? 'confirmed' : 'incomplete'
                          }`}
                          style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}
                        >
                          {item.attendanceCheck.thresholdSatisfied ? 'Qualified' : 'At Risk'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`dept-ma-status-badge ${
                          item.departmentStatus.includes('Forwarded')
                            ? 'active'
                            : item.departmentStatus === 'Under Verification'
                            ? 'pending'
                            : 'rejected'
                        }`}
                      >
                        {item.departmentStatus}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="dept-ma-btn-action primary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.76rem', whiteSpace: 'nowrap' }}
                        onClick={() => handleOpenInspect(item)}
                      >
                        Inspect Dossier
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No scholarship records found matching current filter options.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Inspection & Certification Modal */}
      {selectedRecord && (
        <div className="dept-ma-modal-backdrop" onClick={() => setSelectedRecord(null)}>
          <div
            className="dept-ma-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '820px' }}
          >
            {/* Header */}
            <div className="dept-ma-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="dept-ma-tracking-pill">{selectedRecord.student.regNo}</span>
                  <span className="dept-ma-badge-pill">{selectedRecord.category}</span>
                </div>
                <h3 className="dept-ma-modal-title">
                  Scholarship Dossier: {selectedRecord.student.name}
                </h3>
                <p className="dept-ma-modal-subtitle">
                  {deptInfo.departmentName} • Academic Year {selectedRecord.student.academicYear} • Batch {selectedRecord.student.batch}
                </p>
              </div>

              <button
                type="button"
                className="dept-ma-modal-close"
                onClick={() => setSelectedRecord(null)}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="dept-ma-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Entitlement & Bank Card */}
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
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>SCHOLARSHIP CATEGORY</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                    {selectedRecord.category}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>MONTHLY STIPEND</span>
                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#059669' }}>
                    Rs. {selectedRecord.monthlyAmount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>DISBURSEMENT BANK</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0f172a' }}>
                    {selectedRecord.bankDetails.bankName}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Branch: {selectedRecord.bankDetails.branch}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>ACCOUNT NUMBER</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0284c7' }}>
                    {selectedRecord.bankDetails.accountNumber}
                  </div>
                </div>
              </div>

              {/* Attendance Qualification Strip */}
              <div
                style={{
                  background: selectedRecord.attendanceCheck.thresholdSatisfied ? '#f0fdf4' : '#fffbeb',
                  border: `1px solid ${selectedRecord.attendanceCheck.thresholdSatisfied ? '#bbf7d0' : '#fde68a'}`,
                  borderRadius: '10px',
                  padding: '0.85rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: '700', color: selectedRecord.attendanceCheck.thresholdSatisfied ? '#166534' : '#92400e' }}>
                    80% Attendance Requirement for Installment Release
                  </div>
                  <div style={{ fontSize: '0.78rem', color: selectedRecord.attendanceCheck.thresholdSatisfied ? '#15803d' : '#b45309' }}>
                    Current effective attendance: <strong>{selectedRecord.attendanceCheck.currentRate}%</strong>.
                    {selectedRecord.attendanceCheck.thresholdSatisfied
                      ? ' Meets statutory minimum attendance regulation.'
                      : ' Warning: Attendance under 80% requires medical excuse reconciliation before stipend payment.'}
                  </div>
                </div>

                <span
                  className={`dept-ma-status-badge ${
                    selectedRecord.attendanceCheck.thresholdSatisfied ? 'confirmed' : 'incomplete'
                  }`}
                >
                  {selectedRecord.attendanceCheck.thresholdSatisfied ? '✓ 80% Qualified' : '⚠️ Under 80% Threshold'}
                </span>
              </div>

              {/* Attached Supporting Documents */}
              <div>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '0.4rem' }}>
                  ATTACHED SCHOLARSHIP DOCUMENTATION ({selectedRecord.documents?.length || 0})
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedRecord.documents?.map((doc, idx) => (
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
                        <span>📎</span>
                        <span style={{ fontSize: '0.84rem', fontWeight: '600', color: '#0f172a' }}>{doc.name}</span>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>({doc.size} • {doc.type})</span>
                      </div>
                      <button
                        type="button"
                        className="dept-ma-btn-action secondary"
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.74rem' }}
                        onClick={() => handleDownloadDoc(doc.name)}
                      >
                        Download Document
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* MA Verification & Forwarding Form */}
              <form onSubmit={handleCertifyAndForward} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '10px',
                    padding: '1rem',
                  }}
                >
                  <strong style={{ display: 'block', fontSize: '0.86rem', color: '#1e40af', marginBottom: '0.75rem' }}>
                    Department MA Scholarship Verification Checklist
                  </strong>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: '#1e3a8a', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={gnVerified}
                        onChange={(e) => setGnVerified(e.target.checked)}
                      />
                      Grama Niladhari Income Certificate verified (Serial: {selectedRecord.incomeDocuments?.gnSerialNo || 'Verified'})
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: '#1e3a8a', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={dsVerified}
                        onChange={(e) => setDsVerified(e.target.checked)}
                      />
                      Divisional Secretariat official endorsement seal & signature checked
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: '#1e3a8a', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={bankVerified}
                        onChange={(e) => setBankVerified(e.target.checked)}
                      />
                      Bank passbook copy matches student name, account number, and branch
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: '#1e3a8a', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={attendanceVerified}
                        onChange={(e) => setAttendanceVerified(e.target.checked)}
                      />
                      Coursework attendance audited: certified compliant with minimum 80% rule
                    </label>
                  </div>

                  <div style={{ marginTop: '0.85rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#1e40af', marginBottom: '0.3rem' }}>
                      DEPARTMENT MA VERIFICATION NOTES
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
                      placeholder="Add verification notes or missing document reminders..."
                      value={maRemarks}
                      onChange={(e) => setMaRemarks(e.target.value)}
                    />
                  </div>
                </div>

                {/* Routing Notice */}
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  📍 <strong>Destination:</strong> Certified scholarship dossiers are forwarded to the{' '}
                  <strong>Senior Assistant Registrar (Student Welfare Branch)</strong> and the{' '}
                  <strong>Bursar Office</strong> for payroll disbursement.
                </div>

                {/* Modal Footer */}
                <div className="dept-ma-modal-footer">
                  <button
                    type="button"
                    className="dept-ma-btn-action secondary"
                    onClick={() => setSelectedRecord(null)}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="dept-ma-btn-action primary"
                  >
                    Certify Completeness & Forward to Student Welfare
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
