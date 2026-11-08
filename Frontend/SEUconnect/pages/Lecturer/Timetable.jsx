import React, { useState, useMemo, useEffect } from 'react';
import {
  INITIAL_SUBJECTS,
  LECTURER_TIMETABLE_CLASSES,
} from './lecturerMockData.js';
import api from '../../src/services/api.js';

/**
 * Helper: Convert a database timetable slot to a Lecturer Class model
 */
function convertSlotToLecturerClass(slot, idx) {
  const dayMap = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7 };
  const dayOfWeek = dayMap[slot.day] || 1;

  let startHour = 8;
  let startMinute = 30;
  let endHour = 9;
  let endMinute = 30;

  if (slot.timeSlot) {
    const parts = slot.timeSlot.split('-');
    if (parts.length === 2) {
      const sParts = parts[0].trim().replace(/[a-zA-Z]/g, '').split(/[:.]/);
      const eParts = parts[1].trim().replace(/[a-zA-Z]/g, '').split(/[:.]/);
      if (sParts[0]) startHour = parseInt(sParts[0], 10) || 8;
      if (sParts[1]) startMinute = parseInt(sParts[1], 10) || 0;
      if (eParts[0]) endHour = parseInt(eParts[0], 10) || 9;
      if (eParts[1]) endMinute = parseInt(eParts[1], 10) || 30;

      // Normalize afternoon slots like 1.30 or 2.30
      if (startHour >= 1 && startHour <= 6) startHour += 12;
      if (endHour >= 1 && endHour <= 6) endHour += 12;
    }
  }

  return {
    id: slot.id || `slot-db-${idx}`,
    dayOfWeek,
    dayName: slot.day,
    subjectCode: slot.code,
    subjectName: slot.name || slot.code,
    timeslot: slot.timeSlot,
    startTime: `${startHour}:${startMinute < 10 ? '0' : ''}${startMinute}`,
    endTime: `${endHour}:${endMinute < 10 ? '0' : ''}${endMinute}`,
    startHour,
    startMinute,
    endHour,
    endMinute,
    duration: '1h 00m',
    classType: slot.type || 'Lecture',
    venue: slot.venue || 'LH5',
    registeredStudentsCount: 45,
    academicBatch: slot.batch || '2022/2023',
    academicYear: '2025/2026',
    semester: slot.semester || 'Semester 2',
    degreeProgramme: 'BICT (Hons)',
    lecturerName: slot.lecturer || 'Faculty Staff',
    topic: `${slot.code} Regular Curriculum Session`,
    notes: 'Scheduled by Head of Department via official Timetable matrix.',
  };
}

/**
 * Helper: Obtain current date/time anchored to Asia/Colombo timezone.
 */
function getColomboNow() {
  const colomboStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' });
  return new Date(colomboStr);
}

/**
 * Helper: Generate the 7 calendar days of a specific week offset from today (0 = current week).
 * Colombo timezone based: Monday is day 1, Sunday is day 7.
 */
function getWeekDates(weekOffset = 0) {
  const now = getColomboNow();
  const currentDay = now.getDay(); // 0 is Sun, 1 is Mon, ... 6 is Sat
  const diffToMonday = (currentDay === 0 ? -6 : 1) - currentDay;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const weekDays = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);

    const isToday =
      weekOffset === 0 &&
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    weekDays.push({
      dayOfWeek: i + 1, // 1 = Mon ... 7 = Sun
      dayName: dayNames[i],
      date: d,
      dateString: d.toISOString().split('T')[0],
      formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Asia/Colombo' }),
      fullDateString: d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'Asia/Colombo',
      }),
      isToday,
    });
  }

  return weekDays;
}

/**
 * Helper: Format time status for Daily View
 */
function getSessionTimeStatus(session, isSelectedDayToday) {
  if (!isSelectedDayToday) {
    return { label: 'Scheduled', cls: 'status-scheduled' };
  }

  const now = getColomboNow();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = (session.startHour || 0) * 60 + (session.startMinute || 0);
  const endMinutes = (session.endHour || 0) * 60 + (session.endMinute || 0);

  if (currentMinutes < startMinutes) {
    return { label: 'Upcoming', cls: 'status-upcoming' };
  } else if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
    return { label: 'Ongoing Now', cls: 'status-ongoing' };
  } else {
    return { label: 'Completed', cls: 'status-completed' };
  }
}

/**
 * Timetable Component
 * Teaching Timetable for SEUConnect Lecturer Portal
 */
export default function Timetable({ user, subjects = INITIAL_SUBJECTS, onNavigateModule, onShowToast }) {
  const availableSubjects = Array.isArray(subjects) ? subjects : [];
  const [dbTimetableSlots, setDbTimetableSlots] = useState([]);

  // Fetch published timetable slots from MongoDB Atlas backend
  useEffect(() => {
    let cancelled = false;
    const fetchTimetable = async () => {
      try {
        const identifier = user?.name || user?.email || '';
        const res = await api.getAllTimetables();
        if (!cancelled && res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const lecLower = identifier.toLowerCase().trim();
          const subCodes = new Set(availableSubjects.map((s) => (s.code || '').toUpperCase().trim()));

          const matchedSlots = [];
          for (const doc of res.data) {
            if (Array.isArray(doc.slots)) {
              for (const slot of doc.slots) {
                const sLec = (slot.lecturer || '').toLowerCase();
                const sCode = (slot.code || '').toUpperCase().trim();
                const isLecturerMatch = lecLower && (sLec.includes(lecLower) || lecLower.includes(sLec));
                const isSubjectMatch = subCodes.has(sCode);

                if (isLecturerMatch || isSubjectMatch) {
                  matchedSlots.push({
                    ...slot,
                    batch: doc.batch || slot.batch,
                    semester: doc.semester || slot.semester,
                  });
                }
              }
            }
          }
          if (matchedSlots.length > 0) {
            setDbTimetableSlots(matchedSlots);
          }
        }
      } catch (err) {
        console.warn('Lecturer timetable fetch notice:', err.message);
      }
    };

    fetchTimetable();

    const handleSaved = () => {
      fetchTimetable();
    };
    window.addEventListener('seu_timetable_saved', handleSaved);
    window.addEventListener('storage', handleSaved);
    return () => {
      cancelled = true;
      window.removeEventListener('seu_timetable_saved', handleSaved);
      window.removeEventListener('storage', handleSaved);
    };
  }, [user, availableSubjects]);

  // Combine database timetable classes with baseline defaults
  const allClasses = useMemo(() => {
    const fromDb = (dbTimetableSlots || []).map((s, idx) => convertSlotToLecturerClass(s, idx));
    const dbKeys = new Set(fromDb.map((c) => `${c.subjectCode}-${c.dayOfWeek}-${c.timeslot}`));
    const baselineFiltered = LECTURER_TIMETABLE_CLASSES.filter(
      (c) => !dbKeys.has(`${c.subjectCode}-${c.dayOfWeek}-${c.timeslot}`)
    );
    return [...fromDb, ...baselineFiltered];
  }, [dbTimetableSlots]);

  // View mode: 'weekly' or 'daily'
  const [viewMode, setViewMode] = useState('weekly');

  // Week navigation offset for Weekly View (0 = current week)
  const [weekOffset, setWeekOffset] = useState(0);

  // Selected date for Daily View (YYYY-MM-DD string)
  const todayColomboStr = useMemo(() => {
    const now = getColomboNow();
    return now.toISOString().split('T')[0];
  }, []);
  const [selectedDateStr, setSelectedDateStr] = useState(todayColomboStr);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterBatch, setFilterBatch] = useState('ALL');
  const [filterYear, setFilterYear] = useState('ALL');
  const [filterSemester, setFilterSemester] = useState('ALL');
  const [filterClassType, setFilterClassType] = useState('ALL');

  // Selected class for Details Modal
  const [selectedClass, setSelectedClass] = useState(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedClass) {
        setSelectedClass(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedClass]);

  // Generate all 7 calendar days of the week (for date calculations)
  const allWeekDays = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  // Regular university teaching days: Monday to Friday (5 days)
  const weekDays = useMemo(() => allWeekDays.slice(0, 5), [allWeekDays]);

  // Formatted 5-day week date range (Monday to Friday)
  const weekRangeText = useMemo(() => {
    if (weekDays.length === 0) return '';
    const first = weekDays[0].formattedDate;
    const last = weekDays[4].formattedDate;
    const year = weekDays[0].date.getFullYear();
    return `${first} – ${last}, ${year}`;
  }, [weekDays]);

  // Derived unique filter options
  const filterOptions = useMemo(() => {
    const batches = Array.from(new Set(allClasses.map((c) => c.academicBatch))).filter(Boolean);
    const years = Array.from(new Set(allClasses.map((c) => c.academicYear))).filter(Boolean);
    const semesters = Array.from(new Set(allClasses.map((c) => c.semester))).filter(Boolean);
    const classTypes = ['Lecture', 'Practical', 'Tutorial'];
    return { batches, years, semesters, classTypes };
  }, [allClasses]);

  // Filtered timetable dataset
  const filteredClasses = useMemo(() => {
    if (availableSubjects.length === 0) return [];
    const allowedCodes = new Set(availableSubjects.map((s) => (s.code || '').toUpperCase().trim()));
    const q = searchQuery.trim().toLowerCase();
    return allClasses.filter((session) => {
      // Must belong to this lecturer's assigned subjects or assigned directly
      const sessionCode = (session.subjectCode || '').toUpperCase().trim();
      if (!allowedCodes.has(sessionCode) && dbTimetableSlots.every((s) => (s.code || '').toUpperCase().trim() !== sessionCode)) {
        return false;
      }
      // Search query across subjectCode, subjectName, venue, topic, batch
      if (q) {
        const matchesQuery =
          session.subjectCode.toLowerCase().includes(q) ||
          session.subjectName.toLowerCase().includes(q) ||
          session.venue.toLowerCase().includes(q) ||
          (session.topic && session.topic.toLowerCase().includes(q)) ||
          session.academicBatch.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Filter: Subject
      if (filterSubject !== 'ALL' && session.subjectCode !== filterSubject) {
        return false;
      }

      // Filter: Batch
      if (filterBatch !== 'ALL' && session.academicBatch !== filterBatch) {
        return false;
      }

      // Filter: Academic Year
      if (filterYear !== 'ALL' && session.academicYear !== filterYear) {
        return false;
      }

      // Filter: Semester
      if (filterSemester !== 'ALL' && session.semester !== filterSemester) {
        return false;
      }

      // Filter: Class Type
      if (filterClassType !== 'ALL' && session.classType !== filterClassType) {
        return false;
      }

      return true;
    });
  }, [allClasses, availableSubjects, dbTimetableSlots, searchQuery, filterSubject, filterBatch, filterYear, filterSemester, filterClassType]);

  // Filter any scheduled weekend classes (Saturday = 6, Sunday = 7)
  const weekendClasses = useMemo(() => {
    return filteredClasses.filter((c) => c.dayOfWeek === 6 || c.dayOfWeek === 7);
  }, [filteredClasses]);

  // Check if any filter is active
  const isFiltered = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      filterSubject !== 'ALL' ||
      filterBatch !== 'ALL' ||
      filterYear !== 'ALL' ||
      filterSemester !== 'ALL' ||
      filterClassType !== 'ALL'
    );
  }, [searchQuery, filterSubject, filterBatch, filterYear, filterSemester, filterClassType]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterSubject('ALL');
    setFilterBatch('ALL');
    setFilterYear('ALL');
    setFilterSemester('ALL');
    setFilterClassType('ALL');
    if (onShowToast) {
      onShowToast('Timetable filters have been reset.', 'info');
    }
  };

  // Group classes by day of week (1 to 7)
  const classesByDay = useMemo(() => {
    const map = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
    filteredClasses.forEach((session) => {
      if (map[session.dayOfWeek]) {
        map[session.dayOfWeek].push(session);
      }
    });
    // Sort chronologically within each day
    Object.keys(map).forEach((dayKey) => {
      map[dayKey].sort((a, b) => {
        const timeA = (a.startHour || 0) * 60 + (a.startMinute || 0);
        const timeB = (b.startHour || 0) * 60 + (b.startMinute || 0);
        return timeA - timeB;
      });
    });
    return map;
  }, [filteredClasses]);

  // Calculate selected date object and day of week for Daily View
  const dailyDateInfo = useMemo(() => {
    const parts = selectedDateStr.split('-');
    const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const jsDay = dateObj.getDay(); // 0 is Sun, 1 is Mon ... 6 is Sat
    const dayOfWeek = jsDay === 0 ? 7 : jsDay; // 1 = Mon ... 7 = Sun

    const isToday = selectedDateStr === todayColomboStr;

    const formattedFull = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return {
      date: dateObj,
      dayOfWeek,
      isToday,
      formattedFull,
    };
  }, [selectedDateStr, todayColomboStr]);

  // Classes for the selected daily date
  const dailyClasses = useMemo(() => {
    return classesByDay[dailyDateInfo.dayOfWeek] || [];
  }, [classesByDay, dailyDateInfo.dayOfWeek]);

  // Handlers for Daily View date shifting
  const handleDailyShift = (days) => {
    const parts = selectedDateStr.split('-');
    const current = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    current.setDate(current.getDate() + days);
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    setSelectedDateStr(`${yyyy}-${mm}-${dd}`);
  };

  const handleJumpToTodayDaily = () => {
    setSelectedDateStr(todayColomboStr);
    if (onShowToast) onShowToast('Jumped to today’s schedule.', 'info');
  };

  // Export Timetable as CSV
  const handleExportCSV = () => {
    try {
      const headers = [
        'Day',
        'Timeslot',
        'Class Type',
        'Subject Code',
        'Subject Name',
        'Batch',
        'Semester',
        'Academic Year',
        'Venue',
        'Registered Students',
        'Topic',
      ];

      const rows = filteredClasses.map((c) => [
        `"${c.dayName}"`,
        `"${c.timeslot}"`,
        `"${c.classType}"`,
        `"${c.subjectCode}"`,
        `"${c.subjectName}"`,
        `"${c.academicBatch}"`,
        `"${c.semester}"`,
        `"${c.academicYear}"`,
        `"${c.venue}"`,
        `"${c.registeredStudentsCount}"`,
        `"${c.topic || ''}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `SEUConnect_Timetable_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (onShowToast) onShowToast('Timetable schedule exported successfully as CSV.', 'success');
    } catch {
      if (onShowToast) onShowToast('Failed to export timetable schedule.', 'error');
    }
  };

  // Summary counts
  const totalLectures = filteredClasses.filter((c) => c.classType === 'Lecture').length;
  const totalPracticals = filteredClasses.filter((c) => c.classType === 'Practical').length;
  const totalTutorials = filteredClasses.filter((c) => c.classType === 'Tutorial').length;

  if (availableSubjects.length === 0) {
    return (
      <div className="lec-timetable-container">
        <div className="lec-module-header-card">
          <div className="lec-timetable-header-left">
            <h2 className="lec-module-title">My Teaching Timetable</h2>
            <p className="lec-module-sub">
              Review allocated weekly teaching slots, lecture theatres, laboratory practical sessions,
              and academic tutorial hours. All schedules follow SEUSL Faculty of Technology academic allocations.
            </p>
          </div>
        </div>
        <div className="lec-empty-state-card" style={{ padding: '60px 24px', background: '#fff', borderRadius: '14px', border: '1px dashed #cbd5e1', textAlign: 'center', margin: '24px 0' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" style={{ margin: '0 auto 12px', display: 'block' }}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>No Teaching Schedule Allocated</h4>
          <p style={{ color: '#64748b', maxWidth: '440px', margin: '0 auto 16px', lineHeight: 1.5 }}>
            You currently have no course modules allocated for timetable scheduling. When your Head of Department (HOD) assigns subjects to you, your scheduled lecture and practical sessions will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lec-timetable-container">
      {/* 1. Header Banner */}
      <div className="lec-module-header-card">
        <div className="lec-timetable-header-left">
          <div className="lec-header-badge-row">
            <span className="lec-timetable-dept-pill">
              Faculty of Technology • Department of ICT
            </span>
            <span className="lec-timetable-term-pill">
              Academic Year 2025/2026 • Term II
            </span>
          </div>
          <h2 className="lec-module-title">My Teaching Timetable</h2>
          <p className="lec-module-sub">
            Review allocated weekly teaching slots, lecture theatres, laboratory practical sessions,
            and academic tutorial hours. All schedules follow SEUSL Faculty of Technology academic allocations.
          </p>
        </div>

        <div className="lec-timetable-header-actions">
          {/* View Mode Toggle Pill */}
          <div className="lec-timetable-view-toggle">
            <button
              type="button"
              className={`lec-toggle-btn ${viewMode === 'weekly' ? 'active' : ''}`}
              onClick={() => setViewMode('weekly')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Weekly View
            </button>
            <button
              type="button"
              className={`lec-toggle-btn ${viewMode === 'daily' ? 'active' : ''}`}
              onClick={() => setViewMode('daily')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Daily View
            </button>
          </div>

          <button
            type="button"
            className="lec-btn-export-timetable"
            onClick={handleExportCSV}
            title="Export filtered timetable as CSV"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Schedule
          </button>
        </div>
      </div>

      {/* 2. Search and Multi-field Filter Controls */}
      <div className="lec-timetable-filter-card">
        <div className="lec-timetable-filter-row">
          {/* Search Box */}
          <div className="lec-timetable-search-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by code (e.g. SWT21032), module, venue, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="lec-clear-search-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Subject Filter */}
          <div className="lec-filter-control">
            <label htmlFor="filter-subject">Subject</label>
            <select
              id="filter-subject"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            >
              <option value="ALL">All Assigned Subjects</option>
              {availableSubjects.map((sub) => (
                <option key={sub.code} value={sub.code}>
                  {sub.code} – {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Batch Filter */}
          <div className="lec-filter-control">
            <label htmlFor="filter-batch">Batch</label>
            <select
              id="filter-batch"
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
            >
              <option value="ALL">All Batches</option>
              {filterOptions.batches.map((b) => (
                <option key={b} value={b}>
                  Batch {b}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Year Filter */}
          <div className="lec-filter-control">
            <label htmlFor="filter-year">Academic Year</label>
            <select
              id="filter-year"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              <option value="ALL">All Academic Years</option>
              {filterOptions.years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div className="lec-filter-control">
            <label htmlFor="filter-semester">Semester</label>
            <select
              id="filter-semester"
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
            >
              <option value="ALL">All Semesters</option>
              {filterOptions.semesters.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Class Type Filter */}
          <div className="lec-filter-control">
            <label htmlFor="filter-type">Class Type</label>
            <select
              id="filter-type"
              value={filterClassType}
              onChange={(e) => setFilterClassType(e.target.value)}
            >
              <option value="ALL">All Class Types</option>
              <option value="Lecture">Lecture</option>
              <option value="Practical">Practical / Lab</option>
              <option value="Tutorial">Tutorial</option>
            </select>
          </div>

          {/* Reset Filters Action */}
          {isFiltered && (
            <button
              type="button"
              className="lec-btn-reset-timetable-filters"
              onClick={handleResetFilters}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Reset Filters
            </button>
          )}
        </div>

        {/* Filter Summary & Session Distribution Pills */}
        <div className="lec-timetable-summary-strip">
          <div className="lec-summary-strip-left">
            <span className="lec-summary-label">
              Showing <strong>{filteredClasses.length}</strong> of {LECTURER_TIMETABLE_CLASSES.length} weekly sessions:
            </span>
            <span className="lec-type-tag lecture">
              {totalLectures} Lectures
            </span>
            <span className="lec-type-tag practical">
              {totalPracticals} Practicals
            </span>
            <span className="lec-type-tag tutorial">
              {totalTutorials} Tutorials
            </span>
          </div>

          <div className="lec-summary-strip-right">
            <span className="lec-timezone-pill">
              🕒 Timezone: Asia/Colombo
            </span>
          </div>
        </div>
      </div>

      {/* 3. VIEW MODE: WEEKLY TIMETABLE */}
      {viewMode === 'weekly' && (
        <div className="lec-weekly-view-section">
          {/* Week Navigation Bar */}
          <div className="lec-week-nav-bar">
            <div className="lec-week-nav-left">
              <button
                type="button"
                className="lec-week-btn prev"
                onClick={() => setWeekOffset((prev) => prev - 1)}
                title="View previous week"
              >
                ← Prev Week
              </button>

              <button
                type="button"
                className={`lec-week-btn current ${weekOffset === 0 ? 'active' : ''}`}
                onClick={() => setWeekOffset(0)}
                title="Jump to current week"
              >
                Current Week (Today)
              </button>

              <button
                type="button"
                className="lec-week-btn next"
                onClick={() => setWeekOffset((prev) => prev + 1)}
                title="View next week"
              >
                Next Week →
              </button>
            </div>

            <div className="lec-week-nav-center">
              <span className="lec-week-range-text">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {weekRangeText}
              </span>
              {weekOffset !== 0 && (
                <span className="lec-offset-badge">
                  {weekOffset > 0 ? `+${weekOffset} Week${weekOffset > 1 ? 's' : ''}` : `${weekOffset} Week${weekOffset < -1 ? 's' : ''}`}
                </span>
              )}
            </div>

            <div className="lec-week-nav-right">
              <span className="lec-legend-item">
                <span className="legend-dot lecture" /> Lecture
              </span>
              <span className="lec-legend-item">
                <span className="legend-dot practical" /> Practical / Lab
              </span>
              <span className="lec-legend-item">
                <span className="legend-dot tutorial" /> Tutorial
              </span>
            </div>
          </div>

          {/* 5-Day Weekly Timetable Grid (Monday to Friday) */}
          <div className="lec-weekly-grid">
            {weekDays.map((day) => {
              const dayClasses = classesByDay[day.dayOfWeek] || [];

              return (
                <div
                  key={day.dayOfWeek}
                  className={`lec-day-column ${day.isToday ? 'is-today' : ''}`}
                >
                  {/* Day Column Header */}
                  <div className="lec-day-header">
                    <div className="lec-day-title-row">
                      <span className="lec-day-name">{day.dayName}</span>
                      {day.isToday && <span className="lec-today-chip">TODAY</span>}
                    </div>
                    <div className="lec-day-date-row">
                      <span className="lec-day-date">{day.formattedDate}</span>
                      <span className="lec-day-count-badge">
                        {dayClasses.length > 0 ? `${dayClasses.length} session${dayClasses.length > 1 ? 's' : ''}` : 'Free'}
                      </span>
                    </div>
                  </div>

                  {/* Day Class Cards */}
                  <div className="lec-day-content">
                    {dayClasses.length > 0 ? (
                      dayClasses.map((session) => (
                        <div
                          key={session.id}
                          className={`lec-tt-card type-${session.classType.toLowerCase()}`}
                          onClick={() => setSelectedClass({ ...session, calendarDate: day.fullDateString })}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setSelectedClass({ ...session, calendarDate: day.fullDateString });
                            }
                          }}
                        >
                          <div className="lec-tt-card-top">
                            <span className={`lec-tt-pill pill-${session.classType.toLowerCase()}`}>
                              {session.classType}
                            </span>
                            <span className="lec-tt-timeslot">{session.timeslot}</span>
                          </div>

                          <div className="lec-tt-code-line">
                            <span className="lec-tt-code">{session.subjectCode}</span>
                            <span className="lec-tt-batch">{session.academicBatch}</span>
                          </div>

                          <div className="lec-tt-name" title={session.subjectName}>
                            {session.subjectName}
                          </div>

                          <div className="lec-tt-meta-row">
                            <span className="lec-tt-venue" title={session.venue}>
                              📍 {session.venue.split('(')[0].trim()}
                            </span>
                            <span className="lec-tt-students">
                              👥 {session.registeredStudentsCount}
                            </span>
                          </div>

                          {session.topic && (
                            <div className="lec-tt-topic" title={session.topic}>
                              <span className="topic-prefix">Topic:</span> {session.topic}
                            </div>
                          )}

                          <div className="lec-tt-card-footer">
                            <span className="lec-tt-details-hint">View details →</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="lec-free-day-slot">
                        <div className="free-slot-icon">📖</div>
                        <div className="free-slot-title">No Classes Scheduled</div>
                        <div className="free-slot-sub">Allocated for grading, course prep, and research</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Special Weekend Classes Section (Displayed separately only if weekend classes exist) */}
          {weekendClasses.length > 0 && (
            <div className="lec-weekend-classes-section">
              <div className="lec-weekend-section-header">
                <div className="lec-weekend-header-title">
                  <span className="lec-weekend-badge">Weekend Sessions</span>
                  <h4>Special & Makeup Weekend Sessions ({weekendClasses.length})</h4>
                </div>
                <p className="lec-weekend-header-desc">
                  These classes are officially scheduled on Saturday or Sunday by faculty arrangement.
                </p>
              </div>

              <div className="lec-weekend-classes-grid">
                {weekendClasses.map((session) => (
                  <div
                    key={session.id}
                    className={`lec-tt-card type-${session.classType.toLowerCase()} lec-weekend-card`}
                    onClick={() => setSelectedClass({ ...session, calendarDate: session.dayName })}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedClass({ ...session, calendarDate: session.dayName });
                      }
                    }}
                  >
                    <div className="lec-tt-card-top">
                      <span className={`lec-tt-pill pill-${session.classType.toLowerCase()}`}>
                        {session.classType}
                      </span>
                      <span className="lec-tt-timeslot">{session.dayName} • {session.timeslot}</span>
                    </div>

                    <div className="lec-tt-code-line">
                      <span className="lec-tt-code">{session.subjectCode}</span>
                      <span className="lec-tt-batch">{session.academicBatch}</span>
                    </div>

                    <div className="lec-tt-name" title={session.subjectName}>
                      {session.subjectName}
                    </div>

                    <div className="lec-tt-meta-row">
                      <span className="lec-tt-venue" title={session.venue}>
                        📍 {session.venue.split('(')[0].trim()}
                      </span>
                      <span className="lec-tt-students">
                        👥 {session.registeredStudentsCount}
                      </span>
                    </div>

                    {session.topic && (
                      <div className="lec-tt-topic" title={session.topic}>
                        <span className="topic-prefix">Topic:</span> {session.topic}
                      </div>
                    )}

                    <div className="lec-tt-card-footer">
                      <span className="lec-tt-details-hint">View details →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. VIEW MODE: DAILY TIMETABLE */}
      {viewMode === 'daily' && (
        <div className="lec-daily-view-section">
          {/* Daily Date Selector Header Bar */}
          <div className="lec-daily-nav-card">
            <div className="lec-daily-nav-left">
              <button
                type="button"
                className="lec-daily-btn prev"
                onClick={() => handleDailyShift(-1)}
                title="Previous Day"
              >
                ← Previous Day
              </button>

              <div className="lec-daily-picker-wrap">
                <label htmlFor="daily-date-picker" className="lec-daily-picker-label">
                  Select Date:
                </label>
                <input
                  id="daily-date-picker"
                  type="date"
                  className="lec-daily-date-input"
                  value={selectedDateStr}
                  onChange={(e) => setSelectedDateStr(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="lec-daily-btn next"
                onClick={() => handleDailyShift(1)}
                title="Next Day"
              >
                Next Day →
              </button>

              <button
                type="button"
                className={`lec-daily-btn today ${dailyDateInfo.isToday ? 'active' : ''}`}
                onClick={handleJumpToTodayDaily}
              >
                Today
              </button>
            </div>

            <div className="lec-daily-nav-right">
              <div className="lec-daily-active-banner">
                <span className="daily-active-date">{dailyDateInfo.formattedFull}</span>
                {dailyDateInfo.isToday ? (
                  <span className="daily-today-badge">Active Academic Day</span>
                ) : (
                  <span className="daily-other-badge">Schedule for {dailyDateInfo.date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                )}
              </div>
            </div>
          </div>

          {/* Daily Chronological List */}
          <div className="lec-daily-schedule-wrapper">
            {dailyClasses.length > 0 ? (
              <div className="lec-daily-timeline-list">
                {dailyClasses.map((session, idx) => {
                  const timeStatus = getSessionTimeStatus(session, dailyDateInfo.isToday);

                  return (
                    <div
                      key={session.id}
                      className={`lec-daily-session-card type-${session.classType.toLowerCase()}`}
                    >
                      {/* Left: Time & Realtime Status */}
                      <div className="lec-daily-left-col">
                        <div className="lec-daily-time">{session.timeslot}</div>
                        <div className="lec-daily-duration">⏱ {session.duration}</div>
                        <span className={`lec-daily-status-tag ${timeStatus.cls}`}>
                          {dailyDateInfo.isToday && <span className="status-live-dot" />}
                          {timeStatus.label}
                        </span>
                      </div>

                      {/* Center: Class Details */}
                      <div className="lec-daily-center-col">
                        <div className="lec-daily-badges-row">
                          <span className={`lec-tt-pill pill-${session.classType.toLowerCase()}`}>
                            {session.classType}
                          </span>
                          <span className="lec-daily-batch-pill">
                            Batch {session.academicBatch}
                          </span>
                          <span className="lec-daily-degree-pill">
                            {session.degreeProgramme}
                          </span>
                          <span className="lec-daily-sem-pill">
                            {session.semester} • {session.academicYear}
                          </span>
                        </div>

                        <div className="lec-daily-title-row">
                          <span className="lec-daily-code">{session.subjectCode}:</span>
                          <h4 className="lec-daily-name">{session.subjectName}</h4>
                        </div>

                        <div className="lec-daily-info-grid">
                          <div className="info-item">
                            <span className="info-lbl">Venue:</span>
                            <span className="info-val">📍 {session.venue}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-lbl">Registered Students:</span>
                            <span className="info-val">👥 {session.registeredStudentsCount} Enrolled</span>
                          </div>
                          <div className="info-item">
                            <span className="info-lbl">Session Order:</span>
                            <span className="info-val">Session #{idx + 1} of the day</span>
                          </div>
                        </div>

                        {session.topic && (
                          <div className="lec-daily-topic-box">
                            <span className="topic-tag">Session Topic:</span>
                            <span className="topic-text">{session.topic}</span>
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="lec-daily-right-col">
                        <button
                          type="button"
                          className="lec-btn-daily-details"
                          onClick={() => setSelectedClass({ ...session, calendarDate: dailyDateInfo.formattedFull })}
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          className="lec-btn-daily-attendance"
                          onClick={() => {
                            if (onShowToast) onShowToast(`Opening attendance for ${session.subjectCode}`, 'info');
                            onNavigateModule('attendance', { subjectCode: session.subjectCode });
                          }}
                        >
                          Mark Attendance
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="lec-daily-empty-card">
                <div className="daily-empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    <path d="m9 16 2 2 4-4" />
                  </svg>
                </div>
                <h3 className="daily-empty-title">No Classes Scheduled for This Day</h3>
                <p className="daily-empty-desc">
                  There are no lecture, laboratory, or tutorial sessions scheduled for{' '}
                  <strong>{dailyDateInfo.formattedFull}</strong>.
                  {dailyDateInfo.dayOfWeek >= 6
                    ? ' The faculty is closed for regular undergraduate teaching on weekends.'
                    : ' This period is free for academic research, lesson preparations, or student consultations.'}
                </p>
                <div className="daily-empty-actions">
                  <button
                    type="button"
                    className="lec-btn-switch-weekly"
                    onClick={() => setViewMode('weekly')}
                  >
                    View Full Weekly Timetable
                  </button>
                  {!dailyDateInfo.isToday && (
                    <button
                      type="button"
                      className="lec-btn-jump-today"
                      onClick={handleJumpToTodayDaily}
                    >
                      Jump to Today’s Classes
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. CLASS DETAILS MODAL */}
      {selectedClass && (
        <div
          className="lec-modal-backdrop"
          onClick={() => setSelectedClass(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="lec-modal-card lec-timetable-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="lec-modal-header">
              <div className="lec-modal-title-wrap">
                <span className={`lec-tt-pill pill-${selectedClass.classType.toLowerCase()}`}>
                  {selectedClass.classType} Session
                </span>
                <h3 className="lec-modal-title">Teaching Session Details</h3>
              </div>
              <button
                type="button"
                className="lec-modal-close-btn"
                onClick={() => setSelectedClass(null)}
                aria-label="Close details"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="lec-modal-body">
              {/* Subject Hero */}
              <div className="lec-detail-hero">
                <div className="hero-code-row">
                  <span className="hero-code-badge">{selectedClass.subjectCode}</span>
                  <span className="hero-sem-badge">
                    {selectedClass.semester} • {selectedClass.academicYear}
                  </span>
                </div>
                <h3 className="hero-subject-name">{selectedClass.subjectName}</h3>
                <div className="hero-degree-line">
                  {selectedClass.degreeProgramme} • Faculty of Technology
                </div>
              </div>

              {/* 2-Column Info Grid */}
              <div className="lec-detail-info-grid">
                <div className="detail-field">
                  <span className="field-label">Scheduled Day & Date</span>
                  <span className="field-value highlight">
                    🗓 {selectedClass.dayName}
                    {selectedClass.calendarDate ? ` (${selectedClass.calendarDate})` : ''}
                  </span>
                </div>

                <div className="detail-field">
                  <span className="field-label">Allocated Time</span>
                  <span className="field-value highlight">
                    ⏱ {selectedClass.timeslot} ({selectedClass.duration})
                  </span>
                </div>

                <div className="detail-field">
                  <span className="field-label">Class Venue / Facility</span>
                  <span className="field-value">
                    📍 {selectedClass.venue}
                  </span>
                </div>

                <div className="detail-field">
                  <span className="field-label">Student Cohort / Batch</span>
                  <span className="field-value">
                    🎓 Batch {selectedClass.academicBatch}
                  </span>
                </div>

                <div className="detail-field">
                  <span className="field-label">Registered Student Count</span>
                  <span className="field-value">
                    👥 {selectedClass.registeredStudentsCount} Students Enrolled
                  </span>
                </div>

                <div className="detail-field">
                  <span className="field-label">Assigned Lecturer</span>
                  <span className="field-value">
                    👨‍🏫 {selectedClass.lecturerName} ({selectedClass.lecturerId})
                  </span>
                </div>
              </div>

              {/* Session Topic */}
              {selectedClass.topic && (
                <div className="lec-detail-topic-card">
                  <div className="topic-card-header">
                    <span className="topic-icon">🎯</span>
                    <strong>Syllabus / Lecture Topic:</strong>
                  </div>
                  <p className="topic-card-body">{selectedClass.topic}</p>
                </div>
              )}

              {/* Session Notes / Instructions */}
              {selectedClass.notes && (
                <div className="lec-detail-notes-card">
                  <div className="notes-card-header">
                    <span className="notes-icon">📝</span>
                    <strong>Lecturer Notes & Preparation:</strong>
                  </div>
                  <p className="notes-card-body">{selectedClass.notes}</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="lec-modal-footer">
              <div className="modal-footer-left">
                <button
                  type="button"
                  className="lec-btn-take-attendance"
                  onClick={() => {
                    setSelectedClass(null);
                    if (onShowToast) {
                      onShowToast(`Navigating to attendance roster for ${selectedClass.subjectCode}`, 'info');
                    }
                    onNavigateModule('attendance', { subjectCode: selectedClass.subjectCode });
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  Mark Attendance for Session
                </button>

                <button
                  type="button"
                  className="lec-btn-view-module-spec"
                  onClick={() => {
                    setSelectedClass(null);
                    onNavigateModule('subjects', { subjectCode: selectedClass.subjectCode });
                  }}
                >
                  View Course Module Specs
                </button>
              </div>

              <button
                type="button"
                className="lec-btn-close-modal"
                onClick={() => setSelectedClass(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

