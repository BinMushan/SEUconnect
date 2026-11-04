import React, { useState, useMemo } from 'react';

const INITIAL_TRAINING = [
  {
    id: 'TR-2026-001',
    regNo: '21ICT005',
    name: 'S.M. Farhan',
    programme: 'BICT (Hons)',
    specialization: 'Software Technologies',
    trainingPeriod: 'Year 4 Sem 2 (6 Months Continuous)',
    clause: 'Handbook §3.9.3',
    diaryStatus: 'Daily Record Book Issued',
    diaryNo: 'IT-DIARY-2026-014',
    companyName: 'CodeGen International Pvt Ltd',
    workplaceLocation: 'Trace Expert City, Colombo 10',
    externalSupervisor: 'Eng. D. Samarasinghe (Lead Architect)',
    internalSupervisor: 'Mr. RKA. Rifai Kariapper',
    placementLetterDispatched: true,
    status: 'Placement Confirmed',
    notes: 'Placement letter dispatched. Training daily diary received by candidate.'
  },
  {
    id: 'TR-2026-002',
    regNo: '21ICT042',
    name: 'T. Mithun',
    programme: 'BICT (Hons)',
    specialization: 'Network & Security',
    trainingPeriod: 'Year 4 Sem 2 (6 Months Continuous)',
    clause: 'Handbook §3.9.3',
    diaryStatus: 'Daily Record Book Issued',
    diaryNo: 'IT-DIARY-2026-015',
    companyName: 'Sri Lanka Telecom (SLT-Mobitel HQ)',
    workplaceLocation: 'Lotus Road, Colombo 01',
    externalSupervisor: 'Mr. K. Perera (Network Operations Manager)',
    internalSupervisor: 'Mr. SL. Abdul Haleem',
    placementLetterDispatched: true,
    status: 'Placement Confirmed',
    notes: 'Placement verified. Diary certified.'
  },
  {
    id: 'TR-2026-003',
    regNo: '23BST008',
    name: 'M.N. Fathima',
    programme: 'BBST (Hons)',
    specialization: 'Food Science & Technology',
    trainingPeriod: 'Year 2 Sem 1 (20 Weeks Continuous)',
    clause: 'Handbook §3.8.4',
    diaryStatus: 'Book Awaiting Collection',
    diaryNo: 'IT-DIARY-2026-088',
    companyName: 'Ceylon Cold Stores PLC (Elephant House)',
    workplaceLocation: 'Ranala, Kaduwela',
    externalSupervisor: 'Mrs. H. Senanayake (QA Manager)',
    internalSupervisor: 'Dr. UL. Abdul Majeed',
    placementLetterDispatched: true,
    status: 'Ready for Dispatch',
    notes: 'Handbook §3.8.4: Training not less than 20 weeks. Record book printed.'
  },
  {
    id: 'TR-2026-004',
    regNo: '23BST033',
    name: 'A.R. Rizwan',
    programme: 'BBST (Hons)',
    specialization: 'Biosystems Engineering',
    trainingPeriod: 'Year 2 Sem 1 (20 Weeks Continuous)',
    clause: 'Handbook §3.8.4',
    diaryStatus: 'Application Pending',
    diaryNo: 'Not Assigned',
    companyName: 'Pending Employer Offer',
    workplaceLocation: 'Ampara / Batticaloa Region',
    externalSupervisor: 'Pending',
    internalSupervisor: 'Prof. ADNT. Kumara',
    placementLetterDispatched: false,
    status: 'Awaiting Placement Offer',
    notes: 'Student coordinating with industrial training coordinator for placement letter.'
  }
];

export default function Training_Logistics() {
  const [data, setData] = useState(INITIAL_TRAINING);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTrainee, setSelectedTrainee] = useState(null);

  const stats = useMemo(() => {
    return {
      total: data.length,
      confirmed: data.filter((d) => d.status === 'Placement Confirmed').length,
      diariesIssued: data.filter((d) => d.diaryStatus.includes('Issued')).length,
      pendingPlacement: data.filter((d) => d.status.includes('Awaiting')).length
    };
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      if (statusFilter !== 'All') {
        if (statusFilter === 'Confirmed' && item.status !== 'Placement Confirmed') return false;
        if (statusFilter === 'Issued' && !item.diaryStatus.includes('Issued')) return false;
        if (statusFilter === 'Pending' && !item.status.includes('Awaiting')) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const m =
          item.name.toLowerCase().includes(q) ||
          item.regNo.toLowerCase().includes(q) ||
          item.companyName.toLowerCase().includes(q) ||
          item.diaryNo.toLowerCase().includes(q);
        if (!m) return false;
      }
      return true;
    });
  }, [data, search, statusFilter]);

  const handleIssueDiary = (id) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              diaryStatus: 'Daily Record Book Issued',
              diaryNo: `IT-DIARY-2026-${Math.floor(100 + Math.random() * 900)}`,
              status: 'Placement Confirmed',
              placementLetterDispatched: true
            }
          : item
      )
    );
    if (selectedTrainee?.id === id) {
      setSelectedTrainee((prev) => ({
        ...prev,
        diaryStatus: 'Daily Record Book Issued',
        diaryNo: `IT-DIARY-2026-999`,
        status: 'Placement Confirmed',
        placementLetterDispatched: true
      }));
    }
  };

  return (
    <div className="fma-page">
      {/* 1. Stat Cards Grid */}
      <section className="fma-stats-grid">
        <button
          type="button"
          className={`fma-stat-card ${statusFilter === 'All' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('All')}
        >
          <div className="fma-stat-head">
            <div className="fma-stat-icon fma-icon-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <span className="fma-stat-pill fma-pill-blue">Total</span>
          </div>
          <div className="fma-stat-body">
            <span className="fma-stat-label">Total Trainees</span>
            <span className="fma-stat-val">{stats.total}</span>
            <span className="fma-stat-sub">BBST &amp; BICT intakes</span>
          </div>
        </button>

        <button
          type="button"
          className={`fma-stat-card ${statusFilter === 'Confirmed' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'Confirmed' ? 'All' : 'Confirmed')}
        >
          <div className="fma-stat-head">
            <div className="fma-stat-icon fma-icon-green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <span className="fma-stat-pill fma-pill-green">Confirmed</span>
          </div>
          <div className="fma-stat-body">
            <span className="fma-stat-label">Placements Verified</span>
            <span className="fma-stat-val">{stats.confirmed}</span>
            <span className="fma-stat-sub">External mentors assigned</span>
          </div>
        </button>

        <button
          type="button"
          className={`fma-stat-card ${statusFilter === 'Issued' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'Issued' ? 'All' : 'Issued')}
        >
          <div className="fma-stat-head">
            <div className="fma-stat-icon fma-icon-purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <span className="fma-stat-pill fma-pill-purple">Diaries</span>
          </div>
          <div className="fma-stat-body">
            <span className="fma-stat-label">Daily Record Books</span>
            <span className="fma-stat-val">{stats.diariesIssued}</span>
            <span className="fma-stat-sub">Issued prior to training</span>
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
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <span className="fma-stat-pill fma-pill-amber">Pending</span>
          </div>
          <div className="fma-stat-body">
            <span className="fma-stat-label">Pending Placements</span>
            <span className="fma-stat-val">{stats.pendingPlacement}</span>
            <span className="fma-stat-sub">Awaiting employer letter</span>
          </div>
        </button>
      </section>

      {/* 2. Main Panel */}
      <div className="fma-panel">
        <div className="fma-panel-head">
          <div>
            <h3 className="fma-panel-title">Industrial Training Daily Diaries &amp; Placement Registry</h3>
            <p className="fma-panel-sub">
              Handbook Section 3.8.4 &amp; 3.9.3: Each student shall receive an official recordbook prior to commencement of training to maintain daily certified activities.
            </p>
          </div>
          <div className="fma-header-actions">
            <button
              type="button"
              className="fma-btn fma-btn-outline"
              onClick={() => window.print()}
            >
              Export Training Dossier
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
              placeholder="Search candidate name, reg no, company name, or diary number..."
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
              <option value="All">All Placement Statuses</option>
              <option value="Confirmed">Placement Confirmed</option>
              <option value="Issued">Daily Record Book Issued</option>
              <option value="Pending">Awaiting Placement</option>
            </select>

            {(search || statusFilter !== 'All') && (
              <button
                type="button"
                className="fma-btn-clear"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('All');
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
                <th>Training Period &amp; Clause</th>
                <th>Company / Host Enterprise</th>
                <th>Daily Record Book No</th>
                <th>Internal Supervisor</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--fma-muted)' }}>
                    No industrial training records match the filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="fma-student-meta">
                        <div className="fma-avatar fma-avatar-purple">
                          {item.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="fma-name">{item.name}</div>
                          <div className="fma-regno">{item.regNo}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.trainingPeriod}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--fma-muted)' }}>{item.clause}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.companyName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--fma-muted)' }}>{item.workplaceLocation}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.diaryNo}</span>
                      <div style={{ fontSize: '11px', color: 'var(--fma-muted)' }}>{item.diaryStatus}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12.5px', fontWeight: 600 }}>{item.internalSupervisor}</div>
                      <div style={{ fontSize: '11px', color: 'var(--fma-muted)' }}>Ext: {item.externalSupervisor}</div>
                    </td>
                    <td>
                      <span className={`fma-badge ${item.status === 'Placement Confirmed' ? 'badge-green' : 'badge-amber'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="fma-action-btn"
                        onClick={() => setSelectedTrainee(item)}
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

      {/* Trainee Modal */}
      {selectedTrainee && (
        <div className="fma-modal-overlay" onClick={() => setSelectedTrainee(null)}>
          <div className="fma-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="fma-modal-header">
              <div>
                <span className="fma-modal-tag">Handbook Section 3.8.4 &amp; 3.9.3</span>
                <h3 className="fma-modal-title">{selectedTrainee.name} — {selectedTrainee.regNo}</h3>
                <div className="fma-modal-subtitle">{selectedTrainee.companyName}</div>
              </div>
              <button
                type="button"
                className="fma-close-btn"
                onClick={() => setSelectedTrainee(null)}
              >
                &times;
              </button>
            </div>

            <div className="fma-modal-body">
              <div className="fma-info-banner">
                <div className="fma-info-item">
                  <span className="fma-info-lbl">Daily Record Book</span>
                  <span className="fma-info-val">{selectedTrainee.diaryNo}</span>
                </div>
                <div className="fma-info-item">
                  <span className="fma-info-lbl">Placement Duration</span>
                  <span className="fma-info-val">{selectedTrainee.trainingPeriod}</span>
                </div>
                <div className="fma-info-item">
                  <span className="fma-info-lbl">External Supervisor</span>
                  <span className="fma-info-val">{selectedTrainee.externalSupervisor}</span>
                </div>
                <div className="fma-info-item">
                  <span className="fma-info-lbl">Internal Academic Supervisor</span>
                  <span className="fma-info-val">{selectedTrainee.internalSupervisor}</span>
                </div>
              </div>

              <div className="fma-advisory-box">
                <strong>Handbook Mandatory Requirement:</strong> "Each student shall receive a recordbook prior to the commencement of industrial training in which he/she should maintain daily activities certified by the external supervisor."
              </div>

              <div>
                <span style={{ fontSize: '12px', color: 'var(--fma-muted)' }}>Coordinator Note: {selectedTrainee.notes}</span>
              </div>
            </div>

            <div className="fma-modal-footer">
              <button
                type="button"
                className="fma-btn fma-btn-outline"
                onClick={() => setSelectedTrainee(null)}
              >
                Close
              </button>
              {selectedTrainee.diaryNo === 'Not Assigned' && (
                <button
                  type="button"
                  className="fma-btn fma-btn-primary"
                  onClick={() => handleIssueDiary(selectedTrainee.id)}
                >
                  Issue Training Diary &amp; Dispatch Placement
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

