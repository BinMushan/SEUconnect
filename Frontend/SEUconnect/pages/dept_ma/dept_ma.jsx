import React, { useState } from 'react';
import DashboardTemplate from '../../components/dashbord/dashboard_template.jsx';
import WorkflowDesk from '../../components/workflow/WorkflowDesk.jsx';
import NotificationCenter from '../../components/workflow/NotificationCenter.jsx';
import { ROLE_WORKFLOW_TYPES } from '../../components/workflow/workflowNav.jsx';
import {
  DEPT_INFO,
  INITIAL_STUDENTS,
  INITIAL_SUBJECTS,
  INITIAL_REGISTRATIONS,
  INITIAL_MEDICAL_APPLICATIONS,
  INITIAL_ATTENDANCE_SUBJECTS,
  INITIAL_DOCUMENTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOG,
} from './deptMaData.js';
import './dept_ma.css';

// Subcomponents
import DeptMADashboardOverview from './components/DeptMADashboardOverview.jsx';
import DeptMAStudents from './components/DeptMAStudents.jsx';
import DeptMARegistrations from './components/DeptMARegistrations.jsx';
import DeptMAAttendance from './components/DeptMAAttendance.jsx';
import DeptMADocuments from './components/DeptMADocuments.jsx';
import DeptMAReports from './components/DeptMAReports.jsx';
import DeptMAAnnouncements from './components/DeptMAAnnouncements.jsx';
import DeptMAProfile from './components/DeptMAProfile.jsx';

export default function DeptMA({ user, onLogout }) {
  // Navigation State
  const [activeNav, setActiveNav] = useState('dashboard');

  // Main Live Datasets
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [subjects] = useState(INITIAL_SUBJECTS);
  const [registrations, setRegistrations] = useState(INITIAL_REGISTRATIONS);
  const [medicalApplications, setMedicalApplications] = useState(INITIAL_MEDICAL_APPLICATIONS);
  const [attendanceSubjects] = useState(INITIAL_ATTENDANCE_SUBJECTS);
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [auditLog, setAuditLog] = useState(INITIAL_AUDIT_LOG);

  // Jump to specific medical application in verification modal
  const [selectedMedicalApp, setSelectedMedicalApp] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Effective User object for Department MA
  const effectiveUser = {
    ...user,
    name: user?.name || DEPT_INFO.assignedMA.name,
    email: user?.email || DEPT_INFO.assignedMA.email,
    role: 'dept_ma',
    roleKey: 'dept_ma',
    staffId: DEPT_INFO.assignedMA.staffId,
    designation: DEPT_INFO.assignedMA.designation,
    department: DEPT_INFO.departmentName,
    faculty: DEPT_INFO.facultyName,
    avatarInitial: DEPT_INFO.assignedMA.avatarInitial,
  };

  // Student Update Handler
  const handleUpdateStudent = (updatedStudent) => {
    setStudents((prev) =>
      prev.map((s) => (s.regNo === updatedStudent.regNo ? updatedStudent : s))
    );

    // Append to Audit Log
    const newLog = {
      id: `AUD-${Date.now()}`,
      action: 'STUDENT_RECORD_UPDATED',
      target: `${updatedStudent.regNo} (${updatedStudent.name})`,
      actor: `${effectiveUser.name} (Dept MA)`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: 'Updated student contact/emergency details and administrative notes.',
    };
    setAuditLog((prev) => [newLog, ...prev]);
  };

  // Subject Registration Update Handler
  const handleUpdateRegistration = (updatedReg) => {
    setRegistrations((prev) =>
      prev.map((r) => (r.id === updatedReg.id ? updatedReg : r))
    );

    const newLog = {
      id: `AUD-${Date.now()}`,
      action: 'REGISTRATION_STATUS_MODIFIED',
      target: `${updatedReg.id} (${updatedReg.subjectCode})`,
      actor: `${effectiveUser.name} (Dept MA)`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: `Registration status updated to ${updatedReg.status}.`,
    };
    setAuditLog((prev) => [newLog, ...prev]);
  };

  // Medical Application Update Handler (MAIN FEATURE)
  const handleUpdateMedicalApplication = (updatedApp) => {
    setMedicalApplications((prev) =>
      prev.map((m) => (m.trackingNumber === updatedApp.trackingNumber ? updatedApp : m))
    );

    // Create Audit Log
    const newLog = {
      id: `AUD-${Date.now()}`,
      action: updatedApp.status === 'Approved' ? 'MEDICAL_APPROVED' : updatedApp.status === 'Rejected' ? 'MEDICAL_REJECTED' : 'MEDICAL_STAGE_UPDATED',
      target: `${updatedApp.trackingNumber} (${updatedApp.student.name})`,
      actor: `${effectiveUser.name} (Dept MA)`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: updatedApp.decision?.remarks || updatedApp.decision?.rejectionReason || `Status shifted to ${updatedApp.status}`,
    };
    setAuditLog((prev) => [newLog, ...prev]);

    // Create Automatic Student Notification
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      title: `Medical Application Decision: ${updatedApp.status}`,
      message: `Medical excuse ${updatedApp.trackingNumber} for ${updatedApp.subject.code} was ${updatedApp.status.toLowerCase()} by Department MA.`,
      time: 'Just now',
      read: false,
      type: 'medical',
      actionNav: 'medical_applications',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Upload Document Handler
  const handleUploadDocument = (newDoc) => {
    setDocuments((prev) => [newDoc, ...prev]);
    const newLog = {
      id: `AUD-${Date.now()}`,
      action: 'DOCUMENT_ARCHIVED',
      target: `${newDoc.code} - ${newDoc.title}`,
      actor: `${effectiveUser.name} (Dept MA)`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: `Archived under category: ${newDoc.category}`,
    };
    setAuditLog((prev) => [newLog, ...prev]);
  };

  // Update Document Handler (e.g. increments download count or edits document metadata)
  const handleUpdateDocument = (updatedDoc) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d))
    );
  };

  // Add Announcement Handler
  const handleAddAnnouncement = (newAnn) => {
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  // Notification Handlers
  const handleToggleNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All department notifications marked as read.', 'info');
  };

  // Notification Click & Direct Navigation Handler
  const handleNotificationClick = (item) => {
    // 1. Automatically mark as read if currently unread
    if (!item.read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );
    }
    // 2. Resolve destination view
    const targetNav = item.actionNav || (
      item.type === 'medical' ? 'medical_applications' :
      item.type === 'registration' ? 'subject_registrations' :
      item.type === 'attendance' ? 'attendance_records' : 'dashboard'
    );
    // 3. For medical notifications, check if a specific application tracking number matches
    if (targetNav === 'medical_applications') {
      const match = medicalApplications.find((app) =>
        (item.message && item.message.includes(app.trackingNumber)) ||
        (item.targetTrackingNumber && item.targetTrackingNumber === app.trackingNumber)
      );
      if (match) {
        setSelectedMedicalApp(match);
      } else {
        setSelectedMedicalApp(null);
      }
    }
    // 4. Navigate directly to destination
    setActiveNav(targetNav);
  };

  // Direct open medical modal from dashboard
  const handleOpenMedicalModal = (app) => {
    setSelectedMedicalApp(app);
    setActiveNav('medical_applications');
  };

  // View Switcher based on activeNav
  const renderActiveView = () => {
    switch (activeNav) {
      case 'students':
        return (
          <DeptMAStudents
            students={students}
            deptInfo={DEPT_INFO}
            onUpdateStudent={handleUpdateStudent}
            onShowToast={showToast}
          />
        );

      case 'subject_registrations':
        return (
          <DeptMARegistrations
            registrations={registrations}
            subjects={subjects}
            deptInfo={DEPT_INFO}
            onUpdateRegistration={handleUpdateRegistration}
            onShowToast={showToast}
          />
        );

      case 'medical_applications':
      case 'workflow_applications':
        return (
          <WorkflowDesk
            types={ROLE_WORKFLOW_TYPES.dept_ma}
            title="Subject Medical Applications"
            subtitle="Students submit Subject Medical forms online to the Department MA. Review the application and give final approval - there is no SAR step."
          />
        );

      case 'attendance_records':
        return (
          <DeptMAAttendance
            attendanceSubjects={attendanceSubjects}
            deptInfo={DEPT_INFO}
            onShowToast={showToast}
          />
        );

      case 'department_documents':
        return (
          <DeptMADocuments
            documents={documents}
            deptInfo={DEPT_INFO}
            onUploadDocument={handleUploadDocument}
            onUpdateDocument={handleUpdateDocument}
            onShowToast={showToast}
          />
        );

      case 'reports':
        return (
          <DeptMAReports
            students={students}
            subjects={subjects}
            registrations={registrations}
            medicalApplications={medicalApplications}
            attendanceSubjects={attendanceSubjects}
            deptInfo={DEPT_INFO}
            onShowToast={showToast}
          />
        );

      case 'announcements':
        return (
          <DeptMAAnnouncements
            announcements={announcements}
            deptInfo={DEPT_INFO}
            onAddAnnouncement={handleAddAnnouncement}
            onShowToast={showToast}
          />
        );

      case 'notifications':
        return <NotificationCenter onNavigate={(nav) => setActiveNav(nav)} />;

      case 'profile':
        return <DeptMAProfile deptInfo={DEPT_INFO} user={effectiveUser} />;

      case 'dashboard':
      default:
        return (
          <DeptMADashboardOverview
            deptInfo={DEPT_INFO}
            students={students}
            subjects={subjects}
            registrations={registrations}
            medicalApplications={medicalApplications}
            attendanceSubjects={attendanceSubjects}
            notifications={notifications}
            auditLog={auditLog}
            onNavigate={(nav) => setActiveNav(nav)}
            onOpenMedicalModal={handleOpenMedicalModal}
          />
        );
    }
  };

  return (
    <DashboardTemplate
      user={effectiveUser}
      activeItem={activeNav}
      onNavigate={(id) => {
        if (id === 'logout') {
          if (typeof onLogout === 'function') onLogout();
        } else {
          setActiveNav(id);
        }
      }}
      onLogout={onLogout}
      greetingText={`Welcome, ${effectiveUser.name}`}
      facultyPillText="SOUTH EASTERN UNIVERSITY OF SRI LANKA • FACULTY OF TECHNOLOGY • DEPARTMENT OF ICT"
      metaItems={[
        { label: 'Staff ID:', value: effectiveUser.staffId },
        { label: 'Department:', value: DEPT_INFO.departmentName },
        { label: 'Designation:', value: effectiveUser.designation },
        { label: 'Desk Authority:', value: 'Subject Medical & Registration Desk' },
      ]}
      notificationCount={notifications.filter((n) => !n.read).length}
      actionButtons={
        <>
          <button
            type="button"
            className="seu-btn-gpa-report"
            onClick={() => setActiveNav('medical_applications')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Medical Queue ({medicalApplications.filter((m) => m.status === 'Pending Verification' || m.status === 'Submitted' || m.status === 'Under Review').length})
          </button>
          <button
            type="button"
            className="seu-btn-faculty-forms"
            onClick={() => setActiveNav('reports')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            Department Reports
          </button>
        </>
      }
    >
      <div className="dept-ma-portal-container">
        {/* Toast Feedback Notification Banner */}
        {toast && (
          <div
            style={{
              position: 'fixed',
              top: '20px',
              right: '24px',
              zIndex: 10000,
              padding: '0.85rem 1.4rem',
              borderRadius: '10px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.88rem',
              fontWeight: '600',
              color: '#ffffff',
              background:
                toast.type === 'success'
                  ? '#059669'
                  : toast.type === 'error'
                  ? '#dc2626'
                  : '#0284c7',
              transition: 'all 0.3s ease',
            }}
          >
            <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ️'}</span>
            <span>{toast.message}</span>
          </div>
        )}

        {/* Active View */}
        {renderActiveView()}
      </div>
    </DashboardTemplate>
  );
}

