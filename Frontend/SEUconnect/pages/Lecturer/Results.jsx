import React, { useState } from 'react';
import ConfirmModal from './components/ConfirmModal.jsx';
import { INITIAL_SUBJECTS, ENROLLED_STUDENTS, calculateSEUSLGrade, getStoredCustomCAs, getStoredMarks } from './lecturerMockData.js';

const safeToFixed = (val, decimals = 1, fallback = '—') => {
  if (val === null || val === undefined || val === '' || val === '—' || val === 'N/A') return fallback;
  const num = typeof val === 'number' ? val : Number(val);
  return Number.isFinite(num) ? num.toFixed(decimals) : fallback;
};

/**
 * Results component
 * Results & Grading Management with:
 * - Status Lifecycle: Draft -> Submitted -> Finalized
 * - Form locking when Submitted / Finalized
 * - Official SEUSL Grade Scale mapping
 * - Submission guard verifying all student entries before ConfirmModal prompt
 */
// Official SEUSL Academic Grading Scale Structure
const SEUSL_SCALE_TIERS = [
  {
    tierKey: 'A',
    tierLabel: 'Tier A',
    subtitle: 'Distinction / V.Good',
    gpRange: '3.70 – 4.00 GP',
    accentColor: 'tier-a',
    grades: [
      { letter: 'A+', mark: '≥ 85', gp: '4.0', remark: 'Distinction' },
      { letter: 'A', mark: '≥ 78', gp: '4.0', remark: 'Excellent' },
      { letter: 'A-', mark: '≥ 72', gp: '3.7', remark: 'Very Good' },
    ],
  },
  {
    tierKey: 'B',
    tierLabel: 'Tier B',
    subtitle: 'Good / Credit',
    gpRange: '2.70 – 3.30 GP',
    accentColor: 'tier-b',
    grades: [
      { letter: 'B+', mark: '≥ 67', gp: '3.3', remark: 'Good' },
      { letter: 'B', mark: '≥ 61', gp: '3.0', remark: 'Satisfactory' },
      { letter: 'B-', mark: '≥ 56', gp: '2.7', remark: 'Pass' },
    ],
  },
  {
    tierKey: 'C',
    tierLabel: 'Tier C',
    subtitle: 'Pass / Marginal',
    gpRange: '1.70 – 2.30 GP',
    accentColor: 'tier-c',
    grades: [
      { letter: 'C+', mark: '≥ 51', gp: '2.3', remark: 'Pass' },
      { letter: 'C', mark: '≥ 47', gp: '2.0', remark: 'Pass' },
      { letter: 'C-', mark: '≥ 42', gp: '1.7', remark: 'Conditional' },
    ],
  },
  {
    tierKey: 'DE',
    tierLabel: 'Tier D & E',
    subtitle: 'Remedial / Fail',
    gpRange: '0.00 – 1.00 GP',
    accentColor: 'tier-de',
    grades: [
      { letter: 'D', mark: '≥ 37', gp: '1.0', remark: 'Poor Pass' },
      { letter: 'E', mark: '< 37', gp: '0.0', remark: 'Fail' },
    ],
  },
];

export default function Results({ subjects = INITIAL_SUBJECTS, initialSubjectCode = 'SWT22022', onShowToast }) {
  const availableSubjects = Array.isArray(subjects) ? subjects : [];
  const defaultCode = availableSubjects[0]?.code || initialSubjectCode;
  const [selectedSubject, setSelectedSubject] = useState(defaultCode);

  useEffect(() => {
    if (availableSubjects.length > 0 && !availableSubjects.some((s) => s.code === selectedSubject)) {
      setSelectedSubject(availableSubjects[0].code);
    }
  }, [availableSubjects, selectedSubject]);
  const [lifecycleStatus, setLifecycleStatus] = useState('Draft'); // 'Draft', 'Submitted', 'Finalized'
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Student scores table (dynamically incorporates all default and custom CAs)
  const [studentGrades, setStudentGrades] = useState(() => {
    const customCAs = getStoredCustomCAs();
    const storedMarks = getStoredMarks();
    return ENROLLED_STUDENTS.map((st) => {
      const caKeys = ['ca1', 'ca2', ...customCAs.map((c) => c.id)];
      let caSum = 0;
      let caCount = 0;
      caKeys.forEach((k) => {
        const val = storedMarks?.[st.regNo]?.[k] ?? st[k];
        if (val !== undefined && val !== '' && !isNaN(Number(val))) {
          caSum += Number(val);
          caCount++;
        }
      });
      const caAvg = caCount > 0 ? caSum / caCount : ((st.ca1 || 0) + (st.ca2 || 0)) / 2;
      const esaVal = Number(storedMarks?.[st.regNo]?.esa ?? st.esa ?? 0);
      const compositeMark = Math.round(caAvg * 0.4 + esaVal * 0.6);
      const gradeObj = calculateSEUSLGrade(compositeMark);
      return {
        ...st,
        caAvg: Math.round(caAvg * 10) / 10,
        esa: esaVal,
        compositeMark,
        grade: gradeObj.grade,
        gpa: gradeObj.gpa,
        remark: gradeObj.remark,
      };
    });
  });

  const isLocked = lifecycleStatus === 'Submitted' || lifecycleStatus === 'Finalized';

  // Handle single student composite mark adjustment while in Draft
  const handleScoreChange = (regNo, newScore) => {
    if (isLocked) return;
    const num = Math.min(100, Math.max(0, Number(newScore) || 0));
    const gradeObj = calculateSEUSLGrade(num);

    setStudentGrades((prev) =>
      prev.map((s) =>
        s.regNo === regNo
          ? {
              ...s,
              compositeMark: num,
              grade: gradeObj.grade,
              gpa: gradeObj.gpa,
              remark: gradeObj.remark,
            }
          : s
      )
    );
  };

  // Pre-submission guard: Check if any student has an invalid or empty score
  const handleInitiateSubmission = () => {
    if (isLocked) return;

    const hasIncomplete = studentGrades.some(
      (s) => s.compositeMark === undefined || s.compositeMark === null || s.compositeMark === ''
    );

    if (hasIncomplete) {
      if (onShowToast) {
        onShowToast('Cannot submit: One or more students have missing composite marks.', 'error');
      }
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSubmission = () => {
    setShowConfirmModal(false);
    setLifecycleStatus('Submitted');
    if (onShowToast) {
      onShowToast(
        `Final marks for ${selectedSubject} submitted to Examination Branch. Form is now locked.`,
        'success'
      );
    }
  };

  // Distribution counts and cohort statistics
  const totalStudents = studentGrades.length;
  const gradeDistribution = {
    A: studentGrades.filter((s) => s.grade.startsWith('A')).length,
    B: studentGrades.filter((s) => s.grade.startsWith('B')).length,
    C: studentGrades.filter((s) => s.grade.startsWith('C')).length,
    D: studentGrades.filter((s) => s.grade === 'D').length,
    E: studentGrades.filter((s) => s.grade === 'E').length,
  };

  const passingStudents = studentGrades.filter((s) => s.grade !== 'E').length;
  const passRate = totalStudents > 0 ? Math.round((passingStudents / totalStudents) * 100) : 0;

  const cohortTiers = [
    {
      key: 'A',
      tierLabel: 'Tier A',
      gradeSub: 'A+, A, A-',
      count: gradeDistribution.A,
      pct: totalStudents > 0 ? ((gradeDistribution.A / totalStudents) * 100).toFixed(1) : '0.0',
      theme: 'tier-a',
    },
    {
      key: 'B',
      tierLabel: 'Tier B',
      gradeSub: 'B+, B, B-',
      count: gradeDistribution.B,
      pct: totalStudents > 0 ? ((gradeDistribution.B / totalStudents) * 100).toFixed(1) : '0.0',
      theme: 'tier-b',
    },
    {
      key: 'C',
      tierLabel: 'Tier C',
      gradeSub: 'C+, C, C-',
      count: gradeDistribution.C,
      pct: totalStudents > 0 ? ((gradeDistribution.C / totalStudents) * 100).toFixed(1) : '0.0',
      theme: 'tier-c',
    },
    {
      key: 'D',
      tierLabel: 'Tier D',
      gradeSub: 'Conditional',
      count: gradeDistribution.D,
      pct: totalStudents > 0 ? ((gradeDistribution.D / totalStudents) * 100).toFixed(1) : '0.0',
      theme: 'tier-d',
    },
    {
      key: 'E',
      tierLabel: 'Tier E',
      gradeSub: 'Fail (< 37)',
      count: gradeDistribution.E,
      pct: totalStudents > 0 ? ((gradeDistribution.E / totalStudents) * 100).toFixed(1) : '0.0',
      theme: 'tier-e',
    },
  ];

  if (availableSubjects.length === 0) {
    return (
      <div className="lec-results-container">
        <div className="lec-module-header-card">
          <div>
            <h2 className="lec-module-title">Results & Grade Scale Management</h2>
            <p className="lec-module-sub">
              Calculate composite marks, map to official SEUSL grade scales, and finalize results for Faculty Examination Board review.
            </p>
          </div>
        </div>
        <div className="lec-empty-state-card" style={{ padding: '60px 24px', background: '#fff', borderRadius: '14px', border: '1px dashed #cbd5e1', textAlign: 'center', margin: '24px 0' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" style={{ margin: '0 auto 12px', display: 'block' }}>
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>No Subjects Allocated</h4>
          <p style={{ color: '#64748b', maxWidth: '440px', margin: '0 auto 16px', lineHeight: 1.5 }}>
            You currently have no course modules allocated for results and grading submission. When courses are assigned to you by your Head of Department (HOD), grading ledgers will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lec-results-container">
      {/* 1. Header Card */}
      <div className="lec-module-header-card">
        <div>
          <h2 className="lec-module-title">Results & Grade Scale Management</h2>
          <p className="lec-module-sub">
            Calculate composite marks, map to official SEUSL grade scales, and finalize results for Faculty Examination Board review.
          </p>
        </div>

        {/* Status Lifecycle Indicator */}
        <div className="lec-lifecycle-tracker">
          <div className={`lifecycle-step ${lifecycleStatus === 'Draft' ? 'active' : 'completed'}`}>
            <span className="step-circle">1</span>
            <span className="step-name">Draft</span>
          </div>
          <div className="lifecycle-connector"></div>
          <div
            className={`lifecycle-step ${
              lifecycleStatus === 'Submitted'
                ? 'active'
                : lifecycleStatus === 'Finalized'
                ? 'completed'
                : 'pending'
            }`}
          >
            <span className="step-circle">2</span>
            <span className="step-name">Submitted</span>
          </div>
          <div className="lifecycle-connector"></div>
          <div className={`lifecycle-step ${lifecycleStatus === 'Finalized' ? 'active' : 'pending'}`}>
            <span className="step-circle">3</span>
            <span className="step-name">Finalized</span>
          </div>
        </div>
      </div>

      {/* 2. Controls & Locking Banner */}
      <div className="lec-attendance-filter-bar">
        <div className="filter-group">
          <label className="filter-label">Course Module:</label>
          <select
            className="lec-select"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            {availableSubjects.map((sub) => (
              <option key={sub.code} value={sub.code}>
                {sub.code} — {sub.name} ({sub.semester}{sub.batch ? ` • Batch ${sub.batch}` : ''})
              </option>
            ))}
          </select>
        </div>

        <div className="lec-results-action-buttons">
          {!isLocked ? (
            <button
              type="button"
              className="lec-btn-submit-grades"
              onClick={handleInitiateSubmission}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Submit Results to Examination Branch
            </button>
          ) : (
            <div className="lec-locked-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Ledger Locked ({lifecycleStatus})</span>
            </div>
          )}
        </div>
      </div>

      {/* Form Locking Alert */}
      {isLocked && (
        <div className="lec-locked-info-banner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div>
            <strong>Form Editing Disabled:</strong> Results have been officially{' '}
            <span className="font-bold underline">{lifecycleStatus}</span> to the Faculty Examination Board.
            Modifications or grade amendments require formal written authorization from the Dean and Senior Assistant Registrar (Examinations).
          </div>
        </div>
      )}

      {/* 3. Distribution Metrics & Grade Scale Legend */}
      <div className="lec-grade-overview-grid">
        {/* Cohort Grade Distribution Card */}
        <div className="lec-distribution-card">
          <div className="lec-card-header-row">
            <div>
              <h4 className="dist-title">Cohort Grade Distribution</h4>
              <p className="lec-card-header-sub">Performance tier spread for active course module</p>
            </div>
            <div className="lec-cohort-badge-pill">
              <span className="lec-badge-accent-dot"></span>
              <span className="lec-badge-text">{totalStudents} Enrolled</span>
              <span className="lec-badge-divider">•</span>
              <span className="lec-badge-passrate">{passRate}% Pass Rate</span>
            </div>
          </div>

          {/* Segmented Distribution Bar */}
          <div className="lec-cohort-bar-wrapper">
            <div className="lec-cohort-bar-track" aria-label="Cohort grade tier distribution">
              {cohortTiers.map((t) => {
                const widthPct = Number(t.pct);
                if (widthPct <= 0) return null;
                return (
                  <div
                    key={t.key}
                    className={`lec-cohort-bar-seg seg-${t.theme}`}
                    style={{ width: `${widthPct}%` }}
                    title={`${t.tierLabel} (${t.gradeSub}): ${t.count} students (${t.pct}%)`}
                  />
                );
              })}
            </div>
          </div>

          {/* Tier Cards Row */}
          <div className="dist-tiers-grid">
            {cohortTiers.map((t) => (
              <div key={t.key} className={`dist-tier-card ${t.theme}`}>
                <div className="dist-tier-top">
                  <span className="dist-tier-pill">{t.tierLabel}</span>
                  <span className="dist-tier-sub">{t.gradeSub}</span>
                </div>
                <div className="dist-tier-center">
                  <span className="dist-tier-count">{t.count}</span>
                  <span className="dist-tier-pct">{t.pct}%</span>
                </div>
                <div className="dist-tier-foot">
                  <span className="dist-tier-caption">of cohort</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SEUSL Grade Scale Mapping Reference Card */}
        <div className="lec-scale-reference-card">
          <div className="lec-card-header-row">
            <div>
              <h4 className="scale-title">SEUSL Standard Academic Grading Scale</h4>
              <p className="lec-card-header-sub">Official Faculty of Technology GPA & mark thresholds</p>
            </div>
            <div className="scale-legend-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span>11 Grades Scale</span>
            </div>
          </div>

          <div className="scale-tiers-grid">
            {SEUSL_SCALE_TIERS.map((tier) => (
              <div key={tier.tierKey} className={`scale-tier-col ${tier.accentColor}`}>
                <div className="scale-tier-col-header">
                  <div className="scale-tier-badge-row">
                    <span className="scale-tier-badge">{tier.tierLabel}</span>
                    <span className="scale-tier-gp">{tier.gpRange}</span>
                  </div>
                  <span className="scale-tier-desc">{tier.subtitle}</span>
                </div>

                <div className="scale-grade-list">
                  {tier.grades.map((g) => (
                    <div key={g.letter} className="scale-grade-row">
                      <span className={`scale-grade-pill grade-${g.letter.toLowerCase().replace('+', '-plus').replace('-', '-minus')}`}>
                        {g.letter}
                      </span>
                      <div className="scale-grade-meta">
                        <span className="scale-grade-mark">{g.mark}</span>
                        <span className="scale-grade-remark">{g.remark}</span>
                      </div>
                      <span className="scale-grade-gp-val">{g.gp} GP</span>
                    </div>
                  ))}
                  {tier.tierKey === 'DE' && (
                    <div className="scale-repeat-notice">
                      <span>E &lt; 37 Repeat Required</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Results Ledger Table */}
      <div className="lec-results-table-card">
        <div className="lec-table-scroll-container">
          <table className="lec-custom-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>Registration No</th>
                <th>Student Full Name</th>
                <th>CA Average (40%)</th>
                <th>ESA (60%)</th>
                <th style={{ width: '150px' }}>Composite Score</th>
                <th>Letter Grade</th>
                <th>Grade Point (GP)</th>
                <th>Academic Remark</th>
              </tr>
            </thead>
            <tbody>
              {studentGrades.map((st, idx) => {
                const isPassing = st.grade !== 'E';
                return (
                  <tr key={st.regNo}>
                    <td className="text-muted">{idx + 1}</td>
                    <td>
                      <span className="lec-regno-pill">{st.regNo}</span>
                    </td>
                    <td>
                      <span className="lec-student-name">{st.name}</span>
                    </td>
                    <td>{st.caAvg !== undefined ? st.caAvg : Math.round(((st.ca1 || 0) + (st.ca2 || 0)) / 2)} / 100</td>
                    <td>{st.esa} / 100</td>
                    <td>
                      <div className="lec-score-input-wrap">
                        <input
                          type="number"
                          disabled={isLocked}
                          className={`lec-score-input ${isLocked ? 'input-disabled' : ''}`}
                          value={st.compositeMark}
                          onChange={(e) => handleScoreChange(st.regNo, e.target.value)}
                        />
                        <span className="max-tag">/ 100</span>
                      </div>
                    </td>
                    <td>
                      <span className={`lec-grade-badge grade-${st.grade.toLowerCase().replace('+', '-plus').replace('-', '-minus')}`}>
                        {st.grade}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono font-semibold">{safeToFixed(st.gpa, 1, '—')}</span>
                    </td>
                    <td>
                      <span className={`lec-remark-pill ${isPassing ? 'remark-pass' : 'remark-fail'}`}>
                        {st.remark}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Submit Final Results to Examination Branch?"
        message="Once submitted, the results ledger will be locked and forwarded to the Faculty Examination Board for official release. You will no longer be able to modify grades directly. Do you wish to proceed?"
        confirmText="Confirm & Submit Results"
        cancelText="Review Grades"
        confirmType="primary"
        onConfirm={handleConfirmSubmission}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
}

