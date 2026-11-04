import { useState, useMemo } from 'react';
import { INITIAL_CURRICULUM_COURSES, SEMESTER_LIST } from '../curriculumData.js';

/**
 * SEUConnect - Course Allocation & Semester Curriculum Engine
 * System Admin can:
 * 1. Manage & allocate default subjects across all 8 semesters for BICT and BST.
 * 2. Add, edit, or remove courses per semester.
 * 3. Execute automated Cohort Promotion & Course Auto-Shift:
 *    When a batch moves to the next semester, automatically advance students
 *    and shift curriculum courses for all enrolled students in that batch.
 */
export default function CourseAllocationManagement({
  batches = [],
  students = [],
  onPromoteBatch,
  onShowToast,
  onAddAuditLog
}) {
  const [courses, setCourses] = useState(INITIAL_CURRICULUM_COURSES);
  const [selectedDept, setSelectedDept] = useState('BICT'); // 'BICT' | 'BST'
  const [selectedSemester, setSelectedSemester] = useState('Semester 3');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [viewingSyllabusCourse, setViewingSyllabusCourse] = useState(null);

  // Form states for Add/Edit
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseDept, setCourseDept] = useState('BICT');
  const [courseSem, setCourseSem] = useState('Semester 3');
  const [courseCredits, setCourseCredits] = useState('3');
  const [courseType, setCourseType] = useState('Core');
  const [courseCoordinator, setCourseCoordinator] = useState('');
  const [coursePrerequisites, setCoursePrerequisites] = useState('None');
  const [courseHours, setCourseHours] = useState('45 Lecture Hrs');
  const [formError, setFormError] = useState('');

  // Promote Batch Modal states
  const [selectedBatchId, setSelectedBatchId] = useState(batches[3]?.id || 'BATCH-04');
  const [promoteDeptScope, setPromoteDeptScope] = useState('BOTH'); // 'BOTH' | 'BICT' | 'BST'
  const [autoRegisterStudents, setAutoRegisterStudents] = useState(true);

  // Compute selected batch details
  const selectedBatch = useMemo(() => {
    return batches.find((b) => b.id === selectedBatchId) || batches[0];
  }, [batches, selectedBatchId]);

  // Determine next semester for the selected batch
  const nextSemester = useMemo(() => {
    if (!selectedBatch) return 'Semester 2';
    const currentSemName = selectedBatch.currentSemester || 'Semester 1';
    const semIndex = SEMESTER_LIST.findIndex((s) => currentSemName.includes(s));
    if (semIndex !== -1 && semIndex < SEMESTER_LIST.length - 1) {
      return SEMESTER_LIST[semIndex + 1];
    }
    return 'Graduated / Finalized';
  }, [selectedBatch]);

  // Upcoming courses for the target next semester based on selected department scope
  const upcomingNextSemCourses = useMemo(() => {
    if (!nextSemester || nextSemester.includes('Graduated')) return [];
    return courses.filter((c) => {
      if (c.semester !== nextSemester) return false;
      if (promoteDeptScope === 'BICT') return c.department === 'BICT';
      if (promoteDeptScope === 'BST') return c.department === 'BST';
      return true;
    });
  }, [courses, nextSemester, promoteDeptScope]);

  // Filtered courses for current view
  const currentSemesterCourses = useMemo(() => {
    return courses.filter((c) => {
      if (c.department !== selectedDept) return false;
      if (c.semester !== selectedSemester) return false;
      if (typeFilter !== 'ALL' && c.type !== typeFilter) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchCode = c.code.toLowerCase().includes(query);
        const matchName = c.name.toLowerCase().includes(query);
        const matchCoord = c.coordinator.toLowerCase().includes(query);
        if (!matchCode && !matchName && !matchCoord) return false;
      }
      return true;
    });
  }, [courses, selectedDept, selectedSemester, typeFilter, searchTerm]);

  // Credits in current selected semester
  const semesterTotalCredits = useMemo(() => {
    return currentSemesterCourses.reduce((sum, c) => sum + (c.credits || 0), 0);
  }, [currentSemesterCourses]);

  // Open modal for editing
  const openEditModal = (course) => {
    setEditingCourse(course);
    setCourseCode(course.code);
    setCourseName(course.name);
    setCourseDept(course.department);
    setCourseSem(course.semester);
    setCourseCredits(String(course.credits));
    setCourseType(course.type);
    setCourseCoordinator(course.coordinator);
    setCoursePrerequisites(course.prerequisites || 'None');
    setCourseHours(course.hours || '45 Lecture Hrs');
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Open modal for creating
  const openAddModal = () => {
    setEditingCourse(null);
    setCourseCode('');
    setCourseName('');
    setCourseDept(selectedDept);
    setCourseSem(selectedSemester);
    setCourseCredits('3');
    setCourseType('Core');
    setCourseCoordinator('');
    setCoursePrerequisites('None');
    setCourseHours('30 Lecture Hrs • 30 Lab Hrs');
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Handle Add/Edit Submit
  const handleCourseSubmit = (e) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseName.trim()) {
      setFormError('Please enter both Course Code and Course Title.');
      return;
    }

    if (editingCourse) {
      // Update existing course
      const updated = {
        ...editingCourse,
        code: courseCode.trim().toUpperCase(),
        name: courseName.trim(),
        department: courseDept,
        deptName: courseDept === 'BICT' ? 'Department of ICT' : 'Department of Bio Systems Technology',
        semester: courseSem,
        credits: parseInt(courseCredits, 10) || 3,
        type: courseType,
        coordinator: courseCoordinator.trim() || 'Unassigned Staff',
        prerequisites: coursePrerequisites.trim() || 'None',
        hours: courseHours.trim() || '45 Lecture Hrs'
      };

      setCourses((prev) => prev.map((c) => (c.id === editingCourse.id ? updated : c)));
      if (onShowToast) onShowToast(`Updated course ${updated.code} - ${updated.name}.`);
      if (onAddAuditLog) onAddAuditLog('Updated Curriculum Course', `${updated.code} (${updated.semester} - ${updated.department})`);
    } else {
      // Add new course
      const newCourse = {
        id: `CRS-${courseDept}-${Date.now().toString().slice(-6)}`,
        code: courseCode.trim().toUpperCase(),
        name: courseName.trim(),
        department: courseDept,
        deptName: courseDept === 'BICT' ? 'Department of ICT' : 'Department of Bio Systems Technology',
        semester: courseSem,
        year: courseSem.includes('1') || courseSem.includes('2') ? 'Year 1' : courseSem.includes('3') || courseSem.includes('4') ? 'Year 2' : courseSem.includes('5') || courseSem.includes('6') ? 'Year 3' : 'Year 4',
        credits: parseInt(courseCredits, 10) || 3,
        type: courseType,
        coordinator: courseCoordinator.trim() || 'Faculty Lecturer',
        prerequisites: coursePrerequisites.trim() || 'None',
        hours: courseHours.trim() || '45 Lecture Hrs',
        capacity: 120,
        status: 'Active'
      };

      setCourses((prev) => [newCourse, ...prev]);
      if (onShowToast) onShowToast(`Added new course ${newCourse.code} to ${newCourse.semester}.`);
      if (onAddAuditLog) onAddAuditLog('Created Curriculum Course', `${newCourse.code} (${newCourse.semester} - ${newCourse.department})`);
    }

    setIsAddModalOpen(false);
  };

  // Delete Course
  const handleDeleteCourse = (id, code) => {
    if (window.confirm(`Are you sure you want to remove ${code} from the official faculty curriculum?`)) {
      setCourses((prev) => prev.filter((c) => c.id !== id));
      if (onShowToast) onShowToast(`Course ${code} removed from curriculum.`);
      if (onAddAuditLog) onAddAuditLog('Deleted Curriculum Course', `Removed ${code} from faculty allocation.`);
    }
  };

  // Execute Batch Promotion & Auto-Shift Curriculum
  const handleExecutePromotion = () => {
    if (!selectedBatch || nextSemester.includes('Graduated')) return;

    if (onPromoteBatch) {
      onPromoteBatch(selectedBatch.id, nextSemester, upcomingNextSemCourses, promoteDeptScope);
    }

    const scopeLabel =
      promoteDeptScope === 'BICT'
        ? 'ICT Department Only (120 BICT Students)'
        : promoteDeptScope === 'BST'
        ? 'BST Department Only (120 BST Students)'
        : 'Both Departments (120 BICT + 120 BST = 240 Students)';

    if (onShowToast) {
      onShowToast(
        `Cohort ${selectedBatch.name} (${scopeLabel}) promoted to ${nextSemester}! Curriculum subjects automatically shifted.`
      );
    }

    if (onAddAuditLog) {
      onAddAuditLog(
        'Executed Cohort Promotion',
        `Promoted ${selectedBatch.name} (${scopeLabel}) to ${nextSemester}. Auto-shifted ${upcomingNextSemCourses.length} curriculum subjects.`
      );
    }

    setIsPromoteModalOpen(false);
  };

  return (
    <div className="adm-dashboard-container">
      {/* =========================================================
          1. SECTION HEADER & PROMOTION ACTIONS
          ========================================================= */}
      <div className="adm-section-header">
        <div className="adm-section-title-wrap">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 className="adm-section-title">Course Allocation & Curriculum Engine</h2>
            <span className="adm-badge badge-active" style={{ fontSize: '0.72rem' }}>
              All 8 Semesters Active
            </span>
          </div>
          <p className="adm-section-subtitle">
            Configure faculty standardized course allocations across all 8 semesters for BICT and BST. When an undergraduate cohort progresses, the system automatically shifts all enrolled subjects to the next semester.
          </p>
        </div>

        <div className="adm-section-actions">
          {/* Promote Batch Button */}
          <button
            type="button"
            className="adm-find-process-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', border: 'none' }}
            onClick={() => setIsPromoteModalOpen(true)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="13 17 18 12 13 7" />
              <polyline points="6 17 11 12 6 7" />
            </svg>
            Promote Batch & Shift Subjects
          </button>

          {/* Add Course Button */}
          <button
            type="button"
            className="adm-find-process-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={openAddModal}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add New Course
          </button>
        </div>
      </div>

      {/* =========================================================
          2. METRIC SUMMARY STRIP
          ========================================================= */}
      <div className="adm-stats-grid">
        <div className="adm-stat-card">
          <div className="adm-stat-icon-wrap icon-blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div className="adm-stat-body">
            <div className="adm-stat-top-row">
              <span className="adm-stat-label">TOTAL CURRICULUM</span>
              <span className="adm-badge badge-active">{courses.length} Modules</span>
            </div>
            <div className="adm-stat-value">{courses.length} Courses</div>
            <div className="adm-stat-sub">Across 8 Semesters (BICT & BST)</div>
          </div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-icon-wrap icon-purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <div className="adm-stat-body">
            <div className="adm-stat-top-row">
              <span className="adm-stat-label">BICT CURRICULUM</span>
              <span className="adm-badge badge-active">ICT Dept</span>
            </div>
            <div className="adm-stat-value">{courses.filter((c) => c.department === 'BICT').length} Modules</div>
            <div className="adm-stat-sub">120 Total Academic Credits</div>
          </div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-icon-wrap icon-emerald">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div className="adm-stat-body">
            <div className="adm-stat-top-row">
              <span className="adm-stat-label">BST CURRICULUM</span>
              <span className="adm-badge badge-active">Biosystems Dept</span>
            </div>
            <div className="adm-stat-value">{courses.filter((c) => c.department === 'BST').length} Modules</div>
            <div className="adm-stat-sub">120 Total Academic Credits</div>
          </div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-icon-wrap icon-amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="adm-stat-body">
            <div className="adm-stat-top-row">
              <span className="adm-stat-label">ACTIVE PROMOTION</span>
              <span className="adm-badge badge-pending">Ready</span>
            </div>
            <div className="adm-stat-value">5 Batches</div>
            <div className="adm-stat-sub">Auto-Shift Engine Enabled</div>
          </div>
        </div>
      </div>

      {/* =========================================================
          3. DEPARTMENT SELECTOR & 8-SEMESTER NAVIGATOR
          ========================================================= */}
      <div className="adm-card" style={{ padding: '1.25rem', marginTop: '0.5rem' }}>
        {/* Department Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              SELECT ACADEMIC DEPARTMENT
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
              <button
                type="button"
                className={`adm-tab-btn ${selectedDept === 'BICT' ? 'active' : ''}`}
                onClick={() => setSelectedDept('BICT')}
                style={{
                  padding: '0.55rem 1.15rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  background: selectedDept === 'BICT' ? '#0f2b5c' : '#f8fafc',
                  color: selectedDept === 'BICT' ? '#ffffff' : '#0f2b5c',
                  border: selectedDept === 'BICT' ? '1px solid #0f2b5c' : '1px solid #cbd5e1',
                  cursor: 'pointer'
                }}
              >
                BICT: Bachelor of Information Communication Technology
              </button>

              <button
                type="button"
                className={`adm-tab-btn ${selectedDept === 'BST' ? 'active' : ''}`}
                onClick={() => setSelectedDept('BST')}
                style={{
                  padding: '0.55rem 1.15rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  background: selectedDept === 'BST' ? '#16a34a' : '#f8fafc',
                  color: selectedDept === 'BST' ? '#ffffff' : '#16a34a',
                  border: selectedDept === 'BST' ? '1px solid #16a34a' : '1px solid #cbd5e1',
                  cursor: 'pointer'
                }}
              >
                BST: Bachelor of Bio System Technology
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block' }}>Department Governance:</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
              {selectedDept === 'BICT' ? 'HOD: Dr. S. Sabraz Nawaz' : 'HOD: Dr. U.L. Abdul Majeed'}
            </span>
          </div>
        </div>

        {/* 8-Semester Pills Grid */}
        <div style={{ marginTop: '1rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            SELECT ACADEMIC SEMESTER (YEAR 1 TO YEAR 4)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem' }}>
            {SEMESTER_LIST.map((sem, idx) => {
              const semCourses = courses.filter((c) => c.department === selectedDept && c.semester === sem);
              const totalCredits = semCourses.reduce((sum, c) => sum + (c.credits || 0), 0);
              const isSelected = selectedSemester === sem;
              const yearLabel = idx < 2 ? 'Year 1' : idx < 4 ? 'Year 2' : idx < 6 ? 'Year 3' : 'Year 4';

              return (
                <button
                  key={sem}
                  type="button"
                  onClick={() => setSelectedSemester(sem)}
                  style={{
                    padding: '0.75rem 0.85rem',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid #0f2b5c' : '1px solid #e2e8f0',
                    background: isSelected ? '#eff6ff' : '#ffffff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 4px 12px rgba(15, 43, 92, 0.12)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isSelected ? '#1d4ed8' : '#94a3b8', textTransform: 'uppercase' }}>
                      {yearLabel}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '12px',
                        background: isSelected ? '#1d4ed8' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#64748b'
                      }}
                    >
                      {totalCredits} Credits
                    </span>
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: isSelected ? '#0f2b5c' : '#1e293b', marginTop: '2px' }}>
                    {sem}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                    {semCourses.length} Modules Allocated
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================
          4. TOOLBAR: SEARCH & TYPE FILTER
          ========================================================= */}
      <div className="adm-toolbar" style={{ marginTop: '0.75rem' }}>
        <div className="adm-search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="adm-search-input"
            placeholder={`Search ${selectedDept} ${selectedSemester} courses by code (e.g. ${selectedDept === 'BICT' ? 'ICT2101' : 'BST2101'}), title, or lecturer...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="adm-filter-group">
          <select
            className="adm-filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Course Types</option>
            <option value="Core">Core Modules</option>
            <option value="Elective">Elective Modules</option>
            <option value="Practical">Practical / Project</option>
            <option value="Industrial Training">Industrial Training</option>
          </select>

          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f2b5c', padding: '0 0.5rem' }}>
            Allocated: {currentSemesterCourses.length} Courses ({semesterTotalCredits} Credits)
          </span>
        </div>
      </div>

      {/* =========================================================
          5. COURSES TABLE FOR SELECTED SEMESTER
          ========================================================= */}
      <div className="adm-table-card" style={{ marginTop: '0.5rem' }}>
        <div className="adm-table-header-wrap">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              {selectedDept} — {selectedSemester} Official Course Allocation
            </h3>
            <span className="adm-badge badge-active">{currentSemesterCourses.length} Modules</span>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Capacity per intake: <strong>120 Undergraduates</strong>
          </div>
        </div>

        <div className="adm-table-responsive">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Credits</th>
                <th>Type</th>
                <th>Appointed Coordinator / Lecturer</th>
                <th>Prerequisites</th>
                <th>Hours Structure</th>
                <th style={{ textAlign: 'right' }}>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentSemesterCourses.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    No courses allocated to {selectedDept} {selectedSemester} matching your search. Click &quot;Add New Course&quot; to provision subjects.
                  </td>
                </tr>
              ) : (
                currentSemesterCourses.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          background: '#eff6ff',
                          color: '#0f2b5c',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px'
                        }}
                      >
                        {c.code}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{c.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.deptName}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: '#0f172a',
                          background: '#f1f5f9',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          fontSize: '0.76rem'
                        }}
                      >
                        {c.credits} Credits
                      </span>
                    </td>
                    <td>
                      <span
                        className={`adm-badge ${
                          c.type === 'Core'
                            ? 'badge-active'
                            : c.type === 'Elective'
                            ? 'badge-pending'
                            : 'badge-inactive'
                        }`}
                        style={{ fontSize: '0.72rem' }}
                      >
                        {c.type}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', fontWeight: 500, color: '#334155' }}>{c.coordinator}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Capacity: {c.capacity} students</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem', color: c.prerequisites === 'None' ? '#94a3b8' : '#0284c7', fontWeight: c.prerequisites === 'None' ? 400 : 600 }}>
                        {c.prerequisites}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.hours}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="adm-btn-xs-secondary"
                          onClick={() => setViewingSyllabusCourse(c)}
                          title="View Course Syllabus Details"
                        >
                          Syllabus
                        </button>
                        <button
                          type="button"
                          className="adm-btn-xs-primary"
                          onClick={() => openEditModal(c)}
                          title="Edit Course Allocation"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="adm-btn-xs-danger"
                          onClick={() => handleDeleteCourse(c.id, c.code)}
                          title="Remove Course"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================
          MODAL 1: ADD / EDIT COURSE ALLOCATION
          ========================================================= */}
      {isAddModalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">
                {editingCourse ? `Edit Course Allocation: ${editingCourse.code}` : `Allocate New Course to ${selectedDept}`}
              </h3>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCourseSubmit}>
              <div className="adm-modal-body">
                {formError && (
                  <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem' }}>
                    {formError}
                  </div>
                )}

                <div className="adm-form-grid">
                  <div className="adm-form-group">
                    <label className="adm-label">Course Code (e.g. ICT3201 / BST3201) *</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="e.g. ICT3201"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Target Academic Department *</label>
                    <select
                      className="adm-input"
                      value={courseDept}
                      onChange={(e) => setCourseDept(e.target.value)}
                    >
                      <option value="BICT">BICT: Department of ICT</option>
                      <option value="BST">BST: Department of Bio Systems Technology</option>
                    </select>
                  </div>

                  <div className="adm-form-group full-width">
                    <label className="adm-label">Course Title / Subject Name *</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="e.g. Enterprise Application Development"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Allocated Semester *</label>
                    <select
                      className="adm-input"
                      value={courseSem}
                      onChange={(e) => setCourseSem(e.target.value)}
                    >
                      {SEMESTER_LIST.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Academic Credits *</label>
                    <select
                      className="adm-input"
                      value={courseCredits}
                      onChange={(e) => setCourseCredits(e.target.value)}
                    >
                      <option value="1">1 Credit</option>
                      <option value="2">2 Credits</option>
                      <option value="3">3 Credits (Standard)</option>
                      <option value="4">4 Credits (Project/Advanced)</option>
                      <option value="6">6 Credits (Internship/Capstone)</option>
                    </select>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Module Classification *</label>
                    <select
                      className="adm-input"
                      value={courseType}
                      onChange={(e) => setCourseType(e.target.value)}
                    >
                      <option value="Core">Core Compulsory Module</option>
                      <option value="Elective">Elective Module</option>
                      <option value="Practical">Practical / Project</option>
                      <option value="Industrial Training">Industrial Training / Internship</option>
                    </select>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Appointed Lecturer / Coordinator</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="e.g. Dr. S. Sabraz Nawaz / Dr. U.L. Abdul Majeed"
                      value={courseCoordinator}
                      onChange={(e) => setCourseCoordinator(e.target.value)}
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Prerequisite Module(s)</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="e.g. ICT1201 or None"
                      value={coursePrerequisites}
                      onChange={(e) => setCoursePrerequisites(e.target.value)}
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Teaching Hours Structure</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="e.g. 30 Lecture Hrs • 45 Lab Hrs"
                      value={courseHours}
                      onChange={(e) => setCourseHours(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.76rem', color: '#64748b' }}>
                  <strong>System Admin Governance:</strong> Courses defined here are automatically bundled into student course registrations whenever batches progress to {courseSem}.
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-xs-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-find-process-btn"
                >
                  {editingCourse ? 'Save Changes' : 'Allocate Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: PROMOTE BATCH & AUTO-SHIFT SUBJECTS
          ========================================================= */}
      {isPromoteModalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsPromoteModalOpen(false)}>
          <div className="adm-modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header" style={{ borderBottom: '2px solid #16a34a' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
                  COHORT SEMESTER PROGRESSION ENGINE
                </span>
                <h3 className="adm-modal-title" style={{ marginTop: '2px' }}>
                  Promote Batch & Auto-Shift Curriculum
                </h3>
              </div>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setIsPromoteModalOpen(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="adm-modal-body">
              {/* Batch Selector */}
              <div className="adm-form-group full-width">
                <label className="adm-label">Select Cohort to Progress *</label>
                <select
                  className="adm-input"
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  style={{ fontWeight: 600, fontSize: '0.9rem' }}
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} — {b.currentSemester}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Shift Scope Selector (Both, ICT Only, BST Only) */}
              <div className="adm-form-group full-width" style={{ marginTop: '0.2rem' }}>
                <label className="adm-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Department Progression Scope *</span>
                  <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>
                    {promoteDeptScope === 'BOTH'
                      ? 'Both Departments (240 Students: 120 BICT + 120 BST)'
                      : promoteDeptScope === 'BICT'
                      ? 'ICT Department Only (120 BICT Students)'
                      : 'BST Department Only (120 BST Students)'}
                  </span>
                </label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    background: '#f1f5f9',
                    padding: '4px',
                    borderRadius: '8px'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setPromoteDeptScope('BOTH')}
                    style={{
                      padding: '0.55rem 0.65rem',
                      fontSize: '0.8rem',
                      fontWeight: promoteDeptScope === 'BOTH' ? 700 : 500,
                      color: promoteDeptScope === 'BOTH' ? '#0f172a' : '#64748b',
                      background: promoteDeptScope === 'BOTH' ? '#ffffff' : 'transparent',
                      borderRadius: '6px',
                      border: promoteDeptScope === 'BOTH' ? '1px solid #cbd5e1' : '1px solid transparent',
                      boxShadow: promoteDeptScope === 'BOTH' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '3px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      <span>Both Departments</span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500 }}>
                      BICT &amp; BST (240 Students)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPromoteDeptScope('BICT')}
                    style={{
                      padding: '0.55rem 0.65rem',
                      fontSize: '0.8rem',
                      fontWeight: promoteDeptScope === 'BICT' ? 700 : 500,
                      color: promoteDeptScope === 'BICT' ? '#1d4ed8' : '#64748b',
                      background: promoteDeptScope === 'BICT' ? '#ffffff' : 'transparent',
                      borderRadius: '6px',
                      border: promoteDeptScope === 'BICT' ? '1px solid #bfdbfe' : '1px solid transparent',
                      boxShadow: promoteDeptScope === 'BICT' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '3px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                      <span>ICT Department Only</span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#1d4ed8', fontWeight: 500 }}>
                      BICT (120 Students)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPromoteDeptScope('BST')}
                    style={{
                      padding: '0.55rem 0.65rem',
                      fontSize: '0.8rem',
                      fontWeight: promoteDeptScope === 'BST' ? 700 : 500,
                      color: promoteDeptScope === 'BST' ? '#047857' : '#64748b',
                      background: promoteDeptScope === 'BST' ? '#ffffff' : 'transparent',
                      borderRadius: '6px',
                      border: promoteDeptScope === 'BST' ? '1px solid #a7f3d0' : '1px solid transparent',
                      boxShadow: promoteDeptScope === 'BST' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '3px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                      <span>BST Department Only</span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#047857', fontWeight: 500 }}>
                      BST (120 Students)
                    </span>
                  </button>
                </div>
              </div>

              {/* Progression Transition Preview Card */}
              {selectedBatch && (
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      CURRENT STATUS
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                      {selectedBatch.currentSemester}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Cohort: {selectedBatch.name}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>

                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>
                      TARGET PROMOTION SEMESTER
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#15803d', marginTop: '2px' }}>
                      {nextSemester}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {promoteDeptScope === 'BOTH'
                        ? '240 Students (120 BICT, 120 BST)'
                        : promoteDeptScope === 'BICT'
                        ? '120 Students (ICT Department Only)'
                        : '120 Students (BST Department Only)'}
                    </div>
                  </div>
                </div>
              )}

              {/* Automated Subject Allocation Preview */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                    Curriculum Subjects Auto-Allocated for {nextSemester}:
                  </span>
                  <span className="adm-badge badge-active">
                    {upcomingNextSemCourses.length} {promoteDeptScope === 'BICT' ? 'BICT Subjects' : promoteDeptScope === 'BST' ? 'BST Subjects' : 'Subjects'} Pre-configured
                  </span>
                </div>

                <div
                  style={{
                    maxHeight: '180px',
                    overflowY: 'auto',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    background: '#ffffff'
                  }}
                >
                  {upcomingNextSemCourses.length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                      No subjects configured for {nextSemester} in {promoteDeptScope === 'BICT' ? 'BICT' : promoteDeptScope === 'BST' ? 'BST' : 'curriculum'}. Please add subjects for this semester before promoting.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                      {upcomingNextSemCourses.map((c) => (
                        <div
                          key={c.id}
                          style={{
                            padding: '0.5rem 0.65rem',
                            borderRadius: '6px',
                            background: c.department === 'BICT' ? '#eff6ff' : '#f0fdf4',
                            border: c.department === 'BICT' ? '1px solid #bfdbfe' : '1px solid #bbf7d0',
                            fontSize: '0.75rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                            <span style={{ color: c.department === 'BICT' ? '#1d4ed8' : '#15803d' }}>
                              {c.code} ({c.department})
                            </span>
                            <span style={{ color: '#64748b' }}>{c.credits} Cr</span>
                          </div>
                          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#1e293b', marginTop: '2px' }}>
                            {c.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Checkbox for Auto-Registration */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  background: '#f1f5f9'
                }}
              >
                <input
                  type="checkbox"
                  checked={autoRegisterStudents}
                  onChange={(e) => setAutoRegisterStudents(e.target.checked)}
                />
                Automatically shift academic semester and allocate these {upcomingNextSemCourses.length} {promoteDeptScope === 'BICT' ? 'BICT' : promoteDeptScope === 'BST' ? 'BST' : 'curriculum'} subjects to {promoteDeptScope === 'BOTH' ? 'all 240 enrolled undergraduates' : promoteDeptScope === 'BICT' ? 'all 120 enrolled ICT undergraduates' : 'all 120 enrolled BST undergraduates'}
              </label>

              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '0.75rem', borderRadius: '8px', fontSize: '0.76rem', color: '#b45309' }}>
                <strong>Automated Action:</strong> Confirming this promotion will advance {selectedBatch?.name} ({promoteDeptScope === 'BOTH' ? 'Both Departments' : promoteDeptScope === 'BICT' ? 'ICT Department Only' : 'BST Department Only'}) to {nextSemester}, auto-shift curriculum for {promoteDeptScope === 'BOTH' ? (students.filter((s) => s.batchId === selectedBatchId).length || 240) : 120} student records, and clear prerequisites.
              </div>
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                className="adm-btn-xs-secondary"
                onClick={() => setIsPromoteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="adm-find-process-btn"
                style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', border: 'none', padding: '0.5rem 1.25rem' }}
                onClick={handleExecutePromotion}
                disabled={nextSemester.includes('Graduated') || upcomingNextSemCourses.length === 0}
              >
                Execute {promoteDeptScope === 'BOTH' ? 'Batch' : promoteDeptScope === 'BICT' ? 'ICT Department' : 'BST Department'} Promotion &amp; Auto-Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: VIEW SYLLABUS DETAILS
          ========================================================= */}
      {viewingSyllabusCourse && (
        <div className="adm-modal-backdrop" onClick={() => setViewingSyllabusCourse(null)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0f2b5c', fontSize: '0.85rem' }}>
                  {viewingSyllabusCourse.code} • {viewingSyllabusCourse.department}
                </span>
                <h3 className="adm-modal-title" style={{ marginTop: '2px' }}>
                  {viewingSyllabusCourse.name}
                </h3>
              </div>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setViewingSyllabusCourse(null)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="adm-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Semester:</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{viewingSyllabusCourse.semester} ({viewingSyllabusCourse.year})</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Academic Credits:</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{viewingSyllabusCourse.credits} Credits</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Module Classification:</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{viewingSyllabusCourse.type}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Appointed Coordinator:</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{viewingSyllabusCourse.coordinator}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Teaching Structure:</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{viewingSyllabusCourse.hours}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Prerequisites:</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{viewingSyllabusCourse.prerequisites}</div>
                </div>
              </div>

              <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: '1.5' }}>
                This module forms an accredited part of the Faculty of Technology South Eastern University curriculum structure. Continuous Assessments (CA) carry 40% and End Semester Assessment (ESA) carries 60% of grading criteria.
              </div>
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                className="adm-find-process-btn"
                onClick={() => setViewingSyllabusCourse(null)}
              >
                Close Syllabus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

