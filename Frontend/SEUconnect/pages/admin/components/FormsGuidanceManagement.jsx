import { useState } from 'react';

export default function FormsGuidanceManagement({
  facultyForms,
  onAddForm
}) {
  const [activeTab, setActiveTab] = useState('forms'); // 'forms' | 'guidance'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Academic Registration');
  const [newDescription, setNewDescription] = useState('');

  const processWorkflows = [
    {
      id: 'WF-01',
      title: 'Procedure for Medical Certificate Submission & Attendance Excuse',
      steps: [
        'Student obtains medical certificate from a Government Hospital or SEUSL University Health Centre (Oluvil).',
        'Student fills Form MC-01 and attaches original medical certificate.',
        'Submit to University Medical Officer (Dr. K.M. Farook) within 7 calendar days of resuming lectures.',
        'UMO validates certificate and forwards endorsement to Faculty Administration Office.',
        'Administrative Officer updates SEUConnect attendance record and restores exam eligibility.'
      ]
    },
    {
      id: 'WF-02',
      title: 'Procedure for Continuous Assessment (CA) / ESA Repeat Module Registration',
      steps: [
        'Download Form EX-04 (Repeat Examination Entry Form).',
        'Obtain paying-in voucher (Form PB-09) and pay requisite repeat fee at People’s Bank Oluvil Branch.',
        'Attach original Bank Shroff/Deposit slip to Form EX-04.',
        'Submit completed dossier to Senior Assistant Registrar (Examinations) before official cutoff date.',
        'Check SEUConnect Repeat Eligibility ledger for Hall Admission slip clearance.'
      ]
    },
    {
      id: 'WF-03',
      title: 'Add / Drop Course Amendment Workflow',
      steps: [
        'Review semester course catalog and timetable schedule for potential lecture clashes.',
        'Complete Form AR-02 and obtain formal recommendation from Academic Advisor.',
        'If proposed semester credits exceed 22 credits, obtain Head of Department (HOD) special dispensation.',
        'Submit via SEUConnect Semester Registration portal during the first two weeks of semester.',
        'Receive automated confirmation upon Assistant Registrar endorsement.'
      ]
    }
  ];

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newCode.trim() || !newTitle.trim()) return;

    onAddForm({
      id: `FORM-${Date.now()}`,
      code: newCode.trim(),
      title: newTitle.trim(),
      category: newCategory,
      fileFormat: 'PDF (200 KB)',
      downloads: 0,
      version: 'v1.0 (2026)',
      description: newDescription.trim() || 'Official Faculty of Technology standardized document.'
    });

    setNewCode('');
    setNewTitle('');
    setNewDescription('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="adm-dashboard-container">
      {/* Section Header */}
      <div className="adm-section-header">
        <div className="adm-section-title-wrap">
          <h2 className="adm-section-title">Faculty Forms & Institutional Process Guidance</h2>
          <p className="adm-section-subtitle">
            Manage official faculty application forms, download repositories, procedure guidance workflows, and regulatory compliance sheets.
          </p>
        </div>
        <div className="adm-section-actions">
          <button
            type="button"
            className="adm-find-process-btn"
            onClick={() => setIsAddModalOpen(true)}
          >
            + Upload New Form
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('forms')}
          style={{
            padding: '0.55rem 1.15rem',
            border: 'none',
            background: 'transparent',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeTab === 'forms' ? '2.5px solid #0f2b5c' : '2.5px solid transparent',
            color: activeTab === 'forms' ? '#0f2b5c' : '#64748b'
          }}
        >
          Downloadable Faculty Forms Repository ({facultyForms.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('guidance')}
          style={{
            padding: '0.55rem 1.15rem',
            border: 'none',
            background: 'transparent',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeTab === 'guidance' ? '2.5px solid #0f2b5c' : '2.5px solid transparent',
            color: activeTab === 'guidance' ? '#0f2b5c' : '#64748b'
          }}
        >
          Institutional Process Workflows ({processWorkflows.length})
        </button>
      </div>

      {activeTab === 'forms' ? (
        /* Forms Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
          {facultyForms.map((f) => (
            <div key={f.id} className="adm-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                <span className="adm-badge adm-badge-info">{f.code}</span>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{f.version}</span>
              </div>

              <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.02rem', color: '#0f172a' }}>{f.title}</h4>
              <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.8rem', color: '#475569', lineHeight: '1.45' }}>
                {f.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  {f.fileFormat} • {f.downloads.toLocaleString()} downloads
                </div>
                <button
                  type="button"
                  className="adm-btn-xs-secondary"
                  onClick={() => alert(`Simulated Download: ${f.title} (${f.code})`)}
                >
                  Download Form
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Guidance Workflows */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {processWorkflows.map((wf) => (
            <div key={wf.id} className="adm-card" style={{ borderLeft: '4px solid #0f2b5c' }}>
              <h4 style={{ margin: '0 0 0.85rem 0', fontSize: '1.05rem', color: '#0f172a' }}>{wf.title}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {wf.steps.map((st, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.82rem' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0f2b5c', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.74rem', fontWeight: 700, flexShrink: 0 }}>
                      {idx + 1}
                    </div>
                    <span style={{ color: '#334155', lineHeight: '1.4', paddingTop: '1px' }}>{st}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Form Modal */}
      {isAddModalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">Upload New Faculty Standardized Form</h3>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="adm-modal-body">
                <div className="adm-form-grid">
                  <div className="adm-form-group">
                    <label className="adm-label">Form Institutional Code (e.g. Form EX-05) *</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="Form EX-05"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Category</label>
                    <select
                      className="adm-input"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    >
                      <option value="Academic Registration">Academic Registration</option>
                      <option value="Examination">Examination & Repeat</option>
                      <option value="Medical & Attendance">Medical & Attendance</option>
                      <option value="Finance & Payments">Finance & PIV Vouchers</option>
                      <option value="Student Welfare">Student Welfare</option>
                    </select>
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Official Document Title *</label>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="e.g. Academic Transcript & Rank Certificate Request Application"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Description & Instructions for Students</label>
                  <textarea
                    className="adm-textarea"
                    placeholder="Detail prerequisites, submission location, and required attachments..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-xs-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-find-process-btn"
                >
                  Publish Form to Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
