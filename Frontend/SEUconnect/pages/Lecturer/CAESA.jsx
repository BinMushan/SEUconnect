import React, { useState } from 'react';
import { INITIAL_SUBJECTS, ENROLLED_STUDENTS } from './lecturerMockData.js';

/**
 * CAESA component
 * Continuous Assessment (CA) and End Semester Examination (ESA) Marks Management:
 * - Selectors for Subject and Assessment type (CA 01, CA 02, ESA out of 100)
 * - Progress overview: Total Students, Completed, Pending, Batch Average
 * - Warning alert banner indicating missing student marks
 * - Input validation (0-100) with error feedback highlights
 */
export default function CAESA({ initialSubjectCode = 'SWT22022', onShowToast }) {
  const [selectedSubject, setSelectedSubject] = useState(initialSubjectCode);
  const [assessmentType, setAssessmentType] = useState('ca1'); // 'ca1', 'ca2', 'esa'

  // Student scores table state
  const [marksState, setMarksState] = useState(() => {
    const initial = {};
    ENROLLED_STUDENTS.forEach((st) => {
      initial[st.regNo] = {
        ca1: st.ca1 !== undefined ? String(st.ca1) : '',
        ca2: st.ca2 !== undefined ? String(st.ca2) : '',
        esa: st.esa !== undefined ? String(st.esa) : '',
      };
    });
    return initial;
  });

  const [inputErrors, setInputErrors] = useState({});

  const handleMarkChange = (regNo, val) => {
    // Validate value
    const num = Number(val);
    let errorMsg = '';

    if (val !== '' && (isNaN(num) || num < 0 || num > 100)) {
      errorMsg = 'Marks must be between 0 and 100.';
    }

    setInputErrors((prev) => ({
      ...prev,
      [`${regNo}_${assessmentType}`]: errorMsg,
    }));

    setMarksState((prev) => ({
      ...prev,
      [regNo]: {
        ...prev[regNo],
        [assessmentType]: val,
      },
    }));
  };

  // Assessment metadata
  const assessmentMeta = {
    ca1: { label: 'Continuous Assessment 01 (CA 01)', max: 100, weight: '20%' },
    ca2: { label: 'Continuous Assessment 02 (CA 02)', max: 100, weight: '20%' },
    esa: { label: 'End Semester Examination (ESA)', max: 100, weight: '60%' },
  };

  // Calculations for progress overview
  const totalStudents = ENROLLED_STUDENTS.length;
  let completedCount = 0;
  let sumMarks = 0;
  const missingStudents = [];

  ENROLLED_STUDENTS.forEach((st) => {
    const currentVal = marksState[st.regNo]?.[assessmentType];
    if (currentVal !== undefined && currentVal !== '' && !isNaN(Number(currentVal))) {
      completedCount++;
      sumMarks += Number(currentVal);
    } else {
      missingStudents.push(st);
    }
  });

  const pendingCount = totalStudents - completedCount;
  const batchAverage = completedCount > 0 ? (sumMarks / completedCount).toFixed(1) : 0;

  const handleSaveDraft = () => {
    if (onShowToast) {
      onShowToast(`Draft marks for ${assessmentMeta[assessmentType].label} saved`, 'info');
    }
  };

  const handlePublishMarks = () => {
    if (pendingCount > 0) {
      if (onShowToast) {
        onShowToast(`Warning: ${pendingCount} student marks are still missing`, 'warning');
      }
      return;
    }
    if (Object.values(inputErrors).some((err) => !!err)) {
      if (onShowToast) {
        onShowToast('Please fix invalid mark values before submitting.', 'error');
      }
      return;
    }
    if (onShowToast) {
      onShowToast(`${assessmentMeta[assessmentType].label} marks submitted to Dean/Exam office.`, 'success');
    }
  };

  return (
    <div className="lec-caesa-container">
      {/* 1. Header Card */}
      <div className="lec-module-header-card">
        <div>
          <h2 className="lec-module-title">Continuous Assessment (CA) & ESA Marks</h2>
          <p className="lec-module-sub">
            Input, evaluate, and moderate student continuous assessments and end-semester scores prior to faculty board submission.
          </p>
        </div>
        <div className="lec-caesa-header-buttons">
          <button type="button" className="lec-btn-save-draft" onClick={handleSaveDraft}>
            Save Draft
          </button>
          <button type="button" className="lec-btn-publish" onClick={handlePublishMarks}>
            Submit Marks
          </button>
        </div>
      </div>

      {/* 2. Selectors Bar: Subject and Assessment Type */}
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

        <div className="filter-group">
          <label className="filter-label">Assessment Type:</label>
          <select
            className="lec-select"
            value={assessmentType}
            onChange={(e) => setAssessmentType(e.target.value)}
          >
            <option value="ca1">CA 01 (Max: 100 • Weight: 20%)</option>
            <option value="ca2">CA 02 (Max: 100 • Weight: 20%)</option>
            <option value="esa">ESA Exam (Max: 100 • Weight: 60%)</option>
          </select>
        </div>

        <div className="lec-subject-quick-tag">
          <span>Target Evaluation: <strong>{assessmentMeta[assessmentType].label}</strong></span>
        </div>
      </div>

      {/* 3. Progress Overview Metrics */}
      <div className="lec-ca-stats-row">
        <div className="ca-stat-item">
          <span className="ca-stat-label">Total Cohort</span>
          <span className="ca-stat-number">{totalStudents}</span>
        </div>
        <div className="ca-stat-item border-green">
          <span className="ca-stat-label">Marks Completed</span>
          <span className="ca-stat-number text-green">{completedCount}</span>
        </div>
        <div className="ca-stat-item border-amber">
          <span className="ca-stat-label">Pending Entries</span>
          <span className="ca-stat-number text-amber">{pendingCount}</span>
        </div>
        <div className="ca-stat-item border-blue">
          <span className="ca-stat-label">Batch Average</span>
          <span className="ca-stat-number text-blue">{batchAverage} / 100</span>
        </div>
      </div>

      {/* 4. Missing Marks Warning Banner */}
      {pendingCount > 0 && (
        <div className="lec-missing-warning-banner">
          <div className="warning-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="warning-text">
            <strong>Incomplete Grade Ledger Warning:</strong> There are currently{' '}
            <span className="underline font-bold">{pendingCount} student(s)</span> with missing{' '}
            {assessmentMeta[assessmentType].label} records. Ensure all entries are filled before final submission.
            <div className="missing-pills-list">
              {missingStudents.map((st) => (
                <span key={st.regNo} className="missing-pill">
                  {st.regNo} ({st.name.split(' ')[0]})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Marks Entry Table */}
      <div className="lec-marks-table-card">
        <div className="lec-table-scroll-container">
          <table className="lec-custom-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>Registration No</th>
                <th>Student Full Name</th>
                <th>Attendance</th>
                <th style={{ width: '180px' }}>{assessmentMeta[assessmentType].label}</th>
                <th style={{ width: '140px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {ENROLLED_STUDENTS.map((st, idx) => {
                const markVal = marksState[st.regNo]?.[assessmentType] ?? '';
                const errorKey = `${st.regNo}_${assessmentType}`;
                const hasError = !!inputErrors[errorKey];
                const isFilled = markVal !== '' && !hasError;

                return (
                  <tr key={st.regNo} className={hasError ? 'row-has-error' : ''}>
                    <td className="text-muted">{idx + 1}</td>
                    <td>
                      <span className="lec-regno-pill">{st.regNo}</span>
                    </td>
                    <td>
                      <span className="lec-student-name">{st.name}</span>
                    </td>
                    <td>
                      <span className="lec-attendance-indicator">
                        {st.attendanceRate}% Standing
                      </span>
                    </td>
                    <td>
                      <div className="lec-mark-input-wrap">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          className={`lec-mark-input ${hasError ? 'input-error' : isFilled ? 'input-valid' : ''}`}
                          value={markVal}
                          onChange={(e) => handleMarkChange(st.regNo, e.target.value)}
                          placeholder="0 - 100"
                        />
                        <span className="mark-max-label">/ 100</span>
                      </div>
                      {hasError && <span className="lec-input-err-msg">{inputErrors[errorKey]}</span>}
                    </td>
                    <td>
                      {hasError ? (
                        <span className="badge-status-error">Invalid</span>
                      ) : isFilled ? (
                        <span className="badge-status-completed">Completed</span>
                      ) : (
                        <span className="badge-status-pending">Missing</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

