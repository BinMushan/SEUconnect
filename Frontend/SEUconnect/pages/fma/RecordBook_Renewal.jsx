import React, { useState, useMemo } from 'react';

const INITIAL_RECORDS = [
  {
    id: 'RB-2026-001',
    regNo: '22ICT085',
    name: 'M.N.M. Afnan',
    yearOfStudy: 'Year 3 (Academic Batch 2023/2024)',
    programme: 'BICT (Hons)',
    recordBookStatus: 'Issued & Embossed',
    recordBookNo: 'RB-FOT-2022-085',
    idCardStatus: 'Active',
    renewalFeeStatus: 'Paid & Verified',
    pivSlipNo: 'PIV-PB-99412',
    bankBranch: "People's Bank - Addalaichenai",
    amountPaid: 'Rs. 2,000.00',
    universitySealEmbossed: true,
    lastRenewalDate: '2026-10-15',
    notes: 'Bank voucher authenticated. Record Book seal stamped by Assistant Registrar.'
  },
  {
    id: 'RB-2026-002',
    regNo: '22ICT041',
    name: 'K.P. Silva',
    yearOfStudy: 'Year 3 (Academic Batch 2023/2024)',
    programme: 'BICT (Hons)',
    recordBookStatus: 'Issued & Embossed',
    recordBookNo: 'RB-FOT-2022-041',
    idCardStatus: 'Active',
    renewalFeeStatus: 'Paid & Verified',
    pivSlipNo: 'PIV-PB-99435',
    bankBranch: "People's Bank - Kalmunai",
    amountPaid: 'Rs. 2,000.00',
    universitySealEmbossed: true,
    lastRenewalDate: '2026-10-16',
    notes: 'Annual renewal completed.'
  },
  {
    id: 'RB-2026-003',
    regNo: '21ICT064',
    name: 'F. Nilufar',
    yearOfStudy: 'Year 4 (Academic Batch 2022/2023)',
    programme: 'BICT (Hons)',
    recordBookStatus: 'Replacement Pending',
    recordBookNo: 'RB-FOT-2021-064 (Reported Lost)',
    idCardStatus: 'Under Verification',
    renewalFeeStatus: 'Voucher Submitted',
    pivSlipNo: 'PIV-PB-10024',
    bankBranch: "People's Bank - Akkaraipattu",
    amountPaid: 'Rs. 2,500.00',
    universitySealEmbossed: false,
    lastRenewalDate: '2026-10-28',
    notes: 'Student reported damaged record book. Duplicate book requested with police receipt and affidavit.'
  },
  {
    id: 'RB-2026-004',
    regNo: '22ICT089',
    name: 'M.A. Akram',
    yearOfStudy: 'Year 3 (Academic Batch 2023/2024)',
    programme: 'BICT (Hons)',
    recordBookStatus: 'Book Held',
    recordBookNo: 'RB-FOT-2022-089',
    idCardStatus: 'Suspended (Bursar)',
    renewalFeeStatus: 'Unpaid / Overdue',
    pivSlipNo: 'None',
    bankBranch: 'N/A',
    amountPaid: 'Rs. 0.00',
    universitySealEmbossed: false,
    lastRenewalDate: 'Pending',
    notes: 'Renewal fee overdue. Handbook §7.6: Registration renewal slip not submitted to Dean’s Office.'
  },
  {
    id: 'RB-2026-005',
    regNo: '23BST012',
    name: 'R. Fernando',
    yearOfStudy: 'Year 2 (Academic Batch 2024/2025)',
    programme: 'BBST (Hons)',
    recordBookStatus: 'Ready for Collection',
    recordBookNo: 'RB-FOT-2023-012',
    idCardStatus: 'Printed',
    renewalFeeStatus: 'Paid & Verified',
    pivSlipNo: 'PIV-PB-10488',
    bankBranch: "People's Bank - Oluvil",
    amountPaid: 'Rs. 2,000.00',
    universitySealEmbossed: true,
    lastRenewalDate: '2026-10-20',
    notes: '2nd Year registration renewal verified. Record book ready for student hand-over.'
  },
  {
    id: 'RB-2026-006',
    regNo: '23BST027',
    name: 'T. Kumar',
    yearOfStudy: 'Year 2 (Academic Batch 2024/2025)',
    programme: 'BBST (Hons)',
    recordBookStatus: 'Embossing Pending',
    recordBookNo: 'RB-FOT-2023-027',
    idCardStatus: 'Photo Verification',
    renewalFeeStatus: 'Voucher Submitted',
    pivSlipNo: 'PIV-PB-10512',
    bankBranch: "People's Bank - Addalaichenai",
    amountPaid: 'Rs. 2,000.00',
    universitySealEmbossed: false,
    lastRenewalDate: '2026-11-01',
    notes: 'PIV payment slip attached. Awaiting University Seal stamping.'
  }
];

export default function RecordBook_Renewal() {
  const [data, setData] = useState(INITIAL_RECORDS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const stats = useMemo(() => {
    return {
      total: data.length,
      issued: data.filter((d) => d.recordBookStatus === 'Issued & Embossed').length,
      pendingVoucher: data.filter((d) => d.renewalFeeStatus === 'Voucher Submitted').length,
      overdue: data.filter((d) => d.renewalFeeStatus.includes('Overdue')).length
    };
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      if (statusFilter !== 'All') {
        if (statusFilter === 'Issued' && item.recordBookStatus !== 'Issued & Embossed') return false;
        if (statusFilter === 'PendingVoucher' && item.renewalFeeStatus !== 'Voucher Submitted') return false;
        if (statusFilter === 'Overdue' && !item.renewalFeeStatus.includes('Overdue')) return false;
        if (statusFilter === 'Ready' && !item.recordBookStatus.includes('Ready')) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const m =
          item.name.toLowerCase().includes(q) ||
          item.regNo.toLowerCase().includes(q) ||
          item.recordBookNo.toLowerCase().includes(q) ||
          item.pivSlipNo.toLowerCase().includes(q);
        if (!m) return false;
      }
      return true;
    });
  }, [data, search, statusFilter]);

  const handleUpdate = (id, updates) => {
    setData((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    if (selectedRecord?.id === id) {
      setSelectedRecord((prev) => ({ ...prev, ...updates }));
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
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <line x1="7" y1="8" x2="17" y2="8" />
                <line x1="7" y1="12" x2="17" y2="12" />
              </svg>
            </div>
            <span className="fma-stat-pill fma-pill-blue">Total</span>
          </div>
          <div className="fma-stat-body">
            <span className="fma-stat-label">Total Student Records</span>
            <span className="fma-stat-val">{stats.total}</span>
            <span className="fma-stat-sub">Registered undergraduates</span>
          </div>
        </button>

        <button
          type="button"
          className={`fma-stat-card ${statusFilter === 'PendingVoucher' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'PendingVoucher' ? 'All' : 'PendingVoucher')}
        >
          <div className="fma-stat-head">
            <div className="fma-stat-icon fma-icon-amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="fma-stat-pill fma-pill-amber">Verify PIV</span>
          </div>
          <div className="fma-stat-body">
            <span className="fma-stat-label">Bank PIV Slips</span>
            <span className="fma-stat-val">{stats.pendingVoucher}</span>
            <span className="fma-stat-sub">Awaiting bank seal check</span>
          </div>
        </button>

        <button
          type="button"
          className={`fma-stat-card ${statusFilter === 'Issued' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'Issued' ? 'All' : 'Issued')}
        >
          <div className="fma-stat-head">
            <div className="fma-stat-icon fma-icon-green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <span className="fma-stat-pill fma-pill-green">Embossed</span>
          </div>
          <div className="fma-stat-body">
            <span className="fma-stat-label">Active Record Books</span>
            <span className="fma-stat-val">{stats.issued}</span>
            <span className="fma-stat-sub">University seal embossed</span>
          </div>
        </button>

        <button
          type="button"
          className={`fma-stat-card ${statusFilter === 'Overdue' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'Overdue' ? 'All' : 'Overdue')}
        >
          <div className="fma-stat-head">
            <div className="fma-stat-icon fma-icon-red">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <span className="fma-stat-pill fma-pill-red">Overdue</span>
          </div>
          <div className="fma-stat-body">
            <span className="fma-stat-label">Fee Overdue</span>
            <span className="fma-stat-val">{stats.overdue}</span>
            <span className="fma-stat-sub">Dean’s Office hold</span>
          </div>
        </button>
      </section>

      {/* 2. Main Panel */}
      <div className="fma-panel">
        <div className="fma-panel-head">
          <div>
            <h3 className="fma-panel-title">Student Record Books &amp; Annual Registration Renewal</h3>
            <p className="fma-panel-sub">
              Handbook Section 7.5 &amp; 7.6: Issue of official Student Record Books and validation of bank Paying-in Vouchers (SEUSL A/C 228-100190001704).
            </p>
          </div>
          <div className="fma-header-actions">
            <button
              type="button"
              className="fma-btn fma-btn-outline"
              onClick={() => window.print()}
            >
              Export Renewal Report
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
              placeholder="Search candidate name, reg no, record book no, or PIV slip..."
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
              <option value="All">All Renewal Statuses</option>
              <option value="Issued">Issued &amp; Embossed</option>
              <option value="PendingVoucher">PIV Voucher Submitted</option>
              <option value="Ready">Ready for Collection</option>
              <option value="Overdue">Renewal Fee Overdue</option>
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
                <th>Academic Level</th>
                <th>Record Book No</th>
                <th>Renewal Fee &amp; PIV</th>
                <th>University Seal</th>
                <th>ID Card Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--fma-muted)' }}>
                    No record book entries match the filter criteria.
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
                      <div style={{ fontWeight: 600 }}>{item.yearOfStudy}</div>
                      <div style={{ fontSize: '12px', color: 'var(--fma-muted)' }}>{item.programme}</div>
                    </td>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.recordBookNo}</div>
                      <span className={`fma-badge ${item.recordBookStatus === 'Issued & Embossed' ? 'badge-green' : 'badge-amber'}`}>
                        {item.recordBookStatus}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.amountPaid}</div>
                      <div style={{ fontSize: '11px', color: 'var(--fma-muted)' }}>Slip: {item.pivSlipNo}</div>
                      <span className={`fma-badge ${item.renewalFeeStatus === 'Paid & Verified' ? 'badge-green' : item.renewalFeeStatus.includes('Overdue') ? 'badge-red' : 'badge-amber'}`}>
                        {item.renewalFeeStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`fma-badge ${item.universitySealEmbossed ? 'badge-green' : 'badge-slate'}`}>
                        {item.universitySealEmbossed ? 'Embossed & Certified' : 'Pending Seal'}
                      </span>
                    </td>
                    <td>
                      <span className={`fma-badge ${item.idCardStatus === 'Active' ? 'badge-green' : item.idCardStatus.includes('Suspended') ? 'badge-red' : 'badge-blue'}`}>
                        {item.idCardStatus}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="fma-action-btn"
                        onClick={() => setSelectedRecord(item)}
                      >
                        Inspect Book
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Book & PIV Modal */}
      {selectedRecord && (
        <div className="fma-modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="fma-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="fma-modal-header">
              <div>
                <span className="fma-modal-tag">Handbook Section 7.5 &amp; 7.6</span>
                <h3 className="fma-modal-title">Record Book Dossier — {selectedRecord.regNo}</h3>
                <div className="fma-modal-subtitle">{selectedRecord.name} • {selectedRecord.programme}</div>
              </div>
              <button
                type="button"
                className="fma-close-btn"
                onClick={() => setSelectedRecord(null)}
              >
                &times;
              </button>
            </div>

            <div className="fma-modal-body">
              <div className="fma-info-banner">
                <div className="fma-info-item">
                  <span className="fma-info-lbl">Record Book No</span>
                  <span className="fma-info-val">{selectedRecord.recordBookNo}</span>
                </div>
                <div className="fma-info-item">
                  <span className="fma-info-lbl">Bank Paying-in Voucher</span>
                  <span className="fma-info-val">{selectedRecord.pivSlipNo}</span>
                </div>
                <div className="fma-info-item">
                  <span className="fma-info-lbl">Bank Branch</span>
                  <span className="fma-info-val">{selectedRecord.bankBranch}</span>
                </div>
                <div className="fma-info-item">
                  <span className="fma-info-lbl">Payment Verified</span>
                  <span className="fma-info-val">{selectedRecord.amountPaid}</span>
                </div>
              </div>

              <div className="fma-advisory-box">
                <strong>Handbook Section 7.5 Verification:</strong> Every student shall carry the Record Book or Identity Card whilst in the University premises. When renewing registration (§7.6), the bank PIV bearing the bank seal for SEUSL A/C 228-100190001704 must be confirmed.
              </div>

              <div>
                <span style={{ fontSize: '12px', color: 'var(--fma-muted)' }}>Staff Notes: {selectedRecord.notes}</span>
              </div>
            </div>

            <div className="fma-modal-footer">
              <button
                type="button"
                className="fma-btn fma-btn-outline"
                onClick={() => setSelectedRecord(null)}
              >
                Close
              </button>
              {!selectedRecord.universitySealEmbossed && (
                <button
                  type="button"
                  className="fma-btn fma-btn-primary"
                  onClick={() =>
                    handleUpdate(selectedRecord.id, {
                      universitySealEmbossed: true,
                      recordBookStatus: 'Issued & Embossed',
                      renewalFeeStatus: 'Paid & Verified',
                      idCardStatus: 'Active'
                    })
                  }
                >
                  Apply University Seal &amp; Dispatch Book
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

