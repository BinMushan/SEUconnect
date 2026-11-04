import React, { useState } from 'react';
import './fma.css';
import DashboardTemplate from '../../components/dashbord/dashboard_template.jsx';
import FMA_Overview from './FMA_Overview.jsx';
import Subject_Registration from './Subject_Registration.jsx';
import RecordBook_Renewal from './RecordBook_Renewal.jsx';
import Student_Leave from './Student_Leave.jsx';
import Training_Logistics from './Training_Logistics.jsx';
import Specialization_Streaming from './Specialization_Streaming.jsx';
import Certificates_Clearance from './Certificates_Clearance.jsx';

// Navigation sections corresponding to Handbook workflows
const FMA_NAV_SECTIONS = [
  {
    title: 'MAIN',
    items: [
      {
        id: 'overview',
        label: 'Overview & Front Desk',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        )
      }
    ]
  },
  {
    title: 'STUDENT REGISTRATION & ENROLMENT',
    items: [
      {
        id: 'subject_reg',
        label: 'Subject Registration (§7.2)',
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
        id: 'record_renewal',
        label: 'Record Books & PIVs (§7.5-6)',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="9" cy="10" r="2" />
            <line x1="15" y1="8" x2="17" y2="8" />
            <line x1="15" y1="12" x2="17" y2="12" />
          </svg>
        )
      },
      {
        id: 'student_leave',
        label: 'Academic Leave & Medicals (§7.4)',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        )
      }
    ]
  },
  {
    title: 'ACADEMIC SERVICES & LOGISTICS',
    items: [
      {
        id: 'training',
        label: 'Industrial Training Diaries (§3.8)',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        )
      },
      {
        id: 'streaming',
        label: 'Specialization Streaming (§3.9)',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        )
      },
      {
        id: 'clearance',
        label: 'Letters & Clearance (§7.8)',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        )
      }
    ]
  }
];

export default function FMA({ user, onLogout }) {
  const [activePage, setActivePage] = useState('overview');

  const fmaUser = user || {
    name: 'Mr. MMM. Kamil',
    email: 'fma@gmail.com',
    role: 'fma',
    roleKey: 'fma',
    staffId: 'STAFF-FMA-002',
    department: 'Office of the Dean',
    faculty: 'Faculty of Technology',
    designation: 'Management Assistant Gr. I',
    avatarInitial: 'MK'
  };

  const overviewStats = {
    pendingSubjectReg: 3,
    pendingRecordBooks: 2,
    pendingLeave: 4,
    pendingClearance: 1
  };

  const renderActiveModule = () => {
    switch (activePage) {
      case 'subject_reg':
        return <Subject_Registration />;
      case 'record_renewal':
        return <RecordBook_Renewal />;
      case 'student_leave':
        return <Student_Leave />;
      case 'training':
        return <Training_Logistics />;
      case 'streaming':
        return <Specialization_Streaming />;
      case 'clearance':
        return <Certificates_Clearance />;
      case 'overview':
      default:
        return (
          <FMA_Overview
            stats={overviewStats}
            onNavigate={setActivePage}
          />
        );
    }
  };

  return (
    <DashboardTemplate
      user={fmaUser}
      onLogout={onLogout}
      activeItem={activePage}
      onNavigate={setActivePage}
      navSections={FMA_NAV_SECTIONS}
      greetingText="Good Morning, Management Assistant"
      notificationCount={4}
      searchPlaceholder="Search student reg no, course codes, bank PIV vouchers..."
      metaItems={[
        { label: 'Office:', value: 'Dean’s Office' },
        { label: 'Faculty:', value: 'Technology' },
        { label: 'Role:', value: 'Management Assistant Gr. I' }
      ]}
      actionButtons={
        <>
          <button
            type="button"
            className="seu-btn-gpa-report"
            onClick={() => setActivePage('subject_reg')}
          >
            Subject Forms
          </button>
          <button
            type="button"
            className="seu-btn-faculty-forms"
            onClick={() => setActivePage('record_renewal')}
          >
            Verify PIV Slips
          </button>
        </>
      }
    >
      {renderActiveModule()}
    </DashboardTemplate>
  );
}

