import React, { useState, useMemo } from 'react';

const INITIAL_CERTIFICATES = [
  {
    id: 'DOC-2026-001',
    regNo: '22ICT085',
    name: 'M.N.M. Afnan',
    programme: 'Bachelor of Information and Communication Technology Honours (BICT Hons)',
    type: 'Bonafide Student Certificate',
    purpose: 'Visa / Passport Application & External Scholarship',
    issuedBy: 'Dean, Faculty of Technology',
    status: 'Ready for Collection',
    requestDate: '2026-10-29',
    serialNo: 'SEUSL/FOT/DEAN/BON/2026/041',
    notes: 'Certified genuine full-time internal undergraduate in good standing.'
  },
  {
    id: 'DOC-2026-002',
    regNo: '22ICT041',
    name: 'K.P. Silva',
    programme: 'Bachelor of Information and Communication Technology Honours (BICT Hons)',
    type: 'Medium of Instruction Certificate',
    purpose: 'Overseas Postgraduate Higher Studies Admission',
    issuedBy: 'Dean, Faculty of Technology',
    status: 'Signed by Dean',
    requestDate: '2026-10-30',
    serialNo: 'SEUSL/FOT/DEAN/MOI/2026/018',
    notes: 'Handbook §3.4: Certified that the medium of instruction and examinations is English.'
  },
  {
    id: 'DOC-2026-003',
    regNo: '21ICT064',
    name: 'F. Nilufar',
    programme: 'Bachelor of Information and Communication Technology Honours (BICT Hons)',
    type: 'Semester Clearance Slip',
    purpose: 'Examination Entry & Library Clearance',
    issuedBy: 'Faculty Management Assistant',
    status: 'Pending Verification',
    requestDate: '2026-11-02',
    serialNo: 'SEUSL/FOT/DEAN/CLR/2026/102',
    notes: 'Verifying annual registration renewal fee before issuing exam admission clearance.'
  },
  {
    id: 'DOC-2026-004',
    regNo: '23BST012',
    name: 'R. Fernando',
    programme: 'Bachelor of Biosystems Technology Honours (BBST Hons)',
    type: 'Industrial Visit Authorization',
    purpose: 'Model Farm & Food Processing Field Visit (§3.8.3)',
    issuedBy: 'Dean, Faculty of Technology',
    status: 'Dispatched',
    requestDate: '2026-10-27',
    serialNo: 'SEUSL/FOT/DEAN/IND/2026/007',
    notes: 'Official permission letter addressed to the industry host management.'
  }
];

export default function Certificates_Clearance() {
  const [data, setData] = useState(INITIAL_CERTIFICATES);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedDoc, setSelectedDoc] = useState(null);

  const stats = useMemo(() => {
    return {
      total: data.length,
      ready: data.filter((d) => d.status.includes('Ready') || d.status.includes('Signed')).length,
      pending: data.filter((d) => d.status.includes('Pending')).length,
      dispatched: data.filter((d) => d.status === 'Dispatched').length
    };
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      if (typeFilter !== 'All' && !item.type.includes(typeFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        const m =
          item.name.toLowerCase().includes(q) ||
          item.regNo.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q) ||
          item.serialNo.toLowerCase().includes(q);
        if (!m) return false;
      }
      return true;
    });
  }, [data, search, typeFilter]);

  const handlePrintDoc = () => {
    window.print();
  };

  return (
    <div className="fma-page">
      {/* 1. Stat Cards Grid */}
      <section className="fma-stats-grid">
        <button
          type="button"
          className={`fma-stat-card ${typeFilter === 'All' ? 'is-active' : ''}`}
          onClick={() => setTypeFilter('All')}
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
            <span className="fma-stat-label">Document Requests</span>
            <span className="fma-stat-val">{stats.total}</span>
            <span className="fma-stat-sub">Official student issuances</span>
          </div>
        </button>

        <button
          type="button"
          className={`fma-stat-card ${typeFilter === 'Bonafide' ? 'is-active' : ''}`}
          onClick={() => setTypeFilter(typeFilter === 'Bonafide' ? 'All' : 'Bonafide')}
        >
          <div className="fma-stat-head">
            <div className="fma-stat-icon fma-icon-green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <span className="fma-stat-pill fma-pill-green">Bonafide</span>
          </div>
          <div className="fma-stat-body">
            <span className="fma-stat-label">Bonafide Letters</span>
            <span className="fma-stat-val">{data.filter((d) => d.type.includes('Bonafide')).length}</span>
            <span className="fma-stat-sub">Student status letters</span>
          </div>
        </button>

        <button
          type="button"
          className={`fma-stat-card ${typeFilter === 'Medium' ? 'is-active' : ''}`}
          onClick={() => setTypeFilter(typeFilter === 'Medium' ? 'All' : 'Medium')}
        >
          <div className="fma-stat-head">
            <div className="fma-stat-icon fma-icon-purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <span className="fma-stat-pill fma-pill-purple">English MOI</span>
          </div>
          <div className="fma-stat-body">
            <span className="fma-stat-label">Medium of Instruction</span>
            <span className="fma-stat-val">{data.filter((d) => d.type.includes('Medium')).length}</span>
            <span className="fma-stat-sub">Handbook §3.4 compliance</span>
          </div>
        </button>

        <button
          type="button"
          className={`fma-stat-card ${typeFilter === 'Clearance' ? 'is-active' : ''}`}
          onClick={() => setTypeFilter(typeFilter === 'Clearance' ? 'All' : 'Clearance')}
        >
          <div className="fma-stat-head">
            <div className="fma-stat-icon fma-icon-amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
              </svg>
            </div>
            <span className="fma-stat-pill fma-pill-amber">Clearance</span>
          </div>
          <div className="fma-stat-body">
            <span className="fma-stat-label">Clearance Slips</span>
            <span className="fma-stat-val">{data.filter((d) => d.type.includes('Clearance')).length}</span>
            <span className="fma-stat-sub">Dean’s Office endorsement</span>
          </div>
        </button>
      </section>

      {/* 2. Main Panel */}
      <div className="fma-panel">
        <div className="fma-panel-head">
          <div>
            <h3 className="fma-panel-title">Official Student Certificates &amp; Dean’s Clearance Registry</h3>
            <p className="fma-panel-sub">
              Issue verified Bonafide letters, English Medium of Instruction confirmations (Handbook §3.4), and faculty clearance slips.
            </p>
          </div>
          <div className="fma-header-actions">
            <button
              type="button"
              className="fma-btn fma-btn-outline"
              onClick={handlePrintDoc}
            >
              Print Document Register
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
              placeholder="Search candidate name, reg no, serial number, or document type..."
              className="fma-input fma-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="fma-filter-group">
            <select
              className="fma-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Document Types</option>
              <option value="Bonafide">Bonafide Student Certificate</option>
              <option value="Medium">Medium of Instruction (English)</option>
              <option value="Clearance">Semester Clearance Slip</option>
              <option value="Visit">Industrial Visit Authorization</option>
            </select>

            {(search || typeFilter !== 'All') && (
              <button
                type="button"
                className="fma-btn-clear"
                onClick={() => {
                  setSearch('');
                  setTypeFilter('All');
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
                <th>Certificate Type</th>
                <th>Serial Number</th>
                <th>Purpose</th>
                <th>Requested Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--fma-muted)' }}>
                    No certificates match the filter criteria.
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
                      <div style={{ fontWeight: 600 }}>{item.type}</div>
                      <div style={{ fontSize: '11px', color: 'var(--fma-muted)' }}>Issued by: {item.issuedBy}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '12px' }}>
                        {item.serialNo}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12.5px' }}>{item.purpose}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: 'var(--fma-muted)' }}>{item.requestDate}</span>
                    </td>
                    <td>
                      <span
                        className={`fma-badge ${
                          item.status.includes('Ready') || item.status.includes('Signed')
                            ? 'badge-green'
                            : item.status === 'Dispatched'
                            ? 'badge-blue'
                            : 'badge-amber'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="fma-action-btn fma-action-btn-primary"
                        onClick={() => setSelectedDoc(item)}
                      >
                        Preview &amp; Print
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Certificate Preview Modal */}
      {selectedDoc && (
        <div className="fma-modal-overlay" onClick={() => setSelectedDoc(null)}>
          <div className="fma-modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="fma-modal-header">
              <div>
                <span className="fma-modal-tag">Official Letter Preview</span>
                <h3 className="fma-modal-title">{selectedDoc.type}</h3>
                <div className="fma-modal-subtitle">Serial Ref: {selectedDoc.serialNo}</div>
              </div>
              <button
                type="button"
                className="fma-close-btn"
                onClick={() => setSelectedDoc(null)}
              >
                &times;
              </button>
            </div>

            <div className="fma-modal-body" style={{ background: '#ffffff', color: '#0f172a' }}>
              <div
                style={{
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '28px',
                  background: '#fafafa',
                  fontFamily: 'serif',
                  lineHeight: '1.6'
                }}
              >
                <div style={{ textAlign: 'center', borderBottom: '2px solid #1e3a8a', paddingBottom: '14px', marginBottom: '18px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1e3a8a', fontWeight: 700 }}>
                    South Eastern University of Sri Lanka
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>FACULTY OF TECHNOLOGY</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Office of the Dean • University Park, Oluvil #32360</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '16px', fontFamily: 'sans-serif' }}>
                  <span><strong>Our Ref:</strong> {selectedDoc.serialNo}</span>
                  <span><strong>Date:</strong> {new Date().toISOString().split('T')[0]}</span>
                </div>

                <div style={{ textAlign: 'center', margin: '20px 0', textDecoration: 'underline', fontWeight: 700, fontSize: '16px' }}>
                  TO WHOMSOEVER IT MAY CONCERN
                </div>

                <p style={{ fontSize: '13.5px', textAlign: 'justify', marginBottom: '14px' }}>
                  This is to certify that <strong>{selectedDoc.name}</strong> (Registration No: <strong>{selectedDoc.regNo}</strong>) is a registered full-time internal undergraduate student in the <strong>Faculty of Technology, South Eastern University of Sri Lanka</strong>, following the degree program of <strong>{selectedDoc.programme}</strong>.
                </p>

                {selectedDoc.type.includes('Medium') && (
                  <p style={{ fontSize: '13.5px', textAlign: 'justify', marginBottom: '14px' }}>
                    In accordance with <strong>Section 3.4 of the Faculty Undergraduate Handbook</strong>, the medium of instruction, academic coursework, continuous assessments, and end semester examinations for all study programs in the Faculty of Technology is strictly <strong>English</strong>.
                  </p>
                )}

                <p style={{ fontSize: '13.5px', textAlign: 'justify', marginBottom: '24px' }}>
                  This certificate is issued upon the request of the above student for the purpose of: <em>{selectedDoc.purpose}</em>.
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '36px', paddingTop: '20px', fontFamily: 'sans-serif', fontSize: '12px' }}>
                  <div>
                    <div style={{ borderTop: '1px dotted #94a3b8', width: '160px', marginBottom: '4px' }}></div>
                    <div>Prepared by:</div>
                    <strong>Faculty Management Assistant</strong>
                    <div>Office of the Dean</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ borderTop: '1px dotted #94a3b8', width: '180px', marginBottom: '4px', marginLeft: 'auto' }}></div>
                    <div>Approved &amp; Certified:</div>
                    <strong>Dean / Senior Assistant Registrar</strong>
                    <div>Faculty of Technology, SEUSL</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="fma-modal-footer">
              <button
                type="button"
                className="fma-btn fma-btn-outline"
                onClick={() => setSelectedDoc(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="fma-btn fma-btn-primary"
                onClick={handlePrintDoc}
              >
                🖨️ Print Official Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

