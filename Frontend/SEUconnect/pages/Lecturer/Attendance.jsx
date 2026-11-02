import React, { useState, useEffect } from 'react';
import AttendanceTable from './components/AttendanceTable.jsx';
import { INITIAL_SUBJECTS, ENROLLED_STUDENTS } from './lecturerMockData.js';

/**
 * Attendance component
 * Comprehensive Student Attendance System featuring:
 * - Date picker & subject selector
 * - Bulk actions ("Mark All Present" / "Mark All Absent")
 * - Live tally calculation
 * - Analytics Sidebar with overall average, color bands, and individual history
 */
export default function Attendance({ initialSubjectCode = 'SWT22022', onShowToast }) {
  const [selectedSubject, setSelectedSubject] = useState(initialSubjectCode);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [students, setStudents] = useState(ENROLLED_STUDENTS);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (initialSubjectCode) {
      setSelectedSubject(initialSubjectCode);
    }
  }, [initialSubjectCode]);

  // Handle single student attendance toggle
  const handleToggleStatus = (regNo) => {
    setStudents((prev) =>
      prev.map((st) => (st.regNo === regNo ? { ...st, present: !st.present } : st))
    );
    setHasUnsavedChanges(true);
  };

  // Bulk mark all present
  const handleMarkAllPresent = () => {
    setStudents((prev) => prev.map((st) => ({ ...st, present: true })));
    setHasUnsavedChanges(true);
    if (onShowToast) {
      onShowToast('All students marked as Present for this session', 'info');
    }
  };

  // Bulk mark all absent
  const handleMarkAllAbsent = () => {
    setStudents((prev) => prev.map((st) => ({ ...st, present: false })));
    setHasUnsavedChanges(true);
  };

  // Save session attendance
  const handleSaveAttendance = () => {
    setHasUnsavedChanges(false);
    if (onShowToast) {
      onShowToast(`Attendance for ${selectedSubject} on ${selectedDate} submitted successfully`, 'success');
    }
  };

  // Calculate live statistics
  const presentCount = students.filter((s) => s.present).length;
  const absentCount = students.length - presentCount;
  const currentSessionRate = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  // Calculate overall average attendance from enrolled students
  const overallAvgRate = Math.round(
    students.reduce((acc, curr) => acc + (curr.attendanceRate || 80), 0) / students.length
  );

  const activeSubjectData = INITIAL_SUBJECTS.find((s) => s.code === selectedSubject) || INITIAL_SUBJECTS[0];

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
          {hasUnsavedChanges && (
            <span className="lec-unsaved-badge">Unsaved Changes</span>
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
            Save Session Record
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
          <label className="filter-label">Session Date:</label>
          <input
            type="date"
            className="lec-date-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="lec-subject-quick-tag">
          <span>Venue: <strong>{activeSubjectData.classroom}</strong></span>
          <span className="dot">•</span>
          <span>Time: <strong>{activeSubjectData.schedule}</strong></span>
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
              <span className="big-rate-number">{overallAvgRate}%</span>
              <span className="rate-desc">Cumulative Average Across All Modules</span>
            </div>

            <div className="lec-progress-track large">
              <div
                className="lec-progress-fill"
                style={{
                  width: `${overallAvgRate}%`,
                  backgroundColor: overallAvgRate >= 80 ? '#10b981' : overallAvgRate >= 70 ? '#f59e0b' : '#ef4444',
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
              {INITIAL_SUBJECTS.map((sub) => {
                const rate = sub.attendanceRate;
                const bandClass = rate >= 80 ? 'band-good' : rate >= 70 ? 'band-warning' : 'band-low';
                return (
                  <div key={sub.code} className={`analytics-sub-item ${bandClass}`}>
                    <div className="sub-header-row">
                      <span className="sub-code">{sub.code}</span>
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
            <p className="analytics-card-sub">Individual historical attendance standing</p>

            <div className="analytics-student-bars-list">
              {students.slice(0, 7).map((st) => (
                <div key={st.regNo} className="student-bar-row">
                  <div className="student-bar-info">
                    <span className="student-reg">{st.regNo}</span>
                    <span className="student-name-short">{st.name}</span>
                    <span className="student-rate-val">{st.attendanceRate}%</span>
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

