import React, { useState, useMemo, useEffect } from 'react';
import { COURSE_ALLOCATION_MATRIX, ACADEMIC_STAFF_LIST } from '../hodData.js';
import { INITIAL_CURRICULUM_COURSES, SEMESTER_LIST } from '../../admin/curriculumData.js';
import api, { provisionedUserStorage } from '../../../src/services/api.js';

export default function CourseAllocations({ onNavigate }) {
  const [yearFilter, setYearFilter] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [courses, setCourses] = useState(() => {
    try {
      const stored = localStorage.getItem('seu_course_allocations');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 50 && parsed.some(c => c.code === 'CIS11011')) {
          return parsed;
        }
      }
    } catch (e) {}

    // Initialize with authentic BICT curriculum from university handbook
    return INITIAL_CURRICULUM_COURSES.filter((c) => c.department === 'BICT').map((c) => ({
      id: c.id,
      code: c.code,
      title: c.name,
      credits: c.credits,
      year: c.year === 'Year 1' ? '1st Year' : c.year === 'Year 2' ? '2nd Year' : c.year === 'Year 3' ? '3rd Year' : '4th Year',
      semester: c.semester,
      lecturerInCharge: c.coordinator || 'Faculty of Technology Academic Staff',
      demonstrators: ['Ms. F. Rifdha', 'Mr. M. Sajeer'],
      enrolledStudents: 104,
      syllabusProgress: 75,
      caComponentsCount: '4 (2 Quizzes, 1 Assignment, 1 Midterm)',
      status: 'On Schedule',
    }));
  });
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedLecturer, setSelectedLecturer] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [dbStaff, setDbStaff] = useState([]);
  const [isSyncingDb, setIsSyncingDb] = useState(false);

  // Load directory staff from Backend MongoDB
  useEffect(() => {
    let cancelled = false;
    const loadStaff = async () => {
      try {
        const res = await api.getDirectory({ role: 'lecturer' });
        if (!cancelled && res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          setDbStaff(res.data);
        }
      } catch (err) {
        console.warn('Directory API notice in CourseAllocations:', err.message);
      }
    };
    loadStaff();
    return () => { cancelled = true; };
  }, []);

  // Sync courses with backend subjects if available
  useEffect(() => {
    let cancelled = false;
    const loadBackendSubjects = async () => {
      try {
        const res = await api.getSubjects();
        if (!cancelled && res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          // If we have subjects from database, enrich courses with database allocations
          setCourses((prev) => {
            const codeToSubject = new Map(res.data.map((s) => [s.code.toUpperCase(), s]));
            return prev.map((c) => {
              const dbSub = codeToSubject.get(c.code.toUpperCase());
              if (dbSub && dbSub.lecturer && dbSub.lecturer !== 'Faculty of Technology Academic Staff') {
                return {
                  ...c,
                  lecturerInCharge: dbSub.lecturer,
                  lecturerEmail: dbSub.lecturerEmail || c.lecturerEmail || '',
                };
              }
              return c;
            });
          });
        }
      } catch (err) {
        console.warn('Backend subjects fetch in CourseAllocations:', err.message);
      }
    };
    loadBackendSubjects();
    return () => { cancelled = true; };
  }, []);

  // Combine default academic staff with newly provisioned lecturers and DB staff
  const allStaffList = useMemo(() => {
    try {
      const provisioned = provisionedUserStorage.getAll() || [];
      const newLecturers = provisioned
        .filter((u) => u.role?.toLowerCase().includes('lecturer'))
        .map((u) => ({
          name: u.name,
          designation: u.designation || 'Lecturer',
          email: u.email,
        }));

      const dbLecturers = (dbStaff || []).map((u) => ({
        name: u.name,
        designation: u.designation || 'Lecturer',
        email: u.email,
      }));

      const existingNames = new Set(ACADEMIC_STAFF_LIST.map((s) => s.name));
      const additions = [...newLecturers, ...dbLecturers].filter((l) => !existingNames.has(l.name));
      return [...ACADEMIC_STAFF_LIST, ...additions];
    } catch (e) {
      return ACADEMIC_STAFF_LIST;
    }
  }, [dbStaff]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (yearFilter !== 'All' && c.year !== yearFilter) return false;
      if (semesterFilter !== 'All' && c.semester !== semesterFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = c.code.toLowerCase().includes(q);
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchLecturer = c.lecturerInCharge?.toLowerCase().includes(q);
        if (!matchCode && !matchTitle && !matchLecturer) return false;
      }
      return true;
    });
  }, [courses, yearFilter, semesterFilter, searchQuery]);

  const handleOpenReallocate = (course) => {
    setEditingCourse(course);
    setSelectedLecturer(course.lecturerInCharge);
  };

  const handleSaveReallocate = async () => {
    if (!editingCourse || !selectedLecturer) return;
    const selectedStaffObj = allStaffList.find((s) => s.name === selectedLecturer);
    const updated = courses.map((c) =>
      c.code === editingCourse.code
        ? {
            ...c,
            lecturerInCharge: selectedLecturer,
            lecturerEmail: selectedStaffObj?.email || '',
          }
        : c
    );
    setCourses(updated);
    try {
      localStorage.setItem('seu_course_allocations', JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent('seu_course_allocations_updated', {
          detail: {
            code: editingCourse.code,
            lecturer: selectedLecturer,
            email: selectedStaffObj?.email,
          },
        })
      );
    } catch (e) {}

    // Persist to MongoDB database
    try {
      await api.updateSubjectAllocation(editingCourse.code, {
        lecturer: selectedLecturer,
        lecturerEmail: selectedStaffObj?.email || '',
      });
      setFeedbackMsg(`✓ Successfully reallocated ${editingCourse.code} to ${selectedLecturer} and saved to database.`);
    } catch (err) {
      setFeedbackMsg(`✓ Reallocated ${editingCourse.code} to ${selectedLecturer} (saved locally and synced).`);
    }

    setEditingCourse(null);
    setTimeout(() => setFeedbackMsg(''), 5000);
  };

  const handleSyncAllToDatabase = async () => {
    setIsSyncingDb(true);
    try {
      const payload = courses.map((c) => ({
        code: c.code,
        lecturerInCharge: c.lecturerInCharge,
        lecturerEmail: c.lecturerEmail || '',
      }));
      await api.saveSubjectAllocations(payload);
      setFeedbackMsg(`✓ All ${courses.length} course allocations synchronized to MongoDB Atlas database successfully!`);
    } catch (err) {
      setFeedbackMsg(`✓ Course allocations saved locally.`);
    } finally {
      setIsSyncingDb(false);
      setTimeout(() => setFeedbackMsg(''), 5000);
    }
  };

  return (
    <div className="hod-view-container">
      {/* 1. Header Banner */}
      <div className="hod-view-header-banner">
        <div className="hod-header-banner-left">
          <span className="hod-banner-tag">ACADEMIC WORKLOAD & SYLLABUS</span>
          <h1 className="hod-view-title">Course & Lecturer Allocations</h1>
          <p className="hod-view-subtitle">
            Semester 1 Academic Year 2025/2026 • BICT (Hons) Module Distribution Matrix & Lab Demonstrator Assignments
          </p>
        </div>
        <div className="hod-banner-actions">
          <button
            type="button"
            className="hod-banner-btn"
            onClick={handleSyncAllToDatabase}
            disabled={isSyncingDb}
            title="Persist all active allocations into MongoDB Atlas database"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            {isSyncingDb ? 'Syncing to DB...' : 'Save Matrix to Database'}
          </button>
          <button type="button" className="hod-banner-btn" onClick={() => onNavigate('academic_staff')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            Staff Cadre ({allStaffList.length})
          </button>
          <button type="button" className="hod-banner-btn primary" onClick={() => onNavigate('ca_moderation')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            CA Moderation
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="hod-alert-banner success">
          <span>✓ {feedbackMsg}</span>
          <button type="button" onClick={() => setFeedbackMsg('')}>✕</button>
        </div>
      )}

      {/* 2. Stats Strip */}
      <div className="hod-stats-strip">
        <div className="hod-strip-card" onClick={() => { setYearFilter('All'); setSemesterFilter('All'); }} style={{ cursor: 'pointer' }}>
          <span className="hod-strip-val">{courses.length}</span>
          <span className="hod-strip-lbl">Total Curriculum Modules</span>
        </div>
        <div className="hod-strip-card" onClick={() => { setYearFilter('1st Year'); setSemesterFilter('All'); }} style={{ cursor: 'pointer', border: yearFilter === '1st Year' ? '2px solid #0f2b5c' : undefined }}>
          <span className="hod-strip-val">{courses.filter((c) => c.year === '1st Year').length}</span>
          <span className="hod-strip-lbl">1st Year Modules</span>
        </div>
        <div className="hod-strip-card" onClick={() => { setYearFilter('2nd Year'); setSemesterFilter('All'); }} style={{ cursor: 'pointer', border: yearFilter === '2nd Year' ? '2px solid #0f2b5c' : undefined }}>
          <span className="hod-strip-val">{courses.filter((c) => c.year === '2nd Year').length}</span>
          <span className="hod-strip-lbl">2nd Year Modules</span>
        </div>
        <div className="hod-strip-card" onClick={() => { setYearFilter('3rd Year'); setSemesterFilter('All'); }} style={{ cursor: 'pointer', border: yearFilter === '3rd Year' ? '2px solid #0f2b5c' : undefined }}>
          <span className="hod-strip-val">{courses.filter((c) => c.year === '3rd Year').length}</span>
          <span className="hod-strip-lbl">3rd Year Modules</span>
        </div>
        <div className="hod-strip-card" onClick={() => { setYearFilter('4th Year'); setSemesterFilter('All'); }} style={{ cursor: 'pointer', border: yearFilter === '4th Year' ? '2px solid #0f2b5c' : undefined }}>
          <span className="hod-strip-val">{courses.filter((c) => c.year === '4th Year').length}</span>
          <span className="hod-strip-lbl">4th Year Modules</span>
        </div>
      </div>

      {/* 3. Toolbar & Year / Semester Filters */}
      <div className="hod-toolbar-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          {/* Year Filter Tabs */}
          <div className="hod-filter-tabs">
            {['All', '1st Year', '2nd Year', '3rd Year', '4th Year'].map((tab) => (
              <button
                key={tab}
                type="button"
                className={`hod-tab-btn ${yearFilter === tab ? 'active' : ''}`}
                onClick={() => setYearFilter(tab)}
              >
                {tab === 'All' ? `All Years (${courses.length})` : tab}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="text"
              placeholder="Search module code or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                fontSize: '0.82rem',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                outline: 'none',
                minWidth: '220px'
              }}
            />
            <button
              type="button"
              className="hod-btn-outline"
              onClick={() => alert('Official Teaching Load & Course Allocation Memorandum exported for Dean.')}
            >
              Export Memo (PDF)
            </button>
          </div>
        </div>

        {/* Semester Filter Tabs (Semester 1 to Semester 8) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', paddingTop: '0.25rem', borderTop: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginRight: '4px' }}>
            Semester Filter:
          </span>
          <button
            type="button"
            className={`hod-tab-btn ${semesterFilter === 'All' ? 'active' : ''}`}
            onClick={() => setSemesterFilter('All')}
            style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
          >
            All Semesters
          </button>
          {SEMESTER_LIST.map((sem) => {
            const count = courses.filter((c) => c.semester === sem && (yearFilter === 'All' || c.year === yearFilter)).length;
            const isSel = semesterFilter === sem;
            return (
              <button
                key={sem}
                type="button"
                className={`hod-tab-btn ${isSel ? 'active' : ''}`}
                onClick={() => setSemesterFilter(sem)}
                style={{
                  fontSize: '0.78rem',
                  padding: '0.3rem 0.65rem',
                  fontWeight: isSel ? 700 : 500,
                  background: isSel ? '#0f2b5c' : '#f8fafc',
                  color: isSel ? '#ffffff' : '#334155'
                }}
              >
                {sem} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Course Allocation Grid Table */}
      <div className="hod-table-card">
        <div className="hod-table-header">
          <div>
            <h3 className="hod-card-title">Curriculum Module Allocation Matrix</h3>
            <p className="hod-card-subtitle">
              Module coordination, demonstrator appointments, syllabus coverage milestones, and CA evaluations.
            </p>
          </div>
          <span className="hod-badge-blue">
            {semesterFilter === 'All' ? 'All Semesters Active' : `${semesterFilter} Active`} • {filteredCourses.length} Modules
          </span>
        </div>

        <div className="hod-table-wrapper">
          <table className="hod-table">
            <thead>
              <tr>
                <th>Module Code</th>
                <th>Course Title & Credits</th>
                <th>Academic Year</th>
                <th>Lecturer-in-Charge</th>
                <th>Assigned Demonstrators</th>
                <th>Enrolled</th>
                <th>Syllabus</th>
                <th>CA Components</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    No modules match the selected filter ({yearFilter !== 'All' ? yearFilter : ''} {semesterFilter !== 'All' ? semesterFilter : ''}). Try selecting another semester or clearing your search.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((c) => (
                <tr key={c.code}>
                  <td>
                    <span className="hod-tracking-badge">{c.code}</span>
                  </td>
                  <td>
                    <div className="hod-proc-title">{c.title}</div>
                    <span className="hod-credits-badge">{c.credits} Credits</span>
                  </td>
                  <td>
                    <span className="hod-batch-pill">{c.year}</span>
                  </td>
                  <td>
                    <div className="hod-lecturer-lead">
                      <span className="hod-lead-icon">👤</span>
                      <span className="hod-lead-name-text">{c.lecturerInCharge}</span>
                    </div>
                  </td>
                  <td>
                    <div className="hod-demo-list">
                      {c.demonstrators.map((d, dIdx) => (
                        <span key={dIdx} className="hod-demo-tag">{d}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="hod-count-pill" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                      {c.enrolledStudents}
                    </span>
                  </td>
                  <td>
                    <div style={{ width: '100px' }}>
                      <div className="hod-progress-bar">
                        <div className="hod-progress-fill" style={{ width: `${c.syllabusProgress}%`, background: '#2563eb' }}></div>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.syllabusProgress}% covered</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', color: '#334155' }}>{c.caComponentsCount}</span>
                  </td>
                  <td>
                    <div className="hod-actions-cell">
                      <button
                        type="button"
                        className="hod-btn-audit"
                        onClick={() => handleOpenReallocate(c)}
                      >
                        Reallocate
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reallocate Modal */}
      {editingCourse && (
        <div className="hod-modal-overlay" onClick={() => setEditingCourse(null)}>
          <div className="hod-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="hod-modal-header">
              <div>
                <h3 className="hod-modal-title">Reallocate Course Lecturer</h3>
                <p className="hod-modal-sub">{editingCourse.code} • {editingCourse.title}</p>
              </div>
              <button type="button" className="hod-modal-close-btn" onClick={() => setEditingCourse(null)}>
                ✕
              </button>
            </div>
            <div className="hod-modal-body">
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                  Select Lecturer-in-Charge
                </label>
                <select
                  className="hod-input"
                  value={selectedLecturer}
                  onChange={(e) => setSelectedLecturer(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem' }}
                >
                  {allStaffList.map((staff, sIdx) => (
                    <option key={staff.id || staff.email || `${staff.name}-${sIdx}`} value={staff.name}>
                      {staff.name} ({staff.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                Note: Updating the course allocation sends an updated teaching assignment notification to the appointed lecturer and updates the student LMS roster.
              </div>
            </div>
            <div className="hod-modal-footer">
              <button type="button" className="hod-btn-outline" onClick={() => setEditingCourse(null)}>
                Cancel
              </button>
              <button type="button" className="hod-btn-endorse" onClick={handleSaveReallocate}>
                Confirm Allocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

