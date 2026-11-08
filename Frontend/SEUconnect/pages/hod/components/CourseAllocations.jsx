import { useState, useMemo, useEffect, useCallback } from 'react';
import { ACADEMIC_STAFF_LIST } from '../hodData.js';
import { INITIAL_CURRICULUM_COURSES, SEMESTER_LIST } from '../../admin/curriculumData.js';
import api, { provisionedUserStorage } from '../../../src/services/api.js';

// Dedicated Biosystems Technology academic cadre
const BST_ACADEMIC_STAFF = [
  { name: 'Dr. M.G. Mohamed Thariq', designation: 'Senior Lecturer Gr. I (HOD BST)', email: 'thariq@seu.ac.lk' },
  { name: 'Prof. K. Senaratne', designation: 'Professor of Biosystems Technology', email: 'senaratne@seu.ac.lk' },
  { name: 'Dr. U.L. Abdul Majeed', designation: 'Senior Lecturer Gr. I & Dean', email: 'majeed@seu.ac.lk' },
  { name: 'Dr. S.B. Ekanayake', designation: 'Senior Lecturer Gr. II', email: 'ekanayake@seu.ac.lk' },
  { name: 'Dr. P. Sivalingam', designation: 'Senior Lecturer Gr. II', email: 'sivalingam@seu.ac.lk' },
  { name: 'Dr. R. Nihal', designation: 'Lecturer (Probationary)', email: 'nihal@seu.ac.lk' },
  { name: 'Ms. K. H. Dilrukshi', designation: 'Lecturer (Probationary)', email: 'dilrukshi@seu.ac.lk' },
  { name: 'Visiting Senior Lecturer (Maths)', designation: 'Visiting Senior Lecturer', email: 'visiting.maths@seu.ac.lk' },
  { name: 'Visiting Senior Lecturer (Physics)', designation: 'Visiting Senior Lecturer', email: 'visiting.physics@seu.ac.lk' },
];

/**
 * SEUConnect - Course & Lecturer Allocation Desk (HOD Authority)
 * 
 * Institutional Governance:
 * When System Admin provisions new curriculum courses, no lecturer is appointed at creation time.
 * Appointing the Lecturer-in-Charge and granting teaching, CA, and exam rights is strictly the
 * prerogative and statutory duty of the particular Department Head (HOD ICT / HOD BST).
 */
export default function CourseAllocations({ onNavigate, user }) {
  // Determine HOD's primary department jurisdiction from logged-in session
  const userDept = useMemo(() => {
    const str = `${user?.department || ''} ${user?.designation || ''} ${user?.email || ''}`.toLowerCase();
    if (str.includes('bio') || str.includes('bst')) return 'BST';
    return 'BICT';
  }, [user]);

  const [departmentScope, setDepartmentScope] = useState(userDept);
  const [yearFilter, setYearFilter] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Pending' | 'Allocated'
  const [searchQuery, setSearchQuery] = useState('');

  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedLecturer, setSelectedLecturer] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [dbStaff, setDbStaff] = useState([]);
  const [isSyncingDb, setIsSyncingDb] = useState(false);

  // Helper to load and unify courses between curriculum, HOD allocation storage, and database
  const buildCourseMatrix = useCallback(() => {
    let curriculum = [];
    try {
      const savedAdmin = localStorage.getItem('seuconnect_admin_curriculum_courses');
      if (savedAdmin) {
        const parsed = JSON.parse(savedAdmin);
        if (Array.isArray(parsed) && parsed.length > 0) {
          curriculum = parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading admin curriculum:', e);
    }

    if (curriculum.length === 0) {
      curriculum = INITIAL_CURRICULUM_COURSES;
    }

    // Load existing HOD allocations map
    const allocMap = new Map();
    try {
      const savedAlloc = localStorage.getItem('seu_course_allocations');
      if (savedAlloc) {
        const parsed = JSON.parse(savedAlloc);
        if (Array.isArray(parsed)) {
          parsed.forEach((c) => {
            if (c.code) allocMap.set(c.code.toUpperCase(), c);
          });
        }
      }
    } catch (e) {
      console.warn('Error reading saved allocations:', e);
    }

    // Filter courses matching the active department scope (BICT or BST)
    const deptCurriculum = curriculum.filter((c) => {
      const dept = c.department || (c.code && c.code.startsWith('BST') ? 'BST' : 'BICT');
      return dept === departmentScope;
    });

    return deptCurriculum.map((c) => {
      const codeUpper = (c.code || '').toUpperCase();
      const existingAlloc = allocMap.get(codeUpper);

      // Determine appointed lecturer
      let assignedLec = '';
      if (existingAlloc?.lecturerInCharge && !existingAlloc.lecturerInCharge.includes('Pending') && existingAlloc.lecturerInCharge !== 'Faculty of Technology Academic Staff') {
        assignedLec = existingAlloc.lecturerInCharge;
      } else if (c.coordinator && !c.coordinator.includes('Pending') && c.coordinator !== 'Faculty Lecturer' && c.coordinator !== 'Unassigned Staff') {
        assignedLec = c.coordinator;
      }

      const isPending = !assignedLec || assignedLec === 'Pending HOD Allocation' || assignedLec.includes('Pending');

      return {
        id: c.id || `CRS-${c.code}`,
        code: c.code,
        title: c.name || c.title || c.code,
        credits: c.credits || 3,
        year: c.year === 'Year 1' || c.year === '1st Year' ? '1st Year' : c.year === 'Year 2' || c.year === '2nd Year' ? '2nd Year' : c.year === 'Year 3' || c.year === '3rd Year' ? '3rd Year' : '4th Year',
        semester: c.semester || 'Semester 1',
        department: c.department || departmentScope,
        lecturerInCharge: isPending ? 'Pending HOD Allocation' : assignedLec,
        lecturerEmail: existingAlloc?.lecturerEmail || c.lecturerEmail || '',
        demonstrators: existingAlloc?.demonstrators || ['Ms. F. Rifdha', 'Mr. M. Sajeer'],
        enrolledStudents: existingAlloc?.enrolledStudents || c.capacity || 120,
        syllabusProgress: existingAlloc?.syllabusProgress || (isPending ? 0 : 75),
        caComponentsCount: existingAlloc?.caComponentsCount || '4 (2 Quizzes, 1 Assignment, 1 Midterm)',
        status: isPending ? 'Pending Allocation' : 'Allocated',
      };
    });
  }, [departmentScope]);

  const [courses, setCourses] = useState(() => buildCourseMatrix());

  // Reload courses whenever department scope changes
  const [prevDept, setPrevDept] = useState(departmentScope);
  if (prevDept !== departmentScope) {
    setPrevDept(departmentScope);
    setCourses(buildCourseMatrix());
  }

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
          setCourses((prev) => {
            const codeToSubject = new Map(res.data.map((s) => [s.code.toUpperCase(), s]));
            return prev.map((c) => {
              const dbSub = codeToSubject.get(c.code.toUpperCase());
              if (dbSub && dbSub.lecturer && !dbSub.lecturer.includes('Pending') && dbSub.lecturer !== 'Faculty of Technology Academic Staff') {
                return {
                  ...c,
                  lecturerInCharge: dbSub.lecturer,
                  lecturerEmail: dbSub.lecturerEmail || c.lecturerEmail || '',
                  status: 'Allocated',
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

  // Real-time listener for newly added courses or updates from System Admin
  useEffect(() => {
    const handleSync = () => {
      setCourses(buildCourseMatrix());
    };
    window.addEventListener('seuconnect_curriculum_updated', handleSync);
    window.addEventListener('seu_course_allocations_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('seuconnect_curriculum_updated', handleSync);
      window.removeEventListener('seu_course_allocations_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [buildCourseMatrix]);

  // Combined academic staff list for the target department
  const allStaffList = useMemo(() => {
    try {
      const baseCadre = departmentScope === 'BST' ? BST_ACADEMIC_STAFF : ACADEMIC_STAFF_LIST;
      const otherCadre = departmentScope === 'BST' ? ACADEMIC_STAFF_LIST : BST_ACADEMIC_STAFF;

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

      const existingNames = new Set(baseCadre.map((s) => s.name));
      const additions = [...newLecturers, ...dbLecturers, ...otherCadre].filter((l) => !existingNames.has(l.name));
      return [...baseCadre, ...additions];
    } catch {
      return departmentScope === 'BST' ? BST_ACADEMIC_STAFF : ACADEMIC_STAFF_LIST;
    }
  }, [departmentScope, dbStaff]);

  // Numerical counts
  const pendingCount = useMemo(() => {
    return courses.filter((c) => c.lecturerInCharge === 'Pending HOD Allocation' || c.lecturerInCharge.includes('Pending')).length;
  }, [courses]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const isPending = c.lecturerInCharge === 'Pending HOD Allocation' || c.lecturerInCharge.includes('Pending');

      if (statusFilter === 'Pending' && !isPending) return false;
      if (statusFilter === 'Allocated' && isPending) return false;
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
  }, [courses, statusFilter, yearFilter, semesterFilter, searchQuery]);

  // Open Allocation Modal
  const handleOpenReallocate = (course) => {
    setEditingCourse(course);
    const isPending = course.lecturerInCharge === 'Pending HOD Allocation' || course.lecturerInCharge.includes('Pending');
    if (isPending) {
      setSelectedLecturer(allStaffList[0]?.name || '');
    } else {
      setSelectedLecturer(course.lecturerInCharge);
    }
  };

  // Confirm and Save HOD Allocation
  const handleSaveReallocate = async () => {
    if (!editingCourse || !selectedLecturer) return;
    const selectedStaffObj = allStaffList.find((s) => s.name === selectedLecturer);
    const updatedLecturer = selectedLecturer;
    const updatedEmail = selectedStaffObj?.email || '';

    // 1. Update state
    const updated = courses.map((c) =>
      c.code === editingCourse.code
        ? {
            ...c,
            lecturerInCharge: updatedLecturer,
            lecturerEmail: updatedEmail,
            status: 'Allocated',
          }
        : c
    );
    setCourses(updated);

    // 2. Persist in seu_course_allocations (shared with Lecturer & Student portals)
    try {
      const rawAlloc = localStorage.getItem('seu_course_allocations');
      let allocList = rawAlloc ? JSON.parse(rawAlloc) : [];
      if (!Array.isArray(allocList)) allocList = [];
      const idx = allocList.findIndex((c) => c.code === editingCourse.code);
      if (idx !== -1) {
        allocList[idx] = {
          ...allocList[idx],
          lecturerInCharge: updatedLecturer,
          lecturerEmail: updatedEmail,
          status: 'Allocated',
        };
      } else {
        allocList.push({
          ...editingCourse,
          lecturerInCharge: updatedLecturer,
          lecturerEmail: updatedEmail,
          status: 'Allocated',
        });
      }
      localStorage.setItem('seu_course_allocations', JSON.stringify(allocList));
    } catch (e) {
      console.warn('Error updating seu_course_allocations:', e);
    }

    // 3. Update seuconnect_admin_curriculum_courses so System Admin sees the HOD's appointment
    try {
      const savedAdmin = localStorage.getItem('seuconnect_admin_curriculum_courses');
      if (savedAdmin) {
        const adminCourses = JSON.parse(savedAdmin);
        if (Array.isArray(adminCourses)) {
          const updatedAdminCourses = adminCourses.map((c) =>
            c.code.toUpperCase() === editingCourse.code.toUpperCase()
              ? { ...c, coordinator: updatedLecturer }
              : c
          );
          localStorage.setItem('seuconnect_admin_curriculum_courses', JSON.stringify(updatedAdminCourses));
        }
      }
    } catch (e) {
      console.warn('Error updating admin curriculum courses:', e);
    }

    // 4. Dispatch custom events for live reactive UI updates across portals
    window.dispatchEvent(
      new CustomEvent('seu_course_allocations_updated', {
        detail: {
          code: editingCourse.code,
          lecturer: updatedLecturer,
          email: updatedEmail,
        },
      })
    );
    window.dispatchEvent(
      new CustomEvent('seuconnect_curriculum_updated', {
        detail: {
          code: editingCourse.code,
          coordinator: updatedLecturer,
        },
      })
    );

    // 5. Persist to MongoDB backend database
    try {
      await api.updateSubjectAllocation(editingCourse.code, {
        lecturer: updatedLecturer,
        lecturerEmail: updatedEmail,
      });
      setFeedbackMsg(`✓ Officially appointed ${updatedLecturer} for ${editingCourse.code}. Teaching rights granted by ${departmentScope} HOD.`);
    } catch {
      setFeedbackMsg(`✓ Appointed ${updatedLecturer} for ${editingCourse.code} (Teaching rights saved and broadcasted).`);
    }

    setEditingCourse(null);
    setTimeout(() => setFeedbackMsg(''), 6000);
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
      setFeedbackMsg(`✓ All ${courses.length} ${departmentScope} course allocations synchronized to MongoDB database successfully!`);
    } catch {
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
          <span className="hod-banner-tag">DEPARTMENT HEAD STATUTORY AUTHORITY</span>
          <h1 className="hod-view-title">Course & Lecturer Allocations Desk</h1>
          <p className="hod-view-subtitle">
            Curriculum distribution & teaching rights assignment for {departmentScope === 'BICT' ? 'Department of Information and Communication Technology (BICT)' : 'Department of Bio Systems Technology (BST)'}.
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

      {/* Department Jurisdiction Switcher */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.25rem' }}>🏛️</span>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f2b5c' }}>
              Select Department Authority:
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
              Logged in HOD: <strong>{user?.name || 'M.J Ahamed Sabani'}</strong> ({user?.designation || 'Head of Department'})
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className={`hod-tab-btn ${departmentScope === 'BICT' ? 'active' : ''}`}
            onClick={() => setDepartmentScope('BICT')}
            style={{
              fontSize: '0.82rem',
              padding: '0.45rem 1rem',
              fontWeight: departmentScope === 'BICT' ? 700 : 500,
              background: departmentScope === 'BICT' ? '#0f2b5c' : '#f1f5f9',
              color: departmentScope === 'BICT' ? '#ffffff' : '#334155',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            BICT: Dept of ICT {userDept === 'BICT' ? '★ (Your Dept)' : ''}
          </button>
          <button
            type="button"
            className={`hod-tab-btn ${departmentScope === 'BST' ? 'active' : ''}`}
            onClick={() => setDepartmentScope('BST')}
            style={{
              fontSize: '0.82rem',
              padding: '0.45rem 1rem',
              fontWeight: departmentScope === 'BST' ? 700 : 500,
              background: departmentScope === 'BST' ? '#0f2b5c' : '#f1f5f9',
              color: departmentScope === 'BST' ? '#ffffff' : '#334155',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            BST: Dept of Bio Systems {userDept === 'BST' ? '★ (Your Dept)' : ''}
          </button>
        </div>
      </div>

      {/* 2. Stats Strip */}
      <div className="hod-stats-strip">
        <div className="hod-strip-card" onClick={() => { setStatusFilter('All'); setYearFilter('All'); setSemesterFilter('All'); }} style={{ cursor: 'pointer', border: statusFilter === 'All' && yearFilter === 'All' ? '2px solid #0f2b5c' : undefined }}>
          <span className="hod-strip-val">{courses.length}</span>
          <span className="hod-strip-lbl">{departmentScope} Total Modules</span>
        </div>

        {/* Pending Allocation Alert Card */}
        <div
          className="hod-strip-card"
          onClick={() => { setStatusFilter('Pending'); setYearFilter('All'); setSemesterFilter('All'); }}
          style={{
            cursor: 'pointer',
            border: statusFilter === 'Pending' ? '2px solid #b45309' : '1px solid #fde68a',
            background: statusFilter === 'Pending' ? '#fffbeb' : '#fffdf5'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <span className="hod-strip-val" style={{ color: pendingCount > 0 ? '#b45309' : '#15803d' }}>
              {pendingCount}
            </span>
            {pendingCount > 0 && <span style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>Action Needed</span>}
          </div>
          <span className="hod-strip-lbl" style={{ color: pendingCount > 0 ? '#92400e' : '#64748b', fontWeight: pendingCount > 0 ? 700 : 500 }}>
            ⚠️ Awaiting HOD Appointment
          </span>
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

      {/* 3. Toolbar & Status / Year / Semester Filters */}
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

          {/* Status Filter (All / Pending / Allocated) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Allocation Status:
            </span>
            <button
              type="button"
              className={`hod-tab-btn ${statusFilter === 'All' ? 'active' : ''}`}
              onClick={() => setStatusFilter('All')}
              style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
            >
              All
            </button>
            <button
              type="button"
              className={`hod-tab-btn ${statusFilter === 'Pending' ? 'active' : ''}`}
              onClick={() => setStatusFilter('Pending')}
              style={{
                fontSize: '0.78rem',
                padding: '0.3rem 0.65rem',
                background: statusFilter === 'Pending' ? '#b45309' : '#fef3c7',
                color: statusFilter === 'Pending' ? '#ffffff' : '#92400e',
                fontWeight: 700
              }}
            >
              ⚠️ Pending HOD ({pendingCount})
            </button>
            <button
              type="button"
              className={`hod-tab-btn ${statusFilter === 'Allocated' ? 'active' : ''}`}
              onClick={() => setStatusFilter('Allocated')}
              style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
            >
              ✓ Allocated
            </button>
          </div>

          {/* Quick Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="text"
              placeholder={`Search ${departmentScope} module code or title...`}
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
              onClick={() => alert(`Official Teaching Load & Course Allocation Memorandum exported for Dean (${departmentScope}).`)}
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
            <h3 className="hod-card-title">{departmentScope} Curriculum Module Allocation Matrix</h3>
            <p className="hod-card-subtitle">
              Teaching rights delegation, module coordination, demonstrator appointments, and CA evaluations under {departmentScope} HOD Authority.
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
                <th>Lecturer-in-Charge (HOD Appointed)</th>
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
                    No modules match the selected filter ({yearFilter !== 'All' ? yearFilter : ''} {semesterFilter !== 'All' ? semesterFilter : ''} {statusFilter !== 'All' ? statusFilter : ''}).
                  </td>
                </tr>
              ) : (
                filteredCourses.map((c) => {
                  const isPending = c.lecturerInCharge === 'Pending HOD Allocation' || c.lecturerInCharge.includes('Pending');

                  return (
                    <tr key={c.code} style={{ background: isPending ? '#fffdf7' : undefined }}>
                      <td>
                        <span className="hod-tracking-badge" style={{ background: isPending ? '#fef3c7' : undefined, color: isPending ? '#92400e' : undefined, borderColor: isPending ? '#fde68a' : undefined }}>
                          {c.code}
                        </span>
                        {isPending && (
                          <span style={{ display: 'block', fontSize: '0.66rem', color: '#b45309', fontWeight: 700, marginTop: '2px' }}>
                            NEW COURSE
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="hod-proc-title">{c.title}</div>
                        <span className="hod-credits-badge">{c.credits} Credits</span>
                      </td>
                      <td>
                        <span className="hod-batch-pill">{c.year}</span>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>{c.semester}</div>
                      </td>
                      <td>
                        {isPending ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.2rem' }}>⏳</span>
                            <div>
                              <span style={{
                                background: '#fef3c7',
                                color: '#b45309',
                                border: '1px solid #fde68a',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                display: 'inline-block'
                              }}>
                                Pending Allocation
                              </span>
                              <div style={{ fontSize: '0.7rem', color: '#92400e', marginTop: '2px' }}>
                                Awaiting {departmentScope} HOD appointment
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="hod-lecturer-lead">
                            <span className="hod-lead-icon">👤</span>
                            <div>
                              <span className="hod-lead-name-text">{c.lecturerInCharge}</span>
                              {c.lecturerEmail && (
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{c.lecturerEmail}</div>
                              )}
                              <div style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 600 }}>✓ HOD Appointed</div>
                            </div>
                          </div>
                        )}
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
                            <div className="hod-progress-fill" style={{ width: `${c.syllabusProgress}%`, background: isPending ? '#94a3b8' : '#2563eb' }}></div>
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.syllabusProgress}% covered</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.78rem', color: '#334155' }}>{c.caComponentsCount}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="hod-actions-cell" style={{ justifyContent: 'flex-end' }}>
                          {isPending ? (
                            <button
                              type="button"
                              className="hod-btn-endorse"
                              style={{
                                background: '#16a34a',
                                color: '#ffffff',
                                fontWeight: 700,
                                padding: '0.45rem 0.9rem',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                border: 'none',
                                cursor: 'pointer'
                              }}
                              onClick={() => handleOpenReallocate(c)}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <line x1="20" y1="8" x2="20" y2="14" />
                                <line x1="23" y1="11" x2="17" y2="11" />
                              </svg>
                              Assign Lecturer
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="hod-btn-audit"
                              onClick={() => handleOpenReallocate(c)}
                            >
                              Reallocate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign / Reallocate Modal */}
      {editingCourse && (
        <div className="hod-modal-overlay" onClick={() => setEditingCourse(null)}>
          <div className="hod-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="hod-modal-header">
              <div>
                <h3 className="hod-modal-title">
                  {editingCourse.lecturerInCharge?.includes('Pending')
                    ? `Appoint Lecturer: ${editingCourse.code}`
                    : `Reallocate Lecturer: ${editingCourse.code}`}
                </h3>
                <p className="hod-modal-sub">
                  {editingCourse.title} • {editingCourse.semester} ({departmentScope})
                </p>
              </div>
              <button type="button" className="hod-modal-close-btn" onClick={() => setEditingCourse(null)}>
                ✕
              </button>
            </div>
            <div className="hod-modal-body">
              {editingCourse.lecturerInCharge?.includes('Pending') && (
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem'
                }}>
                  <span style={{ fontSize: '1.25rem' }}>🏛️</span>
                  <div style={{ fontSize: '0.78rem', color: '#166534', lineHeight: 1.45 }}>
                    <strong>Department Head Statutory Allocation:</strong> This course was provisioned by System Administration without an appointed lecturer. By confirming this assignment, you officially delegate course delivery, student roster tracking, Continuous Assessment (CA), and exam preparation rights to the selected academic staff member.
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                  Select Lecturer-in-Charge / Course Coordinator *
                </label>
                <select
                  className="hod-input"
                  value={selectedLecturer}
                  onChange={(e) => setSelectedLecturer(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  {allStaffList.map((staff, sIdx) => (
                    <option key={staff.id || staff.email || `${staff.name}-${sIdx}`} value={staff.name}>
                      {staff.name} — {staff.designation} {staff.email ? `(${staff.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '8px', fontSize: '0.78rem', color: '#64748b', border: '1px solid #e2e8f0' }}>
                <strong>Cross-Portal Integration:</strong> Confirming this allocation updates the Lecturer&apos;s active teaching dashboard, enables LMS student enrollment, and synchronizes the official Faculty Handbook matrix across both System Admin and Student portals.
              </div>
            </div>
            <div className="hod-modal-footer">
              <button type="button" className="hod-btn-outline" onClick={() => setEditingCourse(null)}>
                Cancel
              </button>
              <button type="button" className="hod-btn-endorse" onClick={handleSaveReallocate} style={{ background: '#16a34a', color: '#ffffff' }}>
                Confirm Appointment & Grant Rights
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
