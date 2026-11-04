import React, { useState, useMemo } from 'react';

const INITIAL_REGISTRATIONS = [
  {
    id: 'REG-2026-001',
    regNo: '22ICT085',
    name: 'M.N.M. Afnan',
    programme: 'BICT (Hons)',
    specialization: 'Software Technologies',
    semester: 'Semester 05',
    credits: 17,
    status: 'Pending Verification',
    hodSignature: 'Signed',
    advisorEndorsed: true,
    isAddDrop: false,
    courses: ['SWT31012', 'CIS31012', 'UCT31012', 'SWT31022', 'CMS31022', 'UCT31021', 'NST31022', 'NST31051'],
    submittedDate: '2026-10-28',
    notes: 'Duly filled registration form submitted within 2 weeks of semester commencement.'
  },
  {
    id: 'REG-2026-002',
    regNo: '22ICT041',
    name: 'K.P. Silva',
    programme: 'BICT (Hons)',
    specialization: 'Software Technologies',
    semester: 'Semester 05',
    credits: 16,
    status: 'Verified & Cleared',
    hodSignature: 'Signed',
    advisorEndorsed: true,
    isAddDrop: false,
    courses: ['SWT31012', 'CIS31012', 'UCT31012', 'SWT31022', 'CMS31022', 'UCT31021'],
    submittedDate: '2026-10-25',
    notes: 'All course unit prerequisites satisfied. Maximum load under 22 credits.'
  },
  {
    id: 'REG-2026-003',
    regNo: '22BST019',
    name: 'S.T. Jayawardena',
    programme: 'BBST (Hons)',
    specialization: 'Food Science & Tech (FST)',
    semester: 'Semester 05',
    credits: 20,
    status: 'Add/Drop Pending',
    hodSignature: 'Signed',
    advisorEndorsed: true,
    isAddDrop: true,
    courses: ['FST31012', 'FST31022', 'CST31012', 'BSE31012', 'AEE31012', 'AEE31022'],
    submittedDate: '2026-11-01',
    notes: 'Requested Drop for BSE31042 and Add FST31022 within the 2-week Add/Drop window (Handbook §7.2).'
  },
  {
    id: 'REG-2026-004',
    regNo: '21ICT019',
    name: 'M.F. Rasheed',
    programme: 'BICT (Hons)',
    specialization: 'Software Technologies',
    semester: 'Semester 05',
    credits: 19,
    status: 'Repeat Entry Pending',
    hodSignature: 'Pending HOD',
    advisorEndorsed: false,
    isAddDrop: false,
    courses: ['SWT31012', 'CIS31012', 'SWT21012 (Repeat-ESA)', 'CIS11022 (Repeat-CA)'],
    submittedDate: '2026-10-30',
    notes: 'Repeating ESA for SWT21012 and CA for CIS11022. Renewal fee receipt attached.'
  },
  {
    id: 'REG-2026-005',
    regNo: '22ICT078',
    name: 'A.N. Perera',
    programme: 'BICT (Hons)',
    specialization: 'Network & Security',
    semester: 'Semester 05',
    credits: 18,
    status: 'Verified & Cleared',
    hodSignature: 'Signed',
    advisorEndorsed: true,
    isAddDrop: false,
    courses: ['NST31011', 'NST31022', 'NST31032', 'CMS31022', 'CIS31012', 'NST31042', 'NST31051', 'NST31062'],
    submittedDate: '2026-10-24',
    notes: 'Cleared for semester attendance registry.'
  },
  {
    id: 'REG-2026-006',
    regNo: '22BST064',
    name: 'F. Nilufar',
    programme: 'BBST (Hons)',
    specialization: 'Biosystems Engineering (BSE)',
    semester: 'Semester 05',
    credits: 24,
    status: 'Credit Overload Held',
    hodSignature: 'Signed',
    advisorEndorsed: false,
    isAddDrop: false,
    courses: ['BSE31012', 'BSE31022', 'BSE31032', 'BSE31042', 'AAT31012', 'AEE31012', 'CCT31012', 'CST31012'],
    submittedDate: '2026-11-02',
    notes: '24 credits exceeds handbook maximum limit of 22 credits (§7.3). Requires Academic Advisor special consent.'
  }
];

export default function Subject_Registration() {
  const [data, setData] = useState(INITIAL_REGISTRATIONS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [progFilter, setProgFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);

  const stats = useMemo(() => {
    return {
      total: data.length,
      pending: data.filter((d) => d.status.includes('Pending')).length,
      addDrop: data.filter((d) => d.isAddDrop).length,
      cleared: data.filter((d) => d.status === 'Verified & Cleared').length
    };
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      if (statusFilter !== 'All') {
        if (statusFilter === 'Pending' && !item.status.includes('Pending')) return false;
        if (statusFilter === 'Cleared' && item.status !== 'Verified & Cleared') return false;
        if (statusFilter === 'AddDrop' && !item.isAddDrop) return false;
        if (statusFilter === 'Held' && !item.status.includes('Held')) return false;
      }
      if (progFilter !== 'All' && !item.programme.includes(progFilter)) return false;

      if (search) {
        const q = search.toLowerCase();
        const m =
          item.name.toLowerCase().includes(q) ||
          item.regNo.toLowerCase().includes(q) ||
          item.specialization.toLowerCase().includes(q) ||
          item.courses.some((c) => c.toLowerCase().includes(q));
        if (!m) return false;
      }
      return true;
    });
  }, [data, search, statusFilter, progFilter]);

  const handleVerify = (id, newStatus) => {
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    if (selectedItem?.id === id) {
      setSelectedItem((prev) => ({ ...prev, status: newStatus }));
    }
  };

  return (
    <div className="fma-page">
      {/* 1. Clickable Stat Cards */}
      <section className="fma-stats-grid">
        <button
          type="button"
          className={`fma-stat-card ${statusFilter === 'All' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('All')}
        >
          <div className="fma-stat-head">
            <div className="fma-stat-icon fma-icon-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <span className="fma-stat-pill fma-pill-blue">Total</span>
          </div>
          <div className="fma-stat-body">
            <span className="fma-stat-label">Total Submissions</span>
            <span className="fma-stat-val">{stats.total}</span>
            <span className="fma-stat-sub">Semester 05 course intake</span>
          </div>
        </button>

        <button
          type="button"
          className={`fma-stat-card ${statusFilter === 'Pending' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'Pending' ? 'All' : 'Pending')}
        >
          <div className="fma-stat-head">
            <div className="fma-stat-icon fma-icon-amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <span className="fma-stat-pill fma-pill-amber">Pending Audit</span>
          </div>
          <div className="fma-stat-body">
            <span className="fma-stat-label">Awaiting Verification</span>
            <span className="fma-stat-val">{stats.pending}</span>
            <span className="fma-stat-sub">Course registration checks</span>
          </div>
        </button>

        <button
          type="button"
          className={`fma-stat-card ${statusFilter === 'AddDrop' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'AddDrop' ? 'All' : 'AddDrop')}
        >
          <div className="fma-stat-head">
            <div className="fma-stat-icon fma-icon-purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </div>
            <span className="fma-stat-pill fma-pill-purple">Add / Drop</span>
          </div>
          <div className="fma-stat-body">
            <span className="fma-stat-label">Course Amendments</span>
            <span className="fma-stat-val">{stats.addDrop}</span>
            <span className="fma-stat-sub">2-week amendment window</span>
          </div>
        </button>

        <button
          type="button"
          className={`fma-stat-card ${statusFilter === 'Cleared' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'Cleared' ? 'All' : 'Cleared')}
        >
          <div className="fma-stat-head">
            <div className="fma-stat-icon fma-icon-green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <span className="fma-stat-pill fma-pill-green">Cleared</span>
          </div>
          <div className="fma-stat-body">
            <span className="fma-stat-label">Dean Endorsed</span>
            <span className="fma-stat-val">{stats.cleared}</span>
            <span className="fma-stat-sub">Eligible for attendance &amp; ESA</span>
          </div>
        </button>
      </section>

      {/* 2. Main Panel */}
      <div className="fma-panel">
        <div className="fma-panel-head">
          <div>
            <h3 className="fma-panel-title">Semester Subject Registration &amp; Add/Drop Registry</h3>
            <p className="fma-panel-sub">
              Verify course units within 2 weeks of semester commencement and ensure credit limit compliance.
            </p>
          </div>
          <div className="fma-header-actions">
            <button
              type="button"
              className="fma-btn fma-btn-outline"
              onClick={() => window.print()}
            >
              Export Course Intake List
            </button>
          </div>
        </div>

        {/* Active Filter Pill */}
        {statusFilter !== 'All' && (
          <div className="fma-active-filter">
            <span>Filtering by status: <strong>{statusFilter}</strong> ({filtered.length} candidates)</span>
            <button type="button" className="fma-btn-clear" onClick={() => setStatusFilter('All')}>
              Show all
            </button>
          </div>
        )}

        {/* Filter Toolbar (Examination_Offences style) */}
        <div className="fma-filter-toolbar">
          <div className="fma-search-wrap">
            <svg className="fma-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search candidate name, reg no, course code..."
              className="fma-input fma-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="fma-filter-group">
            <select
              className="fma-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Form Statuses</option>
              <option value="Pending">Pending Audit</option>
              <option value="Cleared">Verified &amp; Cleared</option>
              <option value="AddDrop">Add / Drop Requests</option>
              <option value="Held">Credit Overload / Held</option>
            </select>

            <select
              className="fma-select"
              value={progFilter}
              onChange={(e) => setProgFilter(e.target.value)}
            >
              <option value="All">All Degree Programs</option>
              <option value="BICT">BICT (Hons)</option>
              <option value="BBST">BBST (Hons)</option>
            </select>

            {(search || statusFilter !== 'All' || progFilter !== 'All') && (
              <button
                type="button"
                className="fma-btn-clear"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('All');
                  setProgFilter('All');
                }}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="fma-table-container">
          <table className="fma-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Degree &amp; Specialization</th>
                <th>Credits Load</th>
                <th>Course Units</th>
                <th>HOD Endorsement</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--fma-muted)' }}>
                    No subject registrations match the filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="fma-student-meta">
                        <div className="fma-avatar">
                          {item.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="fma-name">{item.name}</div>
                          <div className="fma-regno">{item.regNo}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.programme}</div>
                      <div style={{ fontSize: '12px', color: 'var(--fma-muted)' }}>{item.specialization}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: item.credits > 22 ? '#dc2626' : 'var(--fma-text)' }}>
                        {item.credits} Credits
                      </span>
                      {item.credits > 22 && (
                        <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>Over limit (&gt;22)</div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.courses.join(', ')}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--fma-muted)' }}>{item.courses.length} subjects registered</div>
                    </td>
                    <td>
                      <span className={`fma-badge ${item.hodSignature === 'Signed' ? 'badge-green' : 'badge-amber'}`}>
                        {item.hodSignature}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`fma-badge ${
                          item.status === 'Verified & Cleared'
                            ? 'badge-green'
                            : item.status.includes('Add/Drop')
                            ? 'badge-purple'
                            : item.status.includes('Held')
                            ? 'badge-red'
                            : 'badge-amber'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="fma-action-btn"
                        onClick={() => setSelectedItem(item)}
                      >
                        Audit Form
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit & Verification Modal */}
      {selectedItem && (
        <div className="fma-modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="fma-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="fma-modal-header">
              <div>
                <span className="fma-modal-tag">Handbook Section 7.2 Audit</span>
                <h3 className="fma-modal-title">{selectedItem.name} — {selectedItem.regNo}</h3>
                <div className="fma-modal-subtitle">
                  {selectedItem.programme} • {selectedItem.specialization} ({selectedItem.semester})
                </div>
              </div>
              <button
                type="button"
                className="fma-close-btn"
                onClick={() => setSelectedItem(null)}
              >
                &times;
              </button>
            </div>

            <div className="fma-modal-body">
              <div className="fma-info-banner">
                <div className="fma-info-item">
                  <span className="fma-info-lbl">Total Credit Load</span>
                  <span className="fma-info-val" style={{ color: selectedItem.credits > 22 ? '#dc2626' : '#1d4ed8' }}>
                    {selectedItem.credits} Credits (Max allowed: 22)
                  </span>
                </div>
                <div className="fma-info-item">
                  <span className="fma-info-lbl">Submission Date</span>
                  <span className="fma-info-val">{selectedItem.submittedDate}</span>
                </div>
                <div className="fma-info-item">
                  <span className="fma-info-lbl">HOD Endorsement</span>
                  <span className="fma-info-val">{selectedItem.hodSignature}</span>
                </div>
                <div className="fma-info-item">
                  <span className="fma-info-lbl">Current Status</span>
                  <span className="fma-info-val">{selectedItem.status}</span>
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700 }}>Registered Course Units</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedItem.courses.map((c) => (
                    <span key={c} className="fma-badge badge-blue">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className={`fma-advisory-box ${selectedItem.credits > 22 ? 'fma-advisory-warning' : ''}`}>
                <strong>Administrative Rule Check:</strong> {selectedItem.notes}
              </div>
            </div>

            <div className="fma-modal-footer">
              <button
                type="button"
                className="fma-btn fma-btn-outline"
                onClick={() => setSelectedItem(null)}
              >
                Close
              </button>
              {selectedItem.status !== 'Verified & Cleared' && (
                <button
                  type="button"
                  className="fma-btn fma-btn-primary"
                  onClick={() => handleVerify(selectedItem.id, 'Verified & Cleared')}
                >
                  ✓ Endorse &amp; Clear (Dean Office)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

