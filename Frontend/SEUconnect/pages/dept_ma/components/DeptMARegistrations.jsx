import React, { useState, useMemo } from 'react';

export default function DeptMARegistrations({
  registrations,
  subjects,
  deptInfo,
  onUpdateRegistration,
  onShowToast,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterBatch, setFilterBatch] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Filter options
  const subjectCodes = useMemo(() => ['ALL', ...subjects.map((s) => s.subjectCode)], [subjects]);
  const batches = useMemo(() => ['ALL', ...deptInfo.activeBatches], [deptInfo]);
  const statuses = ['ALL', 'Confirmed', 'Pending Verification', 'Incomplete Documents', 'Duplicate Registration'];

  // Filtered dataset
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

  // Counts of issues
  const duplicateCount = registrations.filter((r) => r.status === 'Duplicate Registration').length;
  const incompleteCount = registrations.filter((r) => r.status === 'Incomplete Documents').length;
  const pendingCount = registrations.filter((r) => r.status === 'Pending Verification').length;

  // Actions
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

  return (
    <div className="dept-ma-registrations-section">
      {/* 1. Alerts Banner for Incomplete & Duplicate Registrations */}
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

      {/* 2. Filter Toolbar */}
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
            📥 Export Roster (CSV)
          </button>
        </div>
      </div>

      {/* 3. Registrations Table */}
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
                          ✓ Verify Slip
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
  );
}

