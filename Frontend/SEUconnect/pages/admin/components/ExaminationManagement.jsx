import { useState } from 'react';

export default function ExaminationManagement({
  examinations,
  repeatCandidates,
  onClearRepeatCandidate
}) {
  const [activeTab, setActiveTab] = useState('repeats'); // 'repeats' | 'schedules'
  const [candidateFilter, setCandidateFilter] = useState('ALL');

  const filteredCandidates = repeatCandidates.filter((c) => {
    return candidateFilter === 'ALL' || c.admissionStatus === candidateFilter;
  });

  return (
    <div className="adm-dashboard-container">
      {/* Section Header */}
      <div className="adm-section-header">
        <div className="adm-section-title-wrap">
          <h2 className="adm-section-title">Examination Management & ESA Eligibility</h2>
          <p className="adm-section-subtitle">
            Administer End Semester Examination (ESA) entry criteria, verify repeat attempts, clear bank PIV paying-in vouchers, and authorize examination admission slips.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('repeats')}
          style={{
            padding: '0.55rem 1.15rem',
            border: 'none',
            background: 'transparent',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeTab === 'repeats' ? '2.5px solid #0f2b5c' : '2.5px solid transparent',
            color: activeTab === 'repeats' ? '#0f2b5c' : '#64748b'
          }}
        >
          Repeat & Fresh-Repeat Candidates ({repeatCandidates.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('schedules')}
          style={{
            padding: '0.55rem 1.15rem',
            border: 'none',
            background: 'transparent',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeTab === 'schedules' ? '2.5px solid #0f2b5c' : '2.5px solid transparent',
            color: activeTab === 'schedules' ? '#0f2b5c' : '#64748b'
          }}
        >
          Upcoming ESA Exam Cycles ({examinations.length})
        </button>
      </div>

      {activeTab === 'repeats' ? (
        <>
          {/* Filter Toolbar */}
          <div className="adm-filter-toolbar">
            <div className="adm-filter-group">
              <select
                className="adm-filter-select"
                value={candidateFilter}
                onChange={(e) => setCandidateFilter(e.target.value)}
              >
                <option value="ALL">All Admission Clearances</option>
                <option value="Cleared">Cleared for Admission</option>
                <option value="Pending Payment Slip">Pending PIV Bank Slip</option>
              </select>
            </div>
          </div>

          {/* Repeat Candidates Table */}
          <div className="adm-table-card">
            <div className="adm-table-wrapper">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Student Reg No</th>
                    <th>Candidate Name</th>
                    <th>Repeat Subject</th>
                    <th>Attempt Category</th>
                    <th>Previous Grade</th>
                    <th>CA Score Carryover</th>
                    <th>PIV Bank Slip</th>
                    <th>Admission Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((cand) => (
                    <tr key={cand.id}>
                      <td>
                        <span style={{ fontWeight: 700, color: '#0f2b5c' }}>{cand.regNo}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{cand.studentName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{cand.programme}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{cand.moduleCode}</span>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{cand.moduleName}</div>
                      </td>
                      <td>
                        <span className="adm-badge adm-badge-neutral">{cand.attempt}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#dc2626' }}>{cand.previousGrade}</span>
                      </td>
                      <td>
                        <span className={`adm-badge ${cand.caCarriedOver ? 'adm-badge-success' : 'adm-badge-warning'}`}>
                          {cand.caCarriedOver ? 'CA Carried Over' : 'Retake CA'}
                        </span>
                      </td>
                      <td>
                        <span className={`adm-badge ${cand.pivSlipVerified ? 'adm-badge-success' : 'adm-badge-danger'}`}>
                          {cand.pivSlipVerified ? 'Verified (Paid)' : 'Slip Missing'}
                        </span>
                      </td>
                      <td>
                        <span className={`adm-badge ${cand.admissionStatus === 'Cleared' ? 'adm-badge-success' : 'adm-badge-warning'}`}>
                          {cand.admissionStatus}
                        </span>
                      </td>
                      <td>
                        {cand.admissionStatus !== 'Cleared' ? (
                          <button
                            type="button"
                            className="adm-btn-xs-primary"
                            onClick={() => onClearRepeatCandidate(cand.id)}
                          >
                            Verify & Clear
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 600 }}>Slip Cleared</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Examination Cycles Overview */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
          {examinations.map((ex) => (
            <div key={ex.id} className="adm-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                <span className="adm-badge adm-badge-info">{ex.status}</span>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Code: {ex.id}</span>
              </div>

              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: '#0f172a' }}>{ex.examTitle}</h4>
              <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.8rem', color: '#64748b' }}>
                Programmes: {ex.programme}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', textAlign: 'center', margin: '0.85rem 0' }}>
                <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Eligible</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d' }}>{ex.totalEligibleCandidates}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Barred (&lt;80%)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#dc2626' }}>{ex.totalBarredAttendance}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Repeats</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706' }}>{ex.totalRepeatCandidates}</div>
                </div>
              </div>

              <div style={{ fontSize: '0.76rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div><strong>Examination Window:</strong> {ex.startDate} to {ex.endDate}</div>
                <div><strong>Registration Cutoff:</strong> {ex.registrationDeadline}</div>
                <div><strong>Criteria:</strong> {ex.eligibilityCriteria}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
