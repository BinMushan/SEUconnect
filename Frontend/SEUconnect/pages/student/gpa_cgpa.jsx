import React, { useState } from 'react';
import './gpa_cgpa.css';

const SEMESTER_DATA = {
  1: {
    semLabel: 'Semester 01 (SGPA: 3.82)',
    shortLabel: 'Sem 01',
    sgpa: 3.82,
    totalCredits: 5,
    modules: [
      {
        code: 'ICT11012',
        title: 'Foundation of Information Technology',
        credits: 2,
        caMark: 36,
        esaMark: 48,
        finalMark: 84,
        grade: 'A',
        gradePoint: 4.00,
        qualityPoints: 8.00
      },
      {
        code: 'ICT11023',
        title: 'Structured Programming Fundamentals',
        credits: 3,
        caMark: 34,
        esaMark: 42,
        finalMark: 76,
        grade: 'A-',
        gradePoint: 3.70,
        qualityPoints: 11.10
      }
    ]
  },
  2: {
    semLabel: 'Semester 02 (SGPA: 3.65)',
    shortLabel: 'Sem 02',
    sgpa: 3.65,
    totalCredits: 6,
    modules: [
      {
        code: 'ICT12013',
        title: 'Object Oriented Programming',
        credits: 3,
        caMark: 35,
        esaMark: 45,
        finalMark: 80,
        grade: 'A',
        gradePoint: 4.00,
        qualityPoints: 12.00
      },
      {
        code: 'ICT12023',
        title: 'Mathematics for Computing',
        credits: 3,
        caMark: 30,
        esaMark: 41,
        finalMark: 71,
        grade: 'B+',
        gradePoint: 3.30,
        qualityPoints: 9.90
      }
    ]
  },
  3: {
    semLabel: 'Semester 03 (SGPA: 3.64)',
    shortLabel: 'Sem 03',
    sgpa: 3.64,
    totalCredits: 8,
    modules: [
      {
        code: 'ICT21013',
        title: 'Data Structures and Algorithms',
        credits: 3,
        caMark: 36,
        esaMark: 46,
        finalMark: 82,
        grade: 'A',
        gradePoint: 4.00,
        qualityPoints: 12.00
      },
      {
        code: 'ICT21023',
        title: 'Database Management Systems',
        credits: 3,
        caMark: 33,
        esaMark: 43,
        finalMark: 76,
        grade: 'A-',
        gradePoint: 3.70,
        qualityPoints: 11.10
      },
      {
        code: 'ICT21032',
        title: 'Computer Organization & Architecture',
        credits: 2,
        caMark: 28,
        esaMark: 39,
        finalMark: 67,
        grade: 'B',
        gradePoint: 3.00,
        qualityPoints: 6.00
      }
    ]
  },
  4: {
    semLabel: 'Semester 04 (SGPA: 3.50)',
    shortLabel: 'Sem 04',
    sgpa: 3.50,
    totalCredits: 6,
    modules: [
      {
        code: 'ICT22013',
        title: 'Software Engineering & Design',
        credits: 3,
        caMark: 34,
        esaMark: 44,
        finalMark: 78,
        grade: 'A-',
        gradePoint: 3.70,
        qualityPoints: 11.10
      },
      {
        code: 'ICT22023',
        title: 'Operating Systems & System Admin',
        credits: 3,
        caMark: 32,
        esaMark: 40,
        finalMark: 72,
        grade: 'B+',
        gradePoint: 3.30,
        qualityPoints: 9.90
      }
    ]
  },
  5: {
    semLabel: 'Semester 05 (SGPA: 3.50)',
    shortLabel: 'Sem 05',
    sgpa: 3.50,
    totalCredits: 18,
    modules: [
      {
        code: 'ICT22011',
        title: 'Web Application Development',
        credits: 3,
        caMark: 36,
        esaMark: '—',
        finalMark: 36,
        grade: 'Pending',
        gradePoint: 3.70,
        qualityPoints: 11.10
      },
      {
        code: 'ICT22043',
        title: 'Mobile Application Development',
        credits: 3,
        caMark: 34,
        esaMark: '—',
        finalMark: 34,
        grade: 'Pending',
        gradePoint: 3.30,
        qualityPoints: 9.90
      },
      {
        code: 'ICT31013',
        title: 'Computer Networks & Security',
        credits: 3,
        caMark: 35,
        esaMark: '—',
        finalMark: 35,
        grade: 'Pending',
        gradePoint: 3.70,
        qualityPoints: 11.10
      },
      {
        code: 'ICT31023',
        title: 'Enterprise Architecture & Cloud Systems',
        credits: 3,
        caMark: 32,
        esaMark: '—',
        finalMark: 32,
        grade: 'Pending',
        gradePoint: 3.00,
        qualityPoints: 9.00
      },
      {
        code: 'ICT31032',
        title: 'Advanced Database Systems',
        credits: 3,
        caMark: 37,
        esaMark: '—',
        finalMark: 37,
        grade: 'Pending',
        gradePoint: 4.00,
        qualityPoints: 12.00
      },
      {
        code: 'ICT31043',
        title: 'Human Computer Interaction (HCI)',
        credits: 3,
        caMark: 35,
        esaMark: '—',
        finalMark: 35,
        grade: 'Pending',
        gradePoint: 3.70,
        qualityPoints: 11.10
      }
    ]
  }
};

// Safe number formatting helper that never throws TypeError: .toFixed is not a function
const safeToFixed = (val, decimals = 2, fallback = '—') => {
  if (val === null || val === undefined || val === '' || val === '—' || val === 'N/A') return fallback;
  const num = typeof val === 'number' ? val : Number(val);
  return Number.isFinite(num) ? num.toFixed(decimals) : fallback;
};

export default function StudentGpaCgpa({ user }) {
  const [activeSem, setActiveSem] = useState(1);

  const semStr = (user?.semester || user?.academicYear || '').toLowerCase();
  const isFreshers = Boolean(
    user?.isFreshers ||
    semStr.includes('sem 1') ||
    semStr.includes('sem 01') ||
    semStr.includes('semester 1') ||
    semStr.includes('semester 01') ||
    semStr.includes('1st sem') ||
    semStr.includes('fresh') ||
    (semStr.includes('year 1') && !semStr.includes('sem 2') && !semStr.includes('semester 2'))
  );

  const candidateName = user?.name || (isFreshers ? 'Fresh Undergraduate' : 'Mushan M.M.B. (Afnan)');
  const regNo = user?.regNo || (isFreshers ? '24ICT001' : '22ICT091');
  const indexNo = user?.indexNo || (isFreshers ? 'ICT24001' : 'ICT22091');
  const programme = user?.programme ? `${user.programme} (Hons)` : 'BICT (Hons)';
  const specialization = user?.specialization || 'Software Systems';

  const rawCgpa = user?.cgpa !== undefined && user?.cgpa !== null ? user.cgpa : 3.58;
  const displayCgpa = isFreshers ? 'N/A' : safeToFixed(rawCgpa, 2, '3.58');
  const currentSemesterObj = SEMESTER_DATA[activeSem] || SEMESTER_DATA[1] || { modules: [] };
  const displaySgpa = isFreshers ? 'N/A' : safeToFixed(currentSemesterObj?.sgpa, 2, 'N/A');
  const displayStanding = isFreshers ? 'Enrolled (In Progress)' : 'Second Class (Upper Division)';
  const displayCredits = isFreshers ? '0 / 130 Credits' : '78 / 130 Credits';
  const displayCompletion = isFreshers ? '0%' : '60%';

  const handlePrint = () => {
    window.print();
  };

  const getGradeBadgeClass = (grade) => {
    if (grade.startsWith('A')) return 'gpa-badge gpa-badge-a';
    if (grade.startsWith('B')) return 'gpa-badge gpa-badge-b';
    if (grade.startsWith('C')) return 'gpa-badge gpa-badge-c';
    return 'gpa-badge gpa-badge-pending';
  };

  return (
    <div className="gpa-page-container">
      {/* 1. Page Header with Print Button */}
      <div className="page-header gpa-header-row">
        <div>
          <h1>Academic Performance & GPA Report</h1>
          <p>Credit-weighted SGPA and CGPA computation following South Eastern University of Sri Lanka Technology Faculty regulations.</p>
        </div>
        <div>
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-primary-dark btn-sm btn-print-gpa"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print Official GPA Report
          </button>
        </div>
      </div>

      {/* 2. Main Institutional Document Card */}
      <section className="seu-card gpa-main-card">
        {/* Document Header */}
        <div className="gpa-doc-topbar">
          <div className="gpa-doc-uni">
            SOUTH EASTERN UNIVERSITY OF SRI LANKA · FACULTY OF TECHNOLOGY
          </div>
          <div className="gpa-doc-meta-right">
            <div>Academic Session: <strong>2025/2026</strong></div>
            <div>Issue Date: <strong>10/22/2026</strong></div>
          </div>
        </div>

        <h2 className="gpa-doc-title">ACADEMIC PERFORMANCE REPORT</h2>

        {/* Student Meta Details Strip */}
        <div className="gpa-student-strip">
          <div>Student Name: <strong>{candidateName}</strong></div>
          <div>Registration No: <strong>{regNo}</strong></div>
          <div>Index No: <strong>{indexNo}</strong></div>
          <div>Degree Programme: <strong>{programme}</strong></div>
          <div>Specialization: <strong>{specialization}</strong></div>
        </div>

        {isFreshers && (
          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.3rem' }}>ℹ️</span>
            <div>
              <strong style={{ color: '#0f2b5c', fontSize: '0.88rem' }}>Freshers Academic Progression (Year 1 Semester 1):</strong>
              <p style={{ margin: '2px 0 0', color: '#475569', fontSize: '0.82rem' }}>
                Freshers enrolled in Semester 1 do not have a GPA recorded yet as examinations are in progress. Your initial Semester GPA (SGPA) will be computed and published upon completion and Senate moderation of Semester 1 courses.
              </p>
            </div>
          </div>
        )}

        {/* 3. Top 4 Metric Stat Cards */}
        <div className="gpa-stats-grid">
          {/* SEMESTER SGPA */}
          <div className="gpa-stat-box">
            <span className="gpa-stat-title">SEMESTER SGPA</span>
            <div className="gpa-stat-val val-blue">{displaySgpa}</div>
            <span className="gpa-stat-sub">{isFreshers ? 'Pending Semester 1 Exams' : `${currentSemesterObj.shortLabel} Performance`}</span>
          </div>

          {/* CUMULATIVE CGPA */}
          <div className="gpa-stat-box">
            <span className="gpa-stat-title">CUMULATIVE CGPA</span>
            <div className="gpa-stat-val val-amber">{displayCgpa}</div>
            <span className="gpa-stat-sub">{isFreshers ? 'Pending Senate Release' : 'Across all semesters'}</span>
          </div>

          {/* ESTIMATED DEGREE CLASS */}
          <div className="gpa-stat-box">
            <span className="gpa-stat-title">ESTIMATED DEGREE CLASS</span>
            <div className="gpa-stat-val val-green class-text">{displayStanding}</div>
            <span className="gpa-stat-sub">Based on university cutoffs</span>
          </div>

          {/* DEGREE COMPLETION */}
          <div className="gpa-stat-box">
            <span className="gpa-stat-title">DEGREE COMPLETION</span>
            <div className="gpa-stat-val val-blue">{displayCompletion}</div>
            <span className="gpa-stat-sub">{displayCredits}</span>
          </div>
        </div>

        {/* 4. Semester Navigation Pill Tabs */}
        <div className="gpa-sem-nav-row">
          {[1, 2, 3, 4, 5].map((sem) => (
            <button
              key={sem}
              type="button"
              className={`gpa-sem-tab ${activeSem === sem ? 'active' : ''}`}
              onClick={() => setActiveSem(sem)}
            >
              {SEMESTER_DATA[sem]?.semLabel || `Sem 0${sem}`}
            </button>
          ))}
        </div>

        {/* 5. Semester Modules Table */}
        <div className="table-responsive">
          <table className="seu-table gpa-table">
            <thead>
              <tr>
                <th>COURSE CODE</th>
                <th>COURSE TITLE</th>
                <th>CREDITS</th>
                <th>CA MARK</th>
                <th>ESA MARK</th>
                <th>FINAL MARK</th>
                <th>GRADE</th>
                <th>GRADE POINT</th>
                <th>QUALITY POINTS (CR × GP)</th>
              </tr>
            </thead>
            <tbody>
              {(currentSemesterObj?.modules || []).map((mod) => (
                <tr key={mod.code}>
                  <td className="gpa-cell-code">
                    <strong>{mod.code}</strong>
                  </td>
                  <td className="gpa-cell-title">{mod.title}</td>
                  <td className="gpa-cell-credits">{mod.credits}</td>
                  <td className="gpa-cell-ca">{mod.caMark}</td>
                  <td className="gpa-cell-esa">{mod.esaMark}</td>
                  <td className="gpa-cell-final">
                    <strong>{mod.finalMark}</strong>
                  </td>
                  <td className="gpa-cell-grade">
                    <span className={getGradeBadgeClass(mod.grade || '')}>
                      {mod.grade}
                    </span>
                  </td>
                  <td className="gpa-cell-gp">{safeToFixed(mod?.gradePoint, 2, '—')}</td>
                  <td className="gpa-cell-qp">
                    <strong>{safeToFixed(mod?.qualityPoints, 2, '—')}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 6. Semester Summary Footer */}
        <div className="gpa-table-footer">
          <div className="gpa-footer-total-credits">
            <span>Semester Total:</span>
            <strong>{currentSemesterObj?.totalCredits || 0} Credits</strong>
          </div>
          <div className="gpa-footer-sgpa">
            <span>Semester GPA (SGPA):</span>
            <strong>{isFreshers ? 'N/A' : safeToFixed(currentSemesterObj?.sgpa, 2, 'N/A')}</strong>
          </div>
        </div>

        {/* 7. Institutional Regulation Disclaimer */}
        <div className="gpa-regulation-footer">
          <strong>GPA Calculation Regulation:</strong> SGPA = &Sigma;(Credit &times; Grade Point) / &Sigma;(Credit). Degree class determination criteria: First Class (CGPA &ge; 3.70, no repeats), Second Class Upper (CGPA &ge; 3.30), Second Class Lower (CGPA &ge; 3.00), Pass (CGPA &ge; 2.00). This transcript is generated internally by SEUConnect.
        </div>
      </section>

      {/* ====================================================================
          PRINT-ONLY OFFICIAL ACADEMIC REPORT
          ==================================================================== */}
      <div className="printable-gpa-slip" aria-hidden="true">
        <div className="print-gpa-header">
          <div className="print-gpa-uni">SOUTH EASTERN UNIVERSITY OF SRI LANKA</div>
          <div className="print-gpa-fac">FACULTY OF TECHNOLOGY · OFFICE OF THE DEAN</div>
          <div className="print-gpa-docname">OFFICIAL ACADEMIC PERFORMANCE & GPA REPORT</div>
        </div>

        <div className="print-gpa-meta">
          <div><strong>Candidate Name:</strong> {candidateName}</div>
          <div><strong>Registration No:</strong> {regNo}</div>
          <div><strong>Index No:</strong> {indexNo}</div>
          <div><strong>Degree Programme:</strong> {programme}</div>
          <div><strong>Specialization:</strong> {specialization}</div>
          <div><strong>Academic Session:</strong> 2025/2026</div>
        </div>

        <div className="print-gpa-summary-bar">
          <div><strong>Selected Semester:</strong> {currentSemesterObj.shortLabel}</div>
          <div><strong>Semester SGPA:</strong> {displaySgpa}</div>
          <div><strong>Cumulative CGPA:</strong> {displayCgpa}</div>
          <div><strong>Degree Standing:</strong> {displayStanding}</div>
        </div>

        <table className="print-gpa-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Course Code</th>
              <th>Course Title</th>
              <th>Credits</th>
              <th>CA</th>
              <th>ESA</th>
              <th>Final</th>
              <th>Grade</th>
              <th>GP</th>
              <th>QP</th>
            </tr>
          </thead>
          <tbody>
            {(currentSemesterObj?.modules || []).map((mod, idx) => (
              <tr key={mod.code}>
                <td>{idx + 1}</td>
                <td><strong>{mod.code}</strong></td>
                <td>{mod.title}</td>
                <td>{mod.credits}</td>
                <td>{mod.caMark}</td>
                <td>{mod.esaMark}</td>
                <td>{mod.finalMark}</td>
                <td><strong>{mod.grade}</strong></td>
                <td>{safeToFixed(mod?.gradePoint, 2, '—')}</td>
                <td>{safeToFixed(mod?.qualityPoints, 2, '—')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="print-gpa-signatures">
          <div className="print-sign-box">
            <div className="print-sign-line"></div>
            <div>Head of Department / ICT</div>
          </div>
          <div className="print-sign-box">
            <div className="print-sign-line"></div>
            <div>Dean / Faculty of Technology</div>
          </div>
        </div>
      </div>
    </div>
  );
}
