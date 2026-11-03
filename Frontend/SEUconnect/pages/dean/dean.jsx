import React, { useState, useEffect } from 'react';
import DashboardTemplate from '../../components/dashbord/dashboard_template.jsx';
import ProcessTrackerModal from '../../components/workflow/ProcessTrackerModal.jsx';
import ApproveModal from '../../components/workflow/ApproveModal.jsx';
import DeclineReasonModal from '../../components/workflow/DeclineReasonModal.jsx';
import ReturnCorrectionModal from '../../components/workflow/ReturnCorrectionModal.jsx';
import api from '../../src/services/api.js';
import './dean.css';

// Dean Subcomponents
import DeanExecutiveOverview from './components/DeanExecutiveOverview.jsx';
import FacultyOverview from './components/FacultyOverview.jsx';
import FacultyDepartments from './components/FacultyDepartments.jsx';
import FacultyBoardSenate from './components/FacultyBoardSenate.jsx';
import FacultyAcademicCalendar from './components/FacultyAcademicCalendar.jsx';
import FacultyApprovalDesk from './components/FacultyApprovalDesk.jsx';
import ExamBoardClearances from './components/ExamBoardClearances.jsx';
import SpecialConcessions from './components/SpecialConcessions.jsx';
import InterDepartmentalAffairs from './components/InterDepartmentalAffairs.jsx';
import FacultyProgressionKPIs from './components/FacultyProgressionKPIs.jsx';
import OfficialSanctionsSeals from './components/OfficialSanctionsSeals.jsx';
import DeanProfile from './components/DeanProfile.jsx';

export default function Dean({ user, onLogout }) {
  const [processes, setProcesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [actionProcess, setActionProcess] = useState(null);
  const [declineProcess, setDeclineProcess] = useState(null);
  const [returnProcessModal, setReturnProcessModal] = useState(null);
  const [activeNav, setActiveNav] = useState('dashboard');

  // Official Dean Persona: Prof. Rifai Kariapper
  const effectiveUser = {
    ...user,
    name: 'Prof. Rifai Kariapper',
    email: user?.email || 'dean@seu.ac.lk',
    designation: 'Dean, Faculty of Technology',
    faculty: 'Faculty of Technology, SEUSL',
    avatarInitial: 'RK',
    role: 'dean',
    roleKey: 'dean',
  };

  const loadProcesses = async () => {
    try {
      setIsLoading(true);
      const res = await api.getProcesses();
      if (res.data) {
        setProcesses(res.data);
      }
    } catch (err) {
      console.warn('Failed to load processes in Dean:', err);
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
      console.warn('Failed to approve stage in Dean:', err);
    }
    setActionProcess(null);
    await loadProcesses();
  };

  const handleDecline = async (payload) => {
    if (!declineProcess) return;
    try {
      await api.declineProcess(declineProcess.trackingNumber || declineProcess._id, payload);
    } catch (err) {
      console.warn('Failed to decline process in Dean:', err);
    }
    setDeclineProcess(null);
    await loadProcesses();
  };

  const handleReturn = async (payload) => {
    if (!returnProcessModal) return;
    try {
      await api.returnProcess(returnProcessModal.trackingNumber || returnProcessModal._id, payload);
    } catch (err) {
      console.warn('Failed to return process in Dean:', err);
    }
    setReturnProcessModal(null);
    await loadProcesses();
  };

  const pendingDean = processes.filter(
    (p) =>
      (p.currentAssignedRole === 'dean' || p.status === 'Pending Dean') &&
      p.status !== 'Approved' &&
      p.status !== 'Declined'
  );

  const renderActiveView = () => {
    switch (activeNav) {
      case 'faculty_overview':
        return <FacultyOverview onNavigate={setActiveNav} />;
      case 'departments':
        return <FacultyDepartments onNavigate={setActiveNav} />;
      case 'faculty_board':
        return <FacultyBoardSenate onNavigate={setActiveNav} />;
      case 'academic_calendar':
        return <FacultyAcademicCalendar onNavigate={setActiveNav} />;
      case 'dean_sanctions':
        return (
          <FacultyApprovalDesk
            processes={processes}
            pendingDean={pendingDean}
            isLoading={isLoading}
            onOpenAudit={(p) => setSelectedProcess(p)}
            onOpenApprove={(p) => setActionProcess(p)}
            onOpenReturn={(p) => setReturnProcessModal(p)}
            onOpenDecline={(p) => setDeclineProcess(p)}
          />
        );
      case 'repeat_waivers':
        return <ExamBoardClearances onNavigate={setActiveNav} />;
      case 'special_concessions':
        return <SpecialConcessions onNavigate={setActiveNav} />;
      case 'inter_departmental':
        return <InterDepartmentalAffairs onNavigate={setActiveNav} />;
      case 'faculty_analytics':
        return <FacultyProgressionKPIs onNavigate={setActiveNav} />;
      case 'digital_seals':
        return <OfficialSanctionsSeals onNavigate={setActiveNav} />;
      case 'academic_profile':
        return <DeanProfile user={effectiveUser} onNavigate={setActiveNav} />;
      case 'dashboard':
      default:
        return (
          <DeanExecutiveOverview
            processes={processes}
            pendingDean={pendingDean}
            isLoading={isLoading}
            onNavigate={setActiveNav}
            onOpenAudit={(p) => setSelectedProcess(p)}
            onOpenApprove={(p) => setActionProcess(p)}
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
      <div className="dean-portal-container">
        {renderActiveView()}

        {/* Global Lifecycle Workflow Modals */}
        {selectedProcess && (
          <ProcessTrackerModal
            process={selectedProcess}
            currentUserRole="dean"
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
