import React, { useState, useEffect } from 'react';
import DashboardTemplate from '../../components/dashbord/dashboard_template.jsx';
import ProcessTrackerModal from '../../components/workflow/ProcessTrackerModal.jsx';
import ApproveModal from '../../components/workflow/ApproveModal.jsx';
import DeclineReasonModal from '../../components/workflow/DeclineReasonModal.jsx';
import api from '../../src/services/api.js';
import './hod.css';

// HOD Subcomponents
import HODDashboardOverview from './components/HODDashboardOverview.jsx';
import DepartmentOverview from './components/DepartmentOverview.jsx';
import AcademicStaffManagement from './components/AcademicStaffManagement.jsx';
import DepartmentStudents from './components/DepartmentStudents.jsx';
import CourseAllocations from './components/CourseAllocations.jsx';
import DepartmentApprovalsDesk from './components/DepartmentApprovalsDesk.jsx';
import CAMarksModeration from './components/CAMarksModeration.jsx';
import RepeatExamEndorsements from './components/RepeatExamEndorsements.jsx';
import FacultyDeanEscalations from './components/FacultyDeanEscalations.jsx';
import AttendanceAudit from './components/AttendanceAudit.jsx';
import DepartmentBoardMinutes from './components/DepartmentBoardMinutes.jsx';
import HODProfile from './components/HODProfile.jsx';

export default function HOD({ user, onLogout }) {
  const [processes, setProcesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [actionProcess, setActionProcess] = useState(null);
  const [declineProcess, setDeclineProcess] = useState(null);
  const [activeNav, setActiveNav] = useState('dashboard');

  const hodName = user?.name || 'Dr. M.A. Rifky';
  const hodDesignation = user?.designation || 'Head of the Department (ICT)';

  const loadProcesses = async () => {
    try {
      setIsLoading(true);
      const res = await api.getProcesses();
      if (res.data) {
        setProcesses(res.data);
      }
    } catch (err) {
      console.warn('Failed to load processes in HOD:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProcesses();
  }, []);

  const handleApprove = async (payload) => {
    if (!actionProcess) return;
    try {
      await api.approveStage(actionProcess.trackingNumber || actionProcess._id, payload);
    } catch (err) {
      console.warn('Failed to approve stage:', err);
    }
    setActionProcess(null);
    await loadProcesses();
  };

  const handleDecline = async (payload) => {
    if (!declineProcess) return;
    try {
      await api.declineProcess(declineProcess.trackingNumber || declineProcess._id, payload);
    } catch (err) {
      console.warn('Failed to decline process:', err);
    }
    setDeclineProcess(null);
    await loadProcesses();
  };

  const pendingHOD = processes.filter(
    (p) =>
      (p.currentAssignedRole === 'hod' || p.status === 'Pending HOD') &&
      p.status !== 'Approved' &&
      p.status !== 'Declined'
  );

  const renderActiveView = () => {
    switch (activeNav) {
      case 'department_overview':
        return <DepartmentOverview onNavigate={setActiveNav} />;
      case 'academic_staff':
        return <AcademicStaffManagement onNavigate={setActiveNav} />;
      case 'student_roster':
        return <DepartmentStudents onNavigate={setActiveNav} />;
      case 'course_coordination':
        return <CourseAllocations onNavigate={setActiveNav} />;
      case 'pending_hod_approvals':
        return (
          <DepartmentApprovalsDesk
            processes={processes}
            pendingHOD={pendingHOD}
            isLoading={isLoading}
            onOpenAudit={(p) => setSelectedProcess(p)}
            onOpenEndorse={(p) => setActionProcess(p)}
            onOpenDecline={(p) => setDeclineProcess(p)}
          />
        );
      case 'ca_moderation':
        return <CAMarksModeration onNavigate={setActiveNav} />;
      case 'repeat_sanctions':
        return <RepeatExamEndorsements onNavigate={setActiveNav} />;
      case 'faculty_escalations':
        return <FacultyDeanEscalations onNavigate={setActiveNav} />;
      case 'attendance_audit':
        return <AttendanceAudit onNavigate={setActiveNav} />;
      case 'department_reports':
        return <DepartmentBoardMinutes onNavigate={setActiveNav} />;
      case 'academic_profile':
        return <HODProfile user={user} onNavigate={setActiveNav} />;
      case 'dashboard':
      default:
        return (
          <HODDashboardOverview
            processes={processes}
            pendingHOD={pendingHOD}
            isLoading={isLoading}
            onNavigate={setActiveNav}
            onOpenAudit={(p) => setSelectedProcess(p)}
            onOpenEndorse={(p) => setActionProcess(p)}
            onOpenDecline={(p) => setDeclineProcess(p)}
          />
        );
    }
  };

  return (
    <DashboardTemplate
      user={user}
      onLogout={onLogout}
      activeItem={activeNav}
      onNavigate={(id) => setActiveNav(id)}
    >
      <div className="hod-portal-container">
        {renderActiveView()}

        {/* Global Lifecycle Workflow Modals */}
        {selectedProcess && (
          <ProcessTrackerModal
            process={selectedProcess}
            currentUserRole="hod"
            onClose={() => setSelectedProcess(null)}
          />
        )}

        {actionProcess && (
          <ApproveModal
            process={actionProcess}
            user={{ ...user, name: hodName, designation: hodDesignation, role: 'hod' }}
            onClose={() => setActionProcess(null)}
            onConfirm={handleApprove}
          />
        )}

        {declineProcess && (
          <DeclineReasonModal
            process={declineProcess}
            user={{ ...user, name: hodName, designation: hodDesignation, role: 'hod' }}
            onClose={() => setDeclineProcess(null)}
            onConfirm={handleDecline}
          />
        )}
      </div>
    </DashboardTemplate>
  );
}
