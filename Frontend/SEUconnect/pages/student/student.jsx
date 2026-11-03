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
  const [selectedSemesterIdx, setSelectedSemesterIdx] = useState(4); // Default to Semester 5 (current)

  const progressionData = [
    { semester: 'Sem 1', fullLabel: 'Semester 1', sgpa: 3.82, credits: 16, standing: 'First Class Standing', x: 85, y: 55.9, isFirstClass: true },
    { semester: 'Sem 2', fullLabel: 'Semester 2', sgpa: 3.65, credits: 18, standing: 'Second Class (Upper)', x: 185, y: 69.1, isFirstClass: false },
    { semester: 'Sem 3', fullLabel: 'Semester 3', sgpa: 3.64, credits: 16, standing: 'Second Class (Upper)', x: 285, y: 69.8, isFirstClass: false },
    { semester: 'Sem 4', fullLabel: 'Semester 4', sgpa: 3.50, credits: 14, standing: 'Second Class (Upper)', x: 385, y: 80.7, isFirstClass: false },
    { semester: 'Sem 5', fullLabel: 'Semester 5 (Current)', sgpa: 3.50, credits: 14, standing: 'Second Class (Upper)', x: 485, y: 80.7, isCurrent: true, isFirstClass: false },
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
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      )
    },
    {
      label: 'Check Attendance',
      actionId: 'attendance',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          <path d="m9 14 2 2 4-4"/>
        </svg>
      )
    },
    {
      label: 'Exam Registration',
      actionId: 'examinations',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="6"/>
          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
        </svg>
      )
    },
    {
      label: 'View Results',
      actionId: 'results',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      )
    },
    {
      label: 'Submit Medical Request',
      actionId: 'medical_requests',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      )
    },
    {
      label: 'Calculate GPA Report',
      actionId: 'gpa_cgpa',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      )
    },
    {
      label: 'Degree Progress',
      actionId: 'academic_progress',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      )
    },
    {
      label: 'Find a Faculty Form',
      actionId: 'forms_all',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            3. MIDDLE ROW: PROGRESSION TREND & QUICK ACTIONS
            ========================================================= */}
        <section className="std-middle-grid">
          {/* Left: Academic Progression Trend */}
          <div className="std-trend-card">
            <div className="std-trend-header-row">
              <div className="std-trend-title-col">
                <div className="std-trend-title-line">
                  <h3 className="std-card-heading">Academic Progression Trend (SGPA)</h3>
                  <span className="std-trend-cgpa-pill">CGPA: 3.58 • 2nd Class Upper</span>
                </div>
                <span className="std-trend-subheading">Track semester GPA performance against faculty honours criteria</span>
              </div>
              
            </div>

            {/* Compact Active Semester Strip */}
            <div className="std-active-sem-strip">
              <span className="sem-chip active-chip">{progressionData[selectedSemesterIdx].fullLabel}</span>
              <span className="sem-chip-metric">SGPA: <strong>{progressionData[selectedSemesterIdx].sgpa.toFixed(2)}</strong></span>
              <span className="sem-chip-metric">Credits: <strong>{progressionData[selectedSemesterIdx].credits}</strong></span>
              <span className={`sem-chip-standing ${progressionData[selectedSemesterIdx].isFirstClass ? 'chip-first' : 'chip-upper'}`}>
                {progressionData[selectedSemesterIdx].standing}
              </span>
            </div>

            {/* SVG Chart - Clean Minimalist Styling */}
            <div className="std-chart-wrapper">
              <svg viewBox="0 0 560 190" className="std-trend-svg" preserveAspectRatio="xMidYMid meet">
                {/* Horizontal Reference Grid Lines */}
                <line x1="45" y1="30" x2="525" y2="30" className="std-grid-line" />
                <line x1="45" y1="52" x2="525" y2="52" className="std-grid-line" />
                <line x1="45" y1="82" x2="525" y2="82" className="std-grid-line" />
                <line x1="45" y1="106" x2="525" y2="106" className="std-grid-line" />
                <line x1="45" y1="140" x2="525" y2="140" className="std-grid-line" />

                {/* Y-Axis Labels */}
                <text x="36" y="34" className="std-axis-text">4.0</text>
                <text x="36" y="56" className="std-axis-text ">3.7</text>
                <text x="36" y="86" className="std-axis-text ">3.3</text>
                <text x="36" y="110" className="std-axis-text">3.0</text>
                <text x="36" y="144" className="std-axis-text">2.5</text>

                {/* Vertical Drop Guidelines under points */}
                {progressionData.map((p, idx) => (
                  <line
                    key={`v-${idx}`}
                    x1={p.x}
                    y1={p.y}
                    x2={p.x}
                    y2="140"
                    className={`std-grid-line-vert ${selectedSemesterIdx === idx ? 'vert-active' : ''}`}
                  />
                ))}

                {/* Clean Blue Trend Line Curve */}
                <path
                  d="M 85,44 C 135,46 145,57 185,57 C 235,57 245,58 285,58 C 335,58 345,69 385,69 L 485,69"
                  className="std-trend-path"
                />

                {/* Data Points & Clean Floating Pill Badges */}
                {progressionData.map((p, idx) => {
                  const isSelected = selectedSemesterIdx === idx;
                  // Adjusted Y coordinate for more balanced curve
                  const py = idx === 0 ? 44 : idx === 1 ? 57 : idx === 2 ? 58 : 69;
                  return (
                    <g
                      key={`point-${idx}`}
                      className="std-chart-point-group"
                      onClick={() => setSelectedSemesterIdx(idx)}
                      onMouseEnter={() => setSelectedSemesterIdx(idx)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Refined Pill Badge above point */}
                      <rect
                        x={p.x - 17}
                        y={py - 23}
                        width="34"
                        height="17"
                        rx="4"
                        fill={isSelected ? '#1d4ed8' : (p.isCurrent ? '#0284c7' : '#f1f5f9')}
                        stroke={isSelected ? '#1e40af' : (p.isCurrent ? '#0369a1' : '#cbd5e1')}
                        strokeWidth="1"
                        className="std-badge-pill-rect"
                      />
                      <text
                        x={p.x}
                        y={py - 11}
                        textAnchor="middle"
                        fill={isSelected || p.isCurrent ? '#ffffff' : '#1e293b'}
                        fontSize="10"
                        fontWeight="700"
                        className="std-badge-pill-text"
                      >
                        {p.sgpa.toFixed(2)}
                      </text>

                      {/* Halo ring for selected or current */}
                      {isSelected && (
                        <circle
                          cx={p.x}
                          cy={py}
                          r={9}
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="2"
                          opacity="0.3"
                        />
                      )}

                      {/* Outer Ring Point Dot */}
                      <circle
                        cx={p.x}
                        cy={py}
                        r={isSelected ? 5.5 : 4.5}
                        fill="#ffffff"
                        stroke={isSelected ? '#1d4ed8' : (p.isCurrent ? '#0284c7' : '#2563eb')}
                        strokeWidth={isSelected ? 3 : 2.5}
                        className={`std-trend-dot ${isSelected ? 'dot-active' : ''}`}
                      />

                      {/* X-Axis Semester Label */}
                      <text
                        x={p.x}
                        y="158"
                        className={`std-axis-text-x ${isSelected ? 'axis-x-active' : ''}`}
                      >
                        {p.semester}
                      </text>

                      {/* Credits Under Semester */}
                      <text
                        x={p.x}
                        y="172"
                        className="std-axis-text-sub"
                      >
                        {p.credits} cr
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Bottom 3 Stats */}
            <div className="std-trend-metrics">
              <div className="std-metric-col">
                <span className="std-metric-label">Credits Completed</span>
                <span className="std-metric-value">78 <span className="std-metric-denom">/ 130</span></span>
              </div>
              <div className="std-metric-col">
                <span className="std-metric-label">Credits Remaining</span>
                <span className="std-metric-value">52</span>
              </div>
              <div className="std-metric-col">
                <span className="std-metric-label">Degree Progress</span>
                <div className="std-progress-val-row">
                  <span className="std-metric-value text-green">60%</span>
                  <div className="std-mini-progress-bar">
                    <div className="std-mini-progress-fill" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="std-quick-actions-card">
            <h3 className="std-card-heading">Quick Actions</h3>
            <div className="std-actions-list">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="std-action-btn"
                  onClick={() => {
                    if (action.actionId) setActiveTab(action.actionId);
                  }}
                >
                  <span className="std-action-icon">{action.icon}</span>
                  <span className="std-action-label">{action.label}</span>
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
            <div className="std-deadlines-counter-pill">
              <span className="std-pulse-dot"></span>
              4 Active Deadlines
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

