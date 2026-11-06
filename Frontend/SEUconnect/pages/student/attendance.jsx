import React, { useState, useRef, useEffect, useMemo } from 'react';
import './attendance.css';
import api from '../../src/services/api.js';
import { getCurriculumBySemester, normalizeSemester } from '../../src/services/curriculumData.js';
import { resultsPipelineService } from '../../src/services/resultsPipelineService.js';

// Standard university lecture schedule time slots
const TIME_GRID_ROWS = [
  { label: '8.30 - 9.30', startMin: 8 * 60 + 30, endMin: 9 * 60 + 30 },
  { label: '9.30 - 10.30', startMin: 9 * 60 + 30, endMin: 10 * 60 + 30 },
  { label: '10.30 - 11.30', startMin: 10 * 60 + 30, endMin: 11 * 60 + 30 },
  { label: '11.30 - 12.30', startMin: 11 * 60 + 30, endMin: 12 * 60 + 30 },
  { label: 'LUNCH', isLunch: true, startMin: 12 * 60 + 30, endMin: 13 * 60 + 30 },
  { label: '1.30 - 2.30', startMin: 13 * 60 + 30, endMin: 14 * 60 + 30 },
  { label: '2.30 - 3.30', startMin: 14 * 60 + 30, endMin: 15 * 60 + 30 },
  { label: '3.30 - 4.30', startMin: 15 * 60 + 30, endMin: 16 * 60 + 30 },
  { label: '4.30 - 5.30', startMin: 16 * 60 + 30, endMin: 17 * 60 + 30 },
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Helper to convert time representations ("08:30", "8.30", "1.30", "13:30") to total minutes from midnight
function parseTimeToMinutes(raw) {
  if (!raw) return 0;
  const cleaned = String(raw).trim().toLowerCase();
  const parts = cleaned.replace(/[^0-9.:]/g, '').split(/[:.]/);
  if (parts.length === 0 || parts[0] === '') return 0;
  let h = parseInt(parts[0], 10) || 0;
  let m = parseInt(parts[1], 10) || 0;
  // Convert afternoon 12-hour values (1.30, 2.30, 3.30, 4.30, 5.30) to 24-hour minutes
  if (h >= 1 && h <= 5) {
    h += 12;
  }
  return h * 60 + m;
}

// Overlap checker between a timetable slot and a grid time interval
function slotMatchesGridRow(slot, day, gridRow) {
  if (!slot || !slot.day) return false;
  if (slot.day.toLowerCase() !== day.toLowerCase()) return false;

  let sMin = 0;
  let eMin = 0;

  if (slot.startTime && slot.endTime) {
    sMin = parseTimeToMinutes(slot.startTime);
    eMin = parseTimeToMinutes(slot.endTime);
  } else if (slot.timeSlot || slot.time) {
    const raw = String(slot.timeSlot || slot.time);
    const [startPart, endPart] = raw.split(/\s*-\s*/);
    sMin = parseTimeToMinutes(startPart);
    eMin = parseTimeToMinutes(endPart);
  }

  if (!sMin && !eMin) return false;
  if (!eMin || eMin <= sMin) eMin = sMin + 60;

  return sMin < gridRow.endMin && eMin > gridRow.startMin;
}

export default function Attendance({ onNavigateMedical, user }) {
  const cur = getCurriculumBySemester(user?.semester);

  // Student's enrolled subjects for the active semester
  const enrolledSubjects = useMemo(() => {
    if (user?.enrolledCourses && user.enrolledCourses.length > 0) {
      return user.enrolledCourses.map((c, idx) => ({
        id: c.id || `course-${idx}`,
        code: c.courseCode || c.code,
        title: c.courseName || c.title || c.code,
        credits: c.credits || 2,
        lecturer: c.lecturer || 'Department Staff',
        type: c.type || (c.practicalHours > 0 ? 'Practical' : 'Theory'),
        venue: c.venue || 'LH10'
      }));
    }
    return cur.subjects || [];
  }, [user?.enrolledCourses, cur.subjects]);

  // Matrix column headers from student's enrolled subjects
  const activeMatrixColumns = useMemo(() => {
    return enrolledSubjects.map((s) => ({
      code: s.code,
      title: s.title,
    }));
  }, [enrolledSubjects]);

  // Real-time synchronization with Lecturer attendance submissions
  const [liveAttendanceMap, setLiveAttendanceMap] = useState(() => {
    return resultsPipelineService.getStudentAttendance(user?.regNo || '22ICT091');
  });

  // Real-time weekly timetable synchronized with HOD department timetable
  const [liveTimetableSlots, setLiveTimetableSlots] = useState(() => {
    try {
      const cacheKey = `seu_tt_${normalizeSemester(user?.semester)}_${user?.batch || '2025/2026'}_${user?.department?.includes('Bio') ? 'BST' : 'BICT'}`;
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    } catch (_) {}
    return cur.timetableSlots || [];
  });

  useEffect(() => {
    let cancelled = false;
    api.getTimetable({
      semester: user?.semester,
      batch: user?.batch,
      department: user?.department,
    }).then((res) => {
      if (!cancelled && res && res.data && res.data.slots && res.data.slots.length > 0) {
        setLiveTimetableSlots(res.data.slots);
      }
    }).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    const handleSync = () => {
      setLiveAttendanceMap(resultsPipelineService.getStudentAttendance(user?.regNo || '22ICT091'));
    };
    window.addEventListener('seu_pipeline_update', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('seu_pipeline_update', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [user]);

  // Real daily matrix rows generated dynamically from lecturer submissions
  const activeMatrixDailyRows = useMemo(() => {
    const dates = Object.keys(liveAttendanceMap || {}).sort((a, b) => new Date(b) - new Date(a));
    return dates.map((dStr) => {
      const d = new Date(dStr);
      const dayName = isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { weekday: 'long' });
      return {
        date: dStr.replace(/-/g, '/'),
        rawDate: dStr,
        day: dayName,
        records: liveAttendanceMap[dStr] || {},
      };
    });
  }, [liveAttendanceMap]);

  // Aggregate attendance metrics
  const { totalAttended, totalMissed, totalSessions, overallPercentage } = useMemo(() => {
    let att = 0;
    let miss = 0;
    Object.values(liveAttendanceMap || {}).forEach((subMap) => {
      Object.values(subMap || {}).forEach((st) => {
        if (st === 'Attend') att += 1;
        else if (st === 'Missed') miss += 1;
      });
    });
    const tot = att + miss;
    let pct = null;
    if (tot > 0) {
      pct = Math.round((att / tot) * 100);
    } else if (user?.attendance !== undefined && user?.attendance !== null) {
      pct = Number(user.attendance);
    }
    return {
      totalAttended: att,
      totalMissed: miss,
      totalSessions: tot,
      overallPercentage: pct,
    };
  }, [liveAttendanceMap, user?.attendance]);

  const minThreshold = 80;
  const isOverallEligible = overallPercentage === null ? true : overallPercentage >= minThreshold;

  // Tab controls: 'matrix' | 'subject' | 'datewise' | 'timetable'
  const [activeTab, setActiveTab] = useState('matrix');
  const [matrixPeriod, setMatrixPeriod] = useState('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [onlyMissedDates, setOnlyMissedDates] = useState(false);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const periodTimerRef = useRef(null);

  const handlePeriodMouseEnter = () => {
    if (periodTimerRef.current) clearTimeout(periodTimerRef.current);
    setDropdownOpen(true);
  };

  const handlePeriodMouseLeave = () => {
    periodTimerRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 250);
  };

  // Filtered rows for the Daily Attendance Matrix
  const filteredMatrixRows = useMemo(() => {
    let rows = activeMatrixDailyRows;
    if (onlyMissedDates) {
      rows = rows.filter((r) => Object.values(r.records || {}).some((st) => st === 'Missed'));
    }
    if (matrixPeriod === '1week') {
      return rows.slice(0, 5);
    } else if (matrixPeriod === '2weeks') {
      return rows.slice(0, 10);
    } else if (matrixPeriod === '3weeks') {
      return rows.slice(0, 15);
    } else if (matrixPeriod === '1month') {
      return rows.slice(0, 20);
    }
    return rows;
  }, [activeMatrixDailyRows, matrixPeriod, onlyMissedDates]);

  const getPeriodLabel = () => {
    switch (matrixPeriod) {
      case '1week':
        return 'Latest 1 Week (5 Days)';
      case '2weeks':
        return 'Latest 2 Weeks (10 Days)';
      case '3weeks':
        return 'Latest 3 Weeks (15 Days)';
      case '1month':
        return 'Latest 1 Month (20 Days)';
      default:
        return 'All Recorded Sessions';
    }
  };

  // Detailed subject-wise breakdown
  const subjectAttendanceList = useMemo(() => {
    return enrolledSubjects.map((sub) => {
      const code = sub.code || sub.courseCode;
      const normCode = code.replace(/\s+/g, '').toUpperCase();
      let att = 0;
      let miss = 0;

      Object.values(liveAttendanceMap || {}).forEach((dayRecords) => {
        Object.entries(dayRecords || {}).forEach(([c, st]) => {
          const n = c.replace(/\s+/g, '').toUpperCase();
          if (n === normCode) {
            if (st === 'Attend') att += 1;
            else if (st === 'Missed') miss += 1;
          }
        });
      });

      const tot = att + miss;
      const pct = tot > 0 ? Math.round((att / tot) * 100) : null;
      const isEligible = pct === null ? true : pct >= 80;

      return {
        code,
        title: sub.title || sub.courseName || code,
        lecturer: sub.lecturer || 'Department Staff',
        type: sub.type || 'Core',
        theoryAttended: sub.type === 'Practical' ? 0 : att,
        theoryTotal: sub.type === 'Practical' ? 0 : tot,
        practicalAttended: sub.type === 'Practical' ? att : 0,
        practicalTotal: sub.type === 'Practical' ? tot : 0,
        attendedSessions: att,
        totalSessions: tot,
        percentage: pct,
        isEligible,
        missedCount: miss,
      };
    });
  }, [enrolledSubjects, liveAttendanceMap]);

  // Detailed real sessions log
  const dateWiseSessions = useMemo(() => {
    const list = [];
    Object.entries(liveAttendanceMap || {}).forEach(([dStr, subMap]) => {
      const d = new Date(dStr);
      const dayName = isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { weekday: 'long' });
      Object.entries(subMap || {}).forEach(([cCode, st]) => {
        const normCode = cCode.replace(/\s+/g, '').toUpperCase();
        const subMatch = enrolledSubjects.find(
          (s) => (s.code || '').replace(/\s+/g, '').toUpperCase() === normCode
        );
        list.push({
          id: `ses-${dStr}-${cCode}`,
          date: dStr,
          day: dayName,
          code: cCode,
          title: subMatch ? subMatch.title : cCode,
          lecturer: subMatch?.lecturer || 'Course Lecturer',
          venue: subMatch?.venue || 'Lecture Hall',
          status: st === 'Attend' ? 'attended' : 'missed',
        });
      });
    });
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
    return list;
  }, [liveAttendanceMap, enrolledSubjects]);

  // Filtered missed sessions for Tab 3
  const filteredMissedSessions = useMemo(() => {
    return dateWiseSessions.filter((session) => {
      if (session.status !== 'missed') return false;
      if (selectedSubjectFilter !== 'all') {
        const normFilter = selectedSubjectFilter.replace(/\s+/g, '').toUpperCase();
        const normCode = session.code.replace(/\s+/g, '').toUpperCase();
        if (normFilter !== normCode) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchText = `${session.code} ${session.title} ${session.lecturer} ${session.venue} ${session.date} ${session.day}`.toLowerCase();
        if (!matchText.includes(q)) return false;
      }
      return true;
    });
  }, [dateWiseSessions, selectedSubjectFilter, searchQuery]);

  const handleSelectSubjectDates = (code) => {
    setSelectedSubjectFilter(code);
    setActiveTab('datewise');
  };

  const handleOpenMissedOnly = () => {
    setOnlyMissedDates(true);
    setMatrixPeriod('all');
    setActiveTab('matrix');
  };

  return (
    <div className="attendance-container">
      {/* 1. Page Header */}
      <div className="page-header">
        <h1>Attendance &amp; Examination Eligibility</h1>
        <p>
          {user?.department || 'Department of Information and Communication Technology'} • Academic Batch {user?.batch || cur.batch || '2025/2026'} ({cur.semester})
        </p>
      </div>

      {/* 2. Top 3 Stat Cards */}
      <section className="grid-3">
        {/* Card 1: Overall Attendance */}
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-header-row">
              <span className="stat-label stat-label-nowrap">Overall Attendance</span>
              <span className="stat-badge">
                {overallPercentage === null
                  ? 'Good Standing'
                  : isOverallEligible
                  ? 'Eligible for ESA'
                  : 'Ineligible (< 80%)'}
              </span>
            </div>
            <div className="stat-value">
              {overallPercentage !== null ? `${overallPercentage}%` : 'N/A'}
            </div>
            <div className="stat-subtext">
              {totalSessions > 0
                ? `${totalAttended} of ${totalSessions} sessions attended`
                : 'No attendance sessions marked yet'}
            </div>
          </div>
        </div>

        {/* Card 2: Mandatory ESA Threshold */}
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-header-row">
              <span className="stat-label">Mandatory ESA Threshold</span>
              <span className="stat-badge">Minimum Req</span>
            </div>
            <div className="stat-value">{minThreshold}%</div>
            <div className="stat-subtext">Faculty Handbook Regulation 8.3</div>
          </div>
        </div>

        {/* Card 3: Missed Lectures & Exam Standing */}
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-header-row">
              <span className="stat-label stat-label-nowrap">Missed Lectures Log</span>
              <span className="stat-badge">{totalMissed} Recorded</span>
            </div>
            <div className="stat-value">
              {totalMissed === 0 ? 'Zero Absences' : `${totalMissed} Session${totalMissed === 1 ? '' : 's'}`}
            </div>
            <div className="stat-subtext">
              {totalMissed > 0 ? (
                <button
                  type="button"
                  onClick={handleOpenMissedOnly}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#0f2b54',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '0.78rem'
                  }}
                >
                  Highlight {totalMissed} missed session{totalMissed === 1 ? '' : 's'} on grid →
                </button>
              ) : (
                <span>Attendance fully compliant</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Tab Navigation Bar */}
      <div className="attendance-tab-nav">
        <button
          type="button"
          className={`attendance-tab-btn ${activeTab === 'matrix' ? 'active' : ''}`}
          onClick={() => setActiveTab('matrix')}
        >
          Daily Attendance Sheet
        </button>

        <button
          type="button"
          className={`attendance-tab-btn ${activeTab === 'subject' ? 'active' : ''}`}
          onClick={() => setActiveTab('subject')}
        >
          Subject-wise Eligibility ({enrolledSubjects.length} Subjects)
        </button>

        <button
          type="button"
          className={`attendance-tab-btn ${activeTab === 'datewise' ? 'active' : ''}`}
          onClick={() => setActiveTab('datewise')}
        >
          Missed Lectures Log {totalMissed > 0 ? `(${totalMissed})` : ''}
        </button>

        <button
          type="button"
          className={`attendance-tab-btn ${activeTab === 'timetable' ? 'active' : ''}`}
          onClick={() => setActiveTab('timetable')}
        >
          Official Weekly Timetable
        </button>
      </div>

      {/* =========================================================================
          TAB 1: DAILY ATTENDANCE MATRIX (Date x Subject Grid View)
          ========================================================================= */}
      {activeTab === 'matrix' && (
        <section className="attendance-matrix-card">
          <div className="attendance-matrix-header">
            <div>
              <h3 className="attendance-matrix-title">
                Daily Lecture Attendance Matrix (Date × Subject)
              </h3>
              <p className="attendance-matrix-subtitle">
                Real-time lecture and practical attendance sessions submitted by course lecturers for {cur.semester}.
              </p>
            </div>

            {/* Filter controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Period Filter Dropdown */}
              <div
                className={`attendance-dropdown ${dropdownOpen ? 'open' : ''}`}
                onMouseEnter={handlePeriodMouseEnter}
                onMouseLeave={handlePeriodMouseLeave}
              >
                <button
                  type="button"
                  className="attendance-dropdown-btn"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                >
                  <span>Period: <strong>{getPeriodLabel()}</strong></span>
                  <span className="attendance-dropdown-arrow">▼</span>
                </button>

                <div
                  className="attendance-dropdown-menu"
                  onMouseEnter={handlePeriodMouseEnter}
                  onMouseLeave={handlePeriodMouseLeave}
                >
                  <div style={{ padding: '6px 16px 4px 16px', fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Select Time Period
                  </div>

                  <button
                    type="button"
                    className={`attendance-dropdown-item ${matrixPeriod === 'all' ? 'active' : ''}`}
                    onClick={() => { setMatrixPeriod('all'); setDropdownOpen(false); }}
                  >
                    <span>All Recorded Sessions</span>
                  </button>

                  <button
                    type="button"
                    className={`attendance-dropdown-item ${matrixPeriod === '1week' ? 'active' : ''}`}
                    onClick={() => { setMatrixPeriod('1week'); setDropdownOpen(false); }}
                  >
                    <span>Latest 1 Week</span>
                    <span className="attendance-dropdown-badge">5 Days</span>
                  </button>

                  <button
                    type="button"
                    className={`attendance-dropdown-item ${matrixPeriod === '2weeks' ? 'active' : ''}`}
                    onClick={() => { setMatrixPeriod('2weeks'); setDropdownOpen(false); }}
                  >
                    <span>Latest 2 Weeks</span>
                    <span className="attendance-dropdown-badge">10 Days</span>
                  </button>

                  <button
                    type="button"
                    className={`attendance-dropdown-item ${matrixPeriod === '1month' ? 'active' : ''}`}
                    onClick={() => { setMatrixPeriod('1month'); setDropdownOpen(false); }}
                  >
                    <span>Latest 1 Month</span>
                    <span className="attendance-dropdown-badge">20 Days</span>
                  </button>
                </div>
              </div>

              {onlyMissedDates && (
                <button
                  type="button"
                  className="attendance-pill-btn"
                  onClick={() => setOnlyMissedDates(false)}
                  style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}
                >
                  Clear Missed Filter
                </button>
              )}

              <button
                type="button"
                onClick={onNavigateMedical || (() => {})}
                className="btn btn-primary btn-sm"
              >
                Submit Medical
              </button>
            </div>
          </div>

          {/* Legend Row */}
          <div className="matrix-legend-row">
            <span style={{ fontWeight: 600, color: '#475569' }}>Legend:</span>
            <span className="matrix-legend-item">
              <span className="matrix-badge-attend">Attend</span> Attended
            </span>
            <span className="matrix-legend-item">
              <span className="matrix-badge-missed">Missed</span> Missed Lecture
            </span>
            <span className="matrix-legend-item">
              <span className="matrix-cell-empty">—</span> No lecture scheduled
            </span>
            <span style={{ marginLeft: 'auto', fontWeight: 500, color: '#64748b', fontSize: '0.74rem' }}>
              Showing {filteredMatrixRows.length} of {activeMatrixDailyRows.length} recorded dates
            </span>
          </div>

          {/* Responsive Matrix Table Container */}
          <div className="attendance-matrix-table-wrap">
            <table className="attendance-matrix-table">
              <thead>
                <tr>
                  <th className="matrix-corner-th">
                    <span className="matrix-th-title">DATE</span>
                    <span className="matrix-th-sub">Day of Week</span>
                  </th>
                  {activeMatrixColumns.map((col) => (
                    <th key={col.code}>
                      <span className="matrix-th-title">{col.code}</span>
                      <span className="matrix-th-sub">{col.title}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredMatrixRows.length > 0 ? (
                  filteredMatrixRows.map((row) => (
                    <tr key={row.date}>
                      <td className="matrix-date-cell">
                        {row.date}
                        <span className="matrix-date-day">{row.day}</span>
                      </td>
                      {activeMatrixColumns.map((col) => {
                        const normCol = col.code.replace(/\s+/g, '').toUpperCase();
                        let status = row.records[col.code];
                        if (!status) {
                          const matchKey = Object.keys(row.records).find(
                            (k) => k.replace(/\s+/g, '').toUpperCase() === normCol
                          );
                          if (matchKey) status = row.records[matchKey];
                        }

                        if (status === 'Attend') {
                          return (
                            <td key={col.code}>
                              <span className="matrix-badge-attend">Attend</span>
                            </td>
                          );
                        }
                        if (status === 'Missed') {
                          return (
                            <td key={col.code}>
                              <button
                                type="button"
                                className="matrix-badge-missed"
                                onClick={onNavigateMedical || (() => {})}
                                title={`Missed ${col.code} on ${row.date}. Click to submit medical excuse`}
                              >
                                Missed
                              </button>
                            </td>
                          );
                        }
                        return (
                          <td key={col.code}>
                            <span className="matrix-cell-empty">—</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={Math.max(1, activeMatrixColumns.length + 1)}
                      style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b' }}
                    >
                      <svg
                        width="44"
                        height="44"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="1.5"
                        style={{ margin: '0 auto 12px', display: 'block' }}
                      >
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                        <path d="M9 14l2 2 4-4" />
                      </svg>
                      <div style={{ fontSize: '0.98rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        No Attendance Sessions Recorded Yet
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#64748b', maxWidth: '480px', margin: '0 auto' }}>
                        Once your course lecturers conduct sessions and mark attendance rosters in real time, daily attendance dates and statuses will appear here automatically.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '14px', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span>
              <strong>Faculty Regulation 8.3:</strong> Undergraduates must maintain not less than 80% aggregate attendance in theory and practical sessions to qualify for End-Semester Examinations (ESA).
            </span>
          </div>
        </section>
      )}

      {/* =========================================================================
          TAB 2: Subject-wise Eligibility
          ========================================================================= */}
      {activeTab === 'subject' && (
        <section className="seu-card">
          <div className="seu-card-header">
            <h3 className="seu-card-title">
              {cur.semester} Subjects — Attendance &amp; ESA Eligibility
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('matrix')}
                className="btn btn-sm"
                style={{ backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1' }}
              >
                View Date Matrix
              </button>
              <button
                type="button"
                onClick={onNavigateMedical || (() => {})}
                className="btn btn-primary btn-sm"
              >
                Submit Medical Excuse
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="seu-table">
              <thead>
                <tr>
                  <th>SUBJECT CODE</th>
                  <th>COURSE TITLE &amp; LECTURER IN-CHARGE</th>
                  <th>TYPE</th>
                  <th>THEORY ATTENDANCE</th>
                  <th>PRACTICAL ATTENDANCE</th>
                  <th>TOTAL ATTENDED</th>
                  <th>ATTENDANCE %</th>
                  <th>ESA STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {subjectAttendanceList.map((item) => (
                  <tr key={item.code}>
                    <td className="course-code-cell">{item.code}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.title}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{item.lecturer}</div>
                    </td>
                    <td>
                      <span
                        className={`badge ${item.type === 'Theory' ? 'badge-primary' : 'badge-accent'}`}
                        style={{ backgroundColor: item.type === 'Theory' ? '#eff6ff' : '#f5f3ff', color: item.type === 'Theory' ? '#1d4ed8' : '#6d28d9' }}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td>
                      {item.theoryTotal > 0 ? (
                        <span>
                          {item.theoryAttended} / {item.theoryTotal} ({Math.round((item.theoryAttended / item.theoryTotal) * 100)}%)
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
                    </td>
                    <td>
                      {item.practicalTotal > 0 ? (
                        <span>
                          {item.practicalAttended} / {item.practicalTotal} ({Math.round((item.practicalAttended / item.practicalTotal) * 100)}%)
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
                    </td>
                    <td>
                      <strong>{item.attendedSessions}</strong> / {item.totalSessions}
                    </td>
                    <td>
                      {item.percentage !== null ? (
                        <div className="attendance-progress-wrapper">
                          <div className="attendance-progress-bar-bg">
                            <div
                              className={item.isEligible ? 'attendance-progress-fill-success' : 'attendance-progress-fill-danger'}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <span className="attendance-progress-text">{item.percentage}%</span>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.80rem' }}>Pending Sessions</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${item.isEligible ? 'badge-success' : 'badge-danger'}`}>
                        {item.totalSessions === 0
                          ? 'Good Standing'
                          : item.isEligible
                          ? 'Eligible (≥ 80%)'
                          : 'Ineligible (< 80%)'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleSelectSubjectDates(item.code)}
                        className="btn btn-sm"
                        style={{ fontSize: '0.74rem', padding: '3px 8px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f2b54', fontWeight: 600 }}
                        title="View dates and missed lectures for this subject"
                      >
                        View Dates {item.missedCount > 0 ? `(${item.missedCount} Missed)` : ''}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* =========================================================================
          TAB 3: Date-wise Attendance & Missed Lecture Log
          ========================================================================= */}
      {activeTab === 'datewise' && (
        <section className="seu-card">
          <div className="seu-card-header">
            <div>
              <h3 className="seu-card-title">
                Date-wise Missed Lectures Log
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Review all missed lecture and practical sessions requiring medical excuse submission.
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateMedical || (() => {})}
              className="btn btn-primary btn-sm"
            >
              Submit Medical Excuse
            </button>
          </div>

          {/* Filter Row: Subject dropdown & search */}
          <div className="attendance-filter-row">
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
              Showing {filteredMissedSessions.length} Missed Lecture{filteredMissedSessions.length === 1 ? '' : 's'}
            </div>

            <div className="attendance-filter-controls">
              <select
                className="attendance-select"
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              >
                <option value="all">All Subjects ({enrolledSubjects.length} Modules)</option>
                {enrolledSubjects.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </select>

              <input
                type="text"
                className="attendance-search-input"
                placeholder="Search by date, subject, venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="seu-table">
              <thead>
                <tr>
                  <th>DATE &amp; DAY</th>
                  <th>COURSE MODULE</th>
                  <th>LECTURER</th>
                  <th>VENUE</th>
                  <th>SESSION TYPE</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredMissedSessions.length > 0 ? (
                  filteredMissedSessions.map((session) => (
                    <tr key={session.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{session.date}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{session.day}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{session.code}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{session.title}</div>
                      </td>
                      <td>{session.lecturer}</td>
                      <td>{session.venue}</td>
                      <td>
                        <span className="badge badge-accent">{session.status}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={onNavigateMedical || (() => {})}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.74rem', padding: '3px 8px' }}
                        >
                          Submit Medical
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
                      <svg
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        style={{ margin: '0 auto 8px', display: 'block' }}
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>No Missed Lectures Recorded</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        You have zero missed lecture sessions. All attendance criteria are fully met.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* =========================================================================
          TAB 4: Official Weekly Timetable (Real-time dynamic schedule from HOD / Curriculum)
          ========================================================================= */}
      {activeTab === 'timetable' && (
        <div className="timetable-card">
          <div className="timetable-header-banner">
            <h2 className="timetable-header-title">Official Department Timetable</h2>
            <p className="timetable-header-sub">
              {user?.department || 'Department of Information and Communication Technology'}
            </p>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.80rem', fontWeight: 700, color: '#475569' }}>
              Academic Batch {user?.batch || cur.batch || '2025/2026'} ({cur.semester})
            </p>
          </div>

          {/* Timetable Weekly Grid */}
          <div className="table-responsive">
            <table className="timetable-grid-table">
              <thead>
                <tr>
                  <th style={{ width: '14%' }}>Time</th>
                  <th style={{ width: '17%' }}>Monday</th>
                  <th style={{ width: '17%' }}>Tuesday</th>
                  <th style={{ width: '18%' }}>Wednesday</th>
                  <th style={{ width: '17%' }}>Thursday</th>
                  <th style={{ width: '17%' }}>Friday</th>
                </tr>
              </thead>
              <tbody>
                {TIME_GRID_ROWS.map((gridRow) => {
                  if (gridRow.isLunch) {
                    return (
                      <tr key="lunch" className="timetable-lunch-row">
                        <td className="timetable-time-cell">12.30 - 1.30</td>
                        <td colSpan="5">LUNCH BREAK</td>
                      </tr>
                    );
                  }

                  const slotList = (liveTimetableSlots && liveTimetableSlots.length > 0)
                    ? liveTimetableSlots
                    : (cur.timetableSlots || []);

                  return (
                    <tr key={gridRow.label}>
                      <td className="timetable-time-cell">{gridRow.label}</td>
                      {DAYS_OF_WEEK.map((day) => {
                        const matchingSlot = slotList.find((s) => slotMatchesGridRow(s, day, gridRow));
                        return (
                          <td key={day} className="timetable-slot-cell">
                            {matchingSlot ? (
                              <>
                                <span className="timetable-course-badge" style={{ fontStyle: 'normal' }}>
                                  {matchingSlot.code || matchingSlot.courseCode}
                                </span>
                                <span className="timetable-venue-badge">
                                  ({matchingSlot.hall || matchingSlot.venue || matchingSlot.title})
                                </span>
                              </>
                            ) : (
                              '—'
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="timetable-legend-box">
            <span className="timetable-legend-title">NOTE:</span>
            <span>
              All students must attend scheduled lecture halls 10 minutes prior to session commencement.
              Practical labs (CIS, LAB-01, LAB-02, MAC) require pre-registered credentials.
            </span>
          </div>

          {/* Course Directory for the Active Semester */}
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f2b54', marginBottom: '8px' }}>
              Registered Course Module Directory ({cur.semester})
            </h4>
            <table className="timetable-directory-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Title</th>
                  <th>Lecturer In-Charge</th>
                  <th>Type</th>
                  <th>Credits</th>
                </tr>
              </thead>
              <tbody>
                {enrolledSubjects.map((item, idx) => (
                  <tr key={item.code || idx}>
                    <td style={{ fontWeight: 700, color: '#0f2b54' }}>{item.code}</td>
                    <td>{item.title}</td>
                    <td>{item.lecturer || 'Faculty Staff'}</td>
                    <td>
                      <span className={`badge ${item.type === 'Practical' ? 'badge-accent' : 'badge-primary'}`}>
                        {item.type || 'Lecture'}
                      </span>
                    </td>
                    <td>{item.credits || 2} Credits</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
