import { useState, useMemo } from 'react';
import DashboardTemplate from '../../components/dashbord/dashboard_template.jsx';
import ToastStack from './components/ToastStack.jsx';

import LecturerDashboard from './LecturerDashboard.jsx';
import StudentEnrollment from './StudentEnrollment.jsx';
import MySubjects from './MySubjects.jsx';
import Timetable from './Timetable.jsx';
import Attendance from './Attendance.jsx';
import CAESA from './CAESA.jsx';
import Results from './Results.jsx';
import Announcements from './Announcements.jsx';
import Notifications from './Notifications.jsx';
import LecturerProfile from './LecturerProfile.jsx';
import MedicalVerification from './MedicalVerification.jsx';
import ECAReview from './ECAReview.jsx';

import { INITIAL_LECTURER_INFO, INITIAL_NOTIFICATIONS, INITIAL_ASSIGNED_ECA_APPLICATIONS } from './lecturerMockData.js';
import './lecturer.css';

/**
 * Sidebar Navigation Sections matching Section 2 of Specification:
 * MAIN: Dashboard
 * ACADEMIC: My Subjects, Attendance, CA / ESA, Results / Grades
 * LECTURER SERVICES: Announcements, Notifications
 */
const LECTURER_NAV_SECTIONS = [
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
        ),
      },
    ],
  },
  {
    title: 'ACADEMIC',
    items: [
      {
        id: 'enrollment',
        label: 'Student Enrollment',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
      {
        id: 'subjects',
        label: 'My Subjects',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        ),
      },
      {
        id: 'timetable',
        label: 'Timetable',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        ),
      },
      {
        id: 'attendance',
        label: 'Attendance',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <line x1="9" y1="11" x2="15" y2="11" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        ),
      },
      {
        id: 'ca-esa',
        label: 'CA / ESA',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        ),
      },
      {
        id: 'results',
        label: 'Results / Grades',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        ),
      },

    ],
  },
  {
    title: 'LECTURER SERVICES',
    items: [
      {
        id: 'announcements',
        label: 'Announcements',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 11 18-5v12L3 14v-3z" />
            <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
          </svg>
        ),
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        ),
      },
    ],
  },
];

/**
 * Top Header Chips displaying Lecturer ID, Department, and Assigned Subjects.
 */
const LECTURER_META_CHIPS = [
  { label: 'Lecturer ID:', value: 'LEC/ICT/024' },
  { label: 'Department:', value: 'Department of ICT' },
  { label: 'Assigned Subjects:', value: '3 Subjects' },
];

/**
 * Lecturer Portal
 */
export default function Lecturer({ user, onLogout }) {
  const [currentPath, setCurrentPath] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('SWT22022');

  // Lifted Notifications state synchronized with topbar badge
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Assigned ECA Applications state
  const [ecaApplications, setEcaApplications] = useState(INITIAL_ASSIGNED_ECA_APPLICATIONS);
  const pendingEcaCount = ecaApplications.filter((a) => a.status === 'Pending Lecturer Review').length;

  const handleUpdateEcaApplication = (updatedApp) => {
    setEcaApplications((prev) =>
      prev.map((app) => (app.id === updatedApp.id ? updatedApp : app))
    );
  };

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  // Selected ECA application ID for direct navigation via notification
  const [selectedEcaAppId, setSelectedEcaAppId] = useState(null);
  const [navSource, setNavSource] = useState('dashboard');

  const navigate = (targetPath) => {
    const clean = targetPath.replace(/^\//, '') || 'dashboard';
    setCurrentPath(clean);
  };

  const handleToggleNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('All notifications marked as read', 'info');
  };

  const handleMarkSingleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleNotificationNavigate = (targetRoute, params) => {
    if (params?.subjectCode) {
      setSelectedSubjectCode(params.subjectCode);
    }
    if (params?.applicationId) {
      setSelectedEcaAppId(params.applicationId);
    } else {
      setSelectedEcaAppId(null);
    }
    setNavSource('notifications');
    navigate(targetRoute);
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Convert current path to active sidebar id
  const activeNavId = (currentPath === '' || currentPath === 'dashboard')
    ? 'dashboard'
    : (currentPath === 'medical-verification'
        ? 'notifications'
        : (currentPath === 'eca-review'
            ? (navSource === 'notifications' ? 'notifications' : 'dashboard')
            : currentPath));

  const handleNavigate = (targetId) => {
    if (targetId === 'academic_profile') {
      navigate('profile');
      return;
    }
    const clean = targetId === 'dashboard' ? 'dashboard' : targetId;
    navigate(clean);
  };

  // Dynamic Module Search Bar with automated navigation
  const handleDynamicSearch = (query) => {
    if (!query) return;
    const q = query.toLowerCase().trim();

    if (q.includes('timetable') || q.includes('time-table') || q.includes('sched') || q.includes('lecture slot')) {
      navigate('timetable');
      showToast('Navigated to Teaching Timetable', 'info');
    } else if (q.includes('attend') || q.includes('roster')) {
      navigate('attendance');
      showToast('Navigated to Student Attendance System', 'info');
    } else if (q.includes('subject') || q.includes('course') || q.includes('module') || q.includes('swt')) {
      navigate('subjects');
      showToast('Navigated to My Subjects', 'info');
    } else if (q.includes('ca') || q.includes('esa') || q.includes('mark') || q.includes('eval')) {
      navigate('ca-esa');
      showToast('Navigated to CA / ESA Assessment Marks', 'info');
    } else if (q.includes('result') || q.includes('grade') || q.includes('scale')) {
      navigate('results');
      showToast('Navigated to Results & Grading', 'info');
    } else if (q.includes('announc') || q.includes('notice') || q.includes('publish') || q.includes('circ')) {
      navigate('announcements');
      showToast('Navigated to Announcements Feed', 'info');
    } else if (q.includes('eca') || q.includes('repeat exam') || q.includes('exam application') || q.includes('assigned eca')) {
      navigate('eca-review');
      showToast('Navigated to Assigned ECA Applications Review', 'info');
    } else if (q.includes('medic') || q.includes('mc') || q.includes('concession') || q.includes('doctor') || q.includes('sick')) {
      navigate('medical-verification');
      showToast('Navigated to Student Medical Approval & Verification', 'info');
    } else if (q.includes('notif') || q.includes('inbox') || q.includes('alert')) {
      navigate('notifications');
      showToast('Navigated to Notification Inbox', 'info');
    } else if (q.includes('prof') || q.includes('ident') || q.includes('password') || q.includes('contact')) {
      navigate('profile');
      showToast('Navigated to Lecturer Profile', 'info');
    } else if (q.includes('dash') || q.includes('home') || q.includes('overv')) {
      navigate('dashboard');
      showToast('Navigated to Academic Overview Dashboard', 'info');
    } else {
      showToast(`No specific module matching "${query}". Showing dashboard.`, 'info');
    }
  };

  // Quick Action Buttons matching Section 2
  const lecturerHeroActions = (
    <>
      <button
        type="button"
        className="seu-btn-attendance"
        onClick={() => {
          navigate('attendance');
          showToast('Navigating to Mark Attendance', 'info');
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="m9 14 2 2 4-4" />
        </svg>
        Mark Attendance
      </button>

      <button
        type="button"
        className="seu-btn-create-announcement"
        onClick={() => {
          navigate('announcements');
          showToast('Navigating to Create Announcement', 'info');
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        Create Announcement
      </button>
    </>
  );

  const renderModuleContent = () => {
    switch (currentPath) {
      case 'enrollment':
        return (
          <StudentEnrollment
            initialSubjectCode={selectedSubjectCode}
            onShowToast={showToast}
          />
        );
      case 'subjects':
        return (
          <MySubjects
            onNavigateModule={(modId, params) => {
              if (params?.subjectCode) {
                setSelectedSubjectCode(params.subjectCode);
              }
              navigate(modId);
            }}
            onShowToast={showToast}
          />
        );
      case 'timetable':
        return (
          <Timetable
            onNavigateModule={(modId, params) => {
              if (params?.subjectCode) {
                setSelectedSubjectCode(params.subjectCode);
              }
              navigate(modId);
            }}
            onShowToast={showToast}
          />
        );
      case 'attendance':
        return (
          <Attendance
            initialSubjectCode={selectedSubjectCode}
            onShowToast={showToast}
          />
        );
      case 'ca-esa':
        return (
          <CAESA
            initialSubjectCode={selectedSubjectCode}
            onShowToast={showToast}
          />
        );
      case 'results':
        return (
          <Results
            initialSubjectCode={selectedSubjectCode}
            onShowToast={showToast}
          />
        );
      case 'announcements':
        return <Announcements onShowToast={showToast} />;
      case 'notifications':
        return (
          <Notifications
            notifications={notifications}
            onToggleRead={handleToggleNotificationRead}
            onMarkSingleRead={handleMarkSingleRead}
            onMarkAllAsRead={handleMarkAllNotificationsRead}
            onNavigateNotification={handleNotificationNavigate}
            onShowToast={showToast}
          />
        );
      case 'eca-review':
        return (
          <ECAReview
            applications={ecaApplications}
            initialApplicationId={selectedEcaAppId}
            onUpdateApplication={handleUpdateEcaApplication}
            onShowToast={showToast}
            onNavigateBack={() => {
              setSelectedEcaAppId(null);
              navigate(navSource === 'notifications' ? 'notifications' : 'dashboard');
            }}
          />
        );
      case 'medical-verification':
        return (
          <MedicalVerification
            onShowToast={showToast}
            onNavigateBack={() => navigate('notifications')}
          />
        );
      case 'profile':
        return <LecturerProfile onShowToast={showToast} />;
      case 'dashboard':
      default:
        return (
          <LecturerDashboard
            user={user}
            assignedEcaCount={pendingEcaCount}
            ecaApplications={ecaApplications}
            onNavigateModule={(modId, params) => {
              if (params?.subjectCode) {
                setSelectedSubjectCode(params.subjectCode);
              }
              if (modId === 'eca-review') {
                setSelectedEcaAppId(null);
                setNavSource('dashboard');
              }
              navigate(modId);
            }}
            onShowToast={showToast}
          />
        );
    }
  };

  return (
    <div className="lecturer-module-root">
      {/* Global Toast Stack */}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <DashboardTemplate
        user={{
          name: INITIAL_LECTURER_INFO.fullName,
          avatarInitial: INITIAL_LECTURER_INFO.avatarInitial,
          email: INITIAL_LECTURER_INFO.email,
          role: 'LECTURER',
          department: INITIAL_LECTURER_INFO.department,
          faculty: INITIAL_LECTURER_INFO.faculty,
          ...user,
        }}
        onLogout={onLogout}
        activeItem={activeNavId}
        onNavigate={handleNavigate}
        className="lecturer-portal"
        facultyPillText="SOUTH EASTERN UNIVERSITY OF SRI LANKA • FACULTY OF TECHNOLOGY"
        greetingText={`Good Morning, ${INITIAL_LECTURER_INFO.fullName}`}
        metaItems={LECTURER_META_CHIPS}
        navSections={LECTURER_NAV_SECTIONS}
        actionButtons={lecturerHeroActions}
        notificationCount={unreadNotifCount}
        searchPlaceholder="Quick search modules (e.g. 'Attendance', 'CA', 'Results', 'Announcements')..."
        onSearch={handleDynamicSearch}
      >
        {renderModuleContent()}
      </DashboardTemplate>
    </div>
  );
}
