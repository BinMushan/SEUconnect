import React from 'react';

/**
 * Common SVG Icons for Navigation Items
 */
const Icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  user: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  calendar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  clipboardCheck: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  ),
  medical: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  ),
  award: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  ),
  chart: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  trendingUp: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  book: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  gradCap: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
  shield: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  building: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </svg>
  ),
  checkSquare: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  bell: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  fileText: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  alertCircle: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  stamp: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 21h14" />
      <path d="M5 17h14" />
      <path d="M12 3v10" />
      <path d="M7 7l5-4 5 4" />
      <rect x="6" y="13" width="12" height="4" rx="1" />
    </svg>
  ),
};

// 1. STUDENT NAVIGATION
export const STUDENT_NAV_SECTIONS = [
  {
    title: 'MAIN',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
    ],
  },
  {
    title: 'ACADEMIC',
    items: [
      { id: 'academic_profile', label: 'Academic Profile', icon: Icons.user },
      { id: 'semester_registration', label: 'Semester Registration', icon: Icons.calendar },
      { id: 'attendance', label: 'Attendance', icon: Icons.clipboardCheck },
      { id: 'medical_requests', label: 'Medical Requests', icon: Icons.medical },
      { id: 'examinations', label: 'Examinations', icon: Icons.award },
      { id: 'results', label: 'Results', icon: Icons.chart },
      { id: 'gpa_cgpa', label: 'GPA / CGPA', icon: Icons.gradCap },
      { id: 'academic_progress', label: 'Academic Progress', icon: Icons.trendingUp },
    ],
  },
  {
    title: 'STUDENT SERVICES',
    items: [
      { id: 'process_guidance', label: 'Process Guidance', icon: Icons.book },
      { id: 'welfare_scholarships', label: 'Welfare & Scholarships', icon: Icons.shield },
      { id: 'societies_clubs', label: 'Societies & Clubs', icon: Icons.users },
      {
        id: 'faculty_forms',
        label: 'Faculty Forms & Instructions',
        icon: Icons.fileText,
        hasSubmenu: true,
        subItems: [
          { id: 'forms_all', label: 'All Forms & Circulars' },
          { id: 'forms_exam', label: 'Examination Forms' },
          { id: 'forms_medical', label: 'Medical & Attendance' },
          { id: 'forms_piv', label: "Finance & PIV Vouchers" },
          { id: 'forms_academic', label: 'Academic & Registration' },
        ],
      },
      { id: 'notifications', label: 'Notifications', icon: Icons.bell },
      { id: 'penalties_disciplinary', label: 'Penalties / Disciplinary', icon: Icons.alertCircle },
    ],
  },
];

// 2. LECTURER NAVIGATION
export const LECTURER_NAV_SECTIONS = [
  {
    title: 'MAIN',
    items: [
      { id: 'dashboard', label: 'Lecturer Dashboard', icon: Icons.dashboard },
    ],
  },
  {
    title: 'TEACHING & MODULES',
    items: [
      { id: 'assigned_modules', label: 'My Course Modules', icon: Icons.book },
      { id: 'attendance_roster', label: 'Attendance & Rosters', icon: Icons.clipboardCheck },
      { id: 'continuous_assessment', label: 'CA & Lab Evaluations', icon: Icons.award },
      { id: 'course_materials', label: 'Lecture Materials & LMS', icon: Icons.fileText },
    ],
  },
  {
    title: 'STUDENT PROCESSES & VERIFICATIONS',
    items: [
      { id: 'medical_verification', label: 'Student Medicals Queue', icon: Icons.medical },
      { id: 'repeat_examinations', label: 'Repeat Exam Candidacy', icon: Icons.checkSquare },
      { id: 'academic_advising', label: 'Academic Advising', icon: Icons.users },
    ],
  },
  {
    title: 'DEPARTMENTAL',
    items: [
      { id: 'department_notices', label: 'Department Board & Notices', icon: Icons.bell },
      { id: 'faculty_regulations', label: 'Examination By-Laws', icon: Icons.shield },
    ],
  },
];

// 3. HOD (HEAD OF DEPARTMENT) NAVIGATION
export const HOD_NAV_SECTIONS = [
  {
    title: 'MAIN',
    items: [
      { id: 'dashboard', label: 'HOD Command Center', icon: Icons.dashboard },
    ],
  },
  {
    title: 'DEPARTMENT GOVERNANCE',
    items: [
      { id: 'department_overview', label: 'ICT Department Overview', icon: Icons.building },
      { id: 'academic_staff', label: 'Department Academic Staff', icon: Icons.users },
      { id: 'student_roster', label: 'Department Students', icon: Icons.user },
      { id: 'course_coordination', label: 'Course Allocations', icon: Icons.book },
    ],
  },
  {
    title: 'APPROVALS & WORKFLOWS',
    items: [
      { id: 'pending_hod_approvals', label: 'Department Approvals Desk', icon: Icons.checkSquare },
      { id: 'ca_moderation', label: 'CA Marks Moderation', icon: Icons.chart },
      { id: 'repeat_sanctions', label: 'Repeat Exam Endorsements', icon: Icons.award },
      { id: 'faculty_escalations', label: 'Escalate to Faculty Dean', icon: Icons.trendingUp },
    ],
  },
  {
    title: 'ACADEMIC AUDIT & QUALITY',
    items: [
      { id: 'attendance_audit', label: '80% Attendance Audit', icon: Icons.clipboardCheck },
      { id: 'department_reports', label: 'Department Board Minutes', icon: Icons.fileText },
    ],
  },
];

// 4. DEAN (FACULTY EXECUTIVE OFFICE) NAVIGATION
export const DEAN_NAV_SECTIONS = [
  {
    title: 'MAIN',
    items: [
      { id: 'dashboard', label: "Dean's Executive Office", icon: Icons.dashboard },
    ],
  },
  {
    title: 'FACULTY GOVERNANCE',
    items: [
      { id: 'faculty_overview', label: 'Faculty of Technology View', icon: Icons.building },
      { id: 'departments', label: 'Departments (ICT, BST, ET)', icon: Icons.book },
      { id: 'faculty_board', label: 'Faculty Board & Senate', icon: Icons.shield },
      { id: 'academic_calendar', label: 'Faculty Academic Calendar', icon: Icons.calendar },
    ],
  },
  {
    title: 'EXECUTIVE SANCTIONS & APPROVALS',
    items: [
      { id: 'dean_sanctions', label: 'Faculty Approval Desk', icon: Icons.checkSquare },
      { id: 'repeat_waivers', label: 'Exam Board Clearances', icon: Icons.award },
      { id: 'special_concessions', label: 'Special Concessions', icon: Icons.medical },
      { id: 'inter_departmental', label: 'Inter-Departmental Affairs', icon: Icons.users },
    ],
  },
  {
    title: 'INSTITUTIONAL STRATEGY',
    items: [
      { id: 'faculty_analytics', label: 'Faculty Progression & KPIs', icon: Icons.trendingUp },
      { id: 'digital_seals', label: 'Official Sanctions & Seals', icon: Icons.stamp },
    ],
  },
];

// 5. EXAMINATION & MEDICAL OFFICER NAVIGATION
export const EXAMINATION_NAV_SECTIONS = [
  {
    title: 'MAIN',
    items: [
      { id: 'dashboard', label: 'Medical & Exam Desk', icon: Icons.dashboard },
    ],
  },
  {
    title: 'HEALTH CENTRE & MEDICALS',
    items: [
      { id: 'medical_verification', label: 'Medical Verification Queue', icon: Icons.medical },
      { id: 'health_registry', label: 'Health Center Registry', icon: Icons.book },
      { id: 'bylaw_compliance', label: '7-Day Deadline Compliance', icon: Icons.shield },
    ],
  },
  {
    title: 'EXAMINATION BRANCH',
    items: [
      { id: 'esa_eligibility', label: '80% ESA Exam Entry Register', icon: Icons.clipboardCheck },
      { id: 'repeat_clearance', label: 'Bank PIV Slip Clearances', icon: Icons.checkSquare },
      { id: 'exam_timetable', label: 'Exam Timetables & Venues', icon: Icons.calendar },
      { id: 'results_ledger', label: 'Senate Results & Transcripts', icon: Icons.chart },
    ],
  },
  {
    title: 'RECORDS & STAMPS',
    items: [
      { id: 'official_stamps', label: 'Verification Seals & Records', icon: Icons.stamp },
    ],
  },
];

// 6. ADMIN & SUPERADMIN NAVIGATION
export const ADMIN_NAV_SECTIONS = [
  {
    title: 'MAIN',
    items: [
      { id: 'dashboard', label: 'Admin Console', icon: Icons.dashboard },
    ],
  },
  {
    title: 'ACADEMIC ADMINISTRATION',
    items: [
      { id: 'student_management', label: 'Student Management', icon: Icons.users },
      { id: 'semester_registration', label: 'Academic Registration', icon: Icons.calendar },
      { id: 'attendance_medicals', label: 'Attendance & Medicals', icon: Icons.medical },
      { id: 'examinations', label: 'Examination Management', icon: Icons.award },
      { id: 'results_progress', label: 'Results & Progression', icon: Icons.chart },
    ],
  },
  {
    title: 'STUDENT SERVICES & WELFARE',
    items: [
      { id: 'welfare_scholarships', label: 'Welfare & Scholarships', icon: Icons.shield },
      { id: 'announcements', label: 'Announcements & Notices', icon: Icons.bell },
      { id: 'forms_guidance', label: 'Forms & Process Guidance', icon: Icons.fileText, hasSubmenu: true },
      { id: 'penalties', label: 'Penalties & Disciplinary', icon: Icons.alertCircle },
    ],
  },
  {
    title: 'SYSTEM & SECURITY',
    items: [
      { id: 'users_roles', label: 'User & Role Management', icon: Icons.user },
      { id: 'settings', label: 'System Settings & Audit', icon: Icons.settings },
    ],
  },
];

export const SUPERADMIN_NAV_SECTIONS = [
  {
    title: 'MAIN',
    items: [
      { id: 'dashboard', label: 'Root Infrastructure Console', icon: Icons.dashboard },
    ],
  },
  {
    title: 'SYSTEM MANAGEMENT',
    items: [
      { id: 'user_management', label: 'User Directory & Access', icon: Icons.users },
      { id: 'role_delegation', label: 'Institutional Appointments', icon: Icons.shield },
      { id: 'workflow_pipelines', label: 'Workflow Engine Pipelines', icon: Icons.trendingUp },
      { id: 'audit_ledger', label: 'Immutable Audit Ledger', icon: Icons.stamp },
      { id: 'system_settings', label: 'MERN Cluster & Security', icon: Icons.settings },
    ],
  },
];

/**
 * Returns role-tailored navigation items based on roleKey
 */
export function getNavSectionsForRole(roleKey) {
  const key = (roleKey || '').toLowerCase();
  switch (key) {
    case 'lecturer':
      return LECTURER_NAV_SECTIONS;
    case 'hod':
      return HOD_NAV_SECTIONS;
    case 'dean':
      return DEAN_NAV_SECTIONS;
    case 'examination':
      return EXAMINATION_NAV_SECTIONS;
    case 'admin':
      return ADMIN_NAV_SECTIONS;
    case 'superadmin':
      return SUPERADMIN_NAV_SECTIONS;
    case 'student':
    default:
      return STUDENT_NAV_SECTIONS;
  }
}

/**
 * Returns role-tailored metadata and greeting for DashboardTemplate header
 */
export function getRoleMetaData(user) {
  const roleKey = (user?.roleKey || user?.role || 'student').toLowerCase();

  switch (roleKey) {
    case 'lecturer':
      return {
        rolePill: 'LEC',
        greeting: `Welcome, ${user?.name || 'Dr. S. Kirushanth'}`,
        facultyPill: 'SOUTH EASTERN UNIVERSITY OF SRI LANKA • FACULTY OF TECHNOLOGY • ACADEMIC DESK',
        metaItems: [
          { label: 'Staff ID:', value: user?.staffId || 'STAFF-ICT-104' },
          { label: 'Department:', value: 'Department of ICT' },
          { label: 'Designation:', value: user?.designation || 'Senior Lecturer Gr. II' },
          { label: 'Courses:', value: 'ICT 3112 / ICT 3122' },
        ],
      };
    case 'hod':
      return {
        rolePill: 'HOD',
        greeting: `Welcome, ${user?.name || 'Dr. M.A. Rifky'}`,
        facultyPill: 'SOUTH EASTERN UNIVERSITY OF SRI LANKA • FACULTY OF TECHNOLOGY • HOD COMMAND',
        metaItems: [
          { label: 'Staff ID:', value: user?.staffId || 'STAFF-ICT-001' },
          { label: 'Department:', value: 'Department of ICT' },
          { label: 'Designation:', value: 'Head of Department' },
          { label: 'Authority:', value: 'Department Board Chair' },
        ],
      };
    case 'dean':
      return {
        rolePill: 'DEAN',
        greeting: `Welcome, ${user?.name || 'Prof. U.L. Abdul Majeed'}`,
        facultyPill: 'SOUTH EASTERN UNIVERSITY OF SRI LANKA • FACULTY OF TECHNOLOGY • DEAN EXECUTIVE',
        metaItems: [
          { label: 'Staff ID:', value: user?.staffId || 'STAFF-FOT-001' },
          { label: 'Office:', value: 'Faculty Executive Office' },
          { label: 'Designation:', value: 'Dean, Faculty of Technology' },
          { label: 'Authority:', value: 'Faculty Board Chair' },
        ],
      };
    case 'examination':
      return {
        rolePill: 'EXAM',
        greeting: `Welcome, ${user?.name || 'Dr. (Mrs.) R. Fathima'}`,
        facultyPill: 'SOUTH EASTERN UNIVERSITY OF SRI LANKA • FACULTY EXAMINATION & MEDICAL REGISTRY',
        metaItems: [
          { label: 'Staff ID:', value: user?.staffId || 'STAFF-EXAM-012' },
          { label: 'Division:', value: 'Examinations & Health Records' },
          { label: 'Designation:', value: 'Senior Assistant Registrar' },
          { label: 'Registry:', value: 'Official Health & ESA Ledger' },
        ],
      };
    case 'admin':
      return {
        rolePill: 'ADM',
        greeting: `Welcome, ${user?.name || 'Eng. K. Thanushan'}`,
        facultyPill: 'SOUTH EASTERN UNIVERSITY OF SRI LANKA • FACULTY OF TECHNOLOGY • ADMIN CONSOLE',
        metaItems: [
          { label: 'Staff ID:', value: user?.staffId || 'STAFF-SYS-005' },
          { label: 'Division:', value: 'Academic & IT Systems' },
          { label: 'Role:', value: 'System Administrator' },
          { label: 'Campus:', value: 'Oluvil Main Campus' },
        ],
      };
    case 'superadmin':
      return {
        rolePill: 'ROOT',
        greeting: `Welcome, ${user?.name || 'Director Information Services'}`,
        facultyPill: 'SOUTH EASTERN UNIVERSITY OF SRI LANKA • CENTRAL IT & INFRASTRUCTURE',
        metaItems: [
          { label: 'Staff ID:', value: 'STAFF-ROOT-001' },
          { label: 'Division:', value: 'Central IT Administration' },
          { label: 'Role:', value: 'Chief Information Officer' },
          { label: 'Cluster:', value: 'SEUConnect MERN Node' },
        ],
      };
    case 'student':
    default:
      return {
        rolePill: 'STU',
        greeting: `Good Morning, ${user?.name || 'M.N.M. Afnan'}`,
        facultyPill: 'SOUTH EASTERN UNIVERSITY OF SRI LANKA • FACULTY OF TECHNOLOGY',
        metaItems: [
          { label: 'Reg No:', value: user?.regNo || '22ICT085' },
          { label: 'Programme:', value: user?.programme || 'BICT (Hons)' },
          { label: 'Current:', value: user?.semester || 'Semester 05' },
          { label: 'Specialization:', value: user?.specialization || 'Software Systems' },
        ],
      };
  }
}
