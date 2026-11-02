import React, { useState } from 'react';
import './penalties_disciplinary.css';

export default function StudentPenalties({ user }) {
  const studentName = user?.name || 'M.N.M. Afnan';
  const studentRegNo = user?.regNo || '22ICT085';
  const studentProgramme = user?.programme || 'BICT';
  const studentFaculty = user?.faculty || 'Faculty of Technology';

  const [penalties, setPenalties] = useState([]); // Default empty clean record

  const handleDownloadClearance = () => {
    const clearanceText = `
================================================================================
SOUTH EASTERN UNIVERSITY OF SRI LANKA — FACULTY OF TECHNOLOGY
OFFICE OF THE PROCTOR & BOARD OF DISCIPLINE
OFFICIAL STUDENT DISCIPLINARY & INTEGRITY CLEARANCE CERTIFICATE
Generated Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
Reference: SEUSL/FT/DISC/CLR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}
================================================================================

TO WHOM IT MAY CONCERN:

This is to officially certify that the following undergraduate student of the
Faculty of Technology, South Eastern University of Sri Lanka:

  Full Name:             ${studentName.toUpperCase()}
  Registration Number:   ${studentRegNo.toUpperCase()}
  Degree Programme:      ${studentProgramme}
  Faculty:               ${studentFaculty}
  Academic Status:       Good Standing (Enrolled)

DISCIPLINARY RECORD AUDIT:
- Active Disciplinary Proceedings:      NONE (0)
- Examination Integrity Infractions:     NONE (0)
- Library Fines & Book Returns:          CLEARED
- Hostel & Residential Premises Holds:   CLEARED
- Administrative Sanctions:              NONE (0)

OFFICIAL STATEMENT:
The student named above maintains a completely clean institutional conduct record
with no registered disciplinary penalties, suspensions, or pending board inquiries
under Chapter XIV of the Universities Act No. 16 of 1978 and Faculty By-laws.

Issued under the authority of the Proctor & Disciplinary Committee,
South Eastern University of Sri Lanka, Oluvil.
================================================================================
`;
    const blob = new Blob([clearanceText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SEU_Disciplinary_Clearance_${studentRegNo}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="seu-penalties-container">
      {/* Header */}
      <div className="seu-penalties-header">
        <h1>Student Disciplinary Standing &amp; Penalties</h1>
        <p>Confidential institutional record of disciplinary notices, library infractions, or examination board decisions strictly isolated to your account.</p>
      </div>

      {/* 4 Standing Metrics Cards */}
      <div className="seu-standing-grid">
        <div className="seu-standing-card">
          <div className="standing-icon-wrap icon-green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
          <div className="standing-meta">
            <span className="standing-label">Institutional Standing</span>
            <span className="standing-value" style={{ color: '#059669' }}>Good Standing</span>
          </div>
        </div>

        <div className="seu-standing-card">
          <div className="standing-icon-wrap icon-blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5" />
            </svg>
          </div>
          <div className="standing-meta">
            <span className="standing-label">Active Inquiries</span>
            <span className="standing-value">0 Cases</span>
          </div>
        </div>

        <div className="seu-standing-card">
          <div className="standing-icon-wrap icon-green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div className="standing-meta">
            <span className="standing-label">Library Clearance</span>
            <span className="standing-value" style={{ color: '#059669' }}>Satisfied</span>
          </div>
        </div>

        <div className="seu-standing-card">
          <div className="standing-icon-wrap icon-green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="6" />
              <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
            </svg>
          </div>
          <div className="standing-meta">
            <span className="standing-label">Exam Board Status</span>
            <span className="standing-value" style={{ color: '#059669' }}>Cleared</span>
          </div>
        </div>
      </div>

      {/* Main Record Card */}
      <div className="seu-record-card">
        {penalties.length === 0 ? (
          <div className="seu-clean-record-view">
            <div className="seu-clean-seal">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="seu-clean-title">Clean Institutional Record</h3>
            <p className="seu-clean-desc">
              No active disciplinary inquiries, examination penalties, or administrative holds are registered against your account. You maintain full academic privileges across the university.
            </p>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div className="seu-clean-meta">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Audited by Board of Discipline &amp; Proctor's Office &bull; SEUSL</span>
              </div>

              <button
                type="button"
                onClick={handleDownloadClearance}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#1e3a8a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '0.45rem 1rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Clearance Statement
              </button>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: '8px 12px' }}>Ref Number</th>
                  <th style={{ padding: '8px 12px' }}>Description</th>
                  <th style={{ padding: '8px 12px' }}>Related Regulation</th>
                  <th style={{ padding: '8px 12px' }}>Issued Date</th>
                  <th style={{ padding: '8px 12px' }}>Status</th>
                  <th style={{ padding: '8px 12px' }}>Required Action</th>
                </tr>
              </thead>
              <tbody>
                {penalties.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{item.refNumber}</td>
                    <td style={{ padding: '10px 12px' }}>{item.description}</td>
                    <td style={{ padding: '10px 12px', color: '#64748b' }}>{item.relatedRule}</td>
                    <td style={{ padding: '10px 12px' }}>{new Date(item.issuedDate).toLocaleDateString()}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#1e3a8a', fontWeight: 600 }}>{item.requiredAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Regulatory Guidelines Reference */}
      <div className="seu-reg-box">
        <h3 className="seu-reg-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Faculty of Technology Disciplinary Code &amp; Academic Integrity Regulations
        </h3>

        <div className="seu-reg-grid">
          <div className="seu-reg-card">
            <h4>Section 8.4: Examination Malpractices &amp; Offences</h4>
            <p>
              Possession of unauthorized materials, programmable devices, or smart communication gadgets in the examination hall leads to immediate confiscation, suspension of semester exam results, and debarment for up to three academic years under Senate By-laws.
            </p>
          </div>

          <div className="seu-reg-card">
            <h4>Section 11.2: Residential Hall Conduct &amp; University Assets</h4>
            <p>
              Defacing university infrastructure, tampering with laboratory equipment, or violating hostel residential guidelines carries severe penalties, financial restitution, and immediate eviction from university student hostels.
            </p>
          </div>

          <div className="seu-reg-card">
            <h4>Formal Right of Appeal (Senate Disciplinary Appeals Committee)</h4>
            <p>
              Any student receiving a formal inquiry or reprimand notice possesses the statutory right to lodge an appeal in writing to the Registrar within fourteen (14) calendar days of notification receipt.
            </p>
          </div>

          <div className="seu-reg-card">
            <h4>Official Contact: Office of the Proctor</h4>
            <p>
              For disciplinary consultations, good conduct testimonials, or clearing administrative holds: Proctor's Office, Student Affairs Division, Administrative Building, SEUSL. Contact: <code>proctor@seu.ac.lk</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

