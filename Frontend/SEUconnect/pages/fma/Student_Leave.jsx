import React, { useState, useMemo } from 'react';

const INITIAL_LEAVE = [
  {
    id: 'LV-2026-001',
    regNo: '22ICT078',
    name: 'A.N. Perera',
    programme: 'BICT (Hons)',
    semester: 'Semester 05',
    category: 'Short Duration Leave',
    clause: 'Handbook §7.4.2 (Short Duration ≤ 15 Days)',
    durationDays: 8,
    startDate: '2026-10-22',
    endDate: '2026-10-30',
    reason: 'University Sports Representation (Inter-University Games)',
    medicalDocSubmitted: false,
    within48Hours: true,
    continuousWeeksAway: 1.5,
    status: 'Approved by Dean',
    notes: 'Approved under sports representation quota. Maximum 15 working days permitted.'
  },
  {
    id: 'LV-2026-002',
    regNo: '22BST042',
    name: 'M.S. Mohamed',
    programme: 'BBST (Hons)',
    semester: 'Semester 05',
    category: 'Short Duration Leave',
    clause: 'Handbook §7.4.2 & §4.2.4 (Medical Grounds)',
    durationDays: 10,
    startDate: '2026-10-25',
    endDate: '2026-11-04',
    reason: 'Dengue Fever / Hospitalization at Base Hospital Kalmunai',
    medicalDocSubmitted: true,
    within48Hours: true,
    continuousWeeksAway: 2,
    status: 'Medical Verified',
    notes: 'Informed within 48 hours. Medical certificate from Government Base Hospital endorsed by UMO.'
  },
  {
    id: 'LV-2026-003',
    regNo: '21ICT022',
    name: 'K.D. Bandara',
    programme: 'BICT (Hons)',
    semester: 'Semester 05',
    category: 'Long Duration Leave',
    clause: 'Handbook §7.4.1 (Long Duration up to 1 Year)',
    durationDays: 90,
    startDate: '2026-10-01',
    endDate: '2027-01-15',
    reason: 'Surgical recovery and prolonged orthopedic rehabilitation',
    medicalDocSubmitted: true,
    within48Hours: true,
    continuousWeeksAway: 6,
    status: 'Recommended to Senate',
    notes: 'Full semester leave application submitted. Section 7.4.4: Medical leave adds-on to maximum degree period.'
  },
  {
    id: 'LV-2026-004',
    regNo: '22ICT099',
    name: 'S. Tharshan',
    programme: 'BICT (Hons)',
    semester: 'Semester 05',
    category: 'Absence Alert',
    clause: 'Handbook §4.2.4 (8-Week Continuous Absence Rule)',
    durationDays: 52,
    startDate: '2026-09-08',
    endDate: '2026-11-01',
    reason: 'Unnotified absence without medical notification',
    medicalDocSubmitted: false,
    within48Hours: false,
    continuousWeeksAway: 7.5,
    status: 'Deemed Withdrawal Warning',
    notes: 'Approaching 8 continuous academic weeks of absence. Section 4.2.4: Student will be deemed withdrawn from academic year.'
  },
  {
    id: 'LV-2026-005',
    regNo: '23BST088',
    name: 'N.V. Ratnayake',
    programme: 'BBST (Hons)',
    semester: 'Semester 03',
    category: 'Short Duration Leave',
    clause: 'Handbook §7.4.2 (Bereavement of Close Relative)',
    durationDays: 5,
    startDate: '2026-10-29',
    endDate: '2026-11-03',
    reason: 'Demise of close relative (parent)',
    medicalDocSubmitted: false,
    within48Hours: true,
    continuousWeeksAway: 1,
    status: 'Approved by Dean',
    notes: 'Compelling compassionate grounds per Handbook §7.4.2.'
  }
];

export default function Student_Leave() {
  const [data, setData] = useState(INITIAL_LEAVE);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [selectedLeave, setSelectedLeave] = useState(null);

  const stats = useMemo(() => {
    return {
      total: data.length,
      shortLeave: data.filter((d) => d.category === 'Short Duration Leave').length,
      longLeave: data.filter((d) => d.category === 'Long Duration Leave').length,
      warningCount: data.filter((d) => d.status.includes('Warning') || d.continuousWeeksAway >= 6).length
    };
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      if (catFilter !== 'All') {
        if (catFilter === 'Short' && item.category !== 'Short Duration Leave') return false;
        if (catFilter === 'Long' && item.category !== 'Long Duration Leave') return false;
        if (catFilter === 'Warning' && !item.status.includes('Warning')) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const m =
          item.name.toLowerCase().includes(q) ||
          item.regNo.toLowerCase().includes(q) ||
          item.reason.toLowerCase().includes(q);
        if (!m) return false;
      }
      return true;
    });
  }, [data, search, catFilter]);

  const handleUpdateStatus = (id, newStatus) => {
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    if (selectedLeave?.id === id) {
      setSelectedLeave((prev) => ({ ...prev, status: newStatus }));
    }
  };

  return (
    <div className="fma-page">
      {/* 1. Stat Cards Grid */}
      <section className="fma-stats-grid">
        <button
          type="button"
          className={`fma-stat-card ${catFilter === 'All' ? 'is-active' : ''}`}
          onClick={() => setCatFilter('All')}
        >
          <div className="fma-stat-head">
            <div className="fma-stat-icon fma-icon-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <polyline points="17 11 19 13 23 9" />
              </svg>
            </div>
            <span className="fma-stat-pill fma-pill-blue">Total</span>
          </div>
          <div className="fma-stat-body">
            <span className="fma-stat-label">Total Leave Notices</span>
            <span className="fma-stat-val">{stats.total}</span>
            <span className="fma-stat-sub">Semester 05 records</span>
          </div>
        </button>

        <button
          type="button"
          className={`fma-stat-card ${catFilter === 'Short' ? 'is-active' : ''}`}
          onClick={() => setCatFilter(catFilter === 'Short' ? 'All' : 'Short')}
        >
          <div className="fma-stat-head">
            <div className="fma-stat-icon fma-icon-green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <span className="fma-stat-pill fma-pill-green">≤ 15 Days</span>
          </div>
          <div className="fma-stat-body">
            <span className="fma-stat-label">Short Duration Leave</span>
            <span className="fma-stat-val">{stats.shortLeave}</span>
            <span className="fma-stat-sub">Handbook §7.4.2</span>
          </div>
        </button>

        <button
          type="button"
          className={`fma-stat-card ${catFilter === 'Long' ? 'is-active' : ''}`}
          onClick={() => setCatFilter(catFilter === 'Long' ? 'All' : 'Long')}
        >
          <div className="fma-stat-head">
            <div className="fma-stat-icon fma-icon-purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
            </div>
            <span className="fma-stat-pill fma-pill-purple">Senate Tier</span>
          </div>
          <div className="fma-stat-body">
            <span className="fma-stat-label">Long Duration (1 Year)</span>
            <span className="fma-stat-val">{stats.longLeave}</span>
            <span className="fma-stat-sub">Handbook §7.4.1</span>
          </div>
        </button>

        <button
          type="button"
          className={`fma-stat-card ${catFilter === 'Warning' ? 'is-active' : ''}`}
          onClick={() => setCatFilter(catFilter === 'Warning' ? 'All' : 'Warning')}
        >
          <div className="fma-stat-head">
            <div className="fma-stat-icon fma-icon-red">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <span className="fma-stat-pill fma-pill-red">8-Week Alert</span>
          </div>
          <div className="fma-stat-body">
            <span className="fma-stat-label">Absence Threshold</span>
            <span className="fma-stat-val">{stats.warningCount}</span>
            <span className="fma-stat-sub">Handbook §4.2.4 withdrawal rule</span>
          </div>
        </button>
      </section>

      {/* 2. Main Panel */}
      <div className="fma-panel">
        <div className="fma-panel-head">
          <div>
            <h3 className="fma-panel-title">Academic Leave &amp; Medical Notification Registry</h3>
            <p className="fma-panel-sub">
              Handbook Section 7.4 &amp; 4.2.4: 48-hour sickness reporting, 2-week medical document confirmation, and 8-week continuous absence tracking.
            </p>
          </div>
          <div className="fma-header-actions">
            <button
              type="button"
              className="fma-btn fma-btn-outline"
              onClick={() => window.print()}
            >
              Export Leave Ledger
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="fma-filter-toolbar">
          <div className="fma-search-wrap">
            <svg className="fma-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search candidate name, reg no, or leave reason..."
              className="fma-input fma-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="fma-filter-group">
            <select
              className="fma-select"
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
            >
              <option value="All">All Leave Categories</option>
              <option value="Short">Short Duration (≤ 15 Days)</option>
              <option value="Long">Long Duration (Senate Tier)</option>
              <option value="Warning">8-Week Absence Alerts</option>
            </select>

            {(search || catFilter !== 'All') && (
              <button
                type="button"
                className="fma-btn-clear"
                onClick={() => {
                  setSearch('');
                  setCatFilter('All');
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
                <th>Category &amp; Clause</th>
                <th>Duration &amp; Dates</th>
                <th>48h Notification</th>
                <th>Medical / Supporting Doc</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--fma-muted)' }}>
                    No leave applications match the filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="fma-student-meta">
                        <div className="fma-avatar fma-avatar-amber">
                          {item.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="fma-name">{item.name}</div>
                          <div className="fma-regno">{item.regNo}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.category}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--fma-muted)' }}>{item.clause}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.durationDays} Days</div>
                      <div style={{ fontSize: '11px', color: 'var(--fma-muted)' }}>
                        {item.startDate} to {item.endDate}
                      </div>
                      {item.continuousWeeksAway >= 6 && (
                        <span className="fma-badge badge-red" style={{ marginTop: '2px' }}>
                          {item.continuousWeeksAway} wks away
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`fma-badge ${item.within48Hours ? 'badge-green' : 'badge-red'}`}>
                        {item.within48Hours ? 'Within 48 Hours' : 'Delayed Notice'}
                      </span>
                    </td>
                    <td>
                      <span className={`fma-badge ${item.medicalDocSubmitted ? 'badge-green' : 'badge-slate'}`}>
                        {item.medicalDocSubmitted ? 'Confirmed (UMO/Govt)' : 'Not Required / Pending'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`fma-badge ${
                          item.status.includes('Approved') || item.status.includes('Verified')
                            ? 'badge-green'
                            : item.status.includes('Warning')
                            ? 'badge-red'
                            : 'badge-blue'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="fma-action-btn"
                        onClick={() => setSelectedLeave(item)}
                      >
                        Review Leave
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedLeave && (
        <div className="fma-modal-overlay" onClick={() => setSelectedLeave(null)}>
          <div className="fma-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="fma-modal-header">
              <div>
                <span className="fma-modal-tag">Handbook Section 7.4 &amp; 4.2.4</span>
                <h3 className="fma-modal-title">{selectedLeave.name} — {selectedLeave.regNo}</h3>
                <div className="fma-modal-subtitle">{selectedLeave.category} ({selectedLeave.durationDays} days)</div>
              </div>
              <button
                type="button"
                className="fma-close-btn"
                onClick={() => setSelectedLeave(null)}
              >
                &times;
              </button>
            </div>

            <div className="fma-modal-body">
              <div className="fma-info-banner">
                <div className="fma-info-item">
                  <span className="fma-info-lbl">Reason</span>
                  <span className="fma-info-val">{selectedLeave.reason}</span>
                </div>
                <div className="fma-info-item">
                  <span className="fma-info-lbl">Continuous Weeks Away</span>
                  <span className="fma-info-val" style={{ color: selectedLeave.continuousWeeksAway >= 7 ? '#dc2626' : 'inherit' }}>
                    {selectedLeave.continuousWeeksAway} Weeks (Limit: 8 Weeks)
                  </span>
                </div>
                <div className="fma-info-item">
                  <span className="fma-info-lbl">48h Notification Window</span>
                  <span className="fma-info-val">{selectedLeave.within48Hours ? 'Satisfied (§4.2.4)' : 'Violated'}</span>
                </div>
                <div className="fma-info-item">
                  <span className="fma-info-lbl">Status</span>
                  <span className="fma-info-val">{selectedLeave.status}</span>
                </div>
              </div>

              <div className={`fma-advisory-box ${selectedLeave.continuousWeeksAway >= 7 ? 'fma-advisory-warning' : ''}`}>
                <strong>Handbook Section 4.2.4 Clause:</strong> "If a student is unable to attend continuously for 08 academic weeks, the student is deemed to be withdrawn from the particular academic year and need to commence his/her studies from the next academic year."
              </div>

              <div>
                <span style={{ fontSize: '12px', color: 'var(--fma-muted)' }}>Staff Log: {selectedLeave.notes}</span>
              </div>
            </div>

            <div className="fma-modal-footer">
              <button
                type="button"
                className="fma-btn fma-btn-outline"
                onClick={() => setSelectedLeave(null)}
              >
                Close
              </button>
              {selectedLeave.status !== 'Approved by Dean' && (
                <button
                  type="button"
                  className="fma-btn fma-btn-primary"
                  onClick={() => handleUpdateStatus(selectedLeave.id, 'Approved by Dean')}
                >
                  Approve Leave Docket
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

