import React, { useState, useMemo, useEffect } from 'react';
import {
  INITIAL_SUBJECTS,
  ENROLLED_STUDENTS,
  DEFAULT_ASSESSMENTS,
  getStoredCustomCAs,
  saveStoredCustomCAs,
  getStoredMarks,
  saveStoredMarks,
} from './lecturerMockData.js';

/**
 * Helper to suggest the next sequential CA name (e.g. CA 03, CA 04)
 */
function getSuggestedNextCAName(allAssessments) {
  let highestNum = 2;
  allAssessments.forEach((ass) => {
    const match = ass.name.match(/CA\s*0?(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > highestNum) {
        highestNum = num;
      }
    }
  });
  const next = highestNum + 1;
  return next < 10 ? `CA 0${next}` : `CA ${next}`;
}

/**
 * CAESA component
 * Continuous Assessment (CA) and End Semester Examination (ESA) Marks Management:
 * - Dynamic addition of Continuous Assessments (CA3, CA4, etc.)
 * - Selectors for Subject and Assessment type with "+ Add New CA" action
 * - Progress metrics: Total Students, Completed, Pending, Batch Average
 * - Validation (0 - max marks) with error feedback highlights
 * - Full persistence via localStorage and Light/Dark mode support
 */
export default function CAESA({ initialSubjectCode = 'SWT22022', onShowToast }) {
  const [selectedSubject, setSelectedSubject] = useState(initialSubjectCode);

  // Custom continuous assessments loaded from localStorage
  const [customAssessments, setCustomAssessments] = useState(() => getStoredCustomCAs());

  // Active combined assessments: default (CA1, CA2, ESA) + custom CAs
  const allAssessments = useMemo(() => {
    return [
      DEFAULT_ASSESSMENTS[0], // CA 01
      DEFAULT_ASSESSMENTS[1], // CA 02
      ...customAssessments,   // CA 03, CA 04, etc.
      DEFAULT_ASSESSMENTS[2], // ESA Exam
    ];
  }, [customAssessments]);

  // Selected assessment type (e.g. 'ca1', 'ca2', 'ca3', 'esa')
  const [assessmentType, setAssessmentType] = useState('ca1');

  // Student scores table state
  const [marksState, setMarksState] = useState(() => {
    const stored = getStoredMarks();
    if (stored && typeof stored === 'object') {
      return stored;
    }
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

  // Modal state for adding a new CA
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCAName, setNewCAName] = useState('');
  const [newCATitle, setNewCATitle] = useState('');
  const [newCAMaxMarks, setNewCAMaxMarks] = useState('100');
  const [newCAWeight, setNewCAWeight] = useState('20');
  const [newCADate, setNewCADate] = useState(() => new Date().toISOString().split('T')[0]);
  const [modalError, setModalError] = useState('');

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isAddModalOpen) {
        setIsAddModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddModalOpen]);

  // Current assessment metadata
  const currentMeta = useMemo(() => {
    const found = allAssessments.find((a) => a.id === assessmentType);
    if (found) return found;
    return allAssessments[0] || DEFAULT_ASSESSMENTS[0];
  }, [allAssessments, assessmentType]);

  // Open modal and pre-fill suggested CA sequence name
  const handleOpenAddModal = () => {
    const suggested = getSuggestedNextCAName(allAssessments);
    setNewCAName(suggested);
    setNewCATitle('');
    setNewCAMaxMarks('100');
    setNewCAWeight('20');
    setNewCADate(new Date().toISOString().split('T')[0]);
    setModalError('');
    setIsAddModalOpen(true);
  };

  // Validate and submit new CA
  const handleCreateNewCA = (e) => {
    if (e) e.preventDefault();
    setModalError('');

    const trimmedName = newCAName.trim();
    if (!trimmedName) {
      setModalError('Assessment Identifier / Name cannot be empty.');
      return;
    }

    // Check for duplicates (case-insensitive across name and id)
    const duplicate = allAssessments.some(
      (a) =>
        a.name.toLowerCase() === trimmedName.toLowerCase() ||
        a.id.toLowerCase() === trimmedName.toLowerCase().replace(/[^a-z0-9]/g, '')
    );
    if (duplicate) {
      setModalError(`An assessment with the identifier "${trimmedName}" already exists. Please choose a unique name.`);
      return;
    }

    const maxNum = Number(newCAMaxMarks);
    if (isNaN(maxNum) || maxNum <= 0 || maxNum > 100) {
      setModalError('Maximum marks must be a valid number between 10 and 100.');
      return;
    }

    const weightNum = Number(newCAWeight);
    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 100) {
      setModalError('Weightage must be a valid percentage between 1% and 100%.');
      return;
    }

    // Generate unique ID
    let baseId = trimmedName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!baseId.startsWith('ca')) {
      baseId = `ca_${baseId}`;
    }
    let finalId = baseId;
    let counter = 1;
    while (allAssessments.some((a) => a.id === finalId)) {
      finalId = `${baseId}_${counter}`;
      counter++;
    }

    const newAssessment = {
      id: finalId,
      name: trimmedName,
      title: newCATitle.trim(),
      label: newCATitle.trim()
        ? `${trimmedName} (${newCATitle.trim()})`
        : `Continuous Assessment ${trimmedName.replace(/^ca\s*0?/i, '')} (${trimmedName})`,
      type: 'CA',
      max: maxNum,
      weight: weightNum,
      conductedDate: newCADate,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };

    // Save custom assessment list
    const updatedCustom = [...customAssessments, newAssessment];
    setCustomAssessments(updatedCustom);
    saveStoredCustomCAs(updatedCustom);

    // Initialize marks slot for all enrolled students
    setMarksState((prev) => {
      const nextMarks = { ...prev };
      ENROLLED_STUDENTS.forEach((st) => {
        nextMarks[st.regNo] = {
          ...(nextMarks[st.regNo] || {}),
          [finalId]: '',
        };
      });
      saveStoredMarks(nextMarks);
      return nextMarks;
    });

    // Auto-select newly created CA
    setAssessmentType(finalId);
    setIsAddModalOpen(false);

    if (onShowToast) {
      onShowToast(`Continuous Assessment "${trimmedName}" created successfully!`, 'success');
    }
  };

  // Handle student mark input change
  const handleMarkChange = (regNo, val) => {
    const maxAllowed = currentMeta.max || 100;
    const num = Number(val);
    let errorMsg = '';

    if (val !== '' && (isNaN(num) || num < 0 || num > maxAllowed)) {
      errorMsg = `Marks must be between 0 and ${maxAllowed}.`;
    }

    setInputErrors((prev) => ({
      ...prev,
      [`${regNo}_${assessmentType}`]: errorMsg,
    }));

    setMarksState((prev) => {
      const updated = {
        ...prev,
        [regNo]: {
          ...(prev[regNo] || {}),
          [assessmentType]: val,
        },
      };
      saveStoredMarks(updated);
      return updated;
    });
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
  const batchAverage = completedCount > 0 ? (sumMarks / completedCount).toFixed(1) : '0.0';

  const handleSaveDraft = () => {
    saveStoredMarks(marksState);
    if (onShowToast) {
      onShowToast(`Draft marks for ${currentMeta.label} saved successfully.`, 'info');
    }
  };

  const handlePublishMarks = () => {
    if (pendingCount > 0) {
      if (onShowToast) {
        onShowToast(`Warning: ${pendingCount} student marks are still missing for ${currentMeta.label}`, 'warning');
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
      onShowToast(`${currentMeta.label} marks submitted to Dean and Examination Branch.`, 'success');
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

      {/* 2. Selectors Bar: Subject, Assessment Type, and "+ Add New CA" Button */}
      <div className="lec-attendance-filter-bar lec-caesa-filter-bar">
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

        <div className="filter-group filter-group-assessment">
          <label className="filter-label">Assessment Type:</label>
          <div className="lec-assessment-select-wrap">
            <select
              className="lec-select lec-select-assessment-type"
              value={assessmentType}
              onChange={(e) => setAssessmentType(e.target.value)}
            >
              {allAssessments.map((ass) => (
                <option key={ass.id} value={ass.id}>
                  {ass.name}
                  {ass.title ? ` – ${ass.title}` : ''} (Max: {ass.max} • Weight: {ass.weight}%)
                </option>
              ))}
            </select>

            {/* "Add New CA" Button Positioned Right Next to Assessment Type */}
            <button
              type="button"
              className="lec-btn-add-ca"
              onClick={handleOpenAddModal}
              title="Add a new Continuous Assessment (e.g. CA 03, CA 04)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add New CA
            </button>
          </div>
        </div>

        <div className="lec-subject-quick-tag">
          <span>Target Evaluation: <strong>{currentMeta.label}</strong></span>
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
          <span className="ca-stat-number text-blue">{batchAverage} / {currentMeta.max}</span>
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
            {currentMeta.label} records. Ensure all entries are filled before final submission.
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
                <th style={{ width: '200px' }}>
                  {currentMeta.label}
                  <span className="th-weight-badge">Max: {currentMeta.max} • {currentMeta.weight}%</span>
                </th>
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
                          max={currentMeta.max}
                          step="1"
                          className={`lec-mark-input ${hasError ? 'input-error' : isFilled ? 'input-valid' : ''}`}
                          value={markVal}
                          onChange={(e) => handleMarkChange(st.regNo, e.target.value)}
                          placeholder={`0 - ${currentMeta.max}`}
                        />
                        <span className="mark-max-label">/ {currentMeta.max}</span>
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

      {/* 6. "+ Add New CA" Modal Dialog */}
      {isAddModalOpen && (
        <div
          className="lec-modal-backdrop"
          onClick={() => setIsAddModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="lec-modal-card lec-add-ca-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="lec-modal-header">
              <div className="lec-modal-title-wrap">
                <span className="lec-modal-badge">Continuous Assessment Setup</span>
                <h3 className="lec-modal-title">+ Add New Continuous Assessment</h3>
              </div>
              <button
                type="button"
                className="lec-modal-close-btn"
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateNewCA}>
              <div className="lec-modal-body">
                <p className="lec-add-ca-helper">
                  Add additional continuous assessment components (e.g. CA 03, CA 04, quizzes, or lab evaluations)
                  for <strong>{selectedSubject}</strong>. Newly created assessments are saved and factored into student grade averages.
                </p>

                {modalError && (
                  <div className="lec-modal-alert-error">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{modalError}</span>
                  </div>
                )}

                <div className="lec-form-grid">
                  <div className="lec-form-group">
                    <label className="lec-form-label" htmlFor="new-ca-name">
                      Assessment Identifier / Code *
                    </label>
                    <input
                      id="new-ca-name"
                      type="text"
                      className="lec-form-input"
                      placeholder="e.g. CA 03, CA 04, Quiz 01"
                      value={newCAName}
                      onChange={(e) => setNewCAName(e.target.value)}
                      required
                    />
                    <span className="lec-form-help">Unique sequential code (suggested: {getSuggestedNextCAName(allAssessments)})</span>
                  </div>

                  <div className="lec-form-group">
                    <label className="lec-form-label" htmlFor="new-ca-title">
                      Assessment Title / Method (Optional)
                    </label>
                    <input
                      id="new-ca-title"
                      type="text"
                      className="lec-form-input"
                      placeholder="e.g. Mid-Term Evaluation, Practical Lab Test, Mini Project"
                      value={newCATitle}
                      onChange={(e) => setNewCATitle(e.target.value)}
                    />
                    <span className="lec-form-help">Descriptive label shown in records</span>
                  </div>

                  <div className="lec-form-row-2col">
                    <div className="lec-form-group">
                      <label className="lec-form-label" htmlFor="new-ca-max">
                        Maximum Marks *
                      </label>
                      <input
                        id="new-ca-max"
                        type="number"
                        min="10"
                        max="100"
                        step="1"
                        className="lec-form-input"
                        value={newCAMaxMarks}
                        onChange={(e) => setNewCAMaxMarks(e.target.value)}
                        required
                      />
                      <span className="lec-form-help">Standard: 100</span>
                    </div>

                    <div className="lec-form-group">
                      <label className="lec-form-label" htmlFor="new-ca-weight">
                        Weightage (%) *
                      </label>
                      <input
                        id="new-ca-weight"
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        className="lec-form-input"
                        value={newCAWeight}
                        onChange={(e) => setNewCAWeight(e.target.value)}
                        required
                      />
                      <span className="lec-form-help">Contributes to CA average</span>
                    </div>
                  </div>

                  <div className="lec-form-group">
                    <label className="lec-form-label" htmlFor="new-ca-date">
                      Conducted / Submission Date (Optional)
                    </label>
                    <input
                      id="new-ca-date"
                      type="date"
                      className="lec-form-input"
                      value={newCADate}
                      onChange={(e) => setNewCADate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="lec-modal-footer">
                <button
                  type="button"
                  className="lec-modal-btn-cancel"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="lec-modal-btn-primary"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Create Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
