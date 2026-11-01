import { useState } from 'react';

export default function ResultsManagement({
  students,
  onPublishResults
}) {
  const [filterClass, setFilterClass] = useState('ALL');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState('Semester 5');

  // Distribution counts
  const firstClass = students.filter((s) => s.cgpa >= 3.7);
  const secondUpper = students.filter((s) => s.cgpa >= 3.3 && s.cgpa < 3.7);
  const secondLower = students.filter((s) => s.cgpa >= 3.0 && s.cgpa < 3.3);
  const generalPass = students.filter((s) => s.cgpa >= 2.0 && s.cgpa < 3.0);
  const academicWarning = students.filter((s) => s.cgpa < 2.0);

  const filteredStudents = students.filter((s) => {
    if (filterClass === 'FIRST') return s.cgpa >= 3.7;
    if (filterClass === 'UPPER') return s.cgpa >= 3.3 && s.cgpa < 3.7;
    if (filterClass === 'LOWER') return s.cgpa >= 3.0 && s.cgpa < 3.3;
    if (filterClass === 'PASS') return s.cgpa >= 2.0 && s.cgpa < 3.0;
    if (filterClass === 'WARNING') return s.cgpa < 2.0;
    return true;
  });

  return (
    <div className="adm-dashboard-container">
      {/* Section Header */}
      <div className="adm-section-header">
        <div className="adm-section-title-wrap">
          <h2 className="adm-section-title">Results, SGPA/CGPA Ledger & Academic Progression</h2>
          <p className="adm-section-subtitle">
            Audit student GPA standings, identify Dean&apos;s List recipients, track students under academic warning, and release moderated results ledgers.
          </p>
        </div>
        <div className="adm-section-actions">
          <button
            type="button"
            className="adm-find-process-btn"
            onClick={() => setIsPublishModalOpen(true)}
          >
            Publish Results Ledger
          </button>
        </div>
      </div>

      {/* Degree Classification Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.85rem' }}>
        <div
          className="adm-card"
          style={{ padding: '0.85rem', cursor: 'pointer', borderTop: '3px solid #16a34a' }}
          onClick={() => setFilterClass('FIRST')}
        >
          <div style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 700 }}>FIRST CLASS</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>{firstClass.length}</div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>CGPA &ge; 3.70</div>
        </div>

        <div
          className="adm-card"
          style={{ padding: '0.85rem', cursor: 'pointer', borderTop: '3px solid #0284c7' }}
          onClick={() => setFilterClass('UPPER')}
        >
          <div style={{ fontSize: '0.68rem', color: '#0284c7', fontWeight: 700 }}>SECOND UPPER</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>{secondUpper.length}</div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>3.30 &le; CGPA &lt; 3.70</div>
        </div>

        <div
          className="adm-card"
          style={{ padding: '0.85rem', cursor: 'pointer', borderTop: '3px solid #64748b' }}
          onClick={() => setFilterClass('LOWER')}
        >
          <div style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 700 }}>SECOND LOWER</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>{secondLower.length}</div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>3.00 &le; CGPA &lt; 3.30</div>
        </div>

        <div
          className="adm-card"
          style={{ padding: '0.85rem', cursor: 'pointer', borderTop: '3px solid #d97706' }}
          onClick={() => setFilterClass('PASS')}
        >
          <div style={{ fontSize: '0.68rem', color: '#d97706', fontWeight: 700 }}>GENERAL PASS</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>{generalPass.length}</div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>2.00 &le; CGPA &lt; 3.00</div>
        </div>

        <div
          className="adm-card"
          style={{ padding: '0.85rem', cursor: 'pointer', borderTop: '3px solid #dc2626' }}
          onClick={() => setFilterClass('WARNING')}
        >
          <div style={{ fontSize: '0.68rem', color: '#dc2626', fontWeight: 700 }}>ACADEMIC WARNING</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#dc2626' }}>{academicWarning.length}</div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>CGPA &lt; 2.00 (Probation)</div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="adm-filter-toolbar">
        <div className="adm-filter-group">
          <select
            className="adm-filter-select"
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
          >
            <option value="ALL">All Academic Classifications</option>
            <option value="FIRST">First Class Honours (&ge; 3.70)</option>
            <option value="UPPER">Second Class Upper (3.30 - 3.69)</option>
            <option value="LOWER">Second Class Lower (3.00 - 3.29)</option>
            <option value="PASS">General Pass (2.00 - 2.99)</option>
            <option value="WARNING">Academic Warning / Probation (&lt; 2.00)</option>
          </select>
        </div>
        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
          Filtering {filteredStudents.length} of {students.length} students
        </div>
      </div>

      {/* Results Table */}
      <div className="adm-table-card">
        <div className="adm-table-wrapper">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Registration No</th>
                <th>Student Name</th>
                <th>Programme</th>
                <th>Current Semester</th>
                <th>Current SGPA</th>
                <th>Cumulative CGPA</th>
                <th>Credits Completed</th>
                <th>Classification Standing</th>
                <th>Dean&apos;s Honour List</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => {
                const isDeansList = s.sgpa >= 3.7;
                return (
                  <tr key={s.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0f2b5c' }}>{s.regNo}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{s.name}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem' }}>{s.programme}</div>
                    </td>
                    <td>
                      <span className="adm-stat-badge">{s.semester}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{s.sgpa.toFixed(2)}</span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 800,
                          color: s.cgpa >= 3.7 ? '#15803d' : s.cgpa >= 3.3 ? '#0f2b5c' : s.cgpa < 2.0 ? '#dc2626' : '#b45309'
                        }}
                      >
                        {s.cgpa.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span>{s.credits} / 120 Cr</span>
                    </td>
                    <td>
                      <span
                        className={`adm-badge ${
                          s.cgpa >= 3.7
                            ? 'adm-badge-success'
                            : s.cgpa >= 3.3
                            ? 'adm-badge-info'
                            : s.cgpa >= 2.0
                            ? 'adm-badge-neutral'
                            : 'adm-badge-danger'
                        }`}
                      >
                        {s.cgpa >= 3.7
                          ? 'First Class'
                          : s.cgpa >= 3.3
                          ? 'Second Upper'
                          : s.cgpa >= 3.0
                          ? 'Second Lower'
                          : s.cgpa >= 2.0
                          ? 'General Pass'
                          : 'Academic Warning'}
                      </span>
                    </td>
                    <td>
                      {isDeansList ? (
                        <span className="adm-badge adm-badge-success" style={{ fontWeight: 700 }}>
                          Dean&apos;s List ⭐
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Standard</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Publish Results Modal */}
      {isPublishModalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsPublishModalOpen(false)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">Publish Moderated Results Ledger</h3>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setIsPublishModalOpen(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="adm-modal-body">
              <p style={{ fontSize: '0.84rem', color: '#475569', margin: 0 }}>
                This operation publishes moderated semester marks, recalibrates SGPA and CGPA metrics across all undergraduate profiles, and releases grade sheets to student dashboards.
              </p>

              <div className="adm-form-group">
                <label className="adm-label">Target Examination Cycle / Semester</label>
                <select
                  className="adm-input"
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                >
                  <option value="Semester 5">Semester 5 - BICT, BST & ET</option>
                  <option value="Semester 3">Semester 3 - BICT, BST & ET</option>
                  <option value="Semester 1">Semester 1 - First Year Foundation</option>
                </select>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem', borderRadius: '8px', fontSize: '0.78rem', color: '#166534' }}>
                ✓ Senate Examination Board confirmation received.<br />
                ✓ Dean & HOD digital signatures appended.<br />
                ✓ Repeat grades reconciled.
              </div>
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                className="adm-btn-xs-secondary"
                onClick={() => setIsPublishModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="adm-find-process-btn"
                onClick={() => {
                  onPublishResults(selectedSemester);
                  setIsPublishModalOpen(false);
                }}
              >
                Confirm & Publish Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
