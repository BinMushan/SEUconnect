import React, { useState, useEffect } from 'react';
import AttendanceTable from './components/AttendanceTable.jsx';
import { INITIAL_SUBJECTS, ENROLLED_STUDENTS } from './lecturerMockData.js';
import { resultsPipelineService } from '../../src/services/resultsPipelineService.js';

/**
 * Helper to compute an individual student's standing rate
 * based on whether they are marked present or absent in the current session.
 */
const calculateStudentRate = (baseRate, isPresent) => {
  if (isPresent) {
    return Math.min(100, Math.round(baseRate + 4));
  } else {
    return Math.max(0, Math.round(baseRate - 10));
  }
};

const getInitialStudentCohort = () => {
  return ENROLLED_STUDENTS.map((st) => {
    const base = st.attendanceRate || 80;
    return {
      ...st,
      baseRate: base,
      attendanceRate: calculateStudentRate(base, st.present),
    };
  });
};

/**
 * Attendance component
 * Comprehensive Student Attendance Recording & Analytics System.
 * Fully reactive:
 * - Unsaved Changes button with instant save and discard capabilities
 * - Live updating Overall Attendance Standing (shows 100% when all present)
 * - Live updating Subject-Level Breakdown card
 * - Live updating Student Cohort Distribution with individual status badges & bars
 */
export default function Attendance({ subjects = INITIAL_SUBJECTS, initialSubjectCode = 'SWT22022', onShowToast }) {
  const availableSubjects = Array.isArray(subjects) ? subjects : [];
  const defaultCode = availableSubjects[0]?.code || initialSubjectCode;
  const [selectedSubject, setSelectedSubject] = useState(defaultCode);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [students, setStudents] = useState(getInitialStudentCohort);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Subject-level attendance rates dictionary (persisted across module switches)
  const [subjectRates, setSubjectRates] = useState(() => {
    const initialMap = {};
    availableSubjects.forEach((sub) => {
      initialMap[sub.code] = sub.attendanceRate;
    });
    return initialMap;
  });

  // Saved rosters store for discarding or restoring per subject
  const [savedRosters, setSavedRosters] = useState(() => ({
    [defaultCode]: getInitialStudentCohort(),
  }));

  useEffect(() => {
    if (availableSubjects.length > 0 && !availableSubjects.some((s) => s.code === selectedSubject)) {
      setSelectedSubject(availableSubjects[0].code);
    }
  }, [availableSubjects, selectedSubject]);

  useEffect(() => {
    if (initialSubjectCode) {
      setSelectedSubject(initialSubjectCode);
    }
  }, [initialSubjectCode]);

  // Handle single student attendance toggle
  const handleToggleStatus = (regNo) => {
    setStudents((prev) =>
      prev.map((st) => {
        if (st.regNo !== regNo) return st;
        const nextPresent = !st.present;
        return {
          ...st,
          present: nextPresent,
          attendanceRate: calculateStudentRate(st.baseRate, nextPresent),
        };
      })
    );
    setHasUnsavedChanges(true);
  };

  // Bulk mark all present
  const handleMarkAllPresent = () => {
    setStudents((prev) =>
      prev.map((st) => ({
        ...st,
        present: true,
        attendanceRate: calculateStudentRate(st.baseRate, true),
      }))
    );
    setHasUnsavedChanges(true);
    if (onShowToast) {
      onShowToast('All students marked as Present (100% Attendance)', 'success');
    }
  };

  // Bulk mark all absent
  const handleMarkAllAbsent = () => {
    setStudents((prev) =>
      prev.map((st) => ({
        ...st,
        present: false,
        attendanceRate: calculateStudentRate(st.baseRate, false),
      }))
    );
    setHasUnsavedChanges(true);
    if (onShowToast) {
      onShowToast('All students marked as Absent for this session', 'warning');
    }
  };

  // Live tally calculations
  const presentCount = students.filter((s) => s.present).length;
  const absentCount = students.length - presentCount;
  const currentSessionRate = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  // Save session attendance
  const handleSaveAttendance = () => {
    setSavedRosters((prev) => ({
      ...prev,
      [selectedSubject]: students,
    }));
    setSubjectRates((prev) => ({
      ...prev,
      [selectedSubject]: currentSessionRate,
    }));
    setHasUnsavedChanges(false);

    // Sync to resultsPipelineService for real-time student dashboard display
    const studentStatusMap = {};
    students.forEach((st) => {
      studentStatusMap[st.regNo] = !!st.present;
    });
    const normalizedDate = selectedDate.replace(/-/g, '/');
    resultsPipelineService.recordAttendance(selectedSubject, normalizedDate, studentStatusMap, 'Dr. K. Perera');

    if (onShowToast) {
      onShowToast(
        `Attendance for ${selectedSubject} on ${selectedDate} submitted successfully! Standing: ${currentSessionRate}% (Live synced to Student Dashboards)`,
        'success'
      );
    }
  };

  // Discard unsaved changes and revert to last saved state
  const handleDiscardChanges = () => {
    const saved = savedRosters[selectedSubject] || getInitialStudentCohort();
    setStudents(saved);
    setHasUnsavedChanges(false);
    if (onShowToast) {
      onShowToast('Unsaved changes discarded. Restored last saved attendance record.', 'info');
    }
  };

  // Handle switching course modules
  const handleSubjectChange = (newCode) => {
    if (hasUnsavedChanges) {
      setSavedRosters((prev) => ({
        ...prev,
        [selectedSubject]: students,
      }));
    }
    setSelectedSubject(newCode);
    const existing = savedRosters[newCode];
    if (existing) {
      setStudents(existing);
    } else {
      const fresh = getInitialStudentCohort();
      setStudents(fresh);
      setSavedRosters((prev) => ({ ...prev, [newCode]: fresh }));
    }
    setHasUnsavedChanges(false);
  };

  const activeSubjectData = availableSubjects.find((s) => s.code === selectedSubject) || availableSubjects[0] || null;

  // Overall Attendance Standing reaches 100% when all students are present
  const overallStandingRate = currentSessionRate;

  if (availableSubjects.length === 0) {
    return (
      <div className="lec-attendance-container">
        <div className="lec-module-header-card">
          <div>
            <h2 className="lec-module-title">Student Attendance Recording & Analytics</h2>
            <p className="lec-module-sub">
              Record, verify, and synchronize daily class attendances for lecture sessions and practical laboratories.
            </p>
          </div>
        </div>
        <div className="lec-empty-state-card" style={{ padding: '60px 24px', background: '#fff', borderRadius: '14px', border: '1px dashed #cbd5e1', textAlign: 'center', margin: '24px 0' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" style={{ margin: '0 auto 12px', display: 'block' }}>
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          </svg>
          <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>No Attendance Registers Allocated</h4>
          <p style={{ color: '#64748b', maxWidth: '440px', margin: '0 auto 16px', lineHeight: 1.5 }}>
            You currently have no course modules assigned for attendance tracking. When your Head of Department (HOD) assigns subjects to you, student rosters will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lec-attendance-container">
      {/* 1. Header & Controls */}
      <div className="lec-module-header-card">
        <div>
          <h2 className="lec-module-title">Student Attendance Recording & Analytics</h2>
          <p className="lec-module-sub">
            Record, verify, and synchronize daily class attendances for lecture sessions and practical laboratories.
          </p>
        </div>

        <div className="lec-attendance-top-actions">
          {hasUnsavedChanges ? (
            <div className="lec-unsaved-btn-group">
              <button
                type="button"
                className="lec-unsaved-btn"
                onClick={handleSaveAttendance}
                title="You have unsaved changes. Click to save now."
              >
                <span className="unsaved-pulsing-dot"></span>
                Unsaved Changes (Save)
              </button>
              <button
                type="button"
                className="lec-discard-btn"
                onClick={handleDiscardChanges}
                title="Discard unsaved changes and revert to last saved state"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                Discard
              </button>
            </div>
          ) : (
            <span className="lec-all-saved-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              All Records Saved
            </span>
          )}

          <button
            type="button"
            className="lec-btn-save-attendance"
            onClick={handleSaveAttendance}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Submit & Sync Attendance
          </button>
        </div>
      </div>

      {/* 2. Selectors Bar: Subject and Date */}
      <div className="lec-attendance-filter-bar">
        <div className="filter-group">
          <label className="filter-label">Select Course Module:</label>
          <select
            className="lec-select"
            value={selectedSubject}
            onChange={(e) => handleSubjectChange(e.target.value)}
          >
            {availableSubjects.map((sub) => (
              <option key={sub.code} value={sub.code}>
                {sub.code} — {sub.name} ({sub.semester}{sub.batch ? ` • Batch ${sub.batch}` : ''})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Session Date:</label>
          <input
            type="date"
            className="lec-date-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="lec-subject-quick-tag">
          <span>Venue: <strong>{activeSubjectData?.classroom || 'TBA'}</strong></span>
          <span className="dot">•</span>
          <span>Time: <strong>{activeSubjectData?.schedule || 'TBA'}</strong></span>
        </div>
      </div>

      {/* 3. Main Grid: Table on the left, Analytics on the right */}
      <div className="lec-attendance-main-grid">
        {/* Left: Attendance Table */}
        <div className="lec-attendance-table-area">
          <AttendanceTable
            students={students}
            onToggleStatus={handleToggleStatus}
            onMarkAllPresent={handleMarkAllPresent}
            onMarkAllAbsent={handleMarkAllAbsent}
          />
        </div>

        {/* Right: Analytics Sidebar */}
        <div className="lec-attendance-analytics-sidebar">
          {/* A. Overall Average Attendance Rate */}
          <div className="lec-analytics-card">
            <h4 className="analytics-card-title">Overall Attendance Standing</h4>
            <div className="analytics-rate-display">
              <span className="big-rate-number">{overallStandingRate}%</span>
              <span className="rate-desc">
                {presentCount === students.length && students.length > 0
                  ? '100% Attendance (All Students Present)'
                  : `${presentCount} of ${students.length} Students Present (${absentCount} Absent)`}
              </span>
            </div>

            <div className="lec-progress-track large">
              <div
                className="lec-progress-fill"
                style={{
                  width: `${overallStandingRate}%`,
                  backgroundColor:
                    overallStandingRate >= 80 ? '#10b981' : overallStandingRate >= 70 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>
            <div className="threshold-legend">
              <span className="legend-item"><span className="dot dot-green"></span> Good (80%+)</span>
              <span className="legend-item"><span className="dot dot-amber"></span> Warning (70-79%)</span>
              <span className="legend-item"><span className="dot dot-red"></span> Low (&lt;70%)</span>
            </div>
          </div>

          {/* B. Subject-Level Attendance Breakdown */}
          <div className="lec-analytics-card">
            <h4 className="analytics-card-title">Subject-Level Breakdown</h4>
            <div className="analytics-breakdown-list">
              {availableSubjects.map((sub) => {
                const isSelected = sub.code === selectedSubject;
                const rate = isSelected ? currentSessionRate : (subjectRates[sub.code] ?? sub.attendanceRate);
                const bandClass = rate >= 80 ? 'band-good' : rate >= 70 ? 'band-warning' : 'band-low';
                return (
                  <div
                    key={sub.code}
                    className={`analytics-sub-item ${bandClass} ${isSelected ? 'is-active-subject' : ''}`}
                  >
                    <div className="sub-header-row">
                      <span className="sub-code">
                        {sub.code}
                        {isSelected && <span className="active-sub-badge">Active</span>}
                      </span>
                      <span className="sub-rate">{rate}%</span>
                    </div>
                    <div className="sub-title-small">{sub.name}</div>
                    <div className="lec-progress-track">
                      <div
                        className="lec-progress-fill"
                        style={{
                          width: `${rate}%`,
                          backgroundColor: rate >= 80 ? '#10b981' : rate >= 70 ? '#f59e0b' : '#ef4444',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* C. Individual Student-Wise Historical Attendance Bars */}
          <div className="lec-analytics-card">
            <h4 className="analytics-card-title">Student Cohort Distribution</h4>
            <p className="analytics-card-sub">Individual session & standing analytics</p>

            <div className="analytics-student-bars-list">
              {students.slice(0, 8).map((st) => (
                <div key={st.regNo} className="student-bar-row">
                  <div className="student-bar-info">
                    <span className="student-reg">{st.regNo}</span>
                    <span className="student-name-short">{st.name}</span>
                    <span className={`student-status-badge ${st.present ? 'status-present' : 'status-absent'}`}>
                      {st.present ? 'Present' : 'Absent'}
                    </span>
                    <span className={`student-rate-val ${st.present ? 'text-emerald' : 'text-danger'}`}>
                      {st.attendanceRate}%
                    </span>
                  </div>
                  <div className="lec-progress-track small">
                    <div
                      className="lec-progress-fill"
                      style={{
                        width: `${st.attendanceRate}%`,
                        backgroundColor:
                          st.attendanceRate >= 80 ? '#10b981' : st.attendanceRate >= 70 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="analytics-footer-note">
              <span>* 80% minimum required for End-Semester Exam (ESA) eligibility per SEUSL By-laws.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
