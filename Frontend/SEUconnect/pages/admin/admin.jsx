import { useState, useEffect } from 'react';
import api, { enrolledStorage, provisionedUserStorage, penaltyStorage } from '../../src/services/api.js';
import DashboardTemplate from '../../components/dashbord/dashboard_template.jsx';
import './admin.css';

// Mock Data Models
import {
  INITIAL_STATS,
  INITIAL_BATCHES,
  INITIAL_STUDENTS,
  INITIAL_REGISTRATIONS,
  INITIAL_MEDICALS,
  INITIAL_EXAMINATIONS,
  INITIAL_REPEAT_CANDIDATES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_FACULTY_FORMS,
  INITIAL_PENALTIES,
  INITIAL_USERS,
  INITIAL_AUDIT_LOG
} from './adminData.js';

// Admin Subcomponents
import AdminOverview from './components/AdminOverview.jsx';
import StudentManagement from './components/StudentManagement.jsx';
import RegistrationManagement from './components/RegistrationManagement.jsx';
import MedicalRequests from './components/MedicalRequests.jsx';
import ExaminationManagement from './components/ExaminationManagement.jsx';
import ResultsManagement from './components/ResultsManagement.jsx';
import WelfareSocieties from './components/WelfareSocieties.jsx';
import AnnouncementsManagement from './components/AnnouncementsManagement.jsx';
import FormsGuidanceManagement from './components/FormsGuidanceManagement.jsx';
import PenaltiesManagement from './components/PenaltiesManagement.jsx';
import UserRoleManagement from './components/UserRoleManagement.jsx';
import SettingsManagement from './components/SettingsManagement.jsx';
import NotificationsManagement from './components/NotificationsManagement.jsx';
import CourseAllocationManagement from './components/CourseAllocationManagement.jsx';
import InputDataManagement from './components/InputDataManagement.jsx';

/**
 * Admin Navigation Sections customized for Faculty Administration
 */
const ADMIN_NAV_SECTIONS = [
  {
    title: 'MAIN',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        )
      },
      {
        id: 'notifications',
        label: 'Notifications & Alerts',
        badge: 61,
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        )
      }
    ]
  },
  {
    title: 'ACADEMIC ADMINISTRATION',
    items: [
      {
        id: 'student_management',
        label: 'Student Management',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        )
      },
      {
        id: 'course_allocation',
        label: 'Course Allocation & Curriculum',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <line x1="9" y1="7" x2="15" y2="7" />
            <line x1="9" y1="11" x2="15" y2="11" />
          </svg>
        )
      },
      {
        id: 'semester_registration',
        label: 'Academic Registration',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        )
      },
      {
        id: 'attendance_medicals',
        label: 'Attendance & Medicals',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        )
      },
      {
        id: 'examinations',
        label: 'Examination Management',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="6" />
            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
          </svg>
        )
      },
      {
        id: 'results_progress',
        label: 'Results & Progression',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        )
      }
    ]
  },
  {
    title: 'STUDENT SERVICES & WELFARE',
    items: [
      {
        id: 'welfare_scholarships',
        label: 'Welfare & Scholarships',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        )
      },
      {
        id: 'societies_clubs',
        label: 'Student Societies & Club Permits',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        )
      },
      {
        id: 'announcements',
        label: 'Announcements',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        )
      },
      {
        id: 'forms_guidance',
        label: 'Forms & Process Guidance',
        hasSubmenu: true,
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        )
      },
      {
        id: 'penalties',
        label: 'Penalties & Disciplinary',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5" />
          </svg>
        )
      }
    ]
  },
  {
    title: 'SYSTEM & SECURITY',
    items: [
      {
        id: 'input_data',
        label: 'Input Data',
        badge: 'RAG',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        )
      },
      {
        id: 'users_roles',
        label: 'User & Role Management',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        )
      },
      {
        id: 'settings',
        label: 'System Settings',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        )
      }
    ]
  }
];

export default function Admin({ user, onLogout }) {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [stats, setStats] = useState(INITIAL_STATS);
  const [batches, setBatches] = useState(() => {
    try {
      const saved = localStorage.getItem('seuconnect_batches');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_BATCHES;
  });
  const [students, setStudents] = useState(() => {
    const localEnrolled = enrolledStorage.getAll();
    if (!localEnrolled || localEnrolled.length === 0) return INITIAL_STUDENTS;
    const existingRegNos = new Set(INITIAL_STUDENTS.map(s => (s.regNo || '').toLowerCase()));
    const additional = localEnrolled.filter(s => s.regNo && !existingRegNos.has(s.regNo.toLowerCase()));
    return [...additional, ...INITIAL_STUDENTS];
  });

  // Pull live student roster from MongoDB backend on mount and synchronize with storage
  useEffect(() => {
    let isMounted = true;
    api.getStudents().then((res) => {
      if (isMounted && res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setStudents((prev) => {
          const backendStudents = res.data;
          const backendRegNos = new Set(backendStudents.map(s => (s.regNo || s.studentId || '').toLowerCase()));
          const remainingLocal = prev.filter(s => s.regNo && !backendRegNos.has(s.regNo.toLowerCase()));
          const merged = [...backendStudents, ...remainingLocal];
          enrolledStorage.saveBulk(backendStudents);
          return merged;
        });
      }
    }).catch((err) => {
      console.warn('Could not fetch students from API on admin mount:', err.message);
    });
    return () => { isMounted = false; };
  }, []);
  const [registrations, setRegistrations] = useState(INITIAL_REGISTRATIONS);
  const [medicals, setMedicals] = useState(INITIAL_MEDICALS);
  const [examinations] = useState(INITIAL_EXAMINATIONS);
  const [repeatCandidates, setRepeatCandidates] = useState(INITIAL_REPEAT_CANDIDATES);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [facultyForms, setFacultyForms] = useState(INITIAL_FACULTY_FORMS);
  const [penalties, setPenalties] = useState(() => {
    const stored = penaltyStorage.getAll();
    if (!stored || stored.length === 0) return INITIAL_PENALTIES;
    const existingIds = new Set(INITIAL_PENALTIES.map(p => p.id));
    const custom = stored.filter(p => p.id && !existingIds.has(p.id));
    return [...custom, ...INITIAL_PENALTIES];
  });
  const [users, setUsers] = useState(() => {
    const localProvisioned = provisionedUserStorage.getAll();
    if (!localProvisioned || localProvisioned.length === 0) return INITIAL_USERS;
    const existingEmails = new Set(INITIAL_USERS.map(u => (u.email || '').toLowerCase()));
    const additional = localProvisioned.filter(u => u.email && !existingEmails.has(u.email.toLowerCase()));
    return [...additional, ...INITIAL_USERS];
  });
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOG);
  const [dbLoading, setDbLoading] = useState(true);

  // Fetch and synchronize real data from backend database & MongoDB
  useEffect(() => {
    let isMounted = true;

    const fetchDatabaseRecords = async () => {
      try {
        setDbLoading(true);

        const [statsRes, batchStatsRes, processesRes, usersRes, studentsRes] = await Promise.allSettled([
          api.getStats(),
          api.getBatchStats(),
          api.getProcesses(),
          api.getUsers(),
          api.getAllStudents()
        ]);

        if (!isMounted) return;

        // 1. Synchronize Students from Database
        let loadedStudents = [];
        if (studentsRes.status === 'fulfilled' && studentsRes.value?.data && Array.isArray(studentsRes.value.data) && studentsRes.value.data.length > 0) {
          const raw = studentsRes.value.data;
          loadedStudents = raw.map((s) => {
            const reg = s.studentId || s.regNo || s.indexNo;
            const bCode = s.batch || (reg.includes('20') ? 'Batch 01 (2020/2021)' : reg.includes('21') ? 'Batch 02 (2021/2022)' : reg.includes('22') ? 'Batch 03 (2022/2023)' : reg.includes('23') ? 'Batch 04 (2023/2024)' : 'Batch 05 (2024/2025)');
            const bId = bCode.includes('01') ? 'BATCH-01' : bCode.includes('02') ? 'BATCH-02' : bCode.includes('03') ? 'BATCH-03' : bCode.includes('04') ? 'BATCH-04' : 'BATCH-05';
            return {
              id: s._id ? String(s._id) : (s.id || `STU-${reg}`),
              batchId: bId,
              batchCode: bCode,
              regNo: reg,
              indexNo: s.indexNo || reg,
              name: s.fullName || s.name,
              programme: s.degreeProgramme || s.programme || (s.department?.includes('Bio') ? 'BST (Hons)' : 'BICT (Hons)'),
              department: s.department || 'Department of Information & Communication Technology',
              semester: s.currentSemester || s.semester || 'Semester 5',
              cgpa: Number(s.cgpa) || 3.40,
              sgpa: Number(s.sgpa) || 3.45,
              credits: s.credits || 78,
              attendance: Number(s.attendance) || 90,
              email: s.email,
              phone: s.phone || '',
              status: s.academicStatus || s.status || 'Active',
              welfare: s.welfare || 'Good Standing',
              specialization: s.specialization || (s.department?.includes('Bio') ? 'Bio-Processing Technology' : 'Software Technology'),
              repeatModules: s.repeatModules || []
            };
          });

          // Merge local enrolled storage
          const localEnrolled = enrolledStorage.getAll();
          const existingRegs = new Set(loadedStudents.map((s) => (s.regNo || '').toLowerCase()));
          const additional = localEnrolled.filter((s) => s.regNo && !existingRegs.has(s.regNo.toLowerCase()));
          const finalStudents = [...additional, ...loadedStudents];
          setStudents(finalStudents);
        }

        // 2. Synchronize Batches from Database
        if (batchStatsRes.status === 'fulfilled' && batchStatsRes.value?.data?.batches) {
          const dbBatches = batchStatsRes.value.data.batches;
          const currentStudents = loadedStudents.length > 0 ? loadedStudents : students;

          const mappedBatches = dbBatches.map((b, idx) => {
            const bNum = String(idx + 1).padStart(2, '0');
            const studentsInCohort = currentStudents.filter((s) => s.batchCode?.includes(b.batch) || s.regNo?.includes(`/${b.batch.slice(2, 4)}/`));
            const cohortAttendance = studentsInCohort.length > 0
              ? Math.round(studentsInCohort.reduce((sum, s) => sum + (Number(s.attendance) || 90), 0) / studentsInCohort.length)
              : 90;
            const cohortCgpa = studentsInCohort.length > 0
              ? Number((studentsInCohort.reduce((sum, s) => sum + (Number(s.cgpa) || 3.35), 0) / studentsInCohort.length).toFixed(2))
              : 3.38;

            return {
              id: `BATCH-${bNum}`,
              code: `B${bNum}`,
              name: `Batch ${bNum} (${b.batch})`,
              academicYear: b.batch,
              currentSemester: b.year ? `${b.year} (Active)` : `Semester ${idx * 2 + 1}`,
              status: idx === 0 ? 'Graduating / Finalizing' : (idx === dbBatches.length - 1 ? 'Freshers' : 'Active'),
              totalStudents: b.facultyTotal || (b.ict + b.bst) || studentsInCohort.length || 240,
              ictStudents: b.ict || studentsInCohort.filter((s) => s.programme?.includes('BICT') || s.department?.includes('ICT')).length || 120,
              bstStudents: b.bst || studentsInCohort.filter((s) => s.programme?.includes('BST') || s.department?.includes('Bio')).length || 120,
              coordinator: b.ict >= b.bst ? 'Dr. S. Sabraz Nawaz (HOD - ICT)' : 'Dr. U.L. Abdul Majeed (HOD - BST)',
              departments: ['BICT', 'BST'],
              avgCgpa: cohortCgpa,
              attendanceRate: cohortAttendance,
              regPrefix: b.batch.slice(2, 4)
            };
          });

          if (mappedBatches.length > 0) {
            setBatches(mappedBatches);
          }
        }

        // 3. Synchronize Workflow Processes (Medicals, Registrations, Repeat Candidates) from Database
        if (processesRes.status === 'fulfilled' && Array.isArray(processesRes.value?.data)) {
          const procList = processesRes.value.data;

          // Medical Requests from DB
          const dbMedicals = procList
            .filter((p) => p.type === 'medical_excuse' || p.type === 'subject_medical' || p.type === 'exam_medical')
            .map((p) => ({
              id: p.trackingNumber || String(p._id),
              regNo: p.student?.regNo || 'SEU/IS/22/ICT/085',
              studentName: p.student?.name || 'Student Candidate',
              programme: p.student?.programme || (p.student?.department?.includes('Bio') ? 'BST (Hons)' : 'BICT (Hons)'),
              department: p.student?.department || 'Faculty of Technology',
              submissionDate: p.submissionDate || (p.createdAt ? p.createdAt.split('T')[0] : '2026-10-10'),
              period: p.medical?.startDate ? `${p.medical.startDate} to ${p.medical.endDate || p.medical.startDate} (${p.medical.medicalDays || 1} days)` : '3 days',
              affectedModules: p.medical?.affectedModules || (p.subjects ? p.subjects.map((s) => `${s.code} - ${s.title}`) : ['Academic Modules']),
              medicalOfficer: p.medical?.doctorName || p.medical?.hospital || 'SEUSL Health Centre',
              diagnosis: p.medical?.diagnosis || p.title || 'Medical Exemption',
              certificateRef: p.medical?.slipNumber || p.trackingNumber || 'MC/SEUSL/2026/01',
              attendanceBefore: p.medical?.attendanceBefore || 72,
              attendanceAfterApproval: p.medical?.attendanceAfterApproval || 85,
              status: p.status === 'Approved' ? 'Approved' : (p.status === 'Declined' ? 'Rejected' : 'Pending'),
              verifiedBy: p.currentStage?.actionTakenBy || null,
              verificationDate: p.currentStage?.actionDate ? p.currentStage.actionDate.split('T')[0] : null,
              remarks: p.remarks || p.comment || ''
            }));
          if (dbMedicals.length > 0) setMedicals(dbMedicals);

          // Registrations from DB
          const dbRegistrations = procList
            .filter((p) => p.type === 'add_drop' || p.type === 'course_registration' || p.type === 'leave_absence' || p.type === 'special_concession')
            .map((p) => ({
              id: p.trackingNumber || String(p._id),
              regNo: p.student?.regNo || 'SEU/IS/22/ICT/085',
              studentName: p.student?.name || 'Student Candidate',
              programme: p.student?.programme || (p.student?.department?.includes('Bio') ? 'BST (Hons)' : 'BICT (Hons)'),
              semester: p.student?.currentSemester || p.addDrop?.semester || 'Semester 5',
              submissionDate: p.submissionDate || (p.createdAt ? p.createdAt.split('T')[0] : '2026-10-10'),
              type: p.type === 'add_drop' ? 'Add/Drop Module Amendment' : 'Regular Semester Registration',
              totalCredits: p.addDrop?.totalCredits || 18,
              modules: p.addDrop?.modules || (p.subjects ? p.subjects.map((s) => `${s.code} - ${s.title}`) : ['Module Credits']),
              status: p.status === 'Approved' ? 'Approved' : (p.status === 'Declined' ? 'Rejected' : 'Pending'),
              approvedBy: p.currentStage?.actionTakenBy || null,
              approvalDate: p.currentStage?.actionDate ? p.currentStage.actionDate.split('T')[0] : null,
              remarks: p.remarks || p.comment || ''
            }));
          if (dbRegistrations.length > 0) setRegistrations(dbRegistrations);

          // Repeat Exam Candidates from DB
          const dbRepeat = procList
            .filter((p) => p.type === 'repeat_exam' || p.type === 'eca_application' || p.type === 'esa_application' || p.type === 'exam_form')
            .map((p) => ({
              id: p.trackingNumber || String(p._id),
              regNo: p.student?.regNo || 'SEU/IS/22/ICT/085',
              studentName: p.student?.name || 'Student Candidate',
              programme: p.student?.programme || (p.student?.department?.includes('Bio') ? 'BST (Hons)' : 'BICT (Hons)'),
              moduleCode: p.repeatExam?.moduleCode || (p.subjects && p.subjects[0]?.code) || 'ICT3101',
              moduleName: p.repeatExam?.moduleName || (p.subjects && p.subjects[0]?.title) || 'Repeat Module',
              academicYear: p.academicYear || '2025/2026',
              attemptNumber: p.repeatExam?.attemptNumber || '2nd Attempt',
              pivNumber: p.repeatExam?.paymentVoucherNumber || p.trackingNumber,
              pivAmount: p.repeatExam?.paymentAmount || 'Rs. 500',
              pivDate: p.submissionDate || '2026-10-10',
              status: p.status === 'Approved' ? 'Verified' : (p.status === 'Declined' ? 'Rejected' : 'Pending'),
              eligible: p.status === 'Approved'
            }));
          if (dbRepeat.length > 0) setRepeatCandidates(dbRepeat);
        }

        // 4. Synchronize Users from Database
        if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value?.data) && usersRes.value.data.length > 0) {
          const rawUsers = usersRes.value.data;
          const mappedUsers = rawUsers.map((u) => ({
            id: u.id || String(u._id),
            name: u.name,
            email: u.email,
            tempPassword: u.tempPassword || 'Seu@2024Pass',
            role: u.role,
            roleKey: (u.roleKey || u.role || 'lecturer').toLowerCase(),
            department: u.department || 'Faculty of Technology',
            designation: u.designation || u.role,
            isLeadership: ['dean', 'hod', 'sar'].includes((u.roleKey || u.role || '').toLowerCase()),
            status: u.status || 'Active',
            lastLogin: u.lastLogin || 'Recent',
            permissions: u.permissions || 'Standard Role Access'
          }));

          const localUsers = provisionedUserStorage.getAll();
          const existingEmails = new Set(mappedUsers.map((u) => u.email.toLowerCase()));
          const additional = localUsers.filter((u) => u.email && !existingEmails.has(u.email.toLowerCase()));
          setUsers([...additional, ...mappedUsers]);
        }

        // 5. Compute Dynamic Real Statistics
        setStats((prev) => {
          const effectiveStudents = loadedStudents.length > 0 ? loadedStudents : students;
          const activeStu = effectiveStudents.filter((s) => s.status === 'Active');
          const totalAtt = activeStu.reduce((acc, s) => acc + (Number(s.attendance) || 90), 0);
          const totalGpa = activeStu.reduce((acc, s) => acc + (Number(s.cgpa) || 3.0), 0);
          const count = activeStu.length || 1;

          const dbStats = statsRes.status === 'fulfilled' ? statsRes.value?.data : null;
          const pBreakdown = dbStats?.pendingBreakdown || {};

          return {
            ...prev,
            totalStudents: effectiveStudents.length || prev.totalStudents,
            activeStudents: activeStu.length || prev.activeStudents,
            bictStudents: effectiveStudents.filter((s) => s.programme?.includes('BICT') || s.department?.includes('ICT')).length || prev.bictStudents,
            bstStudents: effectiveStudents.filter((s) => s.programme?.includes('BST') || s.department?.includes('Bio')).length || prev.bstStudents,
            avgAttendance: Number((totalAtt / count).toFixed(1)) || prev.avgAttendance,
            avgGpa: Number((totalGpa / count).toFixed(2)) || prev.avgGpa,
            pendingMedicals: pBreakdown.medical !== undefined ? pBreakdown.medical : prev.pendingMedicals,
            pendingRegistrations: dbStats?.inProgressRequests !== undefined ? dbStats.inProgressRequests : prev.pendingRegistrations,
            examRegistrations: pBreakdown.examination !== undefined ? pBreakdown.examination : prev.examRegistrations,
          };
        });
      } catch (err) {
        console.warn('Real database data load error:', err);
      } finally {
        if (isMounted) setDbLoading(false);
      }
    };

    fetchDatabaseRecords();

    return () => {
      isMounted = false;
    };
  }, []);

  // Global modals triggered from top action buttons
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3800);
  };

  // Add Log helper
  const addAuditLog = (action, detail) => {
    const newLog = {
      id: `LOG-${Date.now()}`,
      time: 'Just now',
      user: user?.email || 'Admin@gmail.com',
      action,
      detail
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // 1. Approve Medical Request
  const handleApproveMedical = (id) => {
    const med = medicals.find((m) => m.id === id);
    if (!med) return;

    setMedicals((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'Approved', verificationDate: 'Today' } : m))
    );

    // Update student attendance
    setStudents((prev) =>
      prev.map((s) => (s.regNo === med.regNo ? { ...s, attendance: med.attendanceAfterApproval } : s))
    );

    setStats((prev) => ({
      ...prev,
      pendingMedicals: Math.max(0, prev.pendingMedicals - 1)
    }));

    addAuditLog('Approved Medical Certificate', `${med.certificateRef} for ${med.studentName} (${med.regNo}). Restored to ${med.attendanceAfterApproval}%.`);
    showToast(`Medical Certificate ${med.certificateRef} approved. Attendance updated to ${med.attendanceAfterApproval}%.`);
  };

  // 2. Reject Medical Request
  const handleRejectMedical = (id, reason) => {
    const med = medicals.find((m) => m.id === id);
    if (!med) return;

    setMedicals((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'Rejected', remarks: reason } : m))
    );

    setStats((prev) => ({
      ...prev,
      pendingMedicals: Math.max(0, prev.pendingMedicals - 1)
    }));

    addAuditLog('Rejected Medical Certificate', `${med.certificateRef} (${med.regNo}): ${reason}`);
    showToast(`Medical Request ${med.certificateRef} rejected.`);
  };

  // 3. Approve Registration Request
  const handleApproveRegistration = (id) => {
    const reg = registrations.find((r) => r.id === id);
    if (!reg) return;

    setRegistrations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Approved', approvalDate: 'Today' } : r))
    );

    setStats((prev) => ({
      ...prev,
      pendingRegistrations: Math.max(0, prev.pendingRegistrations - 1)
    }));

    addAuditLog('Approved Course Registration', `${reg.id} for ${reg.studentName} (${reg.regNo} - ${reg.totalCredits} Credits).`);
    showToast(`Semester Registration ${reg.id} approved for ${reg.studentName}.`);
  };

  // 4. Batch Approve Registrations
  const handleBatchApprove = () => {
    setRegistrations((prev) =>
      prev.map((r) => ({ ...r, status: 'Approved', approvalDate: 'Today' }))
    );
    setStats((prev) => ({ ...prev, pendingRegistrations: 0 }));
    addAuditLog('Batch Approved Registrations', 'All pending semester subject applications approved.');
    showToast('All pending semester subject registrations have been approved.');
  };

  // 5. Add Student
  const handleAddStudent = async (newStudent) => {
    enrolledStorage.save(newStudent);
    setStudents((prev) => [newStudent, ...prev]);
    setStats((prev) => ({
      ...prev,
      totalStudents: prev.totalStudents + 1,
      activeAccounts: prev.activeAccounts + 1
    }));
    addAuditLog('Registered Student Account', `${newStudent.regNo} - ${newStudent.name} enrolled in ${newStudent.programme}.`);
    showToast(`Student ${newStudent.name} (${newStudent.regNo}) registered! Login: ${newStudent.email} / ${newStudent.tempPassword || 'Pass'}`);
    try {
      await api.createStudent({
        ...newStudent,
        tempPassword: newStudent.tempPassword
      });
    } catch (err) {
      console.warn('Backend student sync:', err.message);
    }
  };

  // 5.b Bulk Add Students (200+ Student Cohorts from Excel/CSV)
  const handleBulkAddStudents = async (newStudentsList, targetBatchId) => {
    enrolledStorage.saveBulk(newStudentsList);
    if (!newStudentsList || newStudentsList.length === 0) return;

    setStudents((prev) => [...newStudentsList, ...prev]);

    if (targetBatchId) {
      setBatches((prev) =>
        prev.map((b) =>
          b.id === targetBatchId
            ? { ...b, totalStudents: (b.totalStudents || 0) + newStudentsList.length }
            : b
        )
      );
    }

    setStats((prev) => ({
      ...prev,
      totalStudents: prev.totalStudents + newStudentsList.length,
      activeAccounts: prev.activeAccounts + newStudentsList.length
    }));

    const targetBatch = batches.find((b) => b.id === targetBatchId);
    const batchLabel = targetBatch ? targetBatch.name : 'Target Cohort';
    addAuditLog(
      'Bulk Enrolled Students',
      `Imported ${newStudentsList.length} undergraduates into ${batchLabel} via pre-defined spreadsheet roster.`
    );
    showToast(`Successfully enrolled ${newStudentsList.length} undergraduates into ${batchLabel}. Credentials active for immediate login.`);
    try {
      await api.bulkCreateStudents(newStudentsList);
    } catch (err) {
      console.warn('Backend bulk student sync:', err.message);
    }
  };

  // 5.c Delete Student Record
  const handleDeleteStudent = async (studentIdOrRegNo) => {
    const stu = students.find((s) => s.id === studentIdOrRegNo || s.regNo === studentIdOrRegNo);
    const cleanId = stu?.regNo || studentIdOrRegNo;

    setStudents((prev) =>
      prev.filter((s) => s.id !== studentIdOrRegNo && s.regNo !== studentIdOrRegNo)
    );

    enrolledStorage.remove(cleanId);

    if (stu?.batchId) {
      setBatches((prev) =>
        prev.map((b) =>
          b.id === stu.batchId
            ? { ...b, totalStudents: Math.max(0, (b.totalStudents || 1) - 1) }
            : b
        )
      );
    }

    setStats((prev) => ({
      ...prev,
      totalStudents: Math.max(0, prev.totalStudents - 1),
      activeAccounts: Math.max(0, prev.activeAccounts - 1)
    }));

    addAuditLog('Deleted Student Record', `Removed ${cleanId} (${stu?.name || 'Student'}).`);
    showToast(`Student ${stu?.name || cleanId} has been deleted from records.`);

    try {
      await api.deleteStudent(cleanId);
    } catch (err) {
      console.warn('Backend student delete:', err.message);
    }
  };

  // 5.d Update Student Record
  const handleUpdateStudent = async (updatedStudent) => {
    const targetId = updatedStudent.id || updatedStudent.regNo;
    setStudents((prev) =>
      prev.map((s) =>
        s.id === targetId || s.regNo === updatedStudent.regNo ? { ...s, ...updatedStudent } : s
      )
    );

    enrolledStorage.update(updatedStudent.regNo || targetId, updatedStudent);
    addAuditLog('Updated Student Profile', `Updated profile for ${updatedStudent.regNo} (${updatedStudent.name}).`);
    showToast(`Student ${updatedStudent.name} (${updatedStudent.regNo}) updated successfully.`);

    try {
      await api.updateStudent(updatedStudent.regNo || targetId, updatedStudent);
    } catch (err) {
      console.warn('Backend student update:', err.message);
    }
  };

  // 6. Update Student Status
  const handleUpdateStudentStatus = (id, newStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
    const stu = students.find((s) => s.id === id);
    addAuditLog('Updated Student Standing', `${stu?.regNo} standing changed to "${newStatus}".`);
    showToast(`Student standing updated to ${newStatus}.`);
  };

  // 7. Clear Repeat Exam Candidate
  const handleClearRepeatCandidate = (id) => {
    setRepeatCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pivSlipVerified: true, admissionStatus: 'Cleared' } : c))
    );
    setStats((prev) => ({
      ...prev,
      pendingExamClearance: Math.max(0, prev.pendingExamClearance - 1)
    }));
    const cand = repeatCandidates.find((c) => c.id === id);
    addAuditLog('Cleared Repeat Admission', `${cand?.regNo} (${cand?.moduleCode}) bank PIV slip verified.`);
    showToast(`Exam Admission cleared for ${cand?.studentName} (${cand?.moduleCode}).`);
  };

  // 8. Add Announcement
  const handleAddAnnouncement = (newAnn) => {
    setAnnouncements((prev) => [newAnn, ...prev]);
    setStats((prev) => ({
      ...prev,
      publishedAnnouncements: prev.publishedAnnouncements + 1
    }));
    addAuditLog('Published Faculty Notice', `"${newAnn.title}" broadcast to ${newAnn.targetAudience}.`);
    showToast('Official announcement published to student portal.');
  };

  // 9. Delete Announcement
  const handleDeleteAnnouncement = (id) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    addAuditLog('Deleted Announcement', `Notice ID ${id} removed.`);
    showToast('Announcement removed.');
  };

  // 10. Toggle Pin Announcement
  const handleTogglePinAnnouncement = (id) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, pinned: !a.pinned } : a))
    );
  };

  // 11. Add Faculty Form
  const handleAddForm = (newForm) => {
    setFacultyForms((prev) => [newForm, ...prev]);
    addAuditLog('Uploaded Faculty Form', `${newForm.code}: ${newForm.title}`);
    showToast(`Form ${newForm.code} published to faculty downloads.`);
  };

  // 12. Clear Penalty
  const handleClearPenalty = (id) => {
    setPenalties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'Cleared' } : p))
    );
    penaltyStorage.updateStatus(id, 'Cleared', 'Fine payment receipt verified by Faculty Administration.');
    addAuditLog('Cleared Disciplinary Penalty', `Fine/penalty cleared for entry ${id}.`);
    showToast('Disciplinary record cleared.');
  };

  // 13. Add Penalty
  const handleAddPenalty = (newPen) => {
    penaltyStorage.save(newPen);
    setPenalties((prev) => [newPen, ...prev]);
    setStats((prev) => ({ ...prev, disciplinaryCases: prev.disciplinaryCases + 1 }));
    addAuditLog('Recorded Disciplinary Fine', `${newPen.regNo}: ${newPen.category} (${newPen.department || 'Faculty of Technology'})`);
    showToast(`Disciplinary record logged & notices dispatched to HOD and student.`);
  };

  // 14. Toggle User Status
  const handleToggleUserStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u))
    );
    showToast('User account status updated.');
  };

  // 15. Publish Results
  const handlePublishResults = (sem) => {
    addAuditLog('Published Moderated Results', `SGPA & CGPA ledgers finalized and released for ${sem}.`);
    showToast(`Results Ledger for ${sem} published to student portal.`);
  };

  // 16. Onboard Intake Batch
  const handleAddBatch = (newBatch) => {
    setBatches((prev) => {
      const updated = [newBatch, ...prev];
      try {
        localStorage.setItem('seuconnect_batches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setStats((prev) => ({ ...prev, totalBatches: prev.totalBatches + 1 }));
    addAuditLog('Onboarded Intake Batch', `${newBatch.name} (Intake ${newBatch.code}) provisioned.`);
    showToast(`Intake Batch ${newBatch.name} onboarded successfully.`);
  };

  // 16.b Delete Intake Batch
  const handleDeleteBatch = (batchId) => {
    const batch = batches.find((b) => b.id === batchId);
    setBatches((prev) => {
      const updated = prev.filter((b) => b.id !== batchId);
      try {
        localStorage.setItem('seuconnect_batches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setStats((prev) => ({ ...prev, totalBatches: Math.max(0, prev.totalBatches - 1) }));
    addAuditLog('Deleted Intake Batch', `Removed intake batch ${batch?.name || batchId}.`);
    showToast(`Intake Batch "${batch?.name || batchId}" deleted successfully.`);
  };

  // 16.c Pass Out Intake Batch (Graduation of Cohort)
  const handlePassOutBatch = (batchId) => {
    const targetBatch = batches.find((b) => b.id === batchId);
    if (!targetBatch) return;

    // 1. Advance batch status to Passed Out
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id !== batchId) return b;
        return {
          ...b,
          status: 'Passed Out (Graduated)',
          currentSemester: 'Semester 8 (Passed Out)'
        };
      })
    );

    // 2. Mark all enrolled students in this batch as Passed Out
    setStudents((prev) =>
      prev.map((s) => {
        if (s.batchId !== batchId) return s;
        return {
          ...s,
          status: 'Passed Out'
        };
      })
    );

    addAuditLog(
      'Batch Passed Out (Graduated)',
      `Cohort ${targetBatch.name} (${targetBatch.academicYear}) has officially passed out. Enrolled undergraduates graduated.`
    );
    showToast(`🎓 Batch ${targetBatch.name} has officially passed out! All students graduated.`);
  };

  // 17. Assign & Reassign Roles with Institutional System Rules
  const handleAssignRole = (userId, { role, department, designation }) => {
    const roleKey =
      role === 'Head of Department (HOD)' ? 'hod' :
      role === 'Faculty Dean' ? 'dean' :
      role === 'Senior Assistant Registrar (SAR)' ? 'sar' :
      role === 'Examination Officer' ? 'examination' :
      role === 'Lecturer' ? 'lecturer' :
      role === 'Department Management Assistant (Dept MA)' ? 'dept_ma' :
      role === 'Faculty Management Assistant (FMA)' ? 'fma' :
      role === 'Student' ? 'student' :
      role === 'Super Admin' ? 'superadmin' : 'admin';

    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    // Check System Administrator rule (max 2)
    if (role === 'System Administrator') {
      const otherAdmins = users.filter((u) => u.id !== userId && u.role === 'System Administrator');
      if (otherAdmins.length >= 2) {
        showToast('Rule Violation: Maximum 2 System Administrators permitted. Please step down an existing admin first.');
        return;
      }
    }

    let steppedDownName = '';
    let steppedDownRole = '';

    setUsers((prev) => {
      let updated = [...prev];

      // 1. Dean Rule: Exactly 1 Dean in system
      if (role === 'Faculty Dean') {
        updated = updated.map((u) => {
          if (u.id !== userId && u.role === 'Faculty Dean') {
            steppedDownName = u.name;
            steppedDownRole = 'Faculty Dean';
            const demoted = {
              ...u,
              role: 'Lecturer',
              roleKey: 'lecturer',
              designation: 'Senior Lecturer (Former Dean)',
              isLeadership: false,
              permissions: 'Granted permissions for Lecturer'
            };
            provisionedUserStorage.save(demoted);
            return demoted;
          }
          return u;
        });
      }

      // 2. HOD Rule: Exactly 2 HODs (1 for DICT, 1 for BST)
      else if (role === 'Head of Department (HOD)') {
        const isBst = department.includes('Bio') || department.includes('BST');
        const deptLabel = isBst ? 'BST' : 'DICT';
        updated = updated.map((u) => {
          if (u.id !== userId && u.role === 'Head of Department (HOD)') {
            const uIsBst = u.department?.includes('Bio') || u.department?.includes('BST');
            if (uIsBst === isBst) {
              steppedDownName = u.name;
              steppedDownRole = `HOD (${deptLabel})`;
              const demoted = {
                ...u,
                role: 'Lecturer',
                roleKey: 'lecturer',
                designation: `Senior Lecturer Gr. I in ${deptLabel} (Former HOD)`,
                isLeadership: false,
                permissions: 'Granted permissions for Lecturer'
              };
              provisionedUserStorage.save(demoted);
              return demoted;
            }
          }
          return u;
        });
      }

      // 3. SAR Rule: Exactly 1 SAR in system
      else if (role === 'Senior Assistant Registrar (SAR)') {
        updated = updated.map((u) => {
          if (u.id !== userId && u.role === 'Senior Assistant Registrar (SAR)') {
            steppedDownName = u.name;
            steppedDownRole = 'SAR';
            const demoted = {
              ...u,
              role: 'Lecturer',
              roleKey: 'lecturer',
              designation: 'Faculty Administrative Officer (Former SAR)',
              isLeadership: false,
              permissions: 'Granted permissions for Lecturer'
            };
            provisionedUserStorage.save(demoted);
            return demoted;
          }
          return u;
        });
      }

      // 4. Examination Officer Rule: Exactly 1 Exam Officer in system
      else if (role === 'Examination Officer') {
        updated = updated.map((u) => {
          if (u.id !== userId && u.role === 'Examination Officer') {
            steppedDownName = u.name;
            steppedDownRole = 'Examination Officer';
            const demoted = {
              ...u,
              role: 'Lecturer',
              roleKey: 'lecturer',
              designation: 'Senior Lecturer (Former Exam Officer)',
              isLeadership: false,
              permissions: 'Granted permissions for Lecturer'
            };
            provisionedUserStorage.save(demoted);
            return demoted;
          }
          return u;
        });
      }

      // 5. Dept MA Rule: Exactly 1 Dept MA in system
      else if (role === 'Department Management Assistant (Dept MA)') {
        updated = updated.map((u) => {
          if (u.id !== userId && u.role === 'Department Management Assistant (Dept MA)') {
            steppedDownName = u.name;
            steppedDownRole = 'Dept MA';
            const demoted = {
              ...u,
              role: 'Lecturer',
              roleKey: 'lecturer',
              designation: 'Management Assistant (Former Dept MA)',
              isLeadership: false,
              permissions: 'Granted permissions for Lecturer'
            };
            provisionedUserStorage.save(demoted);
            return demoted;
          }
          return u;
        });
      }

      // 6. FMA Rule: Exactly 1 FMA in system
      else if (role === 'Faculty Management Assistant (FMA)') {
        updated = updated.map((u) => {
          if (u.id !== userId && u.role === 'Faculty Management Assistant (FMA)') {
            steppedDownName = u.name;
            steppedDownRole = 'FMA';
            const demoted = {
              ...u,
              role: 'Lecturer',
              roleKey: 'lecturer',
              designation: 'Management Assistant (Former FMA)',
              isLeadership: false,
              permissions: 'Granted permissions for Lecturer'
            };
            provisionedUserStorage.save(demoted);
            return demoted;
          }
          return u;
        });
      }

      // Update the target promoted user
      updated = updated.map((u) =>
        u.id === userId
          ? {
              ...u,
              role,
              roleKey,
              department,
              designation,
              isLeadership: ['Faculty Dean', 'Head of Department (HOD)', 'Senior Assistant Registrar (SAR)', 'Examination Officer'].includes(role)
            }
          : u
      );

      const targetPromoted = updated.find((u) => u.id === userId);
      if (targetPromoted) {
        if (role === 'Lecturer' && targetPromoted.email) {
          try {
            localStorage.setItem(`seu_lecturer_courses_${targetPromoted.email.toLowerCase().trim()}`, JSON.stringify([]));
          } catch (e) {}
        }
        provisionedUserStorage.save(targetPromoted);
      }

      return updated;
    });

    if (steppedDownName) {
      addAuditLog('System Rule Promotion', `${steppedDownName} stepped down from ${steppedDownRole} to Lecturer. ${targetUser.name} promoted to ${role}.`);
      showToast(`${targetUser.name} promoted to ${role} (${steppedDownName} stepped down to Lecturer).`);
    } else {
      addAuditLog('Reassigned User Role', `${targetUser.name} assigned as "${role}" in ${department}.`);
      showToast(`Role for ${targetUser.name} updated to ${role}.`);
    }
  };

  // 18. Appoint New Staff Member / Provision User Account with System Rules
  const handleAppointUser = async (newStaff) => {
    // Check System Administrator rule (max 2)
    if (newStaff.role === 'System Administrator') {
      const activeAdmins = users.filter((u) => u.role === 'System Administrator');
      if (activeAdmins.length >= 2) {
        showToast('Rule Violation: Maximum 2 System Administrators permitted. Please step down an existing admin first.');
        return;
      }
    }

    let steppedDownName = '';
    let steppedDownRole = '';

    setUsers((prev) => {
      let updated = [...prev];

      // Dean Rule (1)
      if (newStaff.role === 'Faculty Dean') {
        updated = updated.map((u) => {
          if (u.role === 'Faculty Dean') {
            steppedDownName = u.name;
            steppedDownRole = 'Faculty Dean';
            const demoted = {
              ...u,
              role: 'Lecturer',
              roleKey: 'lecturer',
              designation: 'Senior Lecturer (Former Dean)',
              isLeadership: false,
              permissions: 'Granted permissions for Lecturer'
            };
            provisionedUserStorage.save(demoted);
            return demoted;
          }
          return u;
        });
      }
      // HOD Rule (2: 1 DICT, 1 BST)
      else if (newStaff.role === 'Head of Department (HOD)') {
        const isBst = newStaff.department?.includes('Bio') || newStaff.department?.includes('BST');
        const deptLabel = isBst ? 'BST' : 'DICT';
        updated = updated.map((u) => {
          if (u.role === 'Head of Department (HOD)') {
            const uIsBst = u.department?.includes('Bio') || u.department?.includes('BST');
            if (uIsBst === isBst) {
              steppedDownName = u.name;
              steppedDownRole = `HOD (${deptLabel})`;
              const demoted = {
                ...u,
                role: 'Lecturer',
                roleKey: 'lecturer',
                designation: `Senior Lecturer Gr. I in ${deptLabel} (Former HOD)`,
                isLeadership: false,
                permissions: 'Granted permissions for Lecturer'
              };
              provisionedUserStorage.save(demoted);
              return demoted;
            }
          }
          return u;
        });
      }
      // SAR Rule (1)
      else if (newStaff.role === 'Senior Assistant Registrar (SAR)') {
        updated = updated.map((u) => {
          if (u.role === 'Senior Assistant Registrar (SAR)') {
            steppedDownName = u.name;
            steppedDownRole = 'SAR';
            const demoted = {
              ...u,
              role: 'Lecturer',
              roleKey: 'lecturer',
              designation: 'Faculty Administrative Officer (Former SAR)',
              isLeadership: false,
              permissions: 'Granted permissions for Lecturer'
            };
            provisionedUserStorage.save(demoted);
            return demoted;
          }
          return u;
        });
      }
      // Examination Officer Rule (1)
      else if (newStaff.role === 'Examination Officer') {
        updated = updated.map((u) => {
          if (u.role === 'Examination Officer') {
            steppedDownName = u.name;
            steppedDownRole = 'Examination Officer';
            const demoted = {
              ...u,
              role: 'Lecturer',
              roleKey: 'lecturer',
              designation: 'Senior Lecturer (Former Exam Officer)',
              isLeadership: false,
              permissions: 'Granted permissions for Lecturer'
            };
            provisionedUserStorage.save(demoted);
            return demoted;
          }
          return u;
        });
      }
      // Dept MA Rule (1)
      else if (newStaff.role === 'Department Management Assistant (Dept MA)') {
        updated = updated.map((u) => {
          if (u.role === 'Department Management Assistant (Dept MA)') {
            steppedDownName = u.name;
            steppedDownRole = 'Dept MA';
            const demoted = {
              ...u,
              role: 'Lecturer',
              roleKey: 'lecturer',
              designation: 'Management Assistant (Former Dept MA)',
              isLeadership: false,
              permissions: 'Granted permissions for Lecturer'
            };
            provisionedUserStorage.save(demoted);
            return demoted;
          }
          return u;
        });
      }
      // FMA Rule (1)
      else if (newStaff.role === 'Faculty Management Assistant (FMA)') {
        updated = updated.map((u) => {
          if (u.role === 'Faculty Management Assistant (FMA)') {
            steppedDownName = u.name;
            steppedDownRole = 'FMA';
            const demoted = {
              ...u,
              role: 'Lecturer',
              roleKey: 'lecturer',
              designation: 'Management Assistant (Former FMA)',
              isLeadership: false,
              permissions: 'Granted permissions for Lecturer'
            };
            provisionedUserStorage.save(demoted);
            return demoted;
          }
          return u;
        });
      }

      return [newStaff, ...updated];
    });

    const staffToSave = {
      ...newStaff,
      allocatedCourses: newStaff.role === 'Lecturer' ? [] : (newStaff.allocatedCourses || []),
    };
    if (newStaff.role === 'Lecturer' && newStaff.email) {
      try {
        localStorage.setItem(`seu_lecturer_courses_${newStaff.email.toLowerCase().trim()}`, JSON.stringify([]));
      } catch (e) {}
    }
    provisionedUserStorage.save(staffToSave);
    try {
      await api.provisionUser(staffToSave);
    } catch (e) {
      console.warn('Backend user provisioning failed/offline:', e.message);
    }

    if (steppedDownName) {
      addAuditLog('System Rule Provisioning', `${steppedDownName} stepped down from ${steppedDownRole} to Lecturer. ${newStaff.name} appointed as ${newStaff.role}.`);
      showToast(`User ${newStaff.name} appointed as ${newStaff.role} (${steppedDownName} stepped down to Lecturer).`);
    } else {
      addAuditLog('Provisioned User Account', `${newStaff.name} created as ${newStaff.role} (${newStaff.email}).`);
      showToast(`User account for ${newStaff.name} (${newStaff.role}) provisioned with temporary password.`);
    }
  };

  // 19. Promote Batch to Next Semester & Auto-Shift Enrolled Subjects
  const handlePromoteBatch = (batchId, nextSem, allocatedCourses, departmentScope = 'BOTH') => {
    // 1. Advance the batch's currentSemester
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id !== batchId) return b;
        const newStatus = nextSem.includes('Semester 8')
          ? 'Graduating / Finalizing'
          : b.status.includes('Freshers')
          ? 'Active'
          : b.status;
        if (departmentScope === 'BOTH') {
          return { ...b, currentSemester: nextSem, status: newStatus };
        } else if (departmentScope === 'BICT') {
          return {
            ...b,
            currentSemester: `${nextSem} (ICT)`,
            status: newStatus
          };
        } else if (departmentScope === 'BST') {
          return {
            ...b,
            currentSemester: `${nextSem} (BST)`,
            status: newStatus
          };
        }
        return { ...b, currentSemester: nextSem, status: newStatus };
      })
    );

    // 2. Automatically update all enrolled students in that batch based on department scope
    setStudents((prev) =>
      prev.map((s) => {
        if (s.batchId !== batchId) return s;
        const isBICT = s.programme?.includes('BICT') || s.department?.includes('Information') || s.regNo?.includes('/ICT/');
        const isBST = s.programme?.includes('BST') || s.department?.includes('Bio') || s.regNo?.includes('/BST/');

        if (departmentScope === 'BICT' && !isBICT) return s;
        if (departmentScope === 'BST' && !isBST) return s;

        return { ...s, semester: nextSem };
      })
    );

    // 3. Auto-populate course registrations for all target students in that batch with new curriculum courses
    const targetStudents = students.filter((s) => {
      if (s.batchId !== batchId) return false;
      const isBICT = s.programme?.includes('BICT') || s.department?.includes('Information') || s.regNo?.includes('/ICT/');
      const isBST = s.programme?.includes('BST') || s.department?.includes('Bio') || s.regNo?.includes('/BST/');

      if (departmentScope === 'BICT') return isBICT;
      if (departmentScope === 'BST') return isBST;
      return true;
    });

    if (targetStudents.length > 0 && allocatedCourses && allocatedCourses.length > 0) {
      const newRegistrations = targetStudents.map((s) => {
        const studentDeptCourses = allocatedCourses.filter((c) =>
          s.programme.includes(c.department) || (s.department && s.department.includes(c.department))
        );
        const moduleTitles = (studentDeptCourses.length > 0 ? studentDeptCourses : allocatedCourses).map(
          (c) => `${c.code} - ${c.name} (${c.credits} Cr)`
        );
        const totalCredits = (studentDeptCourses.length > 0 ? studentDeptCourses : allocatedCourses).reduce(
          (sum, c) => sum + (c.credits || 0),
          0
        );

        return {
          id: `REG-AUTO-${s.regNo.replace(/\//g, '-')}-${Date.now().toString().slice(-4)}`,
          regNo: s.regNo,
          studentName: s.name,
          programme: s.programme,
          batchCode: s.batchCode,
          semester: nextSem,
          submissionDate: 'Today (Auto-Shifted)',
          totalCredits,
          modules: moduleTitles,
          status: 'Approved',
          approvalDate: 'Today'
        };
      });

      setRegistrations((prev) => [...newRegistrations, ...prev]);
    }

    const scopeLabel =
      departmentScope === 'BICT'
        ? 'ICT Department Only'
        : departmentScope === 'BST'
        ? 'BST Department Only'
        : 'Both Departments (BICT & BST)';

    addAuditLog(
      'Promoted Cohort & Auto-Shifted Curriculum',
      `Promoted batch ${batchId} (${scopeLabel}) to ${nextSem}. Auto-shifted subjects for ${targetStudents.length} enrolled undergraduates.`
    );

    const targetBatch = batches.find((b) => b.id === batchId);
    const batchDisplayName = targetBatch?.name || batchId;
    if (nextSem.includes('Semester 8')) {
      showToast(`🚀 ${batchDisplayName} promoted to ${nextSem}! Next option is Pass Out.`);
    } else {
      showToast(`🚀 ${batchDisplayName} promoted to ${nextSem}!`);
    }
  };

  // 16. Global Topbar Search Handler
  const handleGlobalSearch = (query) => {
    if (!query) return;
    const q = query.toLowerCase();
    if (q.includes('student') || q.includes('profile') || q.includes('gpa') || q.includes('reg') || q.startsWith('2')) {
      setCurrentSection('student_management');
    } else if (q.includes('medical') || q.includes('health') || q.includes('doctor') || q.includes('excuse')) {
      setCurrentSection('attendance_medicals');
    } else if (q.includes('exam') || q.includes('esa') || q.includes('repeat')) {
      setCurrentSection('examinations');
    } else if (q.includes('notice') || q.includes('announc')) {
      setCurrentSection('announcements');
    } else if (q.includes('form') || q.includes('voucher') || q.includes('piv')) {
      setCurrentSection('forms_guidance');
    } else if (q.includes('welfare') || q.includes('mahapola') || q.includes('bursary')) {
      setCurrentSection('welfare_scholarships');
    } else if (q.includes('input') || q.includes('data') || q.includes('date') || q.includes('rag') || q.includes('by-law') || q.includes('knowledge')) {
      setCurrentSection('input_data');
    } else {
      setCurrentSection('student_management');
    }
  };

  // Custom User details for DashboardTemplate
  const adminUser = {
    name: user?.name || 'Faculty Admin Office',
    email: user?.email || 'Admin@gmail.com',
    role: 'ADMIN',
    avatarInitial: 'AD'
  };

  // Total pending tasks for topbar notification badge
  const pendingTotal = stats.pendingMedicals + stats.pendingRegistrations + stats.pendingExamClearance;

  // Dynamically update notification badge in sidebar navigation
  const adminNavSections = ADMIN_NAV_SECTIONS.map((section) => {
    if (section.title === 'MAIN') {
      return {
        ...section,
        items: section.items.map((item) =>
          item.id === 'notifications' ? { ...item, badge: pendingTotal } : item
        )
      };
    }
    return section;
  });

  return (
    <DashboardTemplate
      user={adminUser}
      onLogout={onLogout}
      activeItem={currentSection}
      onNavigate={(id) => setCurrentSection(id)}
      navSections={adminNavSections}
      facultyPillText="SOUTH EASTERN UNIVERSITY OF SRI LANKA • FACULTY OF TECHNOLOGY • ADMIN CONSOLE"
      greetingText="Good Morning, Faculty Administrator"
      notificationCount={pendingTotal}
      searchPlaceholder="Search student records, reg numbers, staff, or faculty requests..."
      onSearch={handleGlobalSearch}
      metaItems={[
        { label: 'Role:', value: 'System Administrator' },
        { label: 'Division:', value: 'Academic & Student Affairs' },
        { label: 'Faculty:', value: 'Faculty of Technology' },
        { label: 'Campus:', value: 'Oluvil Main Campus' }
      ]}
      actionButtons={
        <>
          <button
            type="button"
            className="seu-btn-gpa-report"
            onClick={() => {
              setCurrentSection('student_management');
              setIsAddStudentModalOpen(true);
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            + Register Student
          </button>

          <button
            type="button"
            className="seu-btn-faculty-forms"
            onClick={() => {
              setCurrentSection('announcements');
              setIsAnnouncementModalOpen(true);
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            + Broadcast Notice
          </button>
        </>
      }
    >
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="adm-toast-container">
          <div className="adm-toast">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Render Active Administrative Section */}
      {currentSection === 'notifications' && (
        <NotificationsManagement
          stats={stats}
          medicals={medicals}
          registrations={registrations}
          repeatCandidates={repeatCandidates}
          penalties={penalties}
          onNavigate={(id) => setCurrentSection(id)}
          onApproveMedical={handleApproveMedical}
          onRejectMedical={handleRejectMedical}
          onApproveRegistration={handleApproveRegistration}
          onShowToast={showToast}
        />
      )}

      {currentSection === 'dashboard' && (
        <AdminOverview
          stats={stats}
          batches={batches}
          registrations={registrations}
          medicals={medicals}
          auditLogs={auditLogs}
          onNavigate={(id) => setCurrentSection(id)}
          onApproveMedical={handleApproveMedical}
          onRejectMedical={handleRejectMedical}
          onApproveRegistration={handleApproveRegistration}
          onOpenAddStudentModal={() => {
            setCurrentSection('student_management');
            setIsAddStudentModalOpen(true);
          }}
          onOpenAnnouncementModal={() => {
            setCurrentSection('announcements');
            setIsAnnouncementModalOpen(true);
          }}
        />
      )}

      {currentSection === 'student_management' && (
        <StudentManagement
          batches={batches}
          students={students}
          onAddBatch={handleAddBatch}
          onDeleteBatch={handleDeleteBatch}
          onAddStudent={handleAddStudent}
          onUpdateStudent={handleUpdateStudent}
          onDeleteStudent={handleDeleteStudent}
          onBulkAddStudents={handleBulkAddStudents}
          onUpdateStudentStatus={handleUpdateStudentStatus}
          onPromoteBatch={handlePromoteBatch}
          onPassOutBatch={handlePassOutBatch}
          isAddModalOpen={isAddStudentModalOpen}
          setIsAddModalOpen={setIsAddStudentModalOpen}
        />
      )}

      {currentSection === 'course_allocation' && (
        <CourseAllocationManagement
          batches={batches}
          students={students}
          onPromoteBatch={handlePromoteBatch}
          onShowToast={showToast}
          onAddAuditLog={addAuditLog}
        />
      )}

      {currentSection === 'semester_registration' && (
        <RegistrationManagement
          registrations={registrations}
          onApproveRegistration={handleApproveRegistration}
          onRejectRegistration={(id) => {
            setRegistrations((prev) =>
              prev.map((r) => (r.id === id ? { ...r, status: 'Rejected' } : r))
            );
            showToast('Registration application marked as rejected.');
          }}
          onBatchApprove={handleBatchApprove}
        />
      )}

      {currentSection === 'attendance_medicals' && (
        <MedicalRequests
          medicals={medicals}
          onApproveMedical={handleApproveMedical}
          onRejectMedical={handleRejectMedical}
        />
      )}

      {currentSection === 'examinations' && (
        <ExaminationManagement
          examinations={examinations}
          repeatCandidates={repeatCandidates}
          onClearRepeatCandidate={handleClearRepeatCandidate}
        />
      )}

      {currentSection === 'results_progress' && (
        <ResultsManagement
          students={students}
          onPublishResults={handlePublishResults}
        />
      )}

      {currentSection === 'welfare_scholarships' && (
        <WelfareSocieties
          students={students}
          initialTab="welfare"
          onEndorsePermit={(socName) => {
            addAuditLog('Endorsed Society Permit', `Event Permit endorsed for ${socName}.`);
            showToast(`Event Permit endorsed for ${socName}.`);
          }}
          onAddAuditLog={addAuditLog}
          onShowToast={showToast}
        />
      )}

      {currentSection === 'societies_clubs' && (
        <WelfareSocieties
          students={students}
          initialTab="societies"
          onEndorsePermit={(socName) => {
            addAuditLog('Endorsed Society Permit', `Event Permit endorsed for ${socName}.`);
            showToast(`Event Permit endorsed for ${socName}.`);
          }}
          onAddAuditLog={addAuditLog}
          onShowToast={showToast}
        />
      )}

      {currentSection === 'announcements' && (
        <AnnouncementsManagement
          announcements={announcements}
          onAddAnnouncement={handleAddAnnouncement}
          onDeleteAnnouncement={handleDeleteAnnouncement}
          onTogglePinAnnouncement={handleTogglePinAnnouncement}
          isCreateModalOpen={isAnnouncementModalOpen}
          setIsCreateModalOpen={setIsAnnouncementModalOpen}
        />
      )}

      {currentSection === 'forms_guidance' && (
        <FormsGuidanceManagement
          facultyForms={facultyForms}
          onAddForm={handleAddForm}
        />
      )}

      {currentSection === 'penalties' && (
        <PenaltiesManagement
          penalties={penalties}
          batches={batches}
          onClearPenalty={handleClearPenalty}
          onAddPenalty={handleAddPenalty}
        />
      )}

      {currentSection === 'input_data' && (
        <InputDataManagement
          onShowToast={showToast}
          onAddAuditLog={addAuditLog}
        />
      )}

      {currentSection === 'users_roles' && (
        <UserRoleManagement
          users={users}
          onAssignRole={handleAssignRole}
          onAppointUser={handleAppointUser}
          onToggleUserStatus={handleToggleUserStatus}
        />
      )}

      {currentSection === 'settings' && (
        <SettingsManagement
          onSaveSettings={() => {
            addAuditLog('Updated Settings', 'Faculty institutional timeline and cutoffs saved.');
            showToast('System configuration settings saved.');
          }}
        />
      )}
    </DashboardTemplate>
  );
}
