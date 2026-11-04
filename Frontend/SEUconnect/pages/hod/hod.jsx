import React, { useState, useEffect } from 'react';
import DashboardTemplate from '../../components/dashbord/dashboard_template.jsx';
import ProcessTrackerModal from '../../components/workflow/ProcessTrackerModal.jsx';
import ApproveModal from '../../components/workflow/ApproveModal.jsx';
import DeclineReasonModal from '../../components/workflow/DeclineReasonModal.jsx';
import ReturnCorrectionModal from '../../components/workflow/ReturnCorrectionModal.jsx';
import api from '../../src/services/api.js';
import './hod.css';

// HOD Subcomponents
import HODDashboardOverview from './components/HODDashboardOverview.jsx';
import DepartmentOverview from './components/DepartmentOverview.jsx';
import AcademicStaffManagement from './components/AcademicStaffManagement.jsx';
import DepartmentStudents from './components/DepartmentStudents.jsx';
import CourseAllocations from './components/CourseAllocations.jsx';
import DepartmentAcademicCalendar from './components/DepartmentAcademicCalendar.jsx';
import DepartmentTimetable from './components/DepartmentTimetable.jsx';
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
  const [returnProcessModal, setReturnProcessModal] = useState(null);
  const [activeNav, setActiveNav] = useState('dashboard');

  // Official HOD Persona: M.J Ahamed Sabani
  const effectiveUser = {
    ...user,
    name: 'M.J Ahamed Sabani',
    email: user?.email || 'sabani@seu.ac.lk',
    designation: 'Head of the Department (ICT)',
    department: 'Department of Information and Communication Technology',
    faculty: 'Faculty of Technology, SEUSL',
    avatarInitial: 'AS',
    role: 'hod',
    roleKey: 'hod',
  };

  const hodName = effectiveUser.name;
  const hodDesignation = effectiveUser.designation;

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

  const handleReturn = async (payload) => {
    if (!returnProcessModal) return;
    try {
      await api.returnProcess(returnProcessModal.trackingNumber || returnProcessModal._id, payload);
    } catch (err) {
      console.warn('Failed to return process in HOD:', err);
    }
    setReturnProcessModal(null);
    await loadProcesses();
  };

  // Only show ICT department processes to HOD ICT
  const deptProcesses = (Array.isArray(processes) ? processes : []).filter((p) => {
    const dept = p.student?.department || '';
    return !dept || dept.toLowerCase().includes('information') || dept.toLowerCase().includes('ict');
  });

  const pendingHOD = deptProcesses.filter(
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
      case 'department_calendar':
        return <DepartmentAcademicCalendar onNavigate={setActiveNav} />;
      case 'department_timetable':
        return <DepartmentTimetable onNavigate={setActiveNav} />;
      case 'pending_hod_approvals':
        return (
          <DepartmentApprovalsDesk
            processes={deptProcesses}
            pendingHOD={pendingHOD}
            isLoading={isLoading}
            onOpenAudit={(p) => setSelectedProcess(p)}
            onOpenEndorse={(p) => setActionProcess(p)}
            onOpenReturn={(p) => setReturnProcessModal(p)}
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
        return <HODProfile user={effectiveUser} onNavigate={setActiveNav} />;
      case 'dashboard':
      default:
        return (
          <HODDashboardOverview
            processes={deptProcesses}
            pendingHOD={pendingHOD}
            isLoading={isLoading}
            onNavigate={setActiveNav}
            onOpenAudit={(p) => setSelectedProcess(p)}
            onOpenEndorse={(p) => setActionProcess(p)}
            onOpenReturn={(p) => setReturnProcessModal(p)}
            onOpenDecline={(p) => setDeclineProcess(p)}
          />
        );
    }
  };

  return (
    <DashboardTemplate
      user={effectiveUser}
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
            user={effectiveUser}
            onClose={() => setActionProcess(null)}
            onConfirm={handleApprove}
          />
        )}

        {returnProcessModal && (
          <ReturnCorrectionModal
            process={returnProcessModal}
            user={effectiveUser}
            onClose={() => setReturnProcessModal(null)}
            onConfirm={handleReturn}
          />
        )}

        {declineProcess && (
          <DeclineReasonModal
            process={declineProcess}
            user={effectiveUser}
            onClose={() => setDeclineProcess(null)}
            onConfirm={handleDecline}
          />
        )}
      </div>
    </DashboardTemplate>
  );
}
