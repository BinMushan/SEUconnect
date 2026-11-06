import React, { useState, useMemo } from 'react';
import { getCurriculumBySemester } from '../../src/services/curriculumData.js';
import { resultsPipelineService } from '../../src/services/resultsPipelineService.js';
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

  const isDefaultDemo =
    user?.email === 'student@gmail.com' ||
    user?.regNo === '22ICT085' ||
    user?.regNo === '22ICT091' ||
    (!isFreshers && (user?.name || '').includes('Afnan'));

  const getSemesterNumber = (semName) => {
    const s = String(semName || '').toLowerCase();
    if (s.includes('sem 1') || s.includes('semester 1') || s.includes('sem 01') || s.includes('1st sem')) return 1;
    if (s.includes('sem 2') || s.includes('semester 2') || s.includes('sem 02') || s.includes('2nd sem')) return 2;
    if (s.includes('sem 3') || s.includes('semester 3') || s.includes('sem 03') || s.includes('3rd sem')) return 3;
    if (s.includes('sem 4') || s.includes('semester 4') || s.includes('sem 04') || s.includes('4th sem')) return 4;
    if (s.includes('sem 5') || s.includes('semester 5') || s.includes('sem 05') || s.includes('5th sem')) return 5;
    if (s.includes('sem 6') || s.includes('semester 6') || s.includes('sem 06') || s.includes('6th sem')) return 6;
    if (s.includes('sem 7') || s.includes('semester 7') || s.includes('sem 07') || s.includes('7th sem')) return 7;
    if (s.includes('sem 8') || s.includes('semester 8') || s.includes('sem 08') || s.includes('8th sem')) return 8;
    return 1;
  };

  const studentSemNum = isFreshers ? 1 : getSemesterNumber(user?.semester || user?.academicYear);
  const maxSemTabs = isFreshers ? 1 : (isDefaultDemo ? 5 : studentSemNum);
  const availableTabs = Array.from({ length: Math.max(1, maxSemTabs) }, (_, i) => i + 1);

  const candidateName = user?.name || (isFreshers ? 'Fresh Undergraduate' : 'Mushan M.M.B. (Afnan)');
  const regNo = user?.regNo || (isFreshers ? '24ICT001' : '22ICT091');
  const indexNo = user?.indexNo || (isFreshers ? 'ICT24001' : 'ICT22091');
  const programme = user?.programme ? `${user.programme} (Hons)` : 'BICT (Hons)';
  const specialization = user?.specialization || 'Software Systems';

  const currentSemesterObj = useMemo(() => {
    // 1. If demo account and we have historical data in SEMESTER_DATA
    if (isDefaultDemo && SEMESTER_DATA[activeSem]) {
      return SEMESTER_DATA[activeSem];
    }

    // 2. Check live pipeline moderation results
    const semCurriculum = getCurriculumBySemester(`Semester ${activeSem}`);
    const curriculumSubjects = semCurriculum?.subjects || [];

    const yrNum = Math.ceil(activeSem / 2);
    const semNumInYr = ((activeSem - 1) % 2) + 1;
    const publishedPipeline = resultsPipelineService.getStudentSemesterResults(
      regNo,
      `Year ${yrNum} Semester ${semNumInYr}`
    );

    if (publishedPipeline && publishedPipeline.isPublished && publishedPipeline.courses && publishedPipeline.courses.length > 0) {
      return {
        semLabel: `Semester 0${activeSem} (SGPA: ${safeToFixed(publishedPipeline.sgpa, 2, '—')})`,
        shortLabel: `Sem 0${activeSem}`,
        sgpa: publishedPipeline.sgpa,
        totalCredits: publishedPipeline.totalCredits || 17,
        modules: publishedPipeline.courses.map((c) => ({
          code: c.code,
          title: c.title,
          credits: c.credits,
          caMark: c.caMark ?? '—',
          esaMark: c.esaMark ?? '—',
          finalMark: c.finalMark ?? '—',
          grade: c.grade || 'Pending',
          gradePoint: c.gradePoint,
          qualityPoints: c.qualityPoints,
        })),
      };
    }

    // 3. Current active semester or fresher semester in progress
    const enrolledList = (user?.enrolledCourses && user.enrolledCourses.length > 0)
      ? user.enrolledCourses
      : curriculumSubjects;

    return {
      semLabel: `Semester 0${activeSem} (${isFreshers ? 'Enrolled / In Progress' : 'In Progress'})`,
      shortLabel: `Sem 0${activeSem}`,
      sgpa: null,
      totalCredits: enrolledList.reduce((sum, s) => sum + (Number(s.credits) || 0), 0) || 17,
      isInProgress: true,
      modules: enrolledList.map((s) => ({
        code: s.code || s.rawCode || 'MOD',
        title: s.title || s.name || 'Course Module',
        credits: Number(s.credits) || 2,
        caMark: '—',
        esaMark: '—',
        finalMark: '—',
        grade: 'In Progress',
        gradePoint: null,
        qualityPoints: null,
      })),
    };
  }, [activeSem, isDefaultDemo, isFreshers, regNo, user]);

  const rawCgpa = user?.cgpa !== undefined && user?.cgpa !== null ? user.cgpa : (isDefaultDemo ? 3.58 : null);
  const displayCgpa = isFreshers || rawCgpa === null ? 'N/A' : safeToFixed(rawCgpa, 2, 'N/A');
  const displaySgpa = isFreshers || currentSemesterObj?.sgpa === null ? 'N/A' : safeToFixed(currentSemesterObj?.sgpa, 2, 'N/A');
  const displayStanding = isFreshers || displayCgpa === 'N/A'
    ? 'Enrolled (In Progress)'
    : Number(displayCgpa) >= 3.70
      ? 'First Class Standing'
      : Number(displayCgpa) >= 3.30
        ? 'Second Class (Upper Division)'
        : 'General Pass';
  const displayCredits = isFreshers
    ? '0 / 130 Credits'
    : user?.credits !== undefined && user?.credits !== null
      ? `${user.credits} / 130 Credits`
      : isDefaultDemo
        ? '78 / 130 Credits'
        : '0 / 130 Credits';
  const displayCompletion = isFreshers
    ? '0%'
    : user?.credits !== undefined && user?.credits !== null
      ? `${Math.min(100, Math.round((Number(user.credits) / 130) * 100))}%`
      : isDefaultDemo
        ? '60%'
        : '0%';

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
          {availableTabs.map((sem) => (
            <button
              key={sem}
              type="button"
              className={`gpa-sem-tab ${activeSem === sem ? 'active' : ''}`}
              onClick={() => setActiveSem(sem)}
            >
              {isDefaultDemo ? (SEMESTER_DATA[sem]?.semLabel || `Sem 0${sem}`) : `Semester 0${sem}`}
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
