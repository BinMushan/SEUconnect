import React, { useState, useMemo } from 'react';

const INITIAL_APPLICANTS = [
  {
    id: 'STR-2026-001',
    regNo: '22ICT085',
    name: 'M.N.M. Afnan',
    programme: 'BICT (Hons)',
    cgpaSem13: 3.65,
    firstChoice: 'Software Technologies (SWT)',
    secondChoice: 'Network & Security (NST)',
    allocatedDivision: 'Software Technologies (SWT)',
    eligibility: 'Eligible (CGPA ≥ 2.00)',
    transferRequested: false,
    facultyBoardApproval: 'Approved',
    notes: 'Exceeds minimum CGPA 2.0 requirement. Ranked top 10% in Common Program programming modules.'
  },
  {
    id: 'STR-2026-002',
    regNo: '22ICT078',
    name: 'A.N. Perera',
    programme: 'BICT (Hons)',
    cgpaSem13: 3.42,
    firstChoice: 'Network & Security (NST)',
    secondChoice: 'Software Technologies (SWT)',
    allocatedDivision: 'Network & Security (NST)',
    eligibility: 'Eligible (CGPA ≥ 2.00)',
    transferRequested: false,
    facultyBoardApproval: 'Approved',
    notes: 'Meets prerequisite. Allocated 1st preference.'
  },
  {
    id: 'STR-2026-003',
    regNo: '22BST019',
    name: 'S.T. Jayawardena',
    programme: 'BBST (Hons)',
    cgpaSem13: 3.55,
    firstChoice: 'Food Science & Tech (FST)',
    secondChoice: 'Crop Science & Tech (CST)',
    allocatedDivision: 'Food Science & Tech (FST)',
    eligibility: 'Eligible (CGPA ≥ 2.00)',
    transferRequested: false,
    facultyBoardApproval: 'Approved',
    notes: 'FST division quota met with 18 confirmed applicants.'
  },
  {
    id: 'STR-2026-004',
    regNo: '22BST042',
    name: 'M.S. Mohamed',
    programme: 'BBST (Hons)',
    cgpaSem13: 2.85,
    firstChoice: 'Biosystems Engineering (BSE)',
    secondChoice: 'Agricultural Economics (AEE)',
    allocatedDivision: 'Biosystems Engineering (BSE)',
    eligibility: 'Eligible (CGPA ≥ 2.00)',
    transferRequested: true,
    transferTo: 'Agricultural Economics (AEE)',
    transferStatus: 'Pending Faculty Board (Within 2 Wks)',
    facultyBoardApproval: 'Awaiting Board',
    notes: 'Handbook §3.8.6: Transfer requested within 2 weeks of Semester 5 commencement due to vacancy in AEE.'
  },
  {
    id: 'STR-2026-005',
    regNo: '22ICT099',
    name: 'K.L. Senarath',
    programme: 'BICT (Hons)',
    cgpaSem13: 1.82,
    firstChoice: 'Software Technologies (SWT)',
    secondChoice: 'Network & Security (NST)',
    allocatedDivision: 'On Academic Hold',
    eligibility: 'Ineligible (CGPA < 2.00)',
    transferRequested: false,
    facultyBoardApproval: 'Registration Deferred',
    notes: 'Handbook §3.9.5.2: Student has not earned cumulative GPA of first 3 semesters of 2.0 or above; not permitted to register for 5th semester until improved.'
  }
];

export default function Specialization_Streaming() {
  const [data, setData] = useState(INITIAL_APPLICANTS);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const stats = useMemo(() => {
    return {
      total: data.length,
      eligible: data.filter((d) => d.cgpaSem13 >= 2.0).length,
      ineligible: data.filter((d) => d.cgpaSem13 < 2.0).length,
      transfers: data.filter((d) => d.transferRequested).length
    };
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      if (filterType !== 'All') {
        if (filterType === 'Eligible' && item.cgpaSem13 < 2.0) return false;
        if (filterType === 'Ineligible' && item.cgpaSem13 >= 2.0) return false;
        if (filterType === 'Transfer' && !item.transferRequested) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const m =
          item.name.toLowerCase().includes(q) ||
          item.regNo.toLowerCase().includes(q) ||
          item.allocatedDivision.toLowerCase().includes(q);
        if (!m) return false;
      }
      return true;
    });
  }, [data, search, filterType]);

  const handleApproveTransfer = (id) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              allocatedDivision: item.transferTo || item.allocatedDivision,
              transferStatus: 'Approved by Faculty Board',
              facultyBoardApproval: 'Approved'
            }
          : item
      )
    );
    if (selectedApplicant?.id === id) {
      setSelectedApplicant((prev) => ({
        ...prev,
        allocatedDivision: prev.transferTo || prev.allocatedDivision,
        transferStatus: 'Approved by Faculty Board',
        facultyBoardApproval: 'Approved'
      }));
    }
  };

  return (
    <div className="fma-page">
      {/* 1. Stat Cards Grid */}
      <section className="fma-stats-grid">
        <button
          type="button"
          className={`fma-stat-card ${filterType === 'All' ? 'is-active' : ''}`}
          onClick={() => setFilterType('All')}
        >
          <div className="fma-stat-head">
            <div className="fma-stat-icon fma-icon-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span className="fma-stat-pill fma-pill-blue">Total</span>
          </div>
          <div className="fma-stat-body">
            <span className="fma-stat-label">Streaming Candidates</span>
            <span className="fma-stat-val">{stats.total}</span>
            <span className="fma-stat-sub">Year 3 Semester 1 applicants</span>
          </div>
        </button>

        <button
          type="button"
          className={`fma-stat-card ${filterType === 'Eligible' ? 'is-active' : ''}`}
          onClick={() => setFilterType(filterType === 'Eligible' ? 'All' : 'Eligible')}
        >
          <div className="fma-stat-head">
            <div className="fma-stat-icon fma-icon-green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <span className="fma-stat-pill fma-pill-green">CGPA ≥ 2.0</span>
          </div>
          <div className="fma-stat-body">
            <span className="fma-stat-label">Eligible for Majoring</span>
            <span className="fma-stat-val">{stats.eligible}</span>
            <span className="fma-stat-sub">Handbook §3.8.6 &amp; §3.9.5</span>
          </div>
        </button>

        <button
          type="button"
          className={`fma-stat-card ${filterType === 'Ineligible' ? 'is-active' : ''}`}
          onClick={() => setFilterType(filterType === 'Ineligible' ? 'All' : 'Ineligible')}
        >
          <div className="fma-stat-head">
            <div className="fma-stat-icon fma-icon-red">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            </div>
            <span className="fma-stat-pill fma-pill-red">Below 2.0</span>
          </div>
          <div className="fma-stat-body">
            <span className="fma-stat-label">Ineligible / Deferred</span>
            <span className="fma-stat-val">{stats.ineligible}</span>
            <span className="fma-stat-sub">5th semester registration held</span>
          </div>
        </button>

        <button
          type="button"
          className={`fma-stat-card ${filterType === 'Transfer' ? 'is-active' : ''}`}
          onClick={() => setFilterType(filterType === 'Transfer' ? 'All' : 'Transfer')}
        >
          <div className="fma-stat-head">
            <div className="fma-stat-icon fma-icon-purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" />
                <line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
            </div>
            <span className="fma-stat-pill fma-pill-purple">2-Wk Window</span>
          </div>
          <div className="fma-stat-body">
            <span className="fma-stat-label">Division Transfers</span>
            <span className="fma-stat-val">{stats.transfers}</span>
            <span className="fma-stat-sub">Vacancy transfer requests</span>
          </div>
        </button>
      </section>

      {/* 2. Main Panel */}
      <div className="fma-panel">
        <div className="fma-panel-head">
          <div>
            <h3 className="fma-panel-title">Specialization / Majoring Division Streaming Registry</h3>
            <p className="fma-panel-sub">
              Handbook Section 3.8.6 (BBST) &amp; 3.9.5 (BICT): Verification of minimum CGPA 2.0 for first 3 semesters and division quota allocations.
            </p>
          </div>
          <div className="fma-header-actions">
            <button
              type="button"
              className="fma-btn fma-btn-outline"
              onClick={() => window.print()}
            >
              Export Streaming Ratification List
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
              placeholder="Search candidate name, reg no, or allocated division..."
              className="fma-input fma-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="fma-filter-group">
            <select
              className="fma-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Streaming Statuses</option>
              <option value="Eligible">Eligible (CGPA ≥ 2.0)</option>
              <option value="Ineligible">Ineligible (CGPA &lt; 2.0)</option>
              <option value="Transfer">Transfer Requests</option>
            </select>

            {(search || filterType !== 'All') && (
              <button
                type="button"
                className="fma-btn-clear"
                onClick={() => {
                  setSearch('');
                  setFilterType('All');
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
                <th>Sem 1–3 CGPA</th>
                <th>Preferences</th>
                <th>Allocated Division</th>
                <th>Eligibility</th>
                <th>Faculty Board Approval</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--fma-muted)' }}>
                    No streaming applicants match the filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="fma-student-meta">
                        <div className="fma-avatar fma-avatar-green">
                          {item.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="fma-name">{item.name}</div>
                          <div className="fma-regno">{item.regNo}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: item.cgpaSem13 >= 2.0 ? '#059669' : '#dc2626' }}>
                        {item.cgpaSem13.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>1: {item.firstChoice}</div>
                      <div style={{ fontSize: '11px', color: 'var(--fma-muted)' }}>2: {item.secondChoice}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{item.allocatedDivision}</span>
                      {item.transferRequested && (
                        <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 600 }}>
                          Transfer req: {item.transferTo}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`fma-badge ${item.cgpaSem13 >= 2.0 ? 'badge-green' : 'badge-red'}`}>
                        {item.eligibility}
                      </span>
                    </td>
                    <td>
                      <span className={`fma-badge ${item.facultyBoardApproval === 'Approved' ? 'badge-green' : item.facultyBoardApproval.includes('Deferred') ? 'badge-red' : 'badge-amber'}`}>
                        {item.facultyBoardApproval}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="fma-action-btn"
                        onClick={() => setSelectedApplicant(item)}
                      >
                        Inspect Dossier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Streaming Detail Modal */}
      {selectedApplicant && (
        <div className="fma-modal-overlay" onClick={() => setSelectedApplicant(null)}>
          <div className="fma-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="fma-modal-header">
              <div>
                <span className="fma-modal-tag">Handbook Section 3.8.6 / 3.9.5</span>
                <h3 className="fma-modal-title">{selectedApplicant.name} — {selectedApplicant.regNo}</h3>
                <div className="fma-modal-subtitle">{selectedApplicant.programme} • Semester 5 Majoring</div>
              </div>
              <button
                type="button"
                className="fma-close-btn"
                onClick={() => setSelectedApplicant(null)}
              >
                &times;
              </button>
            </div>

            <div className="fma-modal-body">
              <div className="fma-info-banner">
                <div className="fma-info-item">
                  <span className="fma-info-lbl">Sem 1–3 Cumulative GPA</span>
                  <span className="fma-info-val" style={{ color: selectedApplicant.cgpaSem13 >= 2.0 ? '#059669' : '#dc2626' }}>
                    {selectedApplicant.cgpaSem13.toFixed(2)} (Required: ≥ 2.00)
                  </span>
                </div>
                <div className="fma-info-item">
                  <span className="fma-info-lbl">Allocated Division</span>
                  <span className="fma-info-val">{selectedApplicant.allocatedDivision}</span>
                </div>
                <div className="fma-info-item">
                  <span className="fma-info-lbl">First Choice</span>
                  <span className="fma-info-val">{selectedApplicant.firstChoice}</span>
                </div>
                <div className="fma-info-item">
                  <span className="fma-info-lbl">Faculty Board Status</span>
                  <span className="fma-info-val">{selectedApplicant.facultyBoardApproval}</span>
                </div>
              </div>

              <div className={`fma-advisory-box ${selectedApplicant.cgpaSem13 < 2.0 ? 'fma-advisory-warning' : ''}`}>
                <strong>Handbook Criteria Rule:</strong> "A student who has not earned a cumulative GPA of first three (03) semesters of 2.0 or above will not be permitted to register for the fifth semester until the cumulative GPA of the first three (03) semesters are improved as required."
              </div>

              <div>
                <span style={{ fontSize: '12px', color: 'var(--fma-muted)' }}>Assistant Notes: {selectedApplicant.notes}</span>
              </div>
            </div>

            <div className="fma-modal-footer">
              <button
                type="button"
                className="fma-btn fma-btn-outline"
                onClick={() => setSelectedApplicant(null)}
              >
                Close
              </button>
              {selectedApplicant.transferRequested && selectedApplicant.transferStatus !== 'Approved by Faculty Board' && (
                <button
                  type="button"
                  className="fma-btn fma-btn-primary"
                  onClick={() => handleApproveTransfer(selectedApplicant.id)}
                >
                  Confirm Division Transfer (2-Wk Window)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

