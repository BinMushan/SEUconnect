import React, { useState, useMemo } from 'react';
import { COURSE_ALLOCATION_MATRIX, ACADEMIC_STAFF_LIST } from '../hodData.js';
import { provisionedUserStorage } from '../../../src/services/api.js';

export default function CourseAllocations({ onNavigate }) {
  const [yearFilter, setYearFilter] = useState('All');
  const [courses, setCourses] = useState(() => {
    try {
      const stored = localStorage.getItem('seu_course_allocations');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return COURSE_ALLOCATION_MATRIX;
  });
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedLecturer, setSelectedLecturer] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Combine default academic staff with newly provisioned lecturers
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
      const existingNames = new Set(ACADEMIC_STAFF_LIST.map((s) => s.name));
      const additions = newLecturers.filter((l) => !existingNames.has(l.name));
      return [...ACADEMIC_STAFF_LIST, ...additions];
    } catch (e) {
      return ACADEMIC_STAFF_LIST;
    }
  }, []);

  const filteredCourses = courses.filter((c) => {
    return yearFilter === 'All' || c.year === yearFilter;
  });

  const handleOpenReallocate = (course) => {
    setEditingCourse(course);
    setSelectedLecturer(course.lecturerInCharge);
  };

  const handleSaveReallocate = () => {
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
    } catch (e) {}
    setFeedbackMsg(`Successfully reallocated ${editingCourse.code} to ${selectedLecturer}.`);
    setEditingCourse(null);
    setTimeout(() => setFeedbackMsg(''), 4000);
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
          <button type="button" className="hod-banner-btn" onClick={() => onNavigate('academic_staff')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            Staff Cadre ({ACADEMIC_STAFF_LIST.length})
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
        <div className="hod-strip-card" onClick={() => setYearFilter('All')} style={{ cursor: 'pointer' }}>
          <span className="hod-strip-val">{courses.length}</span>
          <span className="hod-strip-lbl">Total Semester Modules</span>
        </div>
        <div className="hod-strip-card" onClick={() => setYearFilter('3rd Year')} style={{ cursor: 'pointer' }}>
          <span className="hod-strip-val">4</span>
          <span className="hod-strip-lbl">3rd Year Modules</span>
        </div>
        <div className="hod-strip-card" onClick={() => setYearFilter('2nd Year')} style={{ cursor: 'pointer' }}>
          <span className="hod-strip-val">2</span>
          <span className="hod-strip-lbl">2nd Year Modules</span>
        </div>
        <div className="hod-strip-card" onClick={() => setYearFilter('1st Year')} style={{ cursor: 'pointer' }}>
          <span className="hod-strip-val">1</span>
          <span className="hod-strip-lbl">1st Year Modules</span>
        </div>
        <div className="hod-strip-card" onClick={() => setYearFilter('4th Year')} style={{ cursor: 'pointer' }}>
          <span className="hod-strip-val">1</span>
          <span className="hod-strip-lbl">4th Year Modules</span>
        </div>
      </div>

      {/* 3. Toolbar & Year Filter */}
      <div className="hod-toolbar-card">
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
        <div>
          <button
            type="button"
            className="hod-btn-outline"
            onClick={() => alert('Official Teaching Load & Course Allocation Memorandum exported for Dean.')}
          >
            Export Formal Allocation Memo (PDF)
          </button>
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
          <span className="hod-badge-blue">Semester 1 Active</span>
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
              {filteredCourses.map((c) => (
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
              ))}
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
                  {allStaffList.map((staff) => (
                    <option key={staff.id} value={staff.name}>
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

