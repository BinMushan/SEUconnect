import React, { useState, useEffect } from 'react';
import DashboardTemplate from '../../components/dashbord/dashboard_template.jsx';
import AcademicProfile from './academic_profile.jsx';
import SemesterRegistration from './semester_registration.jsx';
import Attendance from './attendance.jsx';
import MedicalRequests from './medical_requests.jsx';
import StudentExamination from './examination.jsx';
import StudentResults from './results.jsx';
import StudentGpaCgpa from './gpa_cgpa.jsx';
import StudentAcademicProgress from './academic_progress.jsx';
import StudentProcessGuidance from './process_guidance.jsx';
import StudentWelfare from './welfare_scholarships.jsx';
import StudentSocieties from './societies_clubs.jsx';
import FacultyForms from './faculty_forms.jsx';
import StudentNotifications from './notifications.jsx';
import StudentPenalties from './penalties_disciplinary.jsx';
import './student.css';

export default function Student({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = (window.location.hash.replace('#', '') || window.location.pathname).toLowerCase();
      if (hash.includes('notification')) return 'notifications';
      if (hash.includes('penalt') || hash.includes('disciplin')) return 'penalties_disciplinary';
      if (hash.includes('dashboard') || hash === 'student' || hash === '/student' || hash === '') return 'dashboard'; else if (hash.includes('form') || hash.includes('circular') || hash.includes('voucher') || hash.includes('piv')) {
        if (hash.includes('exam')) return 'forms_exam';
        if (hash.includes('med')) return 'forms_medical';
        if (hash.includes('piv') || hash.includes('voucher') || hash.includes('bank') || hash.includes('finance')) return 'forms_piv';
        if (hash.includes('acad') || hash.includes('reg_form')) return 'forms_academic';
        return 'forms_all';
      }
      if (hash.includes('welfare') || hash.includes('scholarship')) return 'welfare_scholarships';
      if (hash.includes('societ') || hash.includes('club')) return 'societies_clubs';
      if (hash.includes('process') || hash.includes('guidance')) return 'process_guidance';
      if (hash.includes('examination')) return 'examinations';
      if (hash.includes('result')) return 'results';
      if (hash.includes('progress')) return 'academic_progress';
      if (hash.includes('gpa') || hash.includes('cgpa')) return 'gpa_cgpa';
      if (hash.includes('medical')) return 'medical_requests';
      if (hash.includes('attendance')) return 'attendance';
      if (hash.includes('registration')) return 'semester_registration';
      if (hash.includes('profile')) return 'academic_profile';
    }
    return 'attendance';
  });

  // Listen for hash changes to sync navigation
  useEffect(() => {
    const handleHashSync = () => {
      const hash = (window.location.hash.replace('#', '') || window.location.pathname).toLowerCase();
      if (hash.includes('notification')) {
        setActiveTab('notifications');
      } else if (hash.includes('penalt') || hash.includes('disciplin')) {
        setActiveTab('penalties_disciplinary');
      } else if (hash.includes('dashboard') || hash === 'student' || hash === '/student' || hash === '') {
        setActiveTab('dashboard');
      } else if (hash.includes('form') || hash.includes('circular') || hash.includes('voucher') || hash.includes('piv')) {
        if (hash.includes('exam')) setActiveTab('forms_exam');
        else if (hash.includes('med')) setActiveTab('forms_medical');
        else if (hash.includes('piv') || hash.includes('voucher') || hash.includes('bank') || hash.includes('finance')) setActiveTab('forms_piv');
        else if (hash.includes('acad') || hash.includes('reg_form')) setActiveTab('forms_academic');
        else setActiveTab('forms_all');
      } else if (hash.includes('welfare') || hash.includes('scholarship')) {
        setActiveTab('welfare_scholarships');
      } else if (hash.includes('societ') || hash.includes('club')) {
        setActiveTab('societies_clubs');
      } else if (hash.includes('process') || hash.includes('guidance')) {
        setActiveTab('process_guidance');
      } else if (hash.includes('examination')) {
        setActiveTab('examinations');
      } else if (hash.includes('result')) {
        setActiveTab('results');
      } else if (hash.includes('progress')) {
        setActiveTab('academic_progress');
      } else if (hash.includes('gpa') || hash.includes('cgpa')) {
        setActiveTab('gpa_cgpa');
      } else if (hash.includes('medical')) {
        setActiveTab('medical_requests');
      } else if (hash.includes('attendance')) {
        setActiveTab('attendance');
      } else if (hash.includes('registration')) {
        setActiveTab('semester_registration');
      } else if (hash.includes('profile')) {
        setActiveTab('academic_profile');
      }
    };

    window.addEventListener('hashchange', handleHashSync);
    return () => window.removeEventListener('hashchange', handleHashSync);
  }, []);
    // Scroll to top whenever active tab changes & disable browser auto-scroll
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
    }
  }, [activeTab]);
  const [studentUser, setStudentUser] = useState(user);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemesterIdx, setSelectedSemesterIdx] = useState(0); // Default to Semester 5 (current)

  const progressionData = [
    { semester: 'Sem 1', fullLabel: 'Semester 1', sgpa: 3.82, delta: '+0.32', credits: 16, standing: 'First Class Standing', x: 80, y: 51.2, isFirstClass: true },
    { semester: 'Sem 2', fullLabel: 'Semester 2', sgpa: 3.65, delta: '-0.17', credits: 18, standing: 'Second Class (Upper)', x: 185, y: 66.5, isFirstClass: false },
    { semester: 'Sem 3', fullLabel: 'Semester 3', sgpa: 3.64, delta: '-0.01', credits: 16, standing: 'Second Class (Upper)', x: 290, y: 67.4, isFirstClass: false },
    { semester: 'Sem 4', fullLabel: 'Semester 4', sgpa: 3.50, delta: '-0.14', credits: 14, standing: 'Second Class (Upper)', x: 395, y: 80.0, isFirstClass: false },
    { semester: 'Sem 5', fullLabel: 'Semester 5 (Current)', sgpa: 3.50, delta: '±0.00', credits: 14, standing: 'Second Class (Upper)', x: 500, y: 80.0, isCurrent: true, isFirstClass: false },
  ];

  const suggestedChips = [
    'CA Repeat Form',
    'Medical Excuse for Lectures',
    "People's Bank PIV Voucher",
    'Add / Drop Modules'
  ];

  const quickActions = [  
    { 
      label: 'Register Subjects',
      actionId: 'semester_registration',
      colorTheme: 'purple',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      label: 'Check Attendance',
      actionId: 'attendance',
      colorTheme: 'blue',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
          <path d="m9 16 2 2 4-4"/>
        </svg>
      )
    },
    {
      label: 'Exam Registration',
      actionId: 'examinations',
      colorTheme: 'violet',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="6"/>
          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
        </svg>
      )
    },
    {
      label: 'View Results',
      actionId: 'results',
      colorTheme: 'indigo',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      )
    },
    {
      label: 'Submit Medical Request',
      actionId: 'medical_requests',
      colorTheme: 'teal',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      )
    },
    {
      label: 'Calculate GPA Report',
      actionId: 'gpa_cgpa',
      colorTheme: 'purple',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2"/>
          <line x1="8" y1="6" x2="16" y2="6"/>
          <line x1="16" y1="14" x2="16" y2="18"/>
          <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01"/>
        </svg>
      )
    },
    {
      label: 'Degree Progress',
      actionId: 'academic_progress',
      colorTheme: 'green',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <line x1="7" y1="17" x2="17" y2="7"/>
          <polyline points="7 7 17 7 17 17"/>
        </svg>
      )
    },
    {
      label: 'Find a Faculty Form',
      actionId: 'forms_all',
      colorTheme: 'purple',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      )
    }
  ];

  const deadlines = [
    {
      id: 'reg',
      category: 'Registration',
      categoryType: 'registration',
      status: 'Open • 4 Days Left',
      statusType: 'urgent',
      title: 'Semester Subject Registration (Add/Drop)',
      description: 'Department coordinator sign-off for elective additions and credit adjustments.',
      deadline: 'Deadline: 2026-11-15',
      countdown: '4 days remaining',
      actionId: 'semester_registration',
      actionText: 'Register Subjects'
    },
    {
      id: 'exam',
      category: 'Examination',
      categoryType: 'exam',
      status: 'Upcoming',
      statusType: 'upcoming',
      title: 'ESA Examination Entry Submission',
      description: 'Final examination registration, repeat candidate endorsements, and bank voucher clearance.',
      deadline: 'Deadline: 2026-11-30',
      countdown: '19 days remaining',
      actionId: 'examinations',
      actionText: 'Exam Registration'
    },
    {
      id: 'medical',
      category: 'Medical',
      categoryType: 'medical',
      status: 'Active Policy',
      statusType: 'policy',
      title: 'Medical Certificate Submission Deadline',
      description: 'Submit government/UMO certified form within 7 days of absence for ESA concessions.',
      deadline: 'Deadline: Within 7 days of absence',
      countdown: 'Strict Institutional Rule',
      actionId: 'medical_requests',
      actionText: 'Submit Medical'
    },
    {
      id: 'welfare',
      category: 'Welfare',
      categoryType: 'welfare',
      status: 'Open',
      statusType: 'open',
      title: 'Mahapola / Bursary Welfare Renewal',
      description: 'Submit welfare declaration with 80% monthly attendance certification.',
      deadline: 'Deadline: 2026-12-10',
      countdown: '29 days remaining',
      actionId: 'welfare_scholarships',
      actionText: 'Renew Welfare'
    }
  ];

  return (
    <DashboardTemplate
      user={studentUser || user}
      onLogout={onLogout}
      activeItem={
        activeTab === 'examination' ? 'examinations' :
        activeTab === 'processes' ? 'process_guidance' :
        activeTab === 'welfare' ? 'welfare_scholarships' :
        activeTab === 'societies' ? 'societies_clubs' :
        activeTab === 'penalties' ? 'penalties_disciplinary' :
        activeTab
      }
      onNavigate={(id) => {
        setActiveTab(id);
        if (typeof window !== 'undefined') {
          window.location.hash = `#student/${id}`;
        }
      }}
    >
      {activeTab === 'academic_profile' ? (
        <AcademicProfile
          user={studentUser || user}
          onProfileUpdate={(updated) => setStudentUser(updated)}
        />
      ) : activeTab === 'semester_registration' ? (
        <SemesterRegistration
          user={studentUser || user}
        />
      ) : activeTab === 'attendance' ? (
        <Attendance
          onNavigateMedical={() => {
            setActiveTab('medical_requests');
            if (typeof window !== 'undefined') {
              window.location.hash = '#student/medical_requests';
            }
          }}
        />
      ) : activeTab === 'medical_requests' ? (
        <MedicalRequests
          user={studentUser || user}
        />
      ) : activeTab === 'examinations' || activeTab === 'examination' ? (
        <StudentExamination
          user={studentUser || user}
        />
      ) : activeTab === 'results' || activeTab === 'result' ? (
        <StudentResults
          user={studentUser || user}
        />
      ) : activeTab === 'gpa_cgpa' || activeTab === 'gpa' ? (
        <StudentGpaCgpa
          user={studentUser || user}
        />
      ) : activeTab === 'academic_progress' || activeTab === 'progress' ? (
        <StudentAcademicProgress
          user={studentUser || user}
        />
      ) : activeTab === 'process_guidance' || activeTab === 'processes' ? (
        <StudentProcessGuidance
          user={studentUser || user}
          onNavigate={(id) => {
            setActiveTab(id);
            if (typeof window !== 'undefined') {
              window.location.hash = `#student/${id}`;
            }
          }}
        />
      ) : activeTab === 'welfare_scholarships' || activeTab === 'welfare' ? (
        <StudentWelfare
          user={studentUser || user}
        />
      ) : activeTab === 'societies_clubs' || activeTab === 'societies' ? (
        <StudentSocieties
          user={studentUser || user}
        />
      ) : activeTab === 'faculty_forms' || activeTab === 'forms_all' || activeTab === 'forms_exam' || activeTab === 'forms_medical' || activeTab === 'forms_piv' || activeTab.startsWith('forms') ? (
        <FacultyForms
          user={studentUser || user}
          activeSubTab={activeTab}
          onNavigate={(id) => {
            setActiveTab(id);
            if (typeof window !== 'undefined') {
              window.location.hash = `#student/${id}`;
            }
          }}
        />
      ) : activeTab === 'notifications' ? (
        <StudentNotifications
          user={studentUser || user}
          onNavigate={(id) => {
            setActiveTab(id);
            if (typeof window !== 'undefined') {
              window.location.hash = `#student/${id}`;
            }
          }}
        />
      ) : activeTab === 'penalties_disciplinary' || activeTab === 'penalties' ? (
        <StudentPenalties
          user={studentUser || user}
        />
      ) : (
        <div className="std-dashboard-container">
        
        {/* =========================================================
            1. TOP 4 METRIC STAT CARDS
            ========================================================= */}
        <section className="std-stats-grid">
          {/* Card 1: Current SGPA */}
          <div className="std-stat-card">
            <div className="std-stat-icon-wrap icon-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title">CURRENT SGPA</span>
                <span className="std-stat-badge">Sem 5</span>
              </div>
              <div className="std-stat-number">3.50</div>
              <div className="std-stat-target">Target: First Class (≥ 3.70)</div>
            </div>
          </div>
          
          {/* Card 2: Current CGPA */}
          <div className="std-stat-card">
            <div className="std-stat-icon-wrap icon-amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="6"/>
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title">CURRENT CGPA</span>
                <span className="std-stat-badge">Cumulative</span>
              </div>
              <div className="std-stat-number">3.58</div>
              <div className="std-stat-target">Second Class (Upper Division)</div>
            </div>
          </div>

          {/* Card 3: Attendance Standing */}
          <div className="std-stat-card">
            <div className="std-stat-icon-wrap icon-emerald">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                <path d="m9 14 2 2 4-4"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title">ATTENDANCE STANDING</span>
                <span className="std-stat-badge">Eligible</span>
              </div>
              <div className="std-stat-number">87%</div>
              <div className="std-stat-target">ESA Minimum: 80%</div>
            </div>
          </div>

          {/* Card 4: Registered Credits */}
          <div className="std-stat-card">
            <div className="std-stat-icon-wrap icon-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="std-stat-body">
              <div className="std-stat-top-row">
                <span className="std-stat-title">REGISTERED CREDITS</span>
                <span className="std-stat-badge">Semester Load</span>
              </div>
              <div className="std-stat-number">18 / 22</div>
              <div className="std-stat-target">4 credits remaining</div>
            </div>
          </div>
        </section>

        {/* =========================================================
            2. "WHAT DO YOU NEED TO DO?" GUIDANCE CARD
            ========================================================= */}
        <section className="std-guidance-card">
          <div className="std-guidance-header">
            <div className="std-guidance-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div className="std-guidance-titles">
              <h3 className="std-guidance-title">What do you need to do?</h3>
              <p className="std-guidance-subtitle">
                Instant institutional guidance: Search faculty procedures, required forms, submission locations, and approval steps.
              </p>
            </div>
          </div>

          <div className="std-guidance-search-bar">
            <div className="std-search-input-box">
              <svg className="std-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                className="std-search-input"
                placeholder='Try "I need a medical form", "How do I register repeat exam?", "PIV bank voucher"...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="std-find-process-btn"
              onClick={() => {
                setActiveTab('process_guidance');
                if (typeof window !== 'undefined') {
                  window.location.hash = '#student/process_guidance';
                }
              }}
            >
              Find Process
            </button>
          </div>

          <div className="std-suggested-row">
            <span className="std-suggested-label">Suggested:</span>
            {suggestedChips.map((chip) => (
              <button
                key={chip}
                type="button"
                className="std-suggested-chip"
                onClick={() => {
                  setActiveTab('process_guidance');
                  if (typeof window !== 'undefined') {
                    window.location.hash = '#student/process_guidance';
                  }
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        </section>

        {/* =========================================================
            3. MIDDLE ROW: PROGRESSION TREND & QUICK ACTIONS (Image 1 Mockup)
            ========================================================= */}
        <section className="std-middle-grid">
          {/* Left: Academic Progression Trend */}
          <div className="std-trend-card">
            {/* Header: Cap Icon Badge, Title, Legend & Semester Dropdown */}
            <div className="std-trend-header-row">
              <div className="std-trend-header-left">
                <div className="std-trend-header-icon-box">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <div className="std-trend-title-col">
                  <h3 className="std-card-heading">Academic Progress Trend</h3>
                  <span className="std-trend-subheading">Track semester GPA performance against faculty honours criteria</span>
                </div>
              </div>

              {/* Right Controls: Legend & Semester Dropdown */}
              <div className="std-trend-header-right">
                <div className="std-sem-select-wrapper">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0f2b5c" strokeWidth="2.2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <select
                    className="std-sem-dropdown-select"
                    value={selectedSemesterIdx}
                    onChange={(e) => setSelectedSemesterIdx(Number(e.target.value))}
                  >
                    {progressionData.map((p, idx) => (
                      <option key={idx} value={idx}>{p.fullLabel}</option>
                    ))}
                  </select>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Top 3 Highlight Stat Boxes (SGPA, Credits, Standing) */}
            <div className="std-trend-top-metrics">
              {/* 1. SGPA */}
              <div className="std-trend-top-box box-sgpa">
                <div className="std-trend-box-icon icon-sgpa">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                </div>
                <div className="std-trend-box-content">
                  <span className="std-trend-box-lbl">SEMESTER GPA ({progressionData[selectedSemesterIdx].semester})</span>
                  <div className="std-trend-box-val-row">
                    <span className="std-trend-box-val">{progressionData[selectedSemesterIdx].sgpa.toFixed(2)}</span>
                    <span className={`std-trend-box-delta ${progressionData[selectedSemesterIdx].delta.startsWith('+') ? 'positive' : progressionData[selectedSemesterIdx].delta.startsWith('-') ? 'negative' : 'neutral'}`}>
                      {progressionData[selectedSemesterIdx].delta}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Credits */}
              <div className="std-trend-top-box box-credits">
                <div className="std-trend-box-icon icon-credits">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div className="std-trend-box-content">
                  <span className="std-trend-box-lbl">REGISTERED CREDITS</span>
                  <div className="std-trend-box-val-row">
                    <span className="std-trend-box-val">{progressionData[selectedSemesterIdx].credits}</span>
                    <span className="std-trend-box-denom">/ {progressionData[selectedSemesterIdx].credits} Cleared</span>
                  </div>
                </div>
              </div>

              {/* 3. Standing */}
              <div className="std-trend-top-box box-standing">
                <div className="std-trend-box-icon icon-standing">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="6" />
                    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                  </svg>
                </div>
                <div className="std-trend-box-content">
                  <span className="std-trend-box-lbl">FACULTY STANDING</span>
                  <div className={`std-trend-box-standing-badge ${progressionData[selectedSemesterIdx].isFirstClass ? 'first-class' : 'second-upper'}`}>
                    <span>{progressionData[selectedSemesterIdx].standing}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SVG Chart with Area Gradient Fill */}
            <div className="std-chart-wrapper">
              <svg viewBox="0 0 580 215" className="std-trend-svg" preserveAspectRatio="xMidYMid meet">
                <defs>
                  {/* Glassy Area Fill Gradient */}
                  <linearGradient id="academicAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f2b5c" stopOpacity="0.28" />
                    <stop offset="45%" stopColor="#1d4ed8" stopOpacity="0.10" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Line Gradient */}
                  <linearGradient id="academicLineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#071732" />
                    <stop offset="35%" stopColor="#0f2b5c" />
                    <stop offset="80%" stopColor="#1e40af" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>

                  {/* Drop Shadow for Tooltip */}
                  <filter id="chartTooltipShadow" x="-25%" y="-25%" width="150%" height="150%">
                    <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#071732" floodOpacity="0.25" />
                  </filter>
                </defs>

                {/* Base Horizontal Gridlines */}
                <line x1="45" y1="35" x2="540" y2="35" className="std-grid-line" />
                <line x1="45" y1="125" x2="540" y2="125" className="std-grid-line" />
                <line x1="45" y1="165" x2="540" y2="165" className="std-grid-baseline" />

                {/* Honours Criteria Benchmark Line: First Class (3.70) */}
                <line x1="45" y1="62" x2="540" y2="62" className="std-benchmark-line first-class-line" />

                {/* Honours Criteria Benchmark Line: Second Upper (3.30) */}
                <line x1="45" y1="98" x2="540" y2="98" className="std-benchmark-line upper-class-line" />

                {/* Y-Axis Labels */}
                <text x="36" y="39" className="std-axis-text">4.00</text>
                <text x="36" y="66" className="std-axis-text text-first-gold">3.70</text>
                <text x="36" y="102" className="std-axis-text text-upper-blue">3.30</text>
                <text x="36" y="129" className="std-axis-text">3.00</text>
                <text x="36" y="169" className="std-axis-text">2.50</text>

                {/* Gradient Area Fill Under Curve */}
                <path
                  d="M 80,51.2 C 115,53.2 150,64.5 185,66.5 C 220,66.8 255,67.1 290,67.4 C 325,71.4 360,76.0 395,80.0 C 430,80.0 465,80.0 500,80.0 L 500,165 L 80,165 Z"
                  fill="url(#academicAreaGrad)"
                />

                {/* Vertical Drop Guideline on Selected Point */}
                {progressionData.map((p, idx) => {
                  if (selectedSemesterIdx !== idx) return null;
                  return (
                    <line
                      key={`v-${idx}`}
                      x1={p.x}
                      y1={p.y}
                      x2={p.x}
                      y2="165"
                      className="std-active-drop-line"
                    />
                  );
                })}

                {/* Smooth Multi-Stop Academic Trend Line Curve */}
                <path
                  d="M 80,51.2 C 115,53.2 150,64.5 185,66.5 C 220,66.8 255,67.1 290,67.4 C 325,71.4 360,76.0 395,80.0 C 430,80.0 465,80.0 500,80.0"
                  fill="none"
                  stroke="url(#academicLineGrad)"
                  strokeWidth="3.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points & Interactive Floating Badges */}
                {progressionData.map((p, idx) => {
                  const isSelected = selectedSemesterIdx === idx;

                  return (
                    <g
                      key={`point-${idx}`}
                      onClick={() => setSelectedSemesterIdx(idx)}
                      className={`std-chart-point-group ${isSelected ? 'active-point' : ''}`}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Active State Tooltip Badge */}
                      {isSelected ? (
                        <g filter="url(#chartTooltipShadow)">
                          <rect
                            x={p.x - 34}
                            y={p.y - 32}
                            width="68"
                            height="22"
                            rx="6"
                            fill="#071732"
                          />
                          <polygon
                            points={`${p.x - 4},${p.y - 10} ${p.x + 4},${p.y - 10} ${p.x},${p.y - 6}`}
                            fill="#071732"
                          />
                          <text
                            x={p.x}
                            y={p.y - 17}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="10.5"
                            fontWeight="800"
                            letterSpacing="-0.01em"
                          >
                            {p.sgpa.toFixed(2)} SGPA
                          </text>
                        </g>
                      ) : (
                        <text
                          x={p.x}
                          y={p.y - 10}
                          textAnchor="middle"
                          fill="#475569"
                          fontSize="10.5"
                          fontWeight="700"
                          className="std-point-idle-lbl"
                        >
                          {p.sgpa.toFixed(2)}
                        </text>
                      )}

                      {/* Halo & Rings on Selected Point */}
                      {isSelected && (
                        <>
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={15}
                            fill="#0f2b5c"
                            opacity="0.14"
                          />
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={8.5}
                            fill="none"
                            stroke="#0f2b5c"
                            strokeWidth="2.5"
                          />
                        </>
                      )}

                      {/* Inner Dot */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isSelected ? 5 : 4.5}
                        fill="#ffffff"
                        stroke={isSelected ? '#071732' : '#0f2b5c'}
                        strokeWidth={isSelected ? 3.5 : 2.6}
                        className="std-point-dot"
                      />

                      {/* X-Axis Semester Label */}
                      <text
                        x={p.x}
                        y="185"
                        textAnchor="middle"
                        className={`std-axis-text-x ${isSelected ? 'axis-x-active' : ''}`}
                      >
                        {p.semester}
                      </text>

                      {/* Credits Under Semester */}
                      <text
                        x={p.x}
                        y="199"
                        textAnchor="middle"
                        className={`std-axis-text-sub ${isSelected ? 'axis-sub-active' : ''}`}
                      >
                        {p.credits} Cr
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Bottom 3 Stat Segments Bar */}
            <div className="std-trend-bottom-row">
              {/* Segment 1: Credits Completed */}
              <div className="std-bottom-stat-box">
                <div className="std-bottom-stat-icon icon-success">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="std-bottom-stat-info">
                  <span className="std-bottom-stat-lbl">Credits Completed</span>
                  <span className="std-bottom-stat-val">78 <span className="std-bottom-stat-denom">/ 130 Minimum</span></span>
                </div>
              </div>

              {/* Segment 2: Credits Remaining */}
              <div className="std-bottom-stat-box">
                <div className="std-bottom-stat-icon icon-info">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="std-bottom-stat-info">
                  <span className="std-bottom-stat-lbl">Credits Remaining</span>
                  <span className="std-bottom-stat-val">52 <span className="std-bottom-stat-denom">Cr to Graduate</span></span>
                </div>
              </div>

              {/* Segment 3: Degree Progress Bar */}
              <div className="std-bottom-stat-box box-progress-col">
                <div className="std-bottom-progress-head">
                  <span className="std-bottom-stat-lbl">Degree Completion</span>
                  <span className="std-bottom-prog-badge">60%</span>
                </div>
                <div className="std-bottom-prog-track">
                  <div className="std-bottom-prog-fill" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Quick Actions Card */}
          <div className="std-quick-actions-card">
            {/* Professional University Navy Header Banner with Watermark */}
            <div className="std-qa-header-banner">
              <div className="std-qa-header-content">
                <div className="std-qa-header-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="std-qa-title">Quick Actions</h3>
                  <p className="std-qa-subtitle">Access your academic services instantly</p>
                </div>
              </div>
              {/* Decorative Watermark Graduation Cap */}
              <div className="std-qa-watermark">
                <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
            </div>

            {/* 8 Action Items */}
            <div className="std-qa-actions-list">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="std-qa-item-btn"
                  onClick={() => {
                    if (action.actionId) setActiveTab(action.actionId);
                  }}
                >
                  <div className="std-qa-item-left">
                    <span className="std-qa-icon-circle">
                      {action.icon}
                    </span>
                    <span className="std-qa-item-label">{action.label}</span>
                  </div>
                  <span className="std-qa-item-chevron">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            4. UPCOMING INSTITUTIONAL DEADLINES
            ========================================================= */}
        <section className="std-deadlines-section">
          <div className="std-deadlines-header-row">
            <div>
              <h3 className="std-deadlines-heading">Upcoming Institutional Deadlines</h3>
              <p className="std-deadlines-sub">Active faculty notices, examination entry periods, and compliance cutoff dates</p>
            </div>

          </div>

          <div className="std-deadlines-grid">
            {deadlines.map((item) => (
              <div key={item.id} className={`std-deadline-card card-cat-${item.categoryType}`}>
                <div className="std-deadline-header">
                  <span className={`std-deadline-pill pill-${item.categoryType}`}>{item.category}</span>
                  <span className={`std-status-label status-${item.statusType}`}>
                    <span className="std-status-bullet"></span>
                    {item.status}
                  </span>
                </div>

                <h4 className="std-deadline-title">{item.title}</h4>
                <p className="std-deadline-desc">{item.description}</p>

                <div className="std-deadline-time">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <div className="std-deadline-time-content">
                    <span className="deadline-date-text">{item.deadline}</span>
                    <span className="deadline-countdown-badge">{item.countdown}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="std-view-details-btn"
                  onClick={() => {
                    if (item.actionId) {
                      setActiveTab(item.actionId);
                      if (typeof window !== 'undefined') {
                        window.location.hash = `#student/${item.actionId}`;
                      }
                    }
                  }}
                >
                  <span>{item.actionText}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    )}
    </DashboardTemplate>
  );
}

