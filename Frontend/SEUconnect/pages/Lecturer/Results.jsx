import React, { useState } from 'react';
import ConfirmModal from './components/ConfirmModal.jsx';
import { INITIAL_SUBJECTS, ENROLLED_STUDENTS, calculateSEUSLGrade } from './lecturerMockData.js';

/**
 * Results component
 * Results & Grading Management with:
 * - Status Lifecycle: Draft -> Submitted -> Finalized
 * - Form locking when Submitted / Finalized
 * - Official SEUSL Grade Scale mapping
 * - Submission guard verifying all student entries before ConfirmModal prompt
 */
export default function Results({ initialSubjectCode = 'SWT22022', onShowToast }) {
  const [selectedSubject, setSelectedSubject] = useState(initialSubjectCode);
  const [lifecycleStatus, setLifecycleStatus] = useState('Draft'); // 'Draft', 'Submitted', 'Finalized'
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Student scores table
  const [studentGrades, setStudentGrades] = useState(() => {
    return ENROLLED_STUDENTS.map((st) => {
      // Calculate composite mark: 40% CA average + 60% ESA
      const caAvg = ((st.ca1 || 0) + (st.ca2 || 0)) / 2;
      const compositeMark = Math.round(caAvg * 0.4 + (st.esa || 0) * 0.6);
      const gradeObj = calculateSEUSLGrade(compositeMark);
      return {
        ...st,
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

  // Distribution counts
  const gradeDistribution = {
    A: studentGrades.filter((s) => s.grade.startsWith('A')).length,
    B: studentGrades.filter((s) => s.grade.startsWith('B')).length,
    C: studentGrades.filter((s) => s.grade.startsWith('C')).length,
    D: studentGrades.filter((s) => s.grade === 'D').length,
    E: studentGrades.filter((s) => s.grade === 'E').length,
  };

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
            {INITIAL_SUBJECTS.map((sub) => (
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
        {/* Grade Distribution */}
        <div className="lec-distribution-card">
          <h4 className="dist-title">Cohort Grade Distribution</h4>
          <div className="dist-badges-row">
            <div className="dist-badge-box badge-a">
              <span className="dist-grade">A Tier (A+, A, A-)</span>
              <span className="dist-count">{gradeDistribution.A}</span>
            </div>
            <div className="dist-badge-box badge-b">
              <span className="dist-grade">B Tier (B+, B, B-)</span>
              <span className="dist-count">{gradeDistribution.B}</span>
            </div>
            <div className="dist-badge-box badge-c">
              <span className="dist-grade">C Tier (C+, C, C-)</span>
              <span className="dist-count">{gradeDistribution.C}</span>
            </div>
            <div className="dist-badge-box badge-d">
              <span className="dist-grade">D Tier (Conditional)</span>
              <span className="dist-count">{gradeDistribution.D}</span>
            </div>
            <div className="dist-badge-box badge-e">
              <span className="dist-grade">E Tier (Fail)</span>
              <span className="dist-count">{gradeDistribution.E}</span>
            </div>
          </div>
        </div>

        {/* SEUSL Grade Scale Mapping Reference */}
        <div className="lec-scale-reference-card">
          <h4 className="scale-title">SEUSL Standard Academic Grading Scale</h4>
          <div className="scale-chips-wrap">
            <span className="scale-chip">A+ &ge; 85</span>
            <span className="scale-chip">A &ge; 78</span>
            <span className="scale-chip">A- &ge; 72</span>
            <span className="scale-chip">B+ &ge; 67</span>
            <span className="scale-chip">B &ge; 61</span>
            <span className="scale-chip">B- &ge; 56</span>
            <span className="scale-chip">C+ &ge; 51</span>
            <span className="scale-chip">C &ge; 47</span>
            <span className="scale-chip">C- &ge; 42</span>
            <span className="scale-chip">D &ge; 37</span>
            <span className="scale-chip chip-fail">E &lt; 37</span>
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
                    <td>{Math.round(((st.ca1 || 0) + (st.ca2 || 0)) / 2)} / 100</td>
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
                      <span className="font-mono font-semibold">{st.gpa.toFixed(1)}</span>
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

